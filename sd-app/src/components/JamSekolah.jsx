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
      <Card className={`border-primary-950! bg-primary-950 p-6 text-white sm:p-7 ${className}`}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Clock className="h-5 w-5 text-stabilo" aria-hidden="true" />
          <h2 className="text-xl text-white">Jam Sekolah</h2>
          <span className="text-sm text-krem">· Senin – Jumat</span>
        </div>
        <div className={`mt-5 grid grid-cols-2 gap-3 ${untukGuru ? 'sm:grid-cols-3 lg:grid-cols-6' : 'sm:grid-cols-4'}`}>
          {daftar.map((j) => (
            <div
              key={j.label}
              className={`rounded-[1.25rem] p-4 ring-1 ring-inset ${j.guru ? 'bg-white/10 ring-stabilo/40' : 'bg-white/[0.06] ring-white/10'}`}
            >
              <p className="text-sm text-krem">{j.label}</p>
              <p className="angka mt-2 inline-block rounded-[0.9rem] bg-stabilo px-3 py-1 text-[15px] font-extrabold text-tinta">{j.jam}</p>
            </div>
          ))}
        </div>
      </Card>
    )

  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary-600" />
        <h2 className="font-bold text-slate-900">Jam Sekolah</h2>
        <span className="text-sm text-slate-500">· Senin – Jumat</span>
      </div>
      <div className={`mt-4 grid grid-cols-2 gap-2 ${untukGuru ? 'sm:grid-cols-3 lg:grid-cols-6' : 'sm:grid-cols-4'}`}>
        {daftar.map((j) => (
          <div key={j.label} className={`rounded-xl px-3 py-2.5 ${j.guru ? 'bg-sky-50' : 'bg-slate-50'}`}>
            <p className="text-xs text-slate-500">{j.label}</p>
            <p className="font-bold text-slate-900">{j.jam}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
