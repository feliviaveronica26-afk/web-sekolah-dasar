import { JADWAL } from '../../data/dummy'
import { agendaPada } from '../../components/KalenderAkademik'
import { namaHari, selisihHari, tambahHari, todayKey } from '../../utils/format'

const JAM_PULANG = 12

const hariBelajar = (kelas, key) =>
  JADWAL[kelas]?.[namaHari(key)] && !agendaPada(key).some((e) => e.jenis === 'libur')

// Jadwal hari ini (jika belum pulang) atau hari sekolah berikutnya
export function jadwalBerikutnya(kelas) {
  const hariIni = todayKey()
  if (hariBelajar(kelas, hariIni) && new Date().getHours() < JAM_PULANG) {
    return { tanggal: hariIni, label: 'Hari ini', sesi: JADWAL[kelas][namaHari(hariIni)] }
  }
  let key = hariIni
  for (let i = 0; i < 60; i++) {
    key = tambahHari(key, 1)
    if (hariBelajar(kelas, key)) {
      const label = selisihHari(hariIni, key) === 1 ? 'Besok' : namaHari(key)
      return { tanggal: key, label, sesi: JADWAL[kelas][namaHari(key)] }
    }
  }
  return null
}

export function infoTenggat(tenggat) {
  const sisa = selisihHari(todayKey(), tenggat)
  if (sisa < 0) return { teks: `Terlambat ${-sisa} hari`, cls: 'bg-rose-100 text-rose-700' }
  if (sisa === 0) return { teks: 'Hari ini', cls: 'bg-amber-100 text-amber-800' }
  if (sisa === 1) return { teks: 'Besok', cls: 'bg-amber-100 text-amber-800' }
  return { teks: `${sisa} hari lagi`, cls: 'bg-slate-100 text-slate-600' }
}
