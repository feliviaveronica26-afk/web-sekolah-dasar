import { useRef, useState } from 'react'
import { Check, Copy, Download, FileDown, Loader2, Printer } from 'lucide-react'
import qrcode from 'qrcode-generator'
import { Alert, btn } from './ui'
import { useData } from '../context/DataContext'
import { SEKOLAH, SPP } from '../data/dummy'
import { formatTanggal } from '../utils/format'
import { STATUS_SPP, bulanBisaDibayar, jatuhTempoSiswa, namaBulan, rupiah, statusSpp } from '../utils/spp'

// Status 12 bulan SPP dalam satu baris. `kecil` untuk tabel.
export function StripBulan({ data, nis, kecil = false }) {
  if (kecil) {
    return (
      <div className="d-flex gap-0-5">
        {SPP.bulan.map((b) => {
          const s = statusSpp(data, nis, b)
          return <span key={b} title={`${namaBulan(b)}: ${STATUS_SPP[s].label}`} className={`h-4 w-2-5 rounded-1 ${STATUS_SPP[s].chip}`} />
        })}
      </div>
    )
  }
  return (
    <div className="d-grid kolom-3 gap-2 kolom-400-4 kolom-sm-6 kolom-lg-12">
      {SPP.bulan.map((b) => {
        const s = statusSpp(data, nis, b)
        return (
          <div key={b} className={`rounded-2 px-2 py-2-5 text-center ${STATUS_SPP[s].cls}`}>
            <p className="fs-xs fw-bold">{namaBulan(b, { month: 'short' })}</p>
            <p className="mt-0-5 fs-10 fw-medium lh-tight">{STATUS_SPP[s].label}</p>
          </div>
        )
      })}
    </div>
  )
}

