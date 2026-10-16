<?php

namespace App\Models;

// Poin sikap (apresiasi & catatan perbaikan) dari guru.
class Sikap extends ModelSekolah
{
    protected $table = 'sikap';

    protected string $awalanId = 'sk';

    protected function casts(): array
    {
        return [
            'poin' => 'integer',
        ];
    }
}
