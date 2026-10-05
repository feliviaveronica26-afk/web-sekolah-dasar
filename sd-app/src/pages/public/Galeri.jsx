import { useState } from 'react'
import { BookOpen, Flag, Monitor, Music, Sprout, Tent, Trophy } from 'lucide-react'
import { Modal, PageHeader } from '../../components/ui'
import { GALERI } from '../../data/dummy'

// Sementara memakai ilustrasi ikon. Ganti dengan foto asli di folder public/galeri/
const IKON = { flag: Flag, trophy: Trophy, book: BookOpen, tent: Tent, music: Music, monitor: Monitor, sprout: Sprout }
const GRADASI = [
  'from-primary-500 to-primary-700',
  'from-primary-400 to-primary-600',
  'from-rose-400 to-primary-600',
  'from-primary-600 to-primary-900',
]

export default function Galeri() {
  const [kategori, setKategori] = useState('Semua')
  const [dipilih, setDipilih] = useState(null)

  const daftarKategori = ['Semua', ...new Set(GALERI.map((g) => g.kategori))]
  const daftar = GALERI.filter((g) => kategori === 'Semua' || g.kategori === kategori)

  return (
    <>
      <PageHeader title="Galeri Kegiatan" subtitle="Momen-momen berharga keseharian siswa SD Harapan Gemilang." />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-wrap gap-2">
          {daftarKategori.map((k) => (
            <button
              key={k}
              onClick={() => setKategori(k)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                kategori === k ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {daftar.map((g) => {
            const Icon = IKON[g.ikon]
            return (
              <button
                key={g.id}
                onClick={() => setDipilih(g)}
                className={`group relative aspect-[4/3] overflow-hidden rounded-2xl bg-linear-to-br text-left ${GRADASI[g.id % GRADASI.length]}`}
              >
                <Icon className="absolute right-4 top-4 h-16 w-16 text-white/25 transition group-hover:scale-110" />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/50 to-transparent p-4">
                  <p className="text-xs font-semibold text-white/80">{g.kategori}</p>
                  <p className="font-bold text-white">{g.judul}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <Modal open={!!dipilih} onClose={() => setDipilih(null)} title={dipilih?.judul} size="max-w-2xl">
        {dipilih && (
          <>
            <div className={`grid aspect-video place-items-center rounded-2xl bg-linear-to-br ${GRADASI[dipilih.id % GRADASI.length]}`}>
              {(() => {
                const Icon = IKON[dipilih.ikon]
                return <Icon className="h-24 w-24 text-white/60" />
              })()}
            </div>
            <p className="mt-4 text-sm text-slate-500">Kategori: {dipilih.kategori}</p>
          </>
        )}
      </Modal>
    </>
  )
}
