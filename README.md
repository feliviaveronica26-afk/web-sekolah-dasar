# SD Harapan Gemilang — Website & Portal Sekolah

Website sekolah dasar beserta empat portal: **Siswa**, **Orang Tua**, **Guru & Staf** (wali kelas, guru
mapel, wakasek, tata usaha, pustakawan, sarpras, guru BK, satpam), dan **Kepala Sekolah**. Semua data
tersimpan di MySQL lewat backend Laravel; setiap pengguna hanya menerima data yang boleh ia lihat.

## Struktur

| Folder     | Isi                                                                        |
|------------|----------------------------------------------------------------------------|
| `sd-app/`  | Frontend: React 19, Vite 6, Tailwind CSS 4 — tampilan website & portal      |
| `laravel/` | Backend: Laravel 13 — API, login & sesi, hak akses, migrasi, seeder, tes    |

```
Browser ──► Vite (localhost:5173) ──/api──► Laravel (127.0.0.1:8000) ──► MySQL (sd_harapan_gemilang)
```

## Kebutuhan

PHP 8.3+, Composer, Node.js 20+, dan MySQL 8 / MariaDB.

## Menjalankan pertama kali

**1. Backend** (terminal pertama)

```bash
cd laravel
composer install
cp .env.example .env
php artisan key:generate
```

Buat database kosong `sd_harapan_gemilang`, lalu isi bagian database di `laravel/.env`:

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sd_harapan_gemilang
DB_USERNAME=root
DB_PASSWORD=
```

```bash
php artisan migrate --seed                       # buat tabel + isi data contoh
php artisan akun:password "raymond fernando"     # atur password akun Kepala Sekolah
php artisan serve --host=127.0.0.1 --port=8000
```

**2. Frontend** (terminal kedua)

```bash
cd sd-app
npm install
npm run dev                                      # buka http://localhost:5173
```

Setelah itu cukup jalankan `php artisan serve` dan `npm run dev` setiap kali bekerja.

## Akun demo

Halaman login punya tombol isi cepat untuk setiap portal. Daftar lengkapnya ada di
[sd-app/README.md](sd-app/README.md#akun-demo).

## Tes

```bash
cd laravel
php artisan test       # memakai SQLite di memori, data MySQL tidak tersentuh
```

## Dokumentasi lanjutan

- [PROGRES.md](PROGRES.md) — yang bertambah di setiap langkah dan cara menunjukkannya
- [sd-app/README.md](sd-app/README.md) — fitur per portal, cara data dimuat, akun demo
- [laravel/README.md](laravel/README.md) — isi backend, perintah artisan khusus, tes
