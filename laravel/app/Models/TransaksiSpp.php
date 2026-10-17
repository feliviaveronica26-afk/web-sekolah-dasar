<?php

namespace App\Models;

use App\Support\PembayaranSpp;

// Transaksi pembayaran SPP online (QRIS / virtual account) dari orang tua. Lunas hanya lewat notifikasi gateway.
class TransaksiSpp extends ModelSekolah
{
    protected $table = 'transaksi_spp';

    protected string $awalanId = 'trx';

    protected function casts(): array
    {
        return [
            'bulan' => 'array',
            'total' => 'integer',
            'dibuat' => 'datetime',
            'kadaluarsa' => 'datetime',
            'dibayar' => 'datetime',
        ];
    }

    // Website menampilkan petunjuk simulator bank hanya bila mode simulasi menyala
    public function toArray(): array
    {
        return [...parent::toArray(), 'simulasi' => PembayaranSpp::simulasiAktif()];
    }
}
