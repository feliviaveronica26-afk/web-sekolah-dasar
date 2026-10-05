import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck, GraduationCap, RotateCcw, Users, Wallet } from 'lucide-react'
import { Alert, Badge, Card, DashHeader, KategoriBadge, Modal, StatCard, btn } from '../../components/ui'
import { PERAN } from '../../context/akses'
import { useData } from '../../context/DataContext'
import { formatTanggal } from '../../utils/format'
import { kehadiranPerKelas, kehadiranSekolah, ringkasSpp } from '../../utils/ringkasan'
import { bulanIni, namaBulan, rupiah } from '../../utils/spp'

const BASE = '/dashboard/kepsek'

export default function KepsekDashboard() {
  const { data, resetData } = useData()
  const [konfirmasi, setKonfirmasi] = useState(false)
  const [direset, setDireset] = useState(false)

  const perKelas = kehadiranPerKelas(data)
  const spp = ringkasSpp(data)
  const persenLunas = Math.round((spp.lunasBulanIni / data.siswa.length) * 100)
  const pengumuman = [...data.pengumuman].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 3)

  return (
    <>
      <DashHeader title="Dashboard Kepala Sekolah" desc="Gambaran menyeluruh kondisi sekolah hari ini." />

      {direset && (
        <div className="mb-4">
          <Alert>Data demo berhasil dikembalikan ke kondisi awal.</Alert>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Siswa" value={data.siswa.length} hint={`${perKelas.length} kelas terdata`} tone="sky" />
        <StatCard icon={GraduationCap} label="Guru & Staf" value={data.guru.length} tone="emerald" />
        <StatCard icon={CalendarCheck} label="Kehadiran Siswa" value={`${kehadiranSekolah(data)}%`} hint="20 hari terakhir" tone="amber" />
        <StatCard icon={Wallet} label={`SPP ${namaBulan(bulanIni(), { month: 'long' })}`} value={rupiah(spp.terkumpul)} hint="terkumpul" tone="primary" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Kehadiran per Kelas</h2>
            <Link to={`${BASE}/kehadiran`} className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Detail <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {perKelas.map((k) => (
              <div key={k.kelas}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">
                    Kelas {k.kelas} <span className="font-normal text-slate-400">· {k.jumlah} siswa</span>
                  </span>
                  <span className="font-bold text-slate-900">{k.persen}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary-500" style={{ width: `${k.persen}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Keuangan SPP</h2>
            <Link to={`${BASE}/spp`} className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Detail <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">Pembayaran bulan {namaBulan(bulanIni())}</p>
          <div className="mt-2 flex items-end justify-between">
            <p className="text-3xl font-extrabold text-slate-900">{persenLunas}%</p>
            <p className="text-sm text-slate-500">
              {spp.lunasBulanIni} dari {data.siswa.length} siswa lunas
            </p>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${persenLunas}%` }} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-rose-50 p-4">
              <p className="text-xs text-rose-700">Siswa menunggak</p>
              <p className="text-xl font-extrabold text-rose-700">{spp.menunggak}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-xs text-amber-800">Total tunggakan</p>
              <p className="text-xl font-extrabold text-amber-800">{rupiah(spp.totalTunggakan)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Tim Sekolah & Jabatan</h2>
            <Link to={`${BASE}/guru`} className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Atur <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {Object.entries(PERAN).map(([kode, p]) => {
              const orang = data.guru.filter((g) => g.peran?.includes(kode))
              return (
                <li key={kode} className="flex flex-wrap items-start gap-2 text-sm">
                  <span className="w-40 shrink-0 font-semibold text-slate-700">{p.label}</span>
                  <span className="flex flex-1 flex-wrap gap-1">
                    {orang.length ? (
                      orang.map((g) => (
                        <Badge key={g.id} className="bg-slate-100 text-slate-700">
                          {g.nama.split(',')[0]}
                          {kode === 'wali_kelas' && ` (${g.kelas})`}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-slate-400">Belum ada</span>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Pengumuman Terbaru</h2>
            <Link to={`${BASE}/pengumuman`} className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Kelola <ArrowRight className="h-4 w-4" />
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

      <Card className="mt-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-slate-900">Reset Data Demo</h2>
          <p className="mt-1 text-sm text-slate-500">
            Data saat ini tersimpan di browser (localStorage). Kembalikan ke data contoh awal jika diperlukan.
          </p>
        </div>
        <button onClick={() => setKonfirmasi(true)} className={btn.secondary}>
          <RotateCcw className="h-4 w-4" /> Reset Data
        </button>
      </Card>

      <Modal
        open={konfirmasi}
        onClose={() => setKonfirmasi(false)}
        title="Reset semua data?"
        size="max-w-md"
        footer={
          <>
            <button onClick={() => setKonfirmasi(false)} className={btn.secondary}>
              Batal
            </button>
            <button
              onClick={() => {
                resetData()
                setKonfirmasi(false)
                setDireset(true)
              }}
              className={`${btn.primary} bg-rose-600 hover:bg-rose-700`}
            >
              Ya, reset
            </button>
          </>
        }
      >
        <p className="text-slate-600">
          Semua perubahan (siswa, guru, pengumuman, absensi, izin, SPP, perpustakaan) akan dikembalikan ke data contoh awal.
        </p>
      </Modal>
    </>
  )
}
