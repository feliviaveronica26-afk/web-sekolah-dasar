// Data contoh (dummy). Nanti diganti dengan data dari backend/API.
import { toKey } from '../utils/format'

export const SEKOLAH = {
  nama: 'SD Harapan Gemilang',
  slogan: 'Cerdas, Berkarakter, dan Gemilang',
  deskripsi:
    'Sekolah dasar yang menumbuhkan anak-anak cerdas, berakhlak mulia, dan percaya diri melalui pembelajaran yang menyenangkan dan bermakna.',
  npsn: '20123456',
  akreditasi: 'A (Unggul)',
  tahunBerdiri: 2005,
  status: 'Swasta',
  kurikulum: 'Kurikulum Merdeka',
  alamat: 'Jl. Merdeka No. 45, Kel. Sukamaju, Kota Harapan 12345',
  telepon: '(021) 555-0145',
  whatsapp: '0812-3456-7890',
  email: 'info@sdharapangemilang.sch.id',
  jamOperasional: 'Senin – Jumat, 07.00 – 14.00 WIB',
  kepalaSekolah: 'Dra. Siti Rahmawati, M.Pd.',
  instagram: '@sdharapangemilang',
  youtube: 'SD Harapan Gemilang',
  facebook: 'SD Harapan Gemilang',
  maksSiswaPerKelas: 28,
  sambutan:
    'Selamat datang di website SD Harapan Gemilang. Kami percaya setiap anak memiliki potensi luar biasa. Melalui kerja sama yang erat antara sekolah dan orang tua, kami berkomitmen mendampingi putra-putri Bapak/Ibu tumbuh menjadi pribadi yang cerdas, berkarakter, dan siap meraih masa depan yang gemilang.',
  visi: 'Terwujudnya peserta didik yang beriman, cerdas, berkarakter, dan peduli lingkungan.',
  misi: [
    'Menanamkan nilai keimanan dan akhlak mulia dalam kegiatan sehari-hari.',
    'Menyelenggarakan pembelajaran aktif, kreatif, dan menyenangkan.',
    'Mengembangkan bakat dan minat siswa melalui kegiatan ekstrakurikuler.',
    'Membiasakan budaya literasi, numerasi, dan pemanfaatan teknologi.',
    'Menjalin kemitraan yang erat antara sekolah, orang tua, dan masyarakat.',
  ],
  sejarah:
    'SD Harapan Gemilang didirikan pada tahun 2005 oleh Yayasan Harapan Bangsa dengan 3 ruang kelas dan 45 siswa. Berkat dukungan orang tua dan masyarakat, kini sekolah telah berkembang menjadi 18 rombongan belajar dengan fasilitas yang lengkap serta meraih akreditasi A (Unggul).',
}

export const STATISTIK = [
  { label: 'Siswa Aktif', nilai: '432' },
  { label: 'Guru & Staf', nilai: '32' },
  { label: 'Rombongan Belajar', nilai: '18' },
  { label: 'Tahun Berpengalaman', nilai: '21' },
]

// Nilai-nilai karakter sekolah (akronim GEMILANG, ditampilkan di Profil)
export const KARAKTER = [
  { huruf: 'G', nama: 'Gemar Belajar', desc: 'Rasa ingin tahu dijaga lewat pembelajaran yang menyenangkan.' },
  { huruf: 'E', nama: 'Empati', desc: 'Peduli dan mau menolong teman, guru, dan lingkungan.' },
  { huruf: 'M', nama: 'Mandiri', desc: 'Terbiasa merapikan barang dan menyelesaikan tugas sendiri.' },
  { huruf: 'I', nama: 'Integritas', desc: 'Jujur dalam ujian, permainan, dan keseharian.' },
  { huruf: 'L', nama: 'Lestari', desc: 'Cinta lingkungan: hemat air, pilah sampah, rawat tanaman.' },
  { huruf: 'A', nama: 'Akhlak Mulia', desc: 'Santun, beriman, dan menghormati perbedaan.' },
  { huruf: 'N', nama: 'Nasionalis', desc: 'Bangga menjadi anak Indonesia dan cinta budaya bangsa.' },
  { huruf: 'G', nama: 'Gigih', desc: 'Pantang menyerah ketika menghadapi tantangan.' },
]

// Alasan memilih sekolah. `ikon` dipetakan ke ikon di halaman.
export const KEUNGGULAN = [
  { ikon: 'kelas', judul: 'Kelas Kecil, Perhatian Besar', desc: 'Maksimal 28 siswa per kelas. Kelas 1 – 2 didampingi guru pendamping sehingga setiap anak terpantau.' },
  { ikon: 'kurikulum', judul: 'Kurikulum Merdeka', desc: 'Belajar aktif berbasis proyek (P5) dengan asesmen yang menghargai proses, bukan sekadar hafalan.' },
  { ikon: 'bahasa', judul: 'Literasi & Bilingual', desc: '15 menit membaca setiap pagi dan English Day setiap Kamis sejak kelas 1.' },
  { ikon: 'robot', judul: 'Sains & Teknologi', desc: 'Lab komputer, coding, dan robotik sejak kelas 3. Juara 1 Lomba Robotik tingkat kota 2026.' },
  { ikon: 'hati', judul: 'Akhlak & Karakter', desc: 'Doa pagi bersama, ibadah sesuai agama masing-masing, dan nilai GEMILANG yang dihidupkan dalam keseharian.' },
  { ikon: 'perisai', judul: 'Aman & Terhubung', desc: 'CCTV, satpam, buku tamu digital, dan portal orang tua untuk memantau anak setiap hari.' },
]

// Program dibagi per jenjang agar orang tua langsung menemukan yang sesuai usia anak
export const JENJANG = [
  {
    id: 'bawah',
    nama: 'Kelas Bawah',
    kelas: 'Kelas 1 – 3',
    usia: 'Usia 6 – 9 tahun',
    fokus: 'Membangun fondasi belajar yang kuat dan menyenangkan',
    poin: [
      'Membaca, menulis, berhitung lewat permainan & lagu',
      'Pembiasaan karakter: antre, merapikan, berbagi',
      'Guru pendamping di kelas 1 – 2',
      'Fonik bahasa Inggris & cerita bergambar',
    ],
  },
  {
    id: 'atas',
    nama: 'Kelas Atas',
    kelas: 'Kelas 4 – 6',
    usia: 'Usia 9 – 12 tahun',
    fokus: 'Menguatkan nalar, kreativitas, dan kepemimpinan',
    poin: [
      'Proyek P5 dengan presentasi di depan orang tua',
      'Informatika, coding, dan robotik',
      'Pendampingan Asesmen Nasional & OSN',
      'Pramuka Siaga/Penggalang & Dokter Kecil',
    ],
  },
]

// Gambaran satu hari di sekolah
export const SEHARI = [
  { jam: '06.30', judul: 'Sambutan pagi', desc: 'Guru piket menyambut di gerbang dengan salam, senyum, dan sapa.', ikon: 'matahari' },
  { jam: '07.00', judul: 'Doa & literasi', desc: 'Doa bersama lalu 15 menit membaca buku pilihan sendiri.', ikon: 'buku' },
  { jam: '07.15', judul: 'Belajar aktif', desc: 'Diskusi, eksperimen, dan permainan edukatif di kelas.', ikon: 'ide' },
  { jam: '09.20', judul: 'Istirahat & bekal sehat', desc: 'Makan bekal bersama, bermain di lapangan dan taman.', ikon: 'apel' },
  { jam: '09.40', judul: 'Proyek & kolaborasi', desc: 'Kerja kelompok P5, praktik di lab, atau olahraga.', ikon: 'puzzle' },
  { jam: '12.00', judul: 'Pulang & ekstrakurikuler', desc: 'Siswa dijemput di area drop-off; ekskul dimulai pukul 13.00.', ikon: 'bola' },
]

export const TESTIMONI = [
  {
    nama: 'Dewi Lestari',
    peran: 'Ibu dari Rafa, Kelas 4A',
    isi: 'Portal orang tuanya sangat membantu. Saya bisa tahu Rafa sudah sampai sekolah, nilai tugasnya, sampai bayar SPP tanpa harus antre.',
  },
  {
    nama: 'Ahmad Ramadhan',
    peran: 'Ayah dari Aisyah, Kelas 4A',
    isi: 'Aisyah jadi suka membaca sejak ikut program literasi pagi. Gurunya sabar dan rutin memberi kabar perkembangan.',
  },
  {
    nama: 'Endang Sulastri',
    peran: 'Ibu dari Tegar, Kelas 6A',
    isi: 'Anak saya ikut robotik dan sekarang bercita-cita jadi insinyur. Sekolah memberi ruang untuk minatnya berkembang.',
  },
  {
    nama: 'Fikri Hidayat',
    peran: 'Ayah dari Naura, Kelas 1A',
    isi: 'Masa adaptasi kelas 1 didampingi dengan baik. Naura senang berangkat sekolah setiap hari.',
  },
]