// `sebelumMasuk` = tampilkan juga keterangan bulan sebelum siswa baru/pindahan masuk
export function LegendaSpp({ sebelumMasuk = false }) {
  return (
    <div className="d-flex flex-wrap column-gap-4 row-gap-2 fs-xs text-tinta-2">
      {Object.entries(STATUS_SPP)
        .filter(([k]) => sebelumMasuk || k !== 'sebelumMasuk')
        .map(([, s]) => (
          <span key={s.label} className="d-flex align-items-center gap-1-5">
            <span className={`h-2-5 w-2-5 rounded-pill ${s.chip}`} /> {s.label}
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
      <p className="mb-3 fs-sm text-tinta-3">Bulan dibayar berurutan, mulai dari yang paling lama.</p>
      <ul className="antara-y-2">
        {tampil.map((b, i) => {
          const dipilih = i < terpilih.length
          const s = statusSpp(data, nis, b)
          return (
            <li key={b}>
              <button
                type="button"
                onClick={() => klik(i)}
                className={`d-flex w-100 align-items-center gap-3 rounded-3 border border-2 px-4 py-3 text-start transisi ${
                  dipilih ? 'border-merah-500 bg-merah-50' : 'border-abu-200 hover-garis-abu'
                }`}
              >
                <span
                  className={`d-flex h-6 w-6 flex-shrink-0 align-items-center justify-content-center rounded-1 border border-2 ${
                    dipilih ? 'border-primary bg-primary text-white' : 'border-abu-300 bg-white'
                  }`}
                >
                  {dipilih && <Check className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="d-block fw-bold text-tinta">{namaBulan(b)}</span>
                  <span className="d-block fs-xs text-tinta-3">Jatuh tempo {formatTanggal(jatuhTempoSiswa(data, nis, b))}</span>
                </span>
                <span className="text-end">
                  <span className="d-block fw-bold text-tinta">{rupiah(SPP.nominal)}</span>
                  <span className={`mt-0-5 d-inline-block rounded-pill px-2 py-0-5 fs-10 fw-semibold ${STATUS_SPP[s].cls}`}>
                    {STATUS_SPP[s].label}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {tampil.length < daftar.length && (
        <button type="button" onClick={() => setSemua(true)} className="mt-3 w-100 rounded-2 py-2 fs-sm fw-semibold text-primary hover-latar-merah">
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
      className={`d-inline-flex align-items-center gap-1-5 rounded-1 px-3 py-1-5 fs-sm fw-semibold transisi ${
        tersalin ? 'bg-success-subtle text-success' : 'bg-merah-50 text-merah-700 hover-latar-merah'
      }`}
    >
      {tersalin ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {tersalin ? 'Tersalin!' : label}
    </button>
  )
}

/*
  Kode QR pembayaran yang bisa di-scan. `isi` = string QRIS dari payment gateway, atau (mode simulasi)
  alamat halaman simulator bank agar bisa dibuka dengan kamera HP.
*/
export function QrPembayaran({ isi }) {
  const ref = useRef(null)
  const qr = qrcode(0, 'M')
  qr.addData(isi)
  qr.make()
  const n = qr.getModuleCount()
  const tepi = 3
  let jalur = ''
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) if (qr.isDark(r, c)) jalur += `M${c + tepi} ${r + tepi}h1v1h-1z`
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
    <div className="d-flex flex-column align-items-center">
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${n + tepi * 2} ${n + tepi * 2}`}
        shapeRendering="crispEdges"
        role="img"
        aria-label="Kode QR pembayaran"
        className="h-56 w-56 rounded-2 bg-white"
      >
        <rect width={n + tepi * 2} height={n + tepi * 2} fill="#ffffff" />
        <path d={jalur} fill="#0f172a" />
      </svg>
      <button type="button" onClick={unduh} className="mt-2 d-inline-flex align-items-center gap-1-5 fs-sm fw-semibold text-primary hover-teks-merah">
        <Download className="h-4 w-4" /> Simpan gambar QR
      </button>
    </div>
  )
}

/*
  Kuitansi pembayaran. `pembayaran` = { noTransaksi, tanggal, metode, bulan: [] }
  Cetak Struk: mencetak tampilan ini lewat printer. Unduh PDF: berkas PDF resmi yang dibuat server dari
  data pembayaran di database (bukan dari isi layar).
*/
export function Kuitansi({ siswa, pembayaran }) {
  const { unduhKuitansi } = useData()
  const [mengunduh, setMengunduh] = useState(false)
  const [galat, setGalat] = useState('')
  const total = pembayaran.bulan.length * SPP.nominal
  const unduh = async () => {
    if (mengunduh) return
    setMengunduh(true)
    setGalat('')
    setGalat((await unduhKuitansi(siswa.nis, pembayaran.noTransaksi)) ?? '')
    setMengunduh(false)
  }
  return (
    <>
      <div className="area-cetak position-relative overflow-hidden rounded-3 border border-abu-200 bg-white p-6">
        <div className="d-flex align-items-center gap-3 border-bottom border border-2 border-primary pb-4">
          <img src="/logo.png" alt="" className="h-12 w-12 object-fit-contain" />
          <div>
            <p className="fw-extrabold text-tinta">{SEKOLAH.nama}</p>
            <p className="fs-xs text-tinta-3">{SEKOLAH.alamat}</p>
            <p className="fs-xs text-tinta-3">
              {SEKOLAH.telepon} · {SEKOLAH.email}
            </p>
          </div>
        </div>

        <p className="mt-5 text-center fs-sm fw-extrabold ls-widest text-tinta">KUITANSI PEMBAYARAN SPP</p>
        <p className="text-center fs-xs text-tinta-3">No. {pembayaran.noTransaksi}</p>

        <dl className="mt-5 d-grid kolom-110-isi row-gap-1-5 fs-sm">
          <dt className="text-tinta-3">Tanggal</dt>
          <dd className="fw-semibold text-tinta">{formatTanggal(pembayaran.tanggal)}</dd>
          <dt className="text-tinta-3">Nama Siswa</dt>
          <dd className="fw-semibold text-tinta">{siswa.nama}</dd>
          <dt className="text-tinta-3">NIS / Kelas</dt>
          <dd className="fw-semibold text-tinta">
            {siswa.nis} / {siswa.kelas}
          </dd>
          <dt className="text-tinta-3">Metode</dt>
          <dd className="fw-semibold text-tinta">{pembayaran.metode}</dd>
        </dl>

        <table className="mt-5 w-100 fs-sm">
          <thead>
            <tr className="border-top border-bottom border-abu-200 text-start fs-xs text-uppercase text-tinta-3">
              <th className="py-2">Keterangan</th>
              <th className="py-2 text-end">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {pembayaran.bulan.map((b) => (
              <tr key={b} className="border-bottom border-abu-100">
                <td className="py-2 text-tinta-2">SPP {namaBulan(b)}</td>
                <td className="py-2 text-end text-tinta-2">{rupiah(SPP.nominal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-3 fw-bold text-tinta">Total</td>
              <td className="pt-3 text-end fs-lg fw-extrabold text-tinta">{rupiah(total)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="pe-none position-absolute end-6 top-32 miring-n12 rounded-1 border border-4 border-success px-3 py-1 fs-xl fw-extrabold ls-widest teks-terang-emerald opacity-80">
          LUNAS
        </div>
        <p className="mt-6 text-center fs-2xs text-abu-400">Kuitansi ini diterbitkan otomatis oleh sistem dan sah tanpa tanda tangan.</p>
      </div>
      {galat && (
        <div className="mt-4">
          <Alert tone="error">{galat}</Alert>
        </div>
      )}
      <div className="mt-4 d-grid gap-2 kolom-sm-2">
        <button type="button" onClick={() => window.print()} className={btn.secondary}>
          <Printer className="h-4 w-4" /> Cetak Struk
        </button>
        <button type="button" onClick={unduh} disabled={mengunduh} className={`${btn.primary}`}>
          {mengunduh ? <Loader2 className="h-4 w-4 berputar" /> : <FileDown className="h-4 w-4" />} {mengunduh ? 'Menyiapkan PDF…' : 'Unduh PDF'}
        </button>
      </div>
    </>
  )
}

// Kelompokkan riwayat SPP seorang siswa per nomor transaksi (satu pembayaran bisa beberapa bulan)
export function riwayatPembayaran(data, nis) {
  const grup = {}
  for (const [bulan, info] of Object.entries(data.spp[nis] ?? {})) {
    grup[info.noTransaksi] ??= { noTransaksi: info.noTransaksi, tanggal: info.tanggal, metode: info.metode, bulan: [] }
    grup[info.noTransaksi].bulan.push(bulan)
    if (info.bukti) grup[info.noTransaksi].bukti = info.bukti
  }
  return Object.values(grup)
    .map((g) => ({ ...g, bulan: g.bulan.sort() }))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.bulan[0].localeCompare(a.bulan[0]))
}
