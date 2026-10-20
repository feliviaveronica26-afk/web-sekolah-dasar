// Komponen tampilan khusus halaman publik (beranda, profil, PPDB, dst.), dibangun dengan Bootstrap 5.3.
// Gaya modern merah putih: huruf sans tebal, sudut membulat, tombol pil, dan foto kegiatan sekolah.
// Portal memakai komponen di ui.jsx, bukan file ini. Gaya khususnya ada di src/styles/_situs.scss.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Pause, Play, Sparkles } from 'lucide-react'
import { Muncul, TeksNaik } from './Hiasan'

// Wadah halaman: lebar penuh sampai 1280px, jarak tepi 16/24/32px
export const wadah = 'container-xl px-4 px-sm-6 px-lg-8'

export const tombol = {
  utama: 'btn btn-lg btn-primary bayangan',
  kedua: 'btn btn-lg btn-kedua',
  gelap: 'btn btn-lg btn-tinta',
  terang: 'btn btn-lg btn-terang',
  garisTerang: 'btn btn-lg btn-garis-terang',
}

// Pembungkus komponen yang dipakai bersama portal (kalender, denah kelas) agar serasi di halaman publik
export const selarasKertas = 'selaras-kertas'

// Kolom isian formulir publik
export const isian = 'form-control form-control-lg'
export const isianPilih = 'form-select form-select-lg'
export const labelIsian = 'form-label fs-15 fw-semibold'

// Pilihan bergaya tombol (mis. jenis kelamin, sesi): terpilih = berlatar merah.
// `ukuran` = padding & huruf (utilitas sejenis tidak bisa saling menimpa, jadi diganti lewat parameter ini)
export const pilihan = (aktif, ukuran = 'px-3 py-2-5 fs-15') => `btn rounded-2 fw-semibold ${ukuran} ${aktif ? 'btn-primary' : 'btn-kedua'}`

// Pil penyaring (kategori berita/galeri, kelompok guru): terpilih = merah. Jumlahnya pakai angkaSaring.
export const pilSaring = (aktif) => `ui-saring btn rounded-pill min-h-11 px-5 fs-15 fw-bold ${aktif ? 'btn-primary' : 'btn-kedua'}`
export const angkaSaring = (aktif) => `angka rounded-pill px-2 py-0-5 fs-xs ${aktif ? 'bg-white bg-opacity-20' : 'bg-kertas-tua text-tinta-3'}`

// Tautan teks dengan panah kecil
export function TautanPanah({ to, href, children, className = '', terang = false }) {
  const cls = `geser-panah d-inline-flex align-items-center gap-1-5 fw-bold transisi ${
    terang ? 'text-white hover-teks-stabilo' : 'text-merah-700 hover-teks-merah-800'
  } ${className}`
  const isi = (
    <>
      {children}
      <ArrowRight className="ukuran-4" aria-hidden="true" />
    </>
  )
  return to ? (
    <Link to={to} className={cls}>
      {isi}
    </Link>
  ) : (
    <a href={href} className={cls}>
      {isi}
    </a>
  )
}

// Label kecil berbentuk pil di atas judul bagian. `terang` = di atas latar merah/gelap.
export function Label({ children, terang = false, className = '' }) {
  return (
    <p
      className={`d-inline-flex align-items-center gap-2 rounded-pill px-3-5 py-1-5 fs-13 fw-bold border ${
        terang ? 'bg-white bg-opacity-10 text-white border-white border-opacity-25' : 'bg-merah-50 text-merah-700 border-merah-100'
      } ${className}`}
    >
      <span aria-hidden="true" className={`ukuran-1-5 rounded-circle ${terang ? 'bg-stabilo' : 'bg-primary'}`} />
      {children}
    </p>
  )
}

// Catatan kecil penyemangat (selalu pelengkap, bukan satu-satunya informasi)
export function Catatan({ children, className = '', warna = 'text-merah-700', as: Tag = 'p' }) {
  return (
    <Tag className={`d-inline-flex align-items-center gap-2 fs-base fw-semibold ${warna} ${className}`}>
      <Sparkles className="ukuran-4 flex-shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </Tag>
  )
}

