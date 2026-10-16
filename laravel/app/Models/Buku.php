<?php

namespace App\Models;

// Katalog buku perpustakaan.
class Buku extends ModelSekolah
{
    protected $table = 'buku';

    protected string $awalanId = 'b';

    protected function casts(): array
    {
        return [
            'stok' => 'integer',
        ];
    }
}
