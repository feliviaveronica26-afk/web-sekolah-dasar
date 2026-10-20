import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Megaphone, PartyPopper, Search, Trophy, UserPlus } from 'lucide-react'
import { Muncul } from '../../components/Hiasan'
import { Foto, KepalaHalaman, pilSaring, wadah } from '../../components/Situs'
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

export function Sampul({ berita, besar = false, className = 'rasio-16x10' }) {
  const { icon, nada } = SAMPUL_BERITA[berita?.kategori] ?? SAMPUL_BERITA.Umum
  return (
    <div className={`overflow-hidden rounded-4 ${className}`}>
      <Foto foto={fotoUntuk(berita)} alt="" ikon={icon} nada={nada} besar={besar} />
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

      <section className={`${wadah} py-12 py-lg-16`}>
        <div className="d-flex flex-column gap-4 flex-lg-row align-items-lg-center justify-content-lg-between">
          <div role="group" aria-label="Saring menurut kategori" className="d-flex flex-wrap gap-2">
            {['Semua', ...KATEGORI_PENGUMUMAN].map((k) => (
              <button key={k} type="button" aria-pressed={kategori === k} onClick={() => setKategori(k)} className={pilSaring(kategori === k)}>
                {k}
              </button>
            ))}
          </div>
          <label className="position-relative d-block w-lg-80">
            <span className="visually-hidden">Cari berita</span>
            <Search className="pe-none position-absolute start-0 top-50 translate-middle-y ms-4 ukuran-4 text-tinta-3" aria-hidden="true" />
            <input
              type="search"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari berita..."
              className="form-control form-control-lg rounded-pill ps-11"
            />
          </label>
        </div>

        {!utama ? (
          <div className="py-20 text-center">
            <p className="fs-2xl fw-extrabold">Berita tidak ditemukan.</p>
            <p className="mt-2 text-tinta-2">Coba kategori lain atau ubah kata kunci pencarian.</p>
          </div>
        ) : (
          <>
            <Muncul>
              <Link to={`/berita/${utama.id}`} className="berita-unggulan kartu-zoom mt-10 d-grid gap-8 rounded-5 bg-white p-4 p-sm-5 border border-garis">
                <Sampul berita={utama} besar className="rasio-16x10 rasio-lg-4x3" />
                <div className="d-flex flex-column px-2 pb-3 px-lg-0 py-lg-4 pe-lg-6">
                  <p className="fs-sm">
                    <span className="rounded-pill bg-merah-50 px-3 py-1 fw-bold text-merah-700">{utama.kategori}</span>
                    <span className="angka text-tinta-3"> · {formatTanggal(utama.tanggal)}</span>
                  </p>
                  <h2 className="judul-sorot judul-berita-utama mt-5">{utama.judul}</h2>
                  <p className="mt-5 clamp-5 fs-lg lh-relaxed text-tinta-2">{utama.isi}</p>
                  <p className="mt-auto pt-6 fs-sm fw-semibold text-tinta-3">{menitBaca(utama.isi)} menit baca</p>
                </div>
              </Link>
            </Muncul>

            {lainnya.length > 0 && (
              <ul className="mt-6 d-grid gap-4 kolom-sm-2 kolom-lg-3">
                {lainnya.map((p, i) => (
                  <Muncul as="li" key={p.id} jeda={(i % 3) * 70}>
                    <Link to={`/berita/${p.id}`} className="kartu-zoom hover-bayangan d-block h-100 rounded-kartu bg-white p-3 pb-6 border border-garis">
                      <Sampul berita={p} />
                      <p className="mt-5 px-3 fs-sm">
                        <span className="fw-semibold text-merah-700">{p.kategori}</span>
                        <span className="angka text-tinta-3"> · {formatTanggal(p.tanggal)}</span>
                      </p>
                      <h3 className="judul-sorot mt-2 px-3 fs-xl lh-snug">{p.judul}</h3>
                      <p className="mt-2 clamp-2 px-3 lh-relaxed text-tinta-2">{p.isi}</p>
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
