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
import { useChat } from '../../context/ChatContext'
import { ringkasAbsensi, useData } from '../../context/DataContext'
import { MAPEL, SESI, SPP } from '../../data/dummy'
import { idGuru, idOrtu, idPribadi, jumlahBelum, ringkas as ringkasPesan } from '../../utils/chat'
import { formatTanggal, namaHari, todayKey } from '../../utils/format'
import { teksHadir } from '../../utils/ringkasan'
import { predikat, rekapNilai } from '../../utils/nilai'
import { ringkasSikap } from '../../utils/prestasi'
import { bulanWajibBayar, daftarBulan, rupiah } from '../../utils/spp'
import { RiwayatSikap } from '../siswa/SiswaLencana'

export default function OrtuDashboard() {
  const { user } = useAuth()
  const { data } = useData()
  const chat = useChat()
  const anak = data.siswa.find((s) => s.nis === user.anakNis)

  if (!anak) return <EmptyState icon={UserX} title="Data anak tidak ditemukan" desc="Silakan hubungi admin sekolah." />

  const hariIni = todayKey()
  const waliKelas = data.guru.find((g) => g.peran?.includes('wali_kelas') && g.kelas === anak.kelas)
  const tagihanSpp = bulanWajibBayar(data, anak.nis)
  const tanggalTerakhir = Object.keys(data.absensi).sort().reverse().slice(0, 20)
  const ringkas = ringkasAbsensi(data.absensi, anak.nis, tanggalTerakhir)
  const statusHariIni = data.absensi[hariIni]?.[anak.nis]
  const hari = namaHari(hariIni)
  const jadwalHariIni = data.jadwal?.[anak.kelas]?.[hari]?.some(Boolean) ? data.jadwal[anak.kelas][hari] : null
  const pengumuman = [...data.pengumuman].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 3)
  const izinTerakhir = data.izin.filter((i) => i.nis === anak.nis).slice(0, 2)
  const nilai = rekapNilai(data, anak)
  const sikap = ringkasSikap(data, anak.nis)
  const tugasAktif = data.tugas.filter((t) => t.kelas === anak.kelas && t.tenggat >= hariIni && !(data.tugasSelesai[anak.nis] ?? []).includes(t.id))
  const wali = data.guru.find((g) => g.peran?.includes('wali_kelas') && g.kelas === anak.kelas)
  const pidWali = wali ? idPribadi(idOrtu(anak.nis), idGuru(wali.id)) : null
  const pesanWali = (pidWali && chat.state.pesan[pidWali]) || []
  const pesanBaru = jumlahBelum(pesanWali, chat.state.dibaca[idOrtu(anak.nis)]?.[pidWali], idOrtu(anak.nis))
  const pesanTerakhir = pesanWali.at(-1)
  const panggilan = anak.nama.split(' ')[0]

  return (
    <>
      {/* Profil ananda */}
      <div className="position-relative mb-6 overflow-hidden rounded-5 gradasi-merah p-6 text-white p-sm-8">
        <div className="pola-titik position-absolute inset-0" />
        <Gumpalan className="putar-lambat position-absolute end-n20 top-n24 h-80 w-80 text-white text-opacity-10" />
        <div className="position-relative d-flex flex-column gap-6 flex-lg-row align-items-lg-center">
          <div className="d-flex flex-1 align-items-center gap-4">
            <Avatar nama={anak.nama} size="xl" className="bg-white text-merah-700 cincin-putih-tebal" />
            <div>
              <p className="fs-sm text-merah-100">Halo, {user.nama.split(' ').slice(0, 2).join(' ')} <span className="lambai">👋</span></p>
              <h1 className="fs-3xl fw-bold">{anak.nama}</h1>
              <p className="text-merah-50">
                Kelas {anak.kelas} · NIS {anak.nis}
              </p>
              {waliKelas && <p className="mt-1 fs-sm text-merah-100">Wali kelas: {waliKelas.nama}</p>}
            </div>
          </div>
          <div className="d-grid kolom-2 gap-3 kolom-sm-4 w-lg-120">
            <div className="rounded-3 bg-white bg-opacity-15 p-3 border border-white border-opacity-20">
              <p className="fs-xs text-merah-100">Hari ini</p>
              <p className="mt-1 fw-bold">{statusHariIni ? STATUS_ABSEN[statusHariIni].label : 'Belum diabsen'}</p>
            </div>
            <div className="rounded-3 bg-white bg-opacity-15 p-3 border border-white border-opacity-20">
              <p className="fs-xs text-merah-100">SPP</p>
              <p className="mt-1 fw-bold">{tagihanSpp.length ? `${tagihanSpp.length} bulan` : 'Lunas ✓'}</p>
            </div>
            <div className="rounded-3 bg-white bg-opacity-15 p-3 border border-white border-opacity-20">
              <p className="fs-xs text-merah-100">Tugas aktif</p>
              <p className="mt-1 fw-bold">{tugasAktif.length} tugas</p>
            </div>
            <div className="rounded-3 bg-white bg-opacity-15 p-3 border border-white border-opacity-20">
              <p className="fs-xs text-merah-100">Pesan baru</p>
              <p className="mt-1 fw-bold">{pesanBaru.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pengingat SPP */}
      {tagihanSpp.length > 0 ? (
        <div className="mb-6 d-flex flex-column gap-4 rounded-3 border border-warning-subtle bg-warning-subtle p-5 flex-sm-row align-items-sm-center">
          <Wallet className="h-7 w-7 flex-shrink-0 text-warning-emphasis" />
          <div className="flex-1">
            <p className="fw-bold text-warning-emphasis">Tagihan SPP {rupiah(tagihanSpp.length * SPP.nominal)}</p>
            <p className="fs-sm text-warning-emphasis">{daftarBulan(tagihanSpp)} · bisa dibayar lewat QRIS atau Virtual Account</p>
          </div>
          <Link to="/dashboard/ortu/spp" className={btn.primary}>
            Bayar SPP
          </Link>
        </div>
      ) : null}

      <div className="d-grid kolom-2 gap-4 kolom-lg-4">
        <StatCard icon={CalendarCheck} label="Kehadiran" value={teksHadir(ringkas)} hint={`S ${ringkas.S} · I ${ringkas.I} · A ${ringkas.A} (20 hari)`} tone="emerald" />
        <StatCard icon={TrendingUp} label="Rata-rata nilai" value={nilai.rataRata ?? '–'} hint={predikat(nilai.rataRata).label} tone="sky" />
        <StatCard icon={Award} label="Poin sikap" value={sikap.total > 0 ? `+${sikap.total}` : sikap.total} hint={`${sikap.positif} apresiasi`} tone="amber" />
        <StatCard icon={Star} label="Mapel tuntas" value={`${nilai.tuntas}/${nilai.daftar.length}`} hint="KKTP 75" tone="primary" />
      </div>

      <div className="mt-6 d-grid gap-6 kolom-lg-3">
        {/* Pesan wali kelas */}
        <Card className="p-6">
          <JudulKartu icon={MessagesSquare} judul="Chat wali kelas">
            {pesanBaru > 0 && <Badge className="bg-warning-subtle text-warning-emphasis">{pesanBaru} baru</Badge>}
          </JudulKartu>
          {pesanTerakhir ? (
            <div className="rounded-3 bg-abu-50 p-4">
              <p className="fs-xs fw-semibold text-tinta-3">{pesanTerakhir.dari === idOrtu(anak.nis) ? 'Anda' : wali.nama}</p>
              <p className="mt-1 clamp-3 fs-sm text-tinta-2">{ringkasPesan(pesanTerakhir)}</p>
            </div>
          ) : (
            <p className="fs-sm text-tinta-3">Belum ada pesan.</p>
          )}
          <Link to={pidWali ? `/dashboard/ortu/chat?buka=${encodeURIComponent(pidWali)}` : '/dashboard/ortu/chat'} className={`${btn.secondary} mt-4 w-100`}>
            Buka percakapan <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        {/* Apresiasi terbaru */}
        <Card className="p-6 rentang-lg-2">
          <JudulKartu icon={Award} judul={`Apresiasi terbaru untuk ${panggilan}`}>
            <Link to="/dashboard/ortu/sikap" className="d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
              Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          <RiwayatSikap nis={anak.nis} batas={3} />
        </Card>
      </div>

      <div className="mt-6 d-grid gap-6 kolom-lg-3">
        <Card className="p-6">
          <JudulKartu icon={BookOpen} judul="Jadwal hari ini" />
          <p className="mt-n2 fs-sm text-tinta-3">{hari}</p>
          {jadwalHariIni ? (
            <ol className="bertahap mt-4 antara-y-2">
              {jadwalHariIni.map((m, i) => m && (
                <li key={m + i} className="d-flex align-items-center gap-3 rounded-2 bg-abu-50 px-3 py-2-5 fs-sm">
                  <span className="w-11 flex-shrink-0 fs-xs fw-semibold text-tinta-3">{SESI[i]?.mulai}</span>
                  <span className={`rounded-1 px-2 py-0-5 fs-xs fw-bold ${MAPEL[m]?.warna}`}>{MAPEL[m]?.nama ?? m}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-6 rounded-2 bg-abu-50 px-4 py-6 text-center fs-sm text-tinta-3">Tidak ada jadwal pelajaran hari ini. Selamat berlibur! 🎉</p>
          )}
        </Card>

        <Card className="p-6">
          <JudulKartu icon={Clock3} judul="Tugas yang akan datang">
            <Link to="/dashboard/ortu/tugas" className="d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
              Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          {tugasAktif.length === 0 ? (
            <p className="d-flex align-items-center gap-2 rounded-2 bg-success-subtle px-4 py-4 fs-sm fw-semibold text-success">
              <CheckCircle2 className="h-5 w-5" /> Semua tugas sudah dikerjakan.
            </p>
          ) : (
            <ul className="bertahap antara-y-2">
              {tugasAktif.slice(0, 4).map((t) => (
                <li key={t.id} className="rounded-2 bg-abu-50 px-3 py-2-5">
                  <p className="fs-sm fw-semibold text-tinta">{t.judul}</p>
                  <p className="fs-xs text-tinta-3">
                    {MAPEL[t.mapel].nama} · dikumpulkan {formatTanggal(t.tenggat, { year: undefined })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <JudulKartu icon={FileText} judul="Izin terakhir">
            <Link to="/dashboard/ortu/izin" className="d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
              Ajukan <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          {izinTerakhir.length === 0 ? (
            <p className="fs-sm text-tinta-3">Belum ada pengajuan izin.</p>
          ) : (
            <div className="bertahap antara-y-2">
              {izinTerakhir.map((i) => (
                <div key={i.id} className="rounded-2 bg-abu-50 px-4 py-3">
                  <div className="d-flex align-items-center justify-content-between gap-2">
                    <p className="fs-sm fw-semibold text-tinta">
                      {i.jenis} · {formatTanggal(i.tanggalMulai, { year: undefined })}
                    </p>
                    <IzinBadge status={i.status} />
                  </div>
                  <p className="mt-0-5 clamp-1 fs-xs text-tinta-3">{i.alasan}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <JudulKartu icon={Megaphone} judul="Pengumuman terbaru">
          <Link to="/dashboard/ortu/pengumuman" className="d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
            Semua <ArrowRight className="h-4 w-4" />
          </Link>
        </JudulKartu>
        <div className="d-grid gap-4 kolom-md-3">
          {pengumuman.map((p) => (
            <Link key={p.id} to={`/dashboard/ortu/pengumuman?buka=${encodeURIComponent(p.id)}`} className="d-block rounded-3 bg-abu-50 p-4 transisi hover-latar-abu">
              <div className="d-flex align-items-center gap-2">
                <KategoriBadge kategori={p.kategori} />
                <span className="fs-xs text-tinta-3">{formatTanggal(p.tanggal)}</span>
              </div>
              <p className="mt-2 fw-semibold text-tinta">{p.judul}</p>
            </Link>
          ))}
        </div>
      </Card>
    </>
  )
}
