import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, DashHeader } from './ui'
import { KALENDER } from '../data/dummy'
import { formatTanggal, todayKey, toKey } from '../utils/format'

const NAMA_HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export const JENIS_AGENDA = {
  libur: { label: 'Libur', blok: 'bg-rose-500 text-white', soft: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
  ujian: { label: 'Ujian', blok: 'bg-amber-400 text-amber-950', soft: 'bg-amber-50 text-amber-800', dot: 'bg-amber-400' },
  kegiatan: { label: 'Kegiatan', blok: 'bg-sky-500 text-white', soft: 'bg-sky-50 text-sky-700', dot: 'bg-sky-500' },
}

export const agendaPada = (key) => KALENDER.filter((e) => key >= e.mulai && key <= (e.selesai ?? e.mulai))

export const agendaMendatang = (n, dari = todayKey()) =>
  KALENDER.filter((e) => (e.selesai ?? e.mulai) >= dari)
    .sort((a, b) => a.mulai.localeCompare(b.mulai))
    .slice(0, n)

export function rentangAgenda(e) {
  if (!e.selesai || e.selesai === e.mulai) return formatTanggal(e.mulai)
  return `${formatTanggal(e.mulai, { year: undefined })} – ${formatTanggal(e.selesai)}`
}

export default function KalenderAkademik() {
  const [bulan, setBulan] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const hariIni = todayKey()

  const jumlahHari = new Date(bulan.getFullYear(), bulan.getMonth() + 1, 0).getDate()
  const offset = (bulan.getDay() + 6) % 7
  const hari = Array.from({ length: jumlahHari }, (_, i) => new Date(bulan.getFullYear(), bulan.getMonth(), i + 1))
  const awal = toKey(hari[0])
  const akhir = toKey(hari[hari.length - 1])
  const agendaBulanIni = KALENDER.filter((e) => e.mulai <= akhir && (e.selesai ?? e.mulai) >= awal).sort((a, b) =>
    a.mulai.localeCompare(b.mulai),
  )

  const geser = (n) => setBulan(new Date(bulan.getFullYear(), bulan.getMonth() + n, 1))

  return (
    <>
      <DashHeader title="Kalender Akademik" desc="Tahun ajaran 2026/2027 — hari libur, ujian, dan kegiatan sekolah." />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card className="p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <button onClick={() => geser(-1)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Bulan sebelumnya">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-900">{bulan.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h2>
            <button onClick={() => geser(1)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Bulan berikutnya">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {NAMA_HARI.map((h, i) => (
              <div key={h} className={`pb-1 text-center text-xs font-bold uppercase ${i >= 5 ? 'text-rose-400' : 'text-slate-400'}`}>
                {h}
              </div>
            ))}
            {Array.from({ length: offset }, (_, i) => (
              <div key={`kosong-${i}`} />
            ))}
            {hari.map((d) => {
              const key = toKey(d)
              const agenda = agendaPada(key)
              const libur = agenda.some((e) => e.jenis === 'libur')
              const akhirPekan = d.getDay() === 0 || d.getDay() === 6
              return (
                <div
                  key={key}
                  className={`flex min-h-14 flex-col rounded-xl p-1.5 sm:min-h-24 sm:p-2 ${
                    libur ? 'bg-rose-50' : akhirPekan ? 'bg-slate-50' : 'bg-white ring-1 ring-slate-100'
                  } ${key === hariIni ? 'ring-2 ring-primary-500' : ''}`}
                >
                  <span className={`text-sm font-bold ${libur || akhirPekan ? 'text-rose-500' : 'text-slate-700'}`}>{d.getDate()}</span>
                  {/* Titik di HP, label di layar lebar */}
                  <div className="mt-1 flex flex-wrap gap-1 sm:hidden">
                    {agenda.map((e) => (
                      <span key={e.judul} className={`h-1.5 w-1.5 rounded-full ${JENIS_AGENDA[e.jenis].dot}`} />
                    ))}
                  </div>
                  <div className="mt-1 hidden space-y-1 sm:block">
                    {agenda.slice(0, 2).map((e) => (
                      <p key={e.judul} title={e.judul} className={`truncate rounded px-1.5 py-0.5 text-[10px] font-semibold ${JENIS_AGENDA[e.jenis].blok}`}>
                        {e.judul}
                      </p>
                    ))}
                    {agenda.length > 2 && <p className="text-[10px] text-slate-500">+{agenda.length - 2} lagi</p>}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            {Object.values(JENIS_AGENDA).map((j) => (
              <span key={j.label} className="flex items-center gap-2 text-slate-600">
                <span className={`h-3 w-3 rounded-full ${j.dot}`} /> {j.label}
              </span>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-bold text-slate-900">Agenda Bulan Ini</h2>
            {agendaBulanIni.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">Tidak ada agenda khusus bulan ini.</p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {agendaBulanIni.map((e) => (
                  <li key={e.judul + e.mulai} className={`rounded-xl px-4 py-3 ${JENIS_AGENDA[e.jenis].soft}`}>
                    <p className="text-sm font-bold">{e.judul}</p>
                    <p className="mt-0.5 text-xs opacity-80">
                      {rentangAgenda(e)}
                      {e.perkiraan && ' · tanggal perkiraan'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-bold text-slate-900">Libur Terdekat</h2>
            <ul className="mt-4 space-y-3">
              {KALENDER.filter((e) => e.jenis === 'libur' && (e.selesai ?? e.mulai) >= hariIni)
                .sort((a, b) => a.mulai.localeCompare(b.mulai))
                .slice(0, 4)
                .map((e) => (
                  <li key={e.judul + e.mulai} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{e.judul}</p>
                      <p className="text-xs text-slate-500">{rentangAgenda(e)}</p>
                    </div>
                  </li>
                ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
