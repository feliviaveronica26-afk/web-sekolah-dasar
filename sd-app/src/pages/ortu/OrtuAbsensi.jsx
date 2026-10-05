import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, DashHeader, STATUS_ABSEN } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { ringkasAbsensi, useData } from '../../context/DataContext'
import { todayKey, toKey } from '../../utils/format'

const NAMA_HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export default function OrtuAbsensi() {
  const { user } = useAuth()
  const { data } = useData()
  const [bulan, setBulan] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const nis = user.anakNis
  const anak = data.siswa.find((s) => s.nis === nis)
  const hariIni = todayKey()

  const jumlahHari = new Date(bulan.getFullYear(), bulan.getMonth() + 1, 0).getDate()
  const offset = (bulan.getDay() + 6) % 7 // Senin sebagai awal minggu
  const hariBulanIni = Array.from({ length: jumlahHari }, (_, i) => new Date(bulan.getFullYear(), bulan.getMonth(), i + 1))
  const ringkas = ringkasAbsensi(data.absensi, nis, hariBulanIni.map(toKey))

  const geser = (n) => setBulan(new Date(bulan.getFullYear(), bulan.getMonth() + n, 1))

  return (
    <>
      <DashHeader title="Absensi Anak" desc={`Riwayat kehadiran ${anak?.nama ?? ''} setiap hari sekolah.`} />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card className="p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <button onClick={() => geser(-1)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Bulan sebelumnya">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="font-bold text-slate-900">
              {bulan.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={() => geser(1)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Bulan berikutnya">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center sm:gap-2">
            {NAMA_HARI.map((h) => (
              <div key={h} className="pb-1 text-xs font-bold uppercase text-slate-400">
                {h}
              </div>
            ))}
            {Array.from({ length: offset }, (_, i) => (
              <div key={`kosong-${i}`} />
            ))}
            {hariBulanIni.map((d) => {
              const key = toKey(d)
              const status = data.absensi[key]?.[nis]
              const libur = d.getDay() === 0 || d.getDay() === 6
              const info = STATUS_ABSEN[status]
              return (
                <div
                  key={key}
                  title={info?.label}
                  className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-semibold ${
                    info ? info.cls : libur ? 'bg-slate-50 text-slate-300' : 'bg-white text-slate-500 ring-1 ring-slate-100'
                  } ${key === hariIni ? 'ring-2 ring-primary-500' : ''}`}
                >
                  {d.getDate()}
                  {info && <span className="hidden text-[10px] font-medium sm:block">{info.label}</span>}
                </div>
              )
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-sm text-slate-500">Persentase kehadiran bulan ini</p>
            <p className="mt-1 text-4xl font-extrabold text-emerald-600">{ringkas.total ? `${ringkas.persen}%` : '–'}</p>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${ringkas.persen}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">{ringkas.total} hari tercatat</p>
          </Card>
          <Card className="p-5">
            <p className="mb-3 text-sm font-bold text-slate-700">Rekap bulan ini</p>
            <div className="space-y-2.5">
              {Object.entries(STATUS_ABSEN).map(([kode, s]) => (
                <div key={kode} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className={`h-3 w-3 rounded-full ${s.dot}`} /> {s.label}
                  </span>
                  <span className="font-bold text-slate-900">{ringkas[kode]} hari</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
