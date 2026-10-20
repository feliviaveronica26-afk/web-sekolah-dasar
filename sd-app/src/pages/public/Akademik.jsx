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
      <section id="kurikulum" className={`${wadah} gulir-mt-24 py-20 py-lg-28`}>
        <JudulBagian label={SEKOLAH.kurikulum} judul="Tiga pilar pembelajaran." desc="Di kelas, lewat projek, dan lewat kegiatan minat bakat." />
        <ol className="d-grid gap-4 kolom-md-3">
          {PILAR.map((p, i) => (
            <Muncul as="li" key={p.judul} jeda={i * 90} className="kartu-zoom d-flex flex-column overflow-hidden rounded-kartu bg-white border border-garis">
              <div className="position-relative rasio-16x10 overflow-hidden">
                <Foto foto={p.foto} alt="" />
                <span className="angka position-absolute top-4 start-4 d-flex align-items-center justify-content-center ukuran-11 rounded-circle bg-white fs-lg fw-extrabold text-merah-700 shadow">
                  {i + 1}
                </span>
              </div>
              <div className="p-6 p-sm-7">
                <h3 className="fs-2xl">{p.judul}</h3>
                <p className="mt-2 lh-relaxed text-tinta-2">{p.desc}</p>
                <ul className="mt-5 d-flex flex-column gap-2-5">
                  {p.poin.map((x) => (
                    <li key={x} className="d-flex gap-2-5 fs-15 lh-snug">
                      <CheckCircle2 className="mt-0-5 ukuran-4-5 flex-shrink-0 text-primary" aria-hidden="true" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </Muncul>
          ))}
        </ol>

        {/* Perbandingan jenjang */}
        <div className="mt-16 overflow-x-auto rounded-kartu bg-white border border-garis">
          <table className="caption-top w-100 text-start tabel-jenjang">
            <caption className="px-6 px-sm-8 pt-6 pb-0 text-start fs-2xl fw-extrabold ls-tight text-tinta">Fokus per jenjang</caption>
            <thead>
              <tr className="border-bottom border-garis">
                <th scope="col" className="w-36 px-6 px-sm-8 py-4 fs-sm fw-semibold text-tinta-3" />
                {JENJANG.map((j) => (
                  <th key={j.id} scope="col" className="py-4 pe-8 align-bottom">
                    <span className="d-block fs-2xl fw-extrabold ls-tight">{j.nama}</span>
                    <span className="mt-1-5 d-inline-block rounded-pill bg-merah-50 px-3 py-1 fs-sm fw-semibold text-merah-700">
                      {j.kelas} · {j.usia}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-bottom border-garis align-top">
                <th scope="row" className="px-6 px-sm-8 py-5 fs-sm fw-semibold text-tinta-3">
                  Fokus
                </th>
                {JENJANG.map((j) => (
                  <td key={j.id} className="py-5 pe-8 fs-lg fw-bold lh-snug">
                    {j.fokus}
                  </td>
                ))}
              </tr>
              <tr className="align-top">
                <th scope="row" className="px-6 px-sm-8 py-5 fs-sm fw-semibold text-tinta-3">
                  Kegiatan
                </th>
                {JENJANG.map((j) => (
                  <td key={j.id} className="py-5 pe-8">
                    <ul className="d-flex flex-column gap-2-5">
                      {j.poin.map((x) => (
                        <li key={x} className="d-flex gap-2-5 lh-snug">
                          <CheckCircle2 className="mt-0-5 ukuran-4-5 flex-shrink-0 text-primary" aria-hidden="true" />
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
      <section id="mapel" className="gulir-mt-24 latar-kertas-lembut py-20 py-lg-28">
        <div className={wadah}>
          <div className="row gx-0 gy-12 gx-lg-16">
            <div className="col-lg-5">
              <JudulBagian label="Mata pelajaran" judul="Yang dipelajari di kelas." className="" />
              <p className="mt-5 fs-lg lh-relaxed text-tinta-2">
                Seluruh mata pelajaran dinilai dengan Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) <b className="angka fw-bold text-tinta">{KKTP}</b>.
                Pendidikan Agama diberikan sesuai agama yang dianut setiap siswa.
              </p>
              <div className="mt-8 d-none d-lg-block rasio-4x3 overflow-hidden rounded-kartu">
                <Foto foto={FOTO.literasi} />
              </div>
            </div>
            <div className="col-lg-7">
              <div className="overflow-hidden rounded-kartu bg-white border border-garis">
                <table className="w-100 text-start">
                  <thead>
                    <tr className="bg-primary fs-sm text-white">
                      <th scope="col" className="px-5 px-sm-6 py-3-5 fw-bold">
                        Mata pelajaran
                      </th>
                      <th scope="col" className="py-3-5 pe-4 fw-bold">
                        Pengajar
                      </th>
                      <th scope="col" className="px-5 px-sm-6 py-3-5 text-end fw-bold">
                        Kelas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="pembatas-y">
                    {MAPEL_RAPOR.map((kode) => (
                      <tr key={kode} className="transisi hover-latar">
                        <th scope="row" className="px-5 px-sm-6 py-3-5 fw-semibold">
                          <span className="d-flex align-items-center gap-3">
                            <span aria-hidden="true" className={`d-flex align-items-center justify-content-center ukuran-9 flex-shrink-0 rounded-2 fs-sm fw-extrabold ${MAPEL[kode].warna}`}>
                              {MAPEL[kode].nama[0]}
                            </span>
                            {MAPEL[kode].nama}
                          </span>
                        </th>
                        <td className="py-3-5 pe-4 fs-15 text-tinta-2">{pengajar(kode)}</td>
                        <td className="angka text-nowrap px-5 px-sm-6 py-3-5 text-end fs-15 fw-semibold text-tinta-2">
                          {MULAI_KELAS_3.includes(kode) ? '3 – 6' : '1 – 6'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jam belajar */}
      <section id="jam" className={`${wadah} gulir-mt-24 py-20 py-lg-28`}>
        <JudulBagian label="Jam belajar" judul="Pembagian waktu harian." desc="Senin sampai Jumat. Satu sesi terdiri dari 2 jam pelajaran @35 menit." />
        <div className="row g-6">
          <div className="col-lg-7">
            <ol className="d-flex flex-column gap-3">
              {JADWAL_HARIAN.map((b) => (
                <li key={b.label} className={`baris-jam rounded-4 p-4 px-sm-5 ${b.istirahat ? 'bg-stabilo' : 'bg-white border border-garis'}`}>
                  <span
                    className={`baris-jam__ikon d-flex align-items-center justify-content-center ukuran-11 rounded-2 ${b.istirahat ? 'bg-tinta text-stabilo' : 'bg-merah-50 text-merah-700'}`}
                  >
                    {b.istirahat ? <Coffee className="ukuran-5" aria-hidden="true" /> : <Clock3 className="ukuran-5" aria-hidden="true" />}
                  </span>
                  <span>
                    <span className="d-block fs-lg fw-bold">{b.label}</span>
                    <span className={`fs-15 ${b.istirahat ? 'text-tinta-2' : 'text-tinta-3'}`}>{b.ket}</span>
                  </span>
                  <span className="angka fs-xl fs-sm-2xl fw-extrabold ls-tight">{b.jam}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="col-lg-5 d-flex flex-column gap-6">
            <div className="rounded-kartu bg-merah-tua p-6 p-sm-7 text-white">
              <h3 className="fs-2xl">Jam sekolah</h3>
              <dl className="mt-5 d-grid kolom-2 gap-3">
                {JAM_SEKOLAH.filter((j) => !j.guru).map((j) => (
                  <div key={j.label} className="rounded-3 bg-white bg-opacity-10 p-4">
                    <dt className="fs-sm text-krem">{j.label}</dt>
                    <dd className="angka mt-1 fs-2xl fw-extrabold">{j.jam}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-kartu bg-white p-6 p-sm-7 border border-garis">
              <h3 className="fs-2xl">Program rutin</h3>
              <dl className="mt-4 pembatas-y">
                {PROGRAM_RUTIN.map(([hari, isi]) => (
                  <div key={hari} className="baris-program d-grid gap-4 py-3-5">
                    <dt className="text-tinta-3">{hari}</dt>
                    <dd className="fw-bold">{isi}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Ekstrakurikuler */}
      <section id="ekskul" className="gulir-mt-24 bg-merah-tua py-20 py-lg-28 text-white">
        <div className={wadah}>
          <JudulBagian
            terang
            label="Bakat & minat"
            judul="Ekstrakurikuler."
            desc="Siswa bebas memilih ekskul lewat Portal Siswa selama jadwalnya tidak bentrok. Pramuka wajib untuk kelas 3 – 6."
          />
          <ul className="d-grid gap-4 kolom-md-2 kolom-lg-3">
            {EKSKUL.map((e, i) => {
              const Icon = IKON[e.ikon]
              return (
                <Muncul as="li" key={e.id} jeda={(i % 3) * 70} className="d-flex flex-column overflow-hidden rounded-kartu bg-white bg-opacity-7 border border-white border-opacity-10">
                  <div className="position-relative rasio-16x9 overflow-hidden">
                    <Foto foto={FOTO_EKSKUL[e.id]} alt="" ikon={Icon} nada={i % 2 ? 'tua' : 'stabilo'} />
                    {e.wajib && <span className="position-absolute top-4 start-4 rounded-pill bg-stabilo px-3 py-1 fs-xs fw-extrabold text-tinta">Wajib</span>}
                  </div>
                  <div className="d-flex flex-1 flex-column p-6">
                    <h3 className="fs-2xl">{e.nama}</h3>
                    <p className="mt-2 lh-relaxed text-krem">{e.desc}</p>
                    <dl className="info-ekskul mt-5 d-grid column-gap-3 row-gap-1-5 border-top border-white border-opacity-15 pt-4 fs-15">
                      <dt className="text-krem">Jadwal</dt>
                      <dd className="angka fw-semibold">
                        {e.hari}, {e.jam}
                      </dd>
                      <dt className="text-krem">Pembina</dt>
                      <dd className="fw-semibold">{e.pembina}</dd>
                      <dt className="text-krem">Peserta</dt>
                      <dd className="fw-semibold">{e.untuk}</dd>
                    </dl>
                  </div>
                </Muncul>
              )
            })}
          </ul>
        </div>
      </section>

      {/* Kalender */}
      <section id="kalender" className={`${wadah} gulir-mt-24 py-20 py-lg-28`}>
        <JudulBagian
          label="Tahun ajaran 2026/2027"
          judul="Kalender akademik."
          desc="Hari libur, ujian, dan kegiatan sekolah. Tanggal libur keagamaan bertanda perkiraan."
          aksi={
            <p className="d-inline-flex align-items-center gap-2 rounded-pill bg-white px-4 py-2 fs-sm fw-semibold text-tinta-2 border border-garis">
              <CalendarDays className="ukuran-4 text-primary" aria-hidden="true" /> Geser bulan dengan tombol panah
            </p>
          }
        />
        <div className={selarasKertas}>
          <KalenderAkademik tanpaJudul />
        </div>
        <div className="mt-12 d-flex flex-wrap gap-3">
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
