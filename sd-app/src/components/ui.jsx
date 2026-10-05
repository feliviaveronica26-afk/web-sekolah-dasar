import { useEffect } from 'react'
import { X } from 'lucide-react'
import { inisial } from '../utils/format'

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

export function Card({ className = '', children }) {
  return <div className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}>{children}</div>
}

// Banner judul untuk halaman publik
export function PageHeader({ title, subtitle }) {
  return (
    <section className="relative overflow-hidden bg-primary-600 text-white">
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
      <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-white/5" />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-primary-50">{subtitle}</p>}
      </div>
      <div className="stripe-merah-putih h-2" />
    </section>
  )
}

export function SectionTitle({ eyebrow, title, desc, center = true }) {
  return (
    <div className={`mb-10 ${center ? 'mx-auto max-w-2xl text-center' : ''}`}>
      {eyebrow && <p className="text-sm font-bold uppercase tracking-wider text-primary-600">{eyebrow}</p>}
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
      {desc && <p className="mt-3 text-slate-600">{desc}</p>}
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
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        {Icon && (
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${TONE[tone]}`}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
    </Card>
  )
}

export function Avatar({ nama, size = 'md', className = '' }) {
  const ukuran = { sm: 'h-9 w-9 text-xs', md: 'h-11 w-11 text-sm', lg: 'h-16 w-16 text-lg', xl: 'h-24 w-24 text-2xl' }
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-primary-100 font-bold text-primary-700 ${ukuran[size]} ${className}`}
    >
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
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
      </div>
      {action}
    </div>
  )
}
