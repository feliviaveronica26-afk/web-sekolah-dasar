import { Link } from 'react-router-dom'
import { Merek } from './Navbar'
import { Catatan, wadah } from './Situs'
import { JAM_SEKOLAH, SEKOLAH } from '../data/dummy'

const JELAJAHI = [
  ['/profil', 'Profil sekolah'],
  ['/akademik', 'Akademik & ekskul'],
  ['/guru', 'Guru & staf'],
  ['/fasilitas', 'Fasilitas & denah'],
  ['/berita', 'Berita & pengumuman'],
  ['/galeri', 'Galeri kegiatan'],
]

const LAYANAN = [
  ['/ppdb', 'Pendaftaran siswa baru'],
  ['/ppdb#cek-status', 'Cek status PPDB'],
  ['/fasilitas#kunjungan', 'Jadwalkan kunjungan'],
  ['/login', 'Portal siswa, orang tua & guru'],
]

const GERBANG = JAM_SEKOLAH.find((j) => j.label === 'Gerbang dibuka')?.jam ?? '06.30'
const nomorWa = (no) => no.replace(/\D/g, '').replace(/^0/, '62')

function Kolom({ judul, children }) {
  return (
    <div>
      <h2 className="text-[13px] font-bold uppercase tracking-[0.16em] text-stabilo">
        {judul}
      </h2>
      <ul className="mt-4 space-y-1 text-[15px]">{children}</ul>
    </div>
  )
}

// py-1: area sentuh setinggi ±30px di HP tanpa mengubah jarak antarbaris
const tautan = 'inline-block py-1 text-white/90 underline decoration-white/0 underline-offset-4 transition hover:text-white hover:decoration-white/60'

export default function Footer() {
  return (
    <footer className="bg-primary-950 text-white">
      <div className="stripe-merah-putih h-2" aria-hidden="true" />
      <div className={wadah}>
        <div className="grid gap-6 border-b border-white/10 py-14 lg:grid-cols-[1fr_auto] lg:items-end">
          <p className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-[2.6rem]">
            Gerbang dibuka pukul <span className="angka">{GERBANG}</span>, Senin sampai Jumat.
          </p>
          <Catatan className="text-xl text-stabilo! lg:pb-1">Sampai jumpa di sekolah!</Catatan>
        </div>
      </div>

      <div className={`${wadah} grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]`}>
        <div>
          <Merek terang />
          <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-krem">{SEKOLAH.alamat}</p>
          <p className="mt-3 text-[15px] text-krem">NPSN {SEKOLAH.npsn}</p>
        </div>

        <Kolom judul="Jelajahi">
          {JELAJAHI.map(([to, label]) => (
            <li key={label}>
              <Link to={to} className={tautan}>
                {label}
              </Link>
            </li>
          ))}
        </Kolom>

        <Kolom judul="Layanan">
          {LAYANAN.map(([to, label]) => (
            <li key={label}>
              <Link to={to} className={tautan}>
                {label}
              </Link>
            </li>
          ))}
        </Kolom>

        <Kolom judul="Hubungi">
          <li>
            <a href={`https://wa.me/${nomorWa(SEKOLAH.whatsapp)}`} target="_blank" rel="noreferrer" className={tautan}>
              WhatsApp {SEKOLAH.whatsapp}
            </a>
          </li>
          <li>
            <a href={`tel:${SEKOLAH.telepon.replace(/\D/g, '')}`} className={tautan}>
              Telepon {SEKOLAH.telepon}
            </a>
          </li>
          <li>
            <a href={`mailto:${SEKOLAH.email}`} className={`${tautan} [overflow-wrap:anywhere]`}>
              {SEKOLAH.email}
            </a>
          </li>
          <li className="py-1 text-krem">{SEKOLAH.jamOperasional}</li>
        </Kolom>
      </div>

      <div className={wadah}>
        <div className="flex flex-col gap-2 border-t border-white/10 py-6 pr-0 text-sm text-krem md:flex-row md:items-center md:justify-between md:pr-40">
          <p>
            © {new Date().getFullYear()} {SEKOLAH.nama}. {SEKOLAH.slogan}.
          </p>
          <p>
            Instagram {SEKOLAH.instagram} · YouTube {SEKOLAH.youtube}
          </p>
        </div>
      </div>
    </footer>
  )
}
