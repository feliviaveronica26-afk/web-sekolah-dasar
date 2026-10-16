<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        /*
          Batas permintaan API, masing-masing punya hitungan sendiri. (throttle:60,1 biasa memakai satu
          hitungan bersama untuk semua rute, sehingga membuka halaman bisa menghabiskan jatah login.)
          Banyak perangkat di jaringan sekolah bisa tampil dengan alamat yang sama, jadi batas per alamat
          dibuat longgar; perlindungan tebak-password ada di SesiController (5 kali salah per akun).
        */
        $pengguna = fn (Request $r) => $r->user()?->getAuthIdentifier() ?? $r->ip();

        RateLimiter::for('masuk', fn (Request $r) => Limit::perMinute(300)->by('masuk|'.$r->ip()));
        RateLimiter::for('baca', fn (Request $r) => Limit::perMinute(600)->by('baca|'.$pengguna($r)));
        RateLimiter::for('ubah', fn (Request $r) => Limit::perMinute(120)->by('ubah|'.$pengguna($r)));
        // Formulir publik (PPDB, kunjungan, cek status) tanpa login: mencegah spam & tebak-tebakan kode
        RateLimiter::for('publik', fn (Request $r) => Limit::perMinute(20)->by('publik|'.$r->ip()));
    }
}
