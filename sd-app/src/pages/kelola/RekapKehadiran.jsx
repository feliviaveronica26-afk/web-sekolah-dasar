import { useState } from 'react'
import { Users } from 'lucide-react'
import { Avatar, Card, DashHeader, EmptyState, inputCls } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { kehadiranPerKelas, kehadiranSekolah, rekapSiswa } from '../../utils/ringkasan'

const warna = (p) => (p >= 90 ? 'bg-emerald-500' : p >= 75 ? 'bg-amber-400' : 'bg-rose-500')

export default function RekapKehadiran() {
  const { data } = useData()
  const [kelas, setKelas] = useState('')

  const perKelas = kehadiranPerKelas(data)
  const rataRata = kehadiranSekolah(data)
  const perhatian = rekapSiswa(data)
    .filter((s) => s.persen < 90 && (!kelas || s.kelas === kelas))
    .sort((a, b) => a.persen - b.persen)

  return (
    <>
      <DashHeader title="Rekap Kehadiran" desc="Kehadiran siswa selama 20 hari sekolah terakhir." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Card className="h-fit p-6">
          <p className="text-sm text-slate-500">Rata-rata kehadiran sekolah</p>
          <p className="text-4xl font-extrabold text-emerald-600">{rataRata}%</p>
          <div className="mt-6 space-y-4">
            {perKelas.map((k) => (
              <div key={k.kelas}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">
                    Kelas {k.kelas} <span className="font-normal text-slate-400">· {k.jumlah} siswa</span>
                  </span>
                  <span className="font-bold text-slate-900">{k.persen}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${warna(k.persen)}`} style={{ width: `${k.persen}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div>
              <h2 className="font-bold text-slate-900">Siswa Perlu Perhatian</h2>
              <p className="text-sm text-slate-500">Kehadiran di bawah 90%</p>
            </div>
            <select value={kelas} onChange={(e) => setKelas(e.target.value)} className={`${inputCls} w-40`}>
              <option value="">Semua kelas</option>
              {perKelas.map((k) => (
                <option key={k.kelas} value={k.kelas}>
                  Kelas {k.kelas}
                </option>
              ))}
            </select>
          </div>
          {perhatian.length === 0 ? (
            <EmptyState icon={Users} title="Semua siswa hadir dengan baik" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {perhatian.map((s) => (
                <li key={s.nis} className="flex items-center gap-3 px-5 py-3">
                  <Avatar nama={s.nama} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800">{s.nama}</p>
                    <p className="text-xs text-slate-500">
                      Kelas {s.kelas} · Sakit {s.S} · Izin {s.I} · Alpa {s.A}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{s.persen}%</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
