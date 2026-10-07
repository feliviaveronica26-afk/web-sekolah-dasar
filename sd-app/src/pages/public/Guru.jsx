import { useState } from 'react'
import { BookOpen, Quote, Users } from 'lucide-react'
import { Muncul } from '../../components/Hiasan'
import { Avatar, EmptyState, PageHeader, SectionTitle, Tabs } from '../../components/ui'
import { PERAN } from '../../context/akses'
import { useData } from '../../context/DataContext'

// Kelompok ditampilkan berurutan; tiap orang masuk ke kelompok pertama yang cocok
const KELOMPOK = [
  { kode: 'pimpinan', label: 'Pimpinan', cocok: (g) => g.jabatan === 'Kepala Sekolah' || g.peran?.some((p) => p.startsWith('wakasek')) },
  { kode: 'wali', label: 'Wali Kelas', cocok: (g) => g.peran?.includes('wali_kelas') },
  { kode: 'guru', label: 'Guru Mapel & BK', cocok: (g) => g.peran?.some((p) => ['guru_mapel', 'guru_bk'].includes(p)) },
  { kode: 'tendik', label: 'Tenaga Kependidikan', cocok: () => true },
]

const kelompokDari = (g) => KELOMPOK.find((k) => k.cocok(g)).kode

const WARNA_KARTU = ['from-primary-500 to-primary-700', 'from-amber-400 to-orange-500', 'from-sky-400 to-indigo-500', 'from-emerald-400 to-teal-600']

function KartuGuru({ g, i }) {
  const jabatan = (g.peran ?? []).map((p) => (p === 'wali_kelas' ? `Wali Kelas ${g.kelas}` : PERAN[p]?.label)).filter(Boolean)
  return (
    <Muncul jeda={(i % 4) * 70}>
      <div className="group h-full overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
        <div className={`relative h-24 bg-linear-to-br ${WARNA_KARTU[i % WARNA_KARTU.length]}`}>
          <div className="pola-titik absolute inset-0" />
        </div>
        <div className="relative -mt-12 px-5 pb-6 text-center">
          <Avatar nama={g.nama} size="xl" className="mx-auto bg-white text-primary-700 ring-4 ring-white transition group-hover:scale-105" />
          <h3 className="mt-3 text-lg font-bold leading-snug text-slate-900">{g.nama}</h3>
          <p className="text-sm font-semibold text-primary-600">{g.jabatan}</p>
          {g.mapel && g.mapel !== '-' && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <BookOpen className="h-3.5 w-3.5" /> {g.mapel}
            </p>
          )}
          {jabatan.length > 1 && <p className="mt-2 text-xs text-slate-500">{jabatan.join(' · ')}</p>}
        </div>
      </div>
    </Muncul>
  )
}

export default function Guru() {
  const { data } = useData()
  const [tab, setTab] = useState('semua')

  const daftar = data.guru.filter((g) => tab === 'semua' || kelompokDari(g) === tab)
  const jumlah = (kode) => data.guru.filter((g) => kelompokDari(g) === kode).length

  return (
    <>
      <PageHeader eyebrow="Tim Kami" title="Guru & Tenaga Kependidikan" subtitle="Pendidik yang sabar, hangat, dan terus belajar demi tumbuh kembang setiap anak." />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex justify-center">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[['semua', 'Semua', data.guru.length], ...KELOMPOK.map((k) => [k.kode, k.label, jumlah(k.kode)])]}
          />
        </div>

        {daftar.length === 0 ? (
          <EmptyState icon={Users} title="Belum ada data" desc="Belum ada guru atau staf pada kelompok ini." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {daftar.map((g, i) => (
              <KartuGuru key={g.id} g={g} i={i} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Quote className="mx-auto h-10 w-10 text-primary-300" />
          <SectionTitle
            title="Guru yang terus bertumbuh"
            desc="Setiap guru mengikuti pelatihan Kurikulum Merdeka, pertolongan pertama (P3K), dan pendidikan inklusif minimal dua kali setahun. Sebanyak 90% guru berkualifikasi S1 kependidikan dan 6 guru telah tersertifikasi pendidik."
          />
          <div className="grid grid-cols-3 gap-4">
            {[
              ['90%', 'Guru S1 kependidikan'],
              ['6', 'Guru bersertifikat pendidik'],
              ['1 : 14', 'Rasio guru dan siswa'],
            ].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <p className="font-display text-3xl font-bold text-primary-600">{n}</p>
                <p className="mt-1 text-sm text-slate-600">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
