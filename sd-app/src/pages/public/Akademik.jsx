import { Link } from 'react-router-dom'
import { CalendarDays, CheckCircle2, Clock3, Coffee } from 'lucide-react'
import KalenderAkademik from '../../components/KalenderAkademik'
import { Muncul } from '../../components/Hiasan'
import { IKON } from '../../components/Ikon'
import { Foto, IndeksHalaman, JudulBagian, KepalaHalaman, selarasKertas, tombol, wadah } from '../../components/Situs'
import { useData } from '../../context/DataContext'
import { EKSKUL, ISTIRAHAT, JAM_SEKOLAH, JENJANG, KKTP, MAPEL, MAPEL_RAPOR, SEKOLAH, SESI } from '../../data/dummy'
import { FOTO, FOTO_EKSKUL } from '../../data/foto'
import { mapelDiampu } from '../../utils/jadwal'

const PILAR = [
  {
    judul: 'Intrakurikuler',
    foto: FOTO.ruangKelas,
    desc: 'Pembelajaran mata pelajaran di kelas dengan pendekatan berdiferensiasi sesuai kemampuan tiap anak.',
    poin: ['Asesmen diagnostik di awal semester', 'Kelompok belajar sesuai kebutuhan', 'Rapor dengan deskripsi capaian'],
  },
  {
    judul: 'Projek P5',
    foto: FOTO.kebun,
    desc: 'Projek Penguatan Profil Pelajar Pancasila: anak belajar lewat projek nyata bersama teman.',
    poin: ['Gaya Hidup Berkelanjutan: bank sampah kelas', 'Kearifan Lokal: festival budaya', 'Kewirausahaan: market day kelas 5–6'],
  },
  {
    judul: 'Ekstrakurikuler',
    foto: FOTO.pramuka,
    desc: 'Kegiatan setelah jam pelajaran untuk mengasah bakat, minat, dan kepemimpinan.',
    poin: [`${EKSKUL.length} pilihan kegiatan`, 'Pramuka wajib untuk kelas 3–6', 'Pentas & lomba setiap semester'],
  },
]

const PROGRAM_RUTIN = [
  ['Senin', 'Upacara bendera'],
  ['Setiap pagi', 'Literasi 15 menit'],
  ['Kamis', 'English Day'],
  ['Jumat', 'Senam pagi & Jumat bersih'],
]

// Mapel yang baru diajarkan mulai kelas 3
const MULAI_KELAS_3 = ['ipas', 'info']

// Urutan baris jadwal harian: sesi belajar + istirahat di antaranya
const JADWAL_HARIAN = SESI.flatMap((s, i) => [
  { label: `Sesi ${i + 1}`, jam: `${s.mulai} – ${s.selesai}`, ket: '2 jam pelajaran' },
  ...(i + 1 === ISTIRAHAT.setelahSesi ? [{ label: 'Istirahat', jam: `${ISTIRAHAT.mulai} – ${ISTIRAHAT.selesai}`, ket: 'Makan bekal & bermain', istirahat: true }] : []),
])

