import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { KehadiranPelajaran } from '../../components/PresensiOtp'
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

      <div className="d-grid gap-6 kolom-lg-isi-280">
        <div className="antara-y-6">
          <Card className="p-4 p-sm-6">
            <div className="mb-5 d-flex align-items-center justify-content-between">
              <button onClick={() => geser(-1)} className="rounded-1 p-2 text-tinta-3 hover-latar-abu" aria-label="Bulan sebelumnya">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="fw-bold text-tinta">
                {bulan.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={() => geser(1)} className="rounded-1 p-2 text-tinta-3 hover-latar-abu" aria-label="Bulan berikutnya">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="d-grid kolom-7 gap-1-5 text-center gap-sm-2">
              {NAMA_HARI.map((h) => (
                <div key={h} className="pb-1 fs-xs fw-bold text-uppercase text-abu-400">
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
                    className={`d-flex rasio-1x1 flex-column align-items-center justify-content-center rounded-2 fs-sm fw-semibold ${
                      info ? info.cls : libur ? 'bg-abu-50 text-abu-300' : 'bg-white text-tinta-3 border border-abu-100'
                    } ${key === hariIni ? 'border border-2 border-merah-500' : ''}`}
                  >
                    {d.getDate()}
                    {info && <span className="d-none fs-10 fw-medium d-sm-block">{info.label}</span>}
                  </div>
                )
              })}
            </div>
          </Card>
          {anak && <KehadiranPelajaran nis={nis} kelas={anak.kelas} judul="Hari ini per pelajaran" />}
        </div>

        <div className="antara-y-4">
          <Card className="p-5">
            <p className="fs-sm text-tinta-3">Persentase kehadiran bulan ini</p>
            <p className="mt-1 fs-4xl fw-extrabold text-success">{ringkas.total ? `${ringkas.persen}%` : '–'}</p>
            <div className="mt-3 h-2-5 overflow-hidden rounded-pill bg-abu-100">
              <div className="h-100 rounded-pill titik-emerald" style={{ width: `${ringkas.persen}%` }} />
            </div>
            <p className="mt-2 fs-xs text-tinta-3">{ringkas.total} hari tercatat</p>
          </Card>
          <Card className="p-5">
            <p className="mb-3 fs-sm fw-bold text-tinta-2">Rekap bulan ini</p>
            <div className="antara-y-2-5">
              {Object.entries(STATUS_ABSEN).map(([kode, s]) => (
                <div key={kode} className="d-flex align-items-center justify-content-between fs-sm">
                  <span className="d-flex align-items-center gap-2 text-tinta-2">
                    <span className={`h-3 w-3 rounded-pill ${s.dot}`} /> {s.label}
                  </span>
                  <span className="fw-bold text-tinta">{ringkas[kode]} hari</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
