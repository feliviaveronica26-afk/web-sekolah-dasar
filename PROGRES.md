# Catatan Progres

Setiap langkah selesai utuh dan bisa langsung didemokan. Akun demo ada di
[sd-app/README.md](sd-app/README.md#akun-demo) dan di tombol isi cepat halaman login.

## Kondisi awal (sampai 16 Oktober 2026)

- Website publik + empat portal (Siswa, Orang Tua, Guru & Staf dengan 9 jabatan, Kepala Sekolah).
- Semua data sekolah tersimpan di MySQL lewat backend Laravel; setiap pengguna hanya menerima data yang
  boleh ia lihat.
- Data & akun guru, staf, dan orang tua di database; akun baru wajib mengganti password awal.

## Langkah 1 — Data & akun siswa (16 Oktober 2026)

**Yang bertambah**
- Biodata siswa di database: NISN, tempat & tanggal lahir, agama, golongan darah, tanggal masuk, asal
  TK/sekolah, dan catatan kesehatan (mis. alergi). Biodata contoh 432 siswa dibuat sesuai usia kelasnya.
- Menu **Data Siswa** (Tata Usaha, Wakasek Kesiswaan, Guru BK, Kepala Sekolah): isi & ubah biodata,
  ringkasan biodata yang belum lengkap, dan siswa dengan catatan kesehatan.
- Akun login untuk setiap siswa (username = NIS), dibuat Tata Usaha per siswa atau sekaligus dengan
  `php artisan akun:buat siswa`; password awal wajib diganti saat pertama login.
- Privasi: biodata hanya untuk pengelola Data Siswa, wali kelasnya, dan siswa/orang tuanya sendiri. Guru
  mapel & staf lain tidak menerimanya; teman sekelas hanya melihat tanggal & bulan ulang tahun.
- Wali kelas melihat catatan kesehatan di daftar kelasnya; orang tua melihat biodata anak di **Data Keluarga**.

**Cara menunjukkan**
1. Login `tu` → **Data Siswa** → cari "Rafa" → ubah catatan kesehatan → tombol kunci untuk membuat akun siswa lain.
2. Login `guru` (wali 4A) → **Daftar Siswa** → catatan kesehatan Rafa tampil di daftar dan detail.
3. Login `siswa` → **Profil Saya** → biodata lengkap; klik teman → kartu teman tanpa data pribadi.
4. Login `ortu` → **Data Keluarga** → biodata Ananda.
5. Login dengan NIS siswa dan password awal dari langkah 1 → diminta membuat password baru.

**Bukti teknis**: migrasi `2026_10_16_000005_add_biodata_to_siswa_table`, `BiodataSiswaSeeder`,
`Akses::lingkupBiodataSiswa`, tes `tests/Feature/SiswaTest.php` (5 tes).

## Perbaikan — Keamanan pembayaran SPP & struk PDF (16 Oktober 2026)

**Yang berubah**
- Tombol "Saya Sudah Bayar" dihapus. Pembayaran QRIS/VA hanya lunas dari notifikasi payment gateway
  bertanda tangan digital (HMAC) dengan nominal yang sama persis, jadi orang tua tidak bisa curang dan
  keuangan sekolah tidak tercatat lunas tanpa uang masuk. Notifikasi palsu ditolak, notifikasi ganda
  tidak tercatat dua kali.
- Halaman pembayaran menunggu konfirmasi dan berubah sendiri menjadi "Pembayaran Berhasil".
- **Simulator Bank** (`/simulasi-bayar`) menggantikan aplikasi bank untuk demo; kode QR kini sungguhan
  dan bisa di-scan HP. Simulator mati di mode produksi.
- Kuitansi: tombol **Cetak Struk** dan **Unduh PDF** terpisah. PDF dibuat server dari data di database.

**Cara menunjukkan**
1. Login `ortu` → **Pembayaran SPP** → Bayar Sekarang → QRIS → tidak ada tombol "Saya Sudah Bayar".
2. Scan QR dengan HP (jalankan `npm run dev:jaringan`, buka website lewat alamat jaringan), atau klik
   "Buka Simulator Bank" → masukkan PIN 6 angka → Bayar.
3. Layar orang tua berubah sendiri menjadi "Pembayaran Berhasil" → Lihat Kuitansi → Cetak Struk / Unduh PDF.

**Bukti teknis**: `PembayaranSpp`, `GatewaySppController`, `KuitansiSpp`, tes `tests/Feature/SppTest.php` (5 tes).

## Langkah 2 — Jadwal, kalender & hari libur dari portal (17 Oktober 2026)

**Yang bertambah**
- Jadwal pelajaran 18 kelas dan kalender akademik pindah dari kode ke database (tabel
  `jadwal_pelajaran` & `kalender`).
- Menu **Jadwal** (Wakasek Kurikulum & Kepala Sekolah): ubah jadwal per kelas lewat kisi hari × jam.
  Satu guru mapel tidak bisa dijadwalkan di dua kelas pada jam yang sama — langsung ditandai di layar dan
  ditolak server. Presensi per pelajaran, jadwal siswa, dan grup chat kelas ikut jadwal baru.
- Menu **Kalender**: tambah/ubah/hapus agenda libur, ujian, dan kegiatan (klik tanggal untuk menambah).
- Agenda **Libur** benar-benar menutup presensi siswa, presensi OTP, presensi staf, dan pemesanan
  kunjungan pada tanggal itu, serta tidak dihitung sebagai hari sekolah di rekap — di website dan server.

**Cara menunjukkan**
1. Login `kurikulum` → **Jadwal** → pilih kelas 4A → **Ubah Jadwal** → tukar dua pelajaran → Simpan.
2. Coba pasang Bahasa Inggris di jam ketika Maria Natalia mengajar kelas lain → peringatan bentrok, ditolak.
3. **Kalender** → klik sebuah tanggal → tambah agenda jenis Libur.
4. Login `siswa` → **Jadwal** & **Kalender** menampilkan perubahan; pada tanggal libur presensi tertutup.

**Bukti teknis**: `JadwalController`, `Waktu::hariSekolah`, `src/utils/acuan.js`, tes
`tests/Feature/JadwalKalenderTest.php` (4 tes).

## Tampilan — Animasi yang lebih hidup (17 Oktober 2026)

**Yang berubah** (tanpa pustaka animasi; hanya geser/pudar/potong sehingga ukuran komponen tidak berubah)
- **Website**: judul halaman muncul kata demi kata, foto kepala halaman & kolase beranda terbuka
  "bertirai", angka (jumlah siswa, guru, prestasi) menghitung naik, judul bagian muncul berurutan saat
  digulir, foto bergerak pelan saat digulir (efek kedalaman), garis linimasa "Sehari di sekolah" terisi
  mengikuti gulir, notifikasi contoh di ponsel masuk satu per satu, bilah progres baca di puncak layar,
  menu HP & tombol kontak beranimasi buka-tutup.
- **Portal**: kartu angka naik berurutan dan angkanya menghitung, batang progres/cincin/grafik tumbuh
  dari nol, ikon menu aktif memantul, lencana angka & lonceng notifikasi bergoyang saat ada yang baru,
  lambaian 👋 di sapaan, pesan password salah bergetar.
- Pengguna yang mematikan animasi di perangkatnya ("kurangi gerakan") melihat semuanya diam.

**Cara menunjukkan**: buka beranda dan gulir pelan sampai bawah; login `siswa` lalu lihat beranda portal.
Untuk membuktikan aksesibilitas, nyalakan *Settings → Accessibility → Visual effects → Animation effects:
Off* (Windows) lalu muat ulang halaman.

**Bukti teknis**: `src/utils/gerak.js` (`useTerlihat`, `uraiAngka`), `src/components/Hiasan.jsx`
(`Muncul`, `AngkaNaik`, `TeksNaik`), `src/styles/_gerak.scss`.

## Tampilan — Seluruh website memakai Bootstrap 5.3 (18–19 Oktober 2026)

**Yang berubah**
- Semua halaman (website publik + portal siswa, orang tua, guru & staf, kepala sekolah) ditulis ulang
  dari Tailwind CSS ke **Bootstrap 5.3** dengan Sass. Komponen Bootstrap yang dipakai: tombol, kartu,
  isian formulir, jendela (modal), tab, lencana, peringatan, bilah progres, menu dropdown, dan menu
  samping HP (offcanvas). Buka-tutupnya diatur React, jadi tidak perlu `bootstrap.js`.
- Tidak ada lagi Tailwind di proyek: paketnya dihapus dari `sd-app` dan `laravel`, dan halaman bawaan
  Laravel (`http://127.0.0.1:8000`) diganti halaman Bootstrap. Satu-satunya tampilan yang tidak memakai
  Bootstrap adalah **kuitansi SPP PDF** (`laravel/resources/views/kuitansi-spp.blade.php`), karena
  pembuat PDF (dompdf) hanya mendukung CSS sederhana.
- Tema Bootstrap disesuaikan dengan identitas sekolah: warna utama merah seragam, kuning stabilo,
  merah marun, huruf Plus Jakarta Sans, tombol pil, kartu bersudut besar. Tampilan & ukuran komponen
  dijaga sama seperti sebelumnya.
- CSS hasil build justru lebih kecil (±136 kB, sebelumnya 145 kB) karena kelas yang tidak dipakai
  dibuang otomatis saat build.

**Cara menunjukkan**: buka `src/styles/` (tema & komponen Bootstrap) dan `src/components/ui.jsx`
(`btn btn-primary`, `card`, `form-control`, `modal`, `nav-pills`); tampilan website tetap seperti biasa.

**Bukti teknis**: `src/styles/main.scss` (urutan impor Bootstrap), `_tema.scss` (variabel), `_utilitas.scss`
(Utility API), pemangkas CSS di `vite.config.js`.

**Pemeriksaan** (19 Oktober 2026)
- 270 tampilan (semua menu 12 peran portal + 13 halaman publik, masing-masing di lebar 1280 px dan 390 px)
  dibandingkan dengan versi sebelumnya. Tinggi halaman portal berselisih paling banyak 1,8%; halaman publik
  paling banyak 3,9% karena memakai kolom `row`/`col` Bootstrap. Tidak ada halaman yang bergulir ke samping,
  elemen yang keluar layar, atau galat di konsol.
- Build produksi berhasil, 110/110 rute tampil, uji Laravel 48/48, dan 13 rangkaian uji browser & API
  lolos semua (616 pemeriksaan, 0 gagal).

## Perbaikan — Siswa baru langsung terhubung ke semua portal (19 Oktober 2026)

**Yang berubah**
- Beranda Wakasek Kesiswaan punya pintasan **Tambah Siswa** (ubin akses cepat dan panel Kesiswaan) yang
  langsung membuka formulir di menu Data Siswa; tanggal masuk otomatis terisi hari ini.
- Siswa yang baru ditambahkan langsung tampil di Daftar Siswa, Presensi Siswa, Input Nilai, Rapor Kelas,
  Poin Sikap, Rekap Kehadiran, Keuangan SPP, Konseling, Perpustakaan, dan beranda Kepala Sekolah, serta
  masuk grup chat kelasnya setelah dibuatkan akun.
- Siswa baru tidak lagi dihitung 0%. Yang belum punya catatan presensi tampil "–" dan tidak ikut rata-rata
  maupun daftar "perlu perhatian". Yang belum punya nilai tidak ikut rata-rata kelas/sekolah dan belum
  diberi peringkat.
- SPP ditagih mulai bulan masuk. Bulan sebelumnya tampil "Belum Terdaftar" dan ditolak server bila
  dibayar. Siswa yang masuk setelah tanggal 10 membayar bulan pertamanya paling lambat tanggal 10 bulan
  berikutnya.
- Wali kelas mendapat pemberitahuan "Siswa baru di kelas …" di beranda dan tanda **Baru** di Daftar Siswa.
- Tata Usaha melihat panel "Data siswa perlu dilengkapi" di beranda dan daftarnya di Data Orang Tua.
  Tombol **Lengkapi** membuka formulir keluarga yang sudah berisi NIS siswa itu. Kepala Sekolah melihatnya
  di "Hal yang perlu perhatian".

**Cara menunjukkan**
1. Login `kesiswaan` → Beranda → **Tambah Siswa** → isi NIS, nama, kelas 4A, jenis kelamin, dan nama
   orang tua → Simpan.
2. Login `guru` (wali 4A) → beranda menampilkan siswa baru; di Daftar Siswa bertanda Baru; Presensi Siswa
   dan Input Nilai sudah memuatnya.
3. Login `tu` → beranda "Data siswa perlu dilengkapi" → **Lengkapi** → isi data ibu/ayah → Simpan.
   **Keuangan SPP** → siswa baru hanya ditagih mulai bulan ini. **Data Siswa** → tombol kunci membuat akun
   login siswa.
4. Login Kepala Sekolah → Total siswa bertambah dengan keterangan "1 siswa baru".

**Bukti teknis**: `src/utils/ringkasan.js` (`rataHadir`, `siswaTanpaKeluarga`, `siswaBaru`),
`src/utils/spp.js` (`statusSpp`, `jatuhTempoSiswa`), `SppController::tolakSebelumMasuk`,
`Rapor::peringkat`, tes `SiswaTest` & `SppTest` (2 tes baru; uji Laravel 50/50).

## Rencana berikutnya

| # | Langkah |
|---|---------|
| 3 | Konten website (profil, fasilitas, galeri, ekskul) dikelola dari portal |
| 4 | Tahun ajaran & semester, kenaikan kelas, kelulusan |
| 5 | Notifikasi di semua portal |
| 6 | Unggah berkas izin & PPDB; pendaftar diterima otomatis menjadi siswa |
| 7 | SPP lengkap: bukti bayar → verifikasi → kuitansi PDF |
| 8 | Pengumpulan & penilaian tugas |
| 9 | Rapor Kurikulum Merdeka PDF |
| 10 | Laporan Kepala Sekolah (PDF/Excel) & riwayat perubahan |
