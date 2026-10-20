import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useGayaSitus } from '../context/akses'
import { inisial } from '../utils/format'
import { useAnimasiKeluar } from '../utils/gerak'
import { AngkaNaik } from './Hiasan'

/*
  Komponen dasar portal, dibangun dari komponen Bootstrap 5.3 (btn, card, badge, alert, modal, nav-pills,
  progress) dengan tema sekolah di src/styles. Kelas tambahan berawalan `ui-` hanya penanda animasi.
*/
export const btn = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-kedua',
  danger: 'btn btn-bahaya',
}

export const inputCls = 'form-control'
export const selectCls = 'form-select'
export const labelCls = 'form-label'

// Kartu Bootstrap; padding & warna tambahan lewat className (mis. "p-6", "bg-abu-50")
export function Card({ className = '', children, ...props }) {
  return (
    <div {...props} className={`card ${className}`}>
      {children}
    </div>
  )
}

const TONE = {
  primary: 'bg-merah-50 text-primary',
  emerald: 'bg-success-subtle text-success',
  amber: 'bg-warning-subtle text-warning-emphasis',
  sky: 'bg-info-subtle text-info',
  slate: 'bg-abu-100 text-tinta-2',
}

// Kartu angka berwarna penuh ala kartu bento beranda (dipakai portal satpam)
const NADA = {
  merah: {
    kartu: 'border-merah-tua bg-merah-tua text-white',
    label: 'text-krem',
    nilai: 'text-white',
    hint: 'text-white text-opacity-75',
    ikon: 'bg-white bg-opacity-15 text-white',
  },
  stabilo: {
    kartu: 'border-stabilo bg-stabilo text-tinta',
    label: 'text-tinta text-opacity-80',
    nilai: 'text-tinta',
    hint: 'text-tinta text-opacity-75',
    ikon: 'bg-tinta text-stabilo',
  },
  gelap: {
    kartu: 'border-tinta bg-tinta text-white',
    label: 'text-white text-opacity-75',
    nilai: 'text-white',
    hint: 'text-white text-opacity-60',
    ikon: 'bg-white bg-opacity-10 text-stabilo',
  },
}

// `ke` (opsional) = alamat halaman rinciannya; kartu menjadi tautan dengan tanda panah.
// `nada` (opsional: merah | stabilo | gelap) = kartu berwarna penuh.
export function StatCard({ icon: Icon, label, value, hint, tone = 'primary', ke, nada }) {
  const n = NADA[nada]
  // Nilai panjang (mis. Rp172.200.000) mengecil mengikuti lebar kartu agar tidak keluar kartu
  const ukuranNilai = String(value).length > 9 ? 'kartu-angka__nilai-panjang' : n ? 'fs-3xl fs-sm-4xl' : 'fs-xl fs-sm-2xl'
  const isi = (
    // Kartu sempit (< 10rem, mis. dua kartu per baris di HP): ikon di atas label agar label tidak terpotong.
    // Mengikuti lebar kartu sendiri (container query di _portal.scss), bukan lebar layar.
    <div className="kartu-angka__isi">
      <div className="kartu-angka__teks">
        <p className={`fs-sm fw-medium ${n?.label ?? 'text-tinta-3'}`}>{label}</p>
        <p className={`mt-1 fw-extrabold ls-tight lh-tight ${n?.nilai ?? 'text-tinta'} ${ukuranNilai}`}>
          <AngkaNaik nilai={value} />
        </p>
        {hint && <p className={`mt-1 fs-xs ${n?.hint ?? 'text-tinta-3'}`}>{hint}</p>}
      </div>
      {Icon && (
        <span className={`kartu-angka__ikon d-flex align-items-center justify-content-center flex-shrink-0 ${n?.ikon ?? TONE[tone]}`}>
          <Icon />
        </span>
      )}
    </div>
  )
  if (!ke) return <Card className={`ui-stat kartu-angka p-4 p-sm-5 ${n?.kartu ?? ''}`}>{isi}</Card>
  return (
    <Link to={ke} className="ui-stat card-tautan">
      <Card className={`kartu-angka position-relative h-100 p-4 p-sm-5 ${n?.kartu ?? ''}`}>
        {isi}
        <ChevronRight className="panah-kartu position-absolute ukuran-4" aria-hidden="true" />
      </Card>
    </Link>
  )
}

// Warna avatar ditentukan dari nama agar tiap orang punya warna tetap
const WARNA_AVATAR = ['warna-merah', 'warna-sky', 'warna-amber', 'warna-emerald', 'warna-violet', 'warna-orange']

