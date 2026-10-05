import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Target } from 'lucide-react'
import { IKON_FASILITAS } from '../../components/Fasilitas'
import { Card, PageHeader, SectionTitle, btn } from '../../components/ui'
import { FASILITAS, SEKOLAH } from '../../data/dummy'

const IDENTITAS = [
  ['Nama Sekolah', SEKOLAH.nama],
  ['NPSN', SEKOLAH.npsn],
  ['Status', SEKOLAH.status],
  ['Akreditasi', SEKOLAH.akreditasi],
  ['Tahun Berdiri', SEKOLAH.tahunBerdiri],
  ['Kurikulum', SEKOLAH.kurikulum],
  ['Kepala Sekolah', SEKOLAH.kepalaSekolah],
  ['Alamat', SEKOLAH.alamat],
]

export default function Profil() {
  return (
    <>
      <PageHeader title="Profil Sekolah" subtitle="Mengenal lebih dekat sejarah, visi, misi, dan fasilitas SD Harapan Gemilang." />

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionTitle eyebrow="Tentang Kami" title="Sejarah Singkat" center={false} />
          <p className="-mt-4 leading-relaxed text-slate-700">{SEKOLAH.sejarah}</p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <Card className="border-primary-100 bg-primary-50/50 p-6 sm:col-span-2">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-600 text-white">
                  <Target className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">Visi</h3>
              </div>
              <p className="mt-3 text-lg font-semibold italic text-primary-800">“{SEKOLAH.visi}”</p>
            </Card>
            <Card className="p-6 sm:col-span-2">
              <h3 className="text-lg font-bold text-slate-900">Misi</h3>
              <ul className="mt-3 space-y-2.5">
                {SEKOLAH.misi.map((m) => (
                  <li key={m} className="flex gap-3 text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" /> {m}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        <Card className="h-fit overflow-hidden">
          <div className="bg-primary-600 px-6 py-4 font-bold text-white">Identitas Sekolah</div>
          <dl className="divide-y divide-slate-100">
            {IDENTITAS.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[120px_1fr] gap-3 px-6 py-3 text-sm">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-semibold text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle eyebrow="Sarana" title="Fasilitas Sekolah" desc="Lingkungan belajar yang aman, nyaman, dan mendukung tumbuh kembang anak." />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {FASILITAS.map((f) => {
              const Icon = IKON_FASILITAS[f.ikon]
              return (
                <Link
                  key={f.id}
                  to={`/fasilitas/${f.id}`}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-md"
                >
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-800">{f.nama}</p>
                  <p className="mt-1 text-xs font-semibold text-primary-600 opacity-0 transition group-hover:opacity-100">Kunjungi →</p>
                </Link>
              )
            })}
          </div>
          <div className="mt-8 text-center">
            <Link to="/fasilitas" className={btn.primary}>
              Lihat Denah & Jadwalkan Kunjungan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
