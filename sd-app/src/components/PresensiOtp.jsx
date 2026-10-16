import { useState } from 'react'
import { BookOpenCheck, CircleCheck, Hourglass, KeyRound, Lock, Send } from 'lucide-react'
import { Card, JudulKartu, STATUS_ABSEN, btn } from './ui'
import { useJamBerjalan } from './Presensi'
import { useAuth } from '../context/AuthContext'
import { useData, useSegarCepat } from '../context/DataContext'
import { MAPEL } from '../data/dummy'
import { isHariSekolah, jamSekarang, parseKey, todayKey } from '../utils/format'
import { jamPelajaran, labelSesi, pelajaranHari, statusPelajaran } from '../utils/jadwal'
import { MAKS_PERCOBAAN, MASA_BERLAKU_MENIT, PANJANG_KODE, formatSisa, sesiBerlaku, sesiTerakhir, sisaDetik, sudahHadirDiSesi } from '../utils/otp'

// Keterangan singkat bagaimana kehadiran seorang siswa tercatat
export function teksJejak(j) {
  if (!j) return null
  if (j.cara === 'otp') {
    // Presensi harian yang ikut tercatat dari kode pelajaran (mis. siswa datang terlambat)
    const mapel = j.pelajaran && MAPEL[j.pelajaran.split('-')[1]]?.nama
    return { teks: `Kode OTP${mapel ? ` ${mapel}` : ''} · ${j.jam}`, cls: 'text-emerald-700' }
  }
  if (j.cara === 'izin') return { teks: 'Izin orang tua disetujui', cls: 'text-sky-700' }
  const sebelum = j.sebelum ? `, sebelumnya ${STATUS_ABSEN[j.sebelum]?.label ?? j.sebelum}` : ''
  return { teks: `Diubah ${j.oleh?.split(',')[0] ?? 'guru'} · ${j.jam}${sebelum}`, cls: 'text-amber-700' }
}

const PESAN = {
  pendek: `Kode terdiri dari ${PANJANG_KODE} angka.`,
  'tidak-ada': 'Belum ada presensi yang dibuka untuk kelasmu. Tunggu gurumu menampilkan kode.',
  kedaluwarsa: `Kode ini sudah tidak berlaku (lebih dari ${MASA_BERLAKU_MENIT} menit). Minta guru membuat kode baru.`,
  terkunci: `Kamu sudah ${MAKS_PERCOBAAN} kali salah memasukkan kode. Minta guru mencatat kehadiranmu.`,
}