export const PRESTASI = [
  { tahun: 2026, judul: 'Juara 1 Lomba Robotik', tingkat: 'Kota', oleh: 'Tim Robotik (Tegar & Yoga, 6A)', bidang: 'Sains' },
  { tahun: 2026, judul: 'Juara 2 OSN Matematika', tingkat: 'Kecamatan', oleh: 'Vania Anindita, 6A', bidang: 'Akademik' },
  { tahun: 2026, judul: 'Medali Emas FLS2N Tari Kreasi', tingkat: 'Kota', oleh: 'Sanggar Tari Gemilang', bidang: 'Seni' },
  { tahun: 2025, judul: 'Sekolah Adiwiyata', tingkat: 'Kota', oleh: 'SD Harapan Gemilang', bidang: 'Lingkungan' },
  { tahun: 2025, judul: 'Juara 1 Futsal Antar-SD', tingkat: 'Kecamatan', oleh: 'Tim Futsal Putra', bidang: 'Olahraga' },
  { tahun: 2025, judul: 'Juara 1 MTQ Tilawah Anak', tingkat: 'Kecamatan', oleh: 'Hafiz Maulana, 4A', bidang: 'Keagamaan' },
  { tahun: 2025, judul: 'Juara 3 Lomba Mewarnai', tingkat: 'Provinsi', oleh: 'Kirana Larasati, 4A', bidang: 'Seni' },
  { tahun: 2024, judul: 'Juara 2 English Storytelling', tingkat: 'Kota', oleh: 'Elena Maharani, 4A', bidang: 'Bahasa' },
]

// Rincian biaya pendidikan (ditampilkan transparan di halaman PPDB)
export const BIAYA = {
  tahunAjaran: '2027/2028',
  rincian: [
    { nama: 'Uang pangkal', nominal: 7500000, ket: 'Sekali bayar, bisa dicicil 3 kali' },
    { nama: 'SPP bulanan', nominal: 350000, ket: 'Dibayar tiap bulan lewat QRIS / Virtual Account' },
    { nama: 'Seragam (5 stel)', nominal: 1250000, ket: 'Merah putih, batik, pramuka, olahraga, dan baju muslim/bebas rapi' },
    { nama: 'Buku & kegiatan', nominal: 1800000, ket: 'Per tahun: buku paket, proyek P5, field trip, dan asuransi' },
  ],
  keringanan: [
    'Potongan 10% uang pangkal untuk saudara kandung',
    'Beasiswa untuk calon siswa jalur Prestasi',
    'Keringanan bagi keluarga kurang mampu (dengan surat keterangan)',
  ],
}

export const FAQ = [
  { t: 'Berapa usia minimal masuk kelas 1?', j: 'Minimal 6 tahun pada 1 Juli 2027. Usia dihitung otomatis saat mengisi formulir PPDB online.' },
  { t: 'Apakah ada tes membaca, menulis, dan berhitung?', j: 'Tidak. Calon siswa mengikuti observasi kesiapan sekolah yang santai, dan orang tua diwawancarai untuk mengenal kebutuhan anak.' },
  { t: 'Berapa jumlah siswa dalam satu kelas?', j: 'Maksimal 28 siswa. Kelas 1 – 2 didampingi guru pendamping selain wali kelas.' },
  { t: 'Bagaimana orang tua memantau perkembangan anak?', j: 'Lewat Portal Orang Tua: kehadiran harian, nilai, tugas, catatan sikap, pesan ke wali kelas, dan pembayaran SPP.' },
  { t: 'Apakah SPP bisa dibayar online?', j: 'Bisa, melalui QRIS atau Virtual Account BCA, BRI, Mandiri, dan BNI. Pembayaran tunai tetap diterima di Tata Usaha.' },
  { t: 'Apakah sekolah menyediakan makan siang?', j: 'Tersedia kantin sehat yang diawasi sekolah. Kami tetap menganjurkan bekal dari rumah.' },
  { t: 'Bolehkah berkunjung sebelum mendaftar?', j: 'Tentu! Jadwalkan kunjungan sekolah di halaman Fasilitas, lalu tunjukkan kode booking kepada satpam saat tiba.' },
  { t: 'Bagaimana keamanan anak di sekolah?', j: 'Gerbang dijaga satpam, setiap tamu dicatat di buku tamu digital, dan area sekolah dipantau CCTV.' },
]

// Kelas 1–6, masing-masing tiga rombongan belajar (A, B, C)
export const PARALEL = ['A', 'B', 'C']
export const KELAS = [1, 2, 3, 4, 5, 6].flatMap((tingkat) => PARALEL.map((p) => `${tingkat}${p}`))

