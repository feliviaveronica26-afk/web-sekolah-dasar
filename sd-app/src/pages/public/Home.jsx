import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  CalendarCheck,
  CalendarDays,
  CalendarHeart,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  MapPinned,
  Medal,
  MessageSquareText,
  Quote,
  Smartphone,
  Sparkles,
  Star,
  Trophy,
  UserPlus,
  Wallet,
} from 'lucide-react'
import { JENIS_AGENDA, agendaMendatang, rentangAgenda } from '../../components/KalenderAkademik'
import { AngkaNaik, Bintang, Coretan, Gelombang, Gumpalan, IlustrasiSekolah, Muncul } from '../../components/Hiasan'
import { Ikon, WARNA_CERIA } from '../../components/Ikon'
import { Avatar, KategoriBadge, SectionTitle, btn } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { EKSKUL, JENJANG, KEUNGGULAN, PPDB, PRESTASI, SEHARI, SEKOLAH, STATISTIK, TESTIMONI } from '../../data/dummy'
import { formatTanggal } from '../../utils/format'

const AKSES_CEPAT = [
  { to: '/ppdb#daftar', icon: UserPlus, judul: 'Daftar PPDB', desc: `Tahun ajaran ${PPDB.tahunAjaran}`, warna: 'bg-primary-600 text-white' },
  { to: '/fasilitas#kunjungan', icon: MapPinned, judul: 'Kunjungi Sekolah', desc: 'Jadwalkan tur kampus', warna: 'bg-amber-400 text-amber-950' },
  { to: '/login', icon: Smartphone, judul: 'Portal Orang Tua', desc: 'Pantau ananda setiap hari', warna: 'bg-sky-500 text-white' },
  { to: '/akademik#kalender', icon: CalendarDays, judul: 'Kalender Akademik', desc: 'Agenda & hari libur', warna: 'bg-emerald-500 text-white' },
]

const LAYANAN = [
  { icon: ClipboardCheck, judul: 'Absensi Digital', desc: 'Kehadiran tercatat tiap pagi dan langsung terlihat oleh orang tua.' },
  { icon: Star, judul: 'Nilai & Poin Sikap', desc: 'Pantau nilai tugas, rapor, dan apresiasi dari guru secara langsung.' },
  { icon: MessageSquareText, judul: 'Pesan Wali Kelas', desc: 'Berkomunikasi dengan wali kelas tanpa harus menyimpan nomor pribadi.' },
  { icon: FileText, judul: 'Izin Online', desc: 'Anak sakit? Ajukan izin dari rumah, tak perlu menitip surat.' },
  { icon: Wallet, judul: 'Bayar SPP Online', desc: 'Lewat QRIS atau Virtual Account, kuitansi otomatis tersimpan.' },
  { icon: BellRing, judul: 'Pengumuman', desc: 'Info ujian, kegiatan, dan agenda sekolah sampai tepat waktu.' },
]

const WARNA_BIDANG = {
  Sains: 'bg-cyan-100 text-cyan-800',
  Akademik: 'bg-sky-100 text-sky-800',
  Seni: 'bg-fuchsia-100 text-fuchsia-800',
  Lingkungan: 'bg-emerald-100 text-emerald-800',
  Olahraga: 'bg-lime-100 text-lime-800',
  Keagamaan: 'bg-teal-100 text-teal-800',
  Bahasa: 'bg-indigo-100 text-indigo-800',
}

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

