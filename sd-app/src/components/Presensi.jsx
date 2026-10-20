import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Circle, CircleCheck, Fingerprint, History, LogIn, LogOut, Users } from 'lucide-react'
import { Avatar, Badge, Card, Cincin, JudulKartu, Modal, btn, inputCls, labelCls } from './ui'
import { useAkses, useGayaSitus } from '../context/akses'
import { useData } from '../context/DataContext'
import { liburPada } from '../utils/acuan'
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
  if (!kode) return <Badge className="bg-abu-100 text-tinta-3">{hariIni ? 'Belum absen' : 'Tidak ada catatan'}</Badge>
  return <Badge className={STATUS_PRESENSI[kode].cls}>{STATUS_PRESENSI[kode].label}</Badge>
}

const dua = (n) => String(n).padStart(2, '0')

function Langkah({ label, jam, ket, tone = 'text-tinta-3' }) {
  return (
    <div className={`ui-ubin rounded-2 px-4 py-3 ${jam ? 'bg-success-subtle' : 'bg-abu-50'}`}>
      <p className="d-flex align-items-center gap-1-5 fs-xs fw-semibold text-tinta-3">
        {jam ? <CircleCheck className="h-3-5 w-3-5 text-success" /> : <Circle className="h-3-5 w-3-5" />} {label}
      </p>
      <p className="mt-0-5 fs-xl fw-extrabold angka text-tinta">{jam ?? '–'}</p>
      {ket && <p className={`fs-xs fw-medium ${tone}`}>{ket}</p>}
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
  const situs = useGayaSitus()
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
    absenStaf(jenis, alasan.trim())
    setKonfirmasi(null)
    setAlasan('')
  }

  let isi
  if (libur) {
    isi = (
      <p className="ui-ubin flex-1 rounded-2 bg-abu-50 px-4 py-4 fs-sm text-tinta-2">
        Hari ini libur{liburPada(todayKey()) ? `: ${liburPada(todayKey())}` : ''}. Presensi dibuka kembali pada hari sekolah berikutnya.{situs ? '' : ' 🌤️'}
      </p>
    )
  } else if (rec && rec.status !== 'H') {
    isi = (
      <div className="ui-ubin flex-1 rounded-2 bg-abu-50 px-4 py-3">
        <p className="fs-sm text-tinta-2">
          Anda tercatat <StatusPresensi kode={kode} /> hari ini{rec.izinId ? ' (izin disetujui Kepala Sekolah)' : ''}.
        </p>
        {rec.ket && <p className="mt-1 fs-xs text-tinta-3">{rec.ket}</p>}
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
        <div className="d-grid flex-1 kolom-2 gap-3">
          <Langkah
            label="Masuk"
            jam={rec?.masuk}
            ket={ketMasuk}
            tone={kode === 'T' || (!rec?.masuk && telat > 0) ? 'text-warning-emphasis' : rec?.masuk ? 'text-success' : 'text-tinta-3'}
          />
          <Langkah label="Pulang" jam={rec?.pulang} ket={ketPulang} tone={pulangCepat(rec, guru) ? 'text-warning-emphasis' : 'text-tinta-3'} />
        </div>
        <div className="kueri-w-44">
          {!rec?.masuk ? (
            <button onClick={() => absen('masuk')} className="btn btn-hijau w-100 py-3">
              <LogIn className="h-5 w-5" /> Absen Masuk
            </button>
          ) : !rec.pulang ? (
            <button onClick={() => absen('pulang')} className={`${btn.primary} w-100 py-3`}>
              <LogOut className="h-5 w-5" /> Absen Pulang
            </button>
          ) : (
            <p className="ui-ubin d-flex align-items-center justify-content-center gap-2 rounded-2 bg-success-subtle px-4 py-3 fs-sm fw-semibold text-success">
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
      <Card className={`wadah-kueri overflow-hidden ${className}`}>
        <div className="d-flex flex-column gap-4 p-5 kueri-baris p-sm-6">
          <div className="d-flex align-items-center gap-4 kueri-w-60">
            <span className="ui-ikon-utama d-flex h-14 w-14 flex-shrink-0 align-items-center justify-content-center rounded-3 bg-merah-50 text-primary">
              <Fingerprint className="h-7 w-7" />
            </span>
            <div>
              <p className="fs-xs fw-bold text-uppercase ls-wider text-abu-400">Presensi Anda</p>
              <p className="fs-3xl fw-extrabold angka text-tinta" aria-live="off">
                {dua(sekarang.getHours())}.{dua(sekarang.getMinutes())}
                <span className="fs-lg text-abu-400">:{dua(sekarang.getSeconds())}</span>
              </p>
              <p className="fs-sm text-tinta-3">
                Jam kerja {jam.masuk} – {jam.pulang}
              </p>
            </div>
          </div>
          {isi}
        </div>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 border-top border-abu-100 bg-abu-50 px-5 py-3 fs-xs text-tinta-3 px-sm-6">
          <span>
            20 hari kerja terakhir: hadir <b className="text-tinta-2">{rekap.persenHadir ?? '–'}%</b> · tepat waktu{' '}
            <b className="text-tinta-2">{rekap.persenTepat ?? '–'}%</b>
            {rekap.rataMasuk && (
              <>
                {' '}
                · rata-rata masuk <b className="text-tinta-2">{rekap.rataMasuk}</b>
              </>
            )}
          </span>
          {rec?.koreksi?.length > 0 && (
            <span className="d-flex align-items-center gap-1 text-warning-emphasis">
              <History className="h-3-5 w-3-5" /> Dikoreksi oleh {rec.koreksi.at(-1).oleh}
            </span>
          )}
          {tautan && (
            <Link to={`${akses.base}/presensi`} className="ui-tautan d-flex align-items-center gap-1 fw-semibold text-primary">
              Papan presensi & izin <ArrowRight className="h-3-5 w-3-5" />
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
        <p className="fs-sm text-tinta-2">
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
        <Link to={`${base}/presensi`} className="ui-tautan d-flex flex-shrink-0 align-items-center gap-1 fs-sm fw-semibold text-primary">
          Papan <ArrowRight className="h-4 w-4" />
        </Link>
      </JudulKartu>
      {libur ? (
        <p className="ui-ubin rounded-2 bg-abu-50 px-4 py-6 text-center fs-sm text-tinta-3">Hari ini libur, tidak ada presensi.</p>
      ) : (
        <>
          <div className="d-flex align-items-center gap-5">
            <Cincin persen={r.total ? (r.hadir / r.total) * 100 : 0}>
              <div>
                <p className="fs-lg fw-extrabold lh-1 text-tinta">
                  {r.hadir}/{r.total}
                </p>
                <p className="mt-0-5 fs-10 text-tinta-3">hadir</p>
              </div>
            </Cincin>
            <ul className="d-grid flex-1 kolom-1 gap-1-5 fs-sm kolom-sm-2">
              {baris.map(([k, label, n]) => (
                <li key={k} className="d-flex align-items-center gap-2">
                  <span className={`h-2-5 w-2-5 rounded-pill ${STATUS_PRESENSI[k].sel}`} />
                  <span className="flex-1 text-tinta-2">{label}</span>
                  <span className="fw-bold text-tinta">{n}</span>
                </li>
              ))}
              <li className="d-flex align-items-center gap-2">
                <span className="h-2-5 w-2-5 rounded-pill bg-abu-300" />
                <span className="flex-1 text-tinta-2">Belum absen</span>
                <span className="fw-bold text-tinta">{r.belum}</span>
              </li>
            </ul>
          </div>
          <ul className="mt-5 d-flex flex-wrap gap-2" aria-label="Status tiap guru dan staf">
            {r.papan.map(({ g, rec, kode }) => (
              <li
                key={g.id}
                className="position-relative"
                title={`${g.nama} — ${kode ? STATUS_PRESENSI[kode].label : 'Belum absen'}${rec?.masuk ? ` ${rec.masuk}` : ''}`}
              >
                <Avatar nama={g.nama} size="sm" className={kode ? '' : 'opacity-40 skala-abu'} />
                <span
                  className={`position-absolute bottom-n0-5 end-n0-5 h-3 w-3 rounded-pill border border-2 border-white ${kode ? STATUS_PRESENSI[kode].sel : 'bg-abu-300'}`}
                />
                <span className="visually-hidden">
                  {g.nama}: {kode ? STATUS_PRESENSI[kode].label : 'Belum absen'}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 fs-xs text-tinta-3">Arahkan kursor ke inisial untuk melihat nama dan jam masuk.</p>
        </>
      )}
    </Card>
  )
}
