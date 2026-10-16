import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Megaphone, PartyPopper, Search, Trophy, UserPlus } from 'lucide-react'
import { Muncul } from '../../components/Hiasan'
import { Foto, KepalaHalaman, wadah } from '../../components/Situs'
import { useData } from '../../context/DataContext'
import { KATEGORI_PENGUMUMAN } from '../../data/dummy'
import { FOTO, fotoUntuk } from '../../data/foto'
import { formatTanggal } from '../../utils/format'

// Sampul berita: foto unggahan > foto yang cocok dengan judul/kategori > bidang warna berikon
const SAMPUL_BERITA = {
  Akademik: { icon: BookOpen, nada: 'kertas' },
  Kegiatan: { icon: PartyPopper, nada: 'tua' },
  PPDB: { icon: UserPlus, nada: 'merah' },
  Prestasi: { icon: Trophy, nada: 'stabilo' },
  Umum: { icon: Megaphone, nada: 'kertas' },
}

export function Sampul({ berita, besar = false, className = 'aspect-[16/10]' }) {
  const { icon, nada } = SAMPUL_BERITA[berita?.kategori] ?? SAMPUL_BERITA.Umum
  return (
    <div className={`overflow-hidden rounded-[1.5rem] ${className}`}>
      <Foto foto={fotoUntuk(berita)} alt="" ikon={icon} nada={nada} besar={besar} className="transition duration-700 group-hover:scale-105" />
    </div>
  )
}

const menitBaca = (teks) => Math.max(1, Math.round(teks.split(/\s+/).length / 180))

export default function Berita() {
  const { data } = useData()
  const [kategori, setKategori] = useState('Semua')
  const [cari, setCari] = useState('')

  const q = cari.trim().toLowerCase()
  const daftar = [...data.pengumuman]
    .filter((p) => (kategori === 'Semua' || p.kategori === kategori) && (!q || `${p.judul} ${p.isi}`.toLowerCase().includes(q)))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
  const [utama, ...lainnya] = daftar

  return (
    <>
      <KepalaHalaman jejak="Berita" judul="Kabar dari sekolah." desc="Kegiatan, prestasi, dan informasi penting untuk siswa dan orang tua." foto={FOTO.merdeka} />

      <section className={`${wadah} py-12 lg:py-16`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Saring menurut kategori" className="flex flex-wrap gap-2">
            {['Semua', ...KATEGORI_PENGUMUMAN].map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={kategori === k}
                onClick={() => setKategori(k)}
                className={`min-h-11 rounded-full px-5 text-[15px] font-bold transition ${
                  kategori === k ? 'bg-primary-600 text-white' : 'bg-kartu text-tinta-2 ring-1 ring-inset ring-garis hover:text-tinta hover:ring-tinta/30'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
          <label className="relative block lg:w-80">
            <span className="sr-only">Cari berita</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-tinta-3" aria-hidden="true" />
            <input
              type="search"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari berita..."
              className="min-h-12 w-full rounded-full border border-garis bg-white pl-11 pr-4 text-[15px] text-tinta placeholder:text-tinta-3 focus:border-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-100"
            />
          </label>
        </div>

        {!utama ? (
          <div className="py-20 text-center">
            <p className="text-2xl font-extrabold">Berita tidak ditemukan.</p>
            <p className="mt-2 text-tinta-2">Coba kategori lain atau ubah kata kunci pencarian.</p>
          </div>
        ) : (
          <>
            <Muncul>
              <Link to={`/berita/${utama.id}`} className="group mt-10 grid gap-8 rounded-[2rem] bg-kartu p-4 ring-1 ring-garis sm:p-5 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
                <Sampul berita={utama} besar className="aspect-[16/10] lg:aspect-[4/3]" />
                <div className="flex flex-col px-2 pb-3 lg:px-0 lg:py-4 lg:pr-6">
                  <p className="text-sm">
                    <span className="rounded-full bg-primary-50 px-3 py-1 font-bold text-primary-700">{utama.kategori}</span>
                    <span className="angka text-tinta-3"> · {formatTanggal(utama.tanggal)}</span>
                  </p>
                  <h2 className="mt-5 text-3xl leading-[1.1] group-hover:text-primary-700 sm:text-[2.75rem]">{utama.judul}</h2>
                  <p className="mt-5 line-clamp-5 text-lg leading-relaxed text-tinta-2">{utama.isi}</p>
                  <p className="mt-auto pt-6 text-sm font-semibold text-tinta-3">{menitBaca(utama.isi)} menit baca</p>
                </div>
              </Link>
            </Muncul>

            {lainnya.length > 0 && (
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lainnya.map((p, i) => (
                  <Muncul as="li" key={p.id} jeda={(i % 3) * 70}>
                    <Link to={`/berita/${p.id}`} className="group block h-full rounded-[1.75rem] bg-kartu p-3 pb-6 ring-1 ring-garis transition hover:shadow-[0_24px_50px_-30px_rgb(68_6_11/0.5)]">
                      <Sampul berita={p} />
                      <p className="mt-5 px-3 text-sm">
                        <span className="font-semibold text-primary-700">{p.kategori}</span>
                        <span className="angka text-tinta-3"> · {formatTanggal(p.tanggal)}</span>
                      </p>
                      <h3 className="mt-2 px-3 text-xl leading-snug group-hover:text-primary-700">{p.judul}</h3>
                      <p className="mt-2 line-clamp-2 px-3 leading-relaxed text-tinta-2">{p.isi}</p>
                    </Link>
                  </Muncul>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </>
  )
}
