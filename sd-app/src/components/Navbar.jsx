import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { LayoutDashboard, LogIn, Menu, X } from 'lucide-react'
import Logo from './Logo'
import { btn } from './ui'
import { useAuth } from '../context/AuthContext'

const MENU = [
  { to: '/', label: 'Beranda' },
  { to: '/profil', label: 'Profil' },
  { to: '/fasilitas', label: 'Fasilitas' },
  { to: '/berita', label: 'Berita' },
  { to: '/galeri', label: 'Galeri' },
  { to: '/ppdb', label: 'PPDB' },
  { to: '/kontak', label: 'Kontak' },
]

export default function Navbar() {
  const [buka, setBuka] = useState(false)
  const { user } = useAuth()

  const linkCls = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition ${
      isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:text-primary-600'
    }`

  const tombolMasuk = user ? (
    <Link to={`/dashboard/${user.role}`} className={btn.primary}>
      <LayoutDashboard className="h-4 w-4" /> Dashboard
    </Link>
  ) : (
    <Link to="/login" className={btn.primary}>
      <LogIn className="h-4 w-4" /> Masuk / Login
    </Link>
  )

  return (
    <header className="sticky top-0 z-40">
      <nav className="border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <div className="hidden items-center gap-1 lg:flex">
            {MENU.map((m) => (
              <NavLink key={m.to} to={m.to} end={m.to === '/'} className={linkCls}>
                {m.label}
              </NavLink>
            ))}
          </div>
          <div className="hidden lg:block">{tombolMasuk}</div>
          <button
            onClick={() => setBuka(!buka)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Buka menu"
            aria-expanded={buka}
          >
            {buka ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {buka && (
          <div className="border-t border-slate-100 px-4 pb-4 pt-2 lg:hidden">
            <div className="flex flex-col gap-1">
              {MENU.map((m) => (
                <NavLink key={m.to} to={m.to} end={m.to === '/'} className={linkCls} onClick={() => setBuka(false)}>
                  {m.label}
                </NavLink>
              ))}
            </div>
            <div className="mt-3 grid" onClick={() => setBuka(false)}>
              {tombolMasuk}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
