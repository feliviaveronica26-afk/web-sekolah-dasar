import { ringkasAbsensi } from '../context/DataContext'
import { SPP } from '../data/dummy'
import { tambahHari, todayKey } from './format'
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

/*
  Siswa yang belum punya catatan presensi (mis. siswa baru yang baru ditambahkan) tidak dihitung 0%:
  ia tidak ikut rata-rata, tidak masuk daftar "perlu perhatian", dan persennya tampil "–".
*/
export const rataHadir = (rekap) => {
  const ada = rekap.filter((r) => r.total)
  return ada.length ? Math.round(ada.reduce((acc, r) => acc + r.persen, 0) / ada.length) : 0
}
export const perluPerhatianHadir = (r) => r.total > 0 && r.persen < 90
export const teksHadir = (r) => (r.total ? `${r.persen}%` : '–')

export function kehadiranPerKelas(data) {
  const tanggal = tanggalTerakhir(data)
  return [...new Set(data.siswa.map((s) => s.kelas))].sort().map((kelas) => {
    const siswa = data.siswa.filter((s) => s.kelas === kelas)
    return { kelas, jumlah: siswa.length, persen: rataHadir(siswa.map((s) => ringkasAbsensi(data.absensi, s.nis, tanggal))) }
  })
}

export function rekapSiswa(data) {
  const tanggal = tanggalTerakhir(data)
  return data.siswa.map((s) => ({ ...s, ...ringkasAbsensi(data.absensi, s.nis, tanggal) }))
}

export function kehadiranSekolah(data) {
  return rataHadir(rekapSiswa(data))
}

// Siswa yang belum terhubung dengan data keluarga (mis. siswa baru dari menu Data Siswa)
export function siswaTanpaKeluarga(data) {
  const punya = new Set((data.orangTua ?? []).flatMap((k) => k.anak ?? []))
  return data.siswa.filter((s) => !punya.has(s.nis))
}

// Siswa yang masuk dalam 30 hari terakhir (tanggal masuk hanya diterima pengelola data siswa & wali kelasnya)
export function siswaBaru(data, hari = 30) {
  const hariIni = todayKey()
  const mulai = tambahHari(hariIni, -hari)
  return data.siswa.filter((s) => s.tanggalMasuk && s.tanggalMasuk >= mulai && s.tanggalMasuk <= hariIni)
}
