import { Link } from 'react-router-dom'
import { Merek } from './Navbar'
import { Catatan, wadah } from './Situs'
import { IkonSosial, SOSIAL } from './Sosial'
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

function Kolom({ judul, children, className = '' }) {
  return (
    <div className={className}>
      <h2 className="fs-13 fw-bold text-uppercase ls-lebar text-stabilo">{judul}</h2>
      <ul className="mt-4 d-flex flex-column gap-1 fs-15">{children}</ul>
    </div>
  )
}

// py-1: area sentuh setinggi ±30px di HP tanpa mengubah jarak antarbaris
const tautan = 'tautan-kaki d-inline-block py-1'

export default function Footer() {
  return (
    <footer className="bg-marun text-white">
      <div className="stripe-merah-putih h-2" aria-hidden="true" />
      <div className={wadah}>
        <div className="row g-6 align-items-lg-end border-bottom border-white border-opacity-10 py-14">
          <p className="col-lg judul-kaki mw-3xl fw-extrabold lh-tight ls-tight">
            Gerbang dibuka pukul <span className="angka">{GERBANG}</span>, Senin sampai Jumat.
          </p>
          <div className="col-lg-auto pb-lg-1">
            <Catatan warna="text-stabilo" className="fs-xl">
              Sampai jumpa di sekolah!
            </Catatan>
          </div>
        </div>
      </div>

      <div className={`${wadah} py-14`}>
        <div className="row gx-6 gy-12">
          <div className="col-sm-6 col-lg-4">
            <Merek terang />
            <p className="mt-6 mw-xs fs-15 lh-relaxed text-krem">{SEKOLAH.alamat}</p>
            <p className="mt-3 fs-15 text-krem">NPSN {SEKOLAH.npsn}</p>
          </div>

          <Kolom judul="Jelajahi" className="col-sm-6 col-lg-2">
            {JELAJAHI.map(([to, label]) => (
              <li key={label}>
                <Link to={to} className={tautan}>
                  {label}
                </Link>
              </li>
            ))}
          </Kolom>

          <Kolom judul="Layanan" className="col-sm-6 col-lg-3">
            {LAYANAN.map(([to, label]) => (
              <li key={label}>
                <Link to={to} className={tautan}>
                  {label}
                </Link>
              </li>
            ))}
          </Kolom>

          <Kolom judul="Hubungi" className="col-sm-6 col-lg-3">
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
              <a href={`mailto:${SEKOLAH.email}`} className={`${tautan} text-break`}>
                {SEKOLAH.email}
              </a>
            </li>
            <li className="py-1 text-krem">{SEKOLAH.jamOperasional}</li>
          </Kolom>
        </div>
      </div>

      <div className={wadah}>
        <div className="d-flex flex-column gap-2 border-top border-white border-opacity-10 py-6 pe-0 fs-sm text-krem flex-md-row align-items-md-center justify-content-md-between pe-md-40">
          <p>
            © {new Date().getFullYear()} {SEKOLAH.nama}. {SEKOLAH.slogan}.
          </p>
          <ul className="d-flex flex-wrap align-items-center column-gap-5" aria-label="Media sosial sekolah">
            {SOSIAL.map(([jenis, layanan, akun, url]) => (
              <li key={jenis}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="tautan-kaki grup d-inline-flex min-h-11 align-items-center gap-2-5">
                  <span className="d-flex ukuran-9 flex-shrink-0 align-items-center justify-content-center rounded-pill bg-white bg-opacity-10 text-white transisi grup-besar">
                    <IkonSosial jenis={jenis} className="ukuran-4-5" />
                  </span>
                  <span>
                    {layanan} <span className="fw-semibold text-white">{akun}</span>
                    <span className="visually-hidden"> (membuka tab baru)</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
