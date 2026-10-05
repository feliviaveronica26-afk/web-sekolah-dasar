import { Link } from 'react-router-dom'
import { btn } from '../components/ui'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="text-7xl font-extrabold text-primary-600">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-slate-500">Maaf, halaman yang Anda cari tidak tersedia.</p>
        <Link to="/" className={`${btn.primary} mt-6`}>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
