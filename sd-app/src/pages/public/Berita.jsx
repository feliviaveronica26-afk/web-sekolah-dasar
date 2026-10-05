import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Newspaper } from 'lucide-react'
import { EmptyState, KategoriBadge, PageHeader } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { KATEGORI_PENGUMUMAN } from '../../data/dummy'
import { formatTanggal } from '../../utils/format'

export default function Berita() {
  const { data } = useData()
  const [kategori, setKategori] = useState('Semua')

  const daftar = [...data.pengumuman]
    .filter((p) => kategori === 'Semua' || p.kategori === kategori)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))

  return (
    <>
      <PageHeader title="Berita & Pengumuman" subtitle="Kabar terbaru seputar kegiatan, prestasi, dan informasi penting sekolah." />
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-wrap gap-2">
          {['Semua', ...KATEGORI_PENGUMUMAN].map((k) => (
            <button
              key={k}
              onClick={() => setKategori(k)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                kategori === k ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        {daftar.length === 0 ? (
          <EmptyState icon={Newspaper} title="Belum ada berita" desc="Belum ada berita untuk kategori ini." />
        ) : (
          <div className="space-y-4">
            {daftar.map((p) => (
              <Link
                key={p.id}
                to={`/berita/${p.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-primary-200 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <KategoriBadge kategori={p.kategori} />
                  <span className="flex items-center gap-1.5 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4" /> {formatTanggal(p.tanggal)}
                  </span>
                </div>
                <h2 className="mt-3 text-lg font-bold text-slate-900">{p.judul}</h2>
                <p className="mt-2 line-clamp-2 text-slate-600">{p.isi}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
