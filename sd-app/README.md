# SD Harapan Gemilang — Frontend

Website sekolah + portal siswa, orang tua, guru & staf, dan kepala sekolah. Dibuat dengan React, Vite 6, dan
Bootstrap 5.3 (Sass, tanpa JavaScript Bootstrap).

## Menjalankan

```bash
npm install
npm run dev            # buka http://localhost:5173
npm run build          # build produksi ke folder dist/
```

> Catatan: proyek ini sengaja memakai Vite 6. Vite 8 memakai binary `rolldown` yang diblokir Windows Smart App Control.

### Backend Laravel & MySQL

**Semua data** tersimpan di backend Laravel + MySQL (folder `laravel/` di samping `sd-app/`, database
`sd_harapan_gemilang`): akun & login, guru, siswa, presensi, nilai, tugas, sikap, ekskul, SPP,
perpustakaan, PPDB, kunjungan, buku tamu, sarpras, konseling, pengumuman, keuangan, dan chat
(beserta berkasnya). Browser tidak lagi menyimpan data sekolah. Jalankan Laravel di samping `npm run dev`:

```bash
php artisan migrate               # buat tabel (sekali, atau setiap ada tabel baru)
php artisan db:seed               # isi data awal yang belum ada (tabel yang sudah berisi tidak ditimpa)
php artisan serve --host=127.0.0.1 --port=8000
php artisan akun:password "raymond fernando"   # ganti password akun (diketik tersembunyi)
```

Website memanggil `/api/...`, lalu proxy di `vite.config.js` meneruskannya ke Laravel (ubah alamatnya
lewat variabel `API_LARAVEL`). Karena itu Laravel cukup mendengar di `127.0.0.1`, dan HP di jaringan
yang sama tetap bisa memakai data yang sama lewat alamat website.

- **Data per pengguna** (`GET /api/data`, `laravel/app/Support/DataSekolah.php`): setiap orang hanya
  menerima data yang boleh ia lihat. Siswa & orang tua: data milik siswa itu + teman sekelas (tanpa
  nilai teman; peringkat kelas dihitung server). Guru & staf: data sekolah, kecuali konseling (Guru BK),
  SPP (TU), data lengkap PPDB/kunjungan (TU), dan alasan izin/terlambat rekan. Pengunjung: pengumuman,
  guru tanpa NIP, katalog buku, dan kuota PPDB/kunjungan tanpa data pribadi.
- **Hak mengubah** diperiksa server untuk setiap perubahan (`app/Support/Akses.php`, sama dengan
  `src/context/akses.js`): mis. wali kelas hanya kelasnya, guru mapel hanya mapelnya, siswa hanya
  ekskul/tugas/pesanan bukunya sendiri.
- **Perubahan dari perangkat lain** ikut tampil: website menanyakan `GET /api/versi` tiap 15 detik
  (3 detik di halaman presensi & chat) dan hanya memuat ulang bagian yang berubah. Saat kembali ke tab,
  semua data dimuat ulang, jadi perubahan yang dibuat langsung di MySQL Workbench juga terlihat.
- **Data acuan** (kelas, sesi, mapel, ekskul, SPP, pilihan formulir) dan **data contoh** dibuat dari
  `src/data/dummy.js` & `scripts/data-contoh.js`. Setelah mengubah data acuan, jalankan
  `npm run ekspor-laravel` (menulis `resources/data/referensi.json` serta `jadwal.json`, `kalender.json`,
  `contoh.json` di `database/seeders/data/` Laravel) agar aturan di server ikut berubah.
- **Jadwal pelajaran & kalender akademik** tersimpan di MySQL (tabel `jadwal_pelajaran` & `kalender`)
  dan diubah Wakasek Kurikulum/Kepala Sekolah dari menu **Jadwal** dan **Kalender**. Website menyalinnya
  ke `src/utils/acuan.js` untuk fungsi presensi & hari sekolah. Agenda berjenis **Libur** membuat
  tanggalnya bukan hari sekolah di website dan server (`isHariSekolah` / `Waktu::hariSekolah`): presensi
  ditutup dan rekap tidak menghitungnya. Satu guru mapel tidak boleh dijadwalkan di dua kelas pada jam
  yang sama (`JadwalController`); bentrok lama dari jadwal contoh hanya ditandai.
