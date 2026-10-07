import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowRight, Clock3, LayoutDashboard, LogIn, Mail, Menu, Phone, Sparkles, X } from 'lucide-react'
import Logo from './Logo'
import { btn } from './ui'
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

export default function Navbar() {
  const [buka, setBuka] = useState(false)
  const [tergulir, setTergulir] = useState(false)
  const { user } = useAuth()
  const { pathname } = useLocation()

  // Bayangan navbar muncul setelah halaman digulir
  useEffect(() => {
    const cek = () => setTergulir(window.scrollY > 8)
    cek()
    window.addEventListener('scroll', cek, { passive: true })
    return () => window.removeEventListener('scroll', cek)
  }, [])

  // Tutup menu HP setiap pindah halaman
  useEffect(() => setBuka(false), [pathname])

  const linkCls = ({ isActive }) =>
    `rounded-full px-3 py-2 text-sm font-semibold transition ${
      isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-primary-600'
    }`

  const tombolMasuk = user ? (
    <Link to={`/dashboard/${user.role}`} className={btn.secondary}>
      <LayoutDashboard className="h-4 w-4" /> Dashboard
    </Link>
  ) : (
    <Link to="/login" className={btn.secondary}>
      <LogIn className="h-4 w-4" /> Masuk
    </Link>
  )

  const tombolPpdb = (
    <Link to="/ppdb" className={`${btn.primary} rounded-full!`}>
      <Sparkles className="h-4 w-4" /> Daftar PPDB
    </Link>
  )

  return (
    <header className="sticky top-0 z-40">
      {/* Bar info: kontak cepat & pengumuman PPDB */}
      <div className="hidden bg-primary-900 text-xs text-primary-100 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-2">
          <div className="flex items-center gap-5">
            <a href={`tel:${SEKOLAH.telepon.replace(/\D/g, '')}`} className="flex items-center gap-1.5 hover:text-white">
              <Phone className="h-3.5 w-3.5" /> {SEKOLAH.telepon}
            </a>
            <a href={`mailto:${SEKOLAH.email}`} className="flex items-center gap-1.5 hover:text-white">
              <Mail className="h-3.5 w-3.5" /> {SEKOLAH.email}
            </a>
            <span className="hidden items-center gap-1.5 lg:flex">
              <Clock3 className="h-3.5 w-3.5" /> {SEKOLAH.jamOperasional}
            </span>
          </div>
          <Link to="/ppdb#daftar" className="flex items-center gap-1.5 font-semibold text-amber-300 hover:text-amber-200">
            PPDB {PPDB.tahunAjaran} telah dibuka <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <nav className={`border-b bg-white/95 backdrop-blur transition-shadow ${tergulir ? 'border-slate-200 shadow-md shadow-slate-900/5' : 'border-slate-100'}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo />
          <div className="hidden items-center gap-0.5 xl:flex">
            {MENU.map((m) => (
              <NavLink key={m.to} to={m.to} end={m.to === '/'} className={linkCls}>
                {m.label}
              </NavLink>
            ))}
          </div>
          <div className="hidden items-center gap-2 xl:flex">
            {tombolMasuk}
            {tombolPpdb}
          </div>
          <div className="flex items-center gap-2 xl:hidden">
            <Link to="/ppdb" className="hidden rounded-full bg-primary-600 px-3.5 py-2 text-xs font-bold text-white sm:inline-flex">
              Daftar PPDB
            </Link>
            <button
              onClick={() => setBuka(!buka)}
              className="rounded-xl p-2 text-slate-700 hover:bg-slate-100"
              aria-label={buka ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={buka}
            >
              {buka ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {buka && (
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-100 px-4 pb-5 pt-3 xl:hidden">
            <div className="grid grid-cols-2 gap-1.5">
              {MENU.map((m) => (
                <NavLink
                  key={m.to}
                  to={m.to}
                  end={m.to === '/'}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-sm font-semibold ${isActive ? 'bg-primary-600 text-white' : 'bg-slate-50 text-slate-700'}`
                  }
                >
                  {m.label}
                </NavLink>
              ))}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {tombolPpdb}
              {tombolMasuk}
            </div>
            <div className="mt-4 space-y-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> {SEKOLAH.telepon}
              </p>
              <p className="flex items-center gap-2">
                <Clock3 className="h-3.5 w-3.5" /> {SEKOLAH.jamOperasional}
              </p>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
