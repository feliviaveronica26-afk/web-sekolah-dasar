# SD Harapan Gemilang — Frontend

Website sekolah + portal siswa, orang tua, guru & staf, dan kepala sekolah. Dibuat dengan React, Vite 6, dan Tailwind CSS 4.

## Menjalankan

```bash
npm install
npm run dev            # buka http://localhost:5173
npm run build          # build produksi ke folder dist/
npm run hash-password  # buat/ganti password akun Kepala Sekolah (disimpan sebagai hash)
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
Password-nya **tidak** disimpan di kode: `.env.local` (tidak ikut ke Git) hanya berisi hash
`VITE_HASH_KEPSEK`. Untuk membuat atau mengganti password, jalankan `npm run hash-password`
(password diketik tersembunyi), lalu jalankan ulang `npm run dev`.

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
| Siswa | Beranda (level, XP, runtutan hadir, jadwal "sekarang"), **Presensi Hari Ini** (kode OTP), **Chat Kelas**, Jadwal, Tugas & PR, **Nilai Saya** + rapor sementara, Absensi per Mapel, **Lencana & Poin**, **Ekstrakurikuler** (pilih maks. 2), **Perpustakaan** (katalog & pesan buku), Kalender, Profil |
| Orang Tua | Beranda ringkasan ananda, **Nilai & Rapor**, **Catatan Sikap**, **Tugas Ananda**, Absensi, **Chat**, Izin, Pengumuman, Pembayaran SPP, Kalender |
| Guru & Staf | **Presensi Staf** & **Chat** (semua jabatan) + menu sesuai jabatan — wali kelas: **Daftar Siswa**, **Presensi Siswa** (OTP, harian & per pelajaran), Izin, **Input Nilai**, **Tugas Kelas**, **Poin Sikap**, **Rapor Kelas**; guru mapel: Daftar Siswa, Presensi Siswa untuk pelajaran yang diajarnya, Input Nilai & Tugas untuk mapelnya; plus menu BK, sarpras, TU, perpustakaan, satpam |
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
Setiap kelas punya jadwal pelajaran (`JADWAL`, dibuat oleh `buatJadwal`): wali kelas mengajar mapel
umum di kelasnya, sedangkan Pendidikan Agama, Bahasa Inggris, PJOK, dan Informatika diajar guru mapel.

- **Daftar Siswa** (menu guru): semua kelas bisa dilihat, lengkap dengan kehadiran 20 hari, nilai,
  poin sikap, dan detail per siswa. Bisa diunduh sebagai CSV.
- **Presensi Siswa dengan OTP**: guru menekan *Buka Presensi*, lalu muncul kode 6 angka acak yang
  **berlaku 15 menit** (bisa ditampilkan layar penuh di proyektor). Siswa memasukkan kode di menu
  **Presensi Hari Ini** dan langsung tercatat Hadir. *Kode baru* membatalkan kode lama; setelah
  5 kali salah, siswa dikunci pada sesi itu. Hanya satu kode yang aktif per kelas.
- **Dua jenis presensi**:
  - **Harian**: dibuka wali kelas (biasanya pagi). Inilah kehadiran yang dilihat orang tua dan
    dipakai di rekap kehadiran.
  - **Per pelajaran**: dibuka guru pengampu untuk satu pelajaran di jadwal (mis. "4A · Bahasa
    Inggris · 09.40–10.50"). Siswa yang sudah hadir harian tetap diminta kode lagi, dan tercatat
    hadir **di pelajaran itu saja**. Siswa yang belum punya presensi harian (mis. datang terlambat)
    ikut tercatat hadir harian.
- Siswa yang sakit/izin/alpa hari itu (termasuk izin dari orang tua) otomatis ikut di setiap
  pelajaran. Pelajaran yang tidak dipresensi tersendiri mengikuti presensi harian.
- **Guru tetap bisa mengubah** kehadiran setiap siswa (H/S/I/A) kapan saja, termasuk hari-hari
  sebelumnya. Setiap perubahan tercatat: lewat kode OTP jam berapa, atau diubah oleh siapa dan
  status sebelumnya.
- **Siapa mempresensi apa**: wali kelas memegang presensi harian kelasnya dan bisa membuka semua
  pelajaran kelasnya; guru mapel hanya pelajaran yang ia ajar (pintasan "Jadwal Anda hari ini" dan
  kartu **Jadwal Mengajar** di beranda).
- **Rekap untuk wali kelas**: di presensi harian, garis kecil di bawah nama siswa menunjukkan
  kehadirannya di tiap pelajaran, dan siswa yang hadir harian tetapi tidak di suatu pelajaran (atau
  sebaliknya) ditampilkan sebagai peringatan.
- Siswa & orang tua melihat **kehadiran per pelajaran hari ini**, dan halaman **Absensi per Mapel**
  memakai data dari guru pengampu.

Pengaturan masa berlaku & batas percobaan ada di `src/utils/otp.js`; aturan pelajaran & status per
pelajaran ada di `src/utils/jadwal.js`. **Penting:** di versi frontend
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

**Denah sekolah** (dikelilingi pagar, atas = belakang sekolah):

- **Belakang:** area olahraga dibagi per ekskul (lapangan futsal, bulu tangkis, pramuka & senam),
  kantin sehat, serta taman & kebun.
- **Tengah:** Gedung Utama (khusus siswa) diapit gedung kiri (ruang guru & staf) dan gedung kanan
  (ruang kepala sekolah, lab server, 2 lab komputer). Di antaranya ada Lapangan Upacara dan tiang
  bendera.
- **Depan:** zona ibadah (musholla, gereja, vihara, klenteng, pura), perpustakaan, UKS, pos satpam,
  dan parkir antar-jemput. Gerbang utama ada di pagar kanan, bersebelahan dengan pos satpam.

Koordinatnya diatur di `FASILITAS`, `DENAH_LAIN`, `DENAH_ZONA`, `DENAH_JALUR`, dan `DENAH_GERBANG`
(`src/data/dummy.js`); fasilitas yang punya beberapa ruang (lab komputer, lapangan, tempat ibadah)
memakai daftar area berlabel.

**Denah ruang kelas** (`/fasilitas/ruang-kelas#denah-kelas`, juga di halaman Jadwal portal siswa &
guru): Gedung Utama dua lantai dengan tangga dan lift — kelas 1–3 di lantai 1, kelas 4–6 di lantai 2.
Klik ruang untuk melihat wali kelas, jumlah siswa, dan pelajaran yang sedang berlangsung (titik hijau).
Tata letaknya diatur di `GEDUNG_KELAS`, tampilannya di `src/components/DenahKelas.jsx`.

