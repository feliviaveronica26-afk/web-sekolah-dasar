import { useEffect, useState } from 'react'
import { BookOpen, Camera, ChevronLeft, ChevronRight, Flag, FlaskConical, Monitor, Music, Sprout, Store, Tent, Trophy, X } from 'lucide-react'
import { Muncul } from '../../components/Hiasan'
import { Foto, KepalaHalaman, wadah } from '../../components/Situs'
import { GALERI, SEKOLAH } from '../../data/dummy'
import { FOTO, fotoUntuk } from '../../data/foto'
import { formatTanggal } from '../../utils/format'

// Foto: isi `foto: '/galeri/nama-berkas.jpg'` pada data GALERI (berkas di public/galeri/).
// Tanpa itu, dipakai foto yang cocok dengan judul (src/data/foto.js), atau bidang warna berikon.
const IKON = { flag: Flag, trophy: Trophy, book: BookOpen, tent: Tent, music: Music, monitor: Monitor, sprout: Sprout, flask: FlaskConical, store: Store }
const NADA = { Kegiatan: 'merah', Prestasi: 'tua', Pembelajaran: 'papan', Ekstrakurikuler: 'tua' }

// `hias`: judul sudah tertulis di sebelah foto, jadi teks alt dikosongkan agar tidak dibaca dua kali
function Gambar({ g, besar = false, className = '', hias = false }) {
  const foto = fotoUntuk(g, { pakaiKategori: false })
  return <Foto foto={foto} alt={foto && !hias ? g.judul : ''} ikon={IKON[g.ikon] ?? Camera} nada={NADA[g.kategori]} besar={besar} className={className} />
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
      <KepalaHalaman
        jejak="Galeri"
        judul="Momen kecil yang berharga."
        desc={`Dokumentasi keseharian siswa ${SEKOLAH.nama}: di kelas, di lapangan, dan di panggung.`}
        foto={FOTO.tawa}
      />

      <section className={`${wadah} py-12 lg:py-16`}>
        <div role="group" aria-label="Saring menurut kategori" className="flex flex-wrap gap-2">
          {daftarKategori.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kategori === k}
              onClick={() => {
                setKategori(k)
                setIndeks(null)
              }}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[15px] font-bold transition ${
                kategori === k ? 'bg-primary-600 text-white' : 'bg-kartu text-tinta-2 ring-1 ring-inset ring-garis hover:text-tinta hover:ring-tinta/30'
              }`}
            >
              {k}{' '}
              <span className={`angka rounded-full px-2 py-0.5 text-xs ${kategori === k ? 'bg-white/20' : 'bg-kertas-tua text-tinta-3'}`}>
                {k === 'Semua' ? GALERI.length : GALERI.filter((g) => g.kategori === k).length}
              </span>
            </button>
          ))}
        </div>

        <ul className="mt-8 grid auto-rows-[15rem] gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[17rem]">
          {daftar.map((g, i) => {
            const utama = i === 0 && kategori === 'Semua'
            return (
              <Muncul as="li" key={g.id} jeda={(i % 3) * 60} className={utama ? 'sm:col-span-2 sm:row-span-2' : ''}>
                <button type="button" onClick={() => setIndeks(i)} className="group relative isolate block h-full w-full overflow-hidden rounded-[1.75rem] text-left text-white">
                  <span className="absolute inset-0 -z-20">
                    <Gambar g={g} besar={utama} hias className="transition duration-700 group-hover:scale-105" />
                  </span>
                  <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/20 to-black/0" />
                  <span className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <span className="block text-sm">
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-bold backdrop-blur">{g.kategori}</span>
                      <span className="angka ml-2 text-white/80">{formatTanggal(g.tanggal)}</span>
                    </span>
                    <span className={`mt-2 block font-extrabold leading-snug tracking-tight ${utama ? 'text-3xl sm:text-4xl' : 'text-xl'}`}>{g.judul}</span>
                  </span>
                </button>
              </Muncul>
            )
          })}
        </ul>
        <p className="mt-10 text-[15px] text-tinta-3">Dokumentasi lengkap setiap kegiatan ada di Instagram {SEKOLAH.instagram}.</p>
      </section>

      {dipilih && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/95 p-4" onClick={() => setIndeks(null)}>
          <div role="dialog" aria-modal="true" aria-label={dipilih.judul} className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIndeks(null)}
              className="absolute -top-14 right-0 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" /> Tutup
            </button>
            <div className="aspect-video overflow-hidden rounded-[1.75rem]">
              <Gambar g={dipilih} besar />
            </div>
            <div className="mt-5 flex items-start justify-between gap-6 text-white">
              <div>
                <p className="text-sm text-white/70">
                  {dipilih.kategori} · <span className="angka">{formatTanggal(dipilih.tanggal)}</span>
                </p>
                <p className="mt-1 text-3xl font-extrabold leading-tight tracking-tight">{dipilih.judul}</p>
                <p className="mt-2 leading-relaxed text-white/75">{dipilih.desc}</p>
              </div>
              <p className="angka shrink-0 text-sm text-white/70">
                {indeks + 1} / {daftar.length}
              </p>
            </div>
            {daftar.length > 1 && (
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => geser(-1)} className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-bold text-white ring-1 ring-inset ring-white/30 hover:bg-white/10">
                  <ChevronLeft className="h-4 w-4" /> Sebelumnya
                </button>
                <button type="button" onClick={() => geser(1)} className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-bold text-white ring-1 ring-inset ring-white/30 hover:bg-white/10">
                  Berikutnya <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
