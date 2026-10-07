import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { FAQ } from '../data/dummy'

// Daftar tanya-jawab yang bisa dibuka-tutup (satu terbuka dalam satu waktu)
export default function Faq({ daftar = FAQ }) {
  const [buka, setBuka] = useState(0)
  return (
    <div className="space-y-3">
      {daftar.map((f, i) => {
        const aktif = buka === i
        return (
          <div key={f.t} className={`overflow-hidden rounded-2xl bg-white ring-1 transition ${aktif ? 'shadow-lg ring-primary-200' : 'ring-slate-200'}`}>
            <button
              onClick={() => setBuka(aktif ? null : i)}
              aria-expanded={aktif}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-slate-900 hover:text-primary-700"
            >
              {f.t}
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${aktif ? 'rotate-180 bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <ChevronDown className="h-4 w-4" />
              </span>
            </button>
            <div className={`grid transition-all duration-300 ${aktif ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
                <p className="px-5 pb-5 leading-relaxed text-slate-600">{f.j}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
