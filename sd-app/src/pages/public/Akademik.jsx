import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Coffee, GraduationCap, Lightbulb, Puzzle, UserRound } from 'lucide-react'
import JamSekolah from '../../components/JamSekolah'
import KalenderAkademik from '../../components/KalenderAkademik'
import { Muncul } from '../../components/Hiasan'
import { Ikon, WARNA_CERIA } from '../../components/Ikon'
import { PageHeader, SectionTitle, btn } from '../../components/ui'
import { EKSKUL, ISTIRAHAT, JENJANG, MAPEL, MAPEL_RAPOR, SEKOLAH, SESI } from '../../data/dummy'

const PILAR = [
  {
    icon: GraduationCap,
    judul: 'Intrakurikuler',
    desc: 'Pembelajaran mata pelajaran di kelas dengan pendekatan berdiferensiasi sesuai kemampuan tiap anak.',
    poin: ['Asesmen diagnostik di awal semester', 'Kelompok belajar sesuai kebutuhan', 'Rapor dengan deskripsi capaian'],
  },
  {
    icon: Puzzle,
    judul: 'Projek P5',
    desc: 'Projek Penguatan Profil Pelajar Pancasila: anak belajar lewat projek nyata bersama teman.',
    poin: ['Gaya Hidup Berkelanjutan: bank sampah kelas', 'Kearifan Lokal: festival budaya', 'Kewirausahaan: market day kelas 5–6'],
  },
  {
    icon: Lightbulb,
    judul: 'Ekstrakurikuler',
    desc: 'Kegiatan setelah jam pelajaran untuk mengasah bakat, minat, dan kepemimpinan.',
    poin: [`${EKSKUL.length} pilihan kegiatan`, 'Pramuka wajib untuk kelas 3–6', 'Pentas & lomba setiap semester'],
  },
]

// Mapel yang baru diajarkan mulai kelas 3
const MULAI_KELAS_3 = ['ipas', 'info']

