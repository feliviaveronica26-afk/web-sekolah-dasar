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
import { teksHadir } from '../../utils/ringkasan'
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

const BASE = '/dashboard/siswa'

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
      <div className="position-relative mb-6 overflow-hidden rounded-5 gradasi-merah-jingga p-6 text-white p-sm-8">
        <div className="pola-titik position-absolute inset-0" />
        <Gumpalan className="putar-lambat position-absolute end-n16 top-n20 h-72 w-72 text-white text-opacity-10" />
        <Bintang className="position-absolute kanan-38 top-6 d-none h-6 w-6 melayang teks-terang-amber d-sm-block" />
        <div className="position-relative d-grid gap-6 kolom-lg-isi-auto align-items-lg-center">
          <div className="d-flex align-items-center gap-4">
            <Avatar nama={user.nama} size="lg" className="bg-white text-merah-700 cincin-putih-tebal" />
            <div>
              <p className="fs-sm fw-semibold text-merah-100">
                Kelas {user.kelas} · NIS {user.nis}
              </p>
              <h1 className="fs-3xl fw-bold fs-sm-4xl">Halo, {namaDepan}! <span className="lambai">👋</span></h1>
              <p className="mt-1 mw-lg text-merah-50">{mutiara}</p>
            </div>
          </div>

          <Link
            to={`${BASE}/lencana`}
            className="d-block rounded-3 bg-white bg-opacity-15 p-4 border border-white border-opacity-20 buram transisi hover-terang w-lg-72"
          >
            <div className="d-flex align-items-center justify-content-between">
              <p className="fs-lg fw-bold">
                Level {level.level} · {level.gelar}
              </p>
              <Sparkles className="h-5 w-5 teks-terang-amber" />
            </div>
            <div className="mt-2 h-2-5 overflow-hidden rounded-pill bg-white bg-opacity-25">
              <div className="isi-progres h-100 rounded-pill bg-warning-subtle transisi-lebar" style={{ width: `${level.progres * 100}%` }} />
            </div>
            <p className="mt-1-5 fs-xs text-merah-100">
              {level.xp} XP · {level.sisa} XP lagi ke level {level.level + 1}
            </p>
            <div className="mt-3 d-flex flex-wrap gap-2 fs-sm">
              <span className="rounded-pill bg-white bg-opacity-20 px-3 py-1 fw-semibold">🔥 {streak} hari hadir</span>
              <span className="rounded-pill bg-white bg-opacity-20 px-3 py-1 fw-semibold">⭐ {Math.max(0, sikap.total)} poin</span>
            </div>
          </Link>
        </div>
      </div>

      <IsiPresensiOtp className="mb-6" />

      <div className="d-grid kolom-2 gap-4 kolom-lg-4">
        <StatCard icon={CalendarCheck} label="Kehadiranku" value={teksHadir(kehadiran)} hint="20 hari sekolah terakhir" tone="emerald" ke={`${BASE}/presensi`} />
        <StatCard icon={ClipboardList} label="Tugas belum selesai" value={tugasAktif.length} hint={`dari ${tugasKelas.length} tugas`} tone="amber" ke={`${BASE}/tugas`} />
        <StatCard icon={TrendingUp} label="Rata-rata nilai" value={nilai.rataRata ?? '–'} hint="semester ini" tone="sky" ke={`${BASE}/nilai`} />
        <StatCard icon={Star} label="Lencana" value={`${didapat.length}/${lencana.length}`} hint="sudah didapat" tone="primary" ke={`${BASE}/lencana`} />
      </div>

      <div className="mt-6 d-grid gap-6 kolom-lg-5">
        {/* Jadwal */}
        <Card className="min-w-0 p-6 rentang-lg-2">
          <JudulKartu icon={BookOpen} judul={`Jadwal ${jadwal?.label ?? ''}`}>
            <Link to="/dashboard/siswa/jadwal" className="d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
              Lengkap <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          {jadwal ? (
            <>
              <p className="mt-n2 fs-sm text-tinta-3">{formatHari(jadwal.tanggal)}</p>
              <ol className="bertahap mt-4 antara-y-2">
                {jadwal.sesi.map((kode, i) => MAPEL[kode] && (
                  <li key={kode + i}>
                    <Link
                      to={`${BASE}/jadwal`}
                      className={`d-flex align-items-center gap-3 rounded-2 px-3 py-2-5 transisi ${i === sesiAktif ? 'bg-merah-50 border border-2 border-merah-300' : 'bg-abu-50 hover-latar-abu'}`}
                    >
                      <span className="w-12 flex-shrink-0 fs-xs fw-semibold text-tinta-3">{SESI[i].mulai}</span>
                      <span className={`rounded-1 px-2-5 py-1 fs-sm fw-semibold ${MAPEL[kode].warna}`}>{MAPEL[kode].nama}</span>
                      {i === sesiAktif && <span className="ms-auto berdenyut fs-xs fw-bold text-primary">● Sekarang</span>}
                    </Link>
                    {i + 1 === ISTIRAHAT.setelahSesi && (
                      <p className="d-flex align-items-center gap-2 px-3 py-1-5 fs-xs text-abu-400">
                        <Coffee className="h-3-5 w-3-5" /> Istirahat {ISTIRAHAT.mulai} – {ISTIRAHAT.selesai}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className="fs-sm text-tinta-3">Belum ada jadwal.</p>
          )}
        </Card>

        {/* Tugas */}
        <Card className="min-w-0 p-6 rentang-lg-3">
          <JudulKartu icon={ClipboardList} judul="Tugas yang harus dikerjakan">
            <Link to="/dashboard/siswa/tugas" className="d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
              Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          <div className="mb-4 d-flex align-items-center gap-3 fs-sm">
            <Progres nilai={tugasKelas.length ? ((tugasKelas.length - tugasAktif.length) / tugasKelas.length) * 100 : 0} warna="bg-emerald-500" className="flex-1" />
            <span className="fw-semibold text-tinta-2">
              {tugasKelas.length - tugasAktif.length}/{tugasKelas.length} selesai
            </span>
          </div>
          {tugasAktif.length === 0 ? (
            <p className="rounded-2 bg-success-subtle px-4 py-6 text-center fs-sm fw-semibold text-success">Tidak ada tugas. Waktunya bermain! 🎉</p>
          ) : (
            <div className="bertahap antara-y-2">
              {tugasAktif.slice(0, 4).map((t) => {
                const tenggat = infoTenggat(t.tenggat)
                return (
                  <Link
                    to="/dashboard/siswa/tugas"
                    key={t.id}
                    className="d-flex flex-wrap align-items-center column-gap-3 row-gap-1-5 rounded-2 border border-abu-100 px-4 py-3 transisi hover-garis-merah hover-latar-merah flex-sm-nowrap"
                  >
                    <span className={`rounded-1 px-2 py-1 fs-xs fw-bold ${MAPEL[t.mapel].warna}`}>{MAPEL[t.mapel].nama}</span>
                    <Badge className={`${tenggat.cls} order-sm-last`}>{tenggat.teks}</Badge>
                    <p className="w-100 fs-sm fw-semibold text-tinta w-sm-auto flex-sm-1 text-sm-truncate">{t.judul}</p>
                  </Link>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 d-grid gap-6 kolom-lg-3">
        {/* Lencana */}
        <Card className="p-6">
          <JudulKartu icon={Star} judul="Lencanaku">
            <Link to="/dashboard/siswa/lencana" className="d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
              Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          <div className="d-flex flex-wrap gap-2">
            {didapat.map((l) => (
              <Link
                key={l.kode}
                to={`${BASE}/lencana`}
                title={l.nama}
                aria-label={`Lencana ${l.nama}`}
                className={`d-flex h-12 w-12 align-items-center justify-content-center rounded-3 fs-2xl shadow-sm transisi hover-angkat-sedikit hover-bayangan-kecil ${l.warna}`}
              >
                {l.emoji}
              </Link>
            ))}
            {didapat.length === 0 && <p className="fs-sm text-tinta-3">Belum ada lencana. Ayo kumpulkan!</p>}
          </div>
          {berikutnya && (
            <Link to={`${BASE}/lencana`} className="mt-5 d-block rounded-3 bg-abu-50 p-4 transisi hover-latar-abu">
              <p className="fs-xs fw-semibold text-tinta-3">Lencana berikutnya</p>
              <p className="mt-1 fw-bold text-tinta">
                {berikutnya.emoji} {berikutnya.nama}
              </p>
              <p className="fs-xs text-tinta-3">{berikutnya.syarat}</p>
              <Progres nilai={berikutnya.progres * 100} warna="bg-amber-400" className="mt-2" />
              <p className="mt-1 fs-xs fw-semibold text-tinta-2">{berikutnya.teks}</p>
            </Link>
          )}
        </Card>

        {/* Ekskul */}
        <Card className="p-6">
          <JudulKartu icon={Tent} judul="Ekskul minggu ini">
            <Link to="/dashboard/siswa/ekskul" className="d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
              Atur <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          {ekskul.length === 0 ? (
            <p className="fs-sm text-tinta-3">Kamu belum ikut ekskul. Yuk pilih satu!</p>
          ) : (
            <ul className="bertahap antara-y-2">
              {ekskul.map((e) => (
                <li key={e.id}>
                  <Link to={`${BASE}/ekskul`} className="d-flex align-items-center gap-3 rounded-2 bg-abu-50 px-3 py-2-5 transisi hover-latar-abu">
                    <span className={`d-flex h-10 w-10 flex-shrink-0 align-items-center justify-content-center rounded-2 ${e.warna}`}>
                      <Ikon nama={e.ikon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="d-block fs-sm fw-bold text-tinta">{e.nama}</span>
                      <span className="d-block fs-xs text-tinta-3">
                        {e.hari} · {e.jam}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Agenda */}
        <Card className="p-6">
          <JudulKartu icon={CalendarDays} judul="Agenda sekolah">
            <Link to="/dashboard/siswa/kalender" className="d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
              Kalender <ArrowRight className="h-4 w-4" />
            </Link>
          </JudulKartu>
          <ul className="bertahap antara-y-2">
            {agenda.map((e) => (
              <li key={e.judul + e.mulai}>
                <Link to={`${BASE}/kalender`} className={`d-block rounded-2 px-4 py-3 transisi hover-redup ${JENIS_AGENDA[e.jenis].soft}`}>
                  <p className="fs-sm fw-bold">{e.judul}</p>
                  <p className="fs-xs opacity-80">{rentangAgenda(e)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <JudulKartu icon={Megaphone} judul="Pengumuman">
          <Link to={`${BASE}/pengumuman`} className="d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
            Semua <ArrowRight className="h-4 w-4" />
          </Link>
        </JudulKartu>
        <div className="d-grid gap-4 kolom-md-2">
          {pengumuman.map((p) => (
            <Link key={p.id} to={`${BASE}/pengumuman?buka=${encodeURIComponent(p.id)}`} className="grup d-block rounded-3 bg-abu-50 p-4 transisi hover-latar-abu">
              <div className="d-flex align-items-center gap-2">
                <KategoriBadge kategori={p.kategori} />
                <span className="fs-xs text-tinta-3">{formatTanggal(p.tanggal)}</span>
              </div>
              <p className="mt-2 fw-semibold text-tinta">{p.judul}</p>
              <p className="mt-1 clamp-2 fs-sm text-tinta-2">{p.isi}</p>
              <p className="mt-2 d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
                Baca selengkapnya <ArrowRight className="h-4 w-4 transisi grup-geser-kecil" />
              </p>
            </Link>
          ))}
        </div>
      </Card>
    </>
  )
}