function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-primary-50 via-white to-white">
      <div className="pola-titik-merah absolute inset-0" />
      <Gumpalan className="absolute -left-32 -top-32 h-[28rem] w-[28rem] text-primary-100/70" />
      <Bintang className="absolute left-[8%] top-[18%] hidden h-6 w-6 animate-melayang text-amber-400 lg:block" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-28 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
        <div>
          <Muncul>
            <p className="inline-flex flex-wrap items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
              <BadgeCheck className="h-4 w-4 text-emerald-500" /> Akreditasi {SEKOLAH.akreditasi}
              <span className="h-1 w-1 rounded-full bg-slate-300" /> Berdiri sejak {SEKOLAH.tahunBerdiri}
            </p>
          </Muncul>
          <Muncul jeda={80}>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] text-slate-900 sm:text-5xl lg:text-6xl">
              Tempat anak tumbuh{' '}
              <span className="relative inline-block text-primary-600">
                cerdas
                <Coretan className="absolute -bottom-2 left-0 h-3 w-full text-amber-400" />
              </span>
              , berkarakter, dan gemilang
            </h1>
          </Muncul>
          <Muncul jeda={160}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              {SEKOLAH.deskripsi} Kelas kecil, guru yang hangat, dan orang tua yang selalu terhubung lewat portal digital.
            </p>
          </Muncul>
          <Muncul jeda={240} className="mt-8 flex flex-wrap gap-3">
            <Link to="/ppdb#daftar" className={`${btn.primary} rounded-full! px-6 py-3.5 text-base! shadow-lg! shadow-primary-600/25`}>
              <Sparkles className="h-5 w-5" /> Daftar PPDB {PPDB.tahunAjaran}
            </Link>
            <Link to="/fasilitas#kunjungan" className={`${btn.secondary} rounded-full! px-6 py-3.5 text-base!`}>
              <CalendarHeart className="h-5 w-5 text-primary-600" /> Jadwalkan Kunjungan
            </Link>
          </Muncul>
          <Muncul jeda={320} className="mt-9 flex items-center gap-4">
            <div className="flex -space-x-2">
              {TESTIMONI.map((t) => (
                <Avatar key={t.nama} nama={t.nama} size="sm" className="ring-2 ring-white" />
              ))}
            </div>
            <div className="text-sm">
              <p className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </p>
              <p className="text-slate-600">
                Dipercaya <span className="font-bold text-slate-900">400+ keluarga</span> di Kota Harapan
              </p>
            </div>
          </Muncul>
        </div>

        <Muncul jeda={200} className="relative mx-auto w-full max-w-lg">
          <Gumpalan className="absolute inset-0 m-auto h-full w-full scale-110 text-amber-100" />
          <IlustrasiSekolah className="relative w-full drop-shadow-xl" />
          <div className="absolute -left-2 top-[18%] flex animate-melayang items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-slate-100 sm:-left-8">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
              <CalendarCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-none text-slate-900">96%</p>
              <p className="text-xs text-slate-500">Kehadiran siswa</p>
            </div>
          </div>
          <div className="absolute -right-2 bottom-[16%] flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-slate-100 [animation-delay:1.5s] animate-melayang sm:-right-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-600">
              <Trophy className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight text-slate-900">Juara 1 Robotik</p>
              <p className="text-xs text-slate-500">Tingkat Kota 2026</p>
            </div>
          </div>
        </Muncul>
      </div>
      <Gelombang warna="text-white" />
    </section>
  )
}