export function JudulBagian({ label, judul, desc, aksi, terang = false, className = 'mb-12' }) {
  return (
    <div className={`d-flex flex-column gap-6 flex-md-row align-items-md-end justify-content-md-between ${className}`}>
      {/* Label, judul, lalu ringkasan muncul berurutan saat bagian ini masuk layar */}
      <Muncul gaya="bertahap" className="mw-3xl">
        {label && <Label terang={terang}>{label}</Label>}
        <h2 className={`judul-bagian mt-5 ${terang ? 'text-white' : 'text-tinta'}`}>{judul}</h2>
        {desc && <p className={`mt-5 mw-2xl fs-lg lh-relaxed ${terang ? 'text-krem' : 'text-tinta-2'}`}>{desc}</p>}
      </Muncul>
      {aksi && (
        <Muncul jeda={240} className="flex-shrink-0 pb-md-2">
          {aksi}
        </Muncul>
      )}
    </div>
  )
}

// Jejak halaman di atas latar merah. daftar: [[alamat, label], ...]; item terakhir = halaman ini.
export function Jejak({ daftar }) {
  return (
    <nav aria-label="Jejak halaman" className="d-flex flex-wrap align-items-center gap-1 fs-sm fw-medium text-krem">
      {daftar.map(([to, label], i) =>
        i < daftar.length - 1 ? (
          <span key={label} className="d-inline-flex align-items-center gap-1">
            <Link to={to} className="jejak-tautan my-n1-5 d-inline-block py-1-5">
              {label}
            </Link>
            <ChevronRight aria-hidden="true" className="ukuran-3-5 opacity-70" />
          </span>
        ) : (
          <span key={label} aria-current="page" className="text-white">
            {label}
          </span>
        ),
      )}
    </nav>
  )
}

// Latar merah pembuka halaman
export function PitaMerah({ children, className = '' }) {
  return (
    <header className="position-relative isolate overflow-hidden bg-merah-tua text-white">
      {/* Cincin tipis sebagai aksen latar */}
      <span aria-hidden="true" className="pita-merah__cincin" />
      <div className={`${wadah} position-relative ${className}`}>{children}</div>
    </header>
  )
}

// Foto berbingkai bulat dengan aksen kotak kuning di belakangnya.
// Saat halaman dibuka, foto terbuka dari bawah lalu kotak kuning keluar dari baliknya (`tunda` dalam ms).
export function FotoBingkai({ foto, className = '', rasio = 'rasio-4x3', prioritas = false, tunda = 200 }) {
  return (
    <div className={`position-relative ${className}`}>
      <span aria-hidden="true" className="foto-bingkai__sudut sudut-awal" style={{ '--tunda': `${tunda + 450}ms` }} />
      <div
        className={`foto-bingkai__foto tirai-awal ${rasio}`}
        style={{ '--tunda': `${tunda}ms`, '--sudut-tirai': '2rem', '--tirai-luar': '4.5rem' }}
      >
        <Foto foto={foto} prioritas={prioritas} />
      </div>
    </div>
  )
}

// Judul halaman (selain beranda): jejak, judul besar, ringkasan, foto, dan isi tambahan (mis. indeks bagian)
export function KepalaHalaman({ jejak, judul, desc, catatan, foto, children }) {
  // Ringkasan menyusul setelah kata terakhir judul mulai naik
  const sesudahJudul = 220 + (typeof judul === 'string' ? judul.split(' ').length : 4) * 55
  return (
    <PitaMerah className="pb-14 pt-8 pt-sm-10 pb-lg-20 pt-lg-12">
      <div className={foto ? 'row gx-0 gy-12 gx-lg-16 align-items-lg-center' : ''}>
        <div className={foto ? 'col-lg-7' : ''}>
          <div className="turun-awal">
            <Jejak
              daftar={[
                ['/', 'Beranda'],
                [null, jejak],
              ]}
            />
          </div>
          <h1 className="judul-halaman mt-6 mw-4xl text-white" style={{ '--tunda-teks': '120ms' }}>
            {typeof judul === 'string' ? <TeksNaik teks={judul} /> : judul}
          </h1>
          {desc && (
            <p className="masuk-awal mt-6 mw-2xl fs-lg fs-sm-xl lh-relaxed text-krem" style={{ '--tunda': `${sesudahJudul}ms` }}>
              {desc}
            </p>
          )}
          {catatan && (
            <p
              className="masuk-awal mt-7 d-inline-flex align-items-center gap-2 rounded-pill bg-merah-900 bg-opacity-70 px-4 py-2 fs-sm fw-semibold text-stabilo border border-white border-opacity-10"
              style={{ '--tunda': `${sesudahJudul + 100}ms` }}
            >
              <Sparkles className="ukuran-4 flex-shrink-0" aria-hidden="true" />
              {catatan}
            </p>
          )}
        </div>
        {foto && (
          <div className="col-lg-5">
            <FotoBingkai foto={foto} prioritas className="ms-4 ms-lg-0" />
          </div>
        )}
      </div>
      {children}
    </PitaMerah>
  )
}

