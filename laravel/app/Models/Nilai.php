<?php

namespace App\Models;

// Nilai rapor satu mapel milik satu siswa: tugas (1–3), PTS, PAS.
class Nilai extends ModelSekolah
{
    protected $table = 'nilai';

    protected function casts(): array
    {
        return [
            'tugas' => 'array',
            'pts' => 'integer',
            'pas' => 'integer',
        ];
    }
}
