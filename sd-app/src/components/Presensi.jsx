import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Circle, CircleCheck, Fingerprint, History, LogIn, LogOut, Users } from 'lucide-react'
import { Avatar, Badge, Card, Cincin, JudulKartu, Modal, btn, inputCls, labelCls } from './ui'
import { useAkses } from '../context/akses'
import { useData } from '../context/DataContext'
import { isHariSekolah, todayKey } from '../utils/format'
import {
  STATUS_PRESENSI,
  durasiKerja,
  jamKerja,
  kodePresensi,
  keMenit,
  menitTerlambat,
  periodePresensi,
  pulangCepat,
  rekapPresensi,
  ringkasPresensi,
} from '../utils/presensi'

// Jam yang diperbarui tiap detik
export function useJamBerjalan() {
  const [sekarang, setSekarang] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setSekarang(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return sekarang
}

// Lencana status presensi. Tanpa kode: "Belum absen" (hari ini) atau "Tidak ada catatan" (hari lalu).
export function StatusPresensi({ kode, hariIni = true }) {
  if (!kode) return <Badge className="bg-slate-100 text-slate-500">{hariIni ? 'Belum absen' : 'Tidak ada catatan'}</Badge>
  return <Badge className={STATUS_PRESENSI[kode].cls}>{STATUS_PRESENSI[kode].label}</Badge>
}

const dua = (n) => String(n).padStart(2, '0')

function Langkah({ label, jam, ket, tone = 'text-slate-500' }) {
  return (
    <div className={`rounded-xl px-4 py-3 ${jam ? 'bg-emerald-50' : 'bg-slate-50'}`}>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        {jam ? <CircleCheck className="h-3.5 w-3.5 text-emerald-600" /> : <Circle className="h-3.5 w-3.5" />} {label}
      </p>
      <p className="mt-0.5 text-xl font-extrabold tabular-nums text-slate-900">{jam ?? '–'}</p>
      {ket && <p className={`text-xs font-medium ${tone}`}>{ket}</p>}
    </div>
  )
}

/*
  Kartu presensi pribadi: jam berjalan, tombol absen masuk/pulang, dan ringkasan 20 hari kerja.
  `tautan` = tampilkan tautan ke halaman Presensi Staf (dipakai di beranda dashboard).
*/
export function KartuPresensiSaya({ tautan = false, className = '' }) {
  const { data, absenStaf } = useData()
  const akses = useAkses()
  const sekarang = useJamBerjalan()
  const [konfirmasi, setKonfirmasi] = useState(null) // 'masuk' | 'pulang' saat perlu alasan
  const [alasan, setAlasan] = useState('')

  const guru = data.guru.find((g) => g.id === akses.guruId)
  if (!guru) return null

  const jam = jamKerja(guru)
  const rec = data.presensiStaf[todayKey()]?.[guru.id]
  const kode = kodePresensi(rec, guru)
  const libur = !isHariSekolah(sekarang)
  const menitIni = sekarang.getHours() * 60 + sekarang.getMinutes()
  const telat = menitIni - keMenit(jam.masuk)
  const sebelumPulang = menitIni < keMenit(jam.pulang)
  const rekap = rekapPresensi(data.presensiStaf, guru, periodePresensi(data.presensiStaf)[0].tanggal)

  const absen = (jenis) => {
    const perluAlasan = jenis === 'masuk' ? telat > 0 : sebelumPulang
    if (perluAlasan && konfirmasi !== jenis) return setKonfirmasi(jenis)
    absenStaf(guru.id, jenis, alasan.trim())
    setKonfirmasi(null)
    setAlasan('')
  }

  let isi
  if (libur) {
    isi = (
      <p className="flex-1 rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-600">Hari ini libur. Presensi dibuka kembali pada hari sekolah berikutnya. 🌤️</p>
    )
  } else if (rec && rec.status !== 'H') {
    isi = (
      <div className="flex-1 rounded-xl bg-slate-50 px-4 py-3">
        <p className="text-sm text-slate-600">
          Anda tercatat <StatusPresensi kode={kode} /> hari ini{rec.izinId ? ' (izin disetujui Kepala Sekolah)' : ''}.
        </p>
        {rec.ket && <p className="mt-1 text-xs text-slate-500">{rec.ket}</p>}
      </div>
    )
  } else {
    const ketMasuk = rec?.masuk
      ? kode === 'T'
        ? `Terlambat ${menitTerlambat(rec, guru)} menit`
        : 'Tepat waktu'
      : telat > 0
        ? `Sudah lewat ${jam.masuk}`
        : `Paling lambat ${jam.masuk}`
    const ketPulang = rec?.pulang ? (pulangCepat(rec, guru) ? 'Pulang lebih awal' : durasiKerja(rec)) : `Mulai ${jam.pulang}`
    isi = (
      <>
        <div className="grid flex-1 grid-cols-2 gap-3">
          <Langkah
            label="Masuk"
            jam={rec?.masuk}
            ket={ketMasuk}
            tone={kode === 'T' || (!rec?.masuk && telat > 0) ? 'text-amber-700' : rec?.masuk ? 'text-emerald-700' : 'text-slate-500'}
          />
          <Langkah label="Pulang" jam={rec?.pulang} ket={ketPulang} tone={pulangCepat(rec, guru) ? 'text-amber-700' : 'text-slate-500'} />
        </div>
        <div className="@2xl:w-44">
          {!rec?.masuk ? (
            <button onClick={() => absen('masuk')} className={`${btn.primary} w-full bg-emerald-600 py-3! hover:bg-emerald-700`}>
              <LogIn className="h-5 w-5" /> Absen Masuk
            </button>
          ) : !rec.pulang ? (
            <button onClick={() => absen('pulang')} className={`${btn.primary} w-full py-3!`}>
              <LogOut className="h-5 w-5" /> Absen Pulang
            </button>
          ) : (
            <p className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <CircleCheck className="h-5 w-5" /> Presensi lengkap
            </p>
          )}
        </div>
      </>
    )
  }

  // Modal diletakkan di luar kartu: @container membuat elemen `fixed` di dalamnya ikut terkurung
  return (
    <>
      <Card className={`@container overflow-hidden ${className}`}>
        <div className="flex flex-col gap-4 p-5 @2xl:flex-row @2xl:items-center sm:p-6">
          <div className="flex items-center gap-4 @2xl:w-60">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary-50 text-primary-600">
              <Fingerprint className="h-7 w-7" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Presensi Anda</p>
              <p className="text-3xl font-extrabold tabular-nums text-slate-900" aria-live="off">
                {dua(sekarang.getHours())}.{dua(sekarang.getMinutes())}
                <span className="text-lg text-slate-400">:{dua(sekarang.getSeconds())}</span>
              </p>
              <p className="text-sm text-slate-500">
                Jam kerja {jam.masuk} – {jam.pulang}
              </p>
            </div>
          </div>
          {isi}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-500 sm:px-6">
          <span>
            20 hari kerja terakhir: hadir <b className="text-slate-700">{rekap.persenHadir ?? '–'}%</b> · tepat waktu{' '}
            <b className="text-slate-700">{rekap.persenTepat ?? '–'}%</b>
            {rekap.rataMasuk && (
              <>
                {' '}
                · rata-rata masuk <b className="text-slate-700">{rekap.rataMasuk}</b>
              </>
            )}
          </span>
          {rec?.koreksi?.length > 0 && (
            <span className="flex items-center gap-1 text-amber-700">
              <History className="h-3.5 w-3.5" /> Dikoreksi oleh {rec.koreksi.at(-1).oleh}
            </span>
          )}
          {tautan && (
            <Link to={`${akses.base}/presensi`} className="flex items-center gap-1 font-semibold text-primary-600">
              Papan presensi & izin <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </Card>

      <Modal
        open={!!konfirmasi}
        onClose={() => setKonfirmasi(null)}
        title={konfirmasi === 'masuk' ? `Anda terlambat ${telat} menit` : 'Pulang sebelum jam kerja selesai?'}
        size="max-w-md"
        footer={
          <>
            <button onClick={() => setKonfirmasi(null)} className={btn.secondary}>
              Batal
            </button>
            <button onClick={() => absen(konfirmasi)} className={btn.primary}>
              {konfirmasi === 'masuk' ? <LogIn className="h-4 w-4" /> : <LogOut className="h-4 w-4" />} Absen {konfirmasi === 'masuk' ? 'Masuk' : 'Pulang'} (
              {dua(sekarang.getHours())}.{dua(sekarang.getMinutes())})
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          {konfirmasi === 'masuk'
            ? `Batas jam masuk adalah ${jam.masuk}. Jam masuk Anda akan tercatat terlambat dan terlihat oleh semua staf.`
            : `Jam kerja selesai pukul ${jam.pulang}. Jika ada keperluan mendesak, tuliskan alasannya.`}
        </p>
        <label htmlFor="alasan-presensi" className={`${labelCls} mt-4`}>
          Alasan (opsional, hanya terlihat oleh Anda dan Kepala Sekolah)
        </label>
        <textarea
          id="alasan-presensi"
          rows={3}
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
          className={inputCls}
          placeholder={konfirmasi === 'masuk' ? 'Contoh: Ban motor bocor di jalan.' : 'Contoh: Mengantar anak ke dokter.'}
        />
      </Modal>
    </>
  )
}

// Ringkasan kehadiran seluruh guru & staf hari ini, untuk beranda dashboard
export function RingkasanPresensi({ className = '' }) {
  const { data } = useData()
  const { base } = useAkses()
  const r = ringkasPresensi(data)
  const libur = !isHariSekolah(new Date())
  const baris = [
    ['H', 'Tepat waktu', r.tepat],
    ['T', 'Terlambat', r.terlambat],
    ['D', 'Dinas luar', r.dinas],
    ['I', 'Izin/sakit/cuti', r.izin],
  ]

  return (
    <Card className={`p-6 ${className}`}>
      <JudulKartu icon={Users} judul="Kehadiran guru & staf hari ini">
        <Link to={`${base}/presensi`} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-600">
          Papan <ArrowRight className="h-4 w-4" />
        </Link>
      </JudulKartu>
      {libur ? (
        <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Hari ini libur, tidak ada presensi.</p>
      ) : (
        <>
          <div className="flex items-center gap-5">
            <Cincin persen={r.total ? (r.hadir / r.total) * 100 : 0}>
              <div>
                <p className="text-lg font-extrabold leading-none text-slate-900">
                  {r.hadir}/{r.total}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">hadir</p>
              </div>
            </Cincin>
            <ul className="grid flex-1 grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
              {baris.map(([k, label, n]) => (
                <li key={k} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${STATUS_PRESENSI[k].sel}`} />
                  <span className="flex-1 text-slate-600">{label}</span>
                  <span className="font-bold text-slate-900">{n}</span>
                </li>
              ))}
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="flex-1 text-slate-600">Belum absen</span>
                <span className="font-bold text-slate-900">{r.belum}</span>
              </li>
            </ul>
          </div>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Status tiap guru dan staf">
            {r.papan.map(({ g, rec, kode }) => (
              <li
                key={g.id}
                className="relative"
                title={`${g.nama} — ${kode ? STATUS_PRESENSI[kode].label : 'Belum absen'}${rec?.masuk ? ` ${rec.masuk}` : ''}`}
              >
                <Avatar nama={g.nama} size="sm" className={kode ? '' : 'opacity-40 grayscale'} />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white ${kode ? STATUS_PRESENSI[kode].sel : 'bg-slate-300'}`}
                />
                <span className="sr-only">
                  {g.nama}: {kode ? STATUS_PRESENSI[kode].label : 'Belum absen'}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Arahkan kursor ke inisial untuk melihat nama dan jam masuk.</p>
        </>
      )}
    </Card>
  )
}
