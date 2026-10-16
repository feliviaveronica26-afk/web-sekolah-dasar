<?php

namespace App\Models;

// Pengajuan sakit/izin/cuti/dinas luar guru & staf, diproses Kepala Sekolah.
class IzinStaf extends ModelSekolah
{
    protected $table = 'izin_staf';

    protected string $awalanId = 'is';

    protected function casts(): array
    {
        return [
            'diajukan' => 'datetime',
            'diproses' => 'datetime',
        ];
    }
}
