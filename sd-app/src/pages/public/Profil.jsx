import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, BadgeCheck, CheckCircle2, Trophy } from 'lucide-react'
import { IKON_FASILITAS } from '../../components/Fasilitas'
import { Muncul } from '../../components/Hiasan'
import { Foto, FotoBingkai, IndeksHalaman, Jejak, JudulBagian, Label, PitaMerah, TautanPanah, tombol, wadah } from '../../components/Situs'
import { Avatar } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { FASILITAS, KARAKTER, PPDB, PRESTASI, SEKOLAH, STATISTIK } from '../../data/dummy'
import { FOTO, FOTO_FASILITAS } from '../../data/foto'

const BAGIAN = [
  ['sejarah', 'Sejarah'],
  ['visi-misi', 'Visi & misi'],
  ['karakter', 'Nilai karakter'],
  ['keberagaman', 'Keberagaman'],
  ['struktur', 'Struktur'],
  ['prestasi', 'Prestasi'],
  ['fasilitas', 'Fasilitas'],
]

const STAT = Object.fromEntries(STATISTIK.map((s) => [s.label, s.nilai]))

const PERJALANAN = [
  { tahun: '2005', teks: 'Berdiri dengan 3 ruang kelas dan 45 siswa.' },
  { tahun: '2011', teks: 'Membangun perpustakaan dan lapangan olahraga.' },
  { tahun: '2016', teks: 'Meraih akreditasi A untuk pertama kalinya.' },
  { tahun: '2021', teks: 'Lab komputer & program robotik dibuka.' },
  { tahun: '2025', teks: 'Penghargaan Sekolah Adiwiyata tingkat kota.' },
  { tahun: '2026', teks: 'Portal digital sekolah untuk siswa & orang tua.' },
]

// Kata kunci visi yang diberi sorotan kuning
const SOROT_VISI = ['beriman', 'cerdas', 'berkarakter', 'peduli lingkungan']

const POIN_KEBERAGAMAN = [
  'Pendidikan Agama diberikan sesuai agama yang dianut setiap siswa.',
  'Ruang ibadah tersedia untuk semua agama.',
  'Hari besar setiap agama diperingati dengan saling menghormati.',
]

const URUTAN_TINGKAT = ['Internasional', 'Nasional', 'Provinsi', 'Kota', 'Kecamatan']

function sorot(teks, kata) {
  return teks.split(new RegExp(`(${kata.join('|')})`, 'gi')).map((bagian, i) =>
    i % 2 ? (
      <mark key={i} className="rounded-lg bg-stabilo px-1.5 text-tinta [box-decoration-break:clone]">
        {bagian}
      </mark>
    ) : (
      <Fragment key={i}>{bagian}</Fragment>
    ),
  )
}

const namaKepsek = (data) => data.guru.find((g) => g.jabatan === 'Kepala Sekolah')?.nama ?? SEKOLAH.kepalaSekolah

