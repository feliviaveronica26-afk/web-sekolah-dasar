import { formatTanggal } from './format'

/*
  Tampilan biodata siswa. Biodata pribadi (NISN, kelahiran, agama, golongan darah, riwayat masuk,
  catatan kesehatan) hanya dikirim server kepada yang berhak: pengelola Data Siswa, wali kelasnya,
  dan siswa/orang tuanya sendiri (Akses::lingkupBiodataSiswa di Laravel). Teman sekelas hanya
  menerima `ulangTahun` ("MM-DD").
*/

export const GOLONGAN_DARAH = ['A', 'B', 'AB', 'O']

export const namaJk = (jk) => (jk === 'L' ? 'Laki-laki' : jk === 'P' ? 'Perempuan' : '–')

// Data siswa ini membawa biodata pribadi (bukan sekadar nama & kelas)
export const adaBiodata = (s) => s != null && 'nisn' in s

// "Kota Harapan, 14 Mei 2016"
export const teksLahir = (s) => (s.tanggalLahir ? [s.tempatLahir, formatTanggal(s.tanggalLahir)].filter(Boolean).join(', ') : s.tempatLahir || '')

// Usia dalam tahun penuh pada tanggal tertentu (bawaan: hari ini)
export function usia(tanggalLahir, pada = new Date()) {
  if (!tanggalLahir) return null
  const [t, b, h] = tanggalLahir.split('-').map(Number)
  let tahun = pada.getFullYear() - t
  if (pada.getMonth() + 1 < b || (pada.getMonth() + 1 === b && pada.getDate() < h)) tahun -= 1
  return tahun
}

// "14 Mei" dari "05-14" (tahun kabisat agar 29 Februari tetap sah)
export const teksUlangTahun = (md) => (md ? formatTanggal(`2000-${md}`, { year: undefined }) : '')

// Hari ini ulang tahun? (dari tanggal lahir lengkap atau "MM-DD")
export function ulangTahunHariIni(s, pada = new Date()) {
  const md = s.ulangTahun ?? s.tanggalLahir?.slice(5)
  if (!md) return false
  return md === `${String(pada.getMonth() + 1).padStart(2, '0')}-${String(pada.getDate()).padStart(2, '0')}`
}
