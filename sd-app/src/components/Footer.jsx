import { Link } from 'react-router-dom'
import { Clock3, Mail, MapPin, Phone } from 'lucide-react'
import Logo from './Logo'
import { Bintang } from './Hiasan'
import { SEKOLAH } from '../data/dummy'

// Ikon merek media sosial (tidak tersedia di pustaka ikon)
const SOSMED = [
  {
    label: 'Instagram',
    akun: SEKOLAH.instagram,
    path: 'M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.2-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.2-.4 1.2-.1 1.6-.1 4.8-.1zm0 4.9a4.9 4.9 0 1 0 0 9.8 4.9 4.9 0 0 0 0-9.8zm0 8.1a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.1-9.4a1.1 1.1 0 1 0 0 2.3 1.1 1.1 0 0 0 0-2.3z',
  },
  {
    label: 'YouTube',
    akun: SEKOLAH.youtube,
    path: 'M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15.1V8.9L15.5 12l-5.8 3.1z',
  },
  {
    label: 'Facebook',
    akun: SEKOLAH.facebook,
    path: 'M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z',
  },
]

const JELAJAHI = [
  ['/profil', 'Profil Sekolah'],
  ['/akademik', 'Akademik & Ekskul'],
  ['/guru', 'Guru & Staf'],
  ['/fasilitas', 'Fasilitas & Denah'],
  ['/berita', 'Berita & Pengumuman'],
  ['/galeri', 'Galeri Kegiatan'],
]

const LAYANAN = [
  ['/ppdb', 'Pendaftaran Siswa Baru'],
  ['/ppdb#cek-status', 'Cek Status PPDB'],
  ['/fasilitas#kunjungan', 'Jadwalkan Kunjungan'],
  ['/login', 'Portal Orang Tua'],
  ['/login', 'Portal Siswa'],
  ['/login', 'Portal Guru & Staf'],
]

export default function Footer() {
  return (
    <footer className="relative mt-10 bg-primary-900 text-primary-100">
      <svg className="absolute bottom-[calc(100%-2px)] left-0 h-10 w-full text-primary-900" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
        <path fill="currentColor" d="M0,40 C320,0 640,60 960,30 C1180,10 1320,20 1440,36 L1440,60 L0,60 Z" />
      </svg>
      <div className="pola-titik absolute inset-0 opacity-50" />
      <Bintang className="absolute right-10 top-10 h-5 w-5 text-amber-300/60" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed text-primary-200">{SEKOLAH.deskripsi}</p>
          <p className="mt-3 text-sm text-primary-200">
            NPSN {SEKOLAH.npsn} · Akreditasi {SEKOLAH.akreditasi}
          </p>
          <div className="mt-5 flex gap-2">
            {SOSMED.map((s) => (
              <a
                key={s.label}
                href="#"
                onClick={(e) => e.preventDefault()}
                title={`${s.label}: ${s.akun}`}
                aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-primary-700"
              >
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor" aria-hidden="true">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Jelajahi</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {JELAJAHI.map(([to, label]) => (
              <li key={label}>
                <Link to={to} className="transition hover:text-white hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Layanan</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {LAYANAN.map(([to, label]) => (
              <li key={label}>
                <Link to={to} className="transition hover:text-white hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Hubungi Kami</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /> {SEKOLAH.alamat}
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /> {SEKOLAH.telepon}
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /> {SEKOLAH.email}
            </li>
            <li className="flex gap-2.5">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /> {SEKOLAH.jamOperasional}
            </li>
          </ul>
        </div>
      </div>
      <div className="stripe-merah-putih relative h-1.5" />
      <div className="relative bg-primary-950/40 py-5 text-center text-xs text-primary-300">
        © {new Date().getFullYear()} {SEKOLAH.nama}. Cerdas, Berkarakter, dan Gemilang.
      </div>
    </footer>
  )
}
