<?php

namespace App\Models;

// Pendaftar PPDB.
class Pendaftar extends ModelSekolah
{
    protected $table = 'pendaftar';

    protected string $awalanId = 'pd';

    protected function casts(): array
    {
        return [
            'berkas' => 'array',
            'dibuat' => 'datetime',
        ];
    }
}