// Kartu presensi untuk siswa: masukkan kode OTP dari guru
export function IsiPresensiOtp({ className = '' }) {
  const { user } = useAuth()
  const { data, isiPresensiOtp } = useData()
  const sekarang = useJamBerjalan()
  const [kode, setKode] = useState('')
  const [hasil, setHasil] = useState(null)
  const [sibuk, setSibuk] = useState(false)
  // Sesi yang baru dibuka guru cepat terlihat
  useSegarCepat(isHariSekolah(sekarang))

  const hariIni = todayKey()
  const status = data.absensi[hariIni]?.[user.nis]
  const jejak = data.jejakAbsensi[hariIni]?.[user.nis]
  const sesi = sesiTerakhir(data, user.kelas, hariIni)
  const aktif = sesi && sesiBerlaku(sesi, sekarang.getTime())
  // Sesi pelajaran meminta kode lagi walaupun siswa sudah hadir harian
  const sudah = aktif ? sudahHadirDiSesi(data, sesi, user.nis) : status === 'H'
  const terkunci = aktif && !sudah && (sesi.gagal?.[user.nis] ?? 0) >= MAKS_PERCOBAAN
  const namaMapel = aktif && sesi.kunci ? MAPEL[sesi.mapel]?.nama : null

  // Kode diperiksa server; siswa tidak pernah menerima kode yang benar
  const kirim = async (e) => {
    e.preventDefault()
    if (sibuk) return
    if (kode.length !== PANJANG_KODE) return setHasil({ ok: false, alasan: 'pendek' })
    setSibuk(true)
    const r = await isiPresensiOtp(kode)
    setSibuk(false)
    setHasil(r)
    if (!r.ok) setKode('')
  }

  if (!isHariSekolah(sekarang)) {
    return (
      <Card className={`flex items-center gap-4 p-5 ${className}`}>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-500">
          <KeyRound className="h-6 w-6" />
        </span>
        <p className="text-sm text-slate-600">Hari ini libur, tidak ada presensi. Selamat beristirahat! 🌤️</p>
      </Card>
    )
  }

  if (sudah) {
    const jejakMapel = namaMapel && data.jejakMapel[hariIni]?.[user.nis]?.[sesi.kunci]
    const j = namaMapel ? jejakMapel : jejak
    return (
      <Card className={`flex items-center gap-4 border-emerald-200 bg-emerald-50 p-5 ${className}`}>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white">
          <CircleCheck className="h-7 w-7" />
        </span>
        <div>
          <p className="font-display text-lg font-bold text-emerald-800">
            {namaMapel ? `Kamu sudah hadir di pelajaran ${namaMapel}! 🎉` : 'Kamu sudah hadir hari ini! 🎉'}
          </p>
          <p className="text-sm text-emerald-700">
            {j?.cara === 'otp' ? `Tercatat pukul ${j.jam} lewat kode presensi.` : 'Kehadiranmu sudah dicatat oleh guru.'}
            {!aktif && ' Jika guru membuka presensi pelajaran, masukkan kodenya di sini.'}
          </p>
        </div>
      </Card>
    )
  }

  const pesanGagal =
    hasil && !hasil.ok && (hasil.alasan === 'salah' ? `Kode salah. Sisa ${hasil.sisa} kali percobaan.` : hasil.alasan === 'galat' ? hasil.pesan : PESAN[hasil.alasan])

  return (
    <Card className={`@container overflow-hidden ${className}`}>
      <div className="flex flex-col gap-5 p-5 @2xl:flex-row @2xl:items-center sm:p-6">
        <div className="flex flex-1 items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-50 text-primary-600">
            <KeyRound className="h-6 w-6" />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-slate-900">{namaMapel ? `Presensi pelajaran ${namaMapel}` : 'Presensi hari ini'}</p>
            <p className="text-sm text-slate-500">Masukkan {PANJANG_KODE} angka kode yang ditampilkan gurumu di kelas.</p>
            {aktif ? (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> {labelSesi(sesi)} dibuka · sisa {formatSisa(sisaDetik(sesi, sekarang.getTime()))}
              </p>
            ) : (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                <Hourglass className="h-3.5 w-3.5" /> Menunggu guru membuka presensi
              </p>
            )}
            {status && status !== 'H' && (
              <p className="mt-2 text-xs text-slate-500">Saat ini kamu tercatat {STATUS_ABSEN[status].label}. Jika kamu hadir, masukkan kode dari guru.</p>
            )}
          </div>
        </div>

        {terkunci ? (
          <p className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 @2xl:w-80">
            <Lock className="h-4 w-4 shrink-0" /> {PESAN.terkunci}
          </p>
        ) : (
          <form onSubmit={kirim} className="@2xl:w-80">
            <label htmlFor="kode-otp" className="sr-only">
              Kode presensi
            </label>
            <div className="flex gap-2">
              <input
                id="kode-otp"
                value={kode}
                onChange={(e) => {
                  setKode(e.target.value.replace(/\D/g, '').slice(0, PANJANG_KODE))
                  setHasil(null)
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="••••••"
                className="w-full min-w-0 rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-center font-display text-2xl font-bold tracking-[0.4em] text-slate-900 placeholder:text-slate-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100"
              />
              <button type="submit" disabled={sibuk} className={`${btn.primary} shrink-0`} aria-label="Kirim kode">
                <Send className="h-4 w-4" /> <span className="hidden sm:inline">Kirim</span>
              </button>
            </div>
            {pesanGagal && (
              <p role="alert" className="mt-2 text-sm font-medium text-rose-600">
                {pesanGagal}
              </p>
            )}
          </form>
        )}
      </div>
    </Card>
  )
}

// Kehadiran seorang siswa di tiap pelajaran pada satu hari (portal siswa & orang tua)
export function KehadiranPelajaran({ nis, kelas, tanggal = todayKey(), judul = 'Kehadiran per pelajaran hari ini', className = '' }) {
  const { data } = useData()
  const daftar = pelajaranHari(kelas, tanggal)
  if (!daftar.length || !isHariSekolah(parseKey(tanggal))) return null
  const lewat = (p) => tanggal < todayKey() || jamSekarang() >= p.mulai

  return (
    <Card className={`p-6 ${className}`}>
      <JudulKartu icon={BookOpenCheck} judul={judul} />
      <ul className="space-y-2">
        {daftar.map((p) => {
          const sp = statusPelajaran(data, tanggal, nis, p.kunci)
          const j = sp.sumber === 'pelajaran' ? teksJejak(data.jejakMapel[tanggal]?.[nis]?.[p.kunci]) : null
          // Hadir harian belum berarti hadir di pelajaran: tunggu dicatat guru pengampunya
          const info = sp.status && (sp.sumber === 'pelajaran' || sp.status !== 'H') ? STATUS_ABSEN[sp.status] : null
          return (
            <li key={p.kunci} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5">
              <span className="w-12 shrink-0 text-xs font-semibold text-slate-500">{p.mulai}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{MAPEL[p.mapel].nama}</p>
                <p className={`truncate text-xs ${j ? j.cls : 'text-slate-400'}`}>
                  {j ? j.teks : sp.sumber === 'harian' && info ? 'Mengikuti presensi harian' : jamPelajaran(p)}
                </p>
              </div>
              {info ? (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${info.cls}`}>{info.label}</span>
              ) : (
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-400 ring-1 ring-slate-200">
                  {lewat(p) ? 'Belum dicatat' : 'Belum mulai'}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
