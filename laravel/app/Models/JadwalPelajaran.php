<?php

namespace App\Models;

// Satu sesi di jadwal pelajaran mingguan sebuah kelas. Dibaca lewat Referensi::jadwal().
class JadwalPelajaran extends ModelSekolah
{
    protected $table = 'jadwal_pelajaran';

    protected function casts(): array
    {
        return ['jam' => 'integer'];
    }
}
