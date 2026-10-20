<?php

namespace Database\Seeders;

use App\Models\Kalender;
use App\Support\Waktu;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/*
  Kalender akademik awal 2026/2027 (data/kalender.json, dibuat dari sd-app/scripts/data-contoh.js).
  Hanya mengisi bila tabel masih kosong. ID dibuat di sini karena DatabaseSeeder mematikan event model.
*/
class KalenderSeeder extends Seeder
{
    public function run(): void
    {
        if (Kalender::exists()) {
            return;
        }
        $daftar = json_decode(file_get_contents(__DIR__.'/data/kalender.json'), true, flags: JSON_THROW_ON_ERROR);
        $sekarang = now();
        Kalender::insert(array_map(fn (array $e) => [
            'id' => 'kal'.Str::lower((string) Str::ulid()),
            'mulai' => $e['mulai'],
            'selesai' => $e['selesai'] ?? null,
            'judul' => $e['judul'],
            'jenis' => $e['jenis'],
            'perkiraan' => (bool) ($e['perkiraan'] ?? false),
            'keterangan' => $e['keterangan'] ?? '',
            'created_at' => $sekarang,
            'updated_at' => $sekarang,
        ], $daftar));
        Waktu::lupakanLibur();
    }
}
