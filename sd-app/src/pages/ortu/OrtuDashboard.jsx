import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CalendarCheck, FileText, HeartPulse, Megaphone, UserX, Wallet } from 'lucide-react'
import { Avatar, Card, DashHeader, EmptyState, IzinBadge, KategoriBadge, StatCard, btn } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { ringkasAbsensi, useData } from '../../context/DataContext'
import { JADWAL, MAPEL, SPP } from '../../data/dummy'
import { formatTanggal, namaHari, todayKey } from '../../utils/format'
import { bulanWajibBayar, daftarBulan, rupiah } from '../../utils/spp'

export default function OrtuDashboard() {
  const { user } = useAuth()
  const { data } = useData()
  const anak = data.siswa.find((s) => s.nis === user.anakNis)

  if (!anak) return <EmptyState icon={UserX} title="Data anak tidak ditemukan" desc="Silakan hubungi admin sekolah." />

  const waliKelas = data.guru.find((g) => g.peran?.includes('wali_kelas') && g.kelas === anak.kelas)
  const tagihanSpp = bulanWajibBayar(data, anak.nis)
  const tanggalTerakhir = Object.keys(data.absensi).sort().reverse().slice(0, 20)
  const ringkas = ringkasAbsensi(data.absensi, anak.nis, tanggalTerakhir)
  const hari = namaHari(todayKey())
  const jadwalHariIni = JADWAL[anak.kelas]?.[hari]
  const pengumuman = [...data.pengumuman].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 3)
  const izinTerakhir = data.izin.filter((i) => i.nis === anak.nis).slice(0, 3)

  return (
    <>
      <DashHeader
        title={`Halo, ${user.nama.split(' ').slice(0, 2).join(' ')} 👋`}
        desc="Berikut ringkasan perkembangan ananda di sekolah."
        action={
          <Link to="/dashboard/ortu/izin" className={btn.primary}>
            <FileText className="h-4 w-4" /> Ajukan Izin
          </Link>
        }
      />

      {/* Profil anak */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-col gap-5 bg-linear-to-r from-primary-600 to-primary-500 p-6 text-white sm:flex-row sm:items-center">
          <Avatar nama={anak.nama} size="lg" className="bg-white text-primary-700" />
          <div className="flex-1">
            <p className="text-sm text-primary-100">Data Ananda</p>
            <p className="text-xl font-extrabold">{anak.nama}</p>
            <p className="text-sm text-primary-50">
              Kelas {anak.kelas} · NIS {anak.nis}
            </p>
          </div>
          {waliKelas && (
            <div className="rounded-2xl bg-white/15 px-4 py-3 text-sm">
              <p className="text-primary-100">Wali Kelas</p>
              <p className="font-bold">{waliKelas.nama}</p>
            </div>
          )}
        </div>
      </Card>

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
      ) : (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          <Wallet className="h-5 w-5 shrink-0" /> SPP bulan ini sudah lunas. Terima kasih!
          <Link to="/dashboard/ortu/spp" className="ml-auto font-semibold underline">
            Riwayat
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Kehadiran" value={`${ringkas.persen}%`} hint="20 hari sekolah terakhir" tone="emerald" />
        <StatCard icon={HeartPulse} label="Sakit" value={ringkas.S} hint="hari" tone="amber" />
        <StatCard icon={FileText} label="Izin" value={ringkas.I} hint="hari" tone="sky" />
        <StatCard icon={UserX} label="Tanpa Keterangan" value={ringkas.A} hint="hari" tone="primary" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary-600" />
            <h2 className="font-bold text-slate-900">Jadwal Hari Ini</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">{hari}</p>
          {jadwalHariIni ? (
            <ol className="mt-4 space-y-2">
              {jadwalHariIni.map((m, i) => (
                <li key={m + i} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">{i + 1}</span>
                  <span className="font-medium text-slate-700">{MAPEL[m]?.nama ?? m}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-6 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              Tidak ada jadwal pelajaran hari ini. Selamat berlibur! 🎉
            </p>
          )}
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary-600" />
              <h2 className="font-bold text-slate-900">Pengumuman Terbaru</h2>
            </div>
            <Link to="/dashboard/ortu/pengumuman" className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {pengumuman.map((p) => (
              <div key={p.id} className="py-3">
                <div className="flex items-center gap-2">
                  <KategoriBadge kategori={p.kategori} />
                  <span className="text-xs text-slate-500">{formatTanggal(p.tanggal)}</span>
                </div>
                <p className="mt-1.5 font-semibold text-slate-800">{p.judul}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Status Pengajuan Izin</h2>
          <Link to="/dashboard/ortu/izin" className="flex items-center gap-1 text-sm font-semibold text-primary-600">
            Riwayat <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {izinTerakhir.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Belum ada pengajuan izin.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {izinTerakhir.map((i) => (
              <div key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {i.jenis} · {formatTanggal(i.tanggalMulai)}
                    {i.tanggalSelesai !== i.tanggalMulai && ` – ${formatTanggal(i.tanggalSelesai)}`}
                  </p>
                  <p className="text-xs text-slate-500">{i.alasan}</p>
                </div>
                <IzinBadge status={i.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}
