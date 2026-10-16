<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/*
  Penanda versi tiap koleksi data. Setiap perubahan data mengganti penandanya; website menanyakan
  /api/versi secara berkala lalu hanya memuat ulang koleksi yang penandanya berubah. Dengan begitu
  perubahan dari perangkat lain (mis. siswa mengisi kode presensi) cepat terlihat tanpa memuat semua data.
*/
final class Versi
{
    public static function naikkan(string ...$koleksi): array
    {
        $baru = [];
        foreach (array_unique($koleksi) as $k) {
            $baru[$k] = Str::random(10);
            Cache::forever("versi-data:{$k}", $baru[$k]);
        }

        return $baru;
    }

    public static function semua(array $koleksi): array
    {
        $isi = Cache::many(array_map(fn ($k) => "versi-data:{$k}", $koleksi));
        $hasil = [];
        foreach ($koleksi as $k) {
            $hasil[$k] = $isi["versi-data:{$k}"] ?? '0';
        }

        return $hasil;
    }
}
