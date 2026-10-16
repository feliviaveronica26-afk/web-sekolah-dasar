import { useState } from 'react'
import { Muncul } from '../../components/Hiasan'
import { Foto, JudulBagian, KepalaHalaman, wadah } from '../../components/Situs'
import { Avatar } from '../../components/ui'
import { PERAN } from '../../context/akses'
import { useData } from '../../context/DataContext'
import { SEKOLAH } from '../../data/dummy'
import { FOTO } from '../../data/foto'

// Kelompok ditampilkan berurutan; tiap orang masuk ke kelompok pertama yang cocok
const KELOMPOK = [
  { kode: 'pimpinan', label: 'Pimpinan', cocok: (g) => g.jabatan === 'Kepala Sekolah' || g.peran?.some((p) => p.startsWith('wakasek')) },
  { kode: 'wali', label: 'Wali kelas', cocok: (g) => g.peran?.includes('wali_kelas') },
  { kode: 'guru', label: 'Guru mapel & BK', cocok: (g) => g.peran?.some((p) => ['guru_mapel', 'guru_bk'].includes(p)) },
  { kode: 'tendik', label: 'Tenaga kependidikan', cocok: () => true },
]

const kelompokDari = (g) => KELOMPOK.find((k) => k.cocok(g)).kode

const ANGKA_GURU = [
  ['90%', 'guru berkualifikasi S1 kependidikan'],
  ['6', 'guru telah tersertifikasi pendidik'],
  ['1 : 14', 'rasio guru dan siswa'],
]

function KartuGuru({ g, i }) {
  const peran = (g.peran ?? []).map((p) => (p === 'wali_kelas' ? `Wali Kelas ${g.kelas}` : PERAN[p]?.label)).filter(Boolean)
  return (
    <Muncul as="li" jeda={(i % 3) * 60} className="flex gap-4 rounded-[1.5rem] bg-kartu p-5 ring-1 ring-garis transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-28px_rgb(68_6_11/0.5)]">
      <Avatar nama={g.nama} size="lg" className="bg-primary-50 text-primary-700" />
      <div className="min-w-0">
        <h3 className="text-lg leading-snug">{g.nama}</h3>
        <p className="mt-0.5 text-[15px] font-semibold text-primary-700">{g.jabatan}</p>
        {g.mapel && g.mapel !== '-' && <p className="mt-1 text-[15px] text-tinta-2">{g.mapel}</p>}
        {peran.length > 1 && <p className="mt-1 text-sm text-tinta-3">{peran.join(' · ')}</p>}
      </div>
    </Muncul>
  )
}

export default function Guru() {
  const { data } = useData()
  const [tab, setTab] = useState('semua')

  const daftar = data.guru.filter((g) => tab === 'semua' || kelompokDari(g) === tab)
  const jumlah = (kode) => data.guru.filter((g) => kelompokDari(g) === kode).length
  const pilihan = [['semua', 'Semua', data.guru.length], ...KELOMPOK.map((k) => [k.kode, k.label, jumlah(k.kode)])]

  return (
    <>
      <KepalaHalaman
        jejak="Guru & staf"
        judul="Pendidik yang sabar, hangat, dan terus belajar."
        desc={`Kenali guru dan tenaga kependidikan ${SEKOLAH.nama} yang mendampingi ananda setiap hari.`}
        foto={FOTO.guruMendampingi}
      />

      <section className={`${wadah} py-14 lg:py-20`}>
        <div role="group" aria-label="Saring menurut kelompok" className="mb-8 flex flex-wrap gap-2">
          {pilihan.map(([k, label, n]) => (
            <button
              key={k}
              type="button"
              aria-pressed={tab === k}
              onClick={() => setTab(k)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[15px] font-bold transition ${
                tab === k ? 'bg-primary-600 text-white' : 'bg-kartu text-tinta-2 ring-1 ring-inset ring-garis hover:text-tinta hover:ring-tinta/30'
              }`}
            >
              {label}{' '}
              <span className={`angka rounded-full px-2 py-0.5 text-xs ${tab === k ? 'bg-white/20' : 'bg-kertas-tua text-tinta-3'}`}>{n}</span>
            </button>
          ))}
        </div>

        {daftar.length === 0 ? (
          <p className="py-16 text-center text-tinta-2">Belum ada guru atau staf pada kelompok ini.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {daftar.map((g, i) => (
              <KartuGuru key={g.id} g={g} i={i} />
            ))}
          </ul>
        )}
      </section>

      <section className="bg-primary-700 py-20 text-white lg:py-24">
        <div className={`${wadah} grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16`}>
          <div>
            <JudulBagian
              terang
              label="Pengembangan guru"
              judul="Guru yang terus bertumbuh."
              desc="Setiap guru mengikuti pelatihan Kurikulum Merdeka, pertolongan pertama (P3K), dan pendidikan inklusif minimal dua kali setahun."
              className=""
            />
            <div className="mt-10 aspect-[16/9] overflow-hidden rounded-[1.75rem]">
              <Foto foto={FOTO.kelasGuru} />
            </div>
          </div>
          <dl className="grid gap-4">
            {ANGKA_GURU.map(([n, l], i) => (
              <div
                key={l}
                className={`flex flex-col gap-2 rounded-[1.75rem] p-6 min-[400px]:flex-row min-[400px]:items-center min-[400px]:gap-6 sm:p-8 ${i === 0 ? 'bg-stabilo text-tinta' : 'bg-white/[0.08] ring-1 ring-inset ring-white/10'}`}
              >
                <dt className="sr-only">{l}</dt>
                <dd className="angka shrink-0 text-5xl font-extrabold tracking-tight min-[400px]:w-32 sm:w-40 sm:text-6xl">{n}</dd>
                <dd className={`text-lg font-semibold ${i === 0 ? '' : 'text-krem'}`}>{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  )
}
