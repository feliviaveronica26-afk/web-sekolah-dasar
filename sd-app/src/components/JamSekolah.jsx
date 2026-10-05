import { Clock } from 'lucide-react'
import { Card } from './ui'
import { JAM_SEKOLAH } from '../data/dummy'

export default function JamSekolah({ untukGuru = false, className = '' }) {
  const daftar = JAM_SEKOLAH.filter((j) => untukGuru || !j.guru)

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