export function Avatar({ nama = '', size = 'md', className = '' }) {
  const ukuran = { xs: 'ukuran-7 fs-10', sm: 'ukuran-9 fs-xs', md: 'ukuran-11 fs-sm', lg: 'ukuran-16 fs-lg', xl: 'ukuran-24 fs-2xl' }
  const hash = [...nama].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 997, 7)
  // Warna bawaan hanya dipakai jika className tidak menentukan latar sendiri
  const warna = /(^|\s)bg-/.test(className) ? '' : WARNA_AVATAR[hash % WARNA_AVATAR.length]
  return (
    <span className={`d-flex align-items-center justify-content-center flex-shrink-0 rounded-circle fw-bold ${warna} ${ukuran[size]} ${className}`}>
      {inisial(nama)}
    </span>
  )
}

export function Badge({ children, className = 'bg-abu-100 text-tinta-2' }) {
  return <span className={`badge ${className}`}>{children}</span>
}

export const STATUS_ABSEN = {
  H: { label: 'Hadir', cls: 'bg-success-subtle text-success-emphasis', dot: 'titik-emerald' },
  S: { label: 'Sakit', cls: 'bg-warning-subtle text-warning-emphasis', dot: 'titik-amber' },
  I: { label: 'Izin', cls: 'bg-info-subtle text-info-emphasis', dot: 'titik-sky' },
  A: { label: 'Alpa', cls: 'bg-danger-subtle text-danger-emphasis', dot: 'titik-rose' },
}

const STATUS_IZIN = {
  Menunggu: 'bg-warning-subtle text-warning-emphasis',
  Disetujui: 'bg-success-subtle text-success-emphasis',
  Ditolak: 'bg-danger-subtle text-danger-emphasis',
}

export function IzinBadge({ status }) {
  return <Badge className={STATUS_IZIN[status]}>{status}</Badge>
}

const WARNA_KATEGORI = {
  Akademik: 'bg-info-subtle text-info-emphasis',
  Kegiatan: 'bg-success-subtle text-success-emphasis',
  PPDB: 'bg-merah-100 text-merah-700',
  Prestasi: 'bg-warning-subtle text-warning-emphasis',
  Umum: 'bg-abu-100 text-tinta-2',
}

export function KategoriBadge({ kategori }) {
  return <Badge className={WARNA_KATEGORI[kategori]}>{kategori}</Badge>
}

// Ukuran modal: sm (28rem), bawaan (32rem), lg (42rem), xl (56rem)
const UKURAN_MODAL = { sm: 'modal-sm', lg: 'modal-lg', xl: 'modal-xl' }

