import { useId, useState } from 'react'
import { Plus } from 'lucide-react'
import { FAQ } from '../data/dummy'

// Daftar tanya-jawab yang bisa dibuka-tutup (satu terbuka dalam satu waktu). Dipakai di halaman publik.
export default function Faq({ daftar = FAQ }) {
  const [buka, setBuka] = useState(0)
  const id = useId()
  return (
    <div className="space-y-3">
      {daftar.map((f, i) => {
        const aktif = buka === i
        return (
          <div key={f.t} className={`rounded-[1.25rem] bg-kartu ring-1 transition ${aktif ? 'ring-primary-200 shadow-[0_18px_40px_-28px_rgb(68_6_11/0.5)]' : 'ring-garis'}`}>
            <h3 className="font-sans text-base">
              <button
                type="button"
                id={`${id}-t${i}`}
                onClick={() => setBuka(aktif ? null : i)}
                aria-expanded={aktif}
                aria-controls={`${id}-j${i}`}
                className="flex min-h-14 w-full items-center justify-between gap-6 px-5 py-4 text-left text-lg font-bold leading-snug text-tinta transition hover:text-primary-700 sm:px-6"
              >
                {f.t}
                <span aria-hidden="true" className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition duration-300 ${aktif ? 'rotate-45 bg-primary-600 text-white' : 'bg-kertas-tua text-tinta-2'}`}>
                  <Plus className="h-5 w-5" />
                </span>
              </button>
            </h3>
            <div
              id={`${id}-j${i}`}
              role="region"
              aria-labelledby={`${id}-t${i}`}
              className={`grid transition-all duration-300 ${aktif ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="overflow-hidden" inert={!aktif}>
                <p className="max-w-2xl px-5 pb-5 leading-relaxed text-tinta-2 sm:px-6">{f.j}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
