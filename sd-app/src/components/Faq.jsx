import { useId, useState } from 'react'
import { Plus } from 'lucide-react'
import { FAQ } from '../data/dummy'

// Daftar tanya-jawab yang bisa dibuka-tutup (satu terbuka dalam satu waktu). Dipakai di halaman publik.
export default function Faq({ daftar = FAQ }) {
  const [buka, setBuka] = useState(0)
  const id = useId()
  return (
    <div className="d-flex flex-column gap-3">
      {daftar.map((f, i) => {
        const aktif = buka === i
        return (
          <div key={f.t} className={`rounded-4 bg-white border transisi ${aktif ? 'border-merah-200 faq-aktif' : 'border-garis'}`}>
            <h3 className="fs-base">
              <button
                type="button"
                id={`${id}-t${i}`}
                onClick={() => setBuka(aktif ? null : i)}
                aria-expanded={aktif}
                aria-controls={`${id}-j${i}`}
                className="d-flex min-h-14 w-100 align-items-center justify-content-between gap-6 px-5 px-sm-6 py-4 text-start fs-lg fw-bold lh-snug text-tinta transisi hover-teks-merah"
              >
                {f.t}
                <span
                  aria-hidden="true"
                  className={`faq-plus d-flex align-items-center justify-content-center ukuran-9 flex-shrink-0 rounded-circle ${aktif ? 'faq-plus--buka bg-primary text-white' : 'bg-kertas-tua text-tinta-2'}`}
                >
                  <Plus className="ukuran-5" />
                </span>
              </button>
            </h3>
            <div id={`${id}-j${i}`} role="region" aria-labelledby={`${id}-t${i}`} className={`lipat ${aktif ? 'lipat--buka' : ''}`}>
              <div className="overflow-hidden" inert={!aktif}>
                <p className="mw-2xl px-5 px-sm-6 pb-5 lh-relaxed text-tinta-2">{f.j}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
