<?php

namespace App\Models;

// Buku tamu satpam.
class BukuTamu extends ModelSekolah
{
    protected $table = 'buku_tamu';

    protected string $awalanId = 'bt';

    protected function casts(): array
    {
        return [
            'jumlah' => 'integer',
        ];
    }
}
