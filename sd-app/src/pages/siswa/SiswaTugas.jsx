import { useState } from 'react'
import { Check, ClipboardList } from 'lucide-react'
import { Badge, Card, DashHeader, EmptyState } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { MAPEL } from '../../data/dummy'
import { formatTanggal } from '../../utils/format'
import { infoTenggat } from './helpers'

export default function SiswaTugas() {
  const { user } = useAuth()
  const { data, toggleTugas } = useData()
  const [tab, setTab] = useState('belum')

  const selesai = data.tugasSelesai[user.nis] ?? []
  const tugasKelas = data.tugas.filter((t) => t.kelas === user.kelas)
  const belum = tugasKelas.filter((t) => !selesai.includes(t.id)).sort((a, b) => a.tenggat.localeCompare(b.tenggat))
  const sudah = tugasKelas.filter((t) => selesai.includes(t.id)).sort((a, b) => b.tenggat.localeCompare(a.tenggat))
  const daftar = tab === 'belum' ? belum : sudah
  const progres = tugasKelas.length ? Math.round((sudah.length / tugasKelas.length) * 100) : 0

  return (
    <>
      <DashHeader title="Tugas & PR" desc="Centang tugas yang sudah kamu kerjakan supaya tidak ada yang terlewat." />

      <Card className="mb-6 p-5">
        <div className="d-flex align-items-center justify-content-between fs-sm">
          <span className="fw-semibold text-tinta-2">Progres tugasku</span>
          <span className="fw-bold text-tinta">
            {sudah.length}/{tugasKelas.length} selesai
          </span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-pill bg-abu-100">
          <div className="h-100 rounded-pill titik-emerald transisi" style={{ width: `${progres}%` }} />
        </div>
      </Card>

      <div className="mb-5 d-inline-flex mw-100 overflow-x-auto rounded-2 bg-abu-100 p-1">
        {[
          ['belum', 'Belum Selesai', belum.length],
          ['sudah', 'Sudah Selesai', sudah.length],
        ].map(([k, label, n]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex-shrink-0 text-nowrap rounded-1 px-4 py-2 fs-sm fw-semibold transisi ${tab === k ? 'bg-white text-tinta shadow-sm' : 'text-tinta-3'}`}
          >
            {label} <span className="ms-1 fs-xs text-abu-400">({n})</span>
          </button>
        ))}
      </div>

      {daftar.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title={tab === 'belum' ? 'Semua tugas sudah selesai! 🎉' : 'Belum ada tugas yang selesai'}
            desc={tab === 'belum' ? 'Kerja bagus! Jangan lupa istirahat dan bermain.' : 'Centang tugas di tab "Belum Selesai" setelah kamu mengerjakannya.'}
          />
        </Card>
      ) : (
        <div className="d-grid gap-4 kolom-md-2">
          {daftar.map((t) => {
            const done = selesai.includes(t.id)
            const tenggat = infoTenggat(t.tenggat)
            return (
              <Card key={t.id} className={`p-5 ${done ? 'opacity-75' : ''}`}>
                <div className="d-flex align-items-start gap-4">
                  <button
                    onClick={() => toggleTugas(t.id)}
                    className={`mt-0-5 d-flex h-7 w-7 flex-shrink-0 align-items-center justify-content-center rounded-1 border border-2 transisi ${
                      done ? 'border-success titik-emerald text-white' : 'border-abu-300 hover-garis-merah'
                    }`}
                    aria-label={done ? 'Tandai belum selesai' : 'Tandai selesai'}
                  >
                    {done && <Check className="h-4 w-4" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <span className={`rounded-1 px-2 py-0-5 fs-xs fw-bold ${MAPEL[t.mapel].warna}`}>{MAPEL[t.mapel].nama}</span>
                      {!done && <Badge className={tenggat.cls}>{tenggat.teks}</Badge>}
                    </div>
                    <h3 className={`mt-2 fw-bold text-tinta ${done ? 'line-through' : ''}`}>{t.judul}</h3>
                    <p className="mt-1 fs-sm text-tinta-2">{t.deskripsi}</p>
                    <p className="mt-3 fs-xs text-tinta-3">
                      Diberikan {formatTanggal(t.diberikan, { year: undefined })} · Dikumpulkan{' '}
                      <span className="fw-semibold text-tinta-2">{formatTanggal(t.tenggat, { year: undefined })}</span>
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