- Daftar guru terbuka untuk umum (halaman Guru), tetapi **NIP hanya dikirim ke Kepala Sekolah**.
- **Login** lewat `POST /api/masuk`: akun di tabel `users` (kolom `username`, `role`, `guru_id`, `nis`,
  `kelas`, `anak_nis`, `aktif`), password bcrypt. Sesi disimpan Laravel (tabel `sessions`) dan
  dikenali lewat cookie HttpOnly; permintaan yang mengubah data membawa token CSRF (`X-XSRF-TOKEN`).
  Hak akses diperiksa server (`peran:kepsek`), bukan hanya disembunyikan di menu.
- Tambah/ubah/hapus guru hanya untuk Kepala Sekolah.
- Jika Laravel mati saat halaman terbuka, data yang sudah tampil tetap ada dan perubahan ditolak
  dengan pesan yang jelas (Data Guru & Staf menampilkan status sambungannya). Jika website dibuka saat
  Laravel mati, portal menampilkan "Server data tidak bisa dihubungi" dengan tombol Coba lagi.
- **Keuangan Sekolah** (menu Administrasi, khusus Kepala Sekolah): buku kas pemasukan & pengeluaran
  (tabel `transaksi_kas`), saldo, surplus/defisit, grafik arus kas per bulan, rincian per kategori,
  dan unduh laporan CSV. Membaca pun wajib sesi kepsek, dan datanya tidak disimpan di browser.
  Pembayaran SPP masuk otomatis dari data SPP (digabung per hari) agar tidak tercatat dua kali.
  Kategori ada di `src/utils/keuangan.js` dan `TransaksiKas::KATEGORI` di Laravel (harus sama).
- **Batas server lokal:** `php artisan serve` di Windows melayani satu permintaan sekaligus, dan
  `php.ini` bawaan membatasi unggahan 2 MB (berkas chat). Untuk dipakai banyak orang, pasang di web
  server sungguhan (Apache/Nginx + PHP-FPM) dan naikkan `upload_max_filesize`/`post_max_size`.

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

Akun demo dibuat oleh seeder Laravel (`AkunSeeder`) dan **harus dihapus sebelum website dipakai
sungguhan**. Portal Kepala Sekolah tidak punya akun demo: akunnya dibuat dari `HASH_KEPSEK` di `.env`
Laravel (hash dari website versi lama), dan saat login pertama password-nya otomatis disimpan ulang
dengan bcrypt. Password tidak pernah ditulis di kode; ganti dengan `php artisan akun:password "<username>"`.

### Akun guru, staf, orang tua, dan siswa

- **Satu per satu:** Kepala Sekolah membuat akun (atau mengatur ulang password) guru & staf dari menu
  **Data Guru & Staf**; Tata Usaha/Kepala Sekolah membuat akun orang tua dari menu **Data Orang Tua** dan
  akun siswa dari menu **Data Siswa**. Password awal acak hanya tampil sekali di layar itu.
- **Massal:** `php artisan akun:buat staf`, `php artisan akun:buat ortu`, atau `php artisan akun:buat siswa`
  membuat akun untuk yang belum punya. Username staf diambil dari nama (mis. `siti.nurhaliza`), username
  orang tua `ortu` + NIS anak pertama (mis. `ortu230402`), username siswa = NIS (mis. `234113`). Password
  awal **tidak** ditampilkan di terminal; daftarnya ditulis ke CSV di `storage/app/private/akun-awal/`
  Laravel (tidak ikut git). Bagikan, lalu hapus berkasnya. Akun demo di atas tetap berlaku.
- **Wajib ganti password:** akun dengan password awal langsung diminta membuat password sendiri setelah
  login, dan server menolak perubahan data apa pun sebelum itu. Semua akun bisa mengganti password lewat
  **Ganti Password** di menu samping; perangkat lain yang login dengan akun itu ikut dikeluarkan.

### Data guru, siswa & orang tua

- **Biodata guru & staf** (TTL, agama, alamat, WhatsApp, email, pendidikan, status kepegawaian, mulai
  bertugas) tersimpan di tabel `guru`. Biodata pribadi hanya terlihat oleh Kepala Sekolah dan pemiliknya.
