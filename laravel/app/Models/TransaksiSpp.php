<?php

namespace App\Models;

// Transaksi pembayaran SPP online (QRIS / virtual account) dari orang tua.
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
}
