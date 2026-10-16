import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowRight, LayoutDashboard, LogIn, Menu, Phone, X } from 'lucide-react'
import { tombol, wadah } from './Situs'
import { useAuth } from '../context/AuthContext'
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
    <Link to="/" aria-label={`${SEKOLAH.nama}, ke beranda`} className="flex items-center gap-3">
      <img src="/logo.png" alt="" className="h-11 w-11 shrink-0 object-contain" />
      <span className="leading-none">
        <span className={`block text-[1.2rem] font-extrabold tracking-tight ${terang ? 'text-white' : 'text-tinta'}`}>Harapan Gemilang</span>
        <span className={`mt-1 block text-[11px] font-bold uppercase tracking-[0.2em] ${terang ? 'text-krem' : 'text-primary-700'}`}>Sekolah Dasar</span>
      </span>
    </Link>
  )
}

export default function Navbar() {
  const [buka, setBuka] = useState(false)
  const [tergulir, setTergulir] = useState(false)
  const { user } = useAuth()
  const { pathname } = useLocation()

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
      <div className="bg-primary-900 text-white">
        <div className={`${wadah} flex min-h-10 flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2 text-[13px]`}>
          <p>
            <span className="font-semibold text-stabilo">PPDB {PPDB.tahunAjaran}</span> dibuka sampai {AKHIR_DAFTAR}.{' '}
            <Link to="/ppdb#daftar" className="font-semibold underline decoration-krem/50 underline-offset-4 hover:decoration-white">
              Daftar online
            </Link>
          </p>
          <a href={`tel:${SEKOLAH.telepon.replace(/\D/g, '')}`} className="hidden items-center gap-1.5 text-krem hover:text-white md:flex">
            <Phone className="h-3.5 w-3.5" /> {SEKOLAH.telepon} · {SEKOLAH.jamOperasional}
          </a>
        </div>
      </div>

      <header className={`sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md transition ${tergulir || buka ? 'border-garis shadow-[0_8px_30px_-20px_rgb(26_21_18/0.35)]' : 'border-transparent'}`}>
        <nav aria-label="Menu utama" className={`${wadah} flex h-[4.75rem] items-center justify-between gap-4`}>
          <Merek />

          <ul className="hidden items-center gap-1 xl:flex">
            {MENU.map((m) => (
              <li key={m.to}>
                <NavLink
                  to={m.to}
                  end={m.to === '/'}
                  className={({ isActive }) =>
                    `inline-flex min-h-10 items-center rounded-full px-3.5 text-[15px] font-semibold transition ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-tinta-2 hover:bg-kertas-tua hover:text-tinta'
                    }`
                  }
                >
                  {m.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-5 xl:flex">
            <Link to={masuk.to} className="inline-flex min-h-10 items-center gap-1.5 text-[15px] font-bold text-tinta hover:text-primary-700">
              <masuk.icon className="h-4 w-4" /> {masuk.label}
            </Link>
            <Link to="/ppdb" className={`${tombol.utama} min-h-11! px-5! py-2!`}>
              Daftar PPDB
            </Link>
          </div>

          <button
            onClick={() => setBuka(!buka)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-kertas-tua px-4 text-[15px] font-bold text-tinta hover:bg-garis xl:hidden"
            aria-expanded={buka}
            aria-controls="menu-hp"
          >
            {buka ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            {buka ? 'Tutup' : 'Menu'}
          </button>
        </nav>

        {buka && (
          <div id="menu-hp" className="max-h-[calc(100dvh-4.75rem)] overflow-y-auto border-t border-garis bg-white xl:hidden">
            <ul className={`${wadah} divide-y divide-garis py-2`}>
              {MENU.map((m) => (
                <li key={m.to}>
                  <NavLink
                    to={m.to}
                    end={m.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center justify-between py-3.5 text-xl font-bold tracking-tight ${isActive ? 'text-primary-700' : 'text-tinta'}`
                    }
                  >
                    {m.label}
                    <ArrowRight className="h-4 w-4 text-tinta-3" aria-hidden="true" />
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className={`${wadah} grid gap-3 pb-6 pt-2 sm:grid-cols-2`}>
              <Link to="/ppdb" className={tombol.utama}>
                Daftar PPDB {PPDB.tahunAjaran}
              </Link>
              <Link to={masuk.to} className={tombol.kedua}>
                <masuk.icon className="h-4 w-4" /> {masuk.label}
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
