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
      <div className="antara-y-3">
        {daftar.map((p) => {
          const buka = terbuka === p.id
          return (
            <Card key={p.id} id={`pengumuman-${p.id}`} className={buka ? 'border border-2 border-merah-100' : ''}>
              <button
                ref={(el) => buka && params.get('buka') === p.id && el?.scrollIntoView({ block: 'center' })}
                onClick={() => setTerbuka(buka ? null : p.id)}
                className="d-flex w-100 align-items-start gap-4 p-5 text-start"
                aria-expanded={buka}
              >
                <div className="flex-1">
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <KategoriBadge kategori={p.kategori} />
                    <span className="fs-xs text-tinta-3">{formatHari(p.tanggal)}</span>
                  </div>
                  <p className="mt-2 fw-bold text-tinta">{p.judul}</p>
                  {buka ? (
                    <p className="mt-3 spasi-pre-line lh-relaxed text-tinta-2">{p.isi}</p>
                  ) : (
                    <p className="mt-1 clamp-1 fs-sm text-tinta-3">{p.isi}</p>
                  )}
                </div>
                <ChevronDown className={`mt-1 h-5 w-5 flex-shrink-0 text-abu-400 transisi ${buka ? 'rotate-180' : ''}`} />
              </button>
            </Card>
          )
        })}
      </div>
    </>
  )
}
