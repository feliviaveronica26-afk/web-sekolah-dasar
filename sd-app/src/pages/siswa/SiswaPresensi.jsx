import { CalendarCheck, ShieldAlert } from 'lucide-react'
import { IsiPresensiOtp, KehadiranPelajaran, teksJejak } from '../../components/PresensiOtp'
import { Badge, Card, DashHeader, JudulKartu, STATUS_ABSEN } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { ringkasAbsensi, useData } from '../../context/DataContext'
import { formatTanggal, todayKey } from '../../utils/format'
import { MAKS_PERCOBAAN, MASA_BERLAKU_MENIT } from '../../utils/otp'

const LANGKAH = [
  'Wali kelasmu membuka presensi harian di pagi hari, dan guru tiap pelajaran bisa membuka presensi pelajarannya.',
  `Gurumu menampilkan kode 6 angka. Buka menu Presensi Hari Ini, ketik kodenya, lalu tekan Kirim. Kode hanya berlaku ${MASA_BERLAKU_MENIT} menit.`,
  'Status Hadir langsung tercatat di hari itu atau di pelajaran itu, dan bisa dilihat orang tuamu.',
]

export default function SiswaPresensi() {
  const { user } = useAuth()
  const { data } = useData()
  const hariIni = todayKey()
  const tanggal = [...new Set([hariIni, ...Object.keys(data.absensi)])]
    .filter((t) => t <= hariIni)
    .sort()
    .reverse()
    .slice(0, 20)
  const rekap = ringkasAbsensi(data.absensi, user.nis, tanggal)

  return (
    <>
      <DashHeader title="Presensi Hari Ini" desc="Catat kehadiranmu dengan kode dari guru." />
      <IsiPresensiOtp className="mb-6" />

      <div className="d-grid gap-6 kolom-lg-14-10">
        <Card className="p-6">
          <JudulKartu icon={CalendarCheck} judul="Riwayat kehadiran">
            <span className="fs-sm fw-bold text-success">{rekap.total ? `${rekap.persen}% hadir` : 'Belum ada catatan'}</span>
          </JudulKartu>
          <div className="mb-4 d-flex flex-wrap gap-2">
            {Object.entries(STATUS_ABSEN).map(([k, s]) => (
              <Badge key={k} className={s.cls}>
                {s.label} {rekap[k]}
              </Badge>
            ))}
          </div>
          <ul className="pembatas-y pembatas-abu">
            {tanggal.map((t) => {
              const status = data.absensi[t]?.[user.nis]
              const jejak = teksJejak(data.jejakAbsensi[t]?.[user.nis])
              return (
                <li key={t} className="d-flex flex-wrap align-items-center column-gap-4 row-gap-1 py-2-5 fs-sm">
                  <span className="w-40 text-nowrap fw-medium text-tinta-2">{formatTanggal(t, { weekday: 'short', year: undefined })}</span>
                  {status ? (
                    <Badge className={STATUS_ABSEN[status].cls}>{STATUS_ABSEN[status].label}</Badge>
                  ) : (
                    <Badge className="bg-abu-100 text-tinta-3">{t === hariIni ? 'Belum presensi' : 'Tidak ada catatan'}</Badge>
                  )}
                  {jejak && <span className={`fs-xs ${jejak.cls}`}>{jejak.teks}</span>}
                </li>
              )
            })}
          </ul>
        </Card>

        <div className="antara-y-6">
          <KehadiranPelajaran nis={user.nis} kelas={user.kelas} />
          <Card className="p-6">
            <h2 className="fw-bold text-tinta">Cara presensi</h2>
            <ol className="mt-4 antara-y-3">
              {LANGKAH.map((l, i) => (
                <li key={l} className="d-flex gap-3 fs-sm text-tinta-2">
                  <span className="d-flex h-7 w-7 flex-shrink-0 align-items-center justify-content-center rounded-pill bg-merah-100 fw-bold text-merah-700">{i + 1}</span>
                  {l}
                </li>
              ))}
            </ol>
          </Card>
          <Card className="border-warning-subtle bg-warning-subtle p-6">
            <h2 className="d-flex align-items-center gap-2 fw-bold text-warning-emphasis">
              <ShieldAlert className="h-5 w-5" /> Jaga kejujuran
            </h2>
            <p className="mt-2 fs-sm text-warning-emphasis">
              Jangan membagikan kode ke teman yang tidak ada di kelas. Guru memeriksa ulang daftar hadir, dan setelah {MAKS_PERCOBAAN} kali salah kode
              presensimu dikunci.
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
