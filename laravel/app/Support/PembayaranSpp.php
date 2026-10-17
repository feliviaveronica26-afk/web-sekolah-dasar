<?php

namespace App\Support;

use App\Models\SppPembayaran;
use App\Models\TransaksiSpp;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/*
  Pencatatan pembayaran SPP dan penerimaan notifikasi payment gateway.

  Pembayaran online (QRIS / virtual account) HANYA dianggap lunas dari notifikasi gateway yang
  tanda tangannya cocok dengan kunci rahasia server (seperti signature_key Midtrans/Xendit), dengan
  nominal yang sama persis dan transaksi yang masih berlaku. Orang tua tidak punya cara untuk
  menandai pembayarannya sendiri sebagai lunas.

  Mode simulasi (config sekolah.simulasi_gateway, tidak pernah aktif di produksi) menyediakan
  halaman pengganti aplikasi bank/e-wallet untuk demo; halaman itu pun melewati jalur yang sama:
  membuat notifikasi bertanda tangan lalu memanggil terimaNotifikasi().
*/
final class PembayaranSpp
{
    public static function simulasiAktif(): bool
    {
        return (bool) config('sekolah.simulasi_gateway') && ! app()->environment('production');
    }

    // Kunci rahasia bersama dengan gateway (server key). Tanpa GATEWAY_KUNCI dipakai turunan APP_KEY.
    private static function kunci(): string
    {
        return (string) (config('sekolah.gateway_kunci') ?: hash_hmac('sha256', 'gateway-spp', (string) config('app.key')));
    }

    // Tanda tangan notifikasi: HMAC-SHA256 dari "kode|status|jumlah"
    public static function tandaTangan(string $kode, string $status, int $jumlah): string
    {
        return hash_hmac('sha256', "{$kode}|{$status}|{$jumlah}", self::kunci());
    }

    /*
      Terima notifikasi gateway { kode, status, jumlah, tandaTangan }. Hasil: [transaksi, baris SPP
      yang baru lunas]. Notifikasi berulang untuk transaksi yang sudah berhasil tidak mencatat ulang.
    */
    public static function terimaNotifikasi(array $n): array
    {
        $kode = (string) ($n['kode'] ?? '');
        $status = (string) ($n['status'] ?? '');
        $jumlah = (int) ($n['jumlah'] ?? 0);
        if (! hash_equals(self::tandaTangan($kode, $status, $jumlah), (string) ($n['tandaTangan'] ?? ''))) {
            abort(403, 'Tanda tangan notifikasi tidak sah.');
        }

        return DB::transaction(function () use ($kode, $status, $jumlah) {
            $trx = TransaksiSpp::where('kode', $kode)->lockForUpdate()->first();
            abort_unless($trx, 404, 'Transaksi tidak ditemukan.');
            if ($trx->status === 'berhasil') {
                return [$trx, []];
            }
            if ($status !== 'berhasil') {
                return [$trx, []];
            }
            if ($jumlah !== $trx->total) {
                throw ValidationException::withMessages(['jumlah' => 'Nominal pembayaran tidak sama dengan tagihan.']);
            }
            if ($trx->status !== 'menunggu' || $trx->kadaluarsa->isPast()) {
                throw ValidationException::withMessages(['kode' => 'Transaksi ini sudah tidak berlaku.']);
            }
            $trx->update(['status' => 'berhasil', 'dibayar' => now()]);
            $baris = self::catatLunas($trx->nis, $trx->bulan, $trx->metode_label, $trx->no_transaksi);
            Versi::naikkan('transaksi', 'spp');

            return [$trx->fresh(), $baris];
        });
    }

    // Tandai bulan-bulan SPP lunas. Bulan yang sudah lunas tidak boleh dibayar dua kali.
    public static function catatLunas(string $nis, array $bulan, string $metode, string $noTransaksi, ?array $bukti = null): array
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

    // Nomor kuitansi, mis. SPP-20261016-4821 (tidak dipakai dua kali)
    public static function nomorTransaksi(): string
    {
        do {
            $nomor = 'SPP-'.Waktu::sekarang()->format('Ymd').'-'.random_int(1000, 9999);
        } while (SppPembayaran::where('no_transaksi', $nomor)->exists() || TransaksiSpp::where('no_transaksi', $nomor)->exists());

        return $nomor;
    }
}
