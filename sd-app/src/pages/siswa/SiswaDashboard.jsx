import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CalendarCheck, CalendarDays, ClipboardList, Coffee, Megaphone, Sparkles, Star, Tent, TrendingUp } from 'lucide-react'
import { Bintang, Gumpalan } from '../../components/Hiasan'
import { Ikon } from '../../components/Ikon'
import { IsiPresensiOtp } from '../../components/PresensiOtp'
import { JENIS_AGENDA, agendaMendatang, rentangAgenda } from '../../components/KalenderAkademik'
import { Avatar, Badge, Card, JudulKartu, KategoriBadge, Progres, StatCard } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { ringkasAbsensi, useData } from '../../context/DataContext'
import { ISTIRAHAT, MAPEL, SESI } from '../../data/dummy'
import { formatHari, formatTanggal, todayKey } from '../../utils/format'
import { rekapNilai } from '../../utils/nilai'
import { ekskulSiswa, lencanaSiswa, levelSiswa, ringkasSikap, streakHadir } from '../../utils/prestasi'
import { infoTenggat, jadwalBerikutnya } from './helpers'

const KATA_MUTIARA = [
  'Belajar itu seperti menanam pohon: sedikit demi sedikit, lama-lama menjadi rindang. 🌳',
  'Tidak apa-apa salah, yang penting terus mencoba! 💪',
  'Membaca 10 menit setiap hari membuatmu makin pintar. 📚',
  'Bantu temanmu hari ini, kebaikan akan kembali padamu. 🤝',
  'Bertanya bukan tanda tidak tahu, tapi tanda ingin tahu. 🙋',
  'Hari ini adalah kesempatan baru untuk menjadi lebih baik. ☀️',
  'Jaga kebersihan kelas, karena kelas bersih bikin belajar nyaman. 🌱',
]

const menit = (jam) => {
  const [h, m] = jam.split('.').map(Number)
  return h * 60 + m
}

