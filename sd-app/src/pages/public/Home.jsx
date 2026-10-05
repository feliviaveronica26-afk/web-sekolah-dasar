import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BellRing,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Megaphone,
  Quote,
  Smartphone,
  Sparkles,
} from 'lucide-react'
import { Avatar, KategoriBadge, SectionTitle } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { EKSKUL, PPDB, SEKOLAH, STATISTIK } from '../../data/dummy'
import { formatTanggal } from '../../utils/format'

const LAYANAN = [
  {
    icon: Smartphone,
    judul: 'Portal Orang Tua',
    desc: 'Pantau kehadiran, jadwal, dan perkembangan anak langsung dari HP, kapan saja.',
  },
  {
    icon: ClipboardCheck,
    judul: 'Absensi Digital',
    desc: 'Guru mencatat kehadiran setiap pagi dan orang tua langsung dapat melihatnya.',
  },
  {
    icon: FileText,
    judul: 'Izin Online',
    desc: 'Anak sakit? Ajukan izin dari rumah tanpa perlu menitipkan surat ke sekolah.',
  },
  {
    icon: BellRing,
    judul: 'Pengumuman Terkini',
    desc: 'Info ujian, kegiatan, dan agenda sekolah tersampaikan cepat dan tepat.',
  },
]

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
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-white/70 px-6 py-3 font-bold transition duration-300 hover:border-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600 active:scale-95 ${
        riak ? 'scale-105 border-white text-primary-700 shadow-lg shadow-primary-900/30' : 'text-white'
      }`}
    >
      {riak && (
        <span
          className="animasi-riak pointer-events-none absolute rounded-full bg-white"
          style={{ left: riak.x, top: riak.y, width: riak.ukuran, height: riak.ukuran }}
        />
      )}
      <span className="relative">Hubungi Kami</span>
      <ArrowRight
        className={`relative h-4 w-4 transition-all duration-300 ${
          riak ? 'translate-x-1 opacity-100' : '-ml-6 -translate-x-2 opacity-0 group-hover:ml-0 group-hover:translate-x-0 group-hover:opacity-100'
        }`}
      />
    </Link>
  )
}

export default function Home() {
  const { data } = useData()
  const pengumuman = [...data.pengumuman].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 3)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-600 text-white">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-primary-500/60" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-28 pt-14 sm:px-6 md:grid-cols-2 md:pt-20">
          <div>
            <Link
              to="/ppdb#daftar"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold ring-1 ring-white/30 transition hover:bg-white/25"
            >
              <Sparkles className="h-4 w-4" /> PPDB {PPDB.tahunAjaran} telah dibuka · Daftar online
              <ArrowRight className="h-4 w-4" />
            </Link>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Tumbuh <span className="underline decoration-white/40 decoration-4 underline-offset-8">Cerdas</span>, Berkarakter,
              dan Gemilang
            </h1>
            <p className="mt-5 max-w-lg text-lg text-primary-50">{SEKOLAH.deskripsi}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/ppdb"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-primary-700 shadow-lg transition hover:bg-primary-50"
              >
                Info Pendaftaran <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-white ring-2 ring-white/60 transition hover:bg-white/10"
              >
                Portal Orang Tua
              </Link>
            </div>
          </div>

          {/* Pratinjau portal orang tua */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-4 rotate-3 rounded-3xl bg-white/10" />
            <div className="relative rounded-3xl bg-white p-5 text-slate-800 shadow-2xl">
              <div className="flex items-center gap-3">
                <Avatar nama="Rafa Aditya" />
                <div>
                  <p className="text-xs text-slate-500">Portal Orang Tua</p>
                  <p className="font-bold">Rafa Aditya · Kelas 4A</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3">
                  <CalendarCheck className="h-5 w-5 text-emerald-600" />
                  <p className="mt-2 text-2xl font-extrabold text-emerald-700">95%</p>
                  <p className="text-xs text-emerald-700">Kehadiran</p>
                </div>
                <div className="rounded-2xl bg-primary-50 p-3">
                  <Megaphone className="h-5 w-5 text-primary-600" />
                  <p className="mt-2 text-2xl font-extrabold text-primary-700">3</p>
                  <p className="text-xs text-primary-700">Info baru</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {['Hadir hari ini pukul 06.52', 'Izin tanggal 28 Sep disetujui'].map((t) => (
                  <div key={t} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full text-white" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d="M0,48 C360,96 1080,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </section>

      {/* Statistik */}
      <section className="relative z-10 mx-auto -mt-10 max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-xl sm:p-6 md:grid-cols-4">
          {STATISTIK.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-primary-600">{s.nilai}</p>
              <p className="mt-1 text-sm font-medium text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sambutan */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-[auto_1fr]">
          <div className="mx-auto text-center">
            <Avatar nama={SEKOLAH.kepalaSekolah} size="xl" className="mx-auto ring-8 ring-primary-50" />
            <p className="mt-4 font-bold text-slate-900">{SEKOLAH.kepalaSekolah}</p>
            <p className="text-sm text-slate-500">Kepala Sekolah</p>
          </div>
          <div className="relative rounded-3xl bg-primary-50 p-8">
            <Quote className="absolute -top-4 left-8 h-9 w-9 rounded-full bg-primary-600 p-2 text-white" />
            <h2 className="text-2xl font-extrabold text-slate-900">Sambutan Kepala Sekolah</h2>
            <p className="mt-3 leading-relaxed text-slate-700">{SEKOLAH.sambutan}</p>
          </div>
        </div>
      </section>

      {/* Layanan digital */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle
            eyebrow="Sekolah Digital"
            title="Lebih dekat dengan orang tua"
            desc="Bukan sekadar website. Orang tua, guru, dan sekolah terhubung dalam satu sistem."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LAYANAN.map(({ icon: Icon, judul, desc }) => (
              <div key={judul} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-600 text-white transition group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-bold text-slate-900">{judul}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Berita terbaru */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-primary-600">Kabar Sekolah</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Berita & Pengumuman</h2>
          </div>
          <Link to="/berita" className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700">
            Lihat semua <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {pengumuman.map((p) => (
            <Link
              key={p.id}
              to={`/berita/${p.id}`}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-primary-200 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-2">
                <KategoriBadge kategori={p.kategori} />
                <span className="text-xs text-slate-500">{formatTanggal(p.tanggal)}</span>
              </div>
              <h3 className="mt-4 font-bold leading-snug text-slate-900">{p.judul}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-slate-600">{p.isi}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Ekstrakurikuler */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle eyebrow="Bakat & Minat" title="Ekstrakurikuler" desc="Beragam kegiatan untuk mengasah potensi setiap anak." />
          <div className="flex flex-wrap justify-center gap-3">
            {EKSKUL.map((e) => (
              <span key={e} className="rounded-full border border-primary-200 bg-white px-5 py-2.5 font-semibold text-primary-700 shadow-sm">
                {e}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary-600 px-6 py-12 text-center text-white sm:px-12">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
          <h2 className="relative text-2xl font-extrabold sm:text-3xl">Bergabung bersama keluarga besar SD Harapan Gemilang</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-primary-50">
            Pendaftaran peserta didik baru tahun ajaran {PPDB.tahunAjaran}. Kuota terbatas!
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/ppdb#daftar" className="rounded-xl bg-white px-6 py-3 font-bold text-primary-700 hover:bg-primary-50">
              Daftar Online Sekarang
            </Link>
            <TombolHubungi />
          </div>
        </div>
      </section>
    </>
  )
}
