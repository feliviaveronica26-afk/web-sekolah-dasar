// Foto halaman publik (folder public/foto). Saat ini berisi foto contoh dari Unsplash;
// daftar fotografer ada di public/foto/KREDIT.md. Untuk memakai foto asli sekolah,
// timpa berkasnya dengan nama yang sama lalu sesuaikan teks `alt` di bawah.
const f = (nama, alt) => ({ src: `/foto/${nama}.webp`, alt })

export const FOTO = {
  ceria: f('ceria', 'Siswa berseragam merah putih melompat gembira di halaman sekolah'),
  sahabat: f('sahabat', 'Lima siswa berseragam merah putih tertawa bersama di gazebo sekolah'),
  upacara: f('upacara', 'Barisan siswa bertopi merah bersiap mengikuti upacara bendera'),
  siswi: f('siswi', 'Dua siswi berseragam putih tersenyum di depan kelas'),
  pramuka: f('pramuka', 'Dua siswa berseragam pramuka berlari di selasar sekolah'),
  jelajah: f('jelajah', 'Sekelompok siswa membaca peta bersama di atas rumput'),
  literasi: f('literasi', 'Tiga siswa berseragam sekolah membaca buku bersama'),
  membaca: f('membaca', 'Anak-anak duduk di lantai sambil membaca buku cerita'),
  perpustakaan: f('perpustakaan', 'Ruang perpustakaan terang dengan rak buku dan kursi merah'),
  kelasGuru: f('kelas-guru', 'Guru duduk bersama siswa di ruang kelas yang penuh buku'),
  guruMendampingi: f('guru-mendampingi', 'Guru mendampingi seorang siswi mengerjakan tugas'),
  sepakBola: f('sepak-bola', 'Anak-anak bermain bola di lapangan berumput'),
  robotik: f('robotik', 'Robot beroda rakitan siswa di atas papan rakitan'),
  seni: f('seni', 'Tangan anak menggunting kertas warna untuk prakarya'),
  kebun: f('kebun', 'Seorang anak menanam bibit tanaman'),
  merdeka: f('merdeka', 'Siswa mengibarkan bendera merah putih kecil saat perayaan kemerdekaan'),
  gedung: f('gedung', 'Gedung sekolah bertingkat dengan atap merah'),
  tawa: f('tawa', 'Empat anak tertawa di padang rumput sambil bermain ukulele'),
  labKomputer: f('lab-komputer', 'Siswa belajar di laboratorium komputer'),
  ruangKelas: f('ruang-kelas', 'Ruang kelas rapi dengan meja, kursi, dan papan tulis'),
  bekal: f('bekal', 'Kotak bekal berisi nasi, lauk, sayur, dan buah'),
  uks: f('uks', 'Stetoskop, termometer, dan perlengkapan kesehatan di UKS'),
  bacaTangga: f('baca-tangga', 'Seorang anak membaca buku di tangga perpustakaan'),
  benderaKepala: f('bendera-kepala', 'Siswa berikat kepala merah putih membaca teks'),
}

// Foto per fasilitas (id di data FASILITAS). Fasilitas tanpa foto memakai ilustrasi ikon.
export const FOTO_FASILITAS = {
  'ruang-kelas': FOTO.ruangKelas,
  perpustakaan: FOTO.perpustakaan,
  'lab-komputer': FOTO.labKomputer,
  lapangan: FOTO.sepakBola,
  uks: FOTO.uks,
  kantin: FOTO.bekal,
  taman: FOTO.kebun,
}

// Foto per ekstrakurikuler (id di data EKSKUL)
export const FOTO_EKSKUL = {
  pramuka: FOTO.pramuka,
  robotik: FOTO.robotik,
  futsal: FOTO.sepakBola,
  melukis: FOTO.seni,
  'paduan-suara': FOTO.tawa,
  english: FOTO.membaca,
}

// Kata kunci di judul -> foto yang cocok (dipakai berita & galeri yang belum punya foto sendiri)
const KATA_KUNCI = [
  [/robot/i, FOTO.robotik],
  [/upacara/i, FOTO.upacara],
  [/hut ri|kemerdekaan|17 agustus|merdeka/i, FOTO.merdeka],
  [/pramuka|kemah/i, FOTO.pramuka],
  [/perpustakaan|literasi|membaca|buku/i, FOTO.bacaTangga],
  [/komputer|coding|scratch|informatika/i, FOTO.labKomputer],
  [/futsal|sepak ?bola|olahraga/i, FOTO.sepakBola],
  [/menanam|pohon|kebun|adiwiyata/i, FOTO.kebun],
  [/paduan suara|musik|lagu/i, FOTO.tawa],
  [/lukis|mewarnai|prakarya/i, FOTO.seni],
  [/field trip|museum|jelajah/i, FOTO.jelajah],
  [/kesehatan|gigi|uks|dokter/i, FOTO.uks],
  [/ppdb|pendaftaran|siswa baru/i, FOTO.siswi],
  [/semester|ujian|penilaian|asesmen/i, FOTO.kelasGuru],
]

// Cadangan per kategori berita bila tidak ada kata kunci yang cocok
const PER_KATEGORI = {
  Akademik: FOTO.kelasGuru,
  Kegiatan: FOTO.sahabat,
  PPDB: FOTO.siswi,
  Prestasi: FOTO.ceria,
  Umum: FOTO.gedung,
}

/** Foto untuk berita/galeri: foto unggahan > kata kunci judul > (opsional) kategori. */
export function fotoUntuk({ foto, judul = '', kategori } = {}, { pakaiKategori = true } = {}) {
  if (foto) return { src: foto, alt: judul }
  const cocok = KATA_KUNCI.find(([re]) => re.test(judul))
  if (cocok) return cocok[1]
  return pakaiKategori ? (PER_KATEGORI[kategori] ?? null) : null
}
