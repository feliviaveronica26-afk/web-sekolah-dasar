import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import KontakMelayang from './KontakMelayang'

// Kelas `situs` menyalakan gaya halaman publik (lihat index.css)
export default function PublicLayout() {
  const { pathname } = useLocation()
  return (
    <div className="situs flex min-h-screen flex-col">
      <a
        href="#isi"
        className="sr-only z-[60] rounded-md bg-tinta px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Langsung ke isi halaman
      </a>
      <Navbar />
      <main id="isi" tabIndex={-1} className="flex-1 focus:outline-none">
        {/* Kunci pathname: halaman baru memudar masuk (lihat .masuk-situs) */}
        <div key={pathname} className="masuk-situs">
          <Outlet />
        </div>
      </main>
      <Footer />
      <KontakMelayang />
    </div>
  )
}
