<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/*
  Akun website: akun demo (data/akun-demo.json, sama dengan AKUN_DEMO di sd-app) dan akun Kepala
  Sekolah. Password kepsek tidak pernah ditulis di sini: akunnya memakai HASH_KEPSEK dari .env
  (hash yang sama dengan website lama) dan diganti bcrypt otomatis saat login pertama. Tanpa
  HASH_KEPSEK (mis. salinan baru dari GitHub) akunnya tetap dibuat tetapi belum bisa dipakai sampai
  passwordnya diatur: php artisan akun:password "raymond fernando".
  Akun yang sudah ada tidak ditimpa, jadi password yang sudah diganti tetap aman.
*/
class AkunSeeder extends Seeder
{
    public function run(): void
    {
        $daftar = json_decode(file_get_contents(__DIR__.'/data/akun-demo.json'), true, flags: JSON_THROW_ON_ERROR);

        foreach ($daftar as $akun) {
            if (User::where('username', $akun['username'])->exists()) {
                continue;
            }
            User::create([
                'username' => $akun['username'],
                'name' => $akun['nama'],
                'password' => $akun['password'],
                'role' => $akun['role'],
                'guru_id' => $akun['guruId'] ?? null,
                'nis' => $akun['nis'] ?? null,
                'kelas' => $akun['kelas'] ?? null,
                'anak_nis' => $akun['anakNis'] ?? null,
            ]);
        }

        $hashKepsek = (string) config('sekolah.hash_kepsek');
        if (! User::where('username', 'raymond fernando')->exists()) {
            $kepsek = new User([
                'username' => 'raymond fernando',
                'name' => 'Raymond Fernando',
                // Password acak yang tidak diketahui siapa pun; yang berlaku adalah hash_lama atau akun:password
                'password' => Str::password(40),
                'role' => 'kepsek',
            ]);
            if (str_starts_with($hashKepsek, 'pbkdf2-sha256:')) {
                $kepsek->hash_lama = $hashKepsek;
            }
            $kepsek->save();
        }
    }
}
