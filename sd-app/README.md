# SD Harapan Gemilang — Frontend

Website sekolah + portal siswa, orang tua, guru & staf, dan kepala sekolah. Dibuat dengan React, Vite 6, dan Tailwind CSS 4.

## Menjalankan

```bash
npm install
npm run dev      # buka http://localhost:5173
npm run build    # build produksi ke folder dist/
```

> Catatan: proyek ini sengaja memakai Vite 6. Vite 8 memakai binary `rolldown` yang diblokir Windows Smart App Control.

## Akun demo

| Portal         | Jabatan           | Username  | Password     |
|----------------|-------------------|-----------|--------------|
| Siswa          | –                 | siswa     | siswa123     |
| Orang tua      | –                 | ortu      | ortu123      |
| Guru & Staf    | Wali Kelas 4A     | guru      | guru123      |
| Guru & Staf    | Wakasek Kurikulum + Wali Kelas 1A | kurikulum | kurikulum123 |
| Guru & Staf    | Wakasek Kesiswaan | kesiswaan | kesiswaan123 |
| Guru & Staf    | Tata Usaha        | tu        | tu123        |
| Guru & Staf    | Pustakawan        | pustaka   | pustaka123   |
| Guru & Staf    | Wakasek Sarana & Prasarana | sarpras | sarpras123 |
| Guru & Staf    | Guru BK           | bk        | bk123        |
| Guru & Staf    | Satpam            | satpam    | satpam123    |

Portal Kepala Sekolah tidak punya akun demo; aksesnya hanya lewat akun terdaftar
(`AKUN_TERDAFTAR` di `src/data/dummy.js`), yang tidak ditampilkan di halaman login.
Password-nya disimpan di `.env.local` (tidak ikut ke Git): salin `.env.example` menjadi
`.env.local` lalu isi `VITE_PASSWORD_KEPSEK`, kemudian jalankan ulang `npm run dev`.

## Hak akses

Portal Guru & Staf memakai satu halaman untuk semua jabatan; menu muncul sesuai jabatan
(lihat `src/context/akses.js`). Kepala Sekolah mengatur jabatan setiap orang di menu
**Data Guru & Staf**, dan menu orang tersebut langsung berubah.

## Pembayaran SPP

Orang tua membayar lewat menu **Pembayaran SPP** (QRIS atau Virtual Account), Tata Usaha
mencatat pembayaran tunai di menu **Keuangan SPP**. Saat ini pembayaran masih **simulasi**;
untuk produksi perlu payment gateway (mis. Midtrans/Xendit) di backend yang mengirim
konfirmasi otomatis (webhook) — lihat `selesaikanTransaksi` di `src/context/DataContext.jsx`.

## PPDB online

Formulir pendaftaran 4 langkah ada di `/ppdb#daftar`. Pendaftar mendapat nomor pendaftaran
dan bisa cek status dengan nomor + tanggal lahir anak. Panitia (Tata Usaha & Kepala Sekolah)
memverifikasi di menu **PPDB Online**. Kuota, syarat usia, dan daftar berkas diatur di `PPDB`
pada `src/data/dummy.js`. Berkas saat ini hanya dicatat nama filenya — penyimpanan file asli
memerlukan backend.

## Fasilitas & kunjungan sekolah

Halaman `/fasilitas` berisi denah interaktif dan detail tiap fasilitas (`/fasilitas/:id`).
Pengunjung bisa menjadwalkan kunjungan dan mendapat kode booking untuk cek status;
Tata Usaha & Kepala Sekolah mengonfirmasi di menu **Kunjungan Sekolah**. Isi fasilitas,
posisi denah, dan sesi kunjungan diatur di `FASILITAS` dan `KUNJUNGAN` pada `src/data/dummy.js`.

## Status saat ini (frontend)

- Data masih **dummy** dan disimpan di `localStorage` browser (lihat `src/context/DataContext.jsx`).
- Login masih simulasi (`src/context/AuthContext.jsx`) — **belum aman untuk produksi**.
- Saat backend siap, cukup ganti isi kedua context tersebut dengan pemanggilan API.

## Struktur

```
src/
  components/     Layout, navbar, footer, komponen UI, CrudPage, Spp (komponen pembayaran)
  context/        AuthContext (login), DataContext (data + aksi), akses (jabatan & menu)
  data/dummy.js   Data contoh sekolah — ubah di sini untuk konten
  pages/public/   Beranda, Profil, Guru, Berita, Galeri, PPDB, Kontak
  pages/siswa/    Dashboard, Jadwal, Absensi per Mapel, Tugas, Profil
  pages/ortu/     Dashboard, Pembayaran SPP, Absensi Anak, Izin, Pengumuman
  pages/staf/     Dashboard Guru & Staf, Absensi Kelas, Persetujuan Izin
  pages/kepsek/   Dashboard Kepala Sekolah
  pages/kelola/   Halaman kelola bersama: Data Siswa, Data Guru & Staf, Rekap Kehadiran,
                  Bimbingan Konseling, Keuangan SPP, Buku Tamu, Pengumuman, Perpustakaan,
                  Inventaris Sarpras, Laporan Kerusakan, Jadwal
  utils/          Helper tanggal, SPP, dan ringkasan statistik
```
