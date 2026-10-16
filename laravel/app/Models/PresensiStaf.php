<?php

namespace App\Models;

// Presensi guru & staf per tanggal.
class PresensiStaf extends ModelSekolah
{
    protected $table = 'presensi_staf';

    protected function casts(): array
    {
        return [
            'koreksi' => 'array',
        ];
    }
}
