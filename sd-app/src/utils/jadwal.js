import { HARI_SEKOLAH, JADWAL, MAPEL, SESI } from '../data/dummy'
import { namaHari } from './format'

/*
  Pelajaran = satu sesi di jadwal kelas pada tanggal tertentu.
  `kunci` (mis. '2-bing') dipakai untuk menyimpan kehadiran per pelajaran:
  absensiMapel = { 'YYYY-MM-DD': { nis: { kunci: 'H'|'S'|'I'|'A' } } }
*/

// Pelajaran yang diabsen pada hari itu (upacara & senam pagi tidak termasuk)
export function pelajaranHari(kelas, tanggal) {
  return (JADWAL[kelas]?.[namaHari(tanggal)] ?? [])
    .map((mapel, jam) => ({ jam, mapel, kunci: `${jam}-${mapel}`, mulai: SESI[jam].mulai, selesai: SESI[jam].selesai }))
    .filter((p) => MAPEL[p.mapel] && MAPEL[p.mapel].absensi !== false)
}

export const pelajaranDariKunci = (kelas, tanggal, kunci) => pelajaranHari(kelas, tanggal).find((p) => p.kunci === kunci) ?? null

// Guru pengampu: guru mapel khusus jika ada, selain itu wali kelas
export function guruPelajaran(guru, kelas, mapel) {
  return (
    guru.find((g) => g.nama === MAPEL[mapel]?.guru && g.peran?.includes('guru_mapel')) ??
    guru.find((g) => g.peran?.includes('wali_kelas') && g.kelas === kelas) ??
    null
  )
}

export const jamPelajaran = (p) => `${p.mulai}–${p.selesai}`

// Label sesi OTP: presensi harian atau pelajaran tertentu
export const labelSesi = (s) => (s?.kunci ? `${MAPEL[s.mapel]?.nama ?? s.mapel} (${SESI[s.jam]?.mulai}–${SESI[s.jam]?.selesai})` : 'Presensi harian')

// Kehadiran di satu pelajaran: catatan guru pengampu jika ada, selain itu mengikuti presensi harian
export function statusPelajaran(data, tanggal, nis, kunci) {
  const khusus = data.absensiMapel?.[tanggal]?.[nis]?.[kunci]
  if (khusus) return { status: khusus, sumber: 'pelajaran' }
  return { status: data.absensi[tanggal]?.[nis] ?? null, sumber: 'harian' }
}

/*
  Status yang ditampilkan saat guru mempresensi pelajaran: siswa yang sakit/izin/alpa hari itu
  otomatis ikut, sedangkan siswa yang hadir harian tetap "belum" sampai tercatat di pelajaran ini.
*/
export function statusDiPelajaran(data, tanggal, nis, kunci) {
  const s = statusPelajaran(data, tanggal, nis, kunci)
  return s.sumber === 'harian' && s.status === 'H' ? { status: null, sumber: 'harian' } : s
}

// Jadwal mengajar seorang guru dalam seminggu: [{ hari, kelas, mapel, jam, mulai, selesai }]
export function jadwalMengajar(guru, guruId) {
  const hasil = []
  for (const [kelas, perHari] of Object.entries(JADWAL)) {
    for (const hari of HARI_SEKOLAH) {
      perHari[hari]?.forEach((mapel, jam) => {
        if (MAPEL[mapel]?.absensi === false) return
        if (guruPelajaran(guru, kelas, mapel)?.id === guruId) hasil.push({ hari, kelas, mapel, jam, kunci: `${jam}-${mapel}`, ...SESI[jam] })
      })
    }
  }
  return hasil.sort((a, b) => HARI_SEKOLAH.indexOf(a.hari) - HARI_SEKOLAH.indexOf(b.hari) || a.jam - b.jam || a.kelas.localeCompare(b.kelas))
}
