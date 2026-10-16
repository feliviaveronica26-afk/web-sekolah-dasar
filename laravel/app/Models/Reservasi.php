<?php

namespace App\Models;

// Pesanan buku dari siswa, diproses pustakawan menjadi peminjaman.
class Reservasi extends ModelSekolah
{
    protected $table = 'reservasi';

    protected string $awalanId = 'rv';
}
