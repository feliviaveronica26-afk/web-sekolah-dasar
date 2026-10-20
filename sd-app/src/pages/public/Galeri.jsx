import { useEffect, useState } from 'react'
import { BookOpen, Camera, ChevronLeft, ChevronRight, Flag, FlaskConical, Monitor, Music, Sprout, Store, Tent, Trophy, X } from 'lucide-react'
import { Muncul } from '../../components/Hiasan'
import { Foto, KepalaHalaman, angkaSaring, pilSaring, wadah } from '../../components/Situs'
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

const tombolGeser = 'btn btn-garis-terang min-h-11 px-5 fs-sm'

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

      <section className={`${wadah} py-12 py-lg-16`}>
        <div role="group" aria-label="Saring menurut kategori" className="d-flex flex-wrap gap-2">
          {daftarKategori.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kategori === k}
              onClick={() => {
                setKategori(k)
                setIndeks(null)
              }}
              className={pilSaring(kategori === k)}
            >
              {k}{' '}
              <span className={angkaSaring(kategori === k)}>{k === 'Semua' ? GALERI.length : GALERI.filter((g) => g.kategori === k).length}</span>
            </button>
          ))}
        </div>

        <ul className="kisi-galeri mt-8 d-grid gap-4 kolom-sm-2 kolom-lg-3">
          {daftar.map((g, i) => {
            const utama = i === 0 && kategori === 'Semua'
            return (
              <Muncul as="li" key={g.id} gaya="skala" jeda={(i % 3) * 60} className={utama ? 'rentang-sm-2 rentang-baris-sm-2' : ''}>
                <button
                  type="button"
                  onClick={() => setIndeks(i)}
                  className="kartu-zoom position-relative isolate d-block h-100 w-100 overflow-hidden rounded-kartu text-start text-white"
                >
                  <span className="position-absolute inset-0 z-n2">
                    <Gambar g={g} besar={utama} hias />
                  </span>
                  <span aria-hidden="true" className="gradasi-foto gradasi-foto--galeri" />
                  <span className="position-absolute start-0 end-0 bottom-0 p-5 p-sm-6">
                    <span className="d-block fs-sm">
                      <span className="rounded-pill bg-white bg-opacity-20 px-2-5 py-0-5 fw-bold buram">{g.kategori}</span>
                      <span className="angka ms-2 text-white text-opacity-80">{formatTanggal(g.tanggal)}</span>
                    </span>
                    <span className={`mt-2 d-block fw-extrabold lh-snug ls-tight ${utama ? 'fs-3xl fs-sm-4xl' : 'fs-xl'}`}>{g.judul}</span>
                  </span>
                </button>
              </Muncul>
            )
          })}
        </ul>
        <p className="mt-10 fs-15 text-tinta-3">Dokumentasi lengkap setiap kegiatan ada di Instagram {SEKOLAH.instagram}.</p>
      </section>

      {dipilih && (
        // Latar memudar masuk, kotak foto membesar lembut; foto & keterangan berganti lembut saat digeser
        <div className="latar-modal position-fixed inset-0 z-50 d-flex align-items-center justify-content-center latar-galeri p-4" onClick={() => setIndeks(null)}>
          <div role="dialog" aria-modal="true" aria-label={dipilih.judul} className="pop-awal position-relative w-100 mw-3xl" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setIndeks(null)} className="tombol-tutup-galeri btn btn-polos position-absolute end-0 min-h-11 px-4 fs-sm text-white">
              <X className="ukuran-5" /> Tutup
            </button>
            <div key={`foto-${dipilih.id}`} className="tampil-lembut rasio-16x9 overflow-hidden rounded-kartu">
              <Gambar g={dipilih} besar />
            </div>
            <div key={`ket-${dipilih.id}`} className="tampil-lembut mt-5 d-flex align-items-start justify-content-between gap-6 text-white">
              <div>
                <p className="fs-sm text-white text-opacity-70">
                  {dipilih.kategori} · <span className="angka">{formatTanggal(dipilih.tanggal)}</span>
                </p>
                <p className="mt-1 fs-3xl fw-extrabold lh-tight ls-tight">{dipilih.judul}</p>
                <p className="mt-2 lh-relaxed text-white text-opacity-75">{dipilih.desc}</p>
              </div>
              <p className="angka flex-shrink-0 fs-sm text-white text-opacity-70">
                {indeks + 1} / {daftar.length}
              </p>
            </div>
            {daftar.length > 1 && (
              <div className="mt-6 d-flex gap-3">
                <button type="button" onClick={() => geser(-1)} className={tombolGeser}>
                  <ChevronLeft className="ukuran-4" /> Sebelumnya
                </button>
                <button type="button" onClick={() => geser(1)} className={tombolGeser}>
                  Berikutnya <ChevronRight className="ukuran-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
