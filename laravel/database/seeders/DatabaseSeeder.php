<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database. Setiap seeder hanya mengisi data yang belum ada.
     */
    public function run(): void
    {
        $this->call([GuruSeeder::class, JadwalSeeder::class, KalenderSeeder::class, BiodataStafSeeder::class, AkunSeeder::class, KeuanganSeeder::class, DataContohSeeder::class, OrangTuaSeeder::class, BiodataSiswaSeeder::class]);
    }
}
