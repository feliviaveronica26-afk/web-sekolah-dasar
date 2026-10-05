import { useRef, useState } from 'react'
import { Check, Copy, Download, Printer } from 'lucide-react'
import { btn } from './ui'
import { SEKOLAH, SPP } from '../data/dummy'
import { formatTanggal } from '../utils/format'
import { STATUS_SPP, bulanBisaDibayar, jatuhTempo, namaBulan, rupiah, statusSpp } from '../utils/spp'

// Status 12 bulan SPP dalam satu baris. `kecil` untuk tabel.
export function StripBulan({ data, nis, kecil = false }) {
  if (kecil) {
    return (
      <div className="flex gap-0.5">
        {SPP.bulan.map((b) => {
          const s = statusSpp(data, nis, b)
          return <span key={b} title={`${namaBulan(b)}: ${STATUS_SPP[s].label}`} className={`h-4 w-2.5 rounded-sm ${STATUS_SPP[s].chip}`} />
        })}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
      {SPP.bulan.map((b) => {
        const s = statusSpp(data, nis, b)
        return (
          <div key={b} className={`rounded-xl px-2 py-2.5 text-center ${STATUS_SPP[s].cls}`}>
            <p className="text-xs font-bold">{namaBulan(b, { month: 'short' })}</p>
            <p className="mt-0.5 text-[10px] font-medium leading-tight">{STATUS_SPP[s].label}</p>
          </div>
        )
      })}
    </div>
  )
}

export function LegendaSpp() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
      {Object.values(STATUS_SPP).map((s) => (
        <span key={s.label} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${s.chip}`} /> {s.label}
        </span>
      ))}
    </div>
  )
}

/*
  Pilih bulan yang akan dibayar. Bulan selalu dibayar berurutan dari yang terlama,
  jadi memilih satu bulan otomatis ikut memilih semua bulan sebelumnya.
*/
export function PilihBulan({ data, nis, terpilih, onChange }) {
  const daftar = bulanBisaDibayar(data, nis)
  const [semua, setSemua] = useState(false)
  // Tampilkan secukupnya: bulan terpilih + 1 bulan berikutnya, sisanya disembunyikan
  const tampil = semua ? daftar : daftar.slice(0, Math.max(terpilih.length + 1, 2))

  const klik = (i) => onChange(terpilih.length === i + 1 ? daftar.slice(0, i) : daftar.slice(0, i + 1))

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Bulan dibayar berurutan, mulai dari yang paling lama.</p>
      <ul className="space-y-2">
        {tampil.map((b, i) => {
          const dipilih = i < terpilih.length
          const s = statusSpp(data, nis, b)
          return (
            <li key={b}>
              <button
                type="button"
                onClick={() => klik(i)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition ${
                  dipilih ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 ${
                    dipilih ? 'border-primary-600 bg-primary-600 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {dipilih && <Check className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-slate-900">{namaBulan(b)}</span>
                  <span className="block text-xs text-slate-500">Jatuh tempo {formatTanggal(jatuhTempo(b))}</span>
                </span>
                <span className="text-right">
                  <span className="block font-bold text-slate-900">{rupiah(SPP.nominal)}</span>
                  <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_SPP[s].cls}`}>
                    {STATUS_SPP[s].label}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {tampil.length < daftar.length && (
        <button type="button" onClick={() => setSemua(true)} className="mt-3 w-full rounded-xl py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50">
          + Bayar di muka untuk bulan berikutnya ({daftar.length - tampil.length} bulan lagi)
        </button>
      )}
    </div>
  )
}

export function TombolSalin({ teks, label = 'Salin' }) {
  const [tersalin, setTersalin] = useState(false)
  const salin = async () => {
    try {
      await navigator.clipboard.writeText(teks)
      setTersalin(true)
      setTimeout(() => setTersalin(false), 2000)
    } catch {
      /* clipboard tidak diizinkan browser */
    }
  }
  return (
    <button
      type="button"
      onClick={salin}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
        tersalin ? 'bg-emerald-100 text-emerald-700' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
      }`}
    >
      {tersalin ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {tersalin ? 'Tersalin!' : label}
    </button>
  )
}

// Kode QR tiruan untuk demo. Di produksi, gambar QRIS didapat dari payment gateway.
export function QrDemo({ teks }) {
  const ref = useRef(null)
  const n = 29
  let seed = [...teks].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) % 2147483647, 17)
  const acak = () => {
    seed = (seed * 48271) % 2147483647
    return seed / 2147483647
  }
  const sudut = [
    [0, 0],
    [0, n - 7],
    [n - 7, 0],
  ]
  const isiFinder = (r, c) => {
    for (const [or, oc] of sudut) {
      const y = r - or
      const x = c - oc
      if (y >= -1 && y <= 7 && x >= -1 && x <= 7) {
        if (y < 0 || y > 6 || x < 0 || x > 6) return false
        return y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4)
      }
    }
    return null
  }
  const tengah = (r, c) => Math.abs(r - (n - 1) / 2) <= 3 && Math.abs(c - (n - 1) / 2) <= 3

  const kotak = []
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const f = isiFinder(r, c)
      const hitam = f === null ? !tengah(r, c) && acak() > 0.5 : f
      if (hitam) kotak.push(<rect key={`${r}-${c}`} x={c + 2} y={r + 2} width="1.02" height="1.02" fill="#0f172a" />)
    }
  }

  // Simpan sebagai PNG agar bisa diunggah dari galeri di aplikasi e-wallet
  const unduh = () => {
    const svg = new XMLSerializer().serializeToString(ref.current)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 600
      canvas.getContext('2d').drawImage(img, 0, 0, 600, 600)
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = 'qris-spp-sd-harapan-gemilang.png'
      a.click()
    }
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  }

  return (
    <div className="flex flex-col items-center">
      <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${n + 4} ${n + 4}`} className="h-52 w-52 rounded-xl bg-white">
        <rect width={n + 4} height={n + 4} fill="#ffffff" />
        {kotak}
        <circle cx={(n + 4) / 2} cy={(n + 4) / 2} r="3" fill="#d91a28" />
        <circle cx={(n + 4) / 2} cy={(n + 4) / 2} r="1.2" fill="#ffffff" />
      </svg>
      <button type="button" onClick={unduh} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700">
        <Download className="h-4 w-4" /> Simpan gambar QR
      </button>
    </div>
  )
}

