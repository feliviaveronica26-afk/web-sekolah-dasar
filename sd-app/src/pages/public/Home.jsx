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
import { AngkaNaik, Muncul, TeksNaik } from '../../components/Hiasan'
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
  { jam: '06.52', teks: 'Rafa tiba di sekolah', jenis: 'Kehadiran', icon: ClipboardCheck, warna: 'warna-emerald' },
  { jam: '09.05', teks: 'Nilai tugas Matematika: 88', jenis: 'Nilai', icon: Star, warna: 'warna-amber' },
  { jam: '10.40', teks: 'Apresiasi: membantu teman', jenis: 'Sikap', icon: HeartHandshake, warna: 'warna-merah' },
  { jam: '12.15', teks: 'Pesan baru dari wali kelas 4A', jenis: 'Chat', icon: MessageSquareText, warna: 'warna-sky' },
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
    <Link to="/kontak" onClick={klik} className={`btn btn-lg btn-garis-terang tombol-riak position-relative overflow-hidden ${riak ? 'tombol-riak--aktif' : ''}`}>
      {riak && (
        <span
          className="animasi-riak pe-none position-absolute rounded-circle bg-white"
          style={{ left: riak.x, top: riak.y, width: riak.ukuran, height: riak.ukuran }}
        />
      )}
      <span className="position-relative">Hubungi kami</span>
      <ArrowRight className={`panah-riak position-relative ukuran-4 ${riak ? 'panah-riak--aktif' : ''}`} />
    </Link>
  )
}

/*
  Foto bersudut bulat yang sedikit membesar saat disorot.
  `jeda` (ms) = bingkai terbuka bertirai saat masuk layar; `paralaks` = foto bergerak pelan saat digulir.
*/
function Bingkai({ foto, className = '', prioritas = false, jeda, paralaks = false }) {
  const cls = `kartu-zoom overflow-hidden rounded-kartu bg-merah-800 ${className}`
  const isi = <Foto foto={foto} prioritas={prioritas} className={paralaks ? 'paralaks' : ''} />
  if (jeda === undefined) return <figure className={`m-0 ${cls}`}>{isi}</figure>
  return (
    <Muncul as="figure" gaya="tirai" jeda={jeda} className={`m-0 ${cls}`}>
      {isi}
    </Muncul>
  )
}

// Kolase foto di sisi kanan hero: bingkai terbuka bergiliran saat beranda dibuka
function KolaseHero() {
  return (
    // HP: kartu jam melebar di baris bawah (foto literasi disembunyikan); tablet ke atas: kartu jam tegak di kanan bawah
    <div className="kolase-hero">
      <Bingkai foto={FOTO.ceria} prioritas jeda={150} className="kolase-hero__ceria" />
      <Bingkai foto={FOTO.siswi} prioritas jeda={270} className="kolase-hero__siswi" />
      <Muncul
        gaya="skala"
        jeda={420}
        className="kolase-hero__jam d-flex flex-column justify-content-end justify-content-sm-between rounded-kartu bg-stabilo p-4 p-sm-6 text-tinta"
      >
        <span className="d-none d-sm-flex ukuran-12 align-items-center justify-content-center rounded-circle bg-tinta text-stabilo">
          <CalendarDays className="ukuran-6" aria-hidden="true" />
        </span>
        <p>
          {/* Ukuran jam mengikuti lebar kartu agar tidak keluar kartu di kolom yang sempit */}
          <span className="angka jam-besar d-block fw-extrabold lh-1 ls-tight">{GERBANG}</span>
          <span className="mt-1-5 d-block fs-13 fs-sm-15 fw-semibold lh-snug">Gerbang dibuka, anak disambut guru piket</span>
        </p>
      </Muncul>
      <Bingkai foto={FOTO.benderaKepala} jeda={520} className="kolase-hero__bendera" />
      <Bingkai foto={FOTO.literasi} jeda={620} className="kolase-hero__literasi" />
    </div>
  )
}

