import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  FileCheck,
  Library,
  Users,
  Wallet,
} from 'lucide-react'
import JamSekolah from '../../components/JamSekolah'
import { JENIS_AGENDA, agendaMendatang, rentangAgenda } from '../../components/KalenderAkademik'
import { Avatar, Badge, Card, DashHeader, EmptyState, StatCard, btn } from '../../components/ui'
import { PERAN, useAkses } from '../../context/akses'
import { ringkasAbsensi, useData } from '../../context/DataContext'
import { HARI_SEKOLAH, JADWAL, MAPEL, SESI } from '../../data/dummy'
import { formatTanggal, isHariSekolah, namaHari, todayKey } from '../../utils/format'
import { kehadiranSekolah, rekapSiswa, ringkasPerpus, ringkasSpp } from '../../utils/ringkasan'
import { rupiah } from '../../utils/spp'

function Panel({ judul, ke, children }) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold text-slate-900">{judul}</h2>
        {ke && (
          <Link to={ke} className="flex items-center gap-1 text-sm font-semibold text-primary-600">
            Buka <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </Card>
  )
}

function PanelWaliKelas({ kelas, base }) {
  const { data } = useData()
  const siswaKelas = data.siswa.filter((s) => s.kelas === kelas)
  const hariIni = todayKey()
  const absenHariIni = data.absensi[hariIni] ?? {}
  const sudahDiisi = siswaKelas.filter((s) => absenHariIni[s.nis]).length
  const hadirHariIni = siswaKelas.filter((s) => absenHariIni[s.nis] === 'H').length
  const izinMenunggu = data.izin.filter((i) => i.kelas === kelas && i.status === 'Menunggu')
  const tanggalTerakhir = Object.keys(data.absensi).sort().reverse().slice(0, 20)
  const rekap = siswaKelas.map((s) => ({ ...s, ...ringkasAbsensi(data.absensi, s.nis, tanggalTerakhir) }))
  const rataRata = rekap.length ? Math.round(rekap.reduce((acc, s) => acc + s.persen, 0) / rekap.length) : 0
  const perluPerhatian = rekap
    .filter((s) => s.total - s.H >= 2)
    .sort((a, b) => b.total - b.H - (a.total - a.H))
    .slice(0, 5)

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-slate-900">Kelas {kelas}</h2>
        <Link to={`${base}/absensi`} className={btn.primary}>
          <ClipboardCheck className="h-4 w-4" /> Isi Absensi Hari Ini
        </Link>
      </div>

      {isHariSekolah(new Date()) && sudahDiisi < siswaKelas.length && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          Absensi hari ini belum lengkap ({sudahDiisi}/{siswaKelas.length} siswa).
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Jumlah Siswa" value={siswaKelas.length} hint={`Kelas ${kelas}`} tone="sky" />
        <StatCard
          icon={CalendarCheck}
          label="Hadir Hari Ini"
          value={sudahDiisi ? `${hadirHariIni}/${siswaKelas.length}` : '–'}
          hint={sudahDiisi ? formatTanggal(hariIni) : 'Belum diisi'}
          tone="emerald"
        />
        <StatCard icon={FileCheck} label="Izin Menunggu" value={izinMenunggu.length} hint="perlu ditinjau" tone="amber" />
        <StatCard icon={ClipboardCheck} label="Rata-rata Kehadiran" value={`${rataRata}%`} hint="20 hari terakhir" tone="primary" />
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <Panel judul="Izin Menunggu Persetujuan" ke={`${base}/izin`}>
          {izinMenunggu.length === 0 ? (
            <EmptyState icon={FileCheck} title="Semua beres!" desc="Tidak ada pengajuan izin yang menunggu." />
          ) : (
            <div className="space-y-2">
              {izinMenunggu.map((i) => (
                <div key={i.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <Avatar nama={i.namaSiswa} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{i.namaSiswa}</p>
                    <p className="text-xs text-slate-500">
                      {i.jenis} · {formatTanggal(i.tanggalMulai)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel judul="Siswa Perlu Perhatian">
          <p className="-mt-2 mb-3 text-sm text-slate-500">Tidak hadir 2 kali atau lebih dalam 20 hari terakhir.</p>
          {perluPerhatian.length === 0 ? (
            <EmptyState icon={Users} title="Kehadiran kelas sangat baik" />
          ) : (
            <div className="space-y-2">
              {perluPerhatian.map((s) => (
                <div key={s.nis} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <Avatar nama={s.nama} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{s.nama}</p>
                    <p className="text-xs text-slate-500">
                      Sakit {s.S} · Izin {s.I} · Alpa {s.A}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{s.persen}%</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </section>
  )
}

// Jadwal mengajar diambil dari jadwal kelas yang mencantumkan nama guru ini
function jadwalMengajar(nama) {
  const hasil = []
  for (const [kelas, perHari] of Object.entries(JADWAL)) {
    for (const hari of HARI_SEKOLAH) {
      perHari[hari]?.forEach((kode, i) => {
        if (MAPEL[kode]?.guru === nama) hasil.push({ hari, kelas, kode, jam: `${SESI[i].mulai} – ${SESI[i].selesai}` })
      })
    }
  }
  return hasil
}

export default function StafDashboard() {
  const { data } = useData()
  const { nama, peran, kelas, base } = useAkses()
  const punyaPeran = (p) => peran.includes(p)
  const mengajar = jadwalMengajar(nama)
  const hariIni = namaHari(todayKey())

  return (
    <>
      <DashHeader title={`Selamat datang, ${nama.split(',')[0]}`} desc="Ringkasan tugas Anda hari ini." />
      <div className="-mt-3 mb-6 flex flex-wrap gap-2">
        {peran.map((p) => (
          <Badge key={p} className="bg-primary-50 text-primary-700">
            {PERAN[p]?.label}
            {p === 'wali_kelas' && kelas && ` ${kelas}`}
          </Badge>
        ))}
      </div>

      <div className="space-y-8">
        {punyaPeran('wali_kelas') && kelas && <PanelWaliKelas kelas={kelas} base={base} />}

        <div className="grid gap-6 lg:grid-cols-2">
          {mengajar.length > 0 && (
            <Panel judul="Jadwal Mengajar">
              <ul className="space-y-2">
                {mengajar.map((m, i) => (
                  <li
                    key={i}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${m.hari === hariIni ? 'bg-primary-50 ring-1 ring-primary-200' : 'bg-slate-50'}`}
                  >
                    <span className="w-16 font-bold text-slate-800">{m.hari}</span>
                    <span className="w-28 text-slate-500">{m.jam}</span>
                    <span className="flex-1 font-semibold text-slate-800">{MAPEL[m.kode].nama}</span>
                    <Badge className="bg-white text-slate-600">Kelas {m.kelas}</Badge>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {punyaPeran('tata_usaha') && <PanelSpp base={base} />}
          {punyaPeran('pustakawan') && <PanelPerpus base={base} />}

          {punyaPeran('wakasek_kurikulum') && (
            <Panel judul="Agenda Akademik Terdekat" ke={`${base}/kalender`}>
              <ul className="space-y-2">
                {agendaMendatang(4).map((e) => (
                  <li key={e.judul + e.mulai} className={`rounded-xl px-4 py-3 ${JENIS_AGENDA[e.jenis].soft}`}>
                    <p className="text-sm font-bold">{e.judul}</p>
                    <p className="text-xs opacity-80">{rentangAgenda(e)}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {punyaPeran('wakasek_kesiswaan') && (
            <Panel judul="Kesiswaan" ke={`${base}/kehadiran`}>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs text-emerald-700">Kehadiran sekolah</p>
                  <p className="text-2xl font-extrabold text-emerald-700">{kehadiranSekolah(data)}%</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-xs text-amber-800">Siswa kehadiran &lt; 90%</p>
                  <p className="text-2xl font-extrabold text-amber-800">{rekapSiswa(data).filter((s) => s.persen < 90).length}</p>
                </div>
              </div>
            </Panel>
          )}

          {punyaPeran('wakasek_sarpras') && <PanelSarpras base={base} />}
          {punyaPeran('guru_bk') && <PanelBk base={base} />}
          {punyaPeran('satpam') && <PanelKeamanan base={base} />}
        </div>

        <JamSekolah untukGuru />

        {peran.length === 0 && (
          <Card>
            <EmptyState icon={BookOpen} title="Belum ada jabatan" desc="Hubungi Kepala Sekolah untuk mengatur jabatan dan hak akses Anda." />
          </Card>
        )}
      </div>
    </>
  )
}

export function PanelSpp({ base }) {
  const { data } = useData()
  const r = ringkasSpp(data)
  return (
    <Panel judul="Keuangan SPP" ke={`${base}/spp`}>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
          <Wallet className="h-6 w-6 text-emerald-600" />
          <div>
            <p className="text-xs text-emerald-700">Terkumpul bulan ini</p>
            <p className="text-2xl font-extrabold text-emerald-700">{rupiah(r.terkumpul)}</p>
          </div>
        </div>
        <div className="rounded-xl bg-sky-50 p-4">
          <p className="text-xs text-sky-700">Lunas bulan ini</p>
          <p className="text-xl font-extrabold text-sky-700">
            {r.lunasBulanIni}/{data.siswa.length}
          </p>
        </div>
        <div className="rounded-xl bg-rose-50 p-4">
          <p className="text-xs text-rose-700">Siswa menunggak</p>
          <p className="text-xl font-extrabold text-rose-700">{r.menunggak}</p>
        </div>
      </div>
    </Panel>
  )
}

function Angka({ label, nilai, tone }) {
  const warna = { sky: 'bg-sky-50 text-sky-700', amber: 'bg-amber-50 text-amber-800', rose: 'bg-rose-50 text-rose-700', emerald: 'bg-emerald-50 text-emerald-700' }
  return (
    <div className={`rounded-xl p-4 ${warna[tone]}`}>
      <p className="text-xs">{label}</p>
      <p className="text-2xl font-extrabold">{nilai}</p>
    </div>
  )
}

function PanelSarpras({ base }) {
  const { data } = useData()
  const perluPerbaikan = data.kerusakan.filter((k) => k.status !== 'Selesai')
  return (
    <Panel judul="Sarana & Prasarana" ke={`${base}/kerusakan`}>
      <div className="grid grid-cols-2 gap-3">
        <Angka label="Laporan belum selesai" nilai={perluPerbaikan.length} tone="amber" />
        <Angka label="Barang rusak berat" nilai={data.inventaris.filter((b) => b.kondisi === 'Rusak Berat').length} tone="rose" />
      </div>
      {perluPerbaikan.some((k) => k.prioritas === 'Tinggi') && (
        <p className="mt-3 flex items-center gap-2 text-sm text-rose-700">
          <AlertTriangle className="h-4 w-4" /> Ada kerusakan prioritas tinggi yang belum selesai.
        </p>
      )}
    </Panel>
  )
}

function PanelBk({ base }) {
  const { data } = useData()
  const aktif = data.konseling.filter((k) => k.status !== 'Selesai')
  return (
    <Panel judul="Bimbingan Konseling" ke={`${base}/konseling`}>
      <div className="grid grid-cols-2 gap-3">
        <Angka label="Kasus aktif" nilai={aktif.length} tone="sky" />
        <Angka label="Perlu pemantauan" nilai={aktif.filter((k) => k.status === 'Perlu Pemantauan').length} tone="amber" />
      </div>
      <p className="mt-3 text-sm text-slate-500">
        {rekapSiswa(data).filter((s) => s.persen < 90).length} siswa kehadirannya di bawah 90% — cek di Rekap Kehadiran.
      </p>
    </Panel>
  )
}

function PanelKeamanan({ base }) {
  const { data } = useData()
  const hariIni = todayKey()
  const tamu = data.bukuTamu.filter((t) => t.tanggal === hariIni)
  const terjadwal = data.kunjungan.filter((k) => k.status === 'Dikonfirmasi' && k.tanggal === hariIni)
  return (
    <Panel judul="Keamanan & Tamu Hari Ini" ke={`${base}/bukutamu`}>
      <div className="grid grid-cols-3 gap-3">
        <Angka label="Tamu" nilai={tamu.length} tone="sky" />
        <Angka label="Masih di dalam" nilai={tamu.filter((t) => !t.keluar).length} tone="amber" />
        <Angka label="Terjadwal" nilai={terjadwal.length} tone="emerald" />
      </div>
    </Panel>
  )
}

function PanelPerpus({ base }) {
  const { data } = useData()
  const { aktif, terlambat } = ringkasPerpus(data)
  return (
    <Panel judul="Perpustakaan" ke={`${base}/perpustakaan`}>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-sky-50 p-4">
          <Library className="h-5 w-5 text-sky-600" />
          <p className="mt-2 text-xs text-sky-700">Sedang dipinjam</p>
          <p className="text-2xl font-extrabold text-sky-700">{aktif.length}</p>
        </div>
        <div className="rounded-xl bg-rose-50 p-4">
          <CalendarDays className="h-5 w-5 text-rose-600" />
          <p className="mt-2 text-xs text-rose-700">Terlambat kembali</p>
          <p className="text-2xl font-extrabold text-rose-700">{terlambat.length}</p>
        </div>
      </div>
    </Panel>
  )
}
