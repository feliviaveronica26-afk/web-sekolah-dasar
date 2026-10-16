<?php

namespace Database\Seeders;

use App\Models\Guru;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

/*
  Data awal guru & staf, diambil dari GURU_AWAL di sd-app/src/data/dummy.js (data/guru.json).
  Guru yang sudah ada tidak ditimpa, jadi aman dijalankan ulang tanpa menghapus perubahan dari website.
*/
class GuruSeeder extends Seeder
{
    public function run(): void
    {
        $daftar = json_decode(file_get_contents(__DIR__.'/data/guru.json'), true, flags: JSON_THROW_ON_ERROR);

        foreach ($daftar as $i => $data) {
            if (Guru::whereKey($data['id'])->exists()) {
                continue;
            }
            $guru = new Guru(Arr::only($data, ['nama', 'nip', 'jabatan', 'mapel', 'peran', 'kelas']));
            $guru->id = $data['id'];
            $guru->urutan = $i + 1;
            $guru->save();
        }
    }
}
