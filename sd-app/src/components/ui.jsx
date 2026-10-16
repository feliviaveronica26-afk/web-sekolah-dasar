import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, X } from 'lucide-react'
import { useGayaSitus } from '../context/akses'
import { inisial } from '../utils/format'
import { useAnimasiKeluar } from '../utils/gerak'

/*
  Kelas berawalan `ui-` adalah penanda untuk tampilan bergaya beranda di portal satpam (lihat `.portal-situs`
  di index.css). Di portal lain penanda ini tidak memberi gaya apa pun.
*/
export const btn = {
  primary:
    'ui-tombol ui-tombol-utama inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  secondary:
    'ui-tombol ui-tombol-kedua inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50',
  danger:
    'ui-tombol ui-tombol-bahaya inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400',
}

export const inputCls =
  'ui-isian w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100'

export const labelCls = 'ui-label mb-1.5 block text-sm font-medium text-slate-700'

// Latar & warna garis bawaan hanya dipakai jika className tidak menentukannya sendiri
// (kelas Tailwind yang bertabrakan tidak dijamin urutannya)
export function Card({ className = '', children, ...props }) {
  const latar = /(^|\s)bg-/.test(className) ? '' : 'bg-white'
  const garis = /(^|\s)border-(?!0|2|4|8|[trblxy]|dashed|dotted|double|solid)/.test(className) ? '' : 'border-slate-200/80'
  return (
    <div {...props} className={`ui-kartu rounded-2xl border shadow-sm ${garis} ${latar} ${className}`}>
      {children}
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

// Kartu angka berwarna penuh ala kartu bento beranda (dipakai portal satpam)
const NADA = {
  merah: {
    kartu: 'border-primary-700! bg-primary-700 text-white',
    label: 'text-krem',
    nilai: 'text-white',
    hint: 'text-white/75',
    ikon: 'bg-white/15 text-white',
  },
  stabilo: {
    kartu: 'border-stabilo! bg-stabilo text-tinta',
    label: 'text-tinta/80',
    nilai: 'text-tinta',
    hint: 'text-tinta/70',
    ikon: 'bg-tinta text-stabilo',
  },
  gelap: { kartu: 'border-tinta! bg-tinta text-white', label: 'text-white/75', nilai: 'text-white', hint: 'text-white/60', ikon: 'bg-white/10 text-stabilo' },
}

// `ke` (opsional) = alamat halaman rinciannya; kartu menjadi tautan dengan tanda panah.
// `nada` (opsional: merah | stabilo | gelap) = kartu berwarna penuh.
export function StatCard({ icon: Icon, label, value, hint, tone = 'primary', ke, nada }) {
  const n = NADA[nada]
  // Nilai panjang (mis. Rp172.200.000) mengecil mengikuti lebar kartu agar tidak keluar kartu
  const ukuranNilai =
    String(value).length > 9 ? 'text-[clamp(0.875rem,12cqw,1.5rem)] [overflow-wrap:anywhere]' : n ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'
  const isi = (
    // Kartu sempit (< 10rem, mis. dua kartu per baris di HP): ikon di atas label agar label tidak terpotong.
    // Mengikuti lebar kartu sendiri (container query), bukan lebar layar, jadi cocok di grid 2, 3, maupun 4 kolom.
    <div className="flex flex-col-reverse items-start gap-2 @min-[10rem]:flex-row @min-[10rem]:justify-between sm:gap-3">
      <div className="@container w-full min-w-0 @min-[10rem]:w-auto @min-[10rem]:flex-1">
        <p className={`text-sm font-medium ${n?.label ?? 'text-slate-500'}`}>{label}</p>
        <p className={`mt-1 font-extrabold tracking-tight ${n?.nilai ?? 'text-slate-900'} ${ukuranNilai}`}>{value}</p>
        {hint && <p className={`mt-1 text-xs ${n?.hint ?? 'text-slate-500'}`}>{hint}</p>}
      </div>
      {Icon && (
        <span className={`ui-ikon grid h-9 w-9 shrink-0 place-items-center rounded-lg sm:h-11 sm:w-11 sm:rounded-xl ${n?.ikon ?? TONE[tone]}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
      )}
    </div>
  )
  if (!ke) return <Card className={`@container p-4 sm:p-5 ${n?.kartu ?? ''}`}>{isi}</Card>
  return (
    <Link
      to={ke}
      className="ui-kartu-tautan group block rounded-2xl outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary-400"
    >
      <Card className={`@container relative h-full p-4 transition group-hover:border-primary-200 group-hover:shadow-md sm:p-5 ${n?.kartu ?? ''}`}>
        {isi}
        <ChevronRight
          className="absolute bottom-3 right-3 h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary-500"
          aria-hidden="true"
        />
      </Card>
    </Link>
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
  return <span className={`ui-lencana inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{children}</span>
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
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" data-keluar={keluar || undefined}>
      <div className="latar-modal absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`panel-modal ui-modal relative flex max-h-[92dvh] w-full ${size} flex-col rounded-t-3xl bg-white shadow-xl sm:rounded-3xl`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">{isi.title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{isi.children}</div>
        {isi.footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:pb-4">
            {isi.footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {Icon && (
        <span className="ui-ikon-kosong mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <Icon className="h-7 w-7" />
        </span>
      )}
      <p className="font-semibold text-slate-700">{title}</p>
      {desc && <p className="mt-1 max-w-sm text-sm text-slate-500">{desc}</p>}
    </div>
  )
}

// Kolom jebakan bot spam: tidak terlihat & tidak bisa difokus manusia, tetapi sering diisi bot.
// Formulir yang kolom ini terisi tidak disimpan.
export function JebakanBot({ value, onChange }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Jangan diisi
        <input type="text" name="url_situs" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
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
  return <div className={`ui-alert rounded-xl border px-4 py-3 text-sm ${cls[tone]}`}>{children}</div>
}

// Judul halaman di dalam dashboard. Di portal satpam tampil sebagai pita merah seperti kepala halaman situs.
export function DashHeader({ title, desc, action }) {
  const situs = useGayaSitus()
  if (situs)
    return (
      <div className="ui-pita relative isolate mb-6 overflow-hidden rounded-[2rem] bg-primary-700 px-6 py-7 text-white sm:px-9 sm:py-9">
        <span aria-hidden="true" className="pointer-events-none absolute -right-28 -top-36 -z-10 h-96 w-96 rounded-full border-[4rem] border-white/[0.06]" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[2rem] leading-tight text-white sm:text-[2.6rem]">{title}</h1>
            {desc && <p className="mt-2 max-w-2xl leading-relaxed text-krem">{desc}</p>}
          </div>
          {action}
        </div>
      </div>
    )
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
    <div className={`ui-tab inline-flex max-w-full overflow-x-auto rounded-xl bg-slate-100 p-1 ${className}`} role="tablist">
      {items.map(([k, label, n]) => (
        <button
          key={k}
          role="tab"
          aria-selected={value === k}
          onClick={() => onChange(k)}
          className={`ui-tab-item shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${value === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
    // Tombol/tab di kanan turun ke baris berikutnya bila judul tidak muat (HP)
    <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <div className="flex min-w-0 items-center gap-2">
        {Icon && (
          <span className="ui-judul-ikon grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <h2 className="truncate font-bold text-slate-900">{judul}</h2>
      </div>
      {children}
    </div>
  )
}
