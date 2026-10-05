import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import Logo from './Logo'
import { SEKOLAH } from '../data/dummy'

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-primary-100">
      <div className="stripe-merah-putih h-2" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed text-primary-200">{SEKOLAH.deskripsi}</p>
          <p className="mt-3 text-sm text-primary-200">
            NPSN {SEKOLAH.npsn} · Akreditasi {SEKOLAH.akreditasi}
          </p>
        </div>

        <div>
          <h3 className="font-bold text-white">Tautan Cepat</h3>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {[
              ['/profil', 'Profil Sekolah'],
              ['/fasilitas', 'Fasilitas'],
              ['/berita', 'Berita'],
              ['/galeri', 'Galeri'],
              ['/ppdb', 'Info PPDB'],
              ['/kontak', 'Kontak'],
              ['/login', 'Portal Orang Tua'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-white">Hubungi Kami</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {SEKOLAH.alamat}
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" /> {SEKOLAH.telepon}
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" /> {SEKOLAH.email}
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" /> {SEKOLAH.jamOperasional}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-primary-300">
        © {new Date().getFullYear()} {SEKOLAH.nama}. Hak cipta dilindungi.
      </div>
    </footer>
  )
}
