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
| Guru & Staf    | Guru Mapel (Bahasa Inggris) | mapel | mapel123 |
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

## Tampilan

- Huruf judul **Fredoka** (membulat, ramah anak) dan huruf isi **Plus Jakarta Sans**, dimuat di `index.html`.
- Warna utama merah putih (`--color-primary-*` di `src/index.css`) dengan aksen kuning, biru, dan hijau.
- Hiasan & ilustrasi SVG (gedung sekolah, gelombang, bintang, animasi muncul saat di-scroll) ada di
  `src/components/Hiasan.jsx` — ganti dengan foto asli sekolah bila sudah tersedia.
- Grafik tanpa pustaka tambahan di `src/components/Grafik.jsx` (batang & garis, satu warna data,
  tooltip saat hover/fokus keyboard).

## Isi portal

| Portal | Menu |
|---|---|
| Siswa | Beranda (level, XP, runtutan hadir, jadwal "sekarang"), **Presensi Hari Ini** (kode OTP), Jadwal, Tugas & PR, **Nilai Saya** + rapor sementara, Absensi per Mapel, **Lencana & Poin**, **Ekstrakurikuler** (pilih maks. 2), **Perpustakaan** (katalog & pesan buku), Kalender, Profil |
| Orang Tua | Beranda ringkasan ananda, **Nilai & Rapor**, **Catatan Sikap**, **Tugas Ananda**, Absensi, **Pesan Wali Kelas**, Izin, Pengumuman, Pembayaran SPP, Kalender |
| Guru & Staf | **Presensi Staf** (semua jabatan) + menu sesuai jabatan — wali kelas: **Daftar Siswa**, **Presensi Siswa** (OTP), Izin, **Input Nilai**, **Tugas Kelas**, **Poin Sikap**, **Pesan Orang Tua**, **Rapor Kelas**; guru mapel: Daftar Siswa, Presensi Siswa semua kelas, Input Nilai & Tugas untuk mapelnya; plus menu BK, sarpras, TU, perpustakaan, satpam |
| Kepala Sekolah | Dashboard (kehadiran guru & staf, tren kehadiran siswa, perbandingan antarkelas, daftar "perlu perhatian", PPDB, SPP), persetujuan izin & koreksi presensi staf, dan seluruh menu kelola |

Nilai akhir = 40% rata-rata tugas + 30% PTS + 30% PAS dengan KKTP 75 (lihat `src/utils/nilai.js`).
Lencana, level, dan poin sikap dihitung di `src/utils/prestasi.js`.

## Hak akses

Portal Guru & Staf memakai satu halaman untuk semua jabatan; menu muncul sesuai jabatan
(lihat `src/context/akses.js`). Kepala Sekolah mengatur jabatan setiap orang di menu
**Data Guru & Staf**, dan menu orang tersebut langsung berubah.

## Kelas & presensi siswa

Sekolah memiliki 18 rombongan belajar, kelas **1A–6C** (`KELAS` di `src/data/dummy.js`), masing-masing
24 siswa contoh dengan satu wali kelas. Nama siswa contoh dibuat otomatis oleh `lengkapiKelas`.

- **Daftar Siswa** (menu guru): semua kelas bisa dilihat, lengkap dengan kehadiran 20 hari, nilai,
  poin sikap, dan detail per siswa. Bisa diunduh sebagai CSV.
- **Presensi Siswa dengan OTP**: guru menekan *Buka Presensi*, lalu muncul kode 6 angka acak yang
  **berlaku 15 menit** (bisa ditampilkan layar penuh di proyektor). Siswa memasukkan kode di menu
  **Presensi Hari Ini** dan langsung tercatat Hadir. *Kode baru* membatalkan kode lama; setelah
  5 kali salah, siswa dikunci pada sesi itu.
- **Guru tetap bisa mengubah** kehadiran setiap siswa (H/S/I/A) kapan saja, termasuk hari-hari
  sebelumnya. Setiap perubahan tercatat: lewat kode OTP jam berapa, atau diubah oleh siapa dan
  status sebelumnya.
