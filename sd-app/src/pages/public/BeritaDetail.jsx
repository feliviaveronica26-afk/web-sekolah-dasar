import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Check, Link2, MessageCircle, Newspaper } from 'lucide-react'
import { EmptyState, KategoriBadge } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { formatHari, formatTanggal } from '../../utils/format'
import { Sampul } from './Berita'

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
      <div className="bg-linear-to-b from-primary-50 to-white">
        <section className="mx-auto max-w-3xl px-4 pb-6 pt-10 sm:px-6">
          <Link to="/berita" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700">
            <ArrowLeft className="h-4 w-4" /> Kembali ke berita
          </Link>
          {berita && (
            <>
              <div className="mt-6">
                <KategoriBadge kategori={berita.kategori} />
              </div>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900">{berita.judul}</h1>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
                <CalendarDays className="h-4 w-4" /> {formatHari(berita.tanggal)}
              </p>
            </>
          )}
        </section>
      </div>

      <section className="mx-auto max-w-3xl px-4 pb-14 sm:px-6">
        {!berita ? (
          <EmptyState icon={Newspaper} title="Berita tidak ditemukan" desc="Berita mungkin sudah dihapus atau tautannya salah." />
        ) : (
          <article>
            <div className="group overflow-hidden rounded-3xl">
              <Sampul kategori={berita.kategori} />
            </div>
            <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-slate-700">{berita.isi}</p>

            <div className="mt-10 flex flex-wrap items-center gap-3 border-y border-slate-200 py-5">
              <span className="text-sm font-semibold text-slate-600">Bagikan:</span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${berita.judul} — ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <button onClick={salinTautan} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                {tersalin ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />} {tersalin ? 'Tersalin' : 'Salin tautan'}
              </button>
            </div>
          </article>
        )}

        {lainnya.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900">Berita lainnya</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {lainnya.map((p) => (
                <Link key={p.id} to={`/berita/${p.id}`} className="group overflow-hidden rounded-2xl ring-1 ring-slate-200 transition hover:shadow-lg">
                  <Sampul kategori={p.kategori} />
                  <div className="p-4">
                    <p className="text-xs text-slate-500">{formatTanggal(p.tanggal)}</p>
                    <p className="mt-1 line-clamp-2 font-semibold leading-snug text-slate-800 group-hover:text-primary-700">{p.judul}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  )
}
