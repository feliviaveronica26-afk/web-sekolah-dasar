<?php

use App\Models\Guru;
use App\Models\OrangTua;
use App\Models\User;
use App\Support\AkunSekolah;
use App\Support\Versi;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Ganti password akun website, mis.: php artisan akun:password "raymond fernando"
// Password diketik tersembunyi (tidak tampil di layar dan tidak tersimpan di riwayat terminal).
Artisan::command('akun:password {username}', function (string $username) {
    $user = User::where('username', Str::of($username)->squish()->lower()->toString())->first();
    if (! $user) {
        $this->error("Akun \"{$username}\" tidak ditemukan.");

        return 1;
    }
    $password = (string) $this->secret('Password baru (minimal 8 karakter)');
    if (strlen($password) < 8) {
        $this->error('Password terlalu pendek.');

        return 1;
    }
    if ($password !== $this->secret('Ulangi password baru')) {
        $this->error('Kedua password tidak sama.');

        return 1;
    }
    $user->forceFill(['password' => $password, 'hash_lama' => null, 'aktif' => true, 'wajib_ganti_password' => false])->save();
    $this->info("Password akun \"{$user->username}\" sudah diganti.");

    return 0;
})->purpose('Ganti password akun website sekolah');

/*
  Buat akun login massal untuk yang belum punya akun:
    php artisan akun:buat staf    semua guru & staf (kecuali Kepala Sekolah, yang memakai akunnya sendiri)
    php artisan akun:buat ortu    satu akun per keluarga di Data Orang Tua (username "ortu" + NIS anak pertama)
  Password awal acak tidak ditampilkan di layar; daftarnya ditulis ke berkas CSV privat
  (storage/app/private/akun-awal/) untuk dibagikan, lalu sebaiknya dihapus. Pemilik akun wajib
  mengganti password saat pertama login.
*/
Artisan::command('akun:buat {kelompok : staf | ortu}', function (string $kelompok) {
    $baris = [];
    if ($kelompok === 'staf') {
        $judul = ['Nama', 'Jabatan', 'Username', 'Password awal'];
        $sudah = User::whereNotNull('guru_id')->pluck('guru_id')->all();
        foreach (Guru::orderBy('urutan')->get() as $guru) {
            if ($guru->jabatan === 'Kepala Sekolah' || in_array($guru->id, $sudah, true)) {
                continue;
            }
            [$user, $password] = AkunSekolah::buatAtauAturUlang(null, [
                'username' => AkunSekolah::usernameDariNama($guru->nama),
                'name' => $guru->nama,
                'role' => 'staf',
                'guru_id' => $guru->id,
            ]);
            $baris[] = [$guru->nama, $guru->jabatan, $user->username, $password];
        }
        $koleksi = 'guru';
    } elseif ($kelompok === 'ortu') {
        $judul = ['Orang tua', 'Anak', 'Kelas', 'Username', 'Password awal'];
        $sudah = User::where('role', 'ortu')->whereNotNull('anak_nis')->pluck('anak_nis')->all();
        foreach (OrangTua::with('anak')->get()->sortBy(fn ($k) => $k->anak->first()?->nis) as $keluarga) {
            $anak = $keluarga->anak;
            if ($anak->isEmpty() || $anak->pluck('nis')->intersect($sudah)->isNotEmpty()) {
                continue;
            }
            [$user, $password] = AkunSekolah::buatAtauAturUlang(null, [
                'username' => AkunSekolah::unik('ortu'.$anak->first()->nis),
                'name' => $anak->first()->ortu ?: $keluarga->namaKontak(),
                'role' => 'ortu',
                'anak_nis' => $anak->first()->nis,
            ]);
            $baris[] = [$user->name, $anak->pluck('nama')->implode(', '), $anak->pluck('kelas')->unique()->implode(', '), $user->username, $password];
        }
        $koleksi = 'orangTua';
    } else {
        $this->error('Kelompok yang dikenal: staf, ortu');

        return 1;
    }
    if (! $baris) {
        $this->info($kelompok === 'staf' ? 'Semua guru & staf sudah punya akun.' : 'Semua keluarga sudah punya akun.');

        return 0;
    }
    $berkas = "akun-awal/akun-{$kelompok}-".now()->format('Ymd-His').'.csv';
    Storage::disk('local')->put($berkas, AkunSekolah::csv($judul, $baris));
    Versi::naikkan($koleksi);
    $this->info(count($baris).' akun dibuat. Daftar username & password awal: '.Storage::disk('local')->path($berkas));

    return 0;
})->purpose('Buat akun login massal dengan password awal acak');
