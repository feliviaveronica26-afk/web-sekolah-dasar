import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Link2, MessageCircle } from 'lucide-react'
import { Jejak, PitaMerah, wadah } from '../../components/Situs'
import { useData } from '../../context/DataContext'
import { formatHari, formatTanggal } from '../../utils/format'
import { Sampul } from './Berita'

const tombolBagi = 'btn btn-kedua min-h-11 px-5 fs-sm'

export default function BeritaDetail() {
  const { id } = useParams()
  const { data } = useData()
  const [tersalin, setTersalin] = useState(false)
  const berita = data.pengumuman.find((p) => p.id === id)
  const lainnya = [...data.pengumuman]
    .filter((p) => p.id !== id)
    .sort((a, b) => (b.kategori === berita?.kategori) - (a.kategori === berita?.kategori) || b.tanggal.localeCompare(a.tanggal))
    .slice(0, 3)

  const salinTautan = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setTersalin(true)
      setTimeout(() => setTersalin(false), 2000)
    } catch {
      /* clipboard tidak tersedia */
    }
  }

  return (
    <>
      <PitaMerah className={`pt-8 pt-sm-12 ${berita ? 'pb-32 pb-sm-44' : 'pb-14'}`}>
        <div className="mx-auto mw-3xl">
          <Jejak
            daftar={[
              ['/', 'Beranda'],
              ['/berita', 'Berita'],
              [null, berita ? berita.kategori : 'Tidak ditemukan'],
            ]}
          />
          {berita ? (
            <>
              <p className="mt-10 d-flex flex-wrap align-items-center gap-3 fs-sm">
                <span className="rounded-pill bg-stabilo px-3 py-1 fw-bold text-tinta">{berita.kategori}</span>
                <span className="angka text-krem">{formatHari(berita.tanggal)}</span>
              </p>
              <h1 className="judul-berita mt-4">{berita.judul}</h1>
            </>
          ) : (
            <h1 className="mt-10 fs-4xl fs-sm-5xl">Berita tidak ditemukan.</h1>
          )}
        </div>
      </PitaMerah>

      <article className="position-relative mx-auto w-100 mw-4xl px-4 pb-16 pt-10 px-sm-6">
        {!berita ? (
          <div className="pb-8">
            <p className="fs-lg text-tinta-2">Berita mungkin sudah dihapus atau tautannya salah.</p>
            <Link to="/berita" className="mt-6 d-inline-flex align-items-center gap-1-5 fw-semibold text-merah-700 text-decoration-underline link-offset-2">
              <ArrowLeft className="ukuran-4" /> Kembali ke berita
            </Link>
          </div>
        ) : (
          <>
            <Sampul berita={berita} besar className="sampul-berita rasio-16x9 rounded-5" />
            <p className="isi-berita mx-auto mt-12 mw-3xl text-tinta">{berita.isi}</p>

            <div className="mx-auto mt-12 d-flex mw-3xl flex-wrap align-items-center gap-3 rounded-4 latar-kertas-lembut p-4 px-sm-6">
              <span className="me-2 fs-sm fw-semibold text-tinta-2">Bagikan</span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${berita.judul} — ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                target="_blank"
                rel="noreferrer"
                className={tombolBagi}
              >
                <MessageCircle className="ukuran-4" /> WhatsApp
              </a>
              <button type="button" onClick={salinTautan} className={tombolBagi}>
                {tersalin ? <Check className="ukuran-4 text-success" /> : <Link2 className="ukuran-4" />} {tersalin ? 'Tersalin' : 'Salin tautan'}
              </button>
            </div>
          </>
        )}
      </article>

      {lainnya.length > 0 && (
        <section className="latar-kertas-lembut py-16 py-lg-20">
          <div className={wadah}>
            <h2 className="fs-3xl">Berita lainnya</h2>
            <ul className="mt-8 d-grid gap-4 kolom-sm-3">
              {lainnya.map((p) => (
                <li key={p.id}>
                  <Link to={`/berita/${p.id}`} className="kartu-zoom d-block h-100 rounded-kartu bg-white p-3 pb-5 border border-garis">
                    <Sampul berita={p} />
                    <p className="angka mt-4 px-2 fs-sm text-tinta-3">
                      <span className="fw-bold text-merah-700">{p.kategori}</span> · {formatTanggal(p.tanggal)}
                    </p>
                    <p className="judul-sorot mt-1 px-2 fs-lg fw-bold lh-snug">{p.judul}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