- **Mapel yang diampu** guru mapel diatur di Data Guru & Staf (kolom `mapel_diampu`). Guru mapel menilai &
  mengabsen mapel itu di semua kelas; mapel lain diajar wali kelas. Mengganti nama/gelar guru tidak lagi
  memengaruhi haknya. Satu mapel hanya boleh diampu satu guru mapel.
- **Data orang tua** per keluarga (ayah, ibu, wali, pekerjaan, WhatsApp, email, alamat) ada di tabel
  `orang_tua`; siswa merujuknya lewat `orang_tua_id`, jadi kakak-adik cukup satu data. Yang bisa melihat:
  Kepala Sekolah, Tata Usaha, Guru BK, dan Wakasek Kesiswaan (semua), wali kelas (kelasnya), siswa & orang
  tua (keluarganya sendiri). Orang tua memperbarui kontaknya sendiri di **Data Keluarga** Portal Orang Tua.
- **Biodata siswa** (NISN, tempat & tanggal lahir, agama, golongan darah, tanggal masuk, asal TK/sekolah,
  catatan kesehatan) ada di tabel `siswa` dan diubah lewat **Data Siswa** (Tata Usaha, Wakasek Kesiswaan,
  Guru BK, Kepala Sekolah). Yang menerima biodata: pengelola Data Siswa (semua), wali kelas (kelasnya), dan
  siswa & orang tuanya sendiri. Guru mapel dan staf lain hanya menerima nama, NIS, kelas, dan jenis
  kelamin; teman sekelas hanya tanggal & bulan ulang tahun (tampil di kartu teman). Catatan kesehatan
  (mis. alergi) tampil di daftar kelas wali kelas.
- **Siswa baru** ditambahkan lewat **Data Siswa** (pintasan **Tambah Siswa** di beranda Wakasek
  Kesiswaan) dan langsung masuk semua menu kelas, rekap, SPP, dan beranda Kepala Sekolah. Selama belum
  punya catatan presensi/nilai ia tidak dihitung 0% (tampil "–"), dan SPP-nya ditagih mulai bulan masuk.
  Tata Usaha lalu melengkapi data keluarganya (panel "Data siswa perlu dilengkapi") dan membuat akun login.

## Tampilan

**Halaman publik** (beranda, profil, akademik, guru, fasilitas, berita, galeri, PPDB, kontak, login, 404)
memakai gaya **modern merah putih** yang kaya foto: latar merah di pembuka setiap halaman dengan foto
berbingkai bulat, kolase foto di beranda, kartu "bento" (foto + bidang warna), kartu ekskul & fasilitas
berfoto, contoh tampilan Portal Orang Tua di ponsel, berita bergambar, dan galeri foto. Merah seragam tetap
dominan; kuning stabilo sebagai aksen, merah marun untuk linimasa harian & footer.

- Huruf **Plus Jakarta Sans** (rancangan huruf asal Indonesia) untuk judul (tebal 800) dan isi.
- Warna (`$merah` 50–950, `kertas`, `kartu`, `tinta`, `garis`, `stabilo`, `krem`) ada di
  `src/styles/_tema.scss`. Kontras teks sudah dihitung (≥ 4,5:1); teks di atas merah memakai `merah-700` ke
  atas (putih/`krem`/`stabilo`), `merah-600` (= `primary`) hanya untuk tombol & bidang berteks putih.
- Komponen khusus publik di `src/components/Situs.jsx`: latar merah & jejak halaman, kepala halaman
  berfoto, judul bagian, label pil, tombol pil, isian formulir, pita teks berjalan (bisa dijeda), dan `Foto`.
- **Foto** ada di `public/foto/` (WebP). Saat ini berisi **foto contoh dari Unsplash** (lisensi Unsplash,
  daftar fotografer di `public/foto/KREDIT.md`). Untuk memakai foto asli sekolah, timpa berkas dengan nama
  yang sama, lalu sesuaikan teks `alt` di `src/data/foto.js`. File itu juga memetakan foto ke fasilitas,
  ekskul, serta berita/galeri (lewat kata kunci judul). Galeri bisa memakai foto sendiri per kegiatan dengan
  mengisi `foto: '/galeri/nama-berkas.jpg'` pada data `GALERI` di `src/data/dummy.js`.
