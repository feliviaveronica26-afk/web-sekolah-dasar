import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  FileText,
  Megaphone,
  MessagesSquare,
  Star,
  TrendingUp,
  UserX,
  Wallet,
} from 'lucide-react'
import { Gumpalan } from '../../components/Hiasan'
import { Avatar, Badge, Card, EmptyState, IzinBadge, JudulKartu, KategoriBadge, STATUS_ABSEN, StatCard, btn } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { ringkasAbsensi, useData } from '../../context/DataContext'
import { JADWAL, MAPEL, SESI, SPP } from '../../data/dummy'
import { formatTanggal, namaHari, todayKey } from '../../utils/format'
import { predikat, rekapNilai } from '../../utils/nilai'
import { ringkasSikap } from '../../utils/prestasi'
import { bulanWajibBayar, daftarBulan, rupiah } from '../../utils/spp'
import { RiwayatSikap } from '../siswa/SiswaLencana'

export default function OrtuDashboard() {
  const { user } = useAuth()
  const { data } = useData()
  const anak = data.siswa.find((s) => s.nis === user.anakNis)

  if (!anak) return <EmptyState icon={UserX} title="Data anak tidak ditemukan" desc="Silakan hubungi admin sekolah." />

  const hariIni = todayKey()
  const waliKelas = data.guru.find((g) => g.peran?.includes('wali_kelas') && g.kelas === anak.kelas)
  const tagihanSpp = bulanWajibBayar(data, anak.nis)
  const tanggalTerakhir = Object.keys(data.absensi).sort().reverse().slice(0, 20)
  const ringkas = ringkasAbsensi(data.absensi, anak.nis, tanggalTerakhir)
  const statusHariIni = data.absensi[hariIni]?.[anak.nis]
  const hari = namaHari(hariIni)
  const jadwalHariIni = JADWAL[anak.kelas]?.[hari]
  const pengumuman = [...data.pengumuman].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 3)
  const izinTerakhir = data.izin.filter((i) => i.nis === anak.nis).slice(0, 2)
  const nilai = rekapNilai(data, anak)
  const sikap = ringkasSikap(data, anak.nis)
  const tugasAktif = data.tugas.filter((t) => t.kelas === anak.kelas && t.tenggat >= hariIni && !(data.tugasSelesai[anak.nis] ?? []).includes(t.id))
  const pesanBaru = data.pesan.filter((p) => p.nis === anak.nis && !p.dibacaOrtu)
  const pesanTerakhir = [...data.pesan].filter((p) => p.nis === anak.nis).sort((a, b) => b.waktu.localeCompare(a.waktu))[0]
  const panggilan = anak.nama.split(' ')[0]

  return (
    <>
      {/* Profil ananda */}
      <div className="relative mb-6 overflow-hidden rounded-[2rem] bg-linear-to-br from-primary-600 to-primary-800 p-6 text-white sm:p-8">
        <div className="pola-titik absolute inset-0" />
        <Gumpalan className="absolute -right-20 -top-24 h-80 w-80 text-white/10" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-4">
            <Avatar nama={anak.nama} size="xl" className="bg-white text-primary-700 ring-4 ring-white/30" />
            <div>
              <p className="text-sm text-primary-100">Halo, {user.nama.split(' ').slice(0, 2).join(' ')} 👋</p>
              <h1 className="text-3xl font-bold">{anak.nama}</h1>
              <p className="text-primary-50">
                Kelas {anak.kelas} · NIS {anak.nis}
              </p>
              {waliKelas && <p className="mt-1 text-sm text-primary-100">Wali kelas: {waliKelas.nama}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[30rem]">
            <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
              <p className="text-xs text-primary-100">Hari ini</p>
              <p className="mt-1 font-bold">{statusHariIni ? STATUS_ABSEN[statusHariIni].label : 'Belum diabsen'}</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
              <p className="text-xs text-primary-100">SPP</p>
              <p className="mt-1 font-bold">{tagihanSpp.length ? `${tagihanSpp.length} bulan` : 'Lunas ✓'}</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
              <p className="text-xs text-primary-100">Tugas aktif</p>
              <p className="mt-1 font-bold">{tugasAktif.length} tugas</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
              <p className="text-xs text-primary-100">Pesan baru</p>
              <p className="mt-1 font-bold">{pesanBaru.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pengingat SPP */}
      {tagihanSpp.length > 0 ? (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center">
          <Wallet className="h-7 w-7 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="font-bold text-amber-900">Tagihan SPP {rupiah(tagihanSpp.length * SPP.nominal)}</p>
            <p className="text-sm text-amber-800">{daftarBulan(tagihanSpp)} · bisa dibayar lewat QRIS atau Virtual Account</p>
          </div>
          <Link to="/dashboard/ortu/spp" className={btn.primary}>
            Bayar SPP
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Kehadiran" value={`${ringkas.persen}%`} hint={`S ${ringkas.S} · I ${ringkas.I} · A ${ringkas.A} (20 hari)`} tone="emerald" />
        <StatCard icon={TrendingUp} label="Rata-rata nilai" value={nilai.rataRata ?? '–'} hint={predikat(nilai.rataRata).label} tone="sky" />
        <StatCard icon={Award} label="Poin sikap" value={sikap.total > 0 ? `+${sikap.total}` : sikap.total} hint={`${sikap.positif} apresiasi`} tone="amber" />
        <StatCard icon={Star} label="Mapel tuntas" value={`${nilai.tuntas}/${nilai.daftar.length}`} hint="KKTP 75" tone="primary" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Pesan wali kelas */}
        <Card className="p-6">
          <JudulKartu icon={MessagesSquare} judul="Pesan wali kelas">
            {pesanBaru.length > 0 && <Badge className="bg-amber-100 text-amber-800">{pesanBaru.length} baru</Badge>}
          </JudulKartu>
          {pesanTerakhir ? (
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">{pesanTerakhir.dari === 'guru' ? pesanTerakhir.pengirim : 'Anda'}</p>
              <p className="mt-1 line-clamp-3 text-sm text-slate-700">{pesanTerakhir.isi}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Belum ada pesan.</p>
          )}
          <Link to="/dashboard/ortu/pesan" className={`${btn.secondary} mt-4 w-full`}>
            Buka percakapan <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        {/* Apresiasi terbaru */}
        <Card className="p-6 lg:col-span-2">
          <JudulKartu icon={Award} judul={`Apresiasi terbaru untuk ${panggilan}`}>
            <Link to="/dashboard/ortu/sikap" className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          <RiwayatSikap nis={anak.nis} batas={3} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <JudulKartu icon={BookOpen} judul="Jadwal hari ini" />
          <p className="-mt-2 text-sm text-slate-500">{hari}</p>
          {jadwalHariIni ? (
            <ol className="mt-4 space-y-2">
              {jadwalHariIni.map((m, i) => (
                <li key={m + i} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm">
                  <span className="w-11 shrink-0 text-xs font-semibold text-slate-500">{SESI[i]?.mulai}</span>
                  <span className={`rounded-lg px-2 py-0.5 text-xs font-bold ${MAPEL[m]?.warna}`}>{MAPEL[m]?.nama ?? m}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-6 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Tidak ada jadwal pelajaran hari ini. Selamat berlibur! 🎉</p>
          )}
        </Card>

        <Card className="p-6">
          <JudulKartu icon={Clock3} judul="Tugas yang akan datang">
            <Link to="/dashboard/ortu/tugas" className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          {tugasAktif.length === 0 ? (
            <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-5 w-5" /> Semua tugas sudah dikerjakan.
            </p>
          ) : (
            <ul className="space-y-2">
              {tugasAktif.slice(0, 4).map((t) => (
                <li key={t.id} className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <p className="text-sm font-semibold text-slate-800">{t.judul}</p>
                  <p className="text-xs text-slate-500">
                    {MAPEL[t.mapel].nama} · dikumpulkan {formatTanggal(t.tenggat, { year: undefined })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <JudulKartu icon={FileText} judul="Izin terakhir">
            <Link to="/dashboard/ortu/izin" className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Ajukan <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          {izinTerakhir.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada pengajuan izin.</p>
          ) : (
            <div className="space-y-2">
              {izinTerakhir.map((i) => (
                <div key={i.id} className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {i.jenis} · {formatTanggal(i.tanggalMulai, { year: undefined })}
                    </p>
                    <IzinBadge status={i.status} />
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{i.alasan}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <JudulKartu icon={Megaphone} judul="Pengumuman terbaru">
          <Link to="/dashboard/ortu/pengumuman" className="flex items-center gap-1 text-sm font-semibold text-primary-600">
            Semua <ArrowRight className="h-4 w-4" />
          </Link>
        </JudulKartu>
        <div className="grid gap-4 md:grid-cols-3">
          {pengumuman.map((p) => (
            <div key={p.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <KategoriBadge kategori={p.kategori} />
                <span className="text-xs text-slate-500">{formatTanggal(p.tanggal)}</span>
              </div>
              <p className="mt-2 font-semibold text-slate-800">{p.judul}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