function Hero() {
  return (
    <section className="position-relative isolate overflow-hidden bg-merah-tua text-white">
      <span aria-hidden="true" className="hero__cincin" />
      <div className={`${wadah} pb-16 pt-10 pb-lg-24 pt-lg-16`}>
        <div className="row gx-0 gy-14 gx-lg-14 align-items-center">
          <div className="col-lg-6">
            {/* Urutan saat beranda dibuka: pita PPDB → kata-kata judul → ringkasan → tombol → angka */}
            <Link
              to="/ppdb"
              className="turun-awal geser-panah d-inline-flex min-h-10 align-items-center gap-2-5 rounded-pill bg-white bg-opacity-10 py-1-5 ps-1-5 pe-4 fs-sm fw-semibold border border-white border-opacity-20 transisi hover-terang"
            >
              <span className="rounded-pill bg-stabilo px-2-5 py-1 fs-xs fw-extrabold text-tinta">PPDB</span>
              Pendaftaran {PPDB.tahunAjaran} sudah dibuka
              <ArrowRight className="ukuran-4" aria-hidden="true" />
            </Link>
            <h1 className="judul-hero mt-7" style={{ '--tunda-teks': '120ms' }}>
              <TeksNaik teks="Setiap pagi, anak-anak datang dengan" />{' '}
              <span className="text-stabilo">
                <TeksNaik teks="senang hati." mulai={5} />
              </span>
            </h1>
            <p className="masuk-awal mt-7 mw-xl fs-lg fs-sm-xl lh-relaxed text-krem" style={{ '--tunda': '520ms' }}>
              {SEKOLAH.nama} adalah sekolah dasar untuk kelas 1 sampai 6. Kelasnya kecil, gurunya hangat, dan orang tua selalu tahu kabar ananda lewat
              portal sekolah.
            </p>
            <div className="masuk-awal mt-9 d-flex flex-wrap gap-3" style={{ '--tunda': '620ms' }}>
              <Link to="/ppdb#daftar" className={tombol.terang}>
                Daftar PPDB {PPDB.tahunAjaran} <ArrowRight className="ukuran-4" aria-hidden="true" />
              </Link>
              <Link to="/fasilitas#kunjungan" className={tombol.garisTerang}>
                Jadwalkan kunjungan
              </Link>
            </div>
            <dl className="masuk-awal mt-12 d-grid kolom-3 gap-4 mw-lg border-top border-white border-opacity-15 pt-7" style={{ '--tunda': '720ms' }}>
              {FAKTA.map(([angka, ket]) => (
                <div key={ket}>
                  <dt className="visually-hidden">{ket}</dt>
                  <dd>
                    <span className="angka d-block fs-4xl fs-sm-5xl fw-extrabold ls-tight">
                      <AngkaNaik nilai={angka} tunda={650} />
                    </span>
                    <span className="mt-2 d-block fs-sm lh-snug text-krem">{ket}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="col-lg-6">
            <KolaseHero />
          </div>
        </div>
      </div>
    </section>
  )
}

function Sambutan() {
  const { data } = useData()
  const kepsek = data.guru.find((g) => g.jabatan === 'Kepala Sekolah')?.nama ?? SEKOLAH.kepalaSekolah
  return (
    <section className={`${wadah} py-20 py-lg-28`}>
      <div className="row gx-0 gy-14 gx-lg-16 align-items-center">
        <div className="col-lg-6">
          <Muncul gaya="kiri" className="position-relative pb-8 pe-8 pb-sm-10 pe-sm-10">
            <Bingkai foto={FOTO.gedung} paralaks className="rasio-4x3-4" />
            <Muncul
              gaya="skala"
              jeda={300}
              className="position-absolute bottom-0 end-0 w-56 w-sm-64 rounded-4 bg-primary p-5 p-sm-6 text-white bayangan-marun"
            >
              <p className="angka fs-4xl fs-sm-5xl fw-extrabold ls-tight">
                <AngkaNaik nilai={STAT['Guru & Staf']} tunda={300} />
              </p>
              <p className="mt-2 fs-15 fw-semibold lh-snug">guru & staf yang mengenal setiap anak</p>
            </Muncul>
          </Muncul>
        </div>
        <div className="col-lg-6">
          <Muncul gaya="kanan" jeda={120}>
            <Label>Sambutan Kepala Sekolah</Label>
            <h2 className="judul-sedang mt-5">Sekolah yang baik dibangun bersama.</h2>
            <figure className="mt-8 mb-0">
              <Quote className="ukuran-9 text-primary isi-penuh" aria-hidden="true" />
              <blockquote className="mt-4 mb-0 fs-lg fs-sm-xl lh-relaxed text-tinta-2">{SEKOLAH.sambutan}</blockquote>
              <figcaption className="mt-8 d-flex align-items-center gap-4">
                <span
                  aria-hidden="true"
                  className="d-flex align-items-center justify-content-center ukuran-14 flex-shrink-0 rounded-circle bg-merah-50 fs-lg fw-extrabold text-merah-700 border border-merah-100"
                >
                  {inisial(kepsek)}
                </span>
                <span>
                  <span className="d-block fw-bold">{kepsek}</span>
                  <span className="d-block fs-15 text-tinta-3">Kepala Sekolah {SEKOLAH.nama}</span>
                </span>
              </figcaption>
            </figure>
            <TautanPanah to="/profil" className="mt-9">
              Kenali sekolah kami
            </TautanPanah>
          </Muncul>
        </div>
      </div>
    </section>
  )
}

const IKON_KEUNGGULAN = { kurikulum: GraduationCap, hati: HeartHandshake, perisai: ShieldCheck }

// Kartu bento: foto dengan teks di atasnya, atau bidang warna dengan ikon
function KartuBento({ k, foto, gaya, className = '', jeda = 0 }) {
  const Icon = IKON_KEUNGGULAN[k.ikon]
  if (foto)
    return (
      <Muncul
        as="li"
        gaya="skala"
        jeda={jeda}
        className={`kartu-zoom position-relative isolate d-flex min-h-72 flex-column justify-content-end overflow-hidden rounded-kartu p-6 p-sm-7 text-white ${className}`}
      >
        <Foto foto={foto} className="paralaks position-absolute inset-0 z-n2" />
        {/* Gelap di bagian bawah agar teks tetap terbaca di atas foto */}
        <span aria-hidden="true" className="gradasi-foto" />
        <h3 className="judul-bento lh-tight">{k.judul}</h3>
        <p className="mt-2 mw-md lh-relaxed text-white text-opacity-85">{k.desc}</p>
      </Muncul>
    )
  return (
    <Muncul as="li" gaya="skala" jeda={jeda} className={`kartu-ikon d-flex min-h-64 flex-column justify-content-between gap-8 rounded-kartu p-6 p-sm-7 ${gaya} ${className}`}>
      {Icon && (
        <span className="ikon-goyang d-flex align-items-center justify-content-center ukuran-12 rounded-3 bg-white bg-opacity-15 border border-black border-opacity-10">
          <Icon className="ukuran-6" aria-hidden="true" />
        </span>
      )}
      <div>
        <h3 className="fs-2xl lh-tight">{k.judul}</h3>
        <p className="mt-2 lh-relaxed opacity-90">{k.desc}</p>
      </div>
    </Muncul>
  )
}

function Alasan() {
  const k = Object.fromEntries(KEUNGGULAN.map((x) => [x.ikon, x]))
  return (
    <section className="latar-kertas-lembut py-20 py-lg-28">
      <div className={wadah}>
        <JudulBagian
          label="Mengapa orang tua memilih kami"
          judul="Enam hal yang kami jaga setiap hari."
          aksi={<TautanPanah to="/profil">Profil lengkap</TautanPanah>}
        />
        <ul className="bento d-grid gap-4 kolom-sm-2 kolom-lg-4">
          <KartuBento k={k.kelas} foto={FOTO.kelasGuru} className="rentang-sm-2 rentang-baris-lg-2" />
          <KartuBento k={k.kurikulum} gaya="bg-primary text-white" jeda={80} />
          <KartuBento k={k.bahasa} foto={FOTO.bacaTangga} className="rentang-baris-lg-2" jeda={160} />
          <KartuBento k={k.hati} gaya="bg-stabilo text-tinta" jeda={80} />
          <KartuBento k={k.robot} foto={FOTO.labKomputer} className="rentang-sm-2" />
          <KartuBento k={k.perisai} gaya="bg-tinta text-white" className="rentang-sm-2" jeda={80} />
        </ul>
      </div>
    </section>
  )
}

const FOTO_JENJANG = { bawah: FOTO.membaca, atas: FOTO.jelajah }

function Jenjang() {
  return (
    <section className="py-20 py-lg-28">
      <div className={wadah}>
        <JudulBagian
          label="Program belajar"
          judul="Sesuai tahap tumbuh kembang anak."
          desc="Kelas bawah membangun fondasi; kelas atas menguatkan nalar dan kepemimpinan."
        />
        <div className="d-grid gap-6 kolom-lg-2">
          {JENJANG.map((j, i) => (
            <Muncul
              as="article"
              key={j.id}
              jeda={i * 120}
              className="kartu-zoom hover-bayangan d-flex flex-column overflow-hidden rounded-5 bg-white border border-garis"
            >
              <div className="position-relative rasio-16x9 overflow-hidden">
                <Foto foto={FOTO_JENJANG[j.id]} className="paralaks" />
                <div className="position-absolute top-5 start-5 d-flex flex-wrap gap-2">
                  <span className="rounded-pill bg-white px-3-5 py-1-5 fs-sm fw-bold text-merah-700 shadow">{j.kelas}</span>
                  <span className="rounded-pill bg-tinta bg-opacity-80 px-3-5 py-1-5 fs-sm fw-semibold text-white buram">{j.usia}</span>
                </div>
              </div>
              <div className="d-flex flex-1 flex-column p-7 p-sm-9">
                <h3 className="fs-3xl fs-sm-4xl">{j.nama}</h3>
                <p className="mt-2 fs-lg text-tinta-2">{j.fokus}</p>
                <ul className="mt-6 d-grid gap-3 kolom-sm-2">
                  {j.poin.map((p) => (
                    <li key={p} className="d-flex gap-2-5 lh-snug">
                      <CheckCircle2 className="mt-0-5 ukuran-5 flex-shrink-0 text-primary" aria-hidden="true" />
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
    <section className="bg-marun text-white">
      <div className={`${wadah} py-20 py-lg-28`}>
        <div className="row gx-0 gy-14 gx-lg-16">
          <div className="col-lg-5 position-lg-sticky top-lg-28 align-self-lg-start">
            <JudulBagian
              terang
              label="Sehari di sekolah"
              judul="Seperti apa hari ananda di sini?"
              desc="Rutinitas Senin sampai Jumat, dari gerbang dibuka sampai siswa dijemput."
              className=""
            />
            <Bingkai foto={FOTO.guruMendampingi} paralaks className="mt-10 d-none d-lg-block rasio-16x10" />
          </div>
          <div className="col-lg-7">
            <ol className="position-relative">
              {/* Garis linimasa; garis kuning di atasnya terisi mengikuti gulir (lihat .isi-linimasa) */}
              <span aria-hidden="true" className="garis-linimasa" />
              <span aria-hidden="true" className="isi-linimasa garis-linimasa garis-linimasa--isi" />
              {SEHARI.map((s, i) => (
                <Muncul as="li" key={s.jam} gaya="kanan" jeda={i * 60} className="linimasa-item position-relative py-4">
                  <span className="angka position-relative z-10 d-flex align-items-center justify-content-center align-self-start h-12 h-sm-14 rounded-pill bg-stabilo fs-15 fs-sm-lg fw-extrabold text-tinta">
                    {s.jam}
                  </span>
                  <div className="rounded-4 bg-white bg-opacity-5 p-5 p-sm-6 border border-white border-opacity-10 transisi hover-terang">
                    <h3 className="fs-xl fs-sm-2xl lh-snug">{s.judul}</h3>
                    <p className="mt-1-5 lh-relaxed text-krem">{s.desc}</p>
                  </div>
                </Muncul>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

function Ekstrakurikuler() {
  const berfoto = EKSKUL.filter((e) => ['pramuka', 'robotik', 'futsal', 'melukis'].includes(e.id))
  const lain = EKSKUL.filter((e) => !berfoto.includes(e))
  return (
    <section className="py-20 py-lg-28">
      <div className={wadah}>
        <JudulBagian
          label="Bakat & minat"
          judul={`${EKSKUL.length} ekstrakurikuler setelah jam pelajaran.`}
          desc="Dari robotik sampai tari tradisional. Siswa bebas memilih lewat Portal Siswa selama jadwalnya tidak bentrok."
          aksi={<TautanPanah to="/akademik#ekskul">Jadwal & pembina</TautanPanah>}
        />
        <ul className="d-grid gap-4 kolom-sm-2 kolom-lg-4">
          {berfoto.map((e, i) => (
            <Muncul
              as="li"
              key={e.id}
              gaya="skala"
              jeda={i * 80}
              className="kartu-zoom position-relative isolate d-flex rasio-4x5 flex-column justify-content-end overflow-hidden rounded-kartu p-6 text-white"
            >
              <Foto foto={FOTO_EKSKUL[e.id]} className="paralaks position-absolute inset-0 z-n2" />
              <span aria-hidden="true" className="gradasi-foto gradasi-foto--ringan" />
              {e.wajib && <span className="position-absolute top-5 start-5 rounded-pill bg-stabilo px-3 py-1 fs-xs fw-extrabold text-tinta">Wajib kelas 3–6</span>}
              <h3 className="fs-2xl">{e.nama}</h3>
              <p className="angka mt-1 fs-15 text-white text-opacity-85">
                {e.hari} · {e.jam}
              </p>
            </Muncul>
          ))}
        </ul>
        <Muncul as="ul" gaya="bertahap" className="mt-6 d-flex flex-wrap gap-2-5">
          {lain.map((e) => (
            <li key={e.id} className="d-inline-flex align-items-center gap-2 rounded-pill bg-white px-4 py-2-5 fs-15 border border-garis">
              <span className="fw-bold">{e.nama}</span>
              <span className="angka text-tinta-3">
                {e.hari}, {e.jam}
              </span>
            </li>
          ))}
        </Muncul>
      </div>
    </section>
  )
}

function Prestasi() {
  const [utama, ...lain] = PRESTASI
  return (
    <section className="bg-merah-tua py-20 py-lg-28 text-white">
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
        <div className="row g-6">
          <div className="col-lg-5">
            <Muncul gaya="kiri" className="position-relative isolate d-flex h-100 min-h-96 flex-column overflow-hidden rounded-5 bg-stabilo p-8 p-sm-10 text-tinta">
              <Trophy aria-hidden="true" strokeWidth={1.25} className="piala-latar" />
              <span className="align-self-start rounded-pill bg-tinta px-3-5 py-1-5 fs-sm fw-bold text-stabilo">
                Terbaru · <span className="angka">{utama.tahun}</span>
              </span>
              <p className="mt-8 fs-4xl fs-sm-5xl fw-extrabold lh-105 ls-tight">{utama.judul}</p>
              <p className="mt-4 fs-lg fw-medium">{utama.oleh}</p>
              <p className="mt-auto pt-10 fs-lg fw-bold">Tingkat {utama.tingkat}</p>
            </Muncul>
          </div>
          <div className="col-lg-7">
            <ol className="d-grid gap-3">
              {lain.slice(0, 5).map((p, i) => (
                <Muncul
                  as="li"
                  key={p.judul}
                  gaya="kanan"
                  jeda={i * 70}
                  className="prestasi-item rounded-4 bg-white bg-opacity-7 p-4 p-sm-5 border border-white border-opacity-10"
                >
                  <span className="d-flex align-items-center justify-content-center ukuran-12 rounded-3 bg-white text-merah-700">
                    <Trophy className="ukuran-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="d-block fs-lg fw-bold lh-snug">{p.judul}</span>
                    <span className="d-block fs-15 text-krem">{p.oleh}</span>
                  </span>
                  <span className="prestasi-item__tingkat angka fs-sm fw-semibold text-krem text-sm-end">
                    {p.tingkat} · {p.tahun}
                  </span>
                </Muncul>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

function Testimoni() {
  const [utama, ...lain] = TESTIMONI
  const warna = ['bg-primary text-white', 'bg-stabilo text-tinta', 'bg-tinta text-white']
  return (
    <section className="py-20 py-lg-28">
      <div className={wadah}>
        <JudulBagian label="Kata orang tua" judul="Cerita dari keluarga Harapan Gemilang." />
        <Muncul as="figure" className="testimoni-utama m-0 d-grid overflow-hidden rounded-5 bg-white border border-garis">
          <div className="rasio-16x10 rasio-lg-auto overflow-hidden">
            <Foto foto={FOTO.tawa} className="paralaks" />
          </div>
          <div className="d-flex flex-column justify-content-center p-8 p-sm-12">
            <Quote className="ukuran-10 text-primary isi-penuh" aria-hidden="true" />
            <blockquote className="mt-5 mb-0 fs-2xl fs-sm-2 fw-semibold lh-snug lh-sm-tight ls-tight">{utama.isi}</blockquote>
            <figcaption className="mt-8 d-flex align-items-center gap-4">
              <span aria-hidden="true" className="d-flex align-items-center justify-content-center ukuran-12 rounded-circle bg-primary fw-extrabold text-white">
                {inisial(utama.nama)}
              </span>
              <span>
                <span className="d-block fw-bold">{utama.nama}</span>
                <span className="fs-15 text-tinta-3">{utama.peran}</span>
              </span>
            </figcaption>
          </div>
        </Muncul>
        <div className="mt-4 d-grid gap-4 kolom-md-3">
          {lain.map((t, i) => (
            <Muncul as="figure" key={t.nama} jeda={i * 80} className="m-0 d-flex flex-column rounded-kartu bg-white p-7 border border-garis">
              <blockquote className="mb-0 fs-lg lh-relaxed text-tinta-2">“{t.isi}”</blockquote>
              <figcaption className="mt-auto d-flex align-items-center gap-3 pt-6">
                <span
                  aria-hidden="true"
                  className={`d-flex align-items-center justify-content-center ukuran-11 flex-shrink-0 rounded-circle fs-sm fw-extrabold ${warna[i % warna.length]}`}
                >
                  {inisial(t.nama)}
                </span>
                <span className="fs-15">
                  <span className="d-block fw-bold">{t.nama}</span>
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
    <div className="ponsel mx-auto w-100 mw-sm bg-tinta p-3">
      <div className="ponsel__layar overflow-hidden bg-kertas">
        <div className="bg-primary px-6 pb-6 pt-7 text-white">
          <p className="d-flex align-items-center gap-2 fs-sm text-white text-opacity-85">
            Portal Orang Tua · Hari ini
            {/* Titik "langsung": kabar terbaru terus masuk */}
            <span aria-hidden="true" className="position-relative d-inline-flex ukuran-2">
              <span className="position-absolute d-inline-flex w-100 h-100 rounded-circle bg-white bg-opacity-70 memancar" />
              <span className="position-relative d-inline-flex ukuran-2 rounded-circle bg-white" />
            </span>
          </p>
          <p className="mt-1 fs-2xl fw-extrabold ls-tight">Rafa Aditya</p>
          <p className="fs-sm fw-semibold text-white text-opacity-85">Kelas 4A</p>
        </div>
        <ol className="d-flex flex-column gap-2-5 p-4">
          {/* Kabar masuk satu per satu setelah ponsel terlihat (lihat .notif-masuk) */}
          {CONTOH_HARIAN.map(({ jam, teks, jenis, icon: Icon, warna }, i) => (
            <li key={jam} className="notif-masuk d-flex align-items-center gap-3 rounded-3 bg-white p-3-5 shadow-sm border border-garis" style={{ '--urut': i }}>
              <span className={`d-flex align-items-center justify-content-center ukuran-10 flex-shrink-0 rounded-2 ${warna}`}>
                <Icon className="ukuran-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="d-block fs-xs fw-bold text-uppercase ls-wide text-tinta-3">{jenis}</span>
                <span className="d-block text-truncate fs-15 fw-semibold">{teks}</span>
              </span>
              <span className="angka fs-xs fw-semibold text-tinta-3">{jam}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function PortalSekolah() {
  return (
    <section className="bg-merah-50 py-20 py-lg-28">
      <div className={wadah}>
        <div className="row gx-0 gy-14 gx-lg-14 align-items-center">
          <div className="col-lg-7">
            <JudulBagian
              label="Portal sekolah"
              judul="Orang tua selalu tahu kabar ananda."
              desc="Siswa, orang tua, guru, dan sekolah terhubung dalam satu portal. Semua yang biasanya lewat kertas titipan kini ada di genggaman."
              className="mb-10"
            />
            <Muncul as="ul" gaya="bertahap" className="d-grid gap-3 kolom-sm-2">
              {LAYANAN.map(({ icon: Icon, judul, desc }) => (
                <li key={judul} className="kartu-ikon d-flex gap-4 rounded-4 bg-white p-4 border border-merah-100">
                  <span className="ikon-goyang d-flex align-items-center justify-content-center ukuran-11 flex-shrink-0 rounded-2 bg-primary text-white">
                    <Icon className="ukuran-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="d-block fw-bold">{judul}</span>
                    <span className="mt-0-5 d-block fs-15 lh-snug text-tinta-2">{desc}</span>
                  </span>
                </li>
              ))}
            </Muncul>
            <Link to="/login" className={`${tombol.utama} mt-9`}>
              Masuk ke portal <ArrowRight className="ukuran-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="col-lg-5">
            <Muncul gaya="kanan" jeda={120}>
              <PonselPortal />
            </Muncul>
          </div>
        </div>
      </div>
    </section>
  )
}

function KabarSekolah() {
  const { data } = useData()
  const [utama, ...lain] = [...data.pengumuman].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 3)
  const agenda = agendaMendatang(4)

  return (
    <section className="py-20 py-lg-28">
      <div className={wadah}>
        <JudulBagian label="Kabar sekolah" judul="Berita & agenda terbaru." aksi={<TautanPanah to="/berita">Semua berita</TautanPanah>} />
        <div className="row g-6">
          <div className="col-lg-7">
            {!utama ? (
              <p className="rounded-kartu bg-white p-8 text-tinta-2 border border-garis">Belum ada berita terbaru.</p>
            ) : (
              <Muncul gaya="bertahap" className="d-grid h-100 gap-6 kolom-md-2">
                <Link
                  to={`/berita/${utama.id}`}
                  className="kartu-zoom hover-angkat d-flex flex-column overflow-hidden rounded-kartu bg-white border border-garis rentang-baris-md-2"
                >
                  <div className="berita-utama__foto position-relative rasio-16x11 overflow-hidden">
                    <Foto foto={fotoUntuk(utama)} alt="" className="position-absolute inset-0" />
                  </div>
                  <div className="d-flex flex-column p-6 p-sm-7">
                    <p className="fs-sm">
                      <span className="rounded-pill bg-merah-50 px-3 py-1 fw-bold text-merah-700">{utama.kategori}</span>
                      <span className="angka ms-3 text-tinta-3">{formatTanggal(utama.tanggal)}</span>
                    </p>
                    <h3 className="judul-sorot mt-4 fs-2xl lh-snug">{utama.judul}</h3>
                    <p className="mt-3 clamp-3 lh-relaxed text-tinta-2">{utama.isi}</p>
                  </div>
                </Link>
                {lain.map((p) => (
                  <Link key={p.id} to={`/berita/${p.id}`} className="kartu-zoom hover-angkat d-flex flex-column overflow-hidden rounded-kartu bg-white border border-garis">
                    <div className="rasio-16x8 overflow-hidden">
                      <Foto foto={fotoUntuk(p)} alt="" />
                    </div>
                    <div className="p-5 p-sm-6">
                      <p className="fs-sm">
                        <span className="fw-bold text-merah-700">{p.kategori}</span>
                        <span className="angka ms-2 text-tinta-3">· {formatTanggal(p.tanggal)}</span>
                      </p>
                      <h3 className="judul-sorot mt-2 fs-lg lh-snug">{p.judul}</h3>
                    </div>
                  </Link>
                ))}
              </Muncul>
            )}
          </div>

          <div className="col-lg-5">
            <Muncul gaya="kanan" jeda={120} className="h-100 rounded-kartu bg-tinta p-6 p-sm-8 text-white">
              <div className="d-flex align-items-center justify-content-between gap-4">
                <h3 className="fs-2xl">Agenda</h3>
                <Link to="/akademik#kalender" className="tautan-bawah d-inline-flex align-items-center gap-1 fs-sm fw-bold text-stabilo">
                  Kalender lengkap <ArrowUpRight className="ukuran-4" aria-hidden="true" />
                </Link>
              </div>
              <Muncul as="ul" gaya="bertahap" jeda={300} className="mt-6 d-flex flex-column gap-3">
                {agenda.map((e) => {
                  const tgl = new Date(`${e.mulai}T00:00:00`)
                  return (
                    <li key={e.judul + e.mulai} className="d-flex gap-4 rounded-3 bg-white bg-opacity-7 p-3-5">
                      <span className="d-flex flex-column align-items-center justify-content-center w-14 flex-shrink-0 rounded-2 bg-white py-2 text-center lh-1 text-tinta">
                        <span className="angka d-block fs-2xl fw-extrabold">{tgl.getDate()}</span>
                        <span className="mt-1 d-block fs-2xs fw-bold text-uppercase ls-wider text-merah-700">
                          {tgl.toLocaleDateString('id-ID', { month: 'short' })}
                        </span>
                      </span>
                      <span className="min-w-0 align-self-center">
                        <span className="d-block fw-bold lh-snug">{e.judul}</span>
                        <span className="mt-1 d-flex flex-wrap align-items-center column-gap-2 fs-sm text-white text-opacity-70">
                          <span className="d-inline-flex align-items-center gap-1-5">
                            <span aria-hidden="true" className={`ukuran-2 rounded-circle ${JENIS_AGENDA[e.jenis].dot}`} />
                            {JENIS_AGENDA[e.jenis].label}
                          </span>
                          · {rentangAgenda(e)}
                        </span>
                      </span>
                    </li>
                  )
                })}
              </Muncul>
            </Muncul>
          </div>
        </div>
      </div>
    </section>
  )
}

function MomenSekolah() {
  const momen = [FOTO.upacara, FOTO.kebun, FOTO.merdeka, FOTO.perpustakaan, FOTO.ruangKelas]
  return (
    <section className="pb-20 pb-lg-28">
      <div className={wadah}>
        <div className="mb-8 d-flex flex-wrap align-items-end justify-content-between gap-4">
          <h2 className="fs-3xl fs-sm-4xl">Sudut & momen sekolah</h2>
          <TautanPanah to="/galeri">Buka galeri</TautanPanah>
        </div>
        <div className="momen">
          {/* Bingkai terbuka bergiliran saat masuk layar */}
          <Bingkai foto={momen[0]} jeda={0} className="momen__utama" />
          {momen.slice(1).map((f, i) => (
            <Bingkai key={f.src} foto={f} jeda={(i + 1) * 90} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Ajakan() {
  return (
    <section className={`${wadah} pb-20 pb-lg-28`}>
      <Muncul gaya="skala" className="ajakan d-grid overflow-hidden bg-merah-tua text-white">
        <div className="p-8 p-sm-12 p-lg-16">
          <Label terang>PPDB {PPDB.tahunAjaran}</Label>
          <h2 className="mt-6 fs-4xl fs-sm-6xl lh-105">Pendaftaran tahun ajaran baru sudah dibuka.</h2>
          <p className="mt-5 mw-lg fs-lg text-krem">Kuota terbatas. Daftar lebih awal agar jadwal observasi ananda bisa dipilih lebih leluasa.</p>
          <Muncul as="ol" gaya="bertahap" jeda={250} className="mt-9 d-grid gap-3 kolom-sm-2">
            {PPDB.jadwal.map((j, i) => (
              <li key={j.tahap} className="d-flex gap-3 rounded-3 bg-white bg-opacity-7 p-4 border border-white border-opacity-10">
                <span className="angka d-flex align-items-center justify-content-center ukuran-8 flex-shrink-0 rounded-circle bg-stabilo fs-sm fw-extrabold text-tinta">
                  {i + 1}
                </span>
                <span>
                  <span className="d-block fw-bold lh-snug">{j.tahap}</span>
                  <span className="angka d-block fs-sm text-krem">{j.tanggal}</span>
                </span>
              </li>
            ))}
          </Muncul>
          <div className="mt-10 d-flex flex-wrap gap-3">
            <Link to="/ppdb#daftar" className={tombol.terang}>
              Daftar online sekarang <ArrowRight className="ukuran-4" aria-hidden="true" />
            </Link>
            <TombolHubungi />
          </div>
        </div>
        <div className="position-relative min-h-72 overflow-hidden">
          <Foto foto={FOTO.sahabat} className="paralaks position-absolute inset-0" />
        </div>
      </Muncul>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <PitaBerjalan label="Nilai karakter GEMILANG" isi={KARAKTER.map((k) => k.nama)} className="bg-stabilo text-tinta" bintang="text-primary" />
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
