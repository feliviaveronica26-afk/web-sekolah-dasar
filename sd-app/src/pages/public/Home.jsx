import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  HeartHandshake,
  MessageSquareText,
  Quote,
  ShieldCheck,
  Star,
  Trophy,
  Wallet,
} from 'lucide-react'
import { JENIS_AGENDA, agendaMendatang, rentangAgenda } from '../../components/KalenderAkademik'
import { Muncul } from '../../components/Hiasan'
import { Foto, JudulBagian, Label, PitaBerjalan, TautanPanah, tombol, wadah } from '../../components/Situs'
import { useData } from '../../context/DataContext'
import { EKSKUL, JAM_SEKOLAH, JENJANG, KARAKTER, KEUNGGULAN, PPDB, PRESTASI, SEHARI, SEKOLAH, STATISTIK, TESTIMONI } from '../../data/dummy'
import { FOTO, FOTO_EKSKUL, fotoUntuk } from '../../data/foto'
import { formatTanggal } from '../../utils/format'

const STAT = Object.fromEntries(STATISTIK.map((s) => [s.label, s.nilai]))
const GERBANG = JAM_SEKOLAH.find((j) => j.label === 'Gerbang dibuka')?.jam ?? '06.30'

const FAKTA = [
  [STAT['Siswa Aktif'], 'siswa aktif'],
  [SEKOLAH.maksSiswaPerKelas, 'siswa maks. per kelas'],
  [EKSKUL.length, 'pilihan ekskul'],
]

const LAYANAN = [
  { icon: ClipboardCheck, judul: 'Kehadiran harian', desc: 'Tercatat tiap pagi dan langsung terlihat oleh orang tua.' },
  { icon: Star, judul: 'Nilai & poin sikap', desc: 'Nilai tugas, rapor, dan apresiasi dari guru.' },
  { icon: MessageSquareText, judul: 'Chat wali kelas', desc: 'Tanpa harus menyimpan nomor pribadi guru.' },
  { icon: FileText, judul: 'Izin online', desc: 'Anak sakit? Ajukan izin dari rumah.' },
  { icon: Wallet, judul: 'Bayar SPP', desc: 'Lewat QRIS atau Virtual Account, kuitansi tersimpan.' },
  { icon: BellRing, judul: 'Pengumuman', desc: 'Info ujian, kegiatan, dan agenda sekolah.' },
]

// Contoh isi linimasa harian di Portal Orang Tua
const CONTOH_HARIAN = [
  { jam: '06.52', teks: 'Rafa tiba di sekolah', jenis: 'Kehadiran', icon: ClipboardCheck, warna: 'bg-emerald-100 text-emerald-700' },
  { jam: '09.05', teks: 'Nilai tugas Matematika: 88', jenis: 'Nilai', icon: Star, warna: 'bg-amber-100 text-amber-700' },
  { jam: '10.40', teks: 'Apresiasi: membantu teman', jenis: 'Sikap', icon: HeartHandshake, warna: 'bg-primary-100 text-primary-700' },
  { jam: '12.15', teks: 'Pesan baru dari wali kelas 4A', jenis: 'Chat', icon: MessageSquareText, warna: 'bg-sky-100 text-sky-700' },
]

// 'Dra. Siti Rahmawati, M.Pd.' -> 'SR' (inisial untuk avatar)
const inisial = (nama) =>
  nama
    .split(',')[0]
    .replace(/^((Dra?|Drs|Hj?|Prof|Ir)\.\s*)+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0])
    .join('')

