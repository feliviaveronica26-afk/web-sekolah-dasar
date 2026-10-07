import { Link } from 'react-router-dom'

export default function Logo({ light = false, compact = false }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <img
        src="/logo.png"
        alt={compact ? 'SD Harapan Gemilang' : ''}
        className={`h-12 w-12 object-contain transition group-hover:rotate-[-6deg] ${light ? 'drop-shadow-lg' : 'drop-shadow-sm'}`}
      />
      {!compact && (
        <span className="leading-tight">
          <span className={`block text-[11px] font-bold uppercase tracking-[0.18em] ${light ? 'text-primary-200' : 'text-primary-600'}`}>
            Sekolah Dasar
          </span>
          <span className={`block font-display text-lg font-bold ${light ? 'text-white' : 'text-slate-900'}`}>Harapan Gemilang</span>
        </span>
      )}
    </Link>
  )
}
