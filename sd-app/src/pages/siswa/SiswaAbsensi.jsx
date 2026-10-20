import { useState } from 'react'
import { CalendarCheck, Info } from 'lucide-react'
import { Badge, Card, DashHeader, EmptyState, STATUS_ABSEN } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { absensiPerMapel, useData } from '../../context/DataContext'
import { MAPEL } from '../../data/dummy'
import { namaPengampu } from '../../utils/jadwal'
import { formatHari } from '../../utils/format'

const warnaPersen = (p) => (p >= 90 ? 'titik-emerald' : p >= 75 ? 'titik-amber' : 'titik-rose')

export default function SiswaAbsensi() {
  const { user } = useAuth()
  const { data } = useData()
  const perMapel = absensiPerMapel(data, user.nis, user.kelas)
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
        <div className="d-flex flex-column gap-6 flex-sm-row align-items-sm-center">
          <div className="text-center w-sm-44 text-sm-start">
            <p className="fs-sm text-tinta-3">Total kehadiran</p>
            <p className="fs-5xl fw-extrabold text-success">{persenTotal}%</p>
            <p className="mt-1 fs-xs text-tinta-3">dari {total.total} jam pelajaran</p>
          </div>
          <div className="d-grid flex-1 kolom-2 gap-3 kolom-sm-4">
            {Object.entries(STATUS_ABSEN).map(([k, s]) => (
              <div key={k} className={`rounded-3 px-4 py-3 ${s.cls}`}>
                <p className="fs-2xl fw-extrabold">{total[k]}</p>
                <p className="fs-xs fw-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="d-grid gap-6 kolom-lg-isi-380">
        {/* Kartu per mapel */}
        <div className="d-grid gap-3 kolom-sm-2">
          {daftar.map(([kode, r]) => (
            <button
              key={kode}
              onClick={() => setDipilih(kode)}
              className={`rounded-3 border bg-white p-4 text-start shadow-sm transisi hover-bayangan-kecil ${
                dipilih === kode ? 'border-merah-400 border border-2 border-merah-100' : 'border-abu-200'
              }`}
            >
              <div className="d-flex align-items-start justify-content-between gap-2">
                <span className={`rounded-1 px-2-5 py-1 fs-sm fw-bold ${MAPEL[kode].warna}`}>{MAPEL[kode].nama}</span>
                <span className="fs-lg fw-extrabold text-tinta">{r.persen}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-pill bg-abu-100">
                <div className={`h-100 rounded-pill ${warnaPersen(r.persen)}`} style={{ width: `${r.persen}%` }} />
              </div>
              <p className="mt-2 fs-xs text-tinta-3">
                Hadir {r.H} dari {r.total} pertemuan
                {r.total - r.H > 0 && ` · S ${r.S} · I ${r.I} · A ${r.A}`}
              </p>
            </button>
          ))}
        </div>

        {/* Riwayat mapel terpilih */}
        {detail && (
          <Card className="h-auto position-lg-sticky top-lg-24">
            <div className="border-bottom border-abu-100 p-5">
              <p className="fs-xs fw-semibold text-uppercase ls-wider text-abu-400">Riwayat</p>
              <h2 className="mt-1 fw-bold text-tinta">{MAPEL[dipilih].nama}</h2>
              <p className="fs-sm text-tinta-3">{namaPengampu(data.guru, user.kelas, dipilih)}</p>
            </div>
            <ul className="mh-96 pembatas-y pembatas-abu overflow-y-auto">
              {detail.riwayat.map((r) => (
                <li key={r.tanggal + r.jam} className="d-flex align-items-center justify-content-between gap-3 px-5 py-3 fs-sm">
                  <span className="text-tinta-2">
                    {formatHari(r.tanggal)} <span className="fs-xs text-abu-400">· {r.jam}</span>
                  </span>
                  <Badge className={STATUS_ABSEN[r.status].cls}>{STATUS_ABSEN[r.status].label}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <p className="mt-6 d-flex align-items-start gap-2 fs-xs text-tinta-3">
        <Info className="mt-0-5 h-3-5 w-3-5 flex-shrink-0" />
        Kehadiran di tiap pelajaran dicatat guru pengampunya (kode OTP atau manual). Pelajaran yang tidak dipresensi tersendiri mengikuti presensi
        harian. Upacara dan senam pagi tidak dihitung. Kehadiran minimal yang disarankan adalah 90%.
      </p>
    </>
  )
}
