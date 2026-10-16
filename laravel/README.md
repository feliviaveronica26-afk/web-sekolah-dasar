# SD Harapan Gemilang — Backend Laravel

API, login, dan hak akses untuk website di folder [`../sd-app`](../sd-app). Cara memasang dari nol ada di
[README utama](../README.md).

## Isi

| Bagian                     | Isi                                                                                   |
|----------------------------|---------------------------------------------------------------------------------------|
| `routes/api.php`           | Semua endpoint `/api/...` (login, data, nilai, presensi, SPP, chat, PPDB, akun, ...)    |
| `app/Http/Controllers/`    | Satu controller per bagian sekolah; setiap perubahan divalidasi di sini                |
| `app/Models/`              | Model Eloquent (siswa, guru, orang tua, nilai, absensi, SPP, buku, chat, ...)           |
| `app/Support/Akses.php`    | Aturan hak akses per jabatan (sama dengan `sd-app/src/context/akses.js`)               |
| `app/Support/DataSekolah.php` | `GET /api/data`: data yang dikirim ke setiap pengguna sesuai haknya                 |
| `app/Support/Versi.php`    | Penanda versi per kelompok data, agar website hanya memuat ulang yang berubah           |
| `app/Http/Middleware/`     | Cek jabatan (`peran:`), batas sesi, dan wajib ganti password sebelum mengubah data     |
| `database/migrations/`     | Struktur tabel MySQL                                                                   |
| `database/seeders/`        | Data contoh: guru & biodata staf, akun demo, siswa, orang tua, nilai, absensi, SPP, ... |
| `resources/data/referensi.json` | Data acuan (mapel, jadwal, ekskul, SPP), diekspor dari `sd-app` dengan `npm run ekspor-laravel` |
| `tests/Feature/`           | Tes login, data per pengguna, data staf, dan data orang tua                            |

## Perintah khusus

```bash
php artisan akun:password "<username>"   # ganti password satu akun (diketik tersembunyi)
php artisan akun:buat staf               # buat akun untuk guru & staf yang belum punya
php artisan akun:buat ortu               # buat satu akun per keluarga di Data Orang Tua
```

`akun:buat` tidak menampilkan password di layar. Password awal ditulis ke berkas CSV di
`storage/app/private/akun-awal/` (tidak ikut ke git) dan pemilik akun wajib menggantinya saat
pertama login.

## Pengaturan `.env`

| Variabel        | Kegunaan                                                                  |
|-----------------|---------------------------------------------------------------------------|
| `DB_*`          | Koneksi MySQL (database `sd_harapan_gemilang`)                             |
| `HASH_KEPSEK`   | Opsional. Tanpa ini, atur password Kepala Sekolah dengan `akun:password`.  |
| `ZONA_SEKOLAH`  | Zona waktu sekolah, bawaan `Asia/Jakarta`                                  |
| `CHAT_MAKS_MB`  | Batas ukuran berkas chat, bawaan 25 MB                                     |

## Tes

```bash
php artisan test
```

`phpunit.xml` memaksa tes memakai SQLite di memori, jadi data MySQL tidak tersentuh.
