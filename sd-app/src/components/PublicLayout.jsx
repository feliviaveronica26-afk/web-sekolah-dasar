import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import KontakMelayang from './KontakMelayang'

export default function PublicLayout() {
  const { pathname } = useLocation()
  return (
    <div className="d-flex min-vh-100 flex-column">
      {/* Bilah tipis di puncak layar: seberapa jauh halaman sudah dibaca (lihat .progres-baca) */}
      <div aria-hidden="true" className="progres-baca pe-none position-fixed top-0 start-0 end-0 z-70 bg-primary" style={{ height: 3 }} />
      <a href="#isi" className="visually-hidden-focusable position-fixed top-0 start-0 m-4 z-60 rounded-1 bg-tinta px-4 py-2 fw-semibold text-white">
        Langsung ke isi halaman
      </a>
      <Navbar />
      {/* overflow-x-clip: elemen yang menunggu masuk dari samping (<Muncul gaya="kanan">) tidak membuat halaman
          bisa digeser ke samping di HP. `clip` (bukan hidden) agar elemen sticky di dalamnya tetap berfungsi. */}
      <main id="isi" tabIndex={-1} className="flex-grow-1 overflow-x-clip tanpa-garis-fokus">
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
