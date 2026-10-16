<?php

namespace App\Models;

// Laporan kerusakan sarana prasarana.
class Kerusakan extends ModelSekolah
{
    protected $table = 'kerusakan';

    protected string $awalanId = 'kr';
}
