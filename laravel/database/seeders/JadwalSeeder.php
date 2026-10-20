<?php

namespace Database\Seeders;

use App\Models\JadwalPelajaran;
use App\Support\Referensi;
use Illuminate\Database\Seeder;

/*
  Jadwal pelajaran awal semua kelas (data/jadwal.json, dibuat dari sd-app/scripts/data-contoh.js).
  Hanya mengisi bila tabel masih kosong; setelah itu jadwal diatur Wakasek Kurikulum dari portal.
*/
class JadwalSeeder extends Seeder
{
    public function run(): void
    {
        if (JadwalPelajaran::exists()) {
            return;
        }
        $jadwal = json_decode(file_get_contents(__DIR__.'/data/jadwal.json'), true, flags: JSON_THROW_ON_ERROR);
        $sekarang = now();
        $baris = [];
        foreach ($jadwal as $kelas => $perHari) {
            foreach ($perHari as $hari => $perJam) {
                foreach ($perJam as $jam => $mapel) {
                    if ($mapel) {
                        $baris[] = ['kelas' => $kelas, 'hari' => $hari, 'jam' => $jam, 'mapel' => $mapel, 'created_at' => $sekarang, 'updated_at' => $sekarang];
                    }
                }
            }
        }
        foreach (array_chunk($baris, 200) as $potong) {
            JadwalPelajaran::insert($potong);
        }
        Referensi::lupakanJadwal();
    }
}
