import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Card, DashHeader, KategoriBadge } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { formatHari } from '../../utils/format'

export default function OrtuPengumuman() {
  const { data } = useData()
  const [terbuka, setTerbuka] = useState(null)
  const daftar = [...data.pengumuman].sort((a, b) => b.tanggal.localeCompare(a.tanggal))

  return (
    <>
      <DashHeader title="Pengumuman" desc="Informasi terbaru dari sekolah untuk orang tua dan siswa." />
      <div className="space-y-3">
        {daftar.map((p) => {
          const buka = terbuka === p.id
          return (
            <Card key={p.id}>
              <button onClick={() => setTerbuka(buka ? null : p.id)} className="flex w-full items-start gap-4 p-5 text-left" aria-expanded={buka}>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <KategoriBadge kategori={p.kategori} />
                    <span className="text-xs text-slate-500">{formatHari(p.tanggal)}</span>
                  </div>
                  <p className="mt-2 font-bold text-slate-900">{p.judul}</p>
                  {buka && <p className="mt-3 leading-relaxed text-slate-700">{p.isi}</p>}
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
