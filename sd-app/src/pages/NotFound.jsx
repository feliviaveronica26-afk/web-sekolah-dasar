import { Link } from 'react-router-dom'
import { Merek } from '../components/Navbar'
import { Foto, tombol } from '../components/Situs'
import { FOTO } from '../data/foto'

export default function NotFound() {
  return (
    <div className="d-flex min-vh-100 flex-column px-4 py-8 px-sm-10">
      <Merek />
      <main className="mx-auto w-100 mw-6xl flex-1 py-16 d-flex align-items-center">
        <div className="row gx-0 gy-12 gx-lg-12 align-items-center w-100">
          <div className="col-lg-7">
            <p className="angka angka-404 fw-extrabold lh-1 ls-tighter text-primary">404</p>
            <h1 className="mt-4 fs-4xl fs-sm-5xl lh-tight">Halaman yang Anda cari tidak ditemukan.</h1>
            <p className="mt-4 mw-lg fs-lg lh-relaxed text-tinta-2">Mungkin tautannya salah ketik atau halamannya sudah dipindahkan.</p>
            <div className="mt-9 d-flex flex-wrap gap-3">
              <Link to="/" className={tombol.utama}>
                Ke beranda
              </Link>
              <button type="button" onClick={() => window.history.back()} className={tombol.kedua}>
                Halaman sebelumnya
              </button>
            </div>
          </div>
          <div className="col-lg-5 d-none d-lg-block">
            <div className="rasio-4x5 overflow-hidden rounded-5">
              <Foto foto={FOTO.jelajah} alt="" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
