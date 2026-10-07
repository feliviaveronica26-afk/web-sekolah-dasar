// Presensi guru & staf. Catatan disimpan per tanggal:
// { 'YYYY-MM-DD': { guruId: { status, masuk, pulang, alasanMasuk?, alasanPulang?, ket?, izinId?, koreksi?: [] } } }
// status: H (hadir) · D (dinas luar) · I (izin) · S (sakit) · C (cuti) · A (alpa)
// T (terlambat) tidak disimpan, diturunkan dari jam masuk yang melewati jam kerja.
import { JAM_KERJA } from '../data/dummy'
import { hariSekolahSebelum, isHariSekolah, parseKey, rentangHariSekolah, toKey, todayKey } from './format'

// '06.45' atau '06:45' → menit sejak tengah malam, dan sebaliknya
export const keMenit = (jam) => {
  const [h, m] = jam.split(/[.:]/).map(Number)
  return h * 60 + m
}
export const dariMenit = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}.${String(m % 60).padStart(2, '0')}`

export const jamKerja = (guru) => (guru?.peran?.includes('satpam') ? JAM_KERJA.satpam : JAM_KERJA.umum)

export const STATUS_PRESENSI = {
  H: { label: 'Hadir', cls: 'bg-emerald-100 text-emerald-700', sel: 'bg-emerald-500 text-white' },
  T: { label: 'Terlambat', cls: 'bg-amber-100 text-amber-800', sel: 'bg-amber-400 text-amber-950' },
  D: { label: 'Dinas Luar', cls: 'bg-indigo-100 text-indigo-700', sel: 'bg-indigo-500 text-white' },
  I: { label: 'Izin', cls: 'bg-sky-100 text-sky-700', sel: 'bg-sky-500 text-white' },
  S: { label: 'Sakit', cls: 'bg-pink-100 text-pink-700', sel: 'bg-pink-500 text-white' },
  C: { label: 'Cuti', cls: 'bg-teal-100 text-teal-700', sel: 'bg-teal-500 text-white' },
  A: { label: 'Alpa', cls: 'bg-rose-100 text-rose-700', sel: 'bg-rose-600 text-white' },
}

export const KODE_IZIN_STAF = { Sakit: 'S', Izin: 'I', Cuti: 'C', 'Dinas Luar': 'D' }

export const menitTerlambat = (rec, guru) => (rec?.status === 'H' && rec.masuk ? Math.max(0, keMenit(rec.masuk) - keMenit(jamKerja(guru).masuk)) : 0)

export const pulangCepat = (rec, guru) => rec?.status === 'H' && !!rec.pulang && keMenit(rec.pulang) < keMenit(jamKerja(guru).pulang)

// Kode tampilan satu catatan (H/T/D/I/S/C/A), atau null jika belum ada catatan
export function kodePresensi(rec, guru) {
  if (!rec?.status) return null
  if (rec.status === 'H') return menitTerlambat(rec, guru) > 0 ? 'T' : 'H'
  return rec.status
}

export function durasiKerja(rec) {
  if (!rec?.masuk || !rec?.pulang) return null
  const m = keMenit(rec.pulang) - keMenit(rec.masuk)
  return m > 0 ? `${Math.floor(m / 60)} jam ${m % 60} menit` : null
}

// Ringkasan presensi satu orang pada daftar tanggal. Hari tanpa catatan tidak ikut dihitung.
export function rekapPresensi(presensi, guru, daftarTanggal) {
  const n = { H: 0, T: 0, D: 0, I: 0, S: 0, C: 0, A: 0 }
  let tercatat = 0
  let totalMasuk = 0
  let jumlahMasuk = 0
  let lupaPulang = 0
  let pulangAwal = 0
  let menitTelat = 0
  const hariIni = todayKey()
  for (const tgl of daftarTanggal) {
    const rec = presensi[tgl]?.[guru.id]
    const k = kodePresensi(rec, guru)
    if (!k) continue
    n[k]++
    tercatat++
    if (rec.masuk && rec.status === 'H') {
      totalMasuk += keMenit(rec.masuk)
      jumlahMasuk++
    }
    if (k === 'T') menitTelat += menitTerlambat(rec, guru)
    if ((k === 'H' || k === 'T') && !rec.pulang && tgl < hariIni) lupaPulang++
    if (pulangCepat(rec, guru)) pulangAwal++
  }
  const hadir = n.H + n.T + n.D
  return {
    ...n,
    tercatat,
    hadir,
    lupaPulang,
    pulangAwal,
    menitTelat,
    persenHadir: tercatat ? Math.round((hadir / tercatat) * 100) : null,
    persenTepat: n.H + n.T ? Math.round((n.H / (n.H + n.T)) * 100) : null,
    rataMasuk: jumlahMasuk ? dariMenit(Math.round(totalMasuk / jumlahMasuk)) : null,
  }
}

// Pilihan periode rekap: 20 hari kerja terakhir + tiap bulan yang punya catatan (tanggal urut naik)
export function periodePresensi(presensi) {
  const hariIni = todayKey()
  const terakhir = (isHariSekolah(new Date()) ? [hariIni, ...hariSekolahSebelum(19)] : hariSekolahSebelum(20)).reverse()
  const bulan = [
    ...new Set(
      Object.keys(presensi)
        .filter((t) => t <= hariIni)
        .map((t) => t.slice(0, 7)),
    ),
  ]
    .sort()
    .reverse()
  return [
    { kode: '20', label: '20 hari kerja terakhir', tanggal: terakhir },
    ...bulan.map((b) => {
      const [y, m] = b.split('-').map(Number)
      const akhir = toKey(new Date(y, m, 0))
      return {
        kode: b,
        label: parseKey(`${b}-01`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        tanggal: rentangHariSekolah(`${b}-01`, akhir < hariIni ? akhir : hariIni),
      }
    }),
  ]
}

// Presensi semua guru & staf pada satu tanggal
export function papanPresensi(data, tanggal) {
  return data.guru.map((g) => {
    const rec = data.presensiStaf[tanggal]?.[g.id]
    return { g, rec, kode: kodePresensi(rec, g) }
  })
}

// Hitungan cepat untuk satu tanggal (bawaan: hari ini)
export function ringkasPresensi(data, tanggal = todayKey()) {
  const papan = papanPresensi(data, tanggal)
  const jumlah = (...kode) => papan.filter((p) => kode.includes(p.kode)).length
  return {
    papan,
    total: papan.length,
    hadir: jumlah('H', 'T', 'D'),
    tepat: jumlah('H'),
    terlambat: jumlah('T'),
    dinas: jumlah('D'),
    izin: jumlah('I', 'S', 'C'),
    alpa: jumlah('A'),
    belum: papan.filter((p) => !p.kode).length,
  }
}
