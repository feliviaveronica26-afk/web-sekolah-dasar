import { Clock } from 'lucide-react'
import { Card } from './ui'
import { useGayaSitus } from '../context/akses'
import { JAM_SEKOLAH } from '../data/dummy'

export default function JamSekolah({ untukGuru = false, className = '' }) {
  const daftar = JAM_SEKOLAH.filter((j) => untukGuru || !j.guru)
  const situs = useGayaSitus()

  // Portal satpam: kartu marun dengan jam berlatar kuning, seperti linimasa "Sehari di sekolah" di beranda
  if (situs)
    return (
      <Card className={`border-merah-950 bg-merah-950 p-6 text-white p-sm-7 ${className}`}>
        <div className="d-flex flex-wrap align-items-center column-gap-2 row-gap-1">
          <Clock className="h-5 w-5 text-stabilo" aria-hidden="true" />
          <h2 className="fs-xl text-white">Jam Sekolah</h2>
          <span className="fs-sm text-krem">· Senin – Jumat</span>
        </div>
        <div className={`mt-5 d-grid kolom-2 gap-3 ${untukGuru ? 'kolom-sm-3 kolom-lg-6' : 'kolom-sm-4'}`}>
          {daftar.map((j) => (
            <div
              key={j.label}
              className={`rounded-3 p-4 border ${j.guru ? 'bg-white bg-opacity-10 border-stabilo border-opacity-40' : 'bg-white/[0.06] ring-white/10'}`}
            >
              <p className="fs-sm text-krem">{j.label}</p>
              <p className="angka mt-2 d-inline-block rounded-3 bg-stabilo px-3 py-1 fs-15 fw-extrabold text-tinta">{j.jam}</p>
            </div>
          ))}
        </div>
      </Card>
    )

  return (
    <Card className={`p-5 ${className}`}>
      <div className="d-flex align-items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="fw-bold text-tinta">Jam Sekolah</h2>
        <span className="fs-sm text-tinta-3">· Senin – Jumat</span>
      </div>
      <div className={`mt-4 d-grid kolom-2 gap-2 ${untukGuru ? 'kolom-sm-3 kolom-lg-6' : 'kolom-sm-4'}`}>
        {daftar.map((j) => (
          <div key={j.label} className={`rounded-2 px-3 py-2-5 ${j.guru ? 'bg-info-subtle' : 'bg-abu-50'}`}>
            <p className="fs-xs text-tinta-3">{j.label}</p>
            <p className="fw-bold text-tinta">{j.jam}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