export function Modal({ open, onClose, title, children, footer, size }) {
  const [tampil, keluar] = useAnimasiKeluar(open)
  // Isi terakhir dipertahankan selama animasi keluar, karena pemanggil biasanya mengosongkan isinya
  // bersamaan dengan menutup modal (mis. `{form && ...}`) sehingga panel akan mengempis sebelum hilang.
  const terakhir = useRef({ title, children, footer })
  if (open) terakhir.current = { title, children, footer }

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!tampil) return null
  const isi = open ? { title, children, footer } : terakhir.current
  return (
    <div className="modal modal-sekolah" data-keluar={keluar || undefined}>
      <div className="latar-modal" onClick={onClose} />
      <div role="dialog" aria-modal="true" className={`panel-modal modal-dialog ${UKURAN_MODAL[size] ?? ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title fs-lg fw-extrabold text-tinta">{isi.title}</h3>
            <button type="button" onClick={onClose} className="btn-close" aria-label="Tutup" />
          </div>
          <div className="modal-body">{isi.children}</div>
          {isi.footer && <div className="modal-footer">{isi.footer}</div>}
        </div>
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center px-6 py-12 text-center">
      {Icon && (
        <span className="ui-ikon-kosong mb-3 d-flex align-items-center justify-content-center ukuran-14 rounded-circle bg-merah-50 text-primary">
          <Icon className="ukuran-7" />
        </span>
      )}
      <p className="fw-semibold text-tinta-2">{title}</p>
      {desc && <p className="mt-1 mw-sm fs-sm text-tinta-3">{desc}</p>}
    </div>
  )
}

// Kolom jebakan bot spam: tidak terlihat & tidak bisa difokus manusia, tetapi sering diisi bot.
// Formulir yang kolom ini terisi tidak disimpan.
export function JebakanBot({ value, onChange }) {
  return (
    <div aria-hidden="true" className="position-absolute pe-none overflow-hidden" style={{ left: -9999, width: 1, height: 1 }}>
      <label>
        Jangan diisi
        <input type="text" name="url_situs" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  )
}

const KELAS_ALERT = { success: 'alert-success', error: 'alert-danger', info: 'alert-info', warning: 'alert-warning' }

export function Alert({ tone = 'success', children }) {
  return (
    <div className={`alert ${KELAS_ALERT[tone]}`}>
      {children}
    </div>
  )
}

// Judul halaman di dalam dashboard. Di portal satpam tampil sebagai pita merah seperti kepala halaman situs.
export function DashHeader({ title, desc, action }) {
  const situs = useGayaSitus()
  if (situs)
    return (
      <div className="pita-portal position-relative isolate mb-6 overflow-hidden rounded-5 bg-merah-tua px-6 py-7 px-sm-9 py-sm-9 text-white">
        <span aria-hidden="true" className="pita-portal__cincin" />
        <div className="d-flex flex-column gap-5 flex-sm-row align-items-sm-end justify-content-sm-between">
          <div>
            <h1 className="pita-portal__judul lh-tight text-white">{title}</h1>
            {desc && <p className="mt-2 mw-2xl lh-relaxed text-krem">{desc}</p>}
          </div>
          {action}
        </div>
      </div>
    )
  return (
    <div className="mb-6 d-flex flex-column gap-3 flex-sm-row align-items-sm-end justify-content-sm-between">
      <div>
        <h1 className="fs-2xl fs-sm-3xl text-tinta">{title}</h1>
        {desc && <p className="mt-1 fs-sm text-tinta-3">{desc}</p>}
      </div>
      {action}
    </div>
  )
}

// Pilihan tab bergaya segmen pil (nav-pills Bootstrap). items: [[kunci, label, jumlah?]]
export function Tabs({ value, onChange, items, className = '' }) {
  return (
    <div className={`nav nav-pills tab-pil ${className}`} role="tablist">
      {items.map(([k, label, n]) => (
        <button key={k} type="button" role="tab" aria-selected={value === k} onClick={() => onChange(k)} className={`nav-link ${value === k ? 'active' : ''}`}>
          {label}
          {n !== undefined && <span className="jumlah">({n})</span>}
        </button>
      ))}
    </div>
  )
}

// Batang progres (0–100). `warna` = kelas latar isian (bawaan: merah), `tinggi` = kelas tinggi (mis. h-2)
export function Progres({ nilai, warna = '', tinggi = '', className = '' }) {
  const persen = Math.max(0, Math.min(100, nilai))
  return (
    <div className={`progress ${tinggi} ${className}`} role="progressbar" aria-valuenow={Math.round(persen)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`progress-bar isi-progres ${warna}`} style={{ width: `${persen}%` }} />
    </div>
  )
}

// Cincin progres melingkar dengan isi di tengah. `warna` = kelas warna teks untuk garis isian.
export function Cincin({ persen, ukuran = 84, tebal = 9, warna = 'teks-terang-emerald', children }) {
  const r = (ukuran - tebal) / 2
  const keliling = 2 * Math.PI * r
  return (
    <div className="position-relative d-grid flex-shrink-0" style={{ width: ukuran, height: ukuran }}>
      <svg width={ukuran} height={ukuran} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx={ukuran / 2} cy={ukuran / 2} r={r} fill="none" strokeWidth={tebal} stroke="#f5f5f4" />
        <circle
          cx={ukuran / 2}
          cy={ukuran / 2}
          r={r}
          fill="none"
          strokeWidth={tebal}
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={keliling}
          strokeDashoffset={keliling * (1 - Math.max(0, Math.min(100, persen)) / 100)}
          className={`isi-cincin cincin-garis ${warna}`}
          style={{ '--keliling': keliling }}
        />
      </svg>
      <div className="position-absolute inset-0 d-flex flex-column align-items-center justify-content-center text-center">{children}</div>
    </div>
  )
}

// Judul kartu dengan ikon dan tautan "lihat semua" opsional
export function JudulKartu({ icon: Icon, judul, children }) {
  return (
    // Tombol/tab di kanan turun ke baris berikutnya bila judul tidak muat (HP)
    <div className="mb-4 d-flex flex-wrap align-items-center justify-content-between column-gap-3 row-gap-2">
      <div className="d-flex min-w-0 align-items-center gap-2">
        {Icon && (
          <span className="d-flex align-items-center justify-content-center ukuran-8 flex-shrink-0 rounded-2 bg-primary text-white">
            <Icon className="ukuran-4" />
          </span>
        )}
        <h2 className="text-truncate fs-base fw-extrabold text-tinta">{judul}</h2>
      </div>
      {children}
    </div>
  )
}
