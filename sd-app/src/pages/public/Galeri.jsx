import { useEffect, useState } from 'react'
import { BookOpen, Camera, ChevronLeft, ChevronRight, Flag, FlaskConical, Monitor, Music, Sprout, Store, Tent, Trophy, X } from 'lucide-react'
import { Muncul } from '../../components/Hiasan'
import { PageHeader } from '../../components/ui'
import { GALERI } from '../../data/dummy'
import { formatTanggal } from '../../utils/format'

// Sementara memakai ilustrasi ikon. Ganti dengan foto asli di folder public/galeri/
const IKON = { flag: Flag, trophy: Trophy, book: BookOpen, tent: Tent, music: Music, monitor: Monitor, sprout: Sprout, flask: FlaskConical, store: Store }
const GRADASI = {
  Kegiatan: 'from-primary-400 to-primary-700',
  Prestasi: 'from-amber-300 to-orange-500',
  Pembelajaran: 'from-sky-400 to-indigo-500',
  Ekstrakurikuler: 'from-emerald-400 to-teal-600',
}
// Pola ukuran kartu agar susunan galeri terasa dinamis
const UKURAN = ['md:row-span-2', '', '', 'md:col-span-2', '', 'md:row-span-2', '', '', '']

function Gambar({ g, besar = false }) {
  const Icon = IKON[g.ikon] ?? Camera
  return (
    <div className={`relative h-full w-full overflow-hidden bg-linear-to-br ${GRADASI[g.kategori]}`}>
      <div className="pola-titik absolute inset-0" />
      <Icon className={`absolute text-white/25 transition duration-500 group-hover:scale-110 group-hover:-rotate-6 ${besar ? 'right-8 top-8 h-40 w-40' : 'right-4 top-4 h-16 w-16'}`} />
    </div>
  )
}

export default function Galeri() {
  const [kategori, setKategori] = useState('Semua')
  const [indeks, setIndeks] = useState(null)

  const daftarKategori = ['Semua', ...new Set(GALERI.map((g) => g.kategori))]
  const daftar = GALERI.filter((g) => kategori === 'Semua' || g.kategori === kategori)
  const dipilih = indeks !== null ? daftar[indeks] : null
  const geser = (n) => setIndeks((i) => (i + n + daftar.length) % daftar.length)

  // Navigasi lightbox dengan keyboard
  useEffect(() => {
    if (indeks === null) return
    const tombol = (e) => {
      if (e.key === 'Escape') setIndeks(null)
      if (e.key === 'ArrowRight') geser(1)
      if (e.key === 'ArrowLeft') geser(-1)
    }
    document.addEventListener('keydown', tombol)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', tombol)
      document.body.style.overflow = ''
    }
  })

  return (
    <>
      <PageHeader eyebrow="Dokumentasi" title="Galeri Kegiatan" subtitle="Momen-momen berharga keseharian siswa SD Harapan Gemilang." />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {daftarKategori.map((k) => (
            <button
              key={k}
              onClick={() => {
                setKategori(k)
                setIndeks(null)
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                kategori === k ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {k}
              <span className="ml-1.5 text-xs opacity-70">{k === 'Semua' ? GALERI.length : GALERI.filter((g) => g.kategori === k).length}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-flow-dense auto-rows-[180px] grid-cols-2 gap-4 md:grid-cols-4">
          {daftar.map((g, i) => (
            <Muncul key={g.id} jeda={(i % 4) * 60} className={kategori === 'Semua' ? UKURAN[i % UKURAN.length] : ''}>
              <button onClick={() => setIndeks(i)} className="group relative h-full w-full overflow-hidden rounded-3xl text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300">
                <Gambar g={g} />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 via-black/20 to-transparent p-4 pt-10">
                  <p className="text-xs font-semibold text-white/80">{g.kategori}</p>
                  <p className="font-display text-lg font-bold leading-tight text-white">{g.judul}</p>
                </div>
              </button>
            </Muncul>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">Foto asli kegiatan akan segera ditambahkan. Ikuti {`@sdharapangemilang`} untuk dokumentasi terbaru.</p>
      </section>

      {dipilih && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm" onClick={() => setIndeks(null)}>
          <div role="dialog" aria-modal="true" aria-label={dipilih.judul} className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIndeks(null)} className="absolute -top-12 right-0 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Tutup">
              <X className="h-6 w-6" />
            </button>
            <div className="group aspect-video overflow-hidden rounded-3xl">
              <Gambar g={dipilih} besar />
            </div>
            <div className="mt-4 flex items-start justify-between gap-4 text-white">
              <div>
                <p className="text-sm text-white/70">
                  {dipilih.kategori} · {formatTanggal(dipilih.tanggal)}
                </p>
                <p className="font-display text-2xl font-bold">{dipilih.judul}</p>
                <p className="mt-1 text-white/80">{dipilih.desc}</p>
              </div>
              <p className="shrink-0 text-sm text-white/60">
                {indeks + 1} / {daftar.length}
              </p>
            </div>
            {daftar.length > 1 && (
              <>
                <button onClick={() => geser(-1)} className="absolute left-2 top-[28%] rounded-full bg-white/90 p-2.5 text-slate-800 shadow-lg hover:bg-white sm:-left-14" aria-label="Sebelumnya">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={() => geser(1)} className="absolute right-2 top-[28%] rounded-full bg-white/90 p-2.5 text-slate-800 shadow-lg hover:bg-white sm:-right-14" aria-label="Berikutnya">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
