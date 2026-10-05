import { Link } from 'react-router-dom'

export default function Logo({ light = false, compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img src="/logo.svg" alt="" className={`h-10 w-10 ${light ? 'rounded-full ring-2 ring-white/70' : ''}`} />
      {!compact && (
        <span className="leading-tight">
          <span className={`block text-[11px] font-semibold uppercase tracking-widest ${light ? 'text-primary-100' : 'text-primary-600'}`}>
            Sekolah Dasar
          </span>
          <span className={`block text-base font-extrabold ${light ? 'text-white' : 'text-slate-900'}`}>Harapan Gemilang</span>
        </span>
      )}
    </Link>
  )
}