- Hindari pola template generik: gradasi warna-warni, gumpalan, gelombang, bintang lima palsu, dan emoji.
  Gradasi gelap di atas foto hanya dipakai agar teks di atasnya tetap terbaca.

**Portal** memakai kulit merah putih yang sama dengan beranda (huruf, kartu, tombol pil, warna aktif),
komponen di `src/components/ui.jsx`, dan hiasan di `src/components/Hiasan.jsx`. Grafik tanpa pustaka
tambahan ada di `src/components/Grafik.jsx` (batang & garis, satu warna data, tooltip saat hover/fokus keyboard).

### Bootstrap

Gaya ditulis dengan **Bootstrap 5.3** lewat Sass (`src/styles/main.scss`). Yang dipakai hanya CSS-nya:
jendela, menu HP, tab, dan dropdown dibuka-tutup oleh state React (kelas `show`/`active`), jadi tidak ada
`bootstrap.js`.

| Berkas | Isi |
|--------|-----|
| `src/styles/_tema.scss` | variabel Bootstrap: warna tema (`primary` merah sekolah, `stabilo`, `tinta`, `kertas`, `merah-tua`, `marun`), breakpoint 640/768/1024/1280/1536, skala jarak (1 = 0,25rem … 48 = 12rem, termasuk `0-5`, `1-5`, `2-5`, `3-5`), ukuran huruf (`fs-xs` … `fs-8xl`), sudut membulat, tombol & isian |
| `src/styles/_utilitas.scss` | perluasan Utility API: warna merek (`text-merah-700`, `bg-abu-50`, `border-garis`), `kolom-*` (grid-template-columns, mis. `kolom-lg-isi-320`), `rentang-*` (col-span), `ukuran-*` (lebar = tinggi), `rasio-*`, `min-w-*`, posisi negatif (`top-n24`), `ls-*` (jarak huruf) |
| `src/styles/_dasar.scss` | penyesuaian Reboot & kelas bantu kecil: `antara-y-*` (jarak antar-anak), `pembatas-y`, `clamp-*`, `warna-{hue}`/`teks-{hue}` untuk warna mapel & ekskul, efek hover, gradien spanduk |
| `src/styles/_komponen.scss` | tombol (`btn-primary`, `btn-kedua`, `btn-bahaya`, `btn-terang`, …), kartu, isian, lencana, tab pil, jendela `.modal-sekolah` (lembar bawah di HP) |
| `src/styles/_situs.scss` · `_portal.scss` | bagian khusus halaman publik (hero, bento, linimasa, denah sekolah, FAQ) dan portal (menu samping, kartu angka, denah kelas, kalender, chat) |
| `src/styles/_gerak.scss` | semua animasi (lihat **Animasi**) |

- Kelas utilitas Bootstrap memakai `!important`. Bila dua kelas sejenis dipasang bersamaan (mis. `py-2`
  dan `py-2-5`), yang menang adalah yang **didefinisikan belakangan di CSS**, bukan yang ditulis belakangan
  di `className`. Karena itu komponen bantu menerima ukuran/warna sebagai parameter (mis.
  `pilihan(aktif, ukuran)` di `Situs.jsx`, `Catatan warna=`) alih-alih ditimpa dari luar.
- Saat `npm run build`, aturan CSS untuk kelas yang tidak pernah ditulis di `src/` dibuang (pemangkas di
  `vite.config.js`), sehingga CSS akhir ±136 kB (27 kB gzip) walau Utility API membuat ribuan varian.
  Tulis nama kelas utuh — jangan dirakit seperti `` `kolom-${n}` `` — agar tidak ikut terbuang.

### Responsif

Semua halaman (publik & portal) diperiksa di lebar 320 (HP kecil), 360, 390, 414, 768 & 820 (tablet),
1024, 1280, 1440, dan 1920 px: tidak ada halaman yang melebar ke samping, teks keluar kotak, atau kartu
terpotong. Aturan yang dipakai:

- **Menu samping portal** tampil tetap mulai 1280 px (`xl`). Di bawahnya (HP, tablet, laptop kecil) menu
  dibuka lewat tombol ☰ agar isi halaman mendapat lebar penuh.
- **Grid tidak melebar karena isinya**: `src/styles/_dasar.scss` memberi `min-width: 0` pada setiap anak
  `.d-grid` dan `.row`, jadi teks `text-truncate` atau tabel lebar tidak lagi mendorong kolom keluar layar.
  Tabel lebar memakai `overflow-x-auto` + `min-w-640` dsb. (digeser di dalam kartunya).
