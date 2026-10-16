<?php

namespace App\Http\Controllers;

use App\Models\SppPembayaran;
use App\Models\TransaksiSpp;
use App\Support\DataSekolah;
use App\Support\Referensi;
use App\Support\Waktu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

/*
  SPP. Tata Usaha mencatat pembayaran tunai; orang tua membayar online lewat QRIS / virtual account.
  Pembayaran online di sini masih SIMULASI: tombol "cek status" langsung menganggap pembayaran diterima.
  Saat payment gateway dipasang, tandai lunas dari webhook gateway, bukan dari permintaan orang tua.
*/
class SppController extends Controller
{
    private const BATAS_MENIT = 30;

    // Tata Usaha mencatat pembayaran tunai untuk beberapa bulan sekaligus
    public function tunai(Request $request): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->punya('spp'), 'Pembayaran tunai dicatat oleh Tata Usaha.');
        $isian = $request->validate([
            'nis' => ['required', Rule::exists('siswa', 'nis')],
            'bulan' => ['required', 'array', 'min:1', 'max:12'],
            'bulan.*' => ['distinct', Rule::in(Referensi::get('spp.bulan'))],
            'bukti' => ['nullable', 'image', 'max:'.intdiv(DataController::batasBerkas(), 1024)],
        ], [
            'bulan.required' => 'Pilih bulan yang dibayar.',
            'bulan.*.in' => 'Bulan SPP tidak dikenal.',
            'nis.exists' => 'Siswa tidak ditemukan.',
            'bukti.image' => 'Bukti pembayaran harus berupa foto (JPG, PNG, atau WebP).',
            'bukti.max' => 'Ukuran foto bukti terlalu besar untuk server.',
            'bukti.uploaded' => 'Foto bukti gagal diunggah. Mungkin ukurannya melebihi batas server.',
        ]);

        $bukti = $request->hasFile('bukti') ? $this->simpanBukti($request->file('bukti')) : null;
        $noTransaksi = self::nomorTransaksi();
        $baris = $this->catatLunas($isian['nis'], $isian['bulan'], 'Tunai', $noTransaksi, $bukti);

        return $this->tambalan(DataSekolah::petaSpp($baris), lain: ['noTransaksi' => $noTransaksi, 'tanggal' => Waktu::hariIni(), 'bukti' => $bukti]);
    }

    // Orang tua membuat transaksi pembayaran online untuk anaknya
    public function buatTransaksi(Request $request): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->role === 'ortu', 'Pembayaran online dilakukan orang tua/wali.');
        $bank = array_column(Referensi::get('bankVa'), null, 'kode');
        $isian = $request->validate([
            'bulan' => ['required', 'array', 'min:1', 'max:12'],
            'bulan.*' => ['distinct', Rule::in(Referensi::get('spp.bulan'))],
            'metode' => ['required', Rule::in(['qris', 'va'])],
            'bank' => ['nullable', 'required_if:metode,va', Rule::in(array_keys($bank))],
        ], ['bulan.required' => 'Pilih bulan yang akan dibayar.', 'bank.required_if' => 'Pilih bank untuk virtual account.']);

        $nis = $a->nis;
        if (TransaksiSpp::where('nis', $nis)->where('status', 'menunggu')->where('kadaluarsa', '>', now())->exists()) {
            throw ValidationException::withMessages(['bulan' => 'Masih ada pembayaran yang menunggu. Selesaikan atau ganti cara bayar dulu.']);
        }
        if ($lunas = SppPembayaran::where('nis', $nis)->whereIn('bulan', $isian['bulan'])->value('bulan')) {
            throw ValidationException::withMessages(['bulan' => "SPP bulan {$lunas} sudah lunas."]);
        }

        $id = 'trx'.Str::lower((string) Str::ulid());
        $sekarang = now();
        $va = $isian['metode'] === 'va' ? $bank[$isian['bank']] : null;
        $bulan = array_values(array_intersect(Referensi::get('spp.bulan'), $isian['bulan']));
        $trx = TransaksiSpp::create([
            'id' => $id,
            'nis' => $nis,
            'bulan' => $bulan,
            'total' => count($bulan) * Referensi::get('spp.nominal'),
            'metode' => $isian['metode'],
            'bank' => $va['kode'] ?? null,
            'metode_label' => $va ? "VA {$va['nama']}" : 'QRIS',
            'kode' => $va ? $va['prefix'].$nis.substr((string) $sekarang->getTimestampMs(), -5) : 'QRIS-'.Str::upper(Str::random(12)),
            'no_transaksi' => self::nomorTransaksi(),
            'status' => 'menunggu',
            'dibuat' => $sekarang,
            'kadaluarsa' => $sekarang->copy()->addMinutes(self::BATAS_MENIT),
        ]);

        return $this->tambalan(['transaksi' => [$trx->fresh()->toArray()]], status: 201);
    }

    public function batalkan(Request $request, TransaksiSpp $transaksi): JsonResponse
    {
        $this->pemilik($request, $transaksi);
        if ($transaksi->status === 'menunggu') {
            $transaksi->update(['status' => 'dibatalkan']);
        }

        return $this->tambalan(['transaksi' => [$transaksi->fresh()->toArray()]]);
    }

    // SIMULASI: anggap pembayaran sudah diterima gateway, lalu tandai bulan-bulannya lunas
    public function selesaikan(Request $request, TransaksiSpp $transaksi): JsonResponse
    {
        $this->pemilik($request, $transaksi);
        if ($transaksi->status !== 'menunggu' || $transaksi->kadaluarsa->isPast()) {
            throw ValidationException::withMessages(['status' => 'Transaksi ini sudah tidak berlaku. Buat pembayaran baru.']);
        }
        $baris = DB::transaction(function () use ($transaksi) {
            $transaksi->update(['status' => 'berhasil', 'dibayar' => now()]);

            return $this->catatLunas($transaksi->nis, $transaksi->bulan, $transaksi->metode_label, $transaksi->no_transaksi);
        });

        return $this->tambalan(['transaksi' => [$transaksi->fresh()->toArray()], ...DataSekolah::petaSpp($baris)]);
    }

    private function pemilik(Request $request, TransaksiSpp $transaksi): void
    {
        $a = $this->akses($request);
        $a->wajib($a->role === 'ortu' && $transaksi->nis === $a->nis, 'Transaksi ini bukan milik Anda.');
    }

    // Tandai bulan-bulan SPP lunas. Bulan yang sudah lunas tidak boleh dibayar dua kali.
    private function catatLunas(string $nis, array $bulan, string $metode, string $noTransaksi, ?array $bukti = null): array
    {
        return DB::transaction(function () use ($nis, $bulan, $metode, $noTransaksi, $bukti) {
            if ($lunas = SppPembayaran::where('nis', $nis)->whereIn('bulan', $bulan)->lockForUpdate()->value('bulan')) {
                throw ValidationException::withMessages(['bulan' => "SPP bulan {$lunas} sudah lunas."]);
            }

            return array_map(fn ($b) => (object) SppPembayaran::create([
                'nis' => $nis,
                'bulan' => $b,
                'tanggal' => Waktu::hariIni(),
                'metode' => $metode,
                'no_transaksi' => $noTransaksi,
                'jumlah' => Referensi::get('spp.nominal'),
                'bukti' => $bukti,
            ])->getAttributes(), $bulan);
        });
    }

    // Simpan foto bukti ke storage privat (storage/app/private/spp) dengan nama acak
    private function simpanBukti(UploadedFile $berkas): array
    {
        $id = 's'.Str::lower((string) Str::ulid());
        $berkas->storeAs('spp', $id, 'local');
        $nama = mb_substr(preg_replace('/[\\\\\/:*?"<>|\x00-\x1f]/u', '_', $berkas->getClientOriginalName()), 0, 120) ?: 'bukti';

        return ['id' => $id, 'nama' => $nama, 'mime' => (string) $berkas->getMimeType(), 'ukuran' => $berkas->getSize()];
    }

    // Tampilkan foto bukti pembayaran; hanya pengelola SPP (Tata Usaha & Kepala Sekolah)
    public function bukti(Request $request, string $id): StreamedResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->punya('spp'), 'Bukti pembayaran hanya bisa dilihat pengelola SPP.');
        abort_unless(preg_match('/^s[a-z0-9]{10,40}$/', $id), 404);
        $pem = SppPembayaran::where('bukti->id', $id)->first();
        abort_unless($pem, 404, 'Bukti tidak ditemukan.');
        $disk = Storage::disk('local');
        abort_unless($disk->exists("spp/{$id}"), 404, 'Bukti tidak ditemukan.');
        $l = $pem->bukti;

        return $disk->response("spp/{$id}", $l['nama'], [
            'Content-Type' => $l['mime'],
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, max-age=86400',
            'Content-Security-Policy' => "default-src 'none'; sandbox",
        ], 'inline');
    }

    private static function nomorTransaksi(): string
    {
        return 'SPP-'.Waktu::sekarang()->format('Ymd').'-'.random_int(1000, 9999);
    }
}
