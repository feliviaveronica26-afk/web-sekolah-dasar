import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Newspaper } from 'lucide-react'
import { EmptyState, KategoriBadge } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { formatHari } from '../../utils/format'

export default function BeritaDetail() {
  const { id } = useParams()
  const { data } = useData()
  const berita = data.pengumuman.find((p) => p.id === id)
  const lainnya = data.pengumuman.filter((p) => p.id !== id).slice(0, 3)

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link to="/berita" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700">
        <ArrowLeft className="h-4 w-4" /> Kembali ke berita
      </Link>

      {!berita ? (
        <EmptyState icon={Newspaper} title="Berita tidak ditemukan" desc="Berita mungkin sudah dihapus atau tautannya salah." />
      ) : (
        <article className="mt-6">
          <KategoriBadge kategori={berita.kategori} />
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900">{berita.judul}</h1>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
            <CalendarDays className="h-4 w-4" /> {formatHari(berita.tanggal)}
          </p>
          <div className="stripe-merah-putih my-6 h-1 w-20 rounded-full" />
          <p className="whitespace-pre-line text-lg leading-relaxed text-slate-700">{berita.isi}</p>
        </article>
      )}

      {lainnya.length > 0 && (
        <div className="mt-14 border-t border-slate-200 pt-8">
          <h2 className="font-bold text-slate-900">Berita lainnya</h2>
          <div className="mt-4 space-y-3">
            {lainnya.map((p) => (
              <Link key={p.id} to={`/berita/${p.id}`} className="block rounded-xl px-4 py-3 hover:bg-slate-50">
                <p className="font-semibold text-slate-800">{p.judul}</p>
                <p className="text-sm text-slate-500">{p.kategori}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