- **Kartu statistik** (`StatCard`) memakai *container query*: ikon pindah ke atas label bila kartunya sempit,
  dan nominal panjang (mis. Rp172.200.000) mengecil mengikuti lebar kartu.
- **Grafik** mengukur lebar wadahnya sendiri (`ResizeObserver`), jadi tulisan sumbu tetap 11 px di HP
  maupun di layar lebar.
- Baris berisi teks + tombol/nominal memakai `flex-wrap` atau bersusun di HP; bilah tab bisa digeser.
- **iPhone/iPad**: kolom isian dibuat 16 px agar Safari tidak memperbesar halaman sendiri saat mengetik.
  Jendela (modal) memakai tinggi layar yang terlihat (`dvh`), jadi tidak tertutup bilah alamat.

## Isi portal

| Portal | Menu |
|---|---|
| Siswa | Beranda (level, XP, runtutan hadir, jadwal "sekarang"; setiap kartu membuka halamannya), **Presensi Hari Ini** (kode OTP), **Chat Kelas**, **Pengumuman**, Jadwal, Tugas & PR, **Nilai Saya** + rapor sementara, Absensi per Mapel, **Lencana & Poin**, **Ekstrakurikuler** (boleh lebih dari satu, asal jadwal tidak bentrok), **Perpustakaan** (katalog & pesan buku), Kalender, Profil |
| Orang Tua | Beranda ringkasan ananda, **Nilai & Rapor**, **Catatan Sikap**, **Tugas Ananda**, Absensi, **Chat**, Izin, Pengumuman, Pembayaran SPP, **Data Keluarga**, Kalender |
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
Setiap kelas punya jadwal pelajaran (tabel `jadwal_pelajaran`; jadwal awal dibuat `buatJadwal` di
`scripts/data-contoh.js`): wali kelas mengajar mapel umum di kelasnya, sedangkan Pendidikan Agama,
Bahasa Inggris, PJOK, dan Informatika diajar guru mapel.

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
pelajaran ada di `src/utils/jadwal.js`. Kode OTP **dibuat dan diperiksa di server**
(`PresensiOtpController`) dan tidak pernah dikirim ke perangkat siswa, jadi guru dan siswa bisa
memakai HP/laptop masing-masing.

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
mencatat pembayaran tunai di menu **Keuangan SPP**. Nomor VA, kode QRIS, nomor transaksi, dan kuitansi
dibuat server, dan bulan yang sudah lunas tidak bisa dibayar dua kali.

- **Orang tua tidak bisa menandai lunas sendiri.** Tidak ada tombol "Saya Sudah Bayar"; transaksi online
  hanya lunas dari notifikasi payment gateway ke `POST /api/gateway/spp` yang bertanda tangan HMAC dengan
  kunci rahasia server (`GATEWAY_KUNCI`), dengan nominal yang sama persis dan transaksi yang masih
  berlaku. Notifikasi yang terkirim ulang tidak mencatat pembayaran dua kali. Halaman orang tua memeriksa
  status ke server tiap beberapa detik dan berubah sendiri menjadi "Pembayaran Berhasil".
- **Simulator Bank (mode demo).** Tanpa payment gateway sungguhan, halaman `/simulasi-bayar` berperan
  sebagai aplikasi bank/e-wallet: scan QR dari HP (atau buka tautan di halaman pembayaran), masukkan PIN 6
  angka bebas, lalu "bank" mengirim notifikasi bertanda tangan ke server. Simulator hanya menyala bila
  `SIMULASI_GATEWAY` aktif (bawaan: hanya `APP_ENV=local`) dan selalu mati di produksi. Agar QR bisa
  di-scan HP, jalankan `npm run dev:jaringan` lalu buka website lewat alamat jaringan laptop
  (mis. `http://192.168.1.5:5173`) dengan HP di Wi-Fi yang sama.
- **Kuitansi:** **Cetak Struk** mencetak tampilan kuitansi, **Unduh PDF** mengunduh kuitansi resmi yang
  dibuat server (dompdf) dari data pembayaran di database — `GET /api/spp/kuitansi/{nis}/{noTransaksi}`,
  hanya untuk orang tua/siswa pemiliknya serta Tata Usaha & Kepala Sekolah.

