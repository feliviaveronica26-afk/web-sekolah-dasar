import { useState } from 'react'
import { CircleCheck, Hourglass, KeyRound, Lock, Send } from 'lucide-react'
import { Card, STATUS_ABSEN, btn } from './ui'
import { useJamBerjalan } from './Presensi'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { isHariSekolah, todayKey } from '../utils/format'
import { MAKS_PERCOBAAN, MASA_BERLAKU_MENIT, PANJANG_KODE, formatSisa, sesiBerlaku, sesiTerakhir, sisaDetik } from '../utils/otp'

// Keterangan singkat bagaimana kehadiran seorang siswa tercatat
export function teksJejak(j) {
  if (!j) return null
  if (j.cara === 'otp') return { teks: `Kode OTP · ${j.jam}`, cls: 'text-emerald-700' }
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

  const hariIni = todayKey()
  const status = data.absensi[hariIni]?.[user.nis]
  const jejak = data.jejakAbsensi[hariIni]?.[user.nis]
  const sesi = sesiTerakhir(data, user.kelas, hariIni)
  const aktif = sesi && sesiBerlaku(sesi, sekarang.getTime())
  const terkunci = aktif && (sesi.gagal?.[user.nis] ?? 0) >= MAKS_PERCOBAAN

  const kirim = (e) => {
    e.preventDefault()
    if (kode.length !== PANJANG_KODE) return setHasil({ ok: false, alasan: 'pendek' })
    const r = isiPresensiOtp(user.nis, user.kelas, kode)
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

  if (status === 'H') {
    return (
      <Card className={`flex items-center gap-4 border-emerald-200 bg-emerald-50 p-5 ${className}`}>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white">
          <CircleCheck className="h-7 w-7" />
        </span>
        <div>
          <p className="font-display text-lg font-bold text-emerald-800">Kamu sudah hadir hari ini! 🎉</p>
          <p className="text-sm text-emerald-700">
            {jejak?.cara === 'otp' ? `Tercatat pukul ${jejak.jam} lewat kode presensi.` : 'Kehadiranmu sudah dicatat oleh guru.'}
          </p>
        </div>
      </Card>
    )
  }

  const pesanGagal = hasil && !hasil.ok && (hasil.alasan === 'salah' ? `Kode salah. Sisa ${hasil.sisa} kali percobaan.` : PESAN[hasil.alasan])

  return (
    <Card className={`@container overflow-hidden ${className}`}>
      <div className="flex flex-col gap-5 p-5 @2xl:flex-row @2xl:items-center sm:p-6">
        <div className="flex flex-1 items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-50 text-primary-600">
            <KeyRound className="h-6 w-6" />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-slate-900">Presensi hari ini</p>
            <p className="text-sm text-slate-500">Masukkan {PANJANG_KODE} angka kode yang ditampilkan gurumu di kelas.</p>
            {aktif ? (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Presensi dibuka · sisa {formatSisa(sisaDetik(sesi, sekarang.getTime()))}
              </p>
            ) : (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                <Hourglass className="h-3.5 w-3.5" /> Menunggu guru membuka presensi
              </p>
            )}
            {status && (
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
              <button type="submit" className={`${btn.primary} shrink-0`} aria-label="Kirim kode">
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
