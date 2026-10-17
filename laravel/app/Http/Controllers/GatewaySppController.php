<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\TransaksiSpp;
use App\Support\PembayaranSpp;
use App\Support\Referensi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/*
  Payment gateway SPP online.

  - notifikasi: webhook yang dipanggil server gateway (bukan browser) saat pembayaran QRIS/VA masuk.
    Tanpa sesi & tanpa CSRF; keasliannya dijamin tanda tangan HMAC (PembayaranSpp::tandaTangan).
  - lihat & bayar: SIMULATOR bank/e-wallet untuk demo di laptop (tidak ada gateway sungguhan tanpa
    hosting). Hanya aktif bila config sekolah.simulasi_gateway menyala dan tidak pernah di produksi.
    Simulator pun membuat notifikasi bertanda tangan lalu melewati jalur webhook yang sama.
*/
class GatewaySppController extends Controller
{
    public function notifikasi(Request $request): JsonResponse
    {
        $n = $request->validate([
            'kode' => ['required', 'string', 'max:60'],
            'status' => ['required', 'string', 'max:20'],
            'jumlah' => ['required', 'integer', 'min:0'],
            'tandaTangan' => ['required', 'string', 'size:64'],
        ]);
        [$trx] = PembayaranSpp::terimaNotifikasi($n);

        return response()->json(['diterima' => true, 'status' => $trx->status]);
    }

    // Simulator: rincian tagihan seperti yang tampil di aplikasi bank setelah scan QR / memasukkan nomor VA
    public function lihat(string $kode): JsonResponse
    {
        abort_unless(PembayaranSpp::simulasiAktif(), 404);
        $trx = $this->cari($kode);
        $siswa = Siswa::where('nis', $trx->nis)->first();

        return response()->json([
            'kode' => $trx->kode,
            'merchant' => Referensi::get('sekolah.nama', 'SD Harapan Gemilang'),
            'keterangan' => 'SPP '.$this->daftarBulan($trx->bulan),
            // Nama disamarkan seperti di aplikasi bank: "RAFA A***"
            'atasNama' => $siswa ? $this->samarkan($siswa->nama) : null,
            'metode' => $trx->metode_label,
            'jumlah' => $trx->total,
            'status' => $trx->status === 'menunggu' && $trx->kadaluarsa->isPast() ? 'kedaluwarsa' : $trx->status,
            'kadaluarsa' => $trx->kadaluarsa->toISOString(),
        ]);
    }

    // Simulator: nasabah menyetujui pembayaran dengan PIN, lalu "bank" mengirim notifikasi ke sekolah
    public function bayar(Request $request): JsonResponse
    {
        abort_unless(PembayaranSpp::simulasiAktif(), 404);
        $isian = $request->validate([
            'kode' => ['required', 'string', 'max:60'],
            'pin' => ['required', 'regex:/^[0-9]{6}$/'],
        ], ['pin.required' => 'Masukkan PIN 6 angka.', 'pin.regex' => 'PIN harus 6 angka.']);
        $trx = $this->cari($isian['kode']);
        $tandaTangan = PembayaranSpp::tandaTangan($trx->kode, 'berhasil', $trx->total);
        [$trx] = PembayaranSpp::terimaNotifikasi(['kode' => $trx->kode, 'status' => 'berhasil', 'jumlah' => $trx->total, 'tandaTangan' => $tandaTangan]);

        return response()->json(['status' => $trx->status, 'jumlah' => $trx->total, 'noTransaksi' => $trx->no_transaksi]);
    }

    private function cari(string $kode): TransaksiSpp
    {
        $kode = preg_replace('/\s+/', '', $kode);
        $trx = TransaksiSpp::where('kode', $kode)->latest('dibuat')->first();
        abort_unless($trx, 404, 'Kode QRIS / nomor virtual account tidak ditemukan.');

        return $trx;
    }

    private function daftarBulan(array $bulan): string
    {
        return collect($bulan)->map(fn ($b) => Carbon::createFromFormat('Y-m-d', "{$b}-01")->locale('id')->translatedFormat('F Y'))->implode(', ');
    }

    private function samarkan(string $nama): string
    {
        $kata = explode(' ', mb_strtoupper(trim($nama)));

        return $kata[0].(isset($kata[1]) ? ' '.mb_substr($kata[1], 0, 1).'***' : '');
    }
}
