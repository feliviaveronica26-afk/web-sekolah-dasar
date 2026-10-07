import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpenCheck,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  FileCheck,
  FileClock,
  GraduationCap,
  HeartHandshake,
  RotateCcw,
  Timer,
  TrendingUp,
  UserPlus,
  Users,
  UserX,
  Wallet,
  Wrench,
} from 'lucide-react'
import { GrafikBatang, GrafikGaris } from '../../components/Grafik'
import { Gumpalan } from '../../components/Hiasan'
import { JENIS_AGENDA, agendaMendatang, rentangAgenda } from '../../components/KalenderAkademik'
import { STATUS_PPDB } from '../../components/Ppdb'
import { KartuPresensiSaya, RingkasanPresensi } from '../../components/Presensi'
import { Alert, Avatar, Badge, Card, JudulKartu, KategoriBadge, Modal, Progres, StatCard, Tabs, btn } from '../../components/ui'
import { PERAN, useAkses } from '../../context/akses'
import { useData } from '../../context/DataContext'
import { KKTP, PPDB } from '../../data/dummy'
import { formatHari, formatTanggal, isHariSekolah, jamSekarang, todayKey } from '../../utils/format'
import { rekapNilai } from '../../utils/nilai'
import { JAM_KERJA } from '../../data/dummy'
import { ringkasPresensi } from '../../utils/presensi'
import { kehadiranPerKelas, kehadiranSekolah, ringkasSpp } from '../../utils/ringkasan'
import { bulanIni, namaBulan, rupiah } from '../../utils/spp'

const BASE = '/dashboard/kepsek'

// Persentase siswa hadir per hari sekolah (urut dari yang terlama)
function trenKehadiran(data) {
  return Object.keys(data.absensi)
    .sort()
    .slice(-20)
    .map((tgl) => {
      const catatan = Object.values(data.absensi[tgl] ?? {})
      const hadir = catatan.filter((s) => s === 'H').length
      return { label: formatTanggal(tgl, { year: undefined, month: 'short' }), nilai: catatan.length ? Math.round((hadir / catatan.length) * 100) : 0 }
    })
}