## PPDB online

Formulir pendaftaran 4 langkah ada di `/ppdb#daftar`. Pendaftar mendapat nomor pendaftaran
(dibuat server, tidak bisa ganda) dan bisa cek status dengan nomor + tanggal lahir anak. Panitia (Tata Usaha & Kepala Sekolah)
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

Pesan tersimpan di tabel `chat_pesan`, tanda dibaca di `chat_dibaca`, dan isi berkas di
`storage/app/private/chat` Laravel. Berkas hanya bisa dibuka anggota percakapannya; dokumen selalu
diunduh (tidak dibuka di browser), dan isi berkas diperiksa sesuai jenisnya (mis. foto harus benar-benar
gambar). Aturan siapa-boleh-chat ada di `src/utils/chat.js` dan `app/Support/ChatSekolah.php` (harus
sama). Pesan baru diambil tiap 3 detik selama halaman chat terbuka. Rekam suara butuh `localhost`
atau HTTPS. Ukuran berkas terbesar mengikuti `php.ini` server (bawaan 2 MB, maks. 25 MB).

## Notifikasi jaringan

`src/components/StatusJaringan.jsx` menampilkan pemberitahuan di bagian atas layar ketika perangkat
**offline**, **server tidak bisa dihubungi**, atau **jaringan kurang stabil** (2 dari 3 pemeriksaan
terakhir lambat > 2,5 detik atau gagal), lalu "Koneksi kembali normal" saat pulih. Pemeriksaan
berupa permintaan kecil ke server setiap 20 detik selama halaman dibuka, ditambah laporan kualitas
jaringan dari browser (Chrome/Android).

**Bilah muat berlogo** (`src/components/BilahMuat.jsx`): kapsul merah-putih bergaris dengan logo
sekolah di ujung isian (logo berayun, cincin berdenyut, kilau berjalan). Muncul hanya bila permintaan
ke server belum selesai setelah 0,8 detik (0,15 detik bila jaringan sudah diketahui lemah), sehingga
di jaringan normal tidak terlihat. Kemajuannya perkiraan (makin pelan mendekati 92%), lalu penuh dan
menghilang saat selesai. Semua permintaan `api()` dihitung lewat `src/utils/muat.js`, kecuali
pemeriksaan berkala di latar belakang yang memakai `api(path, { latar: true })` (versi data, chat,
sesi). Saat aplikasi pertama dibuka, `index.html` menampilkan layar muat awal bergaya sama sampai
React siap.

## Animasi

Tanpa pustaka animasi. Aturannya: hanya `transform`, `opacity`, dan `clip-path` (tata letak & ukuran
komponen tidak berubah), masuk melambat & keluar lebih cepat, dan semuanya mati bila perangkat memakai
pengaturan **kurangi gerakan** (`prefers-reduced-motion`). Token durasi & easing (`--gerak-*`,
`--ease-*`) dan semua kelas animasi ada di `src/styles/_gerak.scss`.

| Bagian | Isi |
|--------|-----|
| `src/utils/gerak.js` | `kurangiGerak()`, `useAnimasiKeluar()` (animasi tutup), `useTerlihat()` (sekali masuk layar), `uraiAngka()` |
| `<Muncul gaya>` (Hiasan.jsx) | muncul saat digulir: naik (bawaan), `kiri`, `kanan`, `skala`, `tirai` (bingkai foto terbuka), `bertahap` (anak berurutan) |
| `<TeksNaik>` | judul halaman muncul kata demi kata (pembaca layar membaca kalimat utuh) |
| `<AngkaNaik>` | angka menghitung naik; nilai akhir tetap di DOM sebagai penahan lebar |
| Efek gulir | `.paralaks` (foto bergerak pelan), `.isi-linimasa`, `.progres-baca` — hanya di peramban yang mendukung animasi berbasis gulir |
| Portal | `.ui-stat`, `.isi-progres`, `.isi-cincin`, grafik tumbuh (`.batang-tumbuh`, `.kolom-tumbuh`, `.garis-tumbuh`), `.ikon-aktif`, `.lencana-pop`, `.lonceng-goyang`, `.bertahap` |

## Keamanan