// Tombol garis (tanpa latar). Saat diklik, warna putih menyebar dari titik klik, lalu pindah ke halaman Kontak.
function TombolHubungi() {
  const navigate = useNavigate()
  const [riak, setRiak] = useState(null)
  const timer = useRef()

  useEffect(() => () => clearTimeout(timer.current), [])

  const klik = (e) => {
    // Ctrl/Cmd+klik (buka tab baru) dan pengguna yang mematikan animasi tetap memakai link biasa
    if (e.ctrlKey || e.metaKey || e.shiftKey || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    e.preventDefault()
    if (riak) return
    const r = e.currentTarget.getBoundingClientRect()
    // Klik lewat keyboard (Enter) tidak punya posisi mouse: mulai dari tengah tombol
    const x = e.detail ? e.clientX - r.left : r.width / 2
    const y = e.detail ? e.clientY - r.top : r.height / 2
    setRiak({ x, y, ukuran: Math.hypot(r.width, r.height) * 2 })
    timer.current = setTimeout(() => navigate('/kontak'), 600)
  }

  return (
    <Link
      to="/kontak"
      onClick={klik}
      className={`group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-[15px] font-bold ring-1 ring-inset ring-white/70 transition duration-300 hover:bg-white/10 hover:ring-white active:scale-95 ${
        riak ? 'scale-105 text-primary-800 ring-white' : 'text-white'
      }`}
    >
      {riak && (
        <span
          className="animasi-riak pointer-events-none absolute rounded-full bg-white"
          style={{ left: riak.x, top: riak.y, width: riak.ukuran, height: riak.ukuran }}
        />
      )}
      <span className="relative">Hubungi kami</span>
      <ArrowRight
        className={`relative h-4 w-4 transition-all duration-300 ${
          riak ? 'translate-x-1 opacity-100' : '-ml-6 -translate-x-2 opacity-0 group-hover:ml-0 group-hover:translate-x-0 group-hover:opacity-100'
        }`}
      />
    </Link>
  )
}

// Foto bersudut bulat yang sedikit membesar saat disorot
function Bingkai({ foto, className = '', prioritas = false }) {
  return (
    <figure className={`group overflow-hidden rounded-[1.75rem] bg-primary-800 ${className}`}>
      <Foto foto={foto} prioritas={prioritas} className="transition duration-700 group-hover:scale-105" />
    </figure>
  )
}

// Kolase foto di sisi kanan hero
function KolaseHero() {
  return (
    // HP: kartu jam melebar di baris bawah (foto literasi disembunyikan); tablet ke atas: kartu jam tegak di kanan bawah
    <div className="grid h-[26rem] grid-cols-6 grid-rows-6 gap-3 sm:h-[34rem] sm:gap-4 lg:h-[37rem]">
      <Bingkai foto={FOTO.ceria} prioritas className="col-span-4 col-start-1 row-span-4 row-start-1" />
      <Bingkai foto={FOTO.siswi} prioritas className="col-span-2 col-start-5 row-span-4 row-start-1 sm:row-span-3" />
      <div className="@container col-span-4 col-start-3 row-span-2 row-start-5 flex flex-col justify-end rounded-[1.75rem] bg-stabilo p-4 text-tinta sm:col-span-2 sm:col-start-5 sm:row-span-3 sm:row-start-4 sm:justify-between sm:p-6">
        <span className="hidden h-12 w-12 place-items-center rounded-full bg-tinta text-stabilo sm:grid">
          <CalendarDays className="h-6 w-6" aria-hidden="true" />
        </span>
        <p>
          {/* Ukuran jam mengikuti lebar kartu agar tidak keluar kartu di kolom yang sempit */}
          <span className="angka block text-[clamp(1.5rem,34cqw,3rem)] font-extrabold leading-none tracking-tight">{GERBANG}</span>
          <span className="mt-1.5 block text-[13px] font-semibold leading-snug sm:text-[15px]">Gerbang dibuka, anak disambut guru piket</span>
        </p>
      </div>
      <Bingkai foto={FOTO.benderaKepala} className="col-span-2 col-start-1 row-span-2 row-start-5" />
      <Bingkai foto={FOTO.literasi} className="hidden sm:block sm:col-span-2 sm:col-start-3 sm:row-span-2 sm:row-start-5" />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-primary-700 text-white">
      <span aria-hidden="true" className="pointer-events-none absolute -left-64 top-1/4 -z-10 h-[44rem] w-[44rem] rounded-full border-[4.5rem] border-white/[0.05]" />
      <div className={`${wadah} grid items-center gap-14 pb-16 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:pb-24 lg:pt-16`}>
        <div>
          <Link
            to="/ppdb"
            className="group inline-flex min-h-10 items-center gap-2.5 rounded-full bg-white/10 py-1.5 pl-1.5 pr-4 text-sm font-semibold ring-1 ring-inset ring-white/20 transition hover:bg-white/15"
          >
            <span className="rounded-full bg-stabilo px-2.5 py-1 text-xs font-extrabold text-tinta">PPDB</span>
            Pendaftaran {PPDB.tahunAjaran} sudah dibuka
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <h1 className="mt-7 text-[2.9rem] leading-[1] sm:text-7xl lg:text-[5rem]">
            Setiap pagi, anak-anak datang dengan <span className="text-stabilo">senang hati.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-krem sm:text-xl">
            {SEKOLAH.nama} adalah sekolah dasar untuk kelas 1 sampai 6. Kelasnya kecil, gurunya hangat, dan orang tua selalu tahu kabar ananda lewat
            portal sekolah.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/ppdb#daftar" className={tombol.terang}>
              Daftar PPDB {PPDB.tahunAjaran} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/fasilitas#kunjungan" className={tombol.garisTerang}>
              Jadwalkan kunjungan
            </Link>
          </div>
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-7">
            {FAKTA.map(([angka, ket]) => (
              <div key={ket}>
                <dt className="sr-only">{ket}</dt>
                <dd>
                  <span className="angka block text-4xl font-extrabold tracking-tight sm:text-5xl">{angka}</span>
                  <span className="mt-1 block text-sm leading-snug text-krem">{ket}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <KolaseHero />
      </div>
    </section>
  )
}

function Sambutan() {
  const { data } = useData()
  const kepsek = data.guru.find((g) => g.jabatan === 'Kepala Sekolah')?.nama ?? SEKOLAH.kepalaSekolah
  return (
    <section className={`${wadah} grid items-center gap-14 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28`}>
      <Muncul className="relative pb-8 pr-8 sm:pb-10 sm:pr-10">
        <Bingkai foto={FOTO.gedung} className="aspect-[4/3.4]" />
        <div className="absolute bottom-0 right-0 w-56 rounded-[1.5rem] bg-primary-600 p-5 text-white shadow-[0_24px_40px_-20px_rgb(68_6_11/0.8)] sm:w-64 sm:p-6">
          <p className="angka text-4xl font-extrabold tracking-tight sm:text-5xl">{STAT['Guru & Staf']}</p>
          <p className="mt-1 text-[15px] font-semibold leading-snug">guru & staf yang mengenal setiap anak</p>
        </div>
      </Muncul>
      <Muncul jeda={120}>
        <Label>Sambutan Kepala Sekolah</Label>
        <h2 className="mt-5 text-[2.15rem] leading-[1.08] sm:text-5xl">Sekolah yang baik dibangun bersama.</h2>
        <figure className="mt-8">
          <Quote className="h-9 w-9 fill-primary-600 text-primary-600" aria-hidden="true" />
          <blockquote className="mt-4 text-lg leading-relaxed text-tinta-2 sm:text-xl sm:leading-relaxed">{SEKOLAH.sambutan}</blockquote>
          <figcaption className="mt-8 flex items-center gap-4">
            <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary-50 text-lg font-extrabold text-primary-700 ring-1 ring-primary-100">
              {inisial(kepsek)}
            </span>
            <span>
              <span className="block font-bold">{kepsek}</span>
              <span className="block text-[15px] text-tinta-3">Kepala Sekolah {SEKOLAH.nama}</span>
            </span>
          </figcaption>
        </figure>
        <TautanPanah to="/profil" className="mt-9">
          Kenali sekolah kami
        </TautanPanah>
      </Muncul>
    </section>
  )
}

const IKON_KEUNGGULAN = { kurikulum: GraduationCap, hati: HeartHandshake, perisai: ShieldCheck }

// Kartu bento: foto dengan teks di atasnya, atau bidang warna dengan ikon
function KartuBento({ k, foto, gaya, className = '', jeda = 0 }) {
  const Icon = IKON_KEUNGGULAN[k.ikon]
  if (foto)
    return (
      <Muncul as="li" jeda={jeda} className={`group relative isolate flex min-h-72 flex-col justify-end overflow-hidden rounded-[1.75rem] p-6 text-white sm:p-7 ${className}`}>
        <Foto foto={foto} className="absolute inset-0 -z-20 transition duration-700 group-hover:scale-105" />
        {/* Gelap di bagian bawah agar teks tetap terbaca di atas foto */}
        <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 to-black/0" />
        <h3 className="text-2xl leading-tight sm:text-[1.7rem]">{k.judul}</h3>
        <p className="mt-2 max-w-md leading-relaxed text-white/85">{k.desc}</p>
      </Muncul>
    )
  return (
    <Muncul as="li" jeda={jeda} className={`flex min-h-64 flex-col justify-between gap-8 rounded-[1.75rem] p-6 sm:p-7 ${gaya} ${className}`}>
      {Icon && (
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-inset ring-black/5">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <div>
        <h3 className="text-2xl leading-tight">{k.judul}</h3>
        <p className="mt-2 leading-relaxed opacity-90">{k.desc}</p>
      </div>
    </Muncul>
  )
}

function Alasan() {
  const k = Object.fromEntries(KEUNGGULAN.map((x) => [x.ikon, x]))
  return (
    <section className="bg-kertas-tua/70 py-20 lg:py-28">
      <div className={wadah}>
        <JudulBagian
          label="Mengapa orang tua memilih kami"
          judul="Enam hal yang kami jaga setiap hari."
          aksi={<TautanPanah to="/profil">Profil lengkap</TautanPanah>}
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[repeat(3,minmax(15rem,auto))]">
          <KartuBento k={k.kelas} foto={FOTO.kelasGuru} className="sm:col-span-2 lg:row-span-2" />
          <KartuBento k={k.kurikulum} gaya="bg-primary-600 text-white" jeda={80} />
          <KartuBento k={k.bahasa} foto={FOTO.bacaTangga} className="lg:row-span-2" jeda={160} />
          <KartuBento k={k.hati} gaya="bg-stabilo text-tinta" jeda={80} />
          <KartuBento k={k.robot} foto={FOTO.labKomputer} className="sm:col-span-2" />
          <KartuBento k={k.perisai} gaya="bg-tinta text-white" className="sm:col-span-2" jeda={80} />
        </ul>
      </div>
    </section>
  )
}

const FOTO_JENJANG = { bawah: FOTO.membaca, atas: FOTO.jelajah }

function Jenjang() {
  return (
    <section className="py-20 lg:py-28">
      <div className={wadah}>
        <JudulBagian
          label="Program belajar"
          judul="Sesuai tahap tumbuh kembang anak."
          desc="Kelas bawah membangun fondasi; kelas atas menguatkan nalar dan kepemimpinan."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {JENJANG.map((j, i) => (
            <Muncul
              as="article"
              key={j.id}
              jeda={i * 120}
              className="group flex flex-col overflow-hidden rounded-[2rem] bg-kartu ring-1 ring-garis transition duration-300 hover:shadow-[0_30px_60px_-30px_rgb(68_6_11/0.45)]"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Foto foto={FOTO_JENJANG[j.id]} className="transition duration-700 group-hover:scale-105" />
                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3.5 py-1.5 text-sm font-bold text-primary-700 shadow">{j.kelas}</span>
                  <span className="rounded-full bg-tinta/80 px-3.5 py-1.5 text-sm font-semibold text-white backdrop-blur">{j.usia}</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-7 sm:p-9">
                <h3 className="text-3xl sm:text-4xl">{j.nama}</h3>
                <p className="mt-2 text-lg text-tinta-2">{j.fokus}</p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {j.poin.map((p) => (
                    <li key={p} className="flex gap-2.5 leading-snug">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <TautanPanah to="/akademik#kurikulum">Lihat kurikulum</TautanPanah>
                </div>
              </div>
            </Muncul>
          ))}
        </div>
      </div>
    </section>
  )
}

function SehariDiSekolah() {
  return (
    <section className="bg-primary-950 text-white">
      <div className={`${wadah} grid gap-14 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-28`}>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <JudulBagian
            terang
            label="Sehari di sekolah"
            judul="Seperti apa hari ananda di sini?"
            desc="Rutinitas Senin sampai Jumat, dari gerbang dibuka sampai siswa dijemput."
            className=""
          />
          <Bingkai foto={FOTO.guruMendampingi} className="mt-10 hidden aspect-[16/10] lg:block" />
        </div>
        <ol className="relative">
          {/* Garis linimasa */}
          <span aria-hidden="true" className="absolute bottom-8 left-[2.4rem] top-8 w-px bg-white/15 sm:left-[2.9rem]" />
          {SEHARI.map((s, i) => (
            <Muncul as="li" key={s.jam} jeda={i * 60} className="relative grid grid-cols-[4.8rem_1fr] gap-5 py-4 sm:grid-cols-[5.8rem_1fr] sm:gap-7">
              <span className="angka relative z-10 grid h-12 place-items-center self-start rounded-full bg-stabilo text-[15px] font-extrabold text-tinta sm:h-14 sm:text-lg">
                {s.jam}
              </span>
              <div className="rounded-[1.5rem] bg-white/[0.06] p-5 ring-1 ring-inset ring-white/10 transition hover:bg-white/10 sm:p-6">
                <h3 className="text-xl leading-snug sm:text-2xl">{s.judul}</h3>
                <p className="mt-1.5 leading-relaxed text-krem">{s.desc}</p>
              </div>
            </Muncul>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Ekstrakurikuler() {
  const berfoto = EKSKUL.filter((e) => ['pramuka', 'robotik', 'futsal', 'melukis'].includes(e.id))
  const lain = EKSKUL.filter((e) => !berfoto.includes(e))
  return (
    <section className="py-20 lg:py-28">
      <div className={wadah}>
        <JudulBagian
          label="Bakat & minat"
          judul={`${EKSKUL.length} ekstrakurikuler setelah jam pelajaran.`}
          desc="Dari robotik sampai tari tradisional. Siswa bebas memilih lewat Portal Siswa selama jadwalnya tidak bentrok."
          aksi={<TautanPanah to="/akademik#ekskul">Jadwal & pembina</TautanPanah>}
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {berfoto.map((e, i) => (
            <Muncul as="li" key={e.id} jeda={i * 80} className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[1.75rem] p-6 text-white">
              <Foto foto={FOTO_EKSKUL[e.id]} className="absolute inset-0 -z-20 transition duration-700 group-hover:scale-105" />
              <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/25 to-black/0" />
              {e.wajib && <span className="absolute left-5 top-5 rounded-full bg-stabilo px-3 py-1 text-xs font-extrabold text-tinta">Wajib kelas 3–6</span>}
              <h3 className="text-2xl">{e.nama}</h3>
              <p className="angka mt-1 text-[15px] text-white/85">
                {e.hari} · {e.jam}
              </p>
            </Muncul>
          ))}
        </ul>
        <ul className="mt-6 flex flex-wrap gap-2.5">
          {lain.map((e) => (
            <li key={e.id} className="inline-flex items-center gap-2 rounded-full bg-kartu px-4 py-2.5 text-[15px] ring-1 ring-inset ring-garis">
              <span className="font-bold">{e.nama}</span>
              <span className="angka text-tinta-3">
                {e.hari}, {e.jam}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Prestasi() {
  const [utama, ...lain] = PRESTASI
  return (
    <section className="bg-primary-700 py-20 text-white lg:py-28">
      <div className={wadah}>
        <JudulBagian
          terang
          label="Prestasi siswa"
          judul="Kabar baik dari lomba dan panggung."
          aksi={
            <TautanPanah to="/profil#prestasi" terang>
              Semua prestasi
            </TautanPanah>
          }
        />
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Muncul className="relative isolate flex min-h-96 flex-col overflow-hidden rounded-[2rem] bg-stabilo p-8 text-tinta sm:p-10">
            <Trophy aria-hidden="true" strokeWidth={1.25} className="absolute -bottom-8 -right-8 -z-10 h-64 w-64 text-tinta/10" />
            <span className="w-fit rounded-full bg-tinta px-3.5 py-1.5 text-sm font-bold text-stabilo">
              Terbaru · <span className="angka">{utama.tahun}</span>
            </span>
            <p className="mt-8 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">{utama.judul}</p>
            <p className="mt-4 text-lg font-medium">{utama.oleh}</p>
            <p className="mt-auto pt-10 text-lg font-bold">Tingkat {utama.tingkat}</p>
          </Muncul>
          <ol className="grid gap-3">
            {lain.slice(0, 5).map((p, i) => (
              <Muncul
                as="li"
                key={p.judul}
                jeda={i * 50}
                className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-[1.5rem] bg-white/[0.08] p-4 ring-1 ring-inset ring-white/10 sm:grid-cols-[auto_1fr_auto] sm:gap-5 sm:p-5"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-primary-700">
                  <Trophy className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-lg font-bold leading-snug">{p.judul}</span>
                  <span className="block text-[15px] text-krem">{p.oleh}</span>
                </span>
                <span className="angka col-start-2 text-sm font-semibold text-krem sm:col-start-auto sm:text-right">
                  {p.tingkat} · {p.tahun}
                </span>
              </Muncul>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function Testimoni() {
  const [utama, ...lain] = TESTIMONI
  const warna = ['bg-primary-600 text-white', 'bg-stabilo text-tinta', 'bg-tinta text-white']
  return (
    <section className="py-20 lg:py-28">
      <div className={wadah}>
        <JudulBagian label="Kata orang tua" judul="Cerita dari keluarga Harapan Gemilang." />
        <Muncul as="figure" className="grid overflow-hidden rounded-[2rem] bg-kartu ring-1 ring-garis lg:grid-cols-[0.85fr_1.15fr]">
          <div className="aspect-[16/10] lg:aspect-auto">
            <Foto foto={FOTO.tawa} />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <Quote className="h-10 w-10 fill-primary-600 text-primary-600" aria-hidden="true" />
            <blockquote className="mt-5 text-2xl font-semibold leading-snug tracking-tight sm:text-[2rem] sm:leading-[1.25]">{utama.isi}</blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-full bg-primary-600 font-extrabold text-white">
                {inisial(utama.nama)}
              </span>
              <span>
                <span className="block font-bold">{utama.nama}</span>
                <span className="text-[15px] text-tinta-3">{utama.peran}</span>
              </span>
            </figcaption>
          </div>
        </Muncul>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {lain.map((t, i) => (
            <Muncul as="figure" key={t.nama} jeda={i * 80} className="flex flex-col rounded-[1.75rem] bg-kartu p-7 ring-1 ring-garis">
              <blockquote className="text-lg leading-relaxed text-tinta-2">“{t.isi}”</blockquote>
              <figcaption className="mt-auto flex items-center gap-3 pt-6">
                <span aria-hidden="true" className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-extrabold ${warna[i % warna.length]}`}>
                  {inisial(t.nama)}
                </span>
                <span className="text-[15px]">
                  <span className="block font-bold">{t.nama}</span>
                  <span className="text-tinta-3">{t.peran}</span>
                </span>
              </figcaption>
            </Muncul>
          ))}
        </div>
      </div>
    </section>
  )
}

// Tampilan ponsel berisi contoh linimasa Portal Orang Tua
function PonselPortal() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-[2.75rem] bg-tinta p-3 shadow-[0_40px_80px_-30px_rgb(68_6_11/0.6)]">
      <div className="overflow-hidden rounded-[2.2rem] bg-kertas">
        <div className="bg-primary-600 px-6 pb-6 pt-7 text-white">
          <p className="text-sm text-white/85">Portal Orang Tua · Hari ini</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight">Rafa Aditya</p>
          <p className="text-sm font-semibold text-white/85">Kelas 4A</p>
        </div>
        <ol className="space-y-2.5 p-4">
          {CONTOH_HARIAN.map(({ jam, teks, jenis, icon: Icon, warna }) => (
            <li key={jam} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-garis">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${warna}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold uppercase tracking-wide text-tinta-3">{jenis}</span>
                <span className="block truncate text-[15px] font-semibold">{teks}</span>
              </span>
              <span className="angka text-xs font-semibold text-tinta-3">{jam}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function PortalSekolah() {
  return (
    <section className="bg-primary-50 py-20 lg:py-28">
      <div className={`${wadah} grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]`}>
        <div>
          <JudulBagian
            label="Portal sekolah"
            judul="Orang tua selalu tahu kabar ananda."
            desc="Siswa, orang tua, guru, dan sekolah terhubung dalam satu portal. Semua yang biasanya lewat kertas titipan kini ada di genggaman."
            className="mb-10"
          />
          <ul className="grid gap-3 sm:grid-cols-2">
            {LAYANAN.map(({ icon: Icon, judul, desc }) => (
              <li key={judul} className="flex gap-4 rounded-[1.25rem] bg-white p-4 ring-1 ring-primary-100">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-600 text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-bold">{judul}</span>
                  <span className="mt-0.5 block text-[15px] leading-snug text-tinta-2">{desc}</span>
                </span>
              </li>
            ))}
          </ul>
          <Link to="/login" className={`${tombol.utama} mt-9`}>
            Masuk ke portal <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <Muncul jeda={120}>
          <PonselPortal />
        </Muncul>
      </div>
    </section>
  )
}

function KabarSekolah() {
  const { data } = useData()
  const [utama, ...lain] = [...data.pengumuman].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 3)
  const agenda = agendaMendatang(4)

  return (
    <section className="py-20 lg:py-28">
      <div className={wadah}>
        <JudulBagian label="Kabar sekolah" judul="Berita & agenda terbaru." aksi={<TautanPanah to="/berita">Semua berita</TautanPanah>} />
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {!utama ? (
            <p className="rounded-[1.75rem] bg-kartu p-8 text-tinta-2 ring-1 ring-garis">Belum ada berita terbaru.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <Link to={`/berita/${utama.id}`} className="group flex flex-col overflow-hidden rounded-[1.75rem] bg-kartu ring-1 ring-garis md:row-span-2">
                <div className="relative aspect-[16/11] overflow-hidden md:aspect-auto md:min-h-60 md:flex-1">
                  <Foto foto={fotoUntuk(utama)} alt="" className="absolute inset-0 transition duration-700 group-hover:scale-105" />
                </div>
                <div className="flex flex-col p-6 sm:p-7">
                  <p className="text-sm">
                    <span className="rounded-full bg-primary-50 px-3 py-1 font-bold text-primary-700">{utama.kategori}</span>
                    <span className="angka ml-3 text-tinta-3">{formatTanggal(utama.tanggal)}</span>
                  </p>
                  <h3 className="mt-4 text-2xl leading-snug group-hover:text-primary-700">{utama.judul}</h3>
                  <p className="mt-3 line-clamp-3 leading-relaxed text-tinta-2">{utama.isi}</p>
                </div>
              </Link>
              {lain.map((p) => (
                <Link key={p.id} to={`/berita/${p.id}`} className="group flex flex-col overflow-hidden rounded-[1.75rem] bg-kartu ring-1 ring-garis">
                  <div className="aspect-[16/8] overflow-hidden">
                    <Foto foto={fotoUntuk(p)} alt="" className="transition duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-5 sm:p-6">
                    <p className="text-sm">
                      <span className="font-bold text-primary-700">{p.kategori}</span>
                      <span className="angka ml-2 text-tinta-3">· {formatTanggal(p.tanggal)}</span>
                    </p>
                    <h3 className="mt-2 text-lg leading-snug group-hover:text-primary-700">{p.judul}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="rounded-[1.75rem] bg-tinta p-6 text-white sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl">Agenda</h3>
              <Link to="/akademik#kalender" className="inline-flex items-center gap-1 text-sm font-bold text-stabilo hover:underline">
                Kalender lengkap <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="mt-6 space-y-3">
              {agenda.map((e) => {
                const tgl = new Date(`${e.mulai}T00:00:00`)
                return (
                  <li key={e.judul + e.mulai} className="flex gap-4 rounded-2xl bg-white/[0.07] p-3.5">
                    <span className="grid w-14 shrink-0 place-items-center rounded-xl bg-white py-2 text-center leading-none text-tinta">
                      <span className="angka block text-2xl font-extrabold">{tgl.getDate()}</span>
                      <span className="mt-1 block text-[11px] font-bold uppercase tracking-wider text-primary-700">
                        {tgl.toLocaleDateString('id-ID', { month: 'short' })}
                      </span>
                    </span>
                    <span className="min-w-0 self-center">
                      <span className="block font-bold leading-snug">{e.judul}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-white/70">
                        <span className="inline-flex items-center gap-1.5">
                          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${JENIS_AGENDA[e.jenis].dot}`} />
                          {JENIS_AGENDA[e.jenis].label}
                        </span>
                        · {rentangAgenda(e)}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function MomenSekolah() {
  const momen = [FOTO.upacara, FOTO.kebun, FOTO.merdeka, FOTO.perpustakaan, FOTO.ruangKelas]
  return (
    <section className="pb-20 lg:pb-28">
      <div className={wadah}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl">Sudut & momen sekolah</h2>
          <TautanPanah to="/galeri">Buka galeri</TautanPanah>
        </div>
        <div className="grid h-[34rem] grid-cols-2 grid-rows-3 gap-3 sm:h-[30rem] sm:grid-cols-4 sm:grid-rows-2 sm:gap-4">
          <Bingkai foto={momen[0]} className="col-span-2 row-span-1 sm:row-span-2" />
          {momen.slice(1).map((f) => (
            <Bingkai key={f.src} foto={f} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Ajakan() {
  return (
    <section className={`${wadah} pb-20 lg:pb-28`}>
      <div className="grid overflow-hidden rounded-[2.5rem] bg-primary-700 text-white lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-8 sm:p-12 lg:p-16">
          <Label terang>PPDB {PPDB.tahunAjaran}</Label>
          <h2 className="mt-6 text-4xl leading-[1.05] sm:text-6xl">Pendaftaran tahun ajaran baru sudah dibuka.</h2>
          <p className="mt-5 max-w-lg text-lg text-krem">Kuota terbatas. Daftar lebih awal agar jadwal observasi ananda bisa dipilih lebih leluasa.</p>
          <ol className="mt-9 grid gap-3 sm:grid-cols-2">
            {PPDB.jadwal.map((j, i) => (
              <li key={j.tahap} className="flex gap-3 rounded-2xl bg-white/[0.08] p-4 ring-1 ring-inset ring-white/10">
                <span className="angka grid h-8 w-8 shrink-0 place-items-center rounded-full bg-stabilo text-sm font-extrabold text-tinta">{i + 1}</span>
                <span>
                  <span className="block font-bold leading-snug">{j.tahap}</span>
                  <span className="angka block text-sm text-krem">{j.tanggal}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/ppdb#daftar" className={tombol.terang}>
              Daftar online sekarang <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <TombolHubungi />
          </div>
        </div>
        <div className="relative min-h-72 lg:min-h-full">
          <Foto foto={FOTO.sahabat} className="absolute inset-0" />
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <PitaBerjalan label="Nilai karakter GEMILANG" isi={KARAKTER.map((k) => k.nama)} className="bg-stabilo text-tinta" bintang="text-primary-600" />
      <Sambutan />
      <Alasan />
      <Jenjang />
      <SehariDiSekolah />
      <Ekstrakurikuler />
      <Prestasi />
      <Testimoni />
      <PortalSekolah />
      <KabarSekolah />
      <MomenSekolah />
      <Ajakan />
    </>
  )
}
