import { jadwalKelas, liburPada } from '../../utils/acuan'
import { namaHari, selisihHari, tambahHari, todayKey } from '../../utils/format'

const JAM_PULANG = 12

// Ada pelajaran di jadwal kelas pada hari itu dan bukan agenda libur
const hariBelajar = (kelas, key) => jadwalKelas(kelas)[namaHari(key)]?.some(Boolean) && !liburPada(key)

// Jadwal hari ini (jika belum pulang) atau hari sekolah berikutnya
export function jadwalBerikutnya(kelas) {
  const hariIni = todayKey()
  if (hariBelajar(kelas, hariIni) && new Date().getHours() < JAM_PULANG) {
    return { tanggal: hariIni, label: 'Hari ini', sesi: jadwalKelas(kelas)[namaHari(hariIni)] }
  }
  let key = hariIni
  for (let i = 0; i < 60; i++) {
    key = tambahHari(key, 1)
    if (hariBelajar(kelas, key)) {
      const label = selisihHari(hariIni, key) === 1 ? 'Besok' : namaHari(key)
      return { tanggal: key, label, sesi: jadwalKelas(kelas)[namaHari(key)] }
    }
  }
  return null
}

export function infoTenggat(tenggat) {
  const sisa = selisihHari(todayKey(), tenggat)
  if (sisa < 0) return { teks: `Terlambat ${-sisa} hari`, cls: 'warna-rose' }
  if (sisa === 0) return { teks: 'Hari ini', cls: 'warna-amber' }
  if (sisa === 1) return { teks: 'Besok', cls: 'warna-amber' }
  return { teks: `${sisa} hari lagi`, cls: 'warna-abu' }
}
