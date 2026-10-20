import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowRight, LayoutDashboard, LogIn, Menu, Phone, X } from 'lucide-react'
import { tombol, wadah } from './Situs'
import { useAuth } from '../context/AuthContext'
import { useAnimasiKeluar } from '../utils/gerak'
import { PPDB, SEKOLAH } from '../data/dummy'

const MENU = [
  { to: '/', label: 'Beranda' },
  { to: '/profil', label: 'Profil' },
  { to: '/akademik', label: 'Akademik' },
  { to: '/guru', label: 'Guru' },
  { to: '/fasilitas', label: 'Fasilitas' },
  { to: '/berita', label: 'Berita' },
  { to: '/galeri', label: 'Galeri' },
  { to: '/kontak', label: 'Kontak' },
]

// '1 Okt 2026 – 31 Jan 2027' -> '31 Jan 2027'
const AKHIR_DAFTAR = PPDB.jadwal[0].tanggal.split('–').pop().trim()

export function Merek({ terang = false }) {
  return (
    <Link to="/" aria-label={`${SEKOLAH.nama}, ke beranda`} className="d-flex align-items-center gap-3">
      <img src="/logo.png" alt="" className="ukuran-11 flex-shrink-0 object-fit-contain" />
      <span className="lh-1">
        <span className={`d-block fs-xl fw-extrabold ls-tight ${terang ? 'text-white' : 'text-tinta'}`}>Harapan Gemilang</span>
        <span className={`mt-1 d-block fs-2xs fw-bold text-uppercase ls-lebar-2 ${terang ? 'text-krem' : 'text-merah-700'}`}>Sekolah Dasar</span>
      </span>
    </Link>
  )
}

export default function Navbar() {
  const [buka, setBuka] = useState(false)
  const [tergulir, setTergulir] = useState(false)
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [menuTampil, menuKeluar] = useAnimasiKeluar(buka)

  // Garis bawah navbar muncul setelah halaman digulir
  useEffect(() => {
    const cek = () => setTergulir(window.scrollY > 40)
    cek()
    window.addEventListener('scroll', cek, { passive: true })
    return () => window.removeEventListener('scroll', cek)
  }, [])

  // Tutup menu HP setiap pindah halaman
  useEffect(() => setBuka(false), [pathname])

  const masuk = user
    ? { to: `/dashboard/${user.role}`, icon: LayoutDashboard, label: 'Dashboard' }
    : { to: '/login', icon: LogIn, label: 'Masuk portal' }

  return (
    <>
      {/* Pita pengumuman PPDB */}
      <div className="bg-merah-900 text-white">
        <div className={`${wadah} d-flex min-h-10 flex-wrap align-items-center justify-content-between column-gap-6 row-gap-1 py-2 fs-13`}>
          <p>
            <span className="fw-semibold text-stabilo">PPDB {PPDB.tahunAjaran}</span> dibuka sampai {AKHIR_DAFTAR}.{' '}
            <Link to="/ppdb#daftar" className="tautan-garis fw-semibold">
              Daftar online
            </Link>
          </p>
          <a href={`tel:${SEKOLAH.telepon.replace(/\D/g, '')}`} className="d-none d-md-flex align-items-center gap-1-5 text-krem hover-teks-putih">
            <Phone className="ukuran-3-5" /> {SEKOLAH.telepon} · {SEKOLAH.jamOperasional}
          </a>
        </div>
      </div>

      <header
        className={`navbar-sekolah position-sticky top-0 z-40 border-bottom bg-white bg-opacity-90 buram transisi ${
          tergulir || buka ? 'border-garis tergulir' : 'border-transparent'
        }`}
      >
        <nav aria-label="Menu utama" className={`${wadah} navbar py-0 tinggi-navbar flex-nowrap gap-4`}>
          <Merek />

          <ul className="d-none d-xl-flex align-items-center gap-1">
            {MENU.map((m) => (
              <li key={m.to}>
                <NavLink
                  to={m.to}
                  end={m.to === '/'}
                  className={({ isActive }) =>
                    `d-inline-flex min-h-10 align-items-center rounded-pill px-3-5 fs-15 fw-semibold transisi tekan ${
                      isActive ? 'bg-primary text-white bayangan-aktif' : 'text-tinta-2 hover-latar-merah hover-teks-merah'
                    }`
                  }
                >
                  {m.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="d-none d-xl-flex align-items-center gap-5">
            <Link to={masuk.to} className="d-inline-flex min-h-10 align-items-center gap-1-5 fs-15 fw-bold text-tinta hover-teks-merah">
              <masuk.icon className="ukuran-4" /> {masuk.label}
            </Link>
            <Link to="/ppdb" className="btn btn-primary bayangan min-h-11 px-5 py-2 fs-15">
              Daftar PPDB
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setBuka(!buka)}
            className="d-inline-flex d-xl-none min-h-11 align-items-center gap-2 rounded-pill bg-kertas-tua px-4 fs-15 fw-bold text-tinta hover-latar-garis transisi"
            aria-expanded={buka}
            aria-controls="menu-hp"
          >
            {buka ? <X key="tutup" className="ikon-putar ukuran-5" /> : <Menu key="menu" className="ikon-putar ukuran-5" />}
            {buka ? 'Tutup' : 'Menu'}
          </button>
        </nav>

        {menuTampil && (
          <div
            id="menu-hp"
            data-keluar={menuKeluar || undefined}
            className="menu-hp overflow-y-auto border-top border-garis bg-white d-xl-none"
            style={{ maxHeight: 'calc(100dvh - 4.75rem)' }}
          >
            <ul className={`${wadah} bertahap pembatas-y py-2`}>
              {MENU.map((m) => (
                <li key={m.to}>
                  <NavLink
                    to={m.to}
                    end={m.to === '/'}
                    className={({ isActive }) =>
                      `d-flex align-items-center justify-content-between py-3-5 fs-xl fw-bold ls-tight transisi tekan ${isActive ? 'text-primary' : 'text-tinta hover-teks-merah'}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {m.label}
                        <ArrowRight className={`ukuran-4 ${isActive ? 'text-primary' : 'text-tinta-3'}`} aria-hidden="true" />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className={`${wadah} d-grid gap-3 pb-6 pt-2 kolom-sm-2`}>
              <Link to="/ppdb" className={tombol.utama}>
                Daftar PPDB {PPDB.tahunAjaran}
              </Link>
              <Link to={masuk.to} className={tombol.kedua}>
                <masuk.icon className="ukuran-4" /> {masuk.label}
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