// Daftar tautan ke bagian-bagian halaman (di dalam latar merah)
export function IndeksHalaman({ daftar }) {
  return (
    <nav
      aria-label="Bagian halaman ini"
      className="masuk-awal mt-12 d-flex flex-wrap align-items-center gap-2-5 border-top border-white border-opacity-15 pt-6"
      style={{ '--tunda': '700ms' }}
    >
      <span className="me-1 fs-sm fw-medium text-krem">Di halaman ini:</span>
      {daftar.map(([id, label]) => (
        <a key={id} href={`#${id}`} className="btn btn-indeks min-h-10 px-4 fs-sm fw-semibold">
          {label}
        </a>
      ))}
    </nav>
  )
}

// Pita teks berjalan. Pembaca layar membaca daftar biasa; animasi berhenti saat disorot,
// lewat tombol jeda, dan bagi pengguna yang mematikan animasi.
export function PitaBerjalan({ isi, label, className = '', bintang = 'text-stabilo' }) {
  const [diam, setDiam] = useState(false)
  const baris = (salinan) => (
    <ul aria-hidden={salinan || undefined} className="d-flex flex-shrink-0 align-items-center">
      {isi.map((x) => (
        <li key={x} className="d-flex align-items-center text-nowrap">
          <span className="px-7 fs-2xl fs-sm-2 fw-extrabold ls-tight">{x}</span>
          <svg viewBox="0 0 24 24" className={`ukuran-5 ${bintang}`} aria-hidden="true">
            <path fill="currentColor" d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" />
          </svg>
        </li>
      ))}
    </ul>
  )
  return (
    <section aria-label={label} className={`position-relative overflow-hidden py-5 ${diam ? 'pita-diam' : ''} ${className}`}>
      <div className="pita-berjalan d-flex">
        {baris(false)}
        {baris(true)}
      </div>
      <button
        type="button"
        onClick={() => setDiam(!diam)}
        className="btn btn-marun btn-ikon position-absolute end-0 top-50 translate-middle-y me-3 ukuran-10 border border-white border-opacity-25"
        aria-label={diam ? 'Jalankan pita' : 'Jeda pita'}
      >
        {diam ? <Play className="ukuran-3-5" /> : <Pause className="ukuran-3-5" />}
      </button>
    </section>
  )
}

// Warna latar slot foto yang belum berisi foto asli
const NADA = {
  kertas: 'bg-kertas-tua text-merah-tua text-opacity-60',
  papan: 'bg-tinta text-white text-opacity-60',
  merah: 'bg-primary text-white text-opacity-80',
  tua: 'bg-merah-900 text-white text-opacity-60',
  stabilo: 'bg-stabilo text-merah-tua text-opacity-75',
}

/*
  Slot foto. `foto` = objek { src, alt } dari src/data/foto.js, atau `src` langsung (mis. foto unggahan).
  Jika belum ada foto, tampil bidang warna berisi ikon besar sebagai pengganti sementara.
  Foto/ikon sedikit membesar saat kartu pembungkusnya (kelas kartu-zoom) disorot.
*/
export function Foto({ foto, src, alt, ikon: Ikon, nada = 'kertas', className = '', besar = false, prioritas = false }) {
  const sumber = foto ?? (src ? { src, alt: alt ?? '' } : null)
  if (sumber)
    return (
      <img
        src={sumber.src}
        alt={alt ?? sumber.alt}
        loading={prioritas ? 'eager' : 'lazy'}
        fetchPriority={prioritas ? 'high' : undefined}
        decoding="async"
        className={`w-100 h-100 object-fit-cover ${className}`}
      />
    )
  return (
    <div role={alt ? 'img' : undefined} aria-label={alt || undefined} className={`position-relative w-100 h-100 overflow-hidden ${NADA[nada] ?? NADA.kertas} ${className}`}>
      {Ikon && <Ikon strokeWidth={besar ? 1 : 1.25} aria-hidden="true" className={`foto-ikon ${besar ? 'foto-ikon--besar' : ''}`} />}
    </div>
  )
}
