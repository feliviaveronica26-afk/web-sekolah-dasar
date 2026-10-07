import { ringkasAbsensi } from '../context/DataContext'
import { EKSKUL, SEMUA_SIKAP } from '../data/dummy'
import { angkaKelas, rekapNilai } from './nilai'

export const infoSikap = (kode) => SEMUA_SIKAP.find((s) => s.kode === kode) ?? { label: kode, emoji: '•', poin: 0 }

// Ringkasan poin sikap satu siswa (terbaru di atas)
export function ringkasSikap(data, nis) {
  const daftar = data.sikap.filter((s) => s.nis === nis).sort((a, b) => b.tanggal.localeCompare(a.tanggal))
  const perKategori = {}
  for (const s of daftar) perKategori[s.kode] = (perKategori[s.kode] ?? 0) + 1
  const positif = daftar.filter((s) => s.poin > 0)
  return {
    daftar,
    total: daftar.reduce((a, s) => a + s.poin, 0),
    positif: positif.length,
    perbaikan: daftar.length - positif.length,
    perKategori,
  }
}

// Jumlah hari hadir berturut-turut sampai hari sekolah terakhir yang tercatat
export function streakHadir(absensi, nis) {
  const tanggal = Object.keys(absensi)
    .filter((t) => absensi[t]?.[nis])
    .sort()
    .reverse()
  let n = 0
  for (const t of tanggal) {
    if (absensi[t][nis] !== 'H') break
    n++
  }
  return n
}

export const bolehIkutEkskul = (e, kelas) => angkaKelas(kelas) >= e.minKelas

// Ekskul yang diikuti: pilihan siswa + ekskul wajib sesuai jenjang
export const ekskulSiswa = (data, siswa) =>
  EKSKUL.filter((e) => (e.wajib && bolehIkutEkskul(e, siswa.kelas)) || (data.ekskul[siswa.nis] ?? []).includes(e.id))

// Lencana pencapaian siswa (gaya ClassDojo) beserta progresnya
export function lencanaSiswa(data, siswa) {
  const tanggal20 = Object.keys(data.absensi).sort().reverse().slice(0, 20)
  const hadir = ringkasAbsensi(data.absensi, siswa.nis, tanggal20)
  const nilai = rekapNilai(data, siswa)
  const sikap = ringkasSikap(data, siswa.nis)
  const tugasKelas = data.tugas.filter((t) => t.kelas === siswa.kelas)
  const selesai = (data.tugasSelesai[siswa.nis] ?? []).filter((id) => tugasKelas.some((t) => t.id === id)).length
  const pinjam = data.peminjaman.filter((p) => p.nis === siswa.nis).length
  const pilihan = (data.ekskul[siswa.nis] ?? []).length
  const streak = streakHadir(data.absensi, siswa.nis)
  const membantu = sikap.perKategori.membantu ?? 0

  return [
    { kode: 'hadir', emoji: '📅', nama: 'Rajin Hadir', syarat: 'Kehadiran minimal 95%', nilai: hadir.persen / 95, teks: `${hadir.persen}%`, warna: 'from-emerald-300 to-emerald-500' },
    { kode: 'streak', emoji: '🔥', nama: 'Tak Pernah Absen', syarat: 'Hadir 10 hari berturut-turut', nilai: streak / 10, teks: `${Math.min(streak, 10)}/10 hari`, warna: 'from-orange-300 to-rose-500' },
    { kode: 'tugas', emoji: '✅', nama: 'Tuntas Tugas', syarat: 'Semua tugas kelas selesai', nilai: tugasKelas.length ? selesai / tugasKelas.length : 0, teks: `${selesai}/${tugasKelas.length} tugas`, warna: 'from-sky-300 to-sky-500' },
    { kode: 'nilai', emoji: '🏆', nama: 'Nilai Gemilang', syarat: 'Rata-rata nilai minimal 85', nilai: (nilai.rataRata ?? 0) / 85, teks: `rata-rata ${nilai.rataRata ?? '–'}`, warna: 'from-amber-200 to-amber-500' },
    { kode: 'bintang', emoji: '⭐', nama: 'Bintang Kelas', syarat: 'Kumpulkan 15 poin sikap', nilai: sikap.total / 15, teks: `${Math.max(0, sikap.total)}/15 poin`, warna: 'from-yellow-200 to-orange-400' },
    { kode: 'penolong', emoji: '🤝', nama: 'Sahabat Penolong', syarat: '3 apresiasi "Membantu teman"', nilai: membantu / 3, teks: `${Math.min(membantu, 3)}/3 apresiasi`, warna: 'from-pink-300 to-rose-500' },
    { kode: 'buku', emoji: '📚', nama: 'Kutu Buku', syarat: 'Meminjam 3 buku perpustakaan', nilai: pinjam / 3, teks: `${Math.min(pinjam, 3)}/3 buku`, warna: 'from-violet-300 to-violet-500' },
    { kode: 'ekskul', emoji: '🎯', nama: 'Aktif Berkegiatan', syarat: 'Ikut minimal 1 ekskul pilihan', nilai: pilihan, teks: `${pilihan} ekskul pilihan`, warna: 'from-teal-300 to-teal-500' },
  ].map((l) => ({ ...l, didapat: l.nilai >= 1, progres: Math.max(0, Math.min(1, l.nilai)) }))
}

const GELAR = ['Pemula', 'Penjelajah', 'Petualang', 'Pemberani', 'Juara', 'Bintang Gemilang']

// Level siswa dari poin sikap, lencana, dan tugas — untuk motivasi di portal siswa
export function levelSiswa(data, siswa) {
  const lencana = lencanaSiswa(data, siswa).filter((l) => l.didapat).length
  const sikap = Math.max(0, ringkasSikap(data, siswa.nis).total)
  const tugas = (data.tugasSelesai[siswa.nis] ?? []).length
  const xp = sikap * 5 + lencana * 20 + tugas * 10
  const perLevel = 60
  const level = Math.floor(xp / perLevel) + 1
  return { xp, level, gelar: GELAR[Math.min(level - 1, GELAR.length - 1)], progres: (xp % perLevel) / perLevel, sisa: perLevel - (xp % perLevel) }
}
