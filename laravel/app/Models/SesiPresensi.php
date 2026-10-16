<?php

namespace App\Models;

// Sesi kode OTP presensi siswa yang dibuka guru. Kode hanya dikirim ke guru.
class SesiPresensi extends ModelSekolah
{
    protected $table = 'sesi_presensi';

    protected string $awalanId = 'ss';

    protected function casts(): array
    {
        return [
            'jam' => 'integer',
            'mulai' => 'datetime',
            'berakhir' => 'datetime',
            'ditutup' => 'boolean',
            'gagal' => 'array',
        ];
    }
}
