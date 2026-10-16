<?php

namespace App\Models;

// Catatan bimbingan konseling (rahasia: hanya Guru BK & Kepala Sekolah).
class Konseling extends ModelSekolah
{
    protected $table = 'konseling';

    protected string $awalanId = 'ks';
}