// Fasilitas sekolah. `denah` = posisi di denah interaktif (persen dari lebar 100 × tinggi 70).
// Foto asli bisa ditambahkan nanti di folder public/fasilitas/.
export const FASILITAS = [
  {
    id: 'ruang-kelas',
    nama: 'Ruang Kelas',
    ikon: 'kelas',
    ringkas: '18 ruang kelas yang terang, bersih, dan nyaman untuk belajar.',
    deskripsi:
      'Setiap ruang kelas dirancang agar anak belajar dengan nyaman: ventilasi dan pencahayaan alami yang baik, meja-kursi sesuai ukuran anak, serta dinding yang dipenuhi hasil karya siswa. Satu kelas berisi maksimal 28 siswa agar guru dapat memperhatikan setiap anak.',
    fitur: ['Proyektor & layar di setiap kelas', 'Pojok baca kelas', 'Loker penyimpanan siswa', 'Kipas angin & ventilasi silang'],
    kegiatan: ['Kegiatan belajar mengajar harian', 'Literasi pagi 15 menit', 'Pameran karya siswa akhir semester'],
    lokasi: 'Gedung Kelas, lantai 1 – 2',
    jam: 'Senin – Jumat, 07.00 – 12.00',
    kapasitas: '28 siswa per kelas',
    foto: ['Suasana belajar kelompok', 'Pojok baca kelas', 'Pameran karya siswa'],
    denah: { x: 2, y: 3, w: 40, h: 24 },
  },
  {
    id: 'perpustakaan',
    nama: 'Perpustakaan',
    ikon: 'buku',
    ringkas: 'Lebih dari 3.000 koleksi buku cerita, pengetahuan, dan pelajaran.',
    deskripsi:
      'Perpustakaan menjadi pusat budaya literasi sekolah. Area baca lesehan yang nyaman membuat anak betah berlama-lama membaca. Siswa dapat meminjam hingga 2 buku selama 7 hari dan peminjaman tercatat secara digital.',
    fitur: ['3.000+ koleksi buku', 'Area baca lesehan', 'Peminjaman tercatat digital', 'Pojok buku cerita bergambar'],
    kegiatan: ['Mendongeng setiap Jumat', 'Tantangan membaca bulanan', 'Kunjungan kelas terjadwal'],
    lokasi: 'Gedung Kelas, lantai 1',
    jam: 'Senin – Jumat, 07.00 – 14.00',
    kapasitas: '40 pengunjung',
    foto: ['Rak koleksi buku', 'Area baca lesehan', 'Kegiatan mendongeng'],
    denah: { x: 2, y: 30, w: 19, h: 16 },
  },
  {
    id: 'lab-komputer',
    nama: 'Lab Komputer',
    ikon: 'komputer',
    ringkas: '25 unit komputer untuk belajar informatika, coding, dan robotik.',
    deskripsi:
      'Lab komputer digunakan untuk pelajaran Informatika dan ekstrakurikuler Robotik. Siswa belajar mengetik, mengenal internet yang aman, hingga dasar pemrograman dengan cara yang menyenangkan.',
    fitur: ['25 unit komputer', 'Internet dengan filter konten anak', 'Kit robotik edukasi', 'Layar interaktif'],
    kegiatan: ['Pelajaran Informatika', 'Ekstrakurikuler Robotik', 'Persiapan lomba coding'],
    lokasi: 'Gedung Kelas, lantai 2',
    jam: 'Sesuai jadwal pelajaran',
    kapasitas: '28 siswa',
    foto: ['Praktik di lab', 'Tim robotik berlatih', 'Belajar coding'],
    denah: { x: 23, y: 30, w: 19, h: 16 },
  },
  {
    id: 'lapangan',
    nama: 'Lapangan Olahraga',
    ikon: 'lapangan',
    ringkas: 'Lapangan serbaguna untuk upacara, olahraga, dan kegiatan besar.',
    deskripsi:
      'Lapangan serbaguna di tengah sekolah digunakan untuk upacara bendera setiap Senin, pelajaran PJOK, senam pagi, serta latihan futsal dan bulu tangkis. Area ini juga menjadi tempat pentas seni dan peringatan hari besar.',
    fitur: ['Lapangan futsal & bulu tangkis', 'Tiang bendera & area upacara', 'Tribun penonton kecil', 'Gudang alat olahraga'],
    kegiatan: ['Upacara bendera setiap Senin', 'Senam pagi setiap Jumat', 'Latihan futsal & pramuka'],
    lokasi: 'Area tengah sekolah',
    jam: 'Senin – Jumat, 07.00 – 15.00',
    kapasitas: '500 orang',
    foto: ['Upacara hari Senin', 'Pelajaran PJOK', 'Turnamen futsal antar kelas'],
    denah: { x: 45, y: 3, w: 30, h: 40 },
  },
  {
    id: 'ruang-ibadah',
    nama: 'Ruang Ibadah',
    ikon: 'ibadah',
    ringkas: 'Ruang ibadah untuk semua agama yang bersih, tenang, dan nyaman.',
    deskripsi:
      'Sekolah menyediakan mushola dengan tempat wudhu terpisah serta ruang doa untuk siswa Kristen, Katolik, Hindu, Buddha, dan Konghucu. Ruang ini dipakai untuk ibadah, pelajaran Pendidikan Agama sesuai keyakinan masing-masing siswa, dan persiapan perayaan hari besar keagamaan.',
    fitur: ['Mushola & tempat wudhu terpisah', 'Ruang doa lintas agama', 'Kitab suci & buku doa semua agama', 'Karpet & kursi bersih, nyaman'],
    kegiatan: ['Doa pagi bersama sebelum belajar', 'Pendidikan Agama sesuai keyakinan siswa', 'Perayaan hari besar semua agama'],
    lokasi: 'Sisi timur sekolah',
    jam: 'Senin – Jumat, 07.00 – 14.00',
    kapasitas: '150 orang',
    foto: ['Doa pagi bersama', 'Mushola sekolah', 'Ruang doa lintas agama'],
    denah: { x: 78, y: 3, w: 20, h: 20 },
  },
  {
    id: 'uks',
    nama: 'UKS',
    ikon: 'uks',
    ringkas: 'Unit Kesehatan Sekolah dengan petugas dan perlengkapan P3K.',
    deskripsi:
      'UKS siap menangani siswa yang sakit atau cedera ringan selama di sekolah. Bekerja sama dengan Puskesmas Sukamaju, UKS rutin mengadakan pemeriksaan kesehatan, imunisasi, dan penyuluhan hidup sehat.',
    fitur: ['4 tempat tidur', 'Perlengkapan P3K lengkap', 'Petugas UKS terlatih', 'Timbangan & alat ukur tinggi badan'],
    kegiatan: ['Pemeriksaan kesehatan berkala', 'Program dokter kecil', 'Penyuluhan cuci tangan & gizi'],
    lokasi: 'Sisi timur, sebelah ruang ibadah',
    jam: 'Senin – Jumat, 07.00 – 13.00',
    kapasitas: '4 tempat tidur',
    foto: ['Ruang istirahat', 'Pemeriksaan kesehatan', 'Dokter kecil bertugas'],
    denah: { x: 78, y: 26, w: 20, h: 14 },
  },
  {
    id: 'kantin',
    nama: 'Kantin Sehat',
    ikon: 'kantin',
    ringkas: 'Jajanan bergizi tanpa pewarna dan pengawet berbahaya.',
    deskripsi:
      'Kantin sehat menyediakan makanan dan minuman bergizi yang diawasi sekolah. Semua penjual telah mengikuti pelatihan keamanan pangan, dan tersedia wastafel cuci tangan di depan kantin.',
    fitur: ['Menu bergizi diawasi sekolah', 'Tanpa pewarna & pengawet berbahaya', 'Wastafel cuci tangan', 'Area makan beratap'],
    kegiatan: ['Makan bersama saat istirahat', 'Hari buah setiap Rabu', 'Edukasi jajanan sehat'],
    lokasi: 'Sisi timur, dekat gerbang samping',
    jam: 'Senin – Jumat, 07.00 – 12.30',
    kapasitas: '80 tempat duduk',
    foto: ['Area makan', 'Menu sehat harian', 'Antre cuci tangan'],
    denah: { x: 78, y: 43, w: 20, h: 25 },
  },
  {
    id: 'taman',
    nama: 'Taman & Kebun Sekolah',
    ikon: 'taman',
    ringkas: 'Taman bermain yang aman dan kebun untuk belajar menanam.',
    deskripsi:
      'Taman bermain dilengkapi wahana yang aman untuk anak, sementara kebun sekolah menjadi laboratorium alam tempat siswa belajar menanam sayur, merawat tanaman, dan mengenal lingkungan.',
    fitur: ['Ayunan, perosotan & jungkat-jungkit', 'Lantai karet pengaman', 'Kebun sayur & green house', 'Kolam ikan kecil'],
    kegiatan: ['Bermain saat istirahat', 'Praktik IPAS menanam', 'Jumat bersih & hijau'],
    lokasi: 'Bagian selatan sekolah',
    jam: 'Senin – Jumat, 07.00 – 14.00',
    kapasitas: '60 anak',
    foto: ['Taman bermain', 'Kebun sayur siswa', 'Praktik menanam'],
    denah: { x: 45, y: 46, w: 30, h: 22 },
  },
]

// Area di denah yang bukan fasilitas untuk dikunjungi
export const DENAH_LAIN = [
  { nama: 'Kantor Guru & TU', denah: { x: 2, y: 49, w: 40, h: 10 } },
  { nama: 'Gerbang Utama', denah: { x: 2, y: 62, w: 18, h: 6 }, gerbang: true },
]

// Jadwal kunjungan sekolah untuk umum (calon orang tua murid, mitra, dll.)
export const KUNJUNGAN = {
  sesi: ['09.00 – 10.00', '10.30 – 11.30', '13.00 – 14.00'],
  kuotaPerSesi: 2, // jumlah rombongan per sesi
  maksOrang: 10,
  keperluan: ['Calon orang tua murid (PPDB)', 'Orang tua siswa', 'Instansi / mitra sekolah', 'Lainnya'],
}

// Ekstrakurikuler. Siswa boleh memilih maksimal MAKS_EKSKUL kegiatan pilihan;
// `wajib` diikuti otomatis oleh siswa dengan kelas >= minKelas.
export const EKSKUL = [
  { id: 'pramuka', minKelas: 3, wajib: true, nama: 'Pramuka', ikon: 'tenda', hari: 'Jumat', jam: '10.50 – 12.00', pembina: 'Kak Rudi Hartono', untuk: 'Wajib kelas 3 – 6', warna: 'bg-yellow-100 text-yellow-800', desc: 'Belajar tali-temali, baris-berbaris, dan kemandirian lewat kegiatan Siaga & Penggalang.' },
  { id: 'robotik', minKelas: 3, nama: 'Robotik', ikon: 'robot', hari: 'Selasa', jam: '13.00 – 14.30', pembina: 'Hendra Wijaya, S.Kom.', untuk: 'Kelas 3 – 6', warna: 'bg-cyan-100 text-cyan-800', desc: 'Merakit dan memprogram robot sederhana. Juara 1 tingkat kota 2026.' },
  { id: 'futsal', minKelas: 3, nama: 'Futsal', ikon: 'bola', hari: 'Kamis', jam: '13.00 – 14.30', pembina: 'Budi Santoso, S.Pd.', untuk: 'Kelas 3 – 6', warna: 'bg-lime-100 text-lime-800', desc: 'Melatih kerja sama tim, sportivitas, dan kebugaran.' },
  { id: 'tari', minKelas: 1, nama: 'Tari Tradisional', ikon: 'musik', hari: 'Selasa', jam: '13.00 – 14.30', pembina: 'Ayu Pratiwi, S.Sn.', untuk: 'Kelas 1 – 6', warna: 'bg-fuchsia-100 text-fuchsia-800', desc: 'Mengenal tari daerah Nusantara dan tampil di pentas seni sekolah.' },
  { id: 'paduan-suara', minKelas: 2, nama: 'Paduan Suara', ikon: 'mik', hari: 'Rabu', jam: '13.00 – 14.00', pembina: 'Maria Natalia, S.Pd.', untuk: 'Kelas 2 – 6', warna: 'bg-violet-100 text-violet-800', desc: 'Bernyanyi lagu nasional dan daerah dengan teknik vokal yang benar.' },
  { id: 'melukis', minKelas: 1, nama: 'Melukis', ikon: 'kuas', hari: 'Rabu', jam: '13.00 – 14.30', pembina: 'Sinta Dewi, S.Pd.', untuk: 'Kelas 1 – 6', warna: 'bg-orange-100 text-orange-800', desc: 'Menggambar dan mewarnai dengan berbagai media: krayon, cat air, dan kolase.' },
  { id: 'tahfidz', minKelas: 1, nama: 'Tahfidz', ikon: 'buku', hari: 'Senin & Kamis', jam: '12.15 – 13.00', pembina: 'Nur Aisyah, S.Pd.I.', untuk: 'Kelas 1 – 6', warna: 'bg-teal-100 text-teal-800', desc: 'Menghafal juz 30 dengan metode yang menyenangkan dan bertahap.' },
  { id: 'bulutangkis', minKelas: 3, nama: 'Bulu Tangkis', ikon: 'raket', hari: 'Senin', jam: '13.00 – 14.30', pembina: 'Pelatih PB Harapan', untuk: 'Kelas 3 – 6', warna: 'bg-sky-100 text-sky-800', desc: 'Teknik dasar servis, smash, dan footwork bersama pelatih klub.' },
  { id: 'english', minKelas: 3, nama: 'English Club', ikon: 'bahasa', hari: 'Kamis', jam: '13.00 – 14.00', pembina: 'Maria Natalia, S.Pd.', untuk: 'Kelas 3 – 6', warna: 'bg-indigo-100 text-indigo-800', desc: 'Storytelling, spelling bee, dan permainan bahasa Inggris.' },
]
export const MAKS_EKSKUL = 2

