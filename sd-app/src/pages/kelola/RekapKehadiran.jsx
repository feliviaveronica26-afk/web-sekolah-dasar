import { useState } from 'react'
import { Users } from 'lucide-react'
import { Avatar, Card, DashHeader, EmptyState, inputCls } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { kehadiranPerKelas, kehadiranSekolah, perluPerhatianHadir, rekapSiswa } from '../../utils/ringkasan'

const warna = (p) => (p >= 90 ? 'titik-emerald' : p >= 75 ? 'titik-amber' : 'titik-rose')

export default function RekapKehadiran() {
  const { data } = useData()
  const [kelas, setKelas] = useState('')

  const perKelas = kehadiranPerKelas(data)
  const rataRata = kehadiranSekolah(data)
  const perhatian = rekapSiswa(data)
    .filter((s) => perluPerhatianHadir(s) && (!kelas || s.kelas === kelas))
    .sort((a, b) => a.persen - b.persen)

  return (
    <>
      <DashHeader title="Rekap Kehadiran" desc="Kehadiran siswa selama 20 hari sekolah terakhir." />

      <div className="d-grid gap-6 kolom-lg-10-13">
        <Card className="h-auto p-6">
          <p className="fs-sm text-tinta-3">Rata-rata kehadiran sekolah</p>
          <p className="fs-4xl fw-extrabold text-success">{rataRata}%</p>
          <div className="mt-6 antara-y-4">
            {perKelas.map((k) => (
              <div key={k.kelas}>
                <div className="mb-1-5 d-flex justify-content-between fs-sm">
                  <span className="fw-semibold text-tinta-2">
                    Kelas {k.kelas} <span className="fw-normal text-abu-400">· {k.jumlah} siswa</span>
                  </span>
                  <span className="fw-bold text-tinta">{k.persen}%</span>
                </div>
                <div className="h-2-5 overflow-hidden rounded-pill bg-abu-100">
                  <div className={`h-100 rounded-pill ${warna(k.persen)}`} style={{ width: `${k.persen}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 border-bottom border-abu-100 p-5">
            <div>
              <h2 className="fw-bold text-tinta">Siswa Perlu Perhatian</h2>
              <p className="fs-sm text-tinta-3">Kehadiran di bawah 90%</p>
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
            <ul className="pembatas-y pembatas-abu">
              {perhatian.map((s) => (
                <li key={s.nis} className="d-flex align-items-center gap-3 px-5 py-3">
                  <Avatar nama={s.nama} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="fw-semibold text-tinta">{s.nama}</p>
                    <p className="fs-xs text-tinta-3">
                      Kelas {s.kelas} · Sakit {s.S} · Izin {s.I} · Alpa {s.A}
                    </p>
                  </div>
                  <span className="fs-sm fw-bold text-tinta">{s.persen}%</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
