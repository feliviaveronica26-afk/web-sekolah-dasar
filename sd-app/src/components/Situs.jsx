// Komponen tampilan khusus halaman publik (beranda, profil, PPDB, dst.).
// Gaya modern merah putih: huruf sans tebal, sudut membulat, tombol pil, dan foto kegiatan sekolah.
// Portal memakai komponen di ui.jsx, bukan file ini.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Pause, Play, Sparkles } from 'lucide-react'

export const wadah = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'

const dasarTombol =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-bold transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'

export const tombol = {
  utama: `${dasarTombol} bg-primary-600 text-white shadow-[0_12px_24px_-12px_rgb(217_26_40/0.8)] hover:bg-primary-700`,
  kedua: `${dasarTombol} bg-white text-tinta ring-1 ring-inset ring-garis hover:ring-tinta/40`,
  gelap: `${dasarTombol} bg-tinta text-white hover:bg-black`,
  terang: `${dasarTombol} bg-white text-primary-700 shadow-[0_12px_24px_-12px_rgb(0_0_0/0.45)] hover:bg-primary-50`,
  garisTerang: `${dasarTombol} text-white ring-1 ring-inset ring-white/60 hover:bg-white/10 hover:ring-white`,
}

// Pembungkus komponen yang dipakai bersama portal (kalender, denah kelas) agar serasi di halaman publik
export const selarasKertas = '[&_.bg-white]:bg-kartu [&_.shadow-sm]:shadow-none'

// Kolom isian formulir publik
export const isian =
  'min-h-12 w-full rounded-xl border border-garis bg-white px-4 py-3 text-[15px] text-tinta placeholder:text-tinta-3 transition focus:border-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-100'
export const labelIsian = 'mb-1.5 block text-[15px] font-semibold text-tinta'

// Pilihan bergaya tombol (mis. jenis kelamin, sesi): terpilih = berlatar merah
export const pilihan = (aktif) =>
  `rounded-xl border px-3 py-2.5 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
    aktif ? 'border-primary-700 bg-primary-700 text-white' : 'border-garis bg-white text-tinta hover:border-primary-600/60'
  }`