// Kategori poin sikap (apresiasi & catatan perbaikan) yang diberikan guru
export const SIKAP = {
  positif: [
    { kode: 'disiplin', label: 'Disiplin', emoji: '⏰', poin: 1 },
    { kode: 'membantu', label: 'Membantu teman', emoji: '🤝', poin: 2 },
    { kode: 'aktif', label: 'Aktif bertanya', emoji: '🙋', poin: 1 },
    { kode: 'kerjasama', label: 'Kerja sama', emoji: '🧩', poin: 1 },
    { kode: 'jujur', label: 'Jujur', emoji: '💎', poin: 2 },
    { kode: 'kreatif', label: 'Kreatif', emoji: '🎨', poin: 1 },
    { kode: 'bersih', label: 'Menjaga kebersihan', emoji: '🌱', poin: 1 },
  ],
  perbaikan: [
    { kode: 'terlambat', label: 'Terlambat datang', emoji: '🐢', poin: -1 },
    { kode: 'pr', label: 'Tidak mengerjakan PR', emoji: '📕', poin: -1 },
    { kode: 'ganggu', label: 'Mengganggu teman', emoji: '🙊', poin: -1 },
    { kode: 'lupa', label: 'Lupa membawa perlengkapan', emoji: '🎒', poin: -1 },
  ],
}
// Semua kategori sikap dalam satu daftar untuk pencarian cepat
export const SEMUA_SIKAP = [...SIKAP.positif, ...SIKAP.perbaikan]

// Mata pelajaran rapor. IPAS & Informatika baru diajarkan mulai kelas 3.
export const MAPEL_RAPOR = ['pancasila', 'agama', 'bindo', 'mtk', 'ipas', 'pjok', 'senbud', 'bing', 'mulok', 'info']
export const KKTP = 75 // Kriteria Ketercapaian Tujuan Pembelajaran

// Guru & staf. `peran` menentukan menu di Portal Guru & Staf (lihat src/context/akses.js),
// `kelas` diisi jika ia wali kelas.
export const GURU_AWAL = [
  { id: 'g1', nama: 'Dra. Siti Rahmawati, M.Pd.', nip: '197203151998032001', jabatan: 'Kepala Sekolah', mapel: '-', peran: [], kelas: '' },
  { id: 'g2', nama: 'Andi Pratama, S.Pd.', nip: '198805122014031002', jabatan: 'Wali Kelas 4A', mapel: 'Guru Kelas', peran: ['wali_kelas'], kelas: '4A' },
  { id: 'g3', nama: 'Rina Marlina, S.Pd.', nip: '199001202015032003', jabatan: 'Wakasek Kurikulum', mapel: 'Guru Kelas 1A', peran: ['wali_kelas', 'wakasek_kurikulum'], kelas: '1A' },
  { id: 'g4', nama: 'Dewi Kartika, S.Pd.', nip: '198707072012032004', jabatan: 'Wali Kelas 6A', mapel: 'Guru Kelas', peran: ['wali_kelas'], kelas: '6A' },
  { id: 'g5', nama: 'Budi Santoso, S.Pd.', nip: '198511302010011005', jabatan: 'Wakasek Kesiswaan', mapel: 'PJOK', peran: ['guru_mapel', 'wakasek_kesiswaan'], kelas: '' },
  { id: 'g6', nama: 'Nur Aisyah, S.Pd.I.', nip: '199203182017032006', jabatan: 'Guru Mapel', mapel: 'Pendidikan Agama', peran: ['guru_mapel'], kelas: '' },
  { id: 'g7', nama: 'Maria Natalia, S.Pd.', nip: '199406252019032007', jabatan: 'Guru Mapel', mapel: 'Bahasa Inggris', peran: ['guru_mapel'], kelas: '' },
  { id: 'g8', nama: 'Hendra Wijaya, S.Kom.', nip: '199109092016011008', jabatan: 'Guru Mapel', mapel: 'Informatika', peran: ['guru_mapel'], kelas: '' },
  { id: 'g9', nama: 'Sri Handayani, S.E.', nip: '', jabatan: 'Kepala Tata Usaha', mapel: '-', peran: ['tata_usaha'], kelas: '' },
  { id: 'g10', nama: 'Yusuf Hidayat, S.IP.', nip: '', jabatan: 'Pustakawan', mapel: '-', peran: ['pustakawan'], kelas: '' },
  { id: 'g11', nama: 'Agus Setiawan, S.T.', nip: '198602142011011011', jabatan: 'Wakasek Sarana & Prasarana', mapel: 'Matematika', peran: ['guru_mapel', 'wakasek_sarpras'], kelas: '' },
  { id: 'g12', nama: 'Laila Fitriani, S.Psi.', nip: '199308112019032012', jabatan: 'Guru BK', mapel: 'Bimbingan Konseling', peran: ['guru_bk'], kelas: '' },
  { id: 'g13', nama: 'Joko Susilo', nip: '', jabatan: 'Satpam', mapel: '-', peran: ['satpam'], kelas: '' },
  ...[
    ['1B', 'Siti Nurhaliza, S.Pd.', 2],
    ['1C', 'Fitri Handayani, S.Pd.', 2],
    ['2A', 'Ahmad Fauzi, S.Pd.', 1],
    ['2B', 'Ratna Kumalasari, S.Pd.', 2],
    ['2C', 'Yulia Rahmawati, S.Pd.', 2],
    ['3A', 'Dedi Kurniawan, S.Pd.', 1],
    ['3B', 'Lestari Wulandari, S.Pd.', 2],
    ['3C', 'Hendro Saputro, S.Pd.', 1],
    ['4B', 'Indah Permatasari, S.Pd.', 2],
    ['4C', 'Wahyu Nugroho, S.Pd.', 1],
    ['5A', 'Novi Anggraeni, S.Pd.', 2],
    ['5B', 'Taufik Hidayat, S.Pd.', 1],
    ['5C', 'Eka Susanti, S.Pd.', 2],
    ['6B', 'Bayu Aji Pamungkas, S.Pd.', 1],
    ['6C', 'Mega Puspitasari, S.Pd.', 2],
  ].map(([kelas, nama, jk], i) => ({
    id: `g${14 + i}`,
    nama,
    // Guru tetap yayasan belum tentu punya NIP
    nip: i % 2 ? '' : `19${88 + (i % 8)}${String(1 + (i % 12)).padStart(2, '0')}${String(3 + i).padStart(2, '0')}20${14 + (i % 8)}0${1 + (i % 9)}${jk}${String(14 + i).padStart(3, '0')}`,
    jabatan: `Wali Kelas ${kelas}`,
    mapel: 'Guru Kelas',
    peran: ['wali_kelas'],
    kelas,
  })),
]

