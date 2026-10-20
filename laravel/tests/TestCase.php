<?php

namespace Tests;

use App\Support\Referensi;
use App\Support\Waktu;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Jadwal & hari libur disimpan sementara per proses; tiap tes memakai database baru
        Referensi::lupakanJadwal();
        Waktu::lupakanLibur();
    }
}
