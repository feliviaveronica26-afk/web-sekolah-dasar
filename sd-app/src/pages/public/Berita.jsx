import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, CalendarDays, Megaphone, Newspaper, PartyPopper, Search, Trophy, UserPlus } from 'lucide-react'
import { Muncul } from '../../components/Hiasan'
import { EmptyState, KategoriBadge, PageHeader, inputCls } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { KATEGORI_PENGUMUMAN } from '../../data/dummy'
import { formatTanggal } from '../../utils/format'

// Sampul ilustratif per kategori (pengganti foto berita)
export const SAMPUL_BERITA = {
  Akademik: { icon: BookOpen, cls: 'from-sky-400 to-indigo-500' },
  Kegiatan: { icon: PartyPopper, cls: 'from-emerald-400 to-teal-600' },
  PPDB: { icon: UserPlus, cls: 'from-primary-500 to-primary-700' },
  Prestasi: { icon: Trophy, cls: 'from-amber-300 to-orange-500' },
  Umum: { icon: Megaphone, cls: 'from-slate-400 to-slate-600' },
}

export function Sampul({ kategori, besar = false }) {
  const { icon: Icon, cls } = SAMPUL_BERITA[kategori] ?? SAMPUL_BERITA.Umum
  return (
    <div className={`relative overflow-hidden bg-linear-to-br ${cls} ${besar ? 'aspect-[16/9] lg:aspect-auto lg:h-full' : 'aspect-[16/9]'}`}>
      <div className="pola-titik absolute inset-0" />
      <Icon className={`absolute text-white/30 transition duration-500 group-hover:scale-110 group-hover:rotate-6 ${besar ? '-bottom-6 -right-6 h-48 w-48' : '-bottom-4 -right-4 h-28 w-28'}`} />
      <Icon className={`absolute left-6 top-6 text-white ${besar ? 'h-12 w-12' : 'h-8 w-8'}`} />
    </div>
  )
}

const ringkas = (teks) => Math.max(1, Math.round(teks.split(/\s+/).length / 180))

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
      <PageHeader eyebrow="Kabar Sekolah" title="Berita & Pengumuman" subtitle="Kabar terbaru seputar kegiatan, prestasi, dan informasi penting sekolah." />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {['Semua', ...KATEGORI_PENGUMUMAN].map((k) => (
              <button
                key={k}
                onClick={() => setKategori(k)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  kategori === k ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
          <div className="relative lg:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari berita..." className={`${inputCls} rounded-full! pl-10`} />
          </div>
        </div>

        {!utama ? (
          <EmptyState icon={Newspaper} title="Berita tidak ditemukan" desc="Coba kategori lain atau ubah kata kunci pencarian." />
        ) : (
          <>
            <Muncul>
              <Link to={`/berita/${utama.id}`} className="group grid overflow-hidden rounded-[2rem] bg-white ring-1 ring-slate-200 transition hover:shadow-xl lg:grid-cols-2">
                <Sampul kategori={utama.kategori} besar />
                <div className="flex flex-col p-7 sm:p-10">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">Terbaru</span>
                    <KategoriBadge kategori={utama.kategori} />
                  </div>
                  <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-900 group-hover:text-primary-700">{utama.judul}</h2>
                  <p className="mt-3 line-clamp-4 text-slate-600">{utama.isi}</p>
                  <p className="mt-auto flex items-center gap-1.5 pt-6 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4" /> {formatTanggal(utama.tanggal)} · {ringkas(utama.isi)} menit baca
                  </p>
                </div>
              </Link>
            </Muncul>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {lainnya.map((p, i) => (
                <Muncul key={p.id} jeda={(i % 3) * 80}>
                  <Link to={`/berita/${p.id}`} className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
                    <Sampul kategori={p.kategori} />
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center justify-between gap-2">
                        <KategoriBadge kategori={p.kategori} />
                        <span className="text-xs text-slate-500">{formatTanggal(p.tanggal)}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold leading-snug text-slate-900 group-hover:text-primary-700">{p.judul}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{p.isi}</p>
                    </div>
                  </Link>
                </Muncul>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  )
}