// Pilihan untuk menu Sarana & Prasarana dan Bimbingan Konseling
export const KATEGORI_BARANG = ['Mebel', 'Elektronik', 'Alat Peraga', 'Olahraga', 'Kebersihan', 'Lainnya']
export const KONDISI_BARANG = ['Baik', 'Rusak Ringan', 'Rusak Berat']
export const LOKASI_SEKOLAH = ['Ruang Kelas', 'Perpustakaan', 'Lab Komputer', 'Lapangan Olahraga', 'Ruang Ibadah', 'UKS', 'Kantin Sehat', 'Taman & Kebun Sekolah', 'Kantor Guru & TU', 'Gerbang Utama', 'Toilet', 'Gudang']
export const STATUS_KERUSAKAN = ['Dilaporkan', 'Diperbaiki', 'Selesai']
export const KATEGORI_KONSELING = ['Belajar', 'Pribadi', 'Sosial', 'Karier']
export const LAYANAN_KONSELING = ['Konseling Individu', 'Konseling Kelompok', 'Konsultasi Orang Tua', 'Kunjungan Rumah']
export const STATUS_KONSELING = ['Dalam Proses', 'Perlu Pemantauan', 'Selesai']
export const JENIS_IZIN_STAF = ['Sakit', 'Izin', 'Cuti', 'Dinas Luar']
export const KEPERLUAN_TAMU = ['Bertemu guru/staf', 'Urusan administrasi (TU)', 'Mengantar/menjemput siswa', 'Kunjungan sekolah terjadwal', 'Pengiriman barang', 'Lainnya']

export const INVENTARIS_AWAL = [
  { id: 'inv1', nama: 'Meja siswa', kategori: 'Mebel', lokasi: 'Ruang Kelas', jumlah: 540, kondisi: 'Baik', keterangan: '30 meja × 18 kelas' },
  { id: 'inv2', nama: 'Kursi siswa', kategori: 'Mebel', lokasi: 'Ruang Kelas', jumlah: 540, kondisi: 'Baik', keterangan: '' },
  { id: 'inv3', nama: 'Proyektor LCD', kategori: 'Elektronik', lokasi: 'Ruang Kelas', jumlah: 18, kondisi: 'Rusak Ringan', keterangan: '1 unit lampunya redup (kelas 3B)' },
  { id: 'inv4', nama: 'Komputer siswa', kategori: 'Elektronik', lokasi: 'Lab Komputer', jumlah: 30, kondisi: 'Baik', keterangan: '' },
  { id: 'inv5', nama: 'AC split 1 PK', kategori: 'Elektronik', lokasi: 'Lab Komputer', jumlah: 2, kondisi: 'Rusak Berat', keterangan: '1 unit tidak dingin, kompresor mati' },
  { id: 'inv6', nama: 'Rak buku kayu', kategori: 'Mebel', lokasi: 'Perpustakaan', jumlah: 14, kondisi: 'Baik', keterangan: '' },
  { id: 'inv7', nama: 'Torso anatomi tubuh', kategori: 'Alat Peraga', lokasi: 'Ruang Kelas', jumlah: 2, kondisi: 'Baik', keterangan: 'Dipakai bergantian kelas 4–6' },
  { id: 'inv8', nama: 'Bola futsal', kategori: 'Olahraga', lokasi: 'Gudang', jumlah: 8, kondisi: 'Rusak Ringan', keterangan: '3 bola kempis' },
  { id: 'inv9', nama: 'Tempat tidur UKS', kategori: 'Mebel', lokasi: 'UKS', jumlah: 2, kondisi: 'Baik', keterangan: '' },
  { id: 'inv10', nama: 'CCTV', kategori: 'Elektronik', lokasi: 'Gerbang Utama', jumlah: 6, kondisi: 'Baik', keterangan: 'Terpantau dari pos satpam' },
]

// Pengaturan SPP tahun ajaran berjalan
export const SPP = {
  tahunAjaran: '2026/2027',
  nominal: 350000,
  tanggalJatuhTempo: 10,
  bulan: ['2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03', '2027-04', '2027-05', '2027-06'],
}

export const BANK_VA = [
  { kode: 'bca', nama: 'BCA', prefix: '39012' },
  { kode: 'bri', nama: 'BRI', prefix: '88810' },
  { kode: 'mandiri', nama: 'Mandiri', prefix: '89508' },
  { kode: 'bni', nama: 'BNI', prefix: '98820' },
]

export const BUKU_AWAL = [
  { id: 'b1', judul: 'Si Kancil dan Buaya', penulis: 'Tim Cerita Rakyat', kategori: 'Cerita Rakyat', stok: 4 },
  { id: 'b2', judul: 'Ensiklopedia Hewan Nusantara', penulis: 'Rudi Hartono', kategori: 'Pengetahuan', stok: 2 },
  { id: 'b3', judul: 'Matematika Asyik Kelas 4', penulis: 'Tim Edukasi', kategori: 'Pelajaran', stok: 6 },
  { id: 'b4', judul: 'Petualangan di Hutan Kalimantan', penulis: 'Nadia Putri', kategori: 'Fiksi Anak', stok: 3 },
  { id: 'b5', judul: 'Atlas Indonesia & Dunia', penulis: 'Tim Kartografi', kategori: 'Pengetahuan', stok: 2 },
  { id: 'b6', judul: 'Kumpulan Dongeng Sebelum Tidur', penulis: 'Sari Wulandari', kategori: 'Fiksi Anak', stok: 5 },
  { id: 'b7', judul: 'Mengenal Tata Surya', penulis: 'Agus Prasetyo', kategori: 'Pengetahuan', stok: 3 },
  { id: 'b8', judul: 'Pahlawan-Pahlawan Indonesia', penulis: 'Tim Sejarah', kategori: 'Sejarah', stok: 4 },
  { id: 'b9', judul: 'Belajar Coding untuk Anak', penulis: 'Hendra Wijaya', kategori: 'Pelajaran', stok: 2 },
  { id: 'b10', judul: 'Malin Kundang', penulis: 'Tim Cerita Rakyat', kategori: 'Cerita Rakyat', stok: 3 },
]

const SISWA_4A = [
  ['Rafa Aditya', 'L', 'Dewi Lestari'],
  ['Aisyah Putri Ramadhani', 'P', 'Ahmad Ramadhan'],
  ['Bima Sakti Nugraha', 'L', 'Sri Wahyuni'],
  ['Citra Ayu Lestari', 'P', 'Bambang Susilo'],
  ['Dimas Arya Saputra', 'L', 'Yuliana'],
  ['Elena Maharani', 'P', 'Agus Setiawan'],
  ['Fajar Kurniawan', 'L', 'Ratna Sari'],
  ['Gita Anjani', 'P', 'Hadi Purnomo'],
  ['Hafiz Maulana', 'L', 'Siti Aminah'],
  ['Intan Permatasari', 'P', 'Joko Susanto'],
  ['Joko Prasetyo', 'L', 'Rahmi Fitri'],
  ['Kirana Larasati', 'P', 'Teguh Prakoso'],
]

const SISWA_LAIN = [
  ['230101', 'Naura Azzahra', '1A', 'P', 'Fikri Hidayat'],
  ['230102', 'Raka Pratama', '1A', 'L', 'Lina Marlina'],
  ['230103', 'Salsa Nabila', '1A', 'P', 'Dedi Kurnia'],
  ['230601', 'Tegar Wicaksono', '6A', 'L', 'Endang Sulastri'],
  ['230602', 'Vania Anindita', '6A', 'P', 'Wahyu Hidayat'],
  ['230603', 'Yoga Firmansyah', '6A', 'L', 'Nani Suryani'],
]