## Chat

Menu **Chat** ada di semua portal, seperti WhatsApp versi sederhana: pesan teks, **pesan suara**,
dan **foto, video, dokumen (PDF/Word/Excel/PowerPoint), audio/lagu** (maks. 25 MB per berkas; foto
otomatis diperkecil). Ada tanda belum dibaca di menu & notifikasi, centang terkirim/dibaca, dan pesan
bisa dihapus.

| Pengguna | Bisa chat dengan |
|----------|------------------|
| Siswa | Hanya **grup kelasnya** (mis. "Kelas 1A": siswa + wali kelas + guru mapel di kelas itu) |
| Orang tua | Grup **Orang Tua Kelas …** (dengan wali kelas) + chat pribadi dengan wali kelas, guru anaknya, Tata Usaha, kepala sekolah |
| Guru & staf | Grup **Guru & Staf**, grup kelas yang diajar, grup orang tua (wali kelas) + chat pribadi dengan semua guru/staf dan orang tua siswa yang diajar |
| Kepala sekolah & TU | Seperti guru, ditambah chat pribadi dengan semua orang tua |

Guru di grup adalah **pengelola**: bisa menghapus pesan yang tidak pantas dan menyalakan mode
**"hanya guru yang dapat mengirim"** (untuk pengumuman). Anggota grup dihitung otomatis dari data siswa,
guru, dan jadwal. Fitur "Pesan Wali Kelas" yang lama sudah digabung ke chat (pesan lamanya ikut pindah).

Agar tidak membebani web: halaman chat dimuat terpisah saat dibuka, data chat disimpan terpisah dari
data sekolah (`sdhg-chat-v1`), dan isi berkas disimpan di IndexedDB (`src/utils/berkasChat.js`) yang
baru dibaca saat pesannya tampil. Aturan siapa-boleh-chat ada di `src/utils/chat.js`.

**Batasan saat ini:** sebelum backend tersambung, chat hanya bisa dicoba di browser yang sama (mis. tab
guru & tab orang tua). Rekam suara butuh `localhost` atau HTTPS. Saat backend siap, `ChatContext` &
`berkasChat` diganti dengan API + penyimpanan berkas di server (dan WebSocket untuk pesan seketika).

## Notifikasi jaringan

`src/components/StatusJaringan.jsx` menampilkan pemberitahuan di bagian atas layar ketika perangkat
**offline**, **server tidak bisa dihubungi**, atau **jaringan kurang stabil** (2 dari 3 pemeriksaan
terakhir lambat > 2,5 detik atau gagal), lalu "Koneksi kembali normal" saat pulih. Pemeriksaan
berupa permintaan kecil ke server setiap 20 detik selama halaman dibuka, ditambah laporan kualitas
jaringan dari browser (Chrome/Android).

## Keamanan

