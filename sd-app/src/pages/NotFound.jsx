import { Link } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import { Bintang, Gumpalan, IlustrasiBuku } from '../components/Hiasan'
import { btn } from '../components/ui'

export default function NotFound() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-primary-50 px-4 text-center">
      <div className="pola-titik-merah absolute inset-0" />
      <Gumpalan className="absolute -right-32 -top-32 h-96 w-96 text-primary-100" />
      <Bintang className="absolute left-[15%] top-[20%] h-8 w-8 animate-melayang text-amber-400" />
      <div className="relative">
        <IlustrasiBuku className="mx-auto h-36 w-44 animate-melayang" />
        <p className="font-display text-8xl font-bold text-primary-600">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Ups, halamannya tersesat!</h1>
        <p className="mx-auto mt-2 max-w-sm text-slate-600">Sepertinya halaman ini sedang bermain petak umpet. Yuk kembali ke tempat yang kita kenal.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/" className={`${btn.primary} rounded-full! px-6 py-3`}>
            <Home className="h-4 w-4" /> Ke Beranda
          </Link>
          <button onClick={() => window.history.back()} className={`${btn.secondary} rounded-full! px-6 py-3`}>
            <ArrowLeft className="h-4 w-4" /> Halaman sebelumnya
          </button>
        </div>
      </div>
    </div>
  )
}