// Tautan teks dengan panah kecil
export function TautanPanah({ to, href, children, className = '', terang = false }) {
  const cls = `group inline-flex items-center gap-1.5 font-bold transition ${
    terang ? 'text-white hover:text-stabilo' : 'text-primary-700 hover:text-primary-800'
  } ${className}`
  const isi = (
    <>
      {children}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
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
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-bold ${
        terang ? 'bg-white/10 text-white ring-1 ring-inset ring-white/20' : 'bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100'
      } ${className}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${terang ? 'bg-stabilo' : 'bg-primary-600'}`} />
      {children}
    </p>
  )
}

// Catatan kecil penyemangat (selalu pelengkap, bukan satu-satunya informasi)
export function Catatan({ children, className = '', as: Tag = 'p' }) {
  return (
    <Tag className={`inline-flex items-center gap-2 text-base font-semibold text-primary-700 ${className}`}>
      <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </Tag>
  )
}

export function JudulBagian({ label, judul, desc, aksi, terang = false, className = 'mb-12' }) {
  return (
    <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}>
      <div className="max-w-3xl">
        {label && <Label terang={terang}>{label}</Label>}
        <h2 className={`mt-5 text-[2.15rem] leading-[1.08] sm:text-5xl lg:text-[3.25rem] ${terang ? 'text-white' : 'text-tinta'}`}>{judul}</h2>
        {desc && <p className={`mt-5 max-w-2xl text-lg leading-relaxed ${terang ? 'text-krem' : 'text-tinta-2'}`}>{desc}</p>}
      </div>
      {aksi && <div className="shrink-0 md:pb-2">{aksi}</div>}
    </div>
  )
}

// Jejak halaman di atas latar merah. daftar: [[alamat, label], ...]; item terakhir = halaman ini.
export function Jejak({ daftar }) {
  return (
    <nav aria-label="Jejak halaman" className="flex flex-wrap items-center gap-1 text-sm font-medium text-krem">
      {daftar.map(([to, label], i) =>
        i < daftar.length - 1 ? (
          <span key={label} className="inline-flex items-center gap-1">
            <Link to={to} className="-my-1.5 inline-block py-1.5 underline-offset-4 hover:text-white hover:underline">
              {label}
            </Link>
            <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 opacity-70" />
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
    <header className="relative isolate overflow-hidden bg-primary-700 text-white">
      {/* Cincin tipis sebagai aksen latar */}
      <span aria-hidden="true" className="pointer-events-none absolute -right-40 -top-56 -z-10 h-[34rem] w-[34rem] rounded-full border-[3.5rem] border-white/[0.06]" />
      <div className={`${wadah} relative ${className}`}>{children}</div>
    </header>
  )
}

// Foto berbingkai bulat dengan aksen kotak kuning di belakangnya
export function FotoBingkai({ foto, className = '', rasio = 'aspect-[4/3]', prioritas = false }) {
  return (
    <div className={`relative ${className}`}>
      <span aria-hidden="true" className="absolute -bottom-4 -left-4 h-28 w-28 rounded-[1.75rem] bg-stabilo sm:h-36 sm:w-36" />
      <div className={`relative overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)] ${rasio}`}>
        <Foto foto={foto} prioritas={prioritas} />
      </div>
    </div>
  )
}

// Judul halaman (selain beranda): jejak, judul besar, ringkasan, foto, dan isi tambahan (mis. indeks bagian)
export function KepalaHalaman({ jejak, judul, desc, catatan, foto, children }) {
  return (
    <PitaMerah className="pb-14 pt-8 sm:pt-10 lg:pb-20 lg:pt-12">
      <div className={`grid gap-12 ${foto ? 'lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16' : ''}`}>
        <div>
          <Jejak
            daftar={[
              ['/', 'Beranda'],
              [null, jejak],
            ]}
          />
          <h1 className="mt-6 max-w-4xl text-[2.6rem] leading-[1.03] text-white sm:text-6xl lg:text-[4.25rem]">{judul}</h1>
          {desc && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-krem sm:text-xl">{desc}</p>}
          {catatan && (
            <p className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary-900/70 px-4 py-2 text-sm font-semibold text-stabilo ring-1 ring-inset ring-white/10">
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
              {catatan}
            </p>
          )}
        </div>
        {foto && <FotoBingkai foto={foto} prioritas className="ml-4 lg:ml-0" />}
      </div>
      {children}
    </PitaMerah>
  )
}

// Daftar tautan ke bagian-bagian halaman (di dalam latar merah)
export function IndeksHalaman({ daftar }) {
  return (
    <nav aria-label="Bagian halaman ini" className="mt-12 flex flex-wrap items-center gap-2.5 border-t border-white/15 pt-6">
      <span className="mr-1 text-sm font-medium text-krem">Di halaman ini:</span>
      {daftar.map(([id, label]) => (
        <a
          key={id}
          href={`#${id}`}
          className="inline-flex min-h-10 items-center rounded-full bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-inset ring-white/15 transition hover:bg-white hover:text-primary-700"
        >
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
    <ul aria-hidden={salinan || undefined} className="flex shrink-0 items-center">
      {isi.map((x) => (
        <li key={x} className="flex items-center whitespace-nowrap">
          <span className="px-7 text-2xl font-extrabold tracking-tight sm:text-[2rem]">{x}</span>
          <svg viewBox="0 0 24 24" className={`h-5 w-5 ${bintang}`} aria-hidden="true">
            <path fill="currentColor" d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" />
          </svg>
        </li>
      ))}
    </ul>
  )
  return (
    <section aria-label={label} className={`relative overflow-hidden py-5 ${diam ? 'pita-diam' : ''} ${className}`}>
      <div className="pita-berjalan flex w-max">
        {baris(false)}
        {baris(true)}
      </div>
      <button
        type="button"
        onClick={() => setDiam(!diam)}
        className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-primary-950 text-white ring-1 ring-white/30 hover:bg-black"
        aria-label={diam ? 'Jalankan pita' : 'Jeda pita'}
      >
        {diam ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
      </button>
    </section>
  )
}

// Warna latar slot foto yang belum berisi foto asli
const NADA = {
  kertas: 'bg-kertas-tua text-primary-700/60',
  papan: 'bg-tinta text-white/60',
  merah: 'bg-primary-600 text-white/80',
  tua: 'bg-primary-900 text-krem/70',
  stabilo: 'bg-stabilo text-primary-800/70',
}

/*
  Slot foto. `foto` = objek { src, alt } dari src/data/foto.js, atau `src` langsung (mis. foto unggahan).
  Jika belum ada foto, tampil bidang warna berisi ikon besar sebagai pengganti sementara.
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
        className={`h-full w-full object-cover ${className}`}
      />
    )
  return (
    <div role={alt ? 'img' : undefined} aria-label={alt || undefined} className={`relative h-full w-full overflow-hidden ${NADA[nada] ?? NADA.kertas} ${className}`}>
      {Ikon && (
        <Ikon
          strokeWidth={besar ? 1 : 1.25}
          aria-hidden="true"
          className={`absolute transition duration-700 group-hover:-rotate-3 group-hover:scale-105 ${besar ? '-bottom-[6%] right-[6%] h-[72%] w-auto' : '-bottom-[8%] right-[4%] h-[70%] w-auto'}`}
        />
      )}
    </div>
  )
}
