<?php

namespace App\Models;

// Pengajuan izin/sakit siswa dari orang tua, disetujui wali kelas.
class IzinSiswa extends ModelSekolah
{
    protected $table = 'izin_siswa';

    protected string $awalanId = 'iz';

    protected function casts(): array
    {
        return [
            'diajukan' => 'datetime',
            'diproses' => 'datetime',
        ];
    }
}