export default function KepsekDashboard() {
  const { data, resetData } = useData()
  const { nama, guruId } = useAkses()
  const [konfirmasi, setKonfirmasi] = useState(false)
  const [direset, setDireset] = useState(false)
  const [grafik, setGrafik] = useState('nilai')

  const hariIni = todayKey()
  const perKelas = kehadiranPerKelas(data)
  const spp = ringkasSpp(data)
  const persenLunas = Math.round((spp.lunasBulanIni / data.siswa.length) * 100)
  const pengumuman = [...data.pengumuman].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 3)
  const tren = trenKehadiran(data)
  const rekap = data.siswa.map((s) => ({ s, r: rekapNilai(data, s) }))
  const rataSekolah = rekap.length ? Math.round((rekap.reduce((a, x) => a + (x.r.rataRata ?? 0), 0) / rekap.length) * 10) / 10 : null
  const nilaiPerKelas = [...new Set(data.siswa.map((s) => s.kelas))].sort().map((k) => {
    const daftar = rekap.filter((x) => x.s.kelas === k).map((x) => x.r.rataRata ?? 0)
    return { label: `Kelas ${k}`, nilai: Math.round((daftar.reduce((a, b) => a + b, 0) / daftar.length) * 10) / 10 }
  })
  const belumTuntas = rekap.filter((x) => x.r.daftar.some((d) => d.akhir !== null && d.akhir < KKTP)).length
  const presensi = ringkasPresensi(data)
  // Staf yang belum absen baru dihitung setelah jam masuk lewat
  const belumAbsen = isHariSekolah(new Date()) && jamSekarang() > JAM_KERJA.umum.masuk ? presensi.belum : 0

  // Hal-hal yang perlu perhatian kepala sekolah, dikumpulkan dari seluruh modul
  const perhatian = [
    { ikon: FileClock, jumlah: data.izinStaf.filter((i) => i.status === 'Menunggu').length, teks: 'izin guru/staf menunggu persetujuan', ke: `${BASE}/presensi` },
    { ikon: UserX, jumlah: belumAbsen, teks: 'guru/staf belum absen masuk hari ini', ke: `${BASE}/presensi` },
    { ikon: Timer, jumlah: presensi.terlambat, teks: 'guru/staf terlambat hari ini', ke: `${BASE}/presensi` },
    { ikon: UserPlus, jumlah: data.pendaftar.filter((p) => p.status === 'Menunggu Verifikasi').length, teks: 'pendaftar PPDB menunggu verifikasi', ke: `${BASE}/ppdb` },
    { ikon: Wrench, jumlah: data.kerusakan.filter((k) => k.status !== 'Selesai' && k.prioritas === 'Tinggi').length, teks: 'kerusakan prioritas tinggi belum selesai', ke: `${BASE}/kerusakan` },
    { ikon: HeartHandshake, jumlah: data.konseling.filter((k) => k.status === 'Perlu Pemantauan').length, teks: 'kasus BK perlu pemantauan', ke: `${BASE}/konseling` },
    { ikon: BookOpenCheck, jumlah: belumTuntas, teks: 'siswa punya nilai di bawah KKTP', ke: `${BASE}/rapor` },
    { ikon: Wallet, jumlah: spp.menunggak, teks: 'siswa menunggak SPP', ke: `${BASE}/spp` },
    { ikon: FileCheck, jumlah: data.izin.filter((i) => i.status === 'Menunggu').length, teks: 'izin siswa belum diproses wali kelas', ke: `${BASE}/kehadiran` },
    { ikon: CalendarCheck, jumlah: data.kunjungan.filter((k) => k.status === 'Menunggu').length, teks: 'permintaan kunjungan sekolah', ke: `${BASE}/kunjungan` },
  ].filter((p) => p.jumlah > 0)

  const kuotaPpdb = PPDB.jalur.reduce((a, j) => a + j.kuota, 0)
  const statusPpdb = Object.keys(STATUS_PPDB).map((st) => ({ st, n: data.pendaftar.filter((p) => p.status === st).length }))

  return (
    <>
      <div className="relative mb-6 overflow-hidden rounded-[2rem] bg-linear-to-br from-slate-800 via-slate-900 to-primary-900 p-6 text-white sm:p-8">
        <div className="pola-titik absolute inset-0" />
        <Gumpalan className="absolute -right-20 -top-24 h-80 w-80 text-primary-500/20" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar nama={nama} size="lg" className="bg-white text-primary-700 ring-4 ring-white/20" />
            <div>
              <p className="text-sm text-slate-300">{formatHari(hariIni)}</p>
              <h1 className="text-3xl font-bold">Selamat datang, {nama.split(' ')[0]}</h1>
              <p className="text-slate-300">Gambaran menyeluruh kondisi sekolah hari ini.</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 px-5 py-3 ring-1 ring-white/15">
            <p className="text-xs text-slate-300">Hal yang perlu perhatian</p>
            <p className="text-3xl font-extrabold">{perhatian.reduce((a, p) => a + p.jumlah, 0)}</p>
          </div>
        </div>
      </div>

      {direset && (
        <div className="mb-4">
          <Alert>Data demo berhasil dikembalikan ke kondisi awal.</Alert>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total siswa" value={data.siswa.length} hint={`${perKelas.length} kelas terdata`} tone="sky" />
        <StatCard icon={CalendarCheck} label="Kehadiran siswa" value={`${kehadiranSekolah(data)}%`} hint="rata-rata 20 hari" tone="emerald" />
        <StatCard icon={TrendingUp} label="Rata-rata nilai" value={rataSekolah ?? '–'} hint={`${belumTuntas} siswa belum tuntas`} tone="amber" />
        <StatCard icon={Wallet} label={`SPP ${namaBulan(bulanIni(), { month: 'long' })}`} value={rupiah(spp.terkumpul)} hint={`${persenLunas}% siswa lunas`} tone="primary" />
      </div>

      <div className={`mt-6 grid gap-6 ${guruId ? 'xl:grid-cols-[1.5fr_1fr]' : ''}`}>
        {guruId && <KartuPresensiSaya tautan />}
        <RingkasanPresensi />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-6">
          <JudulKartu icon={CalendarCheck} judul="Tren kehadiran harian">
            <Link to={`${BASE}/kehadiran`} className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Detail <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          <p className="-mt-2 mb-3 text-sm text-slate-500">Persentase siswa hadir, 20 hari sekolah terakhir</p>
          <GrafikGaris judul="Persentase kehadiran siswa per hari" data={tren} min={Math.min(70, Math.floor(Math.min(...tren.map((t) => t.nilai)) / 10) * 10)} maks={100} satuan="%" tinggi={260} />
        </Card>

        <Card className="p-6">
          <JudulKartu icon={ClipboardCheck} judul="Perlu perhatian" />
          {perhatian.length === 0 ? (
            <p className="rounded-xl bg-emerald-50 px-4 py-6 text-center text-sm font-semibold text-emerald-700">Semua terkendali. 🎉</p>
          ) : (
            <ul className="space-y-2">
              {perhatian.map(({ ikon: Icon, jumlah, teks, ke }) => (
                <li key={teks}>
                  <Link to={ke} className="group flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 transition hover:bg-amber-50">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-amber-600 shadow-sm">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-sm text-slate-700">
                      <span className="font-bold text-slate-900">{jumlah}</span> {teks}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <JudulKartu icon={grafik === 'nilai' ? TrendingUp : CalendarCheck} judul="Perbandingan antarkelas">
            <Tabs
              value={grafik}
              onChange={setGrafik}
              items={[
                ['nilai', 'Nilai'],
                ['hadir', 'Kehadiran'],
              ]}
            />
          </JudulKartu>
          {grafik === 'nilai' ? (
            <GrafikBatang judul="Rata-rata nilai per kelas" data={nilaiPerKelas} acuan={{ nilai: KKTP, label: 'KKTP' }} />
          ) : (
            <GrafikBatang judul="Kehadiran per kelas" data={perKelas.map((k) => ({ label: `Kelas ${k.kelas}`, nilai: k.persen, ket: `${k.jumlah} siswa` }))} acuan={{ nilai: 90, label: 'target 90%' }} satuan="%" />
          )}
        </Card>

        <Card className="p-6">
          <JudulKartu icon={Wallet} judul="Keuangan SPP">
            <Link to={`${BASE}/spp`} className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Detail <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          <p className="text-sm text-slate-500">Pembayaran bulan {namaBulan(bulanIni())}</p>
          <div className="mt-2 flex items-end justify-between">
            <p className="text-3xl font-extrabold text-slate-900">{persenLunas}%</p>
            <p className="text-sm text-slate-500">
              {spp.lunasBulanIni} dari {data.siswa.length} siswa lunas
            </p>
          </div>
          <Progres nilai={persenLunas} warna="bg-emerald-500" tinggi="h-3" className="mt-2" />
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

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <JudulKartu icon={UserPlus} judul={`PPDB ${PPDB.tahunAjaran}`}>
            <Link to={`${BASE}/ppdb`} className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Kelola <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          <p className="text-sm text-slate-500">
            {data.pendaftar.length} pendaftar · kuota {kuotaPpdb} kursi
          </p>
          <Progres nilai={(data.pendaftar.length / kuotaPpdb) * 100} warna="bg-primary-500" className="mt-2" />
          <ul className="mt-4 space-y-2">
            {statusPpdb.map(({ st, n }) => (
              <li key={st} className="flex items-center justify-between text-sm">
                <Badge className={STATUS_PPDB[st].cls}>{st}</Badge>
                <span className="font-bold text-slate-800">{n}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <JudulKartu icon={CalendarDays} judul="Agenda terdekat">
            <Link to={`${BASE}/kalender`} className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Kalender <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          <ul className="space-y-2">
            {agendaMendatang(4).map((e) => (
              <li key={e.judul + e.mulai} className={`rounded-xl px-4 py-3 ${JENIS_AGENDA[e.jenis].soft}`}>
                <p className="text-sm font-bold">{e.judul}</p>
                <p className="text-xs opacity-80">{rentangAgenda(e)}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <JudulKartu judul="Pengumuman terbaru">
            <Link to={`${BASE}/pengumuman`} className="flex items-center gap-1 text-sm font-semibold text-primary-600">
              Kelola <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          <div className="divide-y divide-slate-100">
            {pengumuman.map((p) => (
              <div key={p.id} className="py-3 first:pt-0">
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
        <JudulKartu icon={GraduationCap} judul="Tim sekolah & jabatan">
          <Link to={`${BASE}/guru`} className="flex items-center gap-1 text-sm font-semibold text-primary-600">
            Atur <ArrowRight className="h-4 w-4" />
          </Link>
        </JudulKartu>
        <ul className="grid gap-x-8 gap-y-3 md:grid-cols-2">
          {Object.entries(PERAN).map(([kode, p]) => {
            const orang = data.guru.filter((g) => g.peran?.includes(kode))
            return (
              <li key={kode} className="flex flex-wrap items-start gap-2 text-sm">
                <span className="w-44 shrink-0 font-semibold text-slate-700">{p.label}</span>
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

      <Card className="mt-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-slate-900">Reset Data Demo</h2>
          <p className="mt-1 text-sm text-slate-500">Data saat ini tersimpan di browser (localStorage). Kembalikan ke data contoh awal jika diperlukan.</p>
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
          Semua perubahan (siswa, guru, nilai, tugas, poin sikap, pesan, absensi, izin, presensi staf, SPP, perpustakaan) akan dikembalikan ke data contoh awal.
        </p>
      </Modal>
    </>
  )
}
