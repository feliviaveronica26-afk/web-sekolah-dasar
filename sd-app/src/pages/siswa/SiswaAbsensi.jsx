import { useState } from 'react'
import { CalendarCheck, Info } from 'lucide-react'
import { Badge, Card, DashHeader, EmptyState, STATUS_ABSEN } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { absensiPerMapel, useData } from '../../context/DataContext'
import { MAPEL } from '../../data/dummy'
import { formatHari } from '../../utils/format'

const warnaPersen = (p) => (p >= 90 ? 'bg-emerald-500' : p >= 75 ? 'bg-amber-400' : 'bg-rose-500')

export default function SiswaAbsensi() {
  const { user } = useAuth()
  const { data } = useData()
  const perMapel = absensiPerMapel(data.absensi, user.nis, user.kelas)
  const daftar = Object.entries(perMapel).sort((a, b) => MAPEL[a[0]].nama.localeCompare(MAPEL[b[0]].nama))
  const [dipilih, setDipilih] = useState(daftar[0]?.[0] ?? null)

  const total = daftar.reduce(
    (acc, [, r]) => ({ H: acc.H + r.H, S: acc.S + r.S, I: acc.I + r.I, A: acc.A + r.A, total: acc.total + r.total }),
    { H: 0, S: 0, I: 0, A: 0, total: 0 },
  )
  const persenTotal = total.total ? Math.round((total.H / total.total) * 100) : 0
  const detail = dipilih ? perMapel[dipilih] : null

  if (daftar.length === 0) {
    return (
      <>
        <DashHeader title="Absensi per Mata Pelajaran" />
        <Card>
          <EmptyState icon={CalendarCheck} title="Belum ada data absensi" />
        </Card>
      </>
    )
  }

  return (
    <>
      <DashHeader title="Absensi per Mata Pelajaran" desc="Kehadiranmu di setiap pelajaran selama semester ini." />

      {/* Ringkasan keseluruhan */}
      <Card className="mb-6 p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="text-center sm:w-44 sm:text-left">
            <p className="text-sm text-slate-500">Total kehadiran</p>
            <p className="text-5xl font-extrabold text-emerald-600">{persenTotal}%</p>
            <p className="mt-1 text-xs text-slate-500">dari {total.total} jam pelajaran</p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(STATUS_ABSEN).map(([k, s]) => (
              <div key={k} className={`rounded-2xl px-4 py-3 ${s.cls}`}>
                <p className="text-2xl font-extrabold">{total[k]}</p>
                <p className="text-xs font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Kartu per mapel */}
        <div className="grid gap-3 sm:grid-cols-2">
          {daftar.map(([kode, r]) => (
            <button
              key={kode}
              onClick={() => setDipilih(kode)}
              className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md ${
                dipilih === kode ? 'border-primary-400 ring-2 ring-primary-100' : 'border-slate-200/80'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`rounded-lg px-2.5 py-1 text-sm font-bold ${MAPEL[kode].warna}`}>{MAPEL[kode].nama}</span>
                <span className="text-lg font-extrabold text-slate-900">{r.persen}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${warnaPersen(r.persen)}`} style={{ width: `${r.persen}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Hadir {r.H} dari {r.total} pertemuan
                {r.total - r.H > 0 && ` · S ${r.S} · I ${r.I} · A ${r.A}`}
              </p>
            </button>
          ))}
        </div>

        {/* Riwayat mapel terpilih */}
        {detail && (
          <Card className="h-fit lg:sticky lg:top-24">
            <div className="border-b border-slate-100 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Riwayat</p>
              <h2 className="mt-1 font-bold text-slate-900">{MAPEL[dipilih].nama}</h2>
              <p className="text-sm text-slate-500">{MAPEL[dipilih].guru}</p>
            </div>
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {detail.riwayat.map((r) => (
                <li key={r.tanggal} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="text-slate-700">{formatHari(r.tanggal)}</span>
                  <Badge className={STATUS_ABSEN[r.status].cls}>{STATUS_ABSEN[r.status].label}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <p className="mt-6 flex items-start gap-2 text-xs text-slate-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Upacara dan senam pagi tidak dihitung dalam absensi per mata pelajaran. Kehadiran minimal yang disarankan adalah 90%.
      </p>
    </>
  )
}
