import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  CheckCircle2,
  HandHeart,
  HeartHandshake,
  Lightbulb,
  MapPin,
  Medal,
  Palette,
  Quote,
  Sparkles,
  Trophy,
  UsersRound,
} from 'lucide-react'
import { IKON_FASILITAS } from '../../components/Fasilitas'
import { AngkaNaik, Bintang, Coretan, Gelombang, Gumpalan, Muncul } from '../../components/Hiasan'
import { WARNA_CERIA } from '../../components/Ikon'
import { Avatar, SectionTitle } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { FASILITAS, KARAKTER, PPDB, PRESTASI, SEKOLAH, STATISTIK } from '../../data/dummy'

const BAGIAN = [
  ['sejarah', 'Sejarah'],
  ['visi-misi', 'Visi & Misi'],
  ['karakter', 'Nilai Karakter'],
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

const WARNA_HURUF = [
  'bg-primary-600 text-white',
  'bg-amber-400 text-amber-950',
  'bg-sky-500 text-white',
  'bg-emerald-500 text-white',
  'bg-violet-500 text-white',
  'bg-orange-500 text-white',
  'bg-rose-500 text-white',
  'bg-teal-500 text-white',
]
const MIRING = ['-rotate-3', 'rotate-2', '-rotate-2', 'rotate-3', '-rotate-1', 'rotate-2', '-rotate-3', 'rotate-1']

const IKON_MISI = [HandHeart, Lightbulb, Palette, BookOpen, HeartHandshake]
const SOROT_VISI = ['beriman', 'cerdas', 'berkarakter', 'peduli lingkungan']
const WARNA_SOROT = ['bg-amber-300 text-amber-950', 'bg-white text-primary-700', 'bg-sky-200 text-sky-950', 'bg-emerald-200 text-emerald-950']

const POIN_KEBERAGAMAN = [
  'Pendidikan Agama diberikan sesuai agama yang dianut setiap siswa.',
  'Ruang ibadah tersedia untuk semua agama.',
  'Hari besar setiap agama diperingati dengan saling menghormati.',
]
const WARNA_AGAMA = ['bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-orange-500', 'bg-amber-400', 'bg-primary-500']

const URUTAN_TINGKAT = ['Internasional', 'Nasional', 'Provinsi', 'Kota', 'Kecamatan']

// Bungkus kata-kata penting dalam teks dengan stabilo berwarna
function sorot(teks, kata) {
  return teks.split(new RegExp(`(${kata.join('|')})`, 'gi')).map((bagian, i) =>
    i % 2 ? (
      <mark key={i} className={`rounded-lg px-1.5 [box-decoration-break:clone] ${WARNA_SOROT[((i - 1) / 2) % WARNA_SOROT.length]}`}>
        {bagian}
      </mark>
    ) : (
      bagian
    ),
  )
}

const namaKepsek = (data) => data.guru.find((g) => g.jabatan === 'Kepala Sekolah')?.nama ?? SEKOLAH.kepalaSekolah

// Logo dalam lencana bulat dengan teks melingkar yang berputar pelan
function Lencana() {
  const teks = `${SEKOLAH.nama.toUpperCase()} ✦ SEJAK ${SEKOLAH.tahunBerdiri} ✦ BERKARAKTER ✦ BERPRESTASI ✦ `
  const stiker = [
    { ikon: BadgeCheck, judul: `Akreditasi ${SEKOLAH.akreditasi.split(' ')[0]}`, ket: 'Unggul', warna: 'bg-emerald-100 text-emerald-600', posisi: '-left-1 top-[8%] -rotate-6 sm:-left-6' },
    { ikon: UsersRound, judul: `${STAT['Siswa Aktif']} siswa`, ket: `${STAT['Rombongan Belajar']} rombel`, warna: 'bg-amber-100 text-amber-600', posisi: '-right-8 top-[44%] rotate-3 max-sm:hidden' },
    { ikon: Sparkles, judul: `${STAT['Tahun Berpengalaman']} tahun`, ket: 'berkarya', warna: 'bg-sky-100 text-sky-600', posisi: 'bottom-[4%] left-[6%] -rotate-3' },
  ]
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[19rem] sm:max-w-sm lg:max-w-md">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-putar-lambat" aria-hidden="true">
        <defs>
          <path id="lingkar-lencana" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
        </defs>
        <text className="fill-white/85 font-display text-[10.5px] font-semibold">
          <textPath href="#lingkar-lencana" textLength="512" lengthAdjust="spacing">
            {teks}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[15%] grid place-items-center rounded-full bg-white shadow-2xl shadow-primary-950/30 ring-8 ring-white/20">
        <img src="/logo.png" alt={`Logo ${SEKOLAH.nama}`} className="h-[62%] w-[62%] object-contain" />
      </div>
      {stiker.map(({ ikon: Ikon, judul, ket, warna, posisi }, i) => (
        <div key={judul} className={`absolute ${posisi}`}>
          <div className="flex animate-melayang items-center gap-2.5 rounded-2xl bg-white py-2 pl-2 pr-4 text-slate-800 shadow-xl" style={{ animationDelay: `${i * -2}s` }}>
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${warna}`}>
              <Ikon className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-display font-bold">{judul}</span>
              <span className="block text-xs text-slate-500">{ket}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-primary-600 via-primary-600 to-primary-800 text-white">
      <div className="pola-titik absolute inset-0" />
      <Gumpalan className="absolute -left-40 -top-40 h-[26rem] w-[26rem] text-white/5" />
      <Gumpalan className="absolute -bottom-56 right-1/4 h-[30rem] w-[30rem] rotate-90 text-primary-900/30" />
      <Bintang className="absolute left-[46%] top-12 hidden h-5 w-5 animate-melayang text-amber-300 lg:block" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-28 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:pb-36">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider ring-1 ring-white/25">
            <Bintang className="h-3.5 w-3.5 text-amber-300" /> Profil Sekolah
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl lg:leading-[1.05]">
            Rumah kedua tempat anak tumbuh{' '}
            <span className="relative inline-block text-amber-300">
              gemilang
              <Coretan className="absolute -bottom-2 left-0 h-3 w-full text-amber-300/80" />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary-50">
            Sejak {SEKOLAH.tahunBerdiri}, {SEKOLAH.nama} mendampingi anak-anak belajar dengan gembira, tumbuh berkarakter, dan menghargai setiap perbedaan.
          </p>
          <nav aria-label="Bagian halaman profil" className="mt-8 flex flex-wrap gap-2">
            {BAGIAN.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold ring-1 ring-white/25 transition hover:bg-white hover:text-primary-700">
                {label}
              </a>
            ))}
          </nav>
        </div>
        <Lencana />
      </div>
      <Gelombang warna="text-white" />
    </section>
  )
}

function KartuIdentitas() {
  const { data } = useData()
  const [huruf, ket] = SEKOLAH.akreditasi.match(/^(\S+)\s*\((.+)\)$/)?.slice(1) ?? [SEKOLAH.akreditasi, '']
  const fakta = [
    ['NPSN', SEKOLAH.npsn],
    ['Status', SEKOLAH.status],
    ['Berdiri', SEKOLAH.tahunBerdiri],
    ['Kurikulum', SEKOLAH.kurikulum],
  ]
  return (
    <Muncul jeda={120} className="lg:sticky lg:top-28">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-primary-900/10 ring-1 ring-slate-200 transition duration-500 lg:rotate-1 lg:hover:rotate-0">
        <div className="relative bg-primary-600 px-6 py-5 text-white">
          <div className="pola-titik absolute inset-0" />
          <div className="relative flex items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white p-1.5 shadow-md">
              <img src="/logo.png" alt="" className="h-full w-full object-contain" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-100">Kartu Identitas</p>
              <p className="font-display text-xl font-bold leading-tight">{SEKOLAH.nama}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 px-6 pt-6">
          <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-4">
            {fakta.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{k}</dt>
                <dd className="mt-0.5 font-semibold text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>
          {/* Stempel akreditasi */}
          <div className="grid h-24 w-24 shrink-0 -rotate-12 place-items-center rounded-full border-4 border-double border-emerald-500 text-center text-emerald-600">
            <div className="leading-none">
              <p className="text-[9px] font-bold uppercase tracking-widest">Akreditasi</p>
              <p className="my-0.5 font-display text-4xl font-bold">{huruf}</p>
              {ket && <p className="text-[9px] font-bold uppercase tracking-widest">{ket}</p>}
            </div>
          </div>
        </div>
        <div className="mx-6 mt-5 border-t border-dashed border-slate-200" />
        <div className="space-y-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <Avatar nama={namaKepsek(data)} size="sm" className="bg-primary-100 text-primary-700" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Kepala Sekolah</p>
              <p className="truncate font-semibold text-slate-800">{namaKepsek(data)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Alamat</p>
              <p className="text-sm font-semibold text-slate-800">{SEKOLAH.alamat}</p>
            </div>
          </div>
        </div>
      </div>
    </Muncul>
  )
}

// Jalur berkelok untuk linimasa mendatar: melewati titik tengah setiap kolom, naik-turun bergantian
const TITIK_Y = (i) => (i % 2 ? 34 : 10)
function jalurPerjalanan(n) {
  let [px, py] = [0, 22]
  let d = `M${px},${py}`
  for (let i = 0; i < n; i++) {
    const [x, y] = [((2 * i + 1) / (2 * n)) * 1200, TITIK_Y(i)]
    const k = (x - px) / 2
    d += ` C${px + k},${py} ${x - k},${y} ${x},${y}`
    ;[px, py] = [x, y]
  }
  return `${d} C${px + (1200 - px) / 2},${py} ${px + (1200 - px) / 2},22 1200,22`
}

function KartuTahun({ p, w }) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ${w.bg} ${w.ring}`}>
      <p className={`font-display text-3xl font-bold ${w.teks}`}>{p.tahun}</p>
      <p className="mt-1 text-sm leading-snug text-slate-700">{p.teks}</p>
    </div>
  )
}

function Perjalanan() {
  return (
    <div className="mt-20">
      <SectionTitle eyebrow="Linimasa" title="Langkah demi langkah" />
      {/* Layar lebar: jalur mendatar yang berkelok */}
      <ol className="relative hidden lg:grid" style={{ gridTemplateColumns: `repeat(${PERJALANAN.length}, minmax(0, 1fr))` }}>
        <svg className="absolute inset-x-0 top-40 h-11 w-full text-primary-300" viewBox="0 0 1200 44" preserveAspectRatio="none" aria-hidden="true">
          <path d={jalurPerjalanan(PERJALANAN.length)} fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="1 9" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {PERJALANAN.map((p, i) => {
          const w = WARNA_CERIA[i % WARNA_CERIA.length]
          const atas = i % 2 === 0
          return (
            <Muncul as="li" key={p.tahun} jeda={i * 90} className="relative px-2 text-center">
              <div className="flex h-40 flex-col justify-end">
                {atas && (
                  <>
                    <KartuTahun p={p} w={w} />
                    <span className="mx-auto h-3 w-0.5 bg-slate-200" />
                  </>
                )}
              </div>
              <div className="relative h-11">
                <span className={`absolute left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-white ${w.ikon}`} style={{ top: TITIK_Y(i) }} />
              </div>
              <div className="flex h-40 flex-col">
                {!atas && (
                  <>
                    <span className="mx-auto h-3 w-0.5 bg-slate-200" />
                    <KartuTahun p={p} w={w} />
                  </>
                )}
              </div>
            </Muncul>
          )
        })}
      </ol>
      {/* Layar kecil: jalur menurun */}
      <ol className="relative ml-2 space-y-4 border-l-2 border-dashed border-primary-200 pl-7 lg:hidden">
        {PERJALANAN.map((p, i) => {
          const w = WARNA_CERIA[i % WARNA_CERIA.length]
          return (
            <Muncul as="li" key={p.tahun} jeda={(i % 2) * 70} className="relative">
              <span className={`absolute -left-[2.35rem] top-5 h-4 w-4 rounded-full ring-4 ring-white ${w.ikon}`} />
              <div className={`flex items-baseline gap-4 rounded-2xl p-4 ring-1 ${w.bg} ${w.ring}`}>
                <p className={`font-display text-2xl font-bold ${w.teks}`}>{p.tahun}</p>
                <p className="text-sm text-slate-700">{p.teks}</p>
              </div>
            </Muncul>
          )
        })}
      </ol>
    </div>
  )
}

function Sejarah() {
  const angka = [
    [STAT['Siswa Aktif'], 'siswa aktif', 'berawal dari 45 siswa'],
    [STAT['Rombongan Belajar'], 'rombel', 'berawal dari 3 kelas'],
    [STAT['Tahun Berpengalaman'], 'tahun', 'mendampingi anak bangsa'],
  ]
  return (
    <section id="sejarah" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16 sm:px-6 lg:py-20">
      <div className="grid items-start gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <Muncul>
          <SectionTitle eyebrow={`Sejak ${SEKOLAH.tahunBerdiri}`} title="Berawal dari tiga ruang kelas" center={false} rapat />
          <p className="mt-6 text-lg leading-relaxed text-slate-700">
            {SEKOLAH.sejarah}
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
            {angka.map(([nilai, label, ket], i) => (
              <div key={label} className={`rounded-3xl p-4 sm:p-5 ${WARNA_CERIA[i].bg}`}>
                <p className={`font-display text-3xl font-bold sm:text-4xl ${WARNA_CERIA[i].teks}`}>
                  <AngkaNaik nilai={nilai} />
                </p>
                <p className="font-semibold text-slate-800">{label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{ket}</p>
              </div>
            ))}
          </div>
        </Muncul>
        <KartuIdentitas />
      </div>
      <Perjalanan />
    </section>
  )
}

function VisiMisi() {
  return (
    <section id="visi-misi" className="relative scroll-mt-28 bg-slate-50 py-24">
      <Gelombang warna="text-white" atas />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Muncul className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-primary-600 to-primary-800 px-6 py-14 text-center text-white shadow-xl shadow-primary-900/20 sm:px-14 sm:py-20">
          <div className="pola-titik absolute inset-0" />
          <Quote className="absolute left-5 top-5 h-16 w-16 text-white/10 sm:left-10 sm:top-8 sm:h-24 sm:w-24" />
          <Bintang className="absolute bottom-8 right-10 h-6 w-6 animate-goyang text-amber-300" />
          <Bintang className="absolute right-[18%] top-8 h-3.5 w-3.5 text-white/50" />
          <p className="relative text-xs font-bold uppercase tracking-[0.3em] text-primary-100">Visi kami</p>
          <p className="relative mx-auto mt-6 max-w-4xl font-display text-2xl font-semibold leading-relaxed sm:text-4xl sm:leading-relaxed">{sorot(SEKOLAH.visi, SOROT_VISI)}</p>
        </Muncul>

        <div className="mt-20">
          <SectionTitle eyebrow="Misi" title={`${SEKOLAH.misi.length} langkah menuju visi`} desc="Cara kami mewujudkan visi itu setiap hari, bersama orang tua dan masyarakat." />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {SEKOLAH.misi.map((m, i) => {
              const Ikon = IKON_MISI[i] ?? Sparkles
              const w = WARNA_CERIA[i % WARNA_CERIA.length]
              const lebar = i < 3 ? 'lg:col-span-2' : 'lg:col-span-3'
              const ganjilAkhir = i === SEKOLAH.misi.length - 1 && SEKOLAH.misi.length % 2 ? 'sm:col-span-2' : ''
              return (
                <Muncul as="li" key={m} jeda={(i % 3) * 80} className={`group relative overflow-hidden rounded-[1.75rem] bg-white p-6 ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7 ${lebar} ${ganjilAkhir}`}>
                  <span className="pointer-events-none absolute right-3 -top-4 font-display text-[6.5rem] font-bold leading-none text-transparent [-webkit-text-stroke:2px_#e2e8f0]" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className={`relative grid h-12 w-12 place-items-center rounded-2xl transition duration-300 group-hover:-rotate-6 group-hover:scale-110 ${w.ikon}`}>
                    <Ikon className="h-6 w-6" />
                  </span>
                  <p className="relative mt-5 text-lg font-semibold leading-snug text-slate-800">
                    <span className="sr-only">Misi {i + 1}: </span>
                    {m}
                  </p>
                </Muncul>
              )
            })}
          </ol>
        </div>
      </div>
      <Gelombang warna="text-white" />
    </section>
  )
}

// Huruf GEMILANG yang bisa dipilih satu per satu
function NilaiKarakter() {
  const [aktif, setAktif] = useState(0)
  const k = KARAKTER[aktif]
  return (
    <section id="karakter" className="relative scroll-mt-28 overflow-hidden py-20">
      <Gumpalan className="absolute -left-32 top-10 h-80 w-80 text-amber-100/70" />
      <Gumpalan className="absolute -right-24 bottom-0 h-72 w-72 rotate-45 text-primary-50" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <SectionTitle eyebrow="Budaya Sekolah" title="Delapan huruf, satu semangat" desc="Nilai karakter GEMILANG kami hidupkan di kelas, di lapangan, dan di rumah. Pilih setiap huruf untuk mengenalnya." />
        <div role="group" aria-label="Nilai karakter GEMILANG" className="mx-auto grid max-w-3xl grid-cols-8 gap-1.5 sm:gap-3">
          {KARAKTER.map((x, i) => {
            const pilih = i === aktif
            return (
              <button
                key={i}
                type="button"
                aria-pressed={pilih}
                aria-label={`${x.huruf}: ${x.nama}`}
                onClick={() => setAktif(i)}
                onMouseEnter={() => setAktif(i)}
                className="group flex flex-col items-center gap-2 rounded-2xl focus:outline-none"
              >
                <span
                  className={`grid aspect-square w-full place-items-center rounded-xl font-display text-2xl font-bold shadow-md transition duration-300 group-focus-visible:ring-4 group-focus-visible:ring-primary-300 sm:rounded-2xl sm:text-5xl ${WARNA_HURUF[i]} ${
                    pilih ? '-translate-y-2 scale-105 shadow-xl ring-4 ring-white sm:scale-110' : `${MIRING[i]} opacity-85 group-hover:-translate-y-1 group-hover:opacity-100`
                  }`}
                >
                  {x.huruf}
                </span>
                <span className={`hidden text-xs font-semibold transition sm:block ${pilih ? 'text-slate-900' : 'text-slate-400'}`}>{x.nama}</span>
              </button>
            )
          })}
        </div>
        <div aria-live="polite" className="mx-auto mt-10 max-w-2xl">
          <div key={aktif} className="tampil-lembut flex flex-col items-center gap-5 rounded-[2rem] bg-white p-6 text-center shadow-lg shadow-slate-200/70 ring-1 ring-slate-200 sm:flex-row sm:p-8 sm:text-left">
            <span className={`grid h-20 w-20 shrink-0 place-items-center rounded-3xl font-display text-5xl font-bold ${WARNA_HURUF[aktif]}`}>{k.huruf}</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Nilai ke-{aktif + 1} dari {KARAKTER.length}
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{k.nama}</h3>
              <p className="mt-1.5 text-slate-600">{k.desc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Keberagaman() {
  const agama = PPDB.agama
  return (
    <section id="keberagaman" className="relative scroll-mt-28 bg-amber-50/70 py-24">
      <Gelombang warna="text-white" atas />
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
        <Muncul>
          <SectionTitle eyebrow="Keberagaman" title="Satu sekolah, beragam keyakinan" center={false} rapat />
          <p className="mt-5 text-lg leading-relaxed text-slate-700">
            Sebagai sekolah swasta umum, {SEKOLAH.nama} terbuka bagi siswa dari semua agama. Perbedaan tidak untuk dibandingkan, tetapi untuk dipelajari dan dihormati bersama sejak dini.
          </p>
          <ul className="mt-7 space-y-3">
            {POIN_KEBERAGAMAN.map((p) => (
              <li key={p} className="flex gap-3 rounded-2xl bg-white p-4 text-slate-700 ring-1 ring-amber-100">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                {p}
              </li>
            ))}
          </ul>
        </Muncul>

        {/* Agama-agama yang mengelilingi semboyan bangsa */}
        <Muncul jeda={120} className="relative mx-auto aspect-square w-full max-w-md">
          <div className="absolute inset-[12%] rounded-full border-2 border-dashed border-amber-300" />
          <div className="absolute inset-[31%] grid place-items-center rounded-full bg-white text-center shadow-xl shadow-amber-200/60 ring-8 ring-amber-100">
            <div className="px-2">
              <HeartHandshake className="mx-auto h-8 w-8 text-primary-600 sm:h-10 sm:w-10" />
              <p className="mt-1 font-display text-sm font-bold leading-tight text-slate-900 sm:text-lg">
                Bhinneka
                <br />
                Tunggal Ika
              </p>
            </div>
          </div>
          {agama.map((a, i) => {
            const sudut = ((-90 + (360 / agama.length) * i) * Math.PI) / 180
            return (
              <span key={a} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${50 + 38 * Math.cos(sudut)}%`, top: `${50 + 38 * Math.sin(sudut)}%` }}>
                <span className="flex animate-melayang items-center gap-2 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-md ring-1 ring-slate-200 sm:px-4 sm:py-2 sm:text-base" style={{ animationDelay: `${i * -1}s` }}>
                  <span className={`h-2.5 w-2.5 rounded-full ${WARNA_AGAMA[i % WARNA_AGAMA.length]}`} />
                  {a}
                </span>
              </span>
            )
          })}
        </Muncul>
      </div>
      <Gelombang warna="text-white" />
    </section>
  )
}

function Struktur() {
  const { data } = useData()
  const kepsek = data.guru.find((g) => g.jabatan === 'Kepala Sekolah')
  const wakasek = data.guru.filter((g) => g.peran?.some((p) => p.startsWith('wakasek')))
  const pendukung = data.guru.filter((g) => g.peran?.some((p) => ['tata_usaha', 'guru_bk', 'pustakawan'].includes(p)))
  // Garis cabang dari kepala sekolah ke tengah setiap kolom wakasek
  const cabang = wakasek.map((_, i) => `M450,0 C450,34 ${((2 * i + 1) / (2 * wakasek.length)) * 900},26 ${((2 * i + 1) / (2 * wakasek.length)) * 900},60`).join(' ')

  return (
    <section id="struktur" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-20 sm:px-6">
      <SectionTitle eyebrow="Organisasi" title="Orang-orang di balik sekolah" desc="Tim pimpinan dan pendukung yang membuat setiap hari di sekolah berjalan hangat dan tertib." />
      {kepsek && (
        <Muncul className="mx-auto flex max-w-sm flex-col items-center text-center">
          <div className="relative">
            <span className="absolute -inset-3 rounded-full bg-linear-to-br from-primary-200 to-amber-200 opacity-70 blur-lg" />
            <Avatar nama={kepsek.nama} size="xl" className="relative h-28 w-28 bg-primary-600 text-3xl text-white ring-8 ring-white" />
            <Bintang className="absolute -right-2 -top-1 h-7 w-7 animate-goyang text-amber-400" />
          </div>
          <p className="mt-5 font-display text-xl font-bold text-slate-900">{kepsek.nama}</p>
          <p className="text-sm font-semibold text-primary-600">{kepsek.jabatan}</p>
        </Muncul>
      )}
      <svg viewBox="0 0 900 60" preserveAspectRatio="none" className="mx-auto mt-5 hidden h-14 w-full max-w-4xl text-primary-200 sm:block" aria-hidden="true">
        <path d={cabang} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:mt-0 sm:grid-cols-3">
        {wakasek.map((g, i) => {
          const w = WARNA_CERIA[(i + 2) % WARNA_CERIA.length]
          return (
            <Muncul key={g.id} jeda={i * 80} className="relative overflow-hidden rounded-[1.75rem] bg-white px-4 pb-6 pt-8 text-center ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <span className={`absolute inset-x-0 top-0 h-14 ${w.bg}`} />
              <Avatar nama={g.nama} size="lg" className="relative mx-auto ring-4 ring-white" />
              <p className="mt-3 font-bold text-slate-900">{g.nama}</p>
              <p className={`text-sm font-medium ${w.teks}`}>{g.jabatan}</p>
            </Muncul>
          )
        })}
      </div>
      {pendukung.length > 0 && (
        <div className="mx-auto mt-12 max-w-4xl">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            <span className="h-px flex-1 bg-slate-200" /> Tim pendukung <span className="h-px flex-1 bg-slate-200" />
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {pendukung.map((g) => (
              <div key={g.id} className="flex items-center gap-3 rounded-full bg-slate-50 py-1.5 pl-1.5 pr-5 ring-1 ring-slate-200">
                <Avatar nama={g.nama} size="sm" />
                <div className="text-left leading-tight">
                  <p className="text-sm font-bold text-slate-900">{g.nama}</p>
                  <p className="text-xs text-slate-500">{g.jabatan}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-10 text-center">
        <Link to="/guru" className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-5 py-2.5 font-semibold text-primary-700 transition hover:bg-primary-100">
          Kenali seluruh guru & staf <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

const juara = (p) => /^(Juara 1|Medali Emas)/.test(p.judul)

function Prestasi() {
  const [utama, ...lain] = PRESTASI
  const tahun = PRESTASI.map((p) => p.tahun)
  const perTingkat = URUTAN_TINGKAT.map((t) => [t, PRESTASI.filter((p) => p.tingkat === t).length]).filter(([, n]) => n)

  return (
    <section id="prestasi" className="relative scroll-mt-20 overflow-hidden bg-primary-950 py-28 text-white">
      <Gelombang warna="text-white" atas />
      <div className="pola-titik absolute inset-0 opacity-40" />
      <Gumpalan className="absolute -right-40 top-24 h-[32rem] w-[32rem] text-primary-800/40" />
      <Gumpalan className="absolute -left-40 bottom-10 h-96 w-96 rotate-90 text-primary-900/60" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-200 ring-1 ring-white/15">
            <Trophy className="h-3.5 w-3.5" /> Prestasi
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Jejak prestasi siswa & sekolah</h2>
          <p className="mt-3 text-lg text-primary-100">Setiap piala adalah cerita tentang kerja keras, keberanian mencoba, dan dukungan orang tua.</p>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Muncul as="li" className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-amber-300 to-amber-500 p-7 text-amber-950 sm:col-span-2 lg:row-span-2 lg:p-9">
            <Trophy className="absolute -bottom-10 -right-10 h-48 w-48 rotate-12 text-amber-950/[0.07] lg:h-60 lg:w-60" />
            <div className="relative flex h-full flex-col">
              <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-950/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" /> Prestasi terbaru
              </p>
              <span className="mt-6 grid h-16 w-16 place-items-center rounded-2xl bg-white/50 shadow-sm">
                <Trophy className="h-8 w-8" />
              </span>
              <p className="mt-6 font-display text-3xl font-bold leading-tight lg:text-4xl">{utama.judul}</p>
              <p className="mt-2 text-lg font-medium text-amber-900">{utama.oleh}</p>
              <p className="mt-auto pt-8 font-semibold">
                Tingkat {utama.tingkat} · {utama.bidang} · {utama.tahun}
              </p>
            </div>
          </Muncul>
          {lain.map((p, i) => {
            const Ikon = juara(p) ? Trophy : Medal
            return (
              <Muncul as="li" key={p.judul} jeda={(i % 4) * 70} className="flex flex-col rounded-3xl bg-white/[0.07] p-5 ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/[0.12]">
                <div className="flex items-center justify-between">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${juara(p) ? 'bg-amber-400 text-amber-950' : 'bg-white/10 text-amber-200'}`}>
                    <Ikon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-primary-200">{p.tahun}</span>
                </div>
                <p className="mt-4 font-display text-lg font-bold leading-snug">{p.judul}</p>
                <p className="mt-1 text-sm text-primary-100/80">{p.oleh}</p>
                <p className="mt-auto pt-4 text-xs font-bold uppercase tracking-wider text-amber-200">
                  {p.tingkat} · {p.bidang}
                </p>
              </Muncul>
            )
          })}
          <Muncul as="li" className="flex flex-col justify-between rounded-3xl bg-white p-5 text-slate-900">
            <div>
              <p className="font-display text-4xl font-bold text-primary-600">{PRESTASI.length}</p>
              <p className="font-semibold">
                prestasi dalam {Math.max(...tahun) - Math.min(...tahun) + 1} tahun terakhir
              </p>
            </div>
            <ul className="mt-4 space-y-1.5">
              {perTingkat.map(([t, n]) => (
                <li key={t} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Tingkat {t}</span>
                  <span className="rounded-full bg-primary-50 px-2.5 py-0.5 font-bold text-primary-700">{n}</span>
                </li>
              ))}
            </ul>
          </Muncul>
        </ol>
      </div>
      <Gelombang warna="text-white" />
    </section>
  )
}

function Fasilitas() {
  return (
    <section id="fasilitas" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-20 sm:px-6">
      <SectionTitle eyebrow="Sarana" title="Fasilitas sekolah" desc="Lingkungan belajar yang aman, nyaman, dan mendukung tumbuh kembang anak." />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {FASILITAS.map((f, i) => {
          const Icon = IKON_FASILITAS[f.ikon] ?? Building2
          const w = WARNA_CERIA[i % WARNA_CERIA.length]
          return (
            <Muncul key={f.id} jeda={(i % 4) * 60}>
              <Link to={`/fasilitas/${f.id}`} className={`group flex h-full flex-col rounded-[1.75rem] p-4 ring-1 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5 ${w.bg} ${w.ring}`}>
                <span className={`grid h-12 w-12 place-items-center rounded-2xl transition duration-300 group-hover:-rotate-6 group-hover:scale-110 ${w.ikon}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <p className="mt-4 font-display text-lg font-bold leading-tight text-slate-900">{f.nama}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{f.ringkas}</p>
                <span className={`mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold ${w.teks}`}>
                  Lihat <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            </Muncul>
          )
        })}
      </div>

      <Muncul className="relative mt-14 overflow-hidden rounded-[2rem] bg-primary-600 px-6 py-10 text-center text-white sm:px-12 md:flex md:items-center md:justify-between md:gap-8 md:text-left">
        <div className="pola-titik absolute inset-0" />
        <Gumpalan className="absolute -right-16 -top-20 h-64 w-64 text-white/10" />
        <div className="relative">
          <h3 className="text-2xl font-bold sm:text-3xl">Lebih seru dilihat langsung</h3>
          <p className="mt-2 text-primary-50">Ajak ananda berkeliling sekolah dan berkenalan dengan para guru.</p>
        </div>
        <div className="relative mt-6 flex flex-wrap justify-center gap-3 md:mt-0 md:shrink-0">
          <Link to="/fasilitas#kunjungan" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-primary-700 shadow-sm transition hover:bg-primary-50">
            Jadwalkan Kunjungan <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/ppdb" className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold ring-1 ring-white/50 transition hover:bg-white/10">
            Daftar PPDB
          </Link>
        </div>
      </Muncul>
    </section>
  )
}

export default function Profil() {
  return (
    <>
      <Hero />
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
