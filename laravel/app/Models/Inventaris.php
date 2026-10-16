<?php

namespace App\Models;

// Inventaris barang sekolah.
class Inventaris extends ModelSekolah
{
    protected $table = 'inventaris';

    protected string $awalanId = 'inv';

    protected function casts(): array
    {
        return [
            'jumlah' => 'integer',
        ];
    }
}
