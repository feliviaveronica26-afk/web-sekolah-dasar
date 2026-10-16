<?php

namespace App\Models;

// Bulan SPP yang sudah lunas.
class SppPembayaran extends ModelSekolah
{
    protected $table = 'spp_pembayaran';

    protected function casts(): array
    {
        return [
            'jumlah' => 'integer',
            'bukti' => 'array',
        ];
    }
}