function AksesCepat() {
  return (
    <section className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {AKSES_CEPAT.map(({ to, icon: Icon, judul, desc, warna }, i) => (
          <Muncul key={judul} jeda={i * 70}>
            <Link
              to={to}
              className="group flex h-full flex-col items-start gap-3 rounded-2xl bg-white p-4 shadow-lg shadow-slate-900/5 ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl sm:flex-row sm:items-center sm:p-5"
            >
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition group-hover:rotate-[-6deg] group-hover:scale-110 ${warna}`}>
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="block font-display font-bold text-slate-900">{judul}</span>
                <span className="block text-xs text-slate-500">{desc}</span>
              </span>
            </Link>
          </Muncul>
        ))}
      </div>
    </section>
  )
}

function Statistik() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {STATISTIK.map((s, i) => (
          <Muncul key={s.label} jeda={i * 80} className="text-center">
            <p className={`font-display text-4xl font-bold sm:text-5xl ${['text-primary-600', 'text-amber-500', 'text-sky-500', 'text-emerald-500'][i]}`}>
              <AngkaNaik nilai={s.nilai} />
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{s.label}</p>
          </Muncul>
        ))}
      </div>
    </section>
  )
}

function Sambutan() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Muncul className="grid items-center gap-10 rounded-[2rem] bg-primary-50 p-6 sm:p-10 md:grid-cols-[auto_1fr]">
        <div className="mx-auto text-center">
          <div className="relative">
            <Avatar nama={SEKOLAH.kepalaSekolah} size="xl" className="mx-auto h-32 w-32 bg-white text-4xl text-primary-700 ring-8 ring-white" />
            <Bintang className="absolute -right-1 top-0 h-7 w-7 animate-goyang text-amber-400" />
          </div>
          <p className="mt-4 font-display text-lg font-bold text-slate-900">{SEKOLAH.kepalaSekolah}</p>
          <p className="text-sm text-slate-500">Kepala Sekolah</p>
        </div>
        <div className="relative">
          <Quote className="h-10 w-10 text-primary-200" />
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Sambutan Kepala Sekolah</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-700">{SEKOLAH.sambutan}</p>
          <Link to="/profil" className="mt-5 inline-flex items-center gap-1.5 font-semibold text-primary-600 hover:text-primary-700">
            Kenali sekolah kami <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Muncul>
    </section>
  )
}

function Keunggulan() {
  return (
    <section className="relative bg-slate-50 py-24">
      <Gelombang warna="text-white" atas />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle eyebrow="Mengapa SD Harapan Gemilang" title="Enam alasan orang tua memilih kami" desc="Pendidikan dasar yang menyeimbangkan prestasi akademik, karakter, dan kebahagiaan anak." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {KEUNGGULAN.map((k, i) => {
            const w = WARNA_CERIA[i % WARNA_CERIA.length]
            return (
              <Muncul key={k.judul} jeda={(i % 3) * 90}>
                <div className="group h-full rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl">
                  <span className={`grid h-14 w-14 place-items-center rounded-2xl transition group-hover:rotate-[-8deg] group-hover:scale-110 ${w.ikon}`}>
                    <Ikon nama={k.ikon} className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 text-xl font-bold text-slate-900">{k.judul}</h3>
                  <p className="mt-2 leading-relaxed text-slate-600">{k.desc}</p>
                </div>
              </Muncul>
            )
          })}
        </div>
      </div>
      <Gelombang warna="text-white" />
    </section>
  )
}

function Jenjang() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionTitle eyebrow="Program Belajar" title="Sesuai tahap tumbuh kembang anak" desc="Pilih jenjang sesuai usia ananda untuk melihat fokus pembelajarannya." />
      <div className="grid gap-6 lg:grid-cols-2">
        {JENJANG.map((j, i) => (
          <Muncul key={j.id} jeda={i * 120}>
            <div
              className={`relative h-full overflow-hidden rounded-[2rem] p-8 text-white ${
                i === 0 ? 'bg-linear-to-br from-amber-400 to-orange-500' : 'bg-linear-to-br from-sky-500 to-indigo-600'
              }`}
            >
              <Gumpalan className="absolute -right-16 -top-16 h-64 w-64 text-white/15" />
              <div className="relative">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold">{j.kelas}</span>
                  <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold">{j.usia}</span>
                </div>
                <h3 className="mt-5 text-3xl font-bold">{j.nama}</h3>
                <p className="mt-2 text-lg text-white/90">{j.fokus}</p>
                <ul className="mt-6 space-y-3">
                  {j.poin.map((p) => (
                    <li key={p} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> {p}
                    </li>
                  ))}
                </ul>
                <Link to="/akademik" className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:gap-2.5">
                  Lihat kurikulum <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Muncul>
        ))}
      </div>
    </section>
  )
}

function SehariDiSekolah() {
  return (
    <section className="relative overflow-hidden bg-primary-600 py-24 text-white">
      <Gelombang warna="text-white" atas />
      <div className="pola-titik absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Bintang className="h-3.5 w-3.5 text-amber-300" /> Sehari di sekolah
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Seperti apa hari ananda di sini?</h2>
          <p className="mt-3 text-lg text-primary-100">Rutinitas yang teratur, hangat, dan penuh pengalaman baru.</p>
        </div>
        <ol className="relative grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <span className="absolute left-0 right-0 top-7 hidden h-1 rounded-full bg-white/20 lg:block" aria-hidden="true" />
          {SEHARI.map((s, i) => (
            <Muncul as="li" key={s.jam} jeda={i * 90} className="relative">
              <div className="flex items-center gap-3 lg:flex-col lg:items-start">
                <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-primary-600 shadow-lg">
                  <Ikon nama={s.ikon} className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-amber-300 px-3 py-1 font-display text-sm font-bold text-amber-950">{s.jam}</span>
              </div>
              <h3 className="mt-3 text-lg font-bold">{s.judul}</h3>
              <p className="mt-1 text-sm leading-relaxed text-primary-100">{s.desc}</p>
            </Muncul>
          ))}
        </ol>
      </div>
      <Gelombang warna="text-white" />
    </section>
  )
}

function Prestasi() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <SectionTitle eyebrow="Prestasi Siswa" title="Bangga dengan pencapaian mereka" center={false} rapat />
        <Link to="/profil#prestasi" className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700">
          Semua prestasi <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PRESTASI.slice(0, 4).map((p, i) => (
          <Muncul key={p.judul} jeda={i * 80}>
            <div className="group relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl">
              <Medal className="absolute -right-4 -top-4 h-24 w-24 text-amber-100 transition group-hover:rotate-12" />
              <div className="relative">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${WARNA_BIDANG[p.bidang]}`}>{p.bidang}</span>
                <p className="mt-4 font-display text-xl font-bold leading-snug text-slate-900">{p.judul}</p>
                <p className="mt-1 text-sm font-semibold text-amber-600">
                  Tingkat {p.tingkat} · {p.tahun}
                </p>
                <p className="mt-3 text-sm text-slate-600">{p.oleh}</p>
              </div>
            </div>
          </Muncul>
        ))}
      </div>
    </section>
  )
}

