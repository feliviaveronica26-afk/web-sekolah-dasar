<?php

namespace App\Http\Controllers;

use App\Models\Kunjungan;
use App\Support\Referensi;
use App\Support\Waktu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/*
  Kunjungan sekolah: tamu memesan jadwal dari halaman Fasilitas, cek status dengan kode booking,
  dan Tata Usaha mengonfirmasi/menolak. Kuota per sesi diperiksa server agar tidak terlampaui.
*/
class KunjunganController extends Controller
{
    private const HURUF_KODE = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

    public function pesan(Request $request): JsonResponse
    {
        $k = Referensi::get('kunjungan');
        $besok = Waktu::sekarang()->addDay()->toDateString();
        $isian = $request->validate([
            'nama' => ['required', 'string', 'max:120'],
            'whatsapp' => ['required', 'string', 'max:20', 'regex:/^[0-9+\- ]+$/'],
            'tanggal' => ['required', 'date_format:Y-m-d', "after_or_equal:{$besok}"],
            'sesi' => ['required', Rule::in($k['sesi'])],
            'jumlah' => ['required', 'integer', 'min:1', "max:{$k['maksOrang']}"],
            'keperluan' => ['required', Rule::in($k['keperluan'])],
            'fasilitas' => ['nullable', 'array'],
            'fasilitas.*' => ['distinct', Rule::in(Referensi::get('fasilitas'))],
            'catatan' => ['nullable', 'string', 'max:500'],
        ], [
            'required' => 'Lengkapi semua kolom bertanda *.',
            'tanggal.after_or_equal' => 'Kunjungan paling cepat untuk besok.',
            'sesi.in' => 'Pilih sesi kunjungan.',
            'jumlah.max' => "Jumlah rombongan paling banyak {$k['maksOrang']} orang.",
            'whatsapp.regex' => 'Nomor WhatsApp belum valid.',
        ]);
        if (! Waktu::hariSekolah($isian['tanggal'])) {
            throw ValidationException::withMessages(['tanggal' => 'Kunjungan hanya tersedia pada hari sekolah (Senin – Jumat, bukan hari libur).']);
        }

        $kunjungan = DB::transaction(function () use ($isian, $k) {
            $terisi = Kunjungan::where('tanggal', $isian['tanggal'])->where('sesi', $isian['sesi'])->where('status', '!=', 'Ditolak')->lockForUpdate()->count();
            if ($terisi >= $k['kuotaPerSesi']) {
                throw ValidationException::withMessages(['sesi' => 'Sesi ini sudah penuh. Silakan pilih sesi atau tanggal lain.']);
            }
            do {
                $kode = 'KJG-'.implode('', array_map(fn () => self::HURUF_KODE[random_int(0, strlen(self::HURUF_KODE) - 1)], range(1, 6)));
            } while (Kunjungan::where('kode', $kode)->exists());

            return Kunjungan::create([
                'kode' => $kode,
                'nama' => trim($isian['nama']),
                'whatsapp' => trim($isian['whatsapp']),
                'tanggal' => $isian['tanggal'],
                'sesi' => $isian['sesi'],
                'jumlah' => $isian['jumlah'],
                'keperluan' => $isian['keperluan'],
                'fasilitas' => $isian['fasilitas'] ?? [],
                'catatan' => trim($isian['catatan'] ?? ''),
                'status' => 'Menunggu',
                'dibuat' => now(),
            ]);
        });

        return $this->tambalan(
            ['kunjungan' => [['id' => $kunjungan->id, 'tanggal' => $kunjungan->tanggal, 'sesi' => $kunjungan->sesi, 'status' => $kunjungan->status]]],
            lain: ['kunjungan' => $kunjungan->fresh()->toArray()],
            status: 201,
        );
    }

    // Cek status dengan kode booking (nomor WhatsApp tidak ikut dikirim)
    public function cek(Request $request): JsonResponse
    {
        $kode = strtoupper(trim((string) $request->validate(['kode' => ['required', 'string', 'max:12']])['kode']));
        $kunjungan = Kunjungan::where('kode', $kode)->first();

        return response()->json(['kunjungan' => $kunjungan?->makeHidden('whatsapp')->toArray()]);
    }

    public function proses(Request $request, Kunjungan $kunjungan): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->punya('kunjungan'), 'Kunjungan dikelola Tata Usaha.');
        $isian = $request->validate([
            'status' => ['required', Rule::in(Referensi::get('kunjungan.status'))],
            'catatanTu' => ['nullable', 'string', 'max:500'],
        ], ['status.in' => 'Status kunjungan tidak dikenal.']);
        $kunjungan->update(['status' => $isian['status'], 'catatan_tu' => trim($isian['catatanTu'] ?? '')]);

        return $this->tambalan(['kunjungan' => [$kunjungan->fresh()->toArray()]]);
    }
}
