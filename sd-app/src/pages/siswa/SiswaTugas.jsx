import { useState } from 'react'
import { Check, ClipboardList } from 'lucide-react'
import { Badge, Card, DashHeader, EmptyState } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { MAPEL, TUGAS } from '../../data/dummy'
import { formatTanggal } from '../../utils/format'
import { infoTenggat } from './helpers'

export default function SiswaTugas() {
  const { user } = useAuth()
  const { data, toggleTugas } = useData()
  const [tab, setTab] = useState('belum')

  const selesai = data.tugasSelesai[user.nis] ?? []
  const tugasKelas = TUGAS.filter((t) => t.kelas === user.kelas)
  const belum = tugasKelas.filter((t) => !selesai.includes(t.id)).sort((a, b) => a.tenggat.localeCompare(b.tenggat))
  const sudah = tugasKelas.filter((t) => selesai.includes(t.id)).sort((a, b) => b.tenggat.localeCompare(a.tenggat))
  const daftar = tab === 'belum' ? belum : sudah
  const progres = tugasKelas.length ? Math.round((sudah.length / tugasKelas.length) * 100) : 0

  return (
    <>
      <DashHeader title="Tugas & PR" desc="Centang tugas yang sudah kamu kerjakan supaya tidak ada yang terlewat." />

      <Card className="mb-6 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700">Progres tugasku</span>
          <span className="font-bold text-slate-900">
            {sudah.length}/{tugasKelas.length} selesai
          </span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progres}%` }} />
        </div>
      </Card>

      <div className="mb-5 inline-flex rounded-xl bg-slate-100 p-1">
        {[
          ['belum', 'Belum Selesai', belum.length],
          ['sudah', 'Sudah Selesai', sudah.length],
        ].map(([k, label, n]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            {label} <span className="ml-1 text-xs text-slate-400">({n})</span>
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
        <div className="grid gap-4 md:grid-cols-2">
          {daftar.map((t) => {
            const done = selesai.includes(t.id)
            const tenggat = infoTenggat(t.tenggat)
            return (
              <Card key={t.id} className={`p-5 ${done ? 'opacity-75' : ''}`}>
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleTugas(user.nis, t.id)}
                    className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 transition ${
                      done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-primary-500'
                    }`}
                    aria-label={done ? 'Tandai belum selesai' : 'Tandai selesai'}
                  >
                    {done && <Check className="h-4 w-4" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-lg px-2 py-0.5 text-xs font-bold ${MAPEL[t.mapel].warna}`}>{MAPEL[t.mapel].nama}</span>
                      {!done && <Badge className={tenggat.cls}>{tenggat.teks}</Badge>}
                    </div>
                    <h3 className={`mt-2 font-bold text-slate-900 ${done ? 'line-through' : ''}`}>{t.judul}</h3>
                    <p className="mt-1 text-sm text-slate-600">{t.deskripsi}</p>
                    <p className="mt-3 text-xs text-slate-500">
                      Diberikan {formatTanggal(t.diberikan, { year: undefined })} · Dikumpulkan{' '}
                      <span className="font-semibold text-slate-700">{formatTanggal(t.tenggat, { year: undefined })}</span>
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
