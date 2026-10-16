<?php

namespace App\Models;

// Permintaan kunjungan sekolah dari tamu.
class Kunjungan extends ModelSekolah
{
    protected $table = 'kunjungan';

    protected string $awalanId = 'kj';

    protected function casts(): array
    {
        return [
            'jumlah' => 'integer',
            'fasilitas' => 'array',
            'dibuat' => 'datetime',
        ];
    }
}
