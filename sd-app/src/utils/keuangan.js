import { rupiah } from './spp'

/*
  Buku kas sekolah. Transaksi manual tersimpan di MySQL (API /keuangan, hanya Kepala Sekolah),
  sedangkan pembayaran SPP dihitung otomatis dari data SPP agar tidak tercatat dua kali.
*/

// Sama dengan TransaksiKas::KATEGORI di Laravel
export const KATEGORI_KAS = {
  masuk: ['Saldo Awal', 'Dana BOS', 'Uang Pangkal & Pendaftaran', 'Sumbangan & Donasi', 'Sewa Kantin', 'Pemasukan Lainnya'],
  keluar: ['Gaji & Honor', 'Listrik, Air & Internet', 'Buku, ATK & Bahan Ajar', 'Perawatan & Perbaikan', 'Kegiatan Siswa', 'Rapat & Konsumsi', 'Pengeluaran Lainnya'],
}
export const METODE_KAS = ['Tunai', 'Transfer Bank']
export const KATEGORI_SPP = 'SPP Siswa'
// Sisa kas periode sebelumnya: menambah saldo, tetapi tidak dihitung sebagai pemasukan bulanan
export const SALDO_AWAL = 'Saldo Awal'

export const JENIS_KAS = {
  masuk: { label: 'Pemasukan', warna: '#2a78d6' },
  keluar: { label: 'Pengeluaran', warna: '#eb6834' },
}

// Pembayaran SPP digabung per hari menjadi satu baris kas otomatis
export function kasDariSpp(spp) {
  const perHari = {}
  for (const [nis, milik] of Object.entries(spp)) {
    for (const info of Object.values(milik)) {
      const hari = (perHari[info.tanggal] ??= { jumlah: 0, siswa: new Set() })
      hari.jumlah += info.jumlah
      hari.siswa.add(nis)
    }
  }
  return Object.entries(perHari).map(([tanggal, h]) => ({
    id: `spp-${tanggal}`,
    tanggal,
    jenis: 'masuk',
    kategori: KATEGORI_SPP,
    uraian: `Pembayaran SPP dari ${h.siswa.size} siswa`,
    jumlah: h.jumlah,
    metode: 'Beragam',
    bukti: '',
    otomatis: true,
  }))
}

const urutanDalamHari = (t) => (t.kategori === SALDO_AWAL ? 0 : t.jenis === 'masuk' ? 1 : 2)

// Urut tanggal; dalam satu hari: saldo awal, pemasukan, lalu pengeluaran
export const urutKas = (a, b) =>
  a.tanggal.localeCompare(b.tanggal) || urutanDalamHari(a) - urutanDalamHari(b) || String(a.id).localeCompare(String(b.id), undefined, { numeric: true })

// Saldo setelah setiap transaksi (kas harus sudah urut). Hasil: { id: saldo }
export function saldoBerjalan(kas) {
  let saldo = 0
  return Object.fromEntries(kas.map((t) => [t.id, (saldo += t.jenis === 'masuk' ? t.jumlah : -t.jumlah)]))
}

// Ringkasan satu bulan ('YYYY-MM')
export function ringkasBulan(kas, bulan) {
  const hasil = { saldoAwal: 0, masuk: 0, keluar: 0, jumlahTransaksi: 0, perKategori: { masuk: {}, keluar: {} } }
  for (const t of kas) {
    const b = t.tanggal.slice(0, 7)
    if (b > bulan) continue
    if (b < bulan || t.kategori === SALDO_AWAL) {
      hasil.saldoAwal += t.jenis === 'masuk' ? t.jumlah : -t.jumlah
      continue
    }
    hasil[t.jenis] += t.jumlah
    hasil.perKategori[t.jenis][t.kategori] = (hasil.perKategori[t.jenis][t.kategori] ?? 0) + t.jumlah
    hasil.jumlahTransaksi++
  }
  return { ...hasil, selisih: hasil.masuk - hasil.keluar, saldoAkhir: hasil.saldoAwal + hasil.masuk - hasil.keluar }
}

// 'YYYY-MM' sebelum/sesudah
export const geserBulan = (bulan, n) => {
  const [y, m] = bulan.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Daftar bulan dari transaksi pertama sampai `akhir`, terbaru dulu
export function bulanTersedia(kas, akhir) {
  const awal = kas.length ? kas[0].tanggal.slice(0, 7) : akhir
  const daftar = []
  for (let b = akhir; b >= awal && daftar.length < 120; b = geserBulan(b, -1)) daftar.push(b)
  return daftar
}

// "−Rp1.250.000" untuk angka negatif (rupiah() bawaan menulis "Rp-1.250.000")
export const rupiahTanda = (n) => (n < 0 ? `−${rupiah(-n)}` : rupiah(n))

// Ringkas untuk kartu & grafik: Rp152,3 jt · Rp1,2 M · Rp750 rb
export function rupiahRingkas(n, { tanpaRp = false } = {}) {
  const abs = Math.abs(n)
  // Spasi tak terputus: satuan tidak terpisah ke baris berikutnya
  const [nilai, satuan] = abs >= 1e9 ? [abs / 1e9, ' M'] : abs >= 1e6 ? [abs / 1e6, ' jt'] : abs >= 1e3 ? [abs / 1e3, ' rb'] : [abs, '']
  return `${n < 0 ? '−' : ''}${tanpaRp ? '' : 'Rp'}${nilai.toLocaleString('id-ID', { maximumFractionDigits: 1 })}${satuan}`
}

// Isian jumlah: "1.250.000" ⇄ 1250000
export const angkaDariTeks = (teks) => Number(String(teks).replace(/\D/g, '').slice(0, 12)) || 0
export const teksDariAngka = (n) => (n ? n.toLocaleString('id-ID') : '')
