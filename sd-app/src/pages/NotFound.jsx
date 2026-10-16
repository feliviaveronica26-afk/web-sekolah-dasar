import { Link } from 'react-router-dom'
import { Merek } from '../components/Navbar'
import { Foto, tombol } from '../components/Situs'
import { FOTO } from '../data/foto'

export default function NotFound() {
  return (
    <div className="situs flex min-h-screen flex-col px-4 py-8 sm:px-10">
      <Merek />
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="angka text-[7rem] font-extrabold leading-none tracking-tighter text-primary-600 sm:text-[10rem]">404</p>
          <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">Halaman yang Anda cari tidak ditemukan.</h1>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-tinta-2">Mungkin tautannya salah ketik atau halamannya sudah dipindahkan.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/" className={tombol.utama}>
              Ke beranda
            </Link>
            <button type="button" onClick={() => window.history.back()} className={tombol.kedua}>
              Halaman sebelumnya
            </button>
          </div>
        </div>
        <div className="hidden aspect-[4/5] overflow-hidden rounded-[2rem] lg:block">
          <Foto foto={FOTO.jelajah} alt="" />
        </div>
      </main>
    </div>
  )
}