Lapisan yang sudah ada di frontend:

- **Password tidak ikut ke kode.** Akun sungguhan memakai hash PBKDF2-SHA256 (310.000 iterasi,
  `src/utils/keamanan.js`). Setelah login, sesi menyimpan token turunan password, sehingga sesi
  yang dibuat manual lewat DevTools (tanpa password) ditolak.
- **Batas percobaan login**: 5 kali salah → login dikunci 1 menit, berlipat setiap terkunci lagi
  (maks. 30 menit).
- **Keluar otomatis** setelah 30 menit tanpa aktivitas atau 12 jam sejak login (penting untuk
  komputer sekolah yang dipakai bersama).
- **Content Security Policy** (disisipkan saat build) memblokir skrip sisipan/XSS; header keamanan
  lain (anti-clickjacking, nosniff, Referrer-Policy, Permissions-Policy, HSTS) ada di
  `public/_headers` (Netlify/Cloudflare Pages) dan `vite preview`.
- **Anti-spam formulir publik** (Kontak, PPDB, kunjungan): kolom jebakan bot + batas kirim per
  perangkat. Cek status PPDB/kunjungan dibatasi 10 kali per 10 menit, dan kode kunjungan kini
  6 karakter acak sehingga tidak mudah ditebak.
- **CSV aman**: sel yang diawali `= + - @` dinetralkan agar tidak dijalankan sebagai rumus Excel.
- Peringatan di konsol browser agar pengguna tidak menempelkan kode atas suruhan orang lain.

**Batasan yang perlu diketahui:** selama data masih di `localStorage`, siapa pun yang memegang
perangkat bisa membaca data lewat DevTools, dan batas percobaan bisa direset dengan menghapus data
browser. Perlindungan penuh harus dibuat di backend Laravel saat sudah tersambung: login & sesi di
server (mis. Sanctum), `throttle` untuk login/OTP/formulir, CSRF, validasi input, HTTPS + HSTS,
serta header yang sama dengan `public/_headers` di konfigurasi Apache/Nginx.

## Status saat ini (frontend)

- Data masih **dummy** dan disimpan di `localStorage` browser dengan kunci `sdhg-data-v3`
  (lihat `src/context/DataContext.jsx`). Perubahan disinkronkan antartab di browser yang sama.
- Login masih di browser (`src/context/AuthContext.jsx`). Sudah memakai hash, batas percobaan, dan
  sesi berbatas waktu, tetapi tetap **belum aman untuk produksi** sampai pindah ke backend (lihat Keamanan).
- Saat backend siap, cukup ganti isi kedua context tersebut dengan pemanggilan API.

## Struktur

```
src/
  components/     Layout, navbar, footer, komponen UI, CrudPage, Spp (pembayaran), Hiasan (ilustrasi),
                  Grafik, Nilai (rincian & rapor), Presensi (kartu absen staf), Faq, Ikon,
                  DenahKelas (denah gedung kelas), StatusJaringan (notifikasi koneksi)
  context/        AuthContext (login), DataContext (data + aksi), ChatContext (chat), akses (jabatan & menu)
  pages/Chat.jsx  Chat untuk semua portal (dimuat terpisah)
  data/dummy.js   Data contoh sekolah — ubah di sini untuk konten
  pages/public/   Beranda, Profil, Akademik, Guru, Fasilitas, Berita, Galeri, PPDB, Kontak
  pages/siswa/    Dashboard, Presensi (OTP), Jadwal, Absensi per Mapel, Tugas, Nilai, Lencana, Ekskul, Perpustakaan, Profil
  pages/ortu/     Dashboard, Nilai, Sikap, Tugas, Pembayaran SPP, Absensi Anak, Izin, Pengumuman
  pages/staf/     Dashboard Guru & Staf, Presensi Siswa (OTP), Persetujuan Izin
  pages/kepsek/   Dashboard Kepala Sekolah
  pages/kelola/   Halaman kelola bersama: Presensi Staf, Daftar Siswa, Input Nilai, Tugas Kelas, Poin Sikap,
                  Rapor Kelas, Data Siswa, Data Guru & Staf, Rekap Kehadiran, Bimbingan Konseling,
                  Keuangan SPP, Buku Tamu, Pengumuman, Perpustakaan, Inventaris Sarpras,
                  Laporan Kerusakan, Jadwal
  utils/          Helper tanggal, SPP, nilai & rapor, prestasi (lencana/level), presensi staf, OTP presensi siswa,
                  jadwal & presensi per pelajaran, keamanan (hash, batas login, anti-spam, CSV), chat & berkas chat,
                  ringkasan statistik
scripts/          hash-password.mjs (membuat hash password akun sungguhan)
public/_headers   Header keamanan untuk hosting statis
```
