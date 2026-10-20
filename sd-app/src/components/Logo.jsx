import { Link } from 'react-router-dom'

export default function Logo({ light = false, compact = false }) {
  return (
    <Link to="/" className="logo-portal d-flex align-items-center gap-2-5">
      <img src="/logo.png" alt={compact ? 'SD Harapan Gemilang' : ''} className={`logo-portal__gambar ukuran-12 object-fit-contain ${light ? 'bayangan-logo-terang' : 'bayangan-logo'}`} />
      {!compact && (
        <span className="lh-tight">
          <span className={`d-block fs-2xs fw-bold text-uppercase ls-lebar ${light ? 'text-merah-200' : 'text-primary'}`}>Sekolah Dasar</span>
          <span className={`d-block fs-lg fw-bold ${light ? 'text-white' : 'text-tinta'}`}>Harapan Gemilang</span>
        </span>
      )}
    </Link>
  )
}
