<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/*
  Pembuatan akun login oleh sekolah (guru & staf, orang tua). Password awal dibuat acak dan hanya
  ditampilkan sekali kepada yang membuatnya; pemilik akun wajib menggantinya saat pertama login.
*/
final class AkunSekolah
{
    // Tanpa huruf/angka yang mirip (0/o, 1/l/i) agar mudah dibacakan atau diketik dari kertas
    private const HURUF = 'abcdefghjkmnpqrstuvwxyz23456789';

    // Contoh: "k7mp-x3qa-9vtr" (±62 bit)
    public static function passwordAcak(): string
    {
        $kelompok = [];
        for ($k = 0; $k < 3; $k++) {
            $teks = '';
            for ($i = 0; $i < 4; $i++) {
                $teks .= self::HURUF[random_int(0, strlen(self::HURUF) - 1)];
            }
            $kelompok[] = $teks;
        }

        return implode('-', $kelompok);
    }

    // Username dari nama tanpa gelar, mis. "Dra. Siti Rahmawati, M.Pd." → "siti.rahmawati"; diberi angka bila sudah dipakai
    public static function usernameDariNama(string $nama): string
    {
        $tanpaGelar = trim(explode(',', $nama)[0]);
        $kata = array_values(array_filter(
            preg_split('/\s+/', Str::ascii($tanpaGelar)),
            fn ($k) => $k !== '' && ! preg_match('/^(dr|dra|drs|ir|h|hj|prof)\.?$/i', $k),
        ));
        $dasar = Str::of(implode('.', array_slice($kata, 0, 2)))->lower()->replaceMatches('/[^a-z0-9.]/', '')->limit(50, '')->toString();

        return self::unik($dasar !== '' ? $dasar : 'staf');
    }

    public static function unik(string $dasar): string
    {
        $calon = $dasar;
        for ($n = 2; User::where('username', $calon)->exists(); $n++) {
            $calon = $dasar.$n;
        }

        return $calon;
    }

    /*
      Buat akun baru, atau atur ulang password akun yang sudah ada. Hasil: [User, password awal].
      Akun yang diatur ulang ikut diaktifkan kembali dan semua sesi login-nya diakhiri.
    */
    public static function buatAtauAturUlang(?User $user, array $dataBaru): array
    {
        $password = self::passwordAcak();
        if ($user) {
            $user->forceFill(['password' => $password, 'hash_lama' => null, 'aktif' => true, 'wajib_ganti_password' => true])->save();
            self::akhiriSesi($user);
        } else {
            $user = new User($dataBaru + ['password' => $password]);
            $user->wajib_ganti_password = true;
            $user->save();
        }

        return [$user, $password];
    }

    // CSV untuk Excel (BOM UTF-8, pemisah koma). Sel berawalan = + - @ dinetralkan agar tidak dibaca sebagai rumus.
    public static function csv(array $judul, array $baris): string
    {
        $sel = function ($nilai) {
            $teks = (string) $nilai;
            if ($teks !== '' && in_array($teks[0], ['=', '+', '-', '@'], true)) {
                $teks = "'".$teks;
            }

            return '"'.str_replace('"', '""', $teks).'"';
        };

        return "\u{FEFF}".implode("\r\n", array_map(fn ($b) => implode(',', array_map($sel, $b)), [$judul, ...$baris]))."\r\n";
    }

    // Hapus sesi login akun ini di semua perangkat (kecuali sesi yang sedang dipakai, bila diberikan)
    public static function akhiriSesi(User $user, ?string $kecualiSesi = null): void
    {
        if (config('session.driver') !== 'database') {
            return;
        }
        $kueri = DB::table(config('session.table', 'sessions'))->where('user_id', $user->getKey());
        if ($kecualiSesi) {
            $kueri->where('id', '!=', $kecualiSesi);
        }
        $kueri->delete();
    }
}