- Wali kelas mempresensi kelasnya sendiri; guru mapel bisa mempresensi kelas mana pun yang ia ajar.

Pengaturan masa berlaku & batas percobaan ada di `src/utils/otp.js`. **Penting:** di versi frontend
ini kode tersimpan di browser, jadi presensi OTP hanya bisa dicoba di browser yang sama (mis. tab guru
dan tab siswa). Untuk dipakai sungguhan, pembuatan & pemeriksaan kode harus dipindah ke backend.

## Presensi guru & staf

Setiap guru dan staf absen masuk/pulang sendiri dari kartu **Presensi Anda** (beranda dashboard
atau menu **Presensi Staf**). Jam kerja diatur di `JAM_KERJA` pada `src/data/dummy.js`
(umum 06.45–14.00, satpam 06.00–15.00); lewat dari jam masuk otomatis tercatat terlambat.

- **Terbuka untuk semua staf**: papan harian, rekap per periode, dan kalender kehadiran
  seluruh guru & staf bisa dilihat siapa pun yang login di Portal Guru & Staf.
- **Privasi tetap dijaga**: alasan terlambat/pulang awal dan alasan izin, sakit, atau cuti hanya
  terlihat oleh yang bersangkutan dan Kepala Sekolah. Keterangan dinas luar terlihat semua staf.
- **Izin/cuti** diajukan lewat portal dan disetujui Kepala Sekolah; setelah disetujui, tanggalnya
  otomatis tercatat di presensi.
- **Koreksi** hanya oleh Kepala Sekolah dan wajib beralasan. Siapa yang mengoreksi, kapan,
  alasannya, dan data sebelumnya tersimpan serta terlihat oleh semua staf.

Presensi Kepala Sekolah dicatat pada data guru & staf berjabatan *Kepala Sekolah* (menu
**Data Guru & Staf**). Logika rekap ada di `src/utils/presensi.js`.

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

- Data masih **dummy** dan disimpan di `localStorage` browser dengan kunci `sdhg-data-v3`
  (lihat `src/context/DataContext.jsx`). Perubahan disinkronkan antartab di browser yang sama.
- Login masih simulasi (`src/context/AuthContext.jsx`) — **belum aman untuk produksi**.
- Saat backend siap, cukup ganti isi kedua context tersebut dengan pemanggilan API.

## Struktur

```
src/
  components/     Layout, navbar, footer, komponen UI, CrudPage, Spp (pembayaran), Hiasan (ilustrasi),
                  Grafik, Nilai (rincian & rapor), Percakapan (pesan), Presensi (kartu absen staf), Faq, Ikon
  context/        AuthContext (login), DataContext (data + aksi), akses (jabatan & menu)
  data/dummy.js   Data contoh sekolah — ubah di sini untuk konten
  pages/public/   Beranda, Profil, Akademik, Guru, Fasilitas, Berita, Galeri, PPDB, Kontak
  pages/siswa/    Dashboard, Presensi (OTP), Jadwal, Absensi per Mapel, Tugas, Nilai, Lencana, Ekskul, Perpustakaan, Profil
  pages/ortu/     Dashboard, Nilai, Sikap, Tugas, Pesan, Pembayaran SPP, Absensi Anak, Izin, Pengumuman
  pages/staf/     Dashboard Guru & Staf, Presensi Siswa (OTP), Persetujuan Izin
  pages/kepsek/   Dashboard Kepala Sekolah
  pages/kelola/   Halaman kelola bersama: Presensi Staf, Daftar Siswa, Input Nilai, Tugas Kelas, Poin Sikap, Pesan Orang Tua,
                  Rapor Kelas, Data Siswa, Data Guru & Staf, Rekap Kehadiran, Bimbingan Konseling,
                  Keuangan SPP, Buku Tamu, Pengumuman, Perpustakaan, Inventaris Sarpras,
                  Laporan Kerusakan, Jadwal
  utils/          Helper tanggal, SPP, nilai & rapor, prestasi (lencana/level), presensi staf, OTP presensi siswa, ringkasan statistik
```
