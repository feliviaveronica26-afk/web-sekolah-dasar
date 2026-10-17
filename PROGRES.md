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

## Rencana berikutnya

| # | Langkah |
|---|---------|
| 2 | Jadwal pelajaran, kalender, dan hari libur bisa diedit Wakasek Kurikulum |
| 3 | Konten website (profil, fasilitas, galeri, ekskul) dikelola dari portal |
| 4 | Tahun ajaran & semester, kenaikan kelas, kelulusan |
| 5 | Notifikasi di semua portal |
| 6 | Unggah berkas izin & PPDB; pendaftar diterima otomatis menjadi siswa |
| 7 | SPP lengkap: bukti bayar → verifikasi → kuitansi PDF |
| 8 | Pengumpulan & penilaian tugas |
| 9 | Rapor Kurikulum Merdeka PDF |
| 10 | Laporan Kepala Sekolah (PDF/Excel) & riwayat perubahan |
