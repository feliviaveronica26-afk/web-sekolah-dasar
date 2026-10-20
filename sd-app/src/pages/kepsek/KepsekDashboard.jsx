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
  HouseHeart,
  Timer,
  TrendingUp,
  UserPlus,
  Users,
  UserX,
  Wallet,
  Wrench,
} from 'lucide-react'
import { GrafikBatang, GrafikGaris } from '../../components/Grafik'
import { KartuKas } from '../../components/Keuangan'
import { Gumpalan } from '../../components/Hiasan'
import { JENIS_AGENDA, agendaMendatang, rentangAgenda } from '../../components/KalenderAkademik'
import { STATUS_PPDB } from '../../components/Ppdb'
import { KartuPresensiSaya, RingkasanPresensi } from '../../components/Presensi'
import { Avatar, Badge, Card, JudulKartu, KategoriBadge, Progres, StatCard, Tabs } from '../../components/ui'
import { PERAN, useAkses } from '../../context/akses'
import { useData } from '../../context/DataContext'
import { KKTP, PPDB } from '../../data/dummy'
import { formatHari, formatTanggal, isHariSekolah, jamSekarang, todayKey } from '../../utils/format'
import { rekapNilai } from '../../utils/nilai'
import { JAM_KERJA } from '../../data/dummy'
import { ringkasPresensi } from '../../utils/presensi'
import { kehadiranPerKelas, kehadiranSekolah, ringkasSpp, siswaBaru, siswaTanpaKeluarga } from '../../utils/ringkasan'
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
  const { data } = useData()
  const { nama, guruId } = useAkses()
  const [grafik, setGrafik] = useState('nilai')

  const hariIni = todayKey()
  const perKelas = kehadiranPerKelas(data)
  const spp = ringkasSpp(data)
  const persenLunas = Math.round((spp.lunasBulanIni / data.siswa.length) * 100)
  const pengumuman = [...data.pengumuman].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 3)
  const tren = trenKehadiran(data)
  const rekap = data.siswa.map((s) => ({ s, r: rekapNilai(data, s) }))
  // Siswa yang belum punya nilai (mis. siswa baru) tidak ikut dirata-rata
  const rata1 = (daftar) => (daftar.length ? Math.round((daftar.reduce((a, b) => a + b, 0) / daftar.length) * 10) / 10 : null)
  const adaNilai = rekap.filter((x) => x.r.rataRata !== null)
  const rataSekolah = rata1(adaNilai.map((x) => x.r.rataRata))
  const nilaiPerKelas = [...new Set(data.siswa.map((s) => s.kelas))].sort().map((k) => ({
    label: `Kelas ${k}`,
    nilai: rata1(adaNilai.filter((x) => x.s.kelas === k).map((x) => x.r.rataRata)) ?? 0,
  }))
  const baru = siswaBaru(data)
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
    { ikon: HouseHeart, jumlah: siswaTanpaKeluarga(data).length, teks: 'siswa baru belum terhubung data orang tua', ke: `${BASE}/ortu` },
    { ikon: FileCheck, jumlah: data.izin.filter((i) => i.status === 'Menunggu').length, teks: 'izin siswa belum diproses wali kelas', ke: `${BASE}/kehadiran` },
    { ikon: CalendarCheck, jumlah: data.kunjungan.filter((k) => k.status === 'Menunggu').length, teks: 'permintaan kunjungan sekolah', ke: `${BASE}/kunjungan` },
  ].filter((p) => p.jumlah > 0)

  const kuotaPpdb = PPDB.jalur.reduce((a, j) => a + j.kuota, 0)
  const statusPpdb = Object.keys(STATUS_PPDB).map((st) => ({ st, n: data.pendaftar.filter((p) => p.status === st).length }))

  return (
    <>
      <div className="position-relative mb-6 overflow-hidden rounded-5 gradasi-gelap p-6 text-white p-sm-8">
        <div className="pola-titik position-absolute inset-0" />
        <Gumpalan className="putar-lambat position-absolute end-n20 top-n24 h-80 w-80 text-primary text-opacity-20" />
        <div className="position-relative d-flex flex-column gap-5 flex-sm-row align-items-sm-center justify-content-sm-between">
          <div className="d-flex align-items-center gap-4">
            <Avatar nama={nama} size="lg" className="bg-white text-merah-700 cincin-putih-tebal-20" />
            <div>
              <p className="fs-sm text-abu-300">{formatHari(hariIni)}</p>
              <h1 className="fs-3xl fw-bold">Selamat datang, {nama.split(' ')[0]}</h1>
              <p className="text-abu-300">Gambaran menyeluruh kondisi sekolah hari ini.</p>
            </div>
          </div>
          <div className="rounded-3 bg-white bg-opacity-10 px-5 py-3 border border-white border-opacity-10">
            <p className="fs-xs text-abu-300">Hal yang perlu perhatian</p>
            <p className="fs-3xl fw-extrabold">{perhatian.reduce((a, p) => a + p.jumlah, 0)}</p>
          </div>
        </div>
      </div>

      <div className="d-grid kolom-2 gap-4 kolom-lg-4">
        <StatCard icon={Users} label="Total siswa" value={data.siswa.length} hint={baru.length ? `${perKelas.length} kelas · ${baru.length} siswa baru` : `${perKelas.length} kelas terdata`} tone="sky" />
        <StatCard icon={CalendarCheck} label="Kehadiran siswa" value={`${kehadiranSekolah(data)}%`} hint="rata-rata 20 hari" tone="emerald" />
        <StatCard icon={TrendingUp} label="Rata-rata nilai" value={rataSekolah ?? '–'} hint={`${belumTuntas} siswa belum tuntas`} tone="amber" />
        <StatCard icon={Wallet} label={`SPP ${namaBulan(bulanIni(), { month: 'long' })}`} value={rupiah(spp.terkumpul)} hint={`${persenLunas}% siswa lunas`} tone="primary" />
      </div>

      <div className={`mt-6 d-grid gap-6 ${guruId ? 'kolom-xl-15-10' : ''}`}>
        {guruId && <KartuPresensiSaya tautan />}
        <RingkasanPresensi />
      </div>

      <div className="mt-6 d-grid gap-6 kolom-xl-15-10">
        <Card className="p-6">
          <JudulKartu icon={CalendarCheck} judul="Tren kehadiran harian">
            <Link to={`${BASE}/kehadiran`} className="d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
              Detail <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          <p className="mt-n2 mb-3 fs-sm text-tinta-3">Persentase siswa hadir, 20 hari sekolah terakhir</p>
          <GrafikGaris judul="Persentase kehadiran siswa per hari" data={tren} min={Math.min(70, Math.floor(Math.min(...tren.map((t) => t.nilai)) / 10) * 10)} maks={100} satuan="%" tinggi={260} />
        </Card>

        <Card className="p-6">
          <JudulKartu icon={ClipboardCheck} judul="Perlu perhatian" />
          {perhatian.length === 0 ? (
            <p className="rounded-2 bg-success-subtle px-4 py-6 text-center fs-sm fw-semibold text-success">Semua terkendali. 🎉</p>
          ) : (
            <ul className="bertahap antara-y-2">
              {perhatian.map(({ ikon: Icon, jumlah, teks, ke }) => (
                <li key={teks}>
                  <Link to={ke} className="grup d-flex align-items-center gap-3 rounded-2 bg-abu-50 px-3 py-2-5 transisi hover-latar">
                    <span className="d-flex h-9 w-9 flex-shrink-0 align-items-center justify-content-center rounded-1 bg-white text-warning-emphasis shadow-sm">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 fs-sm text-tinta-2">
                      <span className="fw-bold text-tinta">{jumlah}</span> {teks}
                    </span>
                    <ChevronRight className="h-4 w-4 text-abu-400 transisi grup-geser-kecil" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 d-grid gap-6 kolom-lg-2">
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

        <div className="antara-y-6">
          <KartuKas ke={`${BASE}/keuangan`} />
          <Card className="p-6">
            <JudulKartu icon={Wallet} judul="Keuangan SPP">
              <Link to={`${BASE}/spp`} className="d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
                Detail <ArrowRight className="h-4 w-4" />
              </Link>
            </JudulKartu>
            <p className="fs-sm text-tinta-3">Pembayaran bulan {namaBulan(bulanIni())}</p>
            <div className="mt-2 d-flex align-items-end justify-content-between">
              <p className="fs-3xl fw-extrabold text-tinta">{persenLunas}%</p>
              <p className="fs-sm text-tinta-3">
                {spp.lunasBulanIni} dari {data.siswa.length} siswa lunas
              </p>
            </div>
            <Progres nilai={persenLunas} warna="bg-emerald-500" tinggi="h-3" className="mt-2" />
            <div className="mt-5 d-grid gap-3 kolom-sm-2">
              <div className="rounded-2 bg-danger-subtle p-4">
                <p className="fs-xs text-danger">Siswa menunggak</p>
                <p className="fs-xl fw-extrabold text-danger">{spp.menunggak}</p>
              </div>
              <div className="rounded-2 bg-warning-subtle p-4">
                <p className="fs-xs text-warning-emphasis">Total tunggakan</p>
                <p className="fs-xl fw-extrabold text-warning-emphasis">{rupiah(spp.totalTunggakan)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 d-grid gap-6 kolom-lg-3">
        <Card className="p-6">
          <JudulKartu icon={UserPlus} judul={`PPDB ${PPDB.tahunAjaran}`}>
            <Link to={`${BASE}/ppdb`} className="d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
              Kelola <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          <p className="fs-sm text-tinta-3">
            {data.pendaftar.length} pendaftar · kuota {kuotaPpdb} kursi
          </p>
          <Progres nilai={(data.pendaftar.length / kuotaPpdb) * 100} warna="bg-primary-500" className="mt-2" />
          <ul className="bertahap mt-4 antara-y-2">
            {statusPpdb.map(({ st, n }) => (
              <li key={st} className="d-flex align-items-center justify-content-between fs-sm">
                <Badge className={STATUS_PPDB[st].cls}>{st}</Badge>
                <span className="fw-bold text-tinta">{n}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <JudulKartu icon={CalendarDays} judul="Agenda terdekat">
            <Link to={`${BASE}/kalender`} className="d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
              Kalender <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          <ul className="bertahap antara-y-2">
            {agendaMendatang(4).map((e) => (
              <li key={e.judul + e.mulai} className={`rounded-2 px-4 py-3 ${JENIS_AGENDA[e.jenis].soft}`}>
                <p className="fs-sm fw-bold">{e.judul}</p>
                <p className="fs-xs opacity-80">{rentangAgenda(e)}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <JudulKartu judul="Pengumuman terbaru">
            <Link to={`${BASE}/pengumuman`} className="d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
              Kelola <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          <div className="pembatas-y pembatas-abu">
            {pengumuman.map((p) => (
              <div key={p.id} className="py-3 pertama-pt-0">
                <div className="d-flex align-items-center gap-2">
                  <KategoriBadge kategori={p.kategori} />
                  <span className="fs-xs text-tinta-3">{formatTanggal(p.tanggal)}</span>
                </div>
                <p className="mt-1-5 fw-semibold text-tinta">{p.judul}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <JudulKartu icon={GraduationCap} judul="Tim sekolah & jabatan">
          <Link to={`${BASE}/guru`} className="d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
            Atur <ArrowRight className="h-4 w-4" />
          </Link>
        </JudulKartu>
        <ul className="d-grid column-gap-8 row-gap-3 kolom-md-2">
          {Object.entries(PERAN).map(([kode, p]) => {
            const orang = data.guru.filter((g) => g.peran?.includes(kode))
            return (
              <li key={kode} className="d-flex flex-wrap align-items-start gap-2 fs-sm">
                <span className="w-100 flex-shrink-0 fw-semibold text-tinta-2 w-sm-44">{p.label}</span>
                <span className="d-flex flex-1 flex-wrap gap-1">
                  {orang.length ? (
                    orang.map((g) => (
                      <Badge key={g.id} className="bg-abu-100 text-tinta-2">
                        {g.nama.split(',')[0]}
                        {kode === 'wali_kelas' && ` (${g.kelas})`}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-abu-400">Belum ada</span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </Card>

    </>
  )
}
