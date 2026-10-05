import { ringkasAbsensi } from '../context/DataContext'
import { SPP } from '../data/dummy'
import { todayKey } from './format'
import { bulanIni, statusSpp } from './spp'

export function ringkasSpp(data) {
  const bulan = bulanIni()
  let terkumpul = 0
  for (const milik of Object.values(data.spp)) {
    for (const info of Object.values(milik)) if (info.tanggal.startsWith(bulan)) terkumpul += info.jumlah
  }
  const perSiswa = data.siswa.map((s) => {
    const tunggakan = SPP.bulan.filter((b) => statusSpp(data, s.nis, b) === 'terlambat')
    return { ...s, tunggakan, statusBulanIni: statusSpp(data, s.nis, bulan) }
  })
  const menunggak = perSiswa.filter((s) => s.tunggakan.length > 0)
  return {
    terkumpul,
    perSiswa,
    lunasBulanIni: perSiswa.filter((s) => s.statusBulanIni === 'lunas').length,
    menunggak: menunggak.length,
    totalTunggakan: menunggak.reduce((acc, s) => acc + s.tunggakan.length * SPP.nominal, 0),
  }
}

export function ringkasPerpus(data) {
  const hariIni = todayKey()
  const aktif = data.peminjaman.filter((p) => !p.tanggalKembali)
  return { aktif, terlambat: aktif.filter((p) => p.tenggat < hariIni) }
}

const tanggalTerakhir = (data, n = 20) => Object.keys(data.absensi).sort().reverse().slice(0, n)

export function kehadiranPerKelas(data) {
  const tanggal = tanggalTerakhir(data)
  return [...new Set(data.siswa.map((s) => s.kelas))].sort().map((kelas) => {
    const siswa = data.siswa.filter((s) => s.kelas === kelas)
    const persen = Math.round(siswa.reduce((acc, s) => acc + ringkasAbsensi(data.absensi, s.nis, tanggal).persen, 0) / siswa.length)
    return { kelas, jumlah: siswa.length, persen }
  })
}

export function rekapSiswa(data) {
  const tanggal = tanggalTerakhir(data)
  return data.siswa.map((s) => ({ ...s, ...ringkasAbsensi(data.absensi, s.nis, tanggal) }))
}

export function kehadiranSekolah(data) {
  const rekap = rekapSiswa(data)
  return rekap.length ? Math.round(rekap.reduce((acc, s) => acc + s.persen, 0) / rekap.length) : 0
}