- **Login di server (Laravel).** Password disimpan bcrypt di tabel `users`; sesi berupa cookie
  HttpOnly yang tidak bisa dibaca atau dipalsukan dari JavaScript, ditambah perlindungan CSRF.
  Lama pemeriksaan sama untuk username yang ada maupun tidak, sehingga username tidak bisa ditebak.
- **Batas percobaan login** (server): 5 kali salah per username & alamat → dikunci 5 menit,
  ditambah batas permintaan per alamat yang longgar (banyak perangkat sekolah bisa berbagi satu alamat).
- **Keluar otomatis** setelah 30 menit tanpa aktivitas (`SESSION_LIFETIME=30`) atau 12 jam sejak
  login (middleware `BatasSesi`); akun yang dinonaktifkan langsung keluar.
- **Content Security Policy** (disisipkan saat build) memblokir skrip sisipan/XSS; header keamanan
  lain (anti-clickjacking, nosniff, Referrer-Policy, Permissions-Policy, HSTS) ada di
  `public/_headers` (Netlify/Cloudflare Pages) dan `vite preview`.
- **Anti-spam formulir publik** (Kontak, PPDB, kunjungan): kolom jebakan bot + batas kirim per
  perangkat. Cek status PPDB/kunjungan dibatasi 10 kali per 10 menit, dan kode kunjungan kini
  6 karakter acak sehingga tidak mudah ditebak.
- **CSV aman**: sel yang diawali `= + - @` dinetralkan agar tidak dijalankan sebagai rumus Excel.
- Peringatan di konsol browser agar pengguna tidak menempelkan kode atas suruhan orang lain.

- **Data sekolah tidak disimpan di browser.** Saat keluar, data pengguna sebelumnya langsung dibuang
  dari memori; data lama versi sebelumnya (`sdhg-data-v3`, `sdhg-chat-v1`, IndexedDB chat) dihapus.

**Batasan yang perlu diketahui:** untuk dipakai sungguhan perlu HTTPS + HSTS dan header yang sama
dengan `public/_headers` di konfigurasi Apache/Nginx, serta menghapus akun demo.

## Status saat ini (frontend)

- Semua data memakai Laravel + MySQL (`src/utils/api.js`, `src/context/DataContext.jsx`,
  `src/context/ChatContext.jsx`, `src/context/AuthContext.jsx`; lihat Backend Laravel & MySQL).
- Data contoh (432 siswa, absensi 20 hari, nilai, SPP, dll.) diisi seeder Laravel dari
  `scripts/data-contoh.js`. Tombol "Reset Data Demo" dihapus karena data kini dipakai bersama;
  untuk mengulang data contoh, kosongkan tabelnya lalu jalankan `php artisan db:seed`.
- Konten sekolah (fasilitas, ekskul, profil sekolah, galeri) masih di `src/data/dummy.js`. Jadwal,
  kalender, biodata guru & staf, data orang tua, dan biodata siswa sudah di database.

## Struktur

```
src/
  components/     Layout, navbar, footer, Situs (komponen halaman publik), komponen UI portal, CrudPage,
                  Spp (pembayaran), Hiasan (animasi muncul & hiasan portal),
                  Grafik, Nilai (rincian & rapor), Presensi (kartu absen staf), Faq, Ikon,
                  DenahKelas (denah gedung kelas), StatusJaringan (notifikasi koneksi), BilahMuat (bilah muat berlogo)
  context/        AuthContext (login), DataContext (data + aksi), ChatContext (chat), akses (jabatan & menu)
  pages/Chat.jsx  Chat untuk semua portal (dimuat terpisah)
  data/dummy.js   Data acuan & konten sekolah (kelas, sesi, mapel, ekskul, fasilitas, PPDB)
  data/foto.js    Daftar foto halaman publik & pemetaannya ke fasilitas, ekskul, berita, galeri
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
                  jadwal & presensi per pelajaran, keamanan (anti-spam, CSV), API server, chat & berkas chat,
                  ringkasan statistik, muat (penghitung permintaan untuk bilah muat)
scripts/          data-contoh.js (data contoh untuk seeder) & ekspor-laravel.mjs (npm run ekspor-laravel)
public/_headers   Header keamanan untuk hosting statis
public/foto/      Foto halaman publik (WebP) + KREDIT.md
```