export default function Akademik() {
  const { data } = useData()
  // Pengajar mapel: guru mapel yang mengampunya (data guru dari server), selain itu wali kelas
  const pengajar = (kode) => data.guru.find((g) => mapelDiampu(g).includes(kode))?.nama ?? 'Wali kelas'

  return (
    <>
      <KepalaHalaman
        jejak="Akademik"
        judul="Belajar dengan cara yang paling cocok untuk setiap anak."
        desc={`Kurikulum, mata pelajaran, jam belajar, ekstrakurikuler, dan kalender akademik ${SEKOLAH.nama}.`}
        catatan={SEKOLAH.kurikulum}
        foto={FOTO.kelasGuru}
      >
        <IndeksHalaman
          daftar={[
            ['kurikulum', 'Kurikulum'],
            ['mapel', 'Mata pelajaran'],
            ['jam', 'Jam belajar'],
            ['ekskul', 'Ekstrakurikuler'],
            ['kalender', 'Kalender'],
          ]}
        />
      </KepalaHalaman>

      {/* Kurikulum */}
      <section id="kurikulum" className={`${wadah} scroll-mt-24 py-20 lg:py-28`}>
        <JudulBagian label={SEKOLAH.kurikulum} judul="Tiga pilar pembelajaran." desc="Di kelas, lewat projek, dan lewat kegiatan minat bakat." />
        <ol className="grid gap-4 md:grid-cols-3">
          {PILAR.map((p, i) => (
            <Muncul as="li" key={p.judul} jeda={i * 90} className="group flex flex-col overflow-hidden rounded-[1.75rem] bg-kartu ring-1 ring-garis">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Foto foto={p.foto} alt="" className="transition duration-700 group-hover:scale-105" />
                <span className="angka absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-lg font-extrabold text-primary-700 shadow">
                  {i + 1}
                </span>
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="text-2xl">{p.judul}</h3>
                <p className="mt-2 leading-relaxed text-tinta-2">{p.desc}</p>
                <ul className="mt-5 space-y-2.5">
                  {p.poin.map((x) => (
                    <li key={x} className="flex gap-2.5 text-[15px] leading-snug">
                      <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary-600" aria-hidden="true" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </Muncul>
          ))}
        </ol>

        {/* Perbandingan jenjang */}
        <div className="mt-16 overflow-x-auto rounded-[1.75rem] bg-kartu ring-1 ring-garis">
          <table className="w-full min-w-[40rem] text-left">
            <caption className="px-6 pt-6 text-left text-2xl font-extrabold tracking-tight sm:px-8">Fokus per jenjang</caption>
            <thead>
              <tr className="border-b border-garis">
                <th scope="col" className="w-36 px-6 py-4 text-sm font-semibold text-tinta-3 sm:px-8" />
                {JENJANG.map((j) => (
                  <th key={j.id} scope="col" className="py-4 pr-8 align-bottom">
                    <span className="block text-2xl font-extrabold tracking-tight">{j.nama}</span>
                    <span className="mt-1.5 inline-block rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700">
                      {j.kelas} · {j.usia}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-garis align-top">
                <th scope="row" className="px-6 py-5 text-sm font-semibold text-tinta-3 sm:px-8">
                  Fokus
                </th>
                {JENJANG.map((j) => (
                  <td key={j.id} className="py-5 pr-8 text-lg font-bold leading-snug">
                    {j.fokus}
                  </td>
                ))}
              </tr>
              <tr className="align-top">
                <th scope="row" className="px-6 py-5 text-sm font-semibold text-tinta-3 sm:px-8">
                  Kegiatan
                </th>
                {JENJANG.map((j) => (
                  <td key={j.id} className="py-5 pr-8">
                    <ul className="space-y-2.5">
                      {j.poin.map((x) => (
                        <li key={x} className="flex gap-2.5 leading-snug">
                          <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary-600" aria-hidden="true" />
                          {x}
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Mata pelajaran */}
      <section id="mapel" className="scroll-mt-24 bg-kertas-tua/70 py-20 lg:py-28">
        <div className={`${wadah} grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16`}>
          <div>
            <JudulBagian label="Mata pelajaran" judul="Yang dipelajari di kelas." className="" />
            <p className="mt-5 text-lg leading-relaxed text-tinta-2">
              Seluruh mata pelajaran dinilai dengan Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) <b className="angka font-bold text-tinta">{KKTP}</b>.
              Pendidikan Agama diberikan sesuai agama yang dianut setiap siswa.
            </p>
            <div className="mt-8 hidden aspect-[4/3] overflow-hidden rounded-[1.75rem] lg:block">
              <Foto foto={FOTO.literasi} />
            </div>
          </div>
          <div className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-garis">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-primary-600 text-sm text-white">
                  <th scope="col" className="px-5 py-3.5 font-bold sm:px-6">
                    Mata pelajaran
                  </th>
                  <th scope="col" className="py-3.5 pr-4 font-bold">
                    Pengajar
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right font-bold sm:px-6">
                    Kelas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {MAPEL_RAPOR.map((kode) => (
                  <tr key={kode} className="transition hover:bg-kertas">
                    <th scope="row" className="px-5 py-3.5 font-semibold sm:px-6">
                      <span className="flex items-center gap-3">
                        <span aria-hidden="true" className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${MAPEL[kode].warna}`}>
                          {MAPEL[kode].nama[0]}
                        </span>
                        {MAPEL[kode].nama}
                      </span>
                    </th>
                    <td className="py-3.5 pr-4 text-[15px] text-tinta-2">{pengajar(kode)}</td>
                    <td className="angka whitespace-nowrap px-5 py-3.5 text-right text-[15px] font-semibold text-tinta-2 sm:px-6">
                      {MULAI_KELAS_3.includes(kode) ? '3 – 6' : '1 – 6'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Jam belajar */}
      <section id="jam" className={`${wadah} scroll-mt-24 py-20 lg:py-28`}>
        <JudulBagian label="Jam belajar" judul="Pembagian waktu harian." desc="Senin sampai Jumat. Satu sesi terdiri dari 2 jam pelajaran @35 menit." />
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <ol className="space-y-3">
            {JADWAL_HARIAN.map((b) => (
              <li
                key={b.label}
                className={`grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 rounded-[1.25rem] p-4 sm:grid-cols-[auto_1fr_auto] sm:px-5 ${
                  b.istirahat ? 'bg-stabilo' : 'bg-kartu ring-1 ring-garis'
                }`}
              >
                <span
                  className={`row-span-2 grid h-11 w-11 place-items-center rounded-xl sm:row-span-1 ${b.istirahat ? 'bg-tinta text-stabilo' : 'bg-primary-50 text-primary-700'}`}
                >
                  {b.istirahat ? <Coffee className="h-5 w-5" aria-hidden="true" /> : <Clock3 className="h-5 w-5" aria-hidden="true" />}
                </span>
                <span>
                  <span className="block text-lg font-bold">{b.label}</span>
                  <span className={`text-[15px] ${b.istirahat ? 'text-tinta-2' : 'text-tinta-3'}`}>{b.ket}</span>
                </span>
                <span className="angka text-xl font-extrabold tracking-tight sm:text-2xl">{b.jam}</span>
              </li>
            ))}
          </ol>
          <div className="space-y-6">
            <div className="rounded-[1.75rem] bg-primary-700 p-6 text-white sm:p-7">
              <h3 className="text-2xl">Jam sekolah</h3>
              <dl className="mt-5 grid grid-cols-2 gap-3">
                {JAM_SEKOLAH.filter((j) => !j.guru).map((j) => (
                  <div key={j.label} className="rounded-2xl bg-white/10 p-4">
                    <dt className="text-sm text-krem">{j.label}</dt>
                    <dd className="angka mt-1 text-2xl font-extrabold">{j.jam}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-[1.75rem] bg-kartu p-6 ring-1 ring-garis sm:p-7">
              <h3 className="text-2xl">Program rutin</h3>
              <dl className="mt-4 divide-y divide-garis">
                {PROGRAM_RUTIN.map(([hari, isi]) => (
                  <div key={hari} className="grid grid-cols-[7.5rem_1fr] gap-4 py-3.5">
                    <dt className="text-tinta-3">{hari}</dt>
                    <dd className="font-bold">{isi}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Ekstrakurikuler */}
      <section id="ekskul" className="scroll-mt-24 bg-primary-700 py-20 text-white lg:py-28">
        <div className={wadah}>
          <JudulBagian
            terang
            label="Bakat & minat"
            judul="Ekstrakurikuler."
            desc="Siswa bebas memilih ekskul lewat Portal Siswa selama jadwalnya tidak bentrok. Pramuka wajib untuk kelas 3 – 6."
          />
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {EKSKUL.map((e, i) => {
              const Icon = IKON[e.ikon]
              return (
                <Muncul as="li" key={e.id} jeda={(i % 3) * 70} className="flex flex-col overflow-hidden rounded-[1.75rem] bg-white/[0.08] ring-1 ring-inset ring-white/10">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Foto foto={FOTO_EKSKUL[e.id]} alt="" ikon={Icon} nada={i % 2 ? 'tua' : 'stabilo'} />
                    {e.wajib && <span className="absolute left-4 top-4 rounded-full bg-stabilo px-3 py-1 text-xs font-extrabold text-tinta">Wajib</span>}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-2xl">{e.nama}</h3>
                    <p className="mt-2 leading-relaxed text-krem">{e.desc}</p>
                    <dl className="mt-5 grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1.5 border-t border-white/15 pt-4 text-[15px]">
                      <dt className="text-krem">Jadwal</dt>
                      <dd className="angka font-semibold">
                        {e.hari}, {e.jam}
                      </dd>
                      <dt className="text-krem">Pembina</dt>
                      <dd className="font-semibold">{e.pembina}</dd>
                      <dt className="text-krem">Peserta</dt>
                      <dd className="font-semibold">{e.untuk}</dd>
                    </dl>
                  </div>
                </Muncul>
              )
            })}
          </ul>
        </div>
      </section>

      {/* Kalender */}
      <section id="kalender" className={`${wadah} scroll-mt-24 py-20 lg:py-28`}>
        <JudulBagian
          label="Tahun ajaran 2026/2027"
          judul="Kalender akademik."
          desc="Hari libur, ujian, dan kegiatan sekolah. Tanggal libur keagamaan bertanda perkiraan."
          aksi={
            <p className="inline-flex items-center gap-2 rounded-full bg-kartu px-4 py-2 text-sm font-semibold text-tinta-2 ring-1 ring-garis">
              <CalendarDays className="h-4 w-4 text-primary-600" aria-hidden="true" /> Geser bulan dengan tombol panah
            </p>
          }
        />
        <div className={selarasKertas}>
          <KalenderAkademik tanpaJudul />
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link to="/ppdb" className={tombol.utama}>
            Daftar PPDB
          </Link>
          <Link to="/login" className={tombol.kedua}>
            Lihat kalender di portal
          </Link>
        </div>
      </section>
    </>
  )
}