function SekolahDigital() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionTitle
            eyebrow="Sekolah Digital"
            title="Orang tua selalu tahu kabar ananda"
            desc="Bukan sekadar website. Siswa, orang tua, guru, dan sekolah terhubung dalam satu sistem."
            center={false}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {LAYANAN.map(({ icon: Icon, judul, desc }, i) => (
              <Muncul key={judul} jeda={(i % 2) * 80} className="flex gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${WARNA_CERIA[i % WARNA_CERIA.length].ikon}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-slate-900">{judul}</p>
                  <p className="text-sm text-slate-600">{desc}</p>
                </div>
              </Muncul>
            ))}
          </div>
          <Link to="/login" className={`${btn.primary} mt-8 rounded-full! px-6 py-3`}>
            Masuk ke Portal <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Pratinjau aplikasi orang tua */}
        <Muncul jeda={150} className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-6 rotate-6 rounded-[2.5rem] bg-primary-200/50" />
          <div className="relative rounded-[2.5rem] border-8 border-slate-900 bg-white p-5 shadow-2xl">
            <div className="mx-auto -mt-2 mb-4 h-1.5 w-16 rounded-full bg-slate-200" />
            <div className="flex items-center gap-3">
              <Avatar nama="Rafa Aditya" />
              <div>
                <p className="text-xs text-slate-500">Portal Orang Tua</p>
                <p className="font-bold text-slate-900">Rafa Aditya · 4A</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                ['95%', 'Hadir', 'bg-emerald-50 text-emerald-700'],
                ['86,8', 'Nilai', 'bg-sky-50 text-sky-700'],
                ['+6', 'Poin', 'bg-amber-50 text-amber-700'],
              ].map(([n, l, c]) => (
                <div key={l} className={`rounded-2xl py-3 ${c}`}>
                  <p className="font-display text-xl font-bold">{n}</p>
                  <p className="text-[11px] font-semibold">{l}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {[
                ['✅', 'Hadir hari ini pukul 06.52'],
                ['🤝', 'Apresiasi: Membantu teman'],
                ['💬', 'Pesan baru dari wali kelas'],
              ].map(([e, t]) => (
                <div key={t} className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                  <span>{e}</span> {t}
                </div>
              ))}
            </div>
          </div>
        </Muncul>
      </div>
    </section>
  )
}

function Testimoni() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionTitle eyebrow="Kata Orang Tua" title="Cerita dari keluarga kami" />
      <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4">
        {TESTIMONI.map((t, i) => (
          <Muncul key={t.nama} jeda={i * 80} className="w-[85%] shrink-0 snap-center md:w-auto">
            <figure className={`flex h-full flex-col rounded-3xl p-6 ring-1 ${WARNA_CERIA[i].bg} ${WARNA_CERIA[i].ring}`}>
              <p className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }, (_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" />
                ))}
              </p>
              <blockquote className="mt-4 flex-1 leading-relaxed text-slate-700">“{t.isi}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <Avatar nama={t.nama} size="sm" />
                <span>
                  <span className="block text-sm font-bold text-slate-900">{t.nama}</span>
                  <span className="block text-xs text-slate-500">{t.peran}</span>
                </span>
              </figcaption>
            </figure>
          </Muncul>
        ))}
      </div>
    </section>
  )
}

