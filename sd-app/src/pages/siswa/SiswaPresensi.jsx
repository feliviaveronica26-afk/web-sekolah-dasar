import { CalendarCheck, ShieldAlert } from 'lucide-react'
import { IsiPresensiOtp, teksJejak } from '../../components/PresensiOtp'
import { Badge, Card, DashHeader, JudulKartu, STATUS_ABSEN } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { ringkasAbsensi, useData } from '../../context/DataContext'
import { formatTanggal, todayKey } from '../../utils/format'
import { MAKS_PERCOBAAN, MASA_BERLAKU_MENIT } from '../../utils/otp'

const LANGKAH = [
  'Gurumu membuka presensi dan menampilkan kode 6 angka di papan atau proyektor.',
  `Buka menu Presensi Hari Ini, ketik kodenya, lalu tekan Kirim. Kode hanya berlaku ${MASA_BERLAKU_MENIT} menit.`,
  'Status Hadir langsung tercatat dan bisa dilihat orang tuamu.',
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

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <JudulKartu icon={CalendarCheck} judul="Riwayat kehadiran">
            <span className="text-sm font-bold text-emerald-600">{rekap.persen}% hadir</span>
          </JudulKartu>
          <div className="mb-4 flex flex-wrap gap-2">
            {Object.entries(STATUS_ABSEN).map(([k, s]) => (
              <Badge key={k} className={s.cls}>
                {s.label} {rekap[k]}
              </Badge>
            ))}
          </div>
          <ul className="divide-y divide-slate-100">
            {tanggal.map((t) => {
              const status = data.absensi[t]?.[user.nis]
              const jejak = teksJejak(data.jejakAbsensi[t]?.[user.nis])
              return (
                <li key={t} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-sm">
                  <span className="w-40 whitespace-nowrap font-medium text-slate-700">{formatTanggal(t, { weekday: 'short', year: undefined })}</span>
                  {status ? (
                    <Badge className={STATUS_ABSEN[status].cls}>{STATUS_ABSEN[status].label}</Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-500">{t === hariIni ? 'Belum presensi' : 'Tidak ada catatan'}</Badge>
                  )}
                  {jejak && <span className={`text-xs ${jejak.cls}`}>{jejak.teks}</span>}
                </li>
              )
            })}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-bold text-slate-900">Cara presensi</h2>
            <ol className="mt-4 space-y-3">
              {LANGKAH.map((l, i) => (
                <li key={l} className="flex gap-3 text-sm text-slate-600">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-100 font-display font-bold text-primary-700">{i + 1}</span>
                  {l}
                </li>
              ))}
            </ol>
          </Card>
          <Card className="border-amber-200 bg-amber-50 p-6">
            <h2 className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldAlert className="h-5 w-5" /> Jaga kejujuran
            </h2>
            <p className="mt-2 text-sm text-amber-900/80">
              Jangan membagikan kode ke teman yang tidak ada di kelas. Guru memeriksa ulang daftar hadir, dan setelah {MAKS_PERCOBAAN} kali salah kode
              presensimu dikunci.
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