// Kartu identitas sekolah yang menumpuk di tepi bawah latar merah
function KartuIdentitas() {
  const { data } = useData()
  const [huruf, ket] = SEKOLAH.akreditasi.match(/^(\S+)\s*\((.+)\)$/)?.slice(1) ?? [SEKOLAH.akreditasi, '']
  const fakta = [
    ['NPSN', SEKOLAH.npsn],
    ['Status', SEKOLAH.status],
    ['Berdiri', SEKOLAH.tahunBerdiri],
    ['Kurikulum', SEKOLAH.kurikulum],
    ['Kepala sekolah', namaKepsek(data)],
    ['Alamat', SEKOLAH.alamat],
  ]
  return (
    <div className="grid gap-8 rounded-[2rem] bg-white p-6 shadow-[0_30px_60px_-30px_rgb(68_6_11/0.45)] ring-1 ring-garis sm:p-8 lg:grid-cols-[17rem_1fr] lg:gap-10">
      <div className="flex items-center gap-4 lg:flex-col lg:items-start">
        <img src="/logo.png" alt={`Logo ${SEKOLAH.nama}`} className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-tinta-3">Identitas sekolah</p>
          <p className="mt-1 text-2xl font-extrabold leading-tight tracking-tight">{SEKOLAH.nama}</p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-3 py-1.5 text-sm font-bold text-white">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" /> Akreditasi {huruf}
            {ket && ` · ${ket}`}
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {fakta.map(([k, v]) => (
          <div key={k} className={`rounded-2xl bg-kertas p-4 ${k === 'Alamat' || k === 'Kepala sekolah' ? 'col-span-2 sm:col-span-1' : ''}`}>
            <dt className="text-sm text-tinta-3">{k}</dt>
            <dd className="mt-1 font-bold leading-snug">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Pembuka() {
  return (
    <>
      <PitaMerah className="pb-36 pt-8 sm:pt-10 lg:pb-40 lg:pt-12">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Jejak
              daftar={[
                ['/', 'Beranda'],
                [null, 'Profil sekolah'],
              ]}
            />
            <h1 className="mt-6 text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.5rem]">
              Rumah kedua tempat anak tumbuh <span className="text-stabilo">gemilang.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-krem sm:text-xl">
              Sejak {SEKOLAH.tahunBerdiri}, {SEKOLAH.nama} mendampingi anak-anak belajar dengan gembira, tumbuh berkarakter, dan menghargai setiap
              perbedaan.
            </p>
            <p className="mt-7 inline-flex rounded-full bg-primary-900/70 px-4 py-2 text-sm font-bold text-stabilo ring-1 ring-inset ring-white/10">
              {SEKOLAH.slogan}
            </p>
          </div>
          <FotoBingkai foto={FOTO.sahabat} prioritas className="ml-4 lg:ml-0" />
        </div>
        <IndeksHalaman daftar={BAGIAN} />
      </PitaMerah>
      <div className={`${wadah} relative z-10 -mt-24`}>
        <KartuIdentitas />
      </div>
    </>
  )
}

function Sejarah() {
  const dulu = [
    ['Siswa', '45', STAT['Siswa Aktif']],
    ['Rombongan belajar', '3', STAT['Rombongan Belajar']],
  ]
  return (
    <section id="sejarah" className="scroll-mt-24 py-20 lg:py-28">
      <div className={`${wadah} grid items-center gap-14 lg:grid-cols-2 lg:gap-20`}>
        <Muncul>
          <Label>Sejak {SEKOLAH.tahunBerdiri}</Label>
          <h2 className="mt-5 text-[2.15rem] leading-[1.08] sm:text-5xl">Berawal dari tiga ruang kelas.</h2>
          <p className="mt-6 text-lg leading-relaxed text-tinta-2 sm:text-xl sm:leading-relaxed">{SEKOLAH.sejarah}</p>
          <dl className="mt-9 grid gap-4 sm:grid-cols-2">
            {dulu.map(([label, a, b]) => (
              <div key={label} className="rounded-[1.5rem] bg-kartu p-5 ring-1 ring-garis">
                <dt className="text-sm font-semibold text-tinta-3">{label}</dt>
                <dd className="mt-2 flex items-center gap-3">
                  <span className="angka text-2xl font-bold text-tinta-3">{a}</span>
                  <ArrowRight className="h-5 w-5 text-primary-600" aria-hidden="true" />
                  <span className="sr-only">menjadi</span>
                  <span className="angka text-4xl font-extrabold tracking-tight text-primary-700">{b}</span>
                </dd>
                <dd className="angka mt-1 text-xs text-tinta-3">
                  {SEKOLAH.tahunBerdiri} → {new Date().getFullYear()}
                </dd>
              </div>
            ))}
          </dl>
        </Muncul>
        <Muncul jeda={120} className="grid grid-cols-5 grid-rows-5 gap-4 sm:h-[32rem]">
          <figure className="col-span-3 row-span-5 overflow-hidden rounded-[2rem]">
            <Foto foto={FOTO.gedung} />
          </figure>
          <figure className="col-span-2 row-span-3 overflow-hidden rounded-[2rem]">
            <Foto foto={FOTO.upacara} />
          </figure>
          <div className="col-span-2 row-span-2 flex flex-col justify-end rounded-[2rem] bg-primary-600 p-5 text-white">
            <span className="angka text-4xl font-extrabold tracking-tight">{STAT['Tahun Berpengalaman']}</span>
            <span className="text-sm font-semibold">tahun mendidik</span>
          </div>
        </Muncul>
      </div>

      {/* Linimasa perjalanan sekolah */}
      <div className={`${wadah} mt-20`}>
        <h3 className="text-2xl sm:text-3xl">Langkah demi langkah</h3>
        <ol className="relative mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <span aria-hidden="true" className="absolute inset-x-6 top-6 hidden h-0.5 bg-primary-100 lg:block" />
          {PERJALANAN.map((p, i) => (
            <Muncul as="li" key={p.tahun} jeda={i * 70} className="relative">
              <span className="angka relative z-10 inline-grid h-12 place-items-center rounded-full bg-primary-600 px-5 text-lg font-extrabold text-white ring-4 ring-kertas">
                {p.tahun}
              </span>
              <p className="mt-4 leading-relaxed text-tinta-2">{p.teks}</p>
            </Muncul>
          ))}
        </ol>
      </div>
    </section>
  )
}

function VisiMisi() {
  return (
    <section id="visi-misi" className="scroll-mt-24 bg-kertas-tua/70 py-20 lg:py-28">
      <div className={wadah}>
        <Muncul>
          <Label>Visi kami</Label>
          <p className="mt-6 max-w-5xl text-3xl font-extrabold leading-[1.3] tracking-tight sm:text-5xl sm:leading-[1.2]">{sorot(SEKOLAH.visi, SOROT_VISI)}</p>
        </Muncul>

        <div className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl sm:text-4xl">Misi: {SEKOLAH.misi.length} langkah menuju visi.</h2>
            <p className="max-w-md text-tinta-2">Cara kami mewujudkannya setiap hari, bersama orang tua dan masyarakat.</p>
          </div>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SEKOLAH.misi.map((m, i) => (
              <Muncul as="li" key={m} jeda={(i % 3) * 70} className="flex flex-col gap-6 rounded-[1.75rem] bg-white p-7 ring-1 ring-garis">
                <span className="angka grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-xl font-extrabold text-primary-700">{i + 1}</span>
                <span className="text-lg font-semibold leading-snug">{m}</span>
              </Muncul>
            ))}
            <Muncul as="li" jeda={140} className="min-h-56 overflow-hidden rounded-[1.75rem]" aria-hidden="true">
              <Foto foto={FOTO.jelajah} alt="" />
            </Muncul>
          </ol>
        </div>
      </div>
    </section>
  )
}

// Nilai GEMILANG sebagai akrostik
function NilaiKarakter() {
  return (
    <section id="karakter" className="scroll-mt-24 bg-primary-700 py-20 text-white lg:py-28">
      <div className={wadah}>
        <JudulBagian
          terang
          label="Budaya sekolah"
          judul="Delapan huruf, satu semangat."
          desc="Nilai karakter GEMILANG kami hidupkan di kelas, di lapangan, dan di rumah."
        />
        <ol aria-label="Nilai karakter GEMILANG" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KARAKTER.map((k, i) => (
            <Muncul as="li" key={i} jeda={(i % 4) * 60} className="rounded-[1.75rem] bg-white/[0.08] p-6 ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.12]">
              <span aria-hidden="true" className="grid h-16 w-16 place-items-center rounded-2xl bg-stabilo text-4xl font-extrabold text-tinta">
                {k.huruf}
              </span>
              <span className="mt-6 block text-xl font-bold">{k.nama}</span>
              <span className="mt-1.5 block leading-relaxed text-krem">{k.desc}</span>
            </Muncul>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Keberagaman() {
  return (
    <section id="keberagaman" className="scroll-mt-24 py-20 lg:py-28">
      <div className={`${wadah} grid items-center gap-14 lg:grid-cols-2 lg:gap-20`}>
        <Muncul>
          <Label>Keberagaman</Label>
          <h2 className="mt-5 text-[2.15rem] leading-[1.08] sm:text-5xl">Satu sekolah, beragam keyakinan.</h2>
          <p className="mt-6 text-lg leading-relaxed text-tinta-2">
            Sebagai sekolah swasta umum, {SEKOLAH.nama} terbuka bagi siswa dari semua agama. Perbedaan tidak untuk dibandingkan, tetapi untuk
            dipelajari dan dihormati bersama sejak dini.
          </p>
          <ul className="mt-8 space-y-3">
            {POIN_KEBERAGAMAN.map((p) => (
              <li key={p} className="flex gap-3 rounded-2xl bg-kartu p-4 leading-relaxed ring-1 ring-garis">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </Muncul>
        <Muncul jeda={120} className="rounded-[2rem] bg-tinta p-8 text-white sm:p-12">
          <p className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Bhinneka Tunggal Ika</p>
          <p className="mt-2 text-lg text-white/70">Berbeda-beda tetapi tetap satu.</p>
          <p className="mt-10 text-sm font-bold uppercase tracking-[0.16em] text-stabilo">Pendidikan Agama untuk</p>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {PPDB.agama.map((a) => (
              <li key={a} className="rounded-full bg-white/10 px-5 py-2.5 text-lg font-semibold ring-1 ring-inset ring-white/15">
                {a}
              </li>
            ))}
          </ul>
        </Muncul>
      </div>
    </section>
  )
}

// `tingkat`: 'utama' (kepala sekolah), 'tengah' (wakasek, di bawah garis bagan), atau baris biasa
function KartuOrang({ g, tingkat }) {
  const tegak = tingkat === 'utama' || tingkat === 'tengah'
  return (
    <div
      className={`flex items-center gap-4 rounded-[1.5rem] bg-white p-4 ring-1 ring-garis ${tegak ? 'flex-col gap-3 px-6 py-6 text-center' : ''} ${
        tingkat === 'utama' ? 'ring-2 ring-primary-200' : ''
      }`}
    >
      <Avatar
        nama={g.nama}
        size={tingkat === 'utama' ? 'xl' : tingkat === 'tengah' ? 'lg' : 'md'}
        className={`${tingkat === 'utama' ? 'h-24 w-24 bg-primary-600 text-3xl text-white' : 'bg-primary-50 text-primary-700'}`}
      />
      <div>
        <p className={`font-bold leading-snug ${tingkat === 'utama' ? 'text-xl' : 'text-[17px]'}`}>{g.nama}</p>
        <p className="text-[15px] text-tinta-3">{g.jabatan}</p>
      </div>
    </div>
  )
}

function Struktur() {
  const { data } = useData()
  const kepsek = data.guru.find((g) => g.jabatan === 'Kepala Sekolah')
  const wakasek = data.guru.filter((g) => g.peran?.some((p) => p.startsWith('wakasek')))
  const pendukung = data.guru.filter((g) => g.peran?.some((p) => ['tata_usaha', 'guru_bk', 'pustakawan'].includes(p)))

  return (
    <section id="struktur" className="scroll-mt-24 bg-kertas-tua/70 py-20 lg:py-28">
      <div className={wadah}>
        <JudulBagian
          label="Organisasi"
          judul="Orang-orang di balik sekolah."
          desc="Tim pimpinan dan pendukung yang membuat setiap hari di sekolah berjalan hangat dan tertib."
          aksi={<TautanPanah to="/guru">Seluruh guru & staf</TautanPanah>}
        />
        {kepsek && (
          <Muncul className="flex flex-col items-center">
            <KartuOrang g={kepsek} tingkat="utama" />
            <span aria-hidden="true" className="hidden h-10 w-0.5 bg-primary-200 sm:block" />
          </Muncul>
        )}
        {wakasek.length > 0 && (
          <div className="relative mt-10 grid gap-10 sm:mt-0 sm:pt-8" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(12rem, 1fr))` }}>
            {/* Garis bagan dari tengah kolom pertama ke tengah kolom terakhir (jarak antarkolom 2,5rem ikut dihitung) */}
            <span
              aria-hidden="true"
              className="absolute top-0 hidden h-0.5 bg-primary-200 sm:block"
              style={{ left: `calc((100% - ${(wakasek.length - 1) * 2.5}rem) / ${2 * wakasek.length})`, right: `calc((100% - ${(wakasek.length - 1) * 2.5}rem) / ${2 * wakasek.length})` }}
            />
            {wakasek.map((g, i) => (
              <Muncul key={g.id} jeda={i * 80} className="relative flex justify-center">
                <span aria-hidden="true" className="absolute -top-8 left-1/2 hidden h-8 w-0.5 bg-primary-200 sm:block" />
                <KartuOrang g={g} tingkat="tengah" />
              </Muncul>
            ))}
          </div>
        )}
        {pendukung.length > 0 && (
          <div className="mt-16">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-tinta-3">Tim pendukung</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pendukung.map((g) => (
                <KartuOrang key={g.id} g={g} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function Prestasi() {
  const [utama, ...lain] = PRESTASI
  const tahun = PRESTASI.map((p) => p.tahun)
  const perTingkat = URUTAN_TINGKAT.map((t) => [t, PRESTASI.filter((p) => p.tingkat === t).length]).filter(([, n]) => n)

  return (
    <section id="prestasi" className="scroll-mt-24 py-20 lg:py-28">
      <div className={wadah}>
        <JudulBagian
          label="Prestasi"
          judul="Jejak prestasi siswa & sekolah."
          desc="Setiap piala adalah cerita tentang kerja keras, keberanian mencoba, dan dukungan orang tua."
        />
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <Muncul className="relative isolate mb-4 overflow-hidden rounded-[2rem] bg-stabilo p-8 sm:p-10">
              <Trophy aria-hidden="true" strokeWidth={1.25} className="absolute -bottom-8 -right-6 -z-10 h-56 w-56 text-tinta/10" />
              <span className="inline-flex rounded-full bg-tinta px-3.5 py-1.5 text-sm font-bold text-stabilo">
                Terbaru · <span className="angka mx-1">{utama.tahun}</span> · Tingkat {utama.tingkat}
              </span>
              <p className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{utama.judul}</p>
              <p className="mt-2 text-lg font-medium">{utama.oleh}</p>
            </Muncul>
            <ol className="grid gap-3">
              {lain.map((p) => (
                <li key={p.judul} className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-[1.5rem] bg-kartu p-4 ring-1 ring-garis sm:grid-cols-[auto_1.4fr_1fr] sm:p-5">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-700">
                    <Trophy className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-lg font-bold leading-snug">{p.judul}</span>
                    <span className="angka text-[15px] text-tinta-3">
                      {p.tahun} · {p.bidang} · Tingkat {p.tingkat}
                    </span>
                  </span>
                  <span className="col-start-2 text-[15px] text-tinta-2 sm:col-start-auto">{p.oleh}</span>
                </li>
              ))}
            </ol>
          </div>
          <aside className="h-fit rounded-[2rem] bg-primary-700 p-7 text-white lg:sticky lg:top-28">
            <p className="angka text-7xl font-extrabold tracking-tight">{PRESTASI.length}</p>
            <p className="mt-1 font-semibold text-krem">prestasi dalam {Math.max(...tahun) - Math.min(...tahun) + 1} tahun terakhir</p>
            <dl className="mt-6 space-y-2">
              {perTingkat.map(([t, n]) => (
                <div key={t} className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                  <dt>Tingkat {t}</dt>
                  <dd className="angka text-xl font-extrabold">{n}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </div>
    </section>
  )
}

function Fasilitas() {
  return (
    <section id="fasilitas" className="scroll-mt-24 bg-kertas-tua/70 py-20 lg:py-28">
      <div className={wadah}>
        <JudulBagian
          label="Sarana"
          judul="Fasilitas sekolah."
          desc="Lingkungan belajar yang aman, nyaman, dan mendukung tumbuh kembang anak."
          aksi={<TautanPanah to="/fasilitas">Denah & tur virtual</TautanPanah>}
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FASILITAS.map((f, i) => (
            <Muncul as="li" key={f.id} jeda={(i % 4) * 60}>
              <Link to={`/fasilitas/${f.id}`} className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-garis transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgb(68_6_11/0.5)]">
                <span className="block aspect-[4/3] overflow-hidden">
                  <Foto foto={FOTO_FASILITAS[f.id]} alt="" ikon={IKON_FASILITAS[f.ikon]} nada="merah" className="transition duration-700 group-hover:scale-105" />
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="flex items-center justify-between gap-2 text-lg font-bold">
                    {f.nama}
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-tinta-3 transition group-hover:text-primary-700" aria-hidden="true" />
                  </span>
                  <span className="mt-1 text-[15px] leading-relaxed text-tinta-2">{f.ringkas}</span>
                </span>
              </Link>
            </Muncul>
          ))}
        </ul>

        <Muncul className="mt-10 flex flex-col gap-6 rounded-[2rem] bg-primary-700 px-6 py-10 text-white sm:px-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-3xl leading-tight">Lebih seru dilihat langsung.</h3>
            <p className="mt-2 text-krem">Ajak ananda berkeliling sekolah dan berkenalan dengan para guru.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/fasilitas#kunjungan" className={tombol.terang}>
              Jadwalkan kunjungan
            </Link>
            <Link to="/ppdb" className={tombol.garisTerang}>
              Daftar PPDB
            </Link>
          </div>
        </Muncul>
      </div>
    </section>
  )
}

export default function Profil() {
  return (
    <>
      <Pembuka />
      <Sejarah />
      <VisiMisi />
      <NilaiKarakter />
      <Keberagaman />
      <Struktur />
      <Prestasi />
      <Fasilitas />
    </>
  )
}