export default function SiswaDashboard() {
  const { user } = useAuth()
  const { data } = useData()
  const siswa = data.siswa.find((s) => s.nis === user.nis) ?? { nis: user.nis, nama: user.nama, kelas: user.kelas }

  const tanggalTerakhir = Object.keys(data.absensi).sort().reverse().slice(0, 20)
  const kehadiran = ringkasAbsensi(data.absensi, user.nis, tanggalTerakhir)
  const selesai = data.tugasSelesai[user.nis] ?? []
  const tugasKelas = data.tugas.filter((t) => t.kelas === user.kelas)
  const tugasAktif = tugasKelas.filter((t) => !selesai.includes(t.id)).sort((a, b) => a.tenggat.localeCompare(b.tenggat))
  const jadwal = jadwalBerikutnya(user.kelas)
  const agenda = agendaMendatang(3)
  const pengumuman = [...data.pengumuman].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 2)
  const nilai = rekapNilai(data, siswa)
  const sikap = ringkasSikap(data, user.nis)
  const level = levelSiswa(data, siswa)
  const streak = streakHadir(data.absensi, user.nis)
  const lencana = lencanaSiswa(data, siswa)
  const didapat = lencana.filter((l) => l.didapat)
  const berikutnya = lencana.filter((l) => !l.didapat).sort((a, b) => b.progres - a.progres)[0]
  const ekskul = ekskulSiswa(data, siswa)
  const namaDepan = user.nama.split(' ')[0]
  const mutiara = KATA_MUTIARA[new Date().getDate() % KATA_MUTIARA.length]

  // Pelajaran yang sedang berlangsung (hanya jika jadwal yang tampil adalah hari ini)
  const sekarang = new Date().getHours() * 60 + new Date().getMinutes()
  const sesiAktif = jadwal?.tanggal === todayKey() ? SESI.findIndex((s) => sekarang >= menit(s.mulai) && sekarang < menit(s.selesai)) : -1

  return (
    <>
      {/* Sapaan & level */}
      <div className="relative mb-6 overflow-hidden rounded-[2rem] bg-linear-to-br from-primary-600 via-primary-600 to-orange-500 p-6 text-white sm:p-8">
        <div className="pola-titik absolute inset-0" />
        <Gumpalan className="absolute -right-16 -top-20 h-72 w-72 text-white/10" />
        <Bintang className="absolute right-[38%] top-6 hidden h-6 w-6 animate-melayang text-amber-300 sm:block" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-center gap-4">
            <Avatar nama={user.nama} size="lg" className="bg-white text-primary-700 ring-4 ring-white/30" />
            <div>
              <p className="text-sm font-semibold text-primary-100">
                Kelas {user.kelas} · NIS {user.nis}
              </p>
              <h1 className="text-3xl font-bold sm:text-4xl">Halo, {namaDepan}! 👋</h1>
              <p className="mt-1 max-w-lg text-primary-50">{mutiara}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/15 p-4 ring-1 ring-white/20 backdrop-blur lg:w-72">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-bold">
                Level {level.level} · {level.gelar}
              </p>
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-amber-300 transition-all duration-700" style={{ width: `${level.progres * 100}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-primary-100">
              {level.xp} XP · {level.sisa} XP lagi ke level {level.level + 1}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-white/20 px-3 py-1 font-semibold">🔥 {streak} hari hadir</span>
              <span className="rounded-full bg-white/20 px-3 py-1 font-semibold">⭐ {Math.max(0, sikap.total)} poin</span>
            </div>
          </div>
        </div>
      </div>

      <IsiPresensiOtp className="mb-6" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Kehadiranku" value={`${kehadiran.persen}%`} hint="20 hari sekolah terakhir" tone="emerald" />
        <StatCard icon={ClipboardList} label="Tugas belum selesai" value={tugasAktif.length} hint={`dari ${tugasKelas.length} tugas`} tone="amber" />
        <StatCard icon={TrendingUp} label="Rata-rata nilai" value={nilai.rataRata ?? '–'} hint="semester ini" tone="sky" />
        <StatCard icon={Star} label="Lencana" value={`${didapat.length}/${lencana.length}`} hint="sudah didapat" tone="primary" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Jadwal */}
        <Card className="min-w-0 p-6 lg:col-span-2">
          <JudulKartu icon={BookOpen} judul={`Jadwal ${jadwal?.label ?? ''}`}>
            <Link to="/dashboard/siswa/jadwal" className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Lengkap <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          {jadwal ? (
            <>
              <p className="-mt-2 text-sm text-slate-500">{formatHari(jadwal.tanggal)}</p>
              <ol className="mt-4 space-y-2">
                {jadwal.sesi.map((kode, i) => (
                  <li key={kode + i}>
                    <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${i === sesiAktif ? 'bg-primary-50 ring-2 ring-primary-300' : 'bg-slate-50'}`}>
                      <span className="w-12 shrink-0 text-xs font-semibold text-slate-500">{SESI[i].mulai}</span>
                      <span className={`rounded-lg px-2.5 py-1 text-sm font-semibold ${MAPEL[kode].warna}`}>{MAPEL[kode].nama}</span>
                      {i === sesiAktif && <span className="ml-auto animate-pulse text-xs font-bold text-primary-600">● Sekarang</span>}
                    </div>
                    {i + 1 === ISTIRAHAT.setelahSesi && (
                      <p className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400">
                        <Coffee className="h-3.5 w-3.5" /> Istirahat {ISTIRAHAT.mulai} – {ISTIRAHAT.selesai}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className="text-sm text-slate-500">Belum ada jadwal.</p>
          )}
        </Card>

        {/* Tugas */}
        <Card className="min-w-0 p-6 lg:col-span-3">
          <JudulKartu icon={ClipboardList} judul="Tugas yang harus dikerjakan">
            <Link to="/dashboard/siswa/tugas" className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          <div className="mb-4 flex items-center gap-3 text-sm">
            <Progres nilai={tugasKelas.length ? ((tugasKelas.length - tugasAktif.length) / tugasKelas.length) * 100 : 0} warna="bg-emerald-500" className="flex-1" />
            <span className="font-semibold text-slate-600">
              {tugasKelas.length - tugasAktif.length}/{tugasKelas.length} selesai
            </span>
          </div>
          {tugasAktif.length === 0 ? (
            <p className="rounded-xl bg-emerald-50 px-4 py-6 text-center text-sm font-semibold text-emerald-700">Tidak ada tugas. Waktunya bermain! 🎉</p>
          ) : (
            <div className="space-y-2">
              {tugasAktif.slice(0, 4).map((t) => {
                const tenggat = infoTenggat(t.tenggat)
                return (
                  <Link
                    to="/dashboard/siswa/tugas"
                    key={t.id}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-slate-100 px-4 py-3 transition hover:border-primary-200 hover:bg-primary-50/40 sm:flex-nowrap"
                  >
                    <span className={`rounded-lg px-2 py-1 text-xs font-bold ${MAPEL[t.mapel].warna}`}>{MAPEL[t.mapel].nama}</span>
                    <Badge className={`${tenggat.cls} sm:order-last`}>{tenggat.teks}</Badge>
                    <p className="w-full text-sm font-semibold text-slate-800 sm:w-auto sm:flex-1 sm:truncate">{t.judul}</p>
                  </Link>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Lencana */}
        <Card className="p-6">
          <JudulKartu icon={Star} judul="Lencanaku">
            <Link to="/dashboard/siswa/lencana" className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          <div className="flex flex-wrap gap-2">
            {didapat.map((l) => (
              <span key={l.kode} title={l.nama} className={`grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br text-2xl shadow-sm ${l.warna}`}>
                {l.emoji}
              </span>
            ))}
            {didapat.length === 0 && <p className="text-sm text-slate-500">Belum ada lencana. Ayo kumpulkan!</p>}
          </div>
          {berikutnya && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Lencana berikutnya</p>
              <p className="mt-1 font-bold text-slate-900">
                {berikutnya.emoji} {berikutnya.nama}
              </p>
              <p className="text-xs text-slate-500">{berikutnya.syarat}</p>
              <Progres nilai={berikutnya.progres * 100} warna="bg-amber-400" className="mt-2" />
              <p className="mt-1 text-xs font-semibold text-slate-600">{berikutnya.teks}</p>
            </div>
          )}
        </Card>

        {/* Ekskul */}
        <Card className="p-6">
          <JudulKartu icon={Tent} judul="Ekskul minggu ini">
            <Link to="/dashboard/siswa/ekskul" className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Atur <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          {ekskul.length === 0 ? (
            <p className="text-sm text-slate-500">Kamu belum ikut ekskul. Yuk pilih satu!</p>
          ) : (
            <ul className="space-y-2">
              {ekskul.map((e) => (
                <li key={e.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${e.warna}`}>
                    <Ikon nama={e.ikon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-800">{e.nama}</span>
                    <span className="block text-xs text-slate-500">
                      {e.hari} · {e.jam}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Agenda */}
        <Card className="p-6">
          <JudulKartu icon={CalendarDays} judul="Agenda sekolah">
            <Link to="/dashboard/siswa/kalender" className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Kalender <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          <ul className="space-y-2">
            {agenda.map((e) => (
              <li key={e.judul + e.mulai} className={`rounded-xl px-4 py-3 ${JENIS_AGENDA[e.jenis].soft}`}>
                <p className="text-sm font-bold">{e.judul}</p>
                <p className="text-xs opacity-80">{rentangAgenda(e)}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <JudulKartu icon={Megaphone} judul="Pengumuman" />
        <div className="grid gap-4 md:grid-cols-2">
          {pengumuman.map((p) => (
            <div key={p.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <KategoriBadge kategori={p.kategori} />
                <span className="text-xs text-slate-500">{formatTanggal(p.tanggal)}</span>
              </div>
              <p className="mt-2 font-semibold text-slate-800">{p.judul}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{p.isi}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
