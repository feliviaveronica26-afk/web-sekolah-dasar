<?php

namespace App\Models;

// Pengumuman & berita sekolah (tampil di beranda dan portal).
class Pengumuman extends ModelSekolah
{
    protected $table = 'pengumuman';

    protected string $awalanId = 'p';
}
