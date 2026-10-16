<?php

namespace App\Models;

// Peminjaman buku perpustakaan.
class Peminjaman extends ModelSekolah
{
    protected $table = 'peminjaman';

    protected string $awalanId = 'pj';
}
