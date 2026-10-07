import { useEffect } from 'react'
import { X } from 'lucide-react'
import { inisial } from '../utils/format'
import { Awan, Bintang, Gelombang, Gumpalan } from './Hiasan'

export const btn = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  secondary:
    'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50',
  danger:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400',
}

export const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100'

export const labelCls = 'mb-1.5 block text-sm font-medium text-slate-700'

// Latar & warna garis bawaan hanya dipakai jika className tidak menentukannya sendiri
// (kelas Tailwind yang bertabrakan tidak dijamin urutannya)
export function Card({ className = '', children, ...props }) {
  const latar = /(^|\s)bg-/.test(className) ? '' : 'bg-white'
  const garis = /(^|\s)border-(?!0|2|4|8|[trblxy]|dashed|dotted|double|solid)/.test(className) ? '' : 'border-slate-200/80'
  return (
    <div {...props} className={`rounded-2xl border shadow-sm ${garis} ${latar} ${className}`}>
      {children}
    </div>
  )
}

// Banner judul untuk halaman publik. `gelombang` = warna latar bagian berikutnya (kelas teks).
export function PageHeader({ title, subtitle, eyebrow, gelombang = 'text-white', children }) {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-primary-600 via-primary-600 to-primary-700 text-white">
      <div className="pola-titik absolute inset-0" />
      <Gumpalan className="absolute -right-24 -top-28 h-96 w-96 text-white/10" />
      <Gumpalan className="absolute -bottom-40 left-1/4 h-80 w-80 rotate-45 text-primary-800/30" />
      <Bintang className="absolute right-[20%] top-10 h-6 w-6 animate-melayang text-amber-300" />
      <Bintang className="absolute bottom-24 right-[8%] h-4 w-4 text-white/60" />
      <Awan className="absolute left-[58%] top-10 hidden h-8 w-16 animate-melayang text-white/20 md:block" />
      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-16">
        {eyebrow && (
          <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider ring-1 ring-white/25">
            <Bintang className="h-3.5 w-3.5 text-amber-300" /> {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg text-primary-50">{subtitle}</p>}
        {children}
      </div>
      <Gelombang warna={gelombang} />
    </section>
  )
}

// `rapat` = tanpa jarak bawah (mis. saat berdampingan dengan tautan)
export function SectionTitle({ eyebrow, title, desc, center = true, rapat = false }) {
  return (
    <div className={`${rapat ? '' : 'mb-10'} ${center ? 'mx-auto max-w-2xl text-center' : ''}`}>
      {eyebrow && (
        <p className={`inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-700`}>
          <Bintang className="h-3.5 w-3.5 text-amber-400" /> {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h2>
      {desc && <p className="mt-3 text-lg text-slate-600">{desc}</p>}
    </div>
  )
}

const TONE = {
  primary: 'bg-primary-50 text-primary-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  sky: 'bg-sky-50 text-sky-600',
  slate: 'bg-slate-100 text-slate-600',
}

export function StatCard({ icon: Icon, label, value, hint, tone = 'primary' }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        {Icon && (
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg sm:h-11 sm:w-11 sm:rounded-xl ${TONE[tone]}`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
        )}
      </div>
    </Card>
  )
}

// Warna avatar ditentukan dari nama agar tiap orang punya warna tetap
const WARNA_AVATAR = [
  'bg-primary-100 text-primary-700',
  'bg-sky-100 text-sky-700',
  'bg-amber-100 text-amber-800',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
]

export function Avatar({ nama = '', size = 'md', className = '' }) {
  const ukuran = { xs: 'h-7 w-7 text-[10px]', sm: 'h-9 w-9 text-xs', md: 'h-11 w-11 text-sm', lg: 'h-16 w-16 text-lg', xl: 'h-24 w-24 text-2xl' }
  const hash = [...nama].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 997, 7)
  // Warna bawaan hanya dipakai jika className tidak menentukan latar sendiri
  const warna = /(^|\s)bg-/.test(className) ? '' : WARNA_AVATAR[hash % WARNA_AVATAR.length]
  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-display font-bold ${warna} ${ukuran[size]} ${className}`}>
      {inisial(nama)}
    </span>
  )
}

export function Badge({ children, className = 'bg-slate-100 text-slate-700' }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{children}</span>
}

export const STATUS_ABSEN = {
  H: { label: 'Hadir', cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  S: { label: 'Sakit', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  I: { label: 'Izin', cls: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500' },
  A: { label: 'Alpa', cls: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
}

const STATUS_IZIN = {
  Menunggu: 'bg-amber-100 text-amber-700',
  Disetujui: 'bg-emerald-100 text-emerald-700',
  Ditolak: 'bg-rose-100 text-rose-700',
}

export function IzinBadge({ status }) {
  return <Badge className={STATUS_IZIN[status]}>{status}</Badge>
}

const WARNA_KATEGORI = {
  Akademik: 'bg-sky-100 text-sky-700',
  Kegiatan: 'bg-emerald-100 text-emerald-700',
  PPDB: 'bg-primary-100 text-primary-700',
  Prestasi: 'bg-amber-100 text-amber-700',
  Umum: 'bg-slate-100 text-slate-700',
}

export function KategoriBadge({ kategori }) {
  return <Badge className={WARNA_KATEGORI[kategori]}>{kategori}</Badge>
}

export function Modal({ open, onClose, title, children, footer, size = 'max-w-lg' }) {
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

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative flex max-h-[92vh] w-full ${size} flex-col rounded-t-3xl bg-white shadow-xl sm:rounded-3xl`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {Icon && (
        <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <Icon className="h-7 w-7" />
        </span>
      )}
      <p className="font-semibold text-slate-700">{title}</p>
      {desc && <p className="mt-1 max-w-sm text-sm text-slate-500">{desc}</p>}
    </div>
  )
}

export function Alert({ tone = 'success', children }) {
  const cls = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-rose-200 bg-rose-50 text-rose-800',
    info: 'border-sky-200 bg-sky-50 text-sky-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
  }
  return <div className={`rounded-xl border px-4 py-3 text-sm ${cls[tone]}`}>{children}</div>
}

// Judul halaman di dalam dashboard
export function DashHeader({ title, desc, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
        {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
      </div>
      {action}
    </div>
  )
}

// Pilihan tab bergaya segmen. items: [[kunci, label, jumlah?]]
export function Tabs({ value, onChange, items, className = '' }) {
  return (
    <div className={`inline-flex max-w-full overflow-x-auto rounded-xl bg-slate-100 p-1 ${className}`} role="tablist">
      {items.map(([k, label, n]) => (
        <button
          key={k}
          role="tab"
          aria-selected={value === k}
          onClick={() => onChange(k)}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${value === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {label}
          {n !== undefined && <span className="ml-1 text-xs text-slate-400">({n})</span>}
        </button>
      ))}
    </div>
  )
}

// Batang progres sederhana (0–100)
export function Progres({ nilai, warna = 'bg-primary-500', tinggi = 'h-2.5', className = '' }) {
  return (
    <div className={`overflow-hidden rounded-full bg-slate-100 ${tinggi} ${className}`}>
      <div className={`h-full rounded-full transition-all duration-700 ${warna}`} style={{ width: `${Math.max(0, Math.min(100, nilai))}%` }} />
    </div>
  )
}

// Cincin progres melingkar dengan isi di tengah
export function Cincin({ persen, ukuran = 84, tebal = 9, warna = 'text-emerald-500', children }) {
  const r = (ukuran - tebal) / 2
  const keliling = 2 * Math.PI * r
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: ukuran, height: ukuran }}>
      <svg width={ukuran} height={ukuran} className="-rotate-90" aria-hidden="true">
        <circle cx={ukuran / 2} cy={ukuran / 2} r={r} fill="none" strokeWidth={tebal} className="stroke-slate-100" />
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
          className={`transition-all duration-700 ${warna}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}

// Judul kartu dengan ikon dan tautan "lihat semua" opsional
export function JudulKartu({ icon: Icon, judul, children }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {Icon && (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <h2 className="truncate font-bold text-slate-900">{judul}</h2>
      </div>
      {children}
    </div>
  )
}
