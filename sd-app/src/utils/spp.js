import { SPP } from '../data/dummy'
import { todayKey } from './format'

export const rupiah = (n) => `Rp${n.toLocaleString('id-ID')}`

export const bulanIni = () => todayKey().slice(0, 7)

export const namaBulan = (bulan, opts = { month: 'long', year: 'numeric' }) => {
  const [y, m] = bulan.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', opts)
}

// "September, Oktober 2026" — atau nama bulan lengkap dengan tahun jika melewati pergantian tahun
export const daftarBulan = (bulan) =>
  new Set(bulan.map((b) => b.slice(0, 4))).size === 1
    ? `${bulan.map((b) => namaBulan(b, { month: 'long' })).join(', ')} ${bulan[0].slice(0, 4)}`
    : bulan.map((b) => namaBulan(b)).join(', ')

export const jatuhTempo = (bulan) => `${bulan}-${String(SPP.tanggalJatuhTempo).padStart(2, '0')}`

export const kadaluarsa = (trx) => new Date(trx.kadaluarsa) < new Date()

export const transaksiAktif = (data, nis) =>
  data.transaksi.find((t) => t.nis === nis && t.status === 'menunggu' && !kadaluarsa(t))

export const STATUS_SPP = {
  lunas: { label: 'Lunas', cls: 'bg-emerald-100 text-emerald-700', chip: 'bg-emerald-500' },
  diproses: { label: 'Menunggu Pembayaran', cls: 'bg-sky-100 text-sky-700', chip: 'bg-sky-400' },
  terlambat: { label: 'Terlambat', cls: 'bg-rose-100 text-rose-700', chip: 'bg-rose-500' },
  tagihan: { label: 'Belum Dibayar', cls: 'bg-amber-100 text-amber-800', chip: 'bg-amber-400' },
  mendatang: { label: 'Belum Jatuh Tempo', cls: 'bg-slate-100 text-slate-600', chip: 'bg-slate-200' },
}

export function statusSpp(data, nis, bulan) {
  if (data.spp[nis]?.[bulan]) return 'lunas'
  if (transaksiAktif(data, nis)?.bulan.includes(bulan)) return 'diproses'
  if (todayKey() > jatuhTempo(bulan)) return 'terlambat'
  if (bulan <= bulanIni()) return 'tagihan'
  return 'mendatang'
}

// Bulan yang bisa dibayar (belum lunas & tidak sedang diproses), urut dari yang terlama
export const bulanBisaDibayar = (data, nis) =>
  SPP.bulan.filter((b) => ['terlambat', 'tagihan', 'mendatang'].includes(statusSpp(data, nis, b)))

// Bulan yang sudah wajib dibayar sekarang (terlambat + bulan berjalan)
export const bulanWajibBayar = (data, nis) =>
  SPP.bulan.filter((b) => ['terlambat', 'tagihan'].includes(statusSpp(data, nis, b)))

export const buatNoTransaksi = () =>
  `SPP-${todayKey().replaceAll('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`
