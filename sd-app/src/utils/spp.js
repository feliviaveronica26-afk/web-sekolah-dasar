import { SPP } from '../data/dummy'
import { todayKey } from './format'

export const rupiah = (n) => `Rp${n.toLocaleString('id-ID')}`

export const bulanIni = () => todayKey().slice(0, 7)

// Hasil format disimpan: tabel SPP memanggilnya ribuan kali (siswa × 12 bulan)
const cacheBulan = new Map()
export const namaBulan = (bulan, opts = { month: 'long', year: 'numeric' }) => {
  const kunci = bulan + JSON.stringify(opts)
  if (!cacheBulan.has(kunci)) {
    const [y, m] = bulan.split('-').map(Number)
    cacheBulan.set(kunci, new Date(y, m - 1, 1).toLocaleDateString('id-ID', opts))
  }
  return cacheBulan.get(kunci)
}

// "September, Oktober 2026" — atau nama bulan lengkap dengan tahun jika melewati pergantian tahun
export const daftarBulan = (bulan) =>
  new Set(bulan.map((b) => b.slice(0, 4))).size === 1
    ? `${bulan.map((b) => namaBulan(b, { month: 'long' })).join(', ')} ${bulan[0].slice(0, 4)}`
    : bulan.map((b) => namaBulan(b)).join(', ')

export const jatuhTempo = (bulan) => `${bulan}-${String(SPP.tanggalJatuhTempo).padStart(2, '0')}`

const bulanBerikut = (bulan) => {
  const [y, m] = bulan.split('-').map(Number)
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
}

/*
  Tanggal masuk siswa: siswa baru/pindahan baru ditagih SPP mulai bulan masuknya (sama dengan
  SppController di Laravel). Tanggal masuk dikirim server ke Tata Usaha, Kepala Sekolah, dan keluarga
  siswa itu; tanpa tanggal masuk semua bulan tahun ajaran ditagih.
*/
const cacheMasuk = new WeakMap()
const tanggalMasuk = (data, nis) => {
  let peta = cacheMasuk.get(data.siswa)
  if (!peta) cacheMasuk.set(data.siswa, (peta = new Map(data.siswa.map((s) => [s.nis, s.tanggalMasuk || '']))))
  return peta.get(nis) ?? ''
}

// Jatuh tempo bulan itu untuk siswa ini: siswa yang masuk setelah tanggal jatuh tempo bulan masuknya
// membayar bulan pertamanya paling lambat jatuh tempo bulan berikutnya
export function jatuhTempoSiswa(data, nis, bulan) {
  const tempo = jatuhTempo(bulan)
  const masuk = tanggalMasuk(data, nis)
  return masuk.startsWith(bulan) && masuk > tempo ? jatuhTempo(bulanBerikut(bulan)) : tempo
}

export const kadaluarsa = (trx) => new Date(trx.kadaluarsa) < new Date()

export const transaksiAktif = (data, nis) =>
  data.transaksi.find((t) => t.nis === nis && t.status === 'menunggu' && !kadaluarsa(t))

export const STATUS_SPP = {
  lunas: { label: 'Lunas', cls: 'warna-emerald', chip: 'titik-emerald' },
  diproses: { label: 'Menunggu Pembayaran', cls: 'warna-sky', chip: 'titik-sky' },
  terlambat: { label: 'Terlambat', cls: 'warna-rose', chip: 'titik-rose' },
  tagihan: { label: 'Belum Dibayar', cls: 'warna-amber', chip: 'titik-amber' },
  mendatang: { label: 'Belum Jatuh Tempo', cls: 'warna-abu', chip: 'bg-abu-200' },
  // Bulan sebelum siswa baru/pindahan masuk: tidak ditagih
  sebelumMasuk: { label: 'Belum Terdaftar', cls: 'bg-abu-50 text-abu-400', chip: 'bg-abu-100' },
}

export function statusSpp(data, nis, bulan) {
  if (data.spp[nis]?.[bulan]) return 'lunas'
  if (bulan < tanggalMasuk(data, nis).slice(0, 7)) return 'sebelumMasuk'
  if (transaksiAktif(data, nis)?.bulan.includes(bulan)) return 'diproses'
  if (todayKey() > jatuhTempoSiswa(data, nis, bulan)) return 'terlambat'
  if (bulan <= bulanIni()) return 'tagihan'
  return 'mendatang'
}

// Bulan yang bisa dibayar (belum lunas & tidak sedang diproses), urut dari yang terlama
export const bulanBisaDibayar = (data, nis) =>
  SPP.bulan.filter((b) => ['terlambat', 'tagihan', 'mendatang'].includes(statusSpp(data, nis, b)))

// Bulan yang sudah wajib dibayar sekarang (terlambat + bulan berjalan)
export const bulanWajibBayar = (data, nis) =>
  SPP.bulan.filter((b) => ['terlambat', 'tagihan'].includes(statusSpp(data, nis, b)))