// Kuitansi pembayaran. `pembayaran` = { noTransaksi, tanggal, metode, bulan: [] }
export function Kuitansi({ siswa, pembayaran }) {
  const total = pembayaran.bulan.length * SPP.nominal
  return (
    <>
      <div className="area-cetak relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3 border-b-2 border-primary-600 pb-4">
          <img src="/logo.svg" alt="" className="h-12 w-12" />
          <div>
            <p className="font-extrabold text-slate-900">{SEKOLAH.nama}</p>
            <p className="text-xs text-slate-500">{SEKOLAH.alamat}</p>
            <p className="text-xs text-slate-500">
              {SEKOLAH.telepon} · {SEKOLAH.email}
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-sm font-extrabold tracking-widest text-slate-800">KUITANSI PEMBAYARAN SPP</p>
        <p className="text-center text-xs text-slate-500">No. {pembayaran.noTransaksi}</p>

        <dl className="mt-5 grid grid-cols-[110px_1fr] gap-y-1.5 text-sm">
          <dt className="text-slate-500">Tanggal</dt>
          <dd className="font-semibold text-slate-800">{formatTanggal(pembayaran.tanggal)}</dd>
          <dt className="text-slate-500">Nama Siswa</dt>
          <dd className="font-semibold text-slate-800">{siswa.nama}</dd>
          <dt className="text-slate-500">NIS / Kelas</dt>
          <dd className="font-semibold text-slate-800">
            {siswa.nis} / {siswa.kelas}
          </dd>
          <dt className="text-slate-500">Metode</dt>
          <dd className="font-semibold text-slate-800">{pembayaran.metode}</dd>
        </dl>

        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="border-y border-slate-200 text-left text-xs uppercase text-slate-500">
              <th className="py-2">Keterangan</th>
              <th className="py-2 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {pembayaran.bulan.map((b) => (
              <tr key={b} className="border-b border-slate-100">
                <td className="py-2 text-slate-700">SPP {namaBulan(b)}</td>
                <td className="py-2 text-right text-slate-700">{rupiah(SPP.nominal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-3 font-bold text-slate-900">Total</td>
              <td className="pt-3 text-right text-lg font-extrabold text-slate-900">{rupiah(total)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="pointer-events-none absolute right-6 top-32 rotate-[-12deg] rounded-lg border-4 border-emerald-500 px-3 py-1 text-xl font-extrabold tracking-widest text-emerald-500 opacity-80">
          LUNAS
        </div>
        <p className="mt-6 text-center text-[11px] text-slate-400">Kuitansi ini diterbitkan otomatis oleh sistem dan sah tanpa tanda tangan.</p>
      </div>
      <button type="button" onClick={() => window.print()} className={`${btn.secondary} mt-4 w-full`}>
        <Printer className="h-4 w-4" /> Cetak / Simpan PDF
      </button>
    </>
  )
}

// Kelompokkan riwayat SPP seorang siswa per nomor transaksi (satu pembayaran bisa beberapa bulan)
export function riwayatPembayaran(data, nis) {
  const grup = {}
  for (const [bulan, info] of Object.entries(data.spp[nis] ?? {})) {
    grup[info.noTransaksi] ??= { noTransaksi: info.noTransaksi, tanggal: info.tanggal, metode: info.metode, bulan: [] }
    grup[info.noTransaksi].bulan.push(bulan)
  }
  return Object.values(grup)
    .map((g) => ({ ...g, bulan: g.bulan.sort() }))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.bulan[0].localeCompare(a.bulan[0]))
}