export default function Akademik() {
  return (
    <>
      <PageHeader
        eyebrow={SEKOLAH.kurikulum}
        title="Akademik & Kegiatan Belajar"
        subtitle="Kurikulum, mata pelajaran, jam belajar, ekstrakurikuler, dan kalender akademik SD Harapan Gemilang."
      >
        <div className="mt-7 flex flex-wrap gap-2">
          {[
            ['#kurikulum', 'Kurikulum'],
            ['#mapel', 'Mata Pelajaran'],
            ['#jam', 'Jam Belajar'],
            ['#ekskul', 'Ekstrakurikuler'],
            ['#kalender', 'Kalender'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/25 transition hover:bg-white hover:text-primary-700">
              {label}
            </a>
          ))}
        </div>
      </PageHeader>

      {/* Kurikulum */}
      <section id="kurikulum" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16 sm:px-6">
        <SectionTitle eyebrow="Kurikulum Merdeka" title="Tiga pilar pembelajaran" desc="Setiap anak belajar dengan cara yang paling cocok untuknya — di kelas, lewat projek, dan lewat kegiatan minat bakat." />
        <div className="grid gap-5 md:grid-cols-3">
          {PILAR.map(({ icon: Icon, judul, desc, poin }, i) => (
            <Muncul key={judul} jeda={i * 90}>
              <div className={`h-full rounded-3xl p-7 ring-1 ${WARNA_CERIA[i].bg} ${WARNA_CERIA[i].ring}`}>
                <span className={`grid h-14 w-14 place-items-center rounded-2xl ${WARNA_CERIA[i].ikon}`}>
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-2xl font-bold text-slate-900">{judul}</h3>
                <p className="mt-2 text-slate-600">{desc}</p>
                <ul className="mt-5 space-y-2">
                  {poin.map((p) => (
                    <li key={p} className="flex gap-2 text-sm text-slate-700">
                      <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${WARNA_CERIA[i].teks}`} /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Muncul>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {JENJANG.map((j, i) => (
            <Muncul key={j.id} jeda={i * 100} className="rounded-3xl border border-slate-200 bg-white p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'}`}>{j.kelas}</span>
                <span className="text-sm text-slate-500">{j.usia}</span>
              </div>
              <h3 className="mt-3 text-2xl font-bold text-slate-900">{j.nama}</h3>
              <p className="mt-1 text-slate-600">{j.fokus}</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {j.poin.map((p) => (
                  <li key={p} className="flex gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {p}
                  </li>
                ))}
              </ul>
            </Muncul>
          ))}
        </div>
      </section>

      {/* Mata pelajaran */}
      <section id="mapel" className="scroll-mt-28 bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle eyebrow="Mata Pelajaran" title="Yang dipelajari di kelas" desc="Seluruh mata pelajaran dinilai dengan Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) 75." />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {MAPEL_RAPOR.map((kode, i) => (
              <Muncul key={kode} jeda={(i % 5) * 50}>
                <div className="h-full rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <span className={`inline-flex rounded-lg px-2.5 py-1 text-sm font-bold ${MAPEL[kode].warna}`}>{MAPEL[kode].nama}</span>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <UserRound className="h-3.5 w-3.5" /> {MAPEL[kode].guru}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">{MULAI_KELAS_3.includes(kode) ? 'Kelas 3 – 6' : 'Kelas 1 – 6'}</p>
                </div>
              </Muncul>
            ))}
          </div>
        </div>
      </section>

      {/* Jam belajar */}
      <section id="jam" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16 sm:px-6">
        <SectionTitle eyebrow="Jam Belajar" title="Pembagian waktu harian" desc="Senin – Jumat. Satu sesi terdiri dari 2 jam pelajaran @35 menit." />
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Muncul className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
            <ol className="space-y-3">
              {SESI.map((s, i) => (
                <li key={s.mulai}>
                  <div className="flex items-center gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-600 font-display font-bold text-white">{i + 1}</span>
                    <div>
                      <p className="font-bold text-slate-900">Sesi {i + 1}</p>
                      <p className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Clock3 className="h-3.5 w-3.5" /> {s.mulai} – {s.selesai} WIB
                      </p>
                    </div>
                  </div>
                  {i + 1 === ISTIRAHAT.setelahSesi && (
                    <p className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-700">
                      <Coffee className="h-4 w-4" /> Istirahat {ISTIRAHAT.mulai} – {ISTIRAHAT.selesai}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </Muncul>
          <Muncul jeda={120} className="space-y-6">
            <JamSekolah />
            <div className="rounded-3xl bg-amber-50 p-6 ring-1 ring-amber-100">
              <h3 className="text-xl font-bold text-amber-900">Program rutin</h3>
              <ul className="mt-3 grid gap-2 text-sm text-amber-900 sm:grid-cols-2">
                {['Senin: upacara bendera', 'Setiap pagi: literasi 15 menit', 'Kamis: English Day', 'Jumat: senam pagi & Jumat bersih'].map((p) => (
                  <li key={p} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </Muncul>
        </div>
      </section>

      {/* Ekstrakurikuler */}
      <section id="ekskul" className="scroll-mt-28 bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle eyebrow="Bakat & Minat" title="Ekstrakurikuler" desc="Siswa dapat memilih hingga 2 ekskul lewat Portal Siswa. Pramuka wajib untuk kelas 3 – 6." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {EKSKUL.map((e, i) => (
              <Muncul key={e.id} jeda={(i % 3) * 80}>
                <div className="group h-full rounded-3xl bg-white p-6 ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`grid h-14 w-14 place-items-center rounded-2xl transition group-hover:rotate-[-8deg] ${e.warna}`}>
                      <Ikon nama={e.ikon} className="h-7 w-7" />
                    </span>
                    {e.wajib && <span className="rounded-full bg-primary-100 px-2.5 py-1 text-xs font-bold text-primary-700">Wajib</span>}
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-slate-900">{e.nama}</h3>
                  <p className="mt-1 text-sm text-slate-600">{e.desc}</p>
                  <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Jadwal</dt>
                      <dd className="text-right font-semibold text-slate-800">
                        {e.hari}, {e.jam}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Pembina</dt>
                      <dd className="text-right font-semibold text-slate-800">{e.pembina}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Peserta</dt>
                      <dd className="text-right font-semibold text-slate-800">{e.untuk}</dd>
                    </div>
                  </dl>
                </div>
              </Muncul>
            ))}
          </div>
        </div>
      </section>

      {/* Kalender */}
      <section id="kalender" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16 sm:px-6">
        <SectionTitle eyebrow="Tahun Ajaran 2026/2027" title="Kalender Akademik" desc="Hari libur, ujian, dan kegiatan sekolah. Tanggal libur keagamaan bertanda perkiraan." />
        <KalenderAkademik tanpaJudul />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/ppdb" className={`${btn.primary} rounded-full! px-6 py-3`}>
            Daftar PPDB <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/login" className={`${btn.secondary} rounded-full! px-6 py-3`}>
            <CalendarDays className="h-4 w-4" /> Kalender di Portal
          </Link>
        </div>
      </section>
    </>
  )
}
