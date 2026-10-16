import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { Card, DashHeader, KategoriBadge } from '../components/ui'
import { useData } from '../context/DataContext'
import { formatHari } from '../utils/format'

// Pengumuman sekolah untuk portal siswa & orang tua. `?buka=<id>` langsung membuka satu pengumuman
// (dipakai kartu pengumuman di beranda).
export default function Pengumuman() {
  const { data } = useData()
  const [params] = useSearchParams()
  const [terbuka, setTerbuka] = useState(() => params.get('buka'))
  const daftar = [...data.pengumuman].sort((a, b) => b.tanggal.localeCompare(a.tanggal))

  return (
    <>
      <DashHeader title="Pengumuman" desc="Informasi terbaru dari sekolah untuk orang tua dan siswa." />
      <div className="space-y-3">
        {daftar.map((p) => {
          const buka = terbuka === p.id
          return (
            <Card key={p.id} id={`pengumuman-${p.id}`} className={buka ? 'ring-2 ring-primary-100' : ''}>
              <button
                ref={(el) => buka && params.get('buka') === p.id && el?.scrollIntoView({ block: 'center' })}
                onClick={() => setTerbuka(buka ? null : p.id)}
                className="flex w-full items-start gap-4 p-5 text-left"
                aria-expanded={buka}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <KategoriBadge kategori={p.kategori} />
                    <span className="text-xs text-slate-500">{formatHari(p.tanggal)}</span>
                  </div>
                  <p className="mt-2 font-bold text-slate-900">{p.judul}</p>
                  {buka ? (
                    <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-700">{p.isi}</p>
                  ) : (
                    <p className="mt-1 line-clamp-1 text-sm text-slate-500">{p.isi}</p>
                  )}
                </div>
                <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-slate-400 transition ${buka ? 'rotate-180' : ''}`} />
              </button>
            </Card>
          )
        })}
      </div>
    </>
  )
}
