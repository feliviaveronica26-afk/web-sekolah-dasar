import { useState } from 'react'
import { Muncul } from '../../components/Hiasan'
import { Foto, JudulBagian, KepalaHalaman, angkaSaring, pilSaring, wadah } from '../../components/Situs'
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
    <Muncul as="li" jeda={(i % 3) * 60} className="hover-angkat-sedikit d-flex gap-4 rounded-4 bg-white p-5 border border-garis">
      <Avatar nama={g.nama} size="lg" className="bg-merah-50 text-merah-700" />
      <div className="min-w-0">
        <h3 className="fs-lg lh-snug">{g.nama}</h3>
        <p className="mt-0-5 fs-15 fw-semibold text-merah-700">{g.jabatan}</p>
        {g.mapel && g.mapel !== '-' && <p className="mt-1 fs-15 text-tinta-2">{g.mapel}</p>}
        {peran.length > 1 && <p className="mt-1 fs-sm text-tinta-3">{peran.join(' · ')}</p>}
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

      <section className={`${wadah} py-14 py-lg-20`}>
        <div role="group" aria-label="Saring menurut kelompok" className="mb-8 d-flex flex-wrap gap-2">
          {pilihan.map(([k, label, n]) => (
            <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)} className={pilSaring(tab === k)}>
              {label} <span className={angkaSaring(tab === k)}>{n}</span>
            </button>
          ))}
        </div>

        {daftar.length === 0 ? (
          <p className="py-16 text-center text-tinta-2">Belum ada guru atau staf pada kelompok ini.</p>
        ) : (
          <ul className="d-grid gap-4 kolom-sm-2 kolom-lg-3">
            {daftar.map((g, i) => (
              <KartuGuru key={g.id} g={g} i={i} />
            ))}
          </ul>
        )}
      </section>

      <section className="bg-merah-tua py-20 py-lg-24 text-white">
        <div className={wadah}>
          <div className="row gx-0 gy-12 gx-lg-16 align-items-center">
            <div className="col-lg-6">
              <JudulBagian
                terang
                label="Pengembangan guru"
                judul="Guru yang terus bertumbuh."
                desc="Setiap guru mengikuti pelatihan Kurikulum Merdeka, pertolongan pertama (P3K), dan pendidikan inklusif minimal dua kali setahun."
                className=""
              />
              <div className="mt-10 rasio-16x9 overflow-hidden rounded-kartu">
                <Foto foto={FOTO.kelasGuru} />
              </div>
            </div>
            <div className="col-lg-6">
              <dl className="d-grid gap-4">
                {ANGKA_GURU.map(([n, l], i) => (
                  <div
                    key={l}
                    className={`angka-guru d-flex flex-column gap-2 rounded-kartu p-6 p-sm-8 ${i === 0 ? 'bg-stabilo text-tinta' : 'bg-white bg-opacity-7 border border-white border-opacity-10'}`}
                  >
                    <dt className="visually-hidden">{l}</dt>
                    <dd className="angka-guru__nilai angka flex-shrink-0 fs-5xl fs-sm-6xl fw-extrabold ls-tight">{n}</dd>
                    <dd className={`fs-lg fw-semibold ${i === 0 ? '' : 'text-krem'}`}>{l}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
