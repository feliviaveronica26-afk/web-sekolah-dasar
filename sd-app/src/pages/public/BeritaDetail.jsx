import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Link2, MessageCircle } from 'lucide-react'
import { Jejak, PitaMerah, wadah } from '../../components/Situs'
import { useData } from '../../context/DataContext'
import { formatHari, formatTanggal } from '../../utils/format'
import { Sampul } from './Berita'

const tombolBagi =
  'inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-tinta ring-1 ring-inset ring-garis transition hover:ring-tinta/40'

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
      <PitaMerah className={`pt-8 sm:pt-12 ${berita ? 'pb-32 sm:pb-44' : 'pb-14'}`}>
        <div className="mx-auto max-w-3xl">
          <Jejak
            daftar={[
              ['/', 'Beranda'],
              ['/berita', 'Berita'],
              [null, berita ? berita.kategori : 'Tidak ditemukan'],
            ]}
          />
          {berita ? (
            <>
              <p className="mt-10 flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-stabilo px-3 py-1 font-bold text-tinta">{berita.kategori}</span>
                <span className="angka text-krem">{formatHari(berita.tanggal)}</span>
              </p>
              <h1 className="mt-4 text-[2.5rem] leading-[1.06] sm:text-6xl">{berita.judul}</h1>
            </>
          ) : (
            <h1 className="mt-10 text-4xl sm:text-5xl">Berita tidak ditemukan.</h1>
          )}
        </div>
      </PitaMerah>

      <article className="relative mx-auto w-full max-w-4xl px-4 pb-16 pt-10 sm:px-6">
        {!berita ? (
          <div className="pb-8">
            <p className="text-lg text-tinta-2">Berita mungkin sudah dihapus atau tautannya salah.</p>
            <Link to="/berita" className="mt-6 inline-flex items-center gap-1.5 font-semibold text-primary-700 underline underline-offset-4">
              <ArrowLeft className="h-4 w-4" /> Kembali ke berita
            </Link>
          </div>
        ) : (
          <>
            <Sampul berita={berita} besar className="-mt-36 aspect-[16/9] rounded-[2rem]! shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)] sm:-mt-48" />
            <p className="mx-auto mt-12 max-w-3xl whitespace-pre-line text-lg leading-[1.8] text-tinta first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-6xl first-letter:font-extrabold first-letter:leading-[0.85] first-letter:text-primary-600 sm:text-xl sm:leading-[1.8]">
              {berita.isi}
            </p>

            <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center gap-3 rounded-[1.5rem] bg-kertas-tua/70 p-4 sm:px-6">
              <span className="mr-2 text-sm font-semibold text-tinta-2">Bagikan</span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${berita.judul} — ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                target="_blank"
                rel="noreferrer"
                className={tombolBagi}
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <button type="button" onClick={salinTautan} className={tombolBagi}>
                {tersalin ? <Check className="h-4 w-4 text-emerald-700" /> : <Link2 className="h-4 w-4" />} {tersalin ? 'Tersalin' : 'Salin tautan'}
              </button>
            </div>
          </>
        )}
      </article>

      {lainnya.length > 0 && (
        <section className="bg-kertas-tua/70 py-16 lg:py-20">
          <div className={wadah}>
            <h2 className="text-3xl">Berita lainnya</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {lainnya.map((p) => (
                <li key={p.id}>
                  <Link to={`/berita/${p.id}`} className="group block h-full rounded-[1.75rem] bg-white p-3 pb-5 ring-1 ring-garis">
                    <Sampul berita={p} />
                    <p className="angka mt-4 px-2 text-sm text-tinta-3">
                      <span className="font-bold text-primary-700">{p.kategori}</span> · {formatTanggal(p.tanggal)}
                    </p>
                    <p className="mt-1 px-2 text-lg font-bold leading-snug group-hover:text-primary-700">{p.judul}</p>
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