// Kelas dilengkapi hingga 24 siswa dengan nama contoh yang dibuat otomatis (selalu sama setiap kali)
export const SISWA_PER_KELAS = 24
const NAMA_SISWA = {
  L: {
    depan: ['Abimanyu', 'Adrian', 'Akbar', 'Alif', 'Andra', 'Arkan', 'Arya', 'Bagas', 'Bayu', 'Danendra', 'Daffa', 'Dzaky', 'Evan', 'Farel', 'Fathan', 'Galang', 'Gibran', 'Haikal', 'Ilham', 'Kenzo', 'Keenan', 'Lutfi', 'Malik', 'Naufal', 'Nizam', 'Raditya', 'Raffi', 'Rizky', 'Satria', 'Zidan', 'Ziyad', 'Rayyan'],
    belakang: ['Pratama', 'Saputra', 'Ramadhan', 'Wijaya', 'Nugroho', 'Kusuma', 'Hidayat', 'Firmansyah', 'Santoso', 'Wibowo', 'Rahman', 'Setiawan', 'Kurniawan', 'Hakim', 'Fauzan', 'Mahendra', 'Prasetya', 'Syahputra'],
  },
  P: {
    depan: ['Adinda', 'Alya', 'Amira', 'Anindya', 'Aqila', 'Azkia', 'Bella', 'Cahaya', 'Callista', 'Dinda', 'Felicia', 'Ghina', 'Hana', 'Inara', 'Jasmine', 'Kayla', 'Keisha', 'Khansa', 'Laras', 'Nadia', 'Nayla', 'Queena', 'Rania', 'Shafa', 'Syifa', 'Tiara', 'Vanya', 'Zahra', 'Mikha', 'Sekar'],
    belakang: ['Putri', 'Maharani', 'Permata', 'Lestari', 'Anggraini', 'Utami', 'Salsabila', 'Puspita', 'Aulia', 'Kirana', 'Ramadhani', 'Safitri', 'Rahmawati', 'Azzahra', 'Kusumawati', 'Pertiwi', 'Andini', 'Wulandari'],
  },
}
const NAMA_ORTU = [
  'Andi Wijaya', 'Rina Susanti', 'Hendra Gunawan', 'Sri Mulyani', 'Bambang Irawan', 'Yanti Kusuma', 'Rahmat Hidayat', 'Dian Puspita', 'Eko Prasetyo', 'Lina Marlina',
  'Fajar Nugraha', 'Nur Hasanah', 'Irwan Setiadi', 'Maya Sari', 'Arif Rahman', 'Tuti Alawiyah', 'Hari Santoso', 'Wulan Sari', 'Rudi Hermawan', 'Ani Rohani',
  'Doni Saputra', 'Evi Kurniasih', 'Yusuf Maulana', 'Ratih Purnama', 'Gunawan Susilo', 'Nurul Aini', 'Slamet Riyadi', 'Fitria Ningsih', 'Taufan Ardiansyah', 'Endah Lestari',
]
const acak = (teks) => {
  let h = 2166136261
  for (const c of teks) {
    h ^= c.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function lengkapiKelas(siswaTetap) {
  const terpakai = new Set(siswaTetap.map((s) => s.nama))
  const hasil = []
  for (const kelas of KELAS) {
    const tingkat = Number(kelas[0])
    const paralel = PARALEL.indexOf(kelas[1]) + 1
    const sudahAda = siswaTetap.filter((s) => s.kelas === kelas).length
    for (let i = sudahAda + 1; i <= SISWA_PER_KELAS; i++) {
      // NIS = tahun masuk (2 digit) + tingkat + paralel + nomor urut, mis. 234213 = masuk 2023, kelas 4B, no. 13
      const nis = `${27 - tingkat}${tingkat}${paralel}${String(i).padStart(2, '0')}`
      const jk = acak(nis + 'jk') % 2 ? 'L' : 'P'
      const { depan, belakang } = NAMA_SISWA[jk]
      let nama
      for (let k = 0; !nama || terpakai.has(nama); k++) {
        const h = acak(`${nis}nama${k}`)
        nama = `${depan[h % depan.length]} ${belakang[(h >>> 8) % belakang.length]}`
      }
      terpakai.add(nama)
      hasil.push({ id: `s${nis}`, nis, nama, kelas, jk, ortu: NAMA_ORTU[acak(nis + 'ortu') % NAMA_ORTU.length] })
    }
  }
  return hasil
}

const SISWA_TETAP = [
  ...SISWA_4A.map(([nama, jk, ortu], i) => {
    const nis = `2304${String(i + 1).padStart(2, '0')}`
    return { id: `s${nis}`, nis, nama, kelas: '4A', jk, ortu }
  }),
  ...SISWA_LAIN.map(([nis, nama, kelas, jk, ortu]) => ({ id: `s${nis}`, nis, nama, kelas, jk, ortu })),
]

export const SISWA_AWAL = [...SISWA_TETAP, ...lengkapiKelas(SISWA_TETAP)]

export const PENGUMUMAN_AWAL = [
  {
    id: 'p1',
    judul: 'Penilaian Tengah Semester Ganjil 2026/2027',
    kategori: 'Akademik',
    tanggal: '2026-10-01',
    isi: 'Penilaian Tengah Semester (PTS) ganjil akan dilaksanakan pada 12–16 Oktober 2026. Siswa diharapkan hadir pukul 07.00 WIB dan membawa alat tulis lengkap. Kisi-kisi dapat dilihat di grup kelas masing-masing.',
  },
  {
    id: 'p2',
    judul: 'Kegiatan Field Trip Kelas 4 ke Museum Nasional',
    kategori: 'Kegiatan',
    tanggal: '2026-09-28',
    isi: 'Siswa kelas 4 akan mengikuti field trip ke Museum Nasional pada Jumat, 23 Oktober 2026. Formulir persetujuan orang tua mohon dikumpulkan paling lambat 16 Oktober 2026 kepada wali kelas.',
  },
  {
    id: 'p3',
    judul: 'Pembukaan PPDB Tahun Ajaran 2027/2028',
    kategori: 'PPDB',
    tanggal: '2026-09-20',
    isi: 'Penerimaan Peserta Didik Baru (PPDB) tahun ajaran 2027/2028 resmi dibuka mulai 1 Oktober 2026. Pendaftaran dapat dilakukan langsung secara online melalui halaman PPDB di website ini.',
  },
  {
    id: 'p4',
    judul: 'Juara 1 Lomba Robotik Tingkat Kota',
    kategori: 'Prestasi',
    tanggal: '2026-09-15',
    isi: 'Selamat kepada tim robotik SD Harapan Gemilang yang berhasil meraih Juara 1 Lomba Robotik Tingkat Kota 2026. Terima kasih atas dukungan Bapak/Ibu orang tua dan para pembina.',
  },
  {
    id: 'p5',
    judul: 'Jadwal Pemeriksaan Kesehatan Gigi Siswa',
    kategori: 'Umum',
    tanggal: '2026-09-08',
    isi: 'Bekerja sama dengan Puskesmas Sukamaju, akan diadakan pemeriksaan kesehatan gigi gratis untuk seluruh siswa pada 14 Oktober 2026 di ruang UKS.',
  },
]

export const KATEGORI_PENGUMUMAN = ['Akademik', 'Kegiatan', 'PPDB', 'Prestasi', 'Umum']

// Galeri kegiatan. Sementara memakai ilustrasi; foto asli bisa ditaruh di public/galeri/
export const GALERI = [
  { id: 1, judul: 'Upacara Hari Senin', kategori: 'Kegiatan', ikon: 'flag', tanggal: '2026-09-28', desc: 'Siswa kelas 6 bertugas sebagai petugas upacara dengan khidmat.' },
  { id: 2, judul: 'Juara Lomba Robotik', kategori: 'Prestasi', ikon: 'trophy', tanggal: '2026-09-12', desc: 'Tim robotik meraih Juara 1 tingkat kota dengan robot pemilah sampah.' },
  { id: 3, judul: 'Belajar di Perpustakaan', kategori: 'Pembelajaran', ikon: 'book', tanggal: '2026-09-22', desc: 'Kegiatan literasi pagi di area baca lesehan perpustakaan.' },
  { id: 4, judul: 'Latihan Pramuka', kategori: 'Ekstrakurikuler', ikon: 'tent', tanggal: '2026-09-25', desc: 'Belajar tali-temali dan membangun tenda dome bersama kakak pembina.' },
  { id: 5, judul: 'Pentas Seni Tari', kategori: 'Ekstrakurikuler', ikon: 'music', tanggal: '2026-08-30', desc: 'Penampilan Tari Jaipong dalam pentas seni akhir bulan.' },
  { id: 6, judul: 'Praktik di Lab Komputer', kategori: 'Pembelajaran', ikon: 'monitor', tanggal: '2026-09-17', desc: 'Kelas 5 belajar membuat animasi sederhana dengan Scratch.' },
  { id: 7, judul: 'Peringatan HUT RI ke-81', kategori: 'Kegiatan', ikon: 'flag', tanggal: '2026-08-17', desc: 'Lomba balap karung, makan kerupuk, dan estafet kelereng.' },
  { id: 8, judul: 'Turnamen Futsal Antar Kelas', kategori: 'Prestasi', ikon: 'trophy', tanggal: '2026-08-21', desc: 'Kelas 5B menjadi juara turnamen futsal antar kelas.' },
  { id: 9, judul: 'Menanam Pohon Bersama', kategori: 'Kegiatan', ikon: 'sprout', tanggal: '2026-09-05', desc: 'Projek P5 Gaya Hidup Berkelanjutan: menanam 50 bibit pohon.' },
  { id: 10, judul: 'Eksperimen Siklus Air', kategori: 'Pembelajaran', ikon: 'flask', tanggal: '2026-09-30', desc: 'Siswa kelas 4 membuat model siklus air dalam toples.' },
  { id: 11, judul: 'Market Day Kelas 6', kategori: 'Kegiatan', ikon: 'store', tanggal: '2026-09-19', desc: 'Belajar berwirausaha dengan menjual kue buatan sendiri.' },
  { id: 12, judul: 'Paduan Suara Hari Guru', kategori: 'Ekstrakurikuler', ikon: 'music', tanggal: '2025-11-25', desc: 'Persembahan lagu "Terima Kasihku" untuk para guru.' },
]

export const PPDB = {
  tahunAjaran: '2027/2028',
  // Usia dihitung pada tanggal ini (awal tahun ajaran baru)
  tanggalAcuanUsia: '2027-07-01',
  usiaMinimal: 6,
  agama: ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'],
  berkas: [
    { id: 'akta', label: 'Akta kelahiran', wajib: true },
    { id: 'kk', label: 'Kartu Keluarga (KK)', wajib: true },
    { id: 'foto', label: 'Pas foto berwarna 3x4', wajib: true },
    { id: 'ktp', label: 'KTP orang tua/wali', wajib: true },
    { id: 'tk', label: 'Surat keterangan lulus TK/PAUD', wajib: false },
    { id: 'prestasi', label: 'Sertifikat prestasi', wajib: false, jalur: 'Prestasi' },
  ],
  jadwal: [
    { tahap: 'Pendaftaran Online', tanggal: '1 Okt 2026 – 31 Jan 2027' },
    { tahap: 'Observasi & Wawancara', tanggal: '8 – 13 Feb 2027' },
    { tahap: 'Pengumuman Hasil', tanggal: '20 Feb 2027' },
    { tahap: 'Daftar Ulang', tanggal: '22 Feb – 6 Mar 2027' },
  ],
  syarat: [
    'Usia minimal 6 tahun pada 1 Juli 2027',
    'Fotokopi akta kelahiran',
    'Fotokopi Kartu Keluarga (KK)',
    'Pas foto berwarna ukuran 3x4 (2 lembar)',
    'Fotokopi KTP kedua orang tua',
    'Surat keterangan lulus TK/PAUD (jika ada)',
  ],
  jalur: [
    { nama: 'Reguler', kuota: 50, ket: 'Terbuka untuk umum sesuai urutan pendaftaran.' },
    { nama: 'Prestasi', kuota: 6, ket: 'Bagi calon siswa dengan prestasi akademik/non-akademik.' },
    { nama: 'Saudara Kandung', kuota: 8, ket: 'Bagi calon siswa yang memiliki kakak di SD Harapan Gemilang.' },
  ],
}

// Mata pelajaran. `absensi: false` = kegiatan yang tidak dihitung dalam absensi per mapel.
export const MAPEL = {
  upacara: { nama: 'Upacara Bendera', guru: 'Semua guru', warna: 'bg-primary-100 text-primary-700', absensi: false },
  senam: { nama: 'Senam Pagi', guru: 'Budi Santoso, S.Pd.', warna: 'bg-lime-100 text-lime-700', absensi: false },
  mtk: { nama: 'Matematika', guru: 'Andi Pratama, S.Pd.', warna: 'bg-sky-100 text-sky-700' },
  bindo: { nama: 'Bahasa Indonesia', guru: 'Andi Pratama, S.Pd.', warna: 'bg-orange-100 text-orange-700' },
  ipas: { nama: 'IPAS', guru: 'Andi Pratama, S.Pd.', warna: 'bg-emerald-100 text-emerald-700' },
  pancasila: { nama: 'Pendidikan Pancasila', guru: 'Andi Pratama, S.Pd.', warna: 'bg-rose-100 text-rose-700' },
  senbud: { nama: 'Seni Budaya', guru: 'Andi Pratama, S.Pd.', warna: 'bg-fuchsia-100 text-fuchsia-700' },
  mulok: { nama: 'Bahasa Daerah', guru: 'Andi Pratama, S.Pd.', warna: 'bg-amber-100 text-amber-700' },
  agama: { nama: 'Pendidikan Agama', guru: 'Nur Aisyah, S.Pd.I.', warna: 'bg-teal-100 text-teal-700' },
  bing: { nama: 'Bahasa Inggris', guru: 'Maria Natalia, S.Pd.', warna: 'bg-indigo-100 text-indigo-700' },
  pjok: { nama: 'PJOK', guru: 'Budi Santoso, S.Pd.', warna: 'bg-lime-100 text-lime-700' },
  info: { nama: 'Informatika', guru: 'Hendra Wijaya, S.Kom.', warna: 'bg-cyan-100 text-cyan-700' },
  pramuka: { nama: 'Pramuka', guru: 'Pembina Pramuka', warna: 'bg-yellow-100 text-yellow-800' },
}

// Pembagian waktu harian (1 sesi = 2 jam pelajaran @35 menit)
export const SESI = [
  { mulai: '07.00', selesai: '08.10' },
  { mulai: '08.10', selesai: '09.20' },
  { mulai: '09.40', selesai: '10.50' },
  { mulai: '10.50', selesai: '12.00' },
]
export const ISTIRAHAT = { mulai: '09.20', selesai: '09.40', setelahSesi: 2 }

// Jam kerja untuk presensi guru & staf: lewat dari `masuk` dihitung terlambat.
// Satpam memakai shift sendiri.
export const JAM_KERJA = {
  umum: { masuk: '06.45', pulang: '14.00' },
  satpam: { masuk: '06.00', pulang: '15.00' },
}

// Jam sekolah (Senin – Jumat). `guru: true` hanya ditampilkan di portal guru.
export const JAM_SEKOLAH = [
  { label: 'Gerbang dibuka', jam: '06.30' },
  { label: 'Guru hadir', jam: JAM_KERJA.umum.masuk, guru: true },
  { label: 'Bel masuk', jam: SESI[0].mulai },
  { label: 'Istirahat', jam: `${ISTIRAHAT.mulai} – ${ISTIRAHAT.selesai}` },
  { label: 'Pulang siswa', jam: SESI[SESI.length - 1].selesai },
  { label: 'Jam kerja guru selesai', jam: JAM_KERJA.umum.pulang, guru: true },
]

// Jadwal pelajaran per kelas (contoh hanya kelas 4A). Isi = kunci MAPEL per sesi.
export const JADWAL = {
  '4A': {
    Senin: ['upacara', 'mtk', 'bindo', 'ipas'],
    Selasa: ['agama', 'mtk', 'bing', 'senbud'],
    Rabu: ['pjok', 'bindo', 'ipas', 'pancasila'],
    Kamis: ['mtk', 'info', 'bindo', 'mulok'],
    Jumat: ['senam', 'agama', 'ipas', 'pramuka'],
  },
}

export const HARI_SEKOLAH = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']

// Kalender akademik 2026/2027. Tanggal libur keagamaan bertanda `perkiraan`
// perlu dicocokkan dengan SKB 3 Menteri yang resmi.
export const KALENDER = [
  { mulai: '2026-07-13', selesai: '2026-07-15', judul: 'Masa Pengenalan Lingkungan Sekolah (MPLS)', jenis: 'kegiatan' },
  { mulai: '2026-08-17', judul: 'HUT Kemerdekaan RI ke-81', jenis: 'libur' },
  { mulai: '2026-08-25', judul: 'Maulid Nabi Muhammad SAW', jenis: 'libur', perkiraan: true },
  { mulai: '2026-10-12', selesai: '2026-10-16', judul: 'Penilaian Tengah Semester (PTS) Ganjil', jenis: 'ujian' },
  { mulai: '2026-10-14', judul: 'Pemeriksaan Kesehatan Gigi', jenis: 'kegiatan' },
  { mulai: '2026-10-23', judul: 'Field Trip Kelas 4 ke Museum Nasional', jenis: 'kegiatan' },
  { mulai: '2026-10-28', judul: 'Upacara Hari Sumpah Pemuda', jenis: 'kegiatan' },
  { mulai: '2026-11-10', judul: 'Upacara Hari Pahlawan', jenis: 'kegiatan' },
  { mulai: '2026-11-25', judul: 'Peringatan Hari Guru Nasional', jenis: 'kegiatan' },
  { mulai: '2026-12-07', selesai: '2026-12-11', judul: 'Penilaian Akhir Semester (PAS) Ganjil', jenis: 'ujian' },
  { mulai: '2026-12-18', judul: 'Pembagian Rapor Semester Ganjil', jenis: 'kegiatan' },
  { mulai: '2026-12-21', selesai: '2027-01-01', judul: 'Libur Semester Ganjil', jenis: 'libur' },
  { mulai: '2026-12-25', judul: 'Hari Raya Natal', jenis: 'libur' },
  { mulai: '2027-01-01', judul: 'Tahun Baru 2027', jenis: 'libur' },
  { mulai: '2027-01-04', judul: 'Hari Pertama Semester Genap', jenis: 'kegiatan' },
  { mulai: '2027-01-05', judul: 'Isra Mikraj Nabi Muhammad SAW', jenis: 'libur', perkiraan: true },
  { mulai: '2027-02-06', judul: 'Tahun Baru Imlek', jenis: 'libur', perkiraan: true },
  { mulai: '2027-03-08', selesai: '2027-03-16', judul: 'Libur Hari Raya Idulfitri', jenis: 'libur', perkiraan: true },
  { mulai: '2027-03-22', selesai: '2027-03-26', judul: 'Penilaian Tengah Semester (PTS) Genap', jenis: 'ujian' },
  { mulai: '2027-03-26', judul: 'Wafat Yesus Kristus', jenis: 'libur' },
  { mulai: '2027-05-06', judul: 'Kenaikan Yesus Kristus', jenis: 'libur' },
  { mulai: '2027-05-17', judul: 'Hari Raya Iduladha', jenis: 'libur', perkiraan: true },
  { mulai: '2027-05-20', judul: 'Hari Raya Waisak', jenis: 'libur', perkiraan: true },
  { mulai: '2027-06-01', judul: 'Hari Lahir Pancasila', jenis: 'libur' },
  { mulai: '2027-06-07', selesai: '2027-06-11', judul: 'Penilaian Akhir Tahun (PAT)', jenis: 'ujian' },
  { mulai: '2027-06-18', judul: 'Pembagian Rapor Kenaikan Kelas', jenis: 'kegiatan' },
  { mulai: '2027-06-21', selesai: '2027-07-09', judul: 'Libur Kenaikan Kelas', jenis: 'libur' },
]

// Tugas/PR awal; guru menambah tugas lewat menu Tugas Kelas.
// Tanggal dihitung relatif dari hari ini supaya demo selalu relevan.
const relatif = (hari) => toKey(new Date(new Date().setDate(new Date().getDate() + hari)))

export const TUGAS_AWAL = [
  { id: 't1', kelas: '4A', mapel: 'mtk', judul: 'Latihan Soal Pecahan', deskripsi: 'Kerjakan buku paket halaman 45 nomor 1–10 di buku tugas.', diberikan: relatif(-2), tenggat: relatif(1) },
  { id: 't2', kelas: '4A', mapel: 'bing', judul: 'Hafalan Kosakata Anggota Tubuh', deskripsi: 'Hafalkan 15 kosakata anggota tubuh dalam bahasa Inggris. Akan ada tes lisan.', diberikan: relatif(-1), tenggat: relatif(2) },
  { id: 't3', kelas: '4A', mapel: 'bindo', judul: 'Menulis Cerita Pengalaman', deskripsi: 'Tulis cerita pengalaman yang paling berkesan minimal 2 paragraf.', diberikan: relatif(-3), tenggat: relatif(4) },
  { id: 't4', kelas: '4A', mapel: 'ipas', judul: 'Mengamati Pertumbuhan Kacang Hijau', deskripsi: 'Tanam kacang hijau di kapas, lalu catat tinggi tanaman setiap hari selama 7 hari.', diberikan: relatif(-5), tenggat: relatif(6) },
  { id: 't5', kelas: '4A', mapel: 'senbud', judul: 'Menggambar Rumah Adat', deskripsi: 'Gambar dan warnai salah satu rumah adat Indonesia di kertas A4.', diberikan: relatif(-8), tenggat: relatif(-1) },
  { id: 't6', kelas: '4A', mapel: 'pancasila', judul: 'Rangkuman Sila Ketiga', deskripsi: 'Tulis contoh sikap persatuan di rumah dan di sekolah, masing-masing 3 contoh.', diberikan: relatif(-10), tenggat: relatif(-4) },
  { id: 't7', kelas: '1A', mapel: 'bindo', judul: 'Menebalkan Huruf Vokal', deskripsi: 'Tebalkan huruf a, i, u, e, o di buku latihan halaman 12.', diberikan: relatif(-1), tenggat: relatif(2) },
  { id: 't8', kelas: '1A', mapel: 'mtk', judul: 'Menghitung Benda di Rumah', deskripsi: 'Hitung sendok, piring, dan gelas di rumah lalu tulis jumlahnya.', diberikan: relatif(-2), tenggat: relatif(1) },
  { id: 't9', kelas: '6A', mapel: 'ipas', judul: 'Poster Sistem Tata Surya', deskripsi: 'Buat poster planet-planet tata surya beserta 2 fakta unik tiap planet.', diberikan: relatif(-4), tenggat: relatif(3) },
  { id: 't10', kelas: '6A', mapel: 'mtk', judul: 'Latihan Soal Numerasi', deskripsi: 'Kerjakan 20 soal latihan numerasi di lembar kerja.', diberikan: relatif(-3), tenggat: relatif(2) },
]

// Biodata lengkap (contoh hanya untuk siswa demo)
export const BIODATA = {
  230401: {
    nisn: '0151234567',
    tempatLahir: 'Kota Harapan',
    tanggalLahir: '2016-05-14',
    agama: 'Islam',
    golonganDarah: 'O',
    alamat: 'Jl. Melati No. 12, Kel. Sukamaju, Kota Harapan',
    teleponOrtu: '0812-1111-2222',
    ekskul: ['robotik', 'futsal'],
  },
}

// Akun demo — HANYA untuk tampilan frontend, bukan sistem login sungguhan
// Akun role 'staf' terhubung ke data guru lewat `guruId`, sehingga jabatannya
// mengikuti pengaturan Kepala Sekolah di menu Data Guru & Staf.
export const AKUN_DEMO = [
  { username: 'siswa', password: 'siswa123', role: 'siswa', label: 'Siswa', nama: 'Rafa Aditya', nis: '230401', kelas: '4A' },
  { username: 'ortu', password: 'ortu123', role: 'ortu', label: 'Orang Tua', nama: 'Ibu Dewi Lestari', anakNis: '230401' },
  { username: 'guru', password: 'guru123', role: 'staf', label: 'Wali Kelas', nama: 'Andi Pratama, S.Pd.', guruId: 'g2' },
  { username: 'mapel', password: 'mapel123', role: 'staf', label: 'Guru Mapel', nama: 'Maria Natalia, S.Pd.', guruId: 'g7' },
  { username: 'kurikulum', password: 'kurikulum123', role: 'staf', label: 'Wakasek Kurikulum', nama: 'Rina Marlina, S.Pd.', guruId: 'g3' },
  { username: 'kesiswaan', password: 'kesiswaan123', role: 'staf', label: 'Wakasek Kesiswaan', nama: 'Budi Santoso, S.Pd.', guruId: 'g5' },
  { username: 'tu', password: 'tu123', role: 'staf', label: 'Tata Usaha', nama: 'Sri Handayani, S.E.', guruId: 'g9' },
  { username: 'pustaka', password: 'pustaka123', role: 'staf', label: 'Pustakawan', nama: 'Yusuf Hidayat, S.IP.', guruId: 'g10' },
  { username: 'sarpras', password: 'sarpras123', role: 'staf', label: 'Wakasek Sarpras', nama: 'Agus Setiawan, S.T.', guruId: 'g11' },
  { username: 'bk', password: 'bk123', role: 'staf', label: 'Guru BK', nama: 'Laila Fitriani, S.Psi.', guruId: 'g12' },
  { username: 'satpam', password: 'satpam123', role: 'staf', label: 'Satpam', nama: 'Joko Susilo', guruId: 'g13' },
]

// Akun pengguna sungguhan — TIDAK ditampilkan di daftar akun demo halaman login.
// Username ditulis huruf kecil; saat login, huruf besar/kecil tidak dibedakan.
// Password diambil dari sd-app/.env.local (tidak ikut ke Git, lihat .env.example);
// akun tanpa password dinonaktifkan. Pindahkan ke database Laravel saat backend siap.
export const AKUN_TERDAFTAR = [
  { username: 'raymond fernando', password: import.meta.env.VITE_PASSWORD_KEPSEK, role: 'kepsek', label: 'Kepala Sekolah', nama: 'Raymond Fernando' },
].filter((a) => a.password)

export const LABEL_ROLE = { siswa: 'Siswa', ortu: 'Orang Tua', staf: 'Guru & Staf', kepsek: 'Kepala Sekolah' }
