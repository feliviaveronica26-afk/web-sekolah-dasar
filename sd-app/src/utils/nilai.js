import { KKTP, MAPEL, MAPEL_RAPOR } from '../data/dummy'

export const angkaKelas = (kelas) => Number(String(kelas)[0])

// Mapel rapor sesuai jenjang: IPAS & Informatika mulai kelas 3
export const mapelRapor = (kelas) => MAPEL_RAPOR.filter((m) => angkaKelas(kelas) >= 3 || !['ipas', 'info'].includes(m))

// Komponen nilai dan bobotnya. PAS baru terisi di akhir semester.
export const KOMPONEN = [
  { kode: 'tugas', label: 'Rata-rata tugas', bobot: 0.4 },
  { kode: 'pts', label: 'PTS', bobot: 0.3 },
  { kode: 'pas', label: 'PAS', bobot: 0.3 },
]
export const JUMLAH_TUGAS = 3

const angka = (v) => (v === null || v === undefined || v === '' ? null : Number(v))
const rata = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null)

export const rataTugas = (n) => {
  const isi = (n?.tugas ?? []).map(angka).filter((x) => x !== null)
  return isi.length ? Math.round(rata(isi)) : null
}

// Nilai akhir = rata-rata berbobot dari komponen yang sudah terisi
export function nilaiAkhir(n) {
  if (!n) return null
  const nilai = { tugas: rataTugas(n), pts: angka(n.pts), pas: angka(n.pas) }
  const terisi = KOMPONEN.filter((k) => nilai[k.kode] !== null)
  if (!terisi.length) return null
  const bobot = terisi.reduce((a, k) => a + k.bobot, 0)
  return Math.round(terisi.reduce((a, k) => a + nilai[k.kode] * k.bobot, 0) / bobot)
}

export function predikat(n) {
  if (n === null || n === undefined) return { huruf: '–', label: 'Belum dinilai', cls: 'warna-abu', bar: 'bg-abu-300' }
  if (n >= 90) return { huruf: 'A', label: 'Sangat Baik', cls: 'warna-emerald', bar: 'titik-emerald' }
  if (n >= 80) return { huruf: 'B', label: 'Baik', cls: 'warna-sky', bar: 'titik-sky' }
  if (n >= KKTP) return { huruf: 'C', label: 'Cukup', cls: 'warna-amber', bar: 'titik-amber' }
  return { huruf: 'D', label: 'Perlu Bimbingan', cls: 'warna-rose', bar: 'titik-rose' }
}

// Materi utama per mapel untuk kalimat deskripsi capaian rapor
const MATERI = {
  pancasila: 'memahami nilai-nilai Pancasila dan menerapkannya di sekolah',
  agama: 'mempraktikkan ibadah dan akhlak terpuji',
  bindo: 'membaca pemahaman dan menulis cerita pengalaman',
  mtk: 'operasi hitung pecahan dan pengukuran',
  ipas: 'memahami siklus air dan gaya di sekitar kita',
  pjok: 'gerak dasar lokomotor dan permainan bola',
  senbud: 'menggambar dan mengenal karya seni daerah',
  bing: 'mengenal kosakata dan percakapan sederhana',
  mulok: 'mengenal tembang dan aksara daerah',
  info: 'berpikir komputasional dan penggunaan perangkat',
}

export function deskripsiCapaian(kode, akhir) {
  const materi = MATERI[kode] ?? `materi ${MAPEL[kode]?.nama ?? kode}`
  if (akhir === null) return 'Penilaian belum lengkap.'
  if (akhir >= 90) return `Menunjukkan penguasaan yang sangat baik dalam ${materi}.`
  if (akhir >= 80) return `Menunjukkan penguasaan yang baik dalam ${materi}.`
  if (akhir >= KKTP) return `Cukup menguasai ${materi}; perlu terus berlatih agar lebih mantap.`
  return `Perlu bimbingan dalam ${materi}. Disarankan latihan tambahan bersama guru dan orang tua.`
}

// Rekap nilai satu siswa: daftar per mapel + rata-rata keseluruhan
export function rekapNilai(data, siswa) {
  const milik = data.nilai[siswa.nis] ?? {}
  const daftar = mapelRapor(siswa.kelas).map((kode) => {
    const n = milik[kode] ?? {}
    const akhir = nilaiAkhir(n)
    return { kode, nama: MAPEL[kode].nama, warna: MAPEL[kode].warna, ...n, rataTugas: rataTugas(n), akhir, predikat: predikat(akhir) }
  })
  const terisi = daftar.map((d) => d.akhir).filter((x) => x !== null)
  const rataRata = terisi.length ? Math.round(rata(terisi) * 10) / 10 : null
  return {
    daftar,
    rataRata,
    tuntas: daftar.filter((d) => d.akhir !== null && d.akhir >= KKTP).length,
    terbaik: [...daftar].filter((d) => d.akhir !== null).sort((a, b) => b.akhir - a.akhir)[0],
  }
}

// Peringkat siswa di kelasnya berdasarkan rata-rata nilai. Siswa yang belum punya nilai (mis. siswa
// baru) belum diberi peringkat (posisi null) dan tidak dihitung; sama dengan Rapor::peringkat di Laravel.
export function peringkatKelas(data, siswa) {
  const sekelas = data.siswa
    .filter((s) => s.kelas === siswa.kelas)
    .map((s) => ({ nis: s.nis, rata: rekapNilai(data, s).rataRata }))
    .filter((s) => s.rata !== null)
    .sort((a, b) => b.rata - a.rata)
  return { posisi: sekelas.findIndex((s) => s.nis === siswa.nis) + 1 || null, dari: sekelas.length }
}

// Catatan wali kelas bawaan di rapor (dipakai jika wali kelas belum menulis sendiri)
export function catatanWaliBawaan(nama, rataRata) {
  const panggilan = nama.split(' ')[0]
  if (rataRata === null) return `${panggilan} sedang dalam proses penilaian.`
  if (rataRata >= 88) return `${panggilan} menunjukkan semangat belajar yang luar biasa dan menjadi teladan bagi teman-temannya. Pertahankan, ya!`
  if (rataRata >= 80) return `${panggilan} rajin dan bertanggung jawab. Tingkatkan keberanian bertanya agar hasil belajar makin maksimal.`
  if (rataRata >= KKTP) return `${panggilan} sudah berusaha dengan baik. Perbanyak latihan membaca dan berhitung di rumah, ya.`
  return `${panggilan} membutuhkan pendampingan belajar lebih. Mari bekerja sama antara sekolah dan rumah.`
}
