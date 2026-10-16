<?php

namespace App\Models;

// Presensi siswa per pelajaran (kunci = sesi + mapel, mis. 2-bing).
class AbsensiPelajaran extends ModelSekolah
{
    protected $table = 'absensi_pelajaran';
}
