<?php

use App\Http\Controllers\AkademikController;
use App\Http\Controllers\AkunController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DataController;
use App\Http\Controllers\GatewaySppController;
use App\Http\Controllers\GuruController;
use App\Http\Controllers\KehadiranController;
use App\Http\Controllers\KeuanganController;
use App\Http\Controllers\KoleksiController;
use App\Http\Controllers\KunjunganController;
use App\Http\Controllers\OrangTuaController;
use App\Http\Controllers\PerpustakaanController;
use App\Http\Controllers\PpdbController;
use App\Http\Controllers\PresensiOtpController;
use App\Http\Controllers\PresensiStafController;
use App\Http\Controllers\SesiController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\SppController;
use Illuminate\Support\Facades\Route;

/*
  API untuk website sd-app, dimuat di bootstrap/app.php dengan awalan /api dan middleware "web":
  sesi login lewat cookie + perlindungan CSRF (website mengirim header X-XSRF-TOKEN).
  Website memanggilnya lewat proxy di sd-app/vite.config.js, jadi Laravel cukup mendengar di 127.0.0.1.
  Batas permintaan (throttle:masuk/baca/ubah/publik) diatur di AppServiceProvider. Hak akses per
  jabatan diperiksa di controller lewat App\Support\Akses.
*/

// Notifikasi payment gateway SPP (server ke server): tanpa sesi & CSRF (bootstrap/app.php), dijamin tanda tangan HMAC
Route::post('/gateway/spp', [GatewaySppController::class, 'notifikasi'])->middleware('throttle:publik');