function KabarSekolah() {
  const { data } = useData()
  const berita = [...data.pengumuman].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 3)
  const agenda = agendaMendatang(4)

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionTitle eyebrow="Kabar Sekolah" title="Berita & agenda terbaru" center={false} rapat />
          <Link to="/berita" className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700">
            Semua berita <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="grid gap-5 sm:grid-cols-2">
            {berita.map((p, i) => (
              <Muncul key={p.id} jeda={i * 80} className={i === 0 ? 'sm:col-span-2' : ''}>
                <Link
                  to={`/berita/${p.id}`}
                  className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between gap-2">
                    <KategoriBadge kategori={p.kategori} />
                    <span className="text-xs text-slate-500">{formatTanggal(p.tanggal)}</span>
                  </div>
                  <h3 className={`mt-4 font-bold leading-snug text-slate-900 group-hover:text-primary-700 ${i === 0 ? 'text-2xl' : 'text-lg'}`}>{p.judul}</h3>
                  <p className={`mt-2 text-sm text-slate-600 ${i === 0 ? 'line-clamp-3' : 'line-clamp-2'}`}>{p.isi}</p>
                  <span className="mt-auto pt-4 text-sm font-semibold text-primary-600">Baca selengkapnya →</span>
                </Link>
              </Muncul>
            ))}
          </div>

          <Muncul jeda={120} className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <CalendarDays className="h-5 w-5 text-primary-600" /> Agenda
              </h3>
              <Link to="/akademik#kalender" className="text-sm font-semibold text-primary-600">
                Kalender
              </Link>
            </div>
            <ul className="mt-5 space-y-3">
              {agenda.map((e) => {
                const tgl = new Date(`${e.mulai}T00:00:00`)
                return (
                  <li key={e.judul + e.mulai} className="flex gap-4">
                    <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-center ${JENIS_AGENDA[e.jenis].soft}`}>
                      <span className="leading-none">
                        <span className="block font-display text-xl font-bold">{tgl.getDate()}</span>
                        <span className="text-[10px] font-bold uppercase">{tgl.toLocaleDateString('id-ID', { month: 'short' })}</span>
                      </span>
                    </span>
                    <span className="min-w-0 pt-1">
                      <span className="block text-sm font-bold leading-snug text-slate-900">{e.judul}</span>
                      <span className="block text-xs text-slate-500">{rentangAgenda(e)}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </Muncul>
        </div>
      </div>
    </section>
  )
}

function Ekstrakurikuler() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionTitle eyebrow="Bakat & Minat" title={`${EKSKUL.length} ekstrakurikuler pilihan`} desc="Dari robotik sampai tari tradisional — setiap anak punya panggungnya." />
      <div className="flex flex-wrap justify-center gap-3">
        {EKSKUL.map((e, i) => (
          <Muncul key={e.id} jeda={i * 40}>
            <Link
              to="/akademik#ekskul"
              className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold transition hover:-translate-y-0.5 hover:shadow-md ${e.warna}`}
            >
              <Ikon nama={e.ikon} className="h-5 w-5" /> {e.nama}
            </Link>
          </Muncul>
        ))}
      </div>
    </section>
  )
}

function Ajakan() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <Muncul className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-primary-600 to-primary-800 px-6 py-14 text-center text-white sm:px-12">
        <div className="pola-titik absolute inset-0" />
        <Gumpalan className="absolute -right-16 -top-20 h-72 w-72 text-white/10" />
        <Bintang className="absolute left-10 top-10 h-8 w-8 animate-goyang text-amber-300" />
        <Bintang className="absolute bottom-10 right-1/4 h-5 w-5 text-white/50" />
        <h2 className="relative text-3xl font-bold sm:text-4xl">Bergabung bersama keluarga besar SD Harapan Gemilang</h2>
        <p className="relative mx-auto mt-3 max-w-xl text-lg text-primary-50">
          Pendaftaran peserta didik baru tahun ajaran {PPDB.tahunAjaran} sudah dibuka. Kuota terbatas!
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/ppdb#daftar" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-primary-700 shadow-lg transition hover:bg-primary-50">
            <Sparkles className="h-5 w-5" /> Daftar Online Sekarang
          </Link>
          <TombolHubungi />
        </div>
      </Muncul>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <AksesCepat />
      <Statistik />
      <Sambutan />
      <Keunggulan />
      <Jenjang />
      <SehariDiSekolah />
      <Prestasi />
      <SekolahDigital />
      <Testimoni />
      <KabarSekolah />
      <Ekstrakurikuler />
      <Ajakan />
    </>
  )
}
