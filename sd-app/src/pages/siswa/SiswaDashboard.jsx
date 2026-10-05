import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CalendarCheck, CalendarDays, ClipboardList, Coffee, Megaphone } from 'lucide-react'
import { Badge, Card, KategoriBadge, StatCard } from '../../components/ui'
import { JENIS_AGENDA, agendaMendatang, rentangAgenda } from '../../components/KalenderAkademik'
import { useAuth } from '../../context/AuthContext'
import { ringkasAbsensi, useData } from '../../context/DataContext'
import { ISTIRAHAT, MAPEL, SESI, TUGAS } from '../../data/dummy'
import { formatHari, formatTanggal } from '../../utils/format'
import { infoTenggat, jadwalBerikutnya } from './helpers'

export default function SiswaDashboard() {
  const { user } = useAuth()
  const { data } = useData()

  const tanggalTerakhir = Object.keys(data.absensi).sort().reverse().slice(0, 20)
  const kehadiran = ringkasAbsensi(data.absensi, user.nis, tanggalTerakhir)
  const selesai = data.tugasSelesai[user.nis] ?? []
  const tugasAktif = TUGAS.filter((t) => t.kelas === user.kelas && !selesai.includes(t.id)).sort((a, b) =>
    a.tenggat.localeCompare(b.tenggat),
  )
  const jadwal = jadwalBerikutnya(user.kelas)
  const agenda = agendaMendatang(4)
  const pengumuman = [...data.pengumuman].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 2)
  const namaDepan = user.nama.split(' ')[0]

  return (
    <>
      {/* Sapaan */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-linear-to-br from-primary-600 to-primary-500 p-6 text-white sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 right-24 h-32 w-32 rounded-full bg-white/10" />
        <p className="relative text-sm font-semibold text-primary-100">Kelas {user.kelas} · NIS {user.nis}</p>
        <h1 className="relative mt-1 text-3xl font-extrabold">Halo, {namaDepan}! 👋</h1>
        <p className="relative mt-2 max-w-lg text-primary-50">
          {tugasAktif.length > 0
            ? `Kamu punya ${tugasAktif.length} tugas yang belum selesai. Semangat belajarnya ya!`
            : 'Semua tugasmu sudah selesai. Hebat sekali! 🌟'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon={CalendarCheck} label="Kehadiranku" value={`${kehadiran.persen}%`} hint="20 hari sekolah terakhir" tone="emerald" />
        <StatCard icon={ClipboardList} label="Tugas Belum Selesai" value={tugasAktif.length} tone="amber" />
        <div className="col-span-2 lg:col-span-1">
          <StatCard icon={CalendarDays} label="Agenda Terdekat" value={agenda[0] ? formatTanggal(agenda[0].mulai, { year: undefined }) : '–'} hint={agenda[0]?.judul} tone="sky" />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Jadwal */}
        <Card className="min-w-0 p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary-600" />
              <h2 className="font-bold text-slate-900">Jadwal {jadwal?.label}</h2>
            </div>
            <Link to="/dashboard/siswa/jadwal" className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Lengkap <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {jadwal && (
            <>
              <p className="mt-1 text-sm text-slate-500">{formatHari(jadwal.tanggal)}</p>
              <ol className="mt-4 space-y-2">
                {jadwal.sesi.map((kode, i) => (
                  <li key={kode + i}>
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                      <span className="w-12 shrink-0 text-xs font-semibold text-slate-500">{SESI[i].mulai}</span>
                      <span className={`rounded-lg px-2.5 py-1 text-sm font-semibold ${MAPEL[kode].warna}`}>{MAPEL[kode].nama}</span>
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
          )}
        </Card>

        {/* Tugas */}
        <Card className="min-w-0 p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary-600" />
              <h2 className="font-bold text-slate-900">Tugas yang Harus Dikerjakan</h2>
            </div>
            <Link to="/dashboard/siswa/tugas" className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {tugasAktif.length === 0 ? (
            <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-6 text-center text-sm font-semibold text-emerald-700">Tidak ada tugas. Waktunya bermain! 🎉</p>
          ) : (
            <div className="mt-4 space-y-2">
              {tugasAktif.slice(0, 4).map((t) => {
                const tenggat = infoTenggat(t.tenggat)
                return (
                  <div key={t.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-slate-100 px-4 py-3 sm:flex-nowrap">
                    <span className={`rounded-lg px-2 py-1 text-xs font-bold ${MAPEL[t.mapel].warna}`}>{MAPEL[t.mapel].nama}</span>
                    <Badge className={`${tenggat.cls} sm:order-last`}>{tenggat.teks}</Badge>
                    <p className="w-full text-sm font-semibold text-slate-800 sm:w-auto sm:flex-1 sm:truncate">{t.judul}</p>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary-600" />
              <h2 className="font-bold text-slate-900">Agenda Sekolah</h2>
            </div>
            <Link to="/dashboard/siswa/kalender" className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Kalender <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-4 space-y-2">
            {agenda.map((e) => (
              <li key={e.judul + e.mulai} className={`rounded-xl px-4 py-3 ${JENIS_AGENDA[e.jenis].soft}`}>
                <p className="text-sm font-bold">{e.judul}</p>
                <p className="text-xs opacity-80">{rentangAgenda(e)}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary-600" />
            <h2 className="font-bold text-slate-900">Pengumuman</h2>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {pengumuman.map((p) => (
              <div key={p.id} className="py-3">
                <div className="flex items-center gap-2">
                  <KategoriBadge kategori={p.kategori} />
                  <span className="text-xs text-slate-500">{formatTanggal(p.tanggal)}</span>
                </div>
                <p className="mt-1.5 font-semibold text-slate-800">{p.judul}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{p.isi}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