Route::middleware('batas.sesi')->group(function () {
    // Login
    Route::get('/saya', [SesiController::class, 'saya'])->middleware('throttle:baca');
    Route::post('/masuk', [SesiController::class, 'masuk'])->middleware('throttle:masuk');
    Route::post('/keluar', [SesiController::class, 'keluar']);

    // Data sekolah sesuai hak pengguna (tamu pun bisa: pengumuman, guru, katalog buku, kuota PPDB)
    Route::middleware('throttle:baca')->group(function () {
        Route::get('/data', [DataController::class, 'index']);
        Route::get('/versi', [DataController::class, 'versi']);
        Route::get('/guru', [GuruController::class, 'index']);
    });

    // Formulir publik: pendaftaran PPDB, pesan kunjungan, dan cek statusnya
    Route::middleware('throttle:publik')->group(function () {
        Route::post('/pendaftar', [PpdbController::class, 'daftar']);
        Route::post('/pendaftar/cek', [PpdbController::class, 'cek']);
        Route::post('/kunjungan', [KunjunganController::class, 'pesan']);
        Route::post('/kunjungan/cek', [KunjunganController::class, 'cek']);
        // Simulator bank/e-wallet untuk demo pembayaran SPP (404 bila mode simulasi mati / produksi)
        Route::get('/simulasi-gateway/{kode}', [GatewaySppController::class, 'lihat']);
        Route::post('/simulasi-gateway/bayar', [GatewaySppController::class, 'bayar']);
    });

    Route::middleware('auth')->group(function () {
        // Chat
        Route::middleware('throttle:baca')->group(function () {
            Route::get('/chat', [ChatController::class, 'index']);
            Route::get('/chat/berkas/{id}', [ChatController::class, 'berkas']);
            // Foto bukti pembayaran SPP (hanya pengelola SPP) & kuitansi PDF (pemilik + pengelola SPP); dicek di controller
            Route::get('/spp/bukti/{id}', [SppController::class, 'bukti']);
            Route::get('/spp/kuitansi/{nis}/{noTransaksi}', [SppController::class, 'kuitansi'])->where(['nis' => '[0-9]{4,20}', 'noTransaksi' => '[A-Za-z0-9-]{3,40}']);
        });
        // Ganti password sendiri; satu-satunya perubahan yang boleh selama password awal belum diganti
        Route::put('/akun/password', [AkunController::class, 'gantiPassword'])->middleware('throttle:ubah');

        Route::middleware(['throttle:ubah', 'password.diganti'])->group(function () {
            Route::post('/chat/pesan', [ChatController::class, 'kirim']);
            Route::delete('/chat/pesan/{pesan}', [ChatController::class, 'hapus']);
            Route::post('/chat/dibaca', [ChatController::class, 'dibaca']);
            Route::put('/chat/grup', [ChatController::class, 'aturGrup']);
        });

        // Keuangan sekolah: membaca pun khusus Kepala Sekolah
        Route::get('/keuangan', [KeuanganController::class, 'index'])->middleware(['peran:kepsek', 'throttle:baca']);

        Route::middleware(['throttle:ubah', 'password.diganti'])->group(function () {
            // Guru & staf (termasuk akun login-nya), keuangan sekolah (Kepala Sekolah)
            Route::middleware('peran:kepsek')->group(function () {
                Route::post('/guru', [GuruController::class, 'store']);
                Route::put('/guru/{guru}', [GuruController::class, 'update']);
                Route::delete('/guru/{guru}', [GuruController::class, 'destroy']);
                Route::post('/guru/{guru}/akun', [GuruController::class, 'akun']);
                Route::post('/keuangan', [KeuanganController::class, 'store']);
                Route::put('/keuangan/{transaksi}', [KeuanganController::class, 'update']);
                Route::delete('/keuangan/{transaksi}', [KeuanganController::class, 'destroy']);
            });

            // Data siswa + akun login siswa (akun: Tata Usaha & Kepala Sekolah)
            Route::post('/siswa', [SiswaController::class, 'store']);
            Route::put('/siswa/{siswa}', [SiswaController::class, 'update']);
            Route::delete('/siswa/{siswa}', [SiswaController::class, 'destroy']);
            Route::post('/siswa/{siswa}/akun', [SiswaController::class, 'akun']);

            // Data orang tua per keluarga + akun login orang tua (Tata Usaha & Kepala Sekolah; orang tua: kontaknya sendiri)
            Route::post('/orang-tua', [OrangTuaController::class, 'store']);
            Route::put('/orang-tua/{orangTua}', [OrangTuaController::class, 'update']);
            Route::delete('/orang-tua/{orangTua}', [OrangTuaController::class, 'destroy']);
            Route::post('/orang-tua/{orangTua}/akun', [OrangTuaController::class, 'akun']);

            // Pengumuman, inventaris, kerusakan, konseling, katalog buku, buku tamu
            Route::post('/{koleksi}', [KoleksiController::class, 'store'])->whereIn('koleksi', KoleksiController::NAMA);
            Route::put('/{koleksi}/{id}', [KoleksiController::class, 'update'])->whereIn('koleksi', KoleksiController::NAMA);
            Route::delete('/{koleksi}/{id}', [KoleksiController::class, 'destroy'])->whereIn('koleksi', KoleksiController::NAMA);

            // Presensi siswa
            Route::put('/absensi/{tanggal}', [KehadiranController::class, 'harian']);
            Route::put('/absensi/{tanggal}/{kunci}', [KehadiranController::class, 'pelajaran']);
            Route::post('/izin', [KehadiranController::class, 'ajukanIzin']);
            Route::put('/izin/{izin}', [KehadiranController::class, 'prosesIzin']);
            Route::post('/presensi-sesi', [PresensiOtpController::class, 'buka']);
            Route::post('/presensi-sesi/{sesi}/tutup', [PresensiOtpController::class, 'tutup']);
            Route::post('/presensi-otp', [PresensiOtpController::class, 'isi']);

            // Presensi guru & staf
            Route::post('/presensi-staf', [PresensiStafController::class, 'absen']);
            Route::put('/presensi-staf/{tanggal}/{guru}', [PresensiStafController::class, 'koreksi']);
            Route::post('/izin-staf', [PresensiStafController::class, 'ajukanIzin']);
            Route::put('/izin-staf/{izin}', [PresensiStafController::class, 'prosesIzin']);
            Route::delete('/izin-staf/{izin}', [PresensiStafController::class, 'batalkanIzin']);

            // Akademik
            Route::post('/tugas', [AkademikController::class, 'simpanTugas']);
            Route::put('/tugas/{tugas}', [AkademikController::class, 'simpanTugas']);
            Route::delete('/tugas/{tugas}', [AkademikController::class, 'hapusTugas']);
            Route::post('/tugas/{tugas}/selesai', [AkademikController::class, 'tandaiTugas']);
            Route::put('/nilai/{siswa:nis}/{mapel}', [AkademikController::class, 'simpanNilai']);
            Route::put('/catatan-wali/{siswa:nis}', [AkademikController::class, 'simpanCatatanWali']);
            Route::post('/sikap', [AkademikController::class, 'beriSikap']);
            Route::delete('/sikap/{sikap}', [AkademikController::class, 'hapusSikap']);
            Route::post('/ekskul/{id}', [AkademikController::class, 'ekskul']);

            // SPP. Tidak ada rute "sudah bayar" untuk orang tua: lunas hanya dari notifikasi gateway.
            Route::post('/spp/tunai', [SppController::class, 'tunai']);
            Route::post('/transaksi-spp', [SppController::class, 'buatTransaksi']);
            Route::post('/transaksi-spp/{transaksi}/batal', [SppController::class, 'batalkan']);

            // Perpustakaan
            Route::post('/peminjaman', [PerpustakaanController::class, 'pinjam']);
            Route::post('/peminjaman/{peminjaman}/kembali', [PerpustakaanController::class, 'kembalikan']);
            Route::post('/reservasi', [PerpustakaanController::class, 'pesan']);
            Route::delete('/reservasi/{reservasi}', [PerpustakaanController::class, 'batalPesan']);
            Route::post('/reservasi/{reservasi}/proses', [PerpustakaanController::class, 'prosesPesanan']);

            // PPDB & kunjungan (panitia / Tata Usaha)
            Route::put('/pendaftar/{pendaftar}', [PpdbController::class, 'proses']);
            Route::put('/kunjungan/{kunjungan}', [KunjunganController::class, 'proses']);
        });
    });
});
