import { useState } from 'react'
import {
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FilePlus,
  FileText,
  HeartPulse,
  History,
  Info,
  Lock,
  Palmtree,
  Paperclip,
  PencilLine,
  Search,
  Send,
  Timer,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { KartuPresensiSaya, StatusPresensi } from '../../components/Presensi'
import { Alert, Avatar, Badge, Card, DashHeader, EmptyState, IzinBadge, Modal, Progres, StatCard, Tabs, btn, inputCls, labelCls } from '../../components/ui'
import { useAkses } from '../../context/akses'
import { useData } from '../../context/DataContext'
import { JENIS_IZIN_STAF } from '../../data/dummy'
import { liburPada } from '../../utils/acuan'
import { formatHari, formatTanggal, isHariSekolah, namaHari, parseKey, rentangHariSekolah, tambahHari, todayKey } from '../../utils/format'
import { unduhFileCsv } from '../../utils/keamanan'
import {
  KODE_IZIN_STAF,
  STATUS_PRESENSI,
  durasiKerja,
  jamKerja,
  kodePresensi,
  menitTerlambat,
  periodePresensi,
  pulangCepat,
  rekapPresensi,
  ringkasPresensi,
} from '../../utils/presensi'

const IKON_IZIN = { Sakit: HeartPulse, Izin: FileText, Cuti: Palmtree, 'Dinas Luar': Briefcase }

// Rincian pribadi (alasan izin & keterlambatan) hanya untuk yang bersangkutan dan Kepala Sekolah
const bolehLihat = (akses, guruId) => akses.kepsek || akses.guruId === guruId

const rentang = (a, b) => (a === b ? formatTanggal(a) : `${formatTanggal(a, { year: undefined })} – ${formatTanggal(b)}`)

const ringkasCatatan = (c) => `${STATUS_PRESENSI[c.status]?.label ?? '–'}${c.masuk ? ` ${c.masuk}` : ''}${c.pulang ? `–${c.pulang}` : ''}`

const waktuLengkap = (iso) => new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

// Keterangan satu catatan presensi; `kosong` ditampilkan jika tidak ada keterangan
function Keterangan({ rec, g, kosong = '–' }) {
  const akses = useAkses()
  if (!rec) return kosong
  const boleh = bolehLihat(akses, g.id)
  const isi = []
  if (rec.status === 'D' && rec.ket) isi.push(<p key="ket">{rec.ket}</p>)
  else if (rec.status !== 'H' && rec.ket)
    isi.push(
      boleh ? (
        <p key="ket">{rec.ket}</p>
      ) : (
        <p key="ket" className="d-flex align-items-center gap-1 text-abu-400">
          <Lock className="h-3 w-3" /> Rincian bersifat pribadi
        </p>
      ),
    )
  if (rec.izinId)
    isi.push(
      <p key="izin" className="text-success">
        Izin disetujui Kepala Sekolah
      </p>,
    )
  if (boleh && rec.alasanMasuk) isi.push(<p key="am">Alasan terlambat: {rec.alasanMasuk}</p>)
  if (boleh && rec.alasanPulang) isi.push(<p key="ap">Alasan pulang awal: {rec.alasanPulang}</p>)
  if (rec.koreksi?.length) {
    const k = rec.koreksi.at(-1)
    isi.push(
      <p key="kr" className="d-flex align-items-start gap-1 text-warning-emphasis">
        <History className="mt-0-5 h-3 w-3 flex-shrink-0" /> Dikoreksi {k.oleh}: {k.alasan}
      </p>,
    )
  }
  return isi.length ? <div className="antara-y-0-5">{isi}</div> : kosong
}

function RiwayatKoreksi({ koreksi }) {
  return (
    <div className="rounded-2 border border-warning-subtle bg-warning-subtle p-3">
      <p className="mb-2 d-flex align-items-center gap-1-5 fs-xs fw-bold text-warning-emphasis">
        <History className="h-3-5 w-3-5" /> Riwayat koreksi
      </p>
      <ul className="antara-y-2 fs-xs text-tinta-2">
        {[...koreksi].reverse().map((k) => (
          <li key={k.waktu}>
            <span className="fw-semibold text-tinta">{k.oleh}</span> · {waktuLengkap(k.waktu)}
            <span className="d-block">
              Sebelumnya: {k.sebelum ? ringkasCatatan(k.sebelum) : 'tidak ada catatan'} — {k.alasan}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const SARING = [
  ['semua', 'Semua', () => true],
  ['H', 'Tepat waktu', (k) => k === 'H'],
  ['T', 'Terlambat', (k) => k === 'T'],
  ['D', 'Dinas luar', (k) => k === 'D'],
  ['izin', 'Izin/sakit/cuti', (k) => ['I', 'S', 'C'].includes(k)],
  ['A', 'Alpa', (k) => k === 'A'],
  ['belum', 'Belum absen', (k) => !k],
]

// Hari sekolah terdekat sebelum/sesudah tanggal (n = -1 atau 1)
function hariSekolahGeser(tanggal, n) {
  let t = tambahHari(tanggal, n)
  while (!isHariSekolah(parseKey(t))) t = tambahHari(t, n)
  return t
}

function PapanHarian({ onDetail, onKoreksi }) {
  const { data } = useData()
  const akses = useAkses()
  const hariIni = todayKey()
  const [tanggal, setTanggal] = useState(hariIni)
  const [saring, setSaring] = useState('semua')
  const [cari, setCari] = useState('')

  const r = ringkasPresensi(data, tanggal)
  const adalahHariIni = tanggal === hariIni
  const libur = !isHariSekolah(parseKey(tanggal))
  const berikut = hariSekolahGeser(tanggal, 1)
  const cocok = (kode, k) => SARING.find((s) => s[0] === kode)[2](k)
  const jumlah = (kode) => r.papan.filter((p) => cocok(kode, p.kode)).length
  const daftar = r.papan.filter((p) => cocok(saring, p.kode) && p.g.nama.toLowerCase().includes(cari.trim().toLowerCase()))
  const totalTelat = r.papan.reduce((a, p) => a + menitTerlambat(p.rec, p.g), 0)

  return (
    <>
      <div className="mb-4 d-grid kolom-2 gap-4 kolom-lg-4">
        <StatCard icon={UserCheck} label="Hadir di sekolah" value={`${r.tepat + r.terlambat}/${r.total}`} hint={`${r.tepat} tepat waktu`} tone="emerald" />
        <StatCard icon={Timer} label="Terlambat" value={r.terlambat} hint={totalTelat ? `total ${totalTelat} menit` : 'tidak ada'} tone="amber" />
        <StatCard icon={Briefcase} label="Dinas luar & izin" value={r.dinas + r.izin} hint={`${r.dinas} dinas · ${r.izin} izin/sakit/cuti`} tone="sky" />
        <StatCard
          icon={Clock}
          label={adalahHariIni ? 'Belum absen' : 'Tanpa catatan'}
          value={r.belum}
          hint={r.alpa ? `${r.alpa} alpa` : adalahHariIni ? 'per saat ini' : formatTanggal(tanggal, { year: undefined })}
          tone="slate"
        />
      </div>

      <Card className="mb-4 d-flex flex-column gap-3 p-4 flex-lg-row align-items-lg-center justify-content-lg-between">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button
            onClick={() => setTanggal(hariSekolahGeser(tanggal, -1))}
            className="rounded-1 border border-abu-200 p-2 text-tinta-2 hover-latar"
            aria-label="Hari sekolah sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input
            type="date"
            value={tanggal}
            max={hariIni}
            onChange={(e) => e.target.value && setTanggal(e.target.value)}
            className={`${inputCls} w-auto`}
            aria-label="Pilih tanggal"
          />
          <button
            onClick={() => setTanggal(berikut)}
            disabled={berikut > hariIni}
            className="rounded-1 border border-abu-200 p-2 text-tinta-2 hover-latar"
            aria-label="Hari sekolah berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="fs-sm fw-semibold text-tinta-2">{formatHari(tanggal)}</span>
          {!adalahHariIni && (
            <button onClick={() => setTanggal(hariIni)} className="fs-sm fw-semibold text-primary hover-garis-bawah">
              Kembali ke hari ini
            </button>
          )}
        </div>
        <div className="position-relative w-lg-64">
          <Search className="pe-none position-absolute start-3-5 top-50 h-4 w-4 translate-middle-y text-abu-400" />
          <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama..." className={`${inputCls} ps-10`} />
        </div>
      </Card>

      {libur ? (
        <Card>
          <EmptyState
            icon={Clock}
            title={liburPada(tanggal) ? `Libur: ${liburPada(tanggal)}` : 'Hari libur'}
            desc={liburPada(tanggal) ? 'Tanggal ini libur di kalender akademik, tidak ada presensi. Pilih hari sekolah lain.' : 'Tidak ada presensi pada akhir pekan. Pilih hari sekolah lain.'}
          />
        </Card>
      ) : (
        <>
          <div className="mb-4 d-flex flex-wrap gap-2">
            {SARING.filter(([k]) => k === 'semua' || k === saring || jumlah(k) > 0).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setSaring(k)}
                aria-pressed={saring === k}
                className={`ui-saring rounded-pill px-3-5 py-1-5 fs-sm fw-semibold transisi ${
                  saring === k ? 'bg-tinta text-white' : 'bg-white text-tinta-2 border border-abu-200 hover-latar'
                }`}
              >
                {k === 'belum' && !adalahHariIni ? 'Tanpa catatan' : label}
                <span className="ms-1-5 fs-xs opacity-70">{jumlah(k)}</span>
              </button>
            ))}
          </div>

          <Card className="overflow-hidden">
            {daftar.length === 0 ? (
              <EmptyState icon={Users} title="Tidak ada yang cocok" desc="Coba ubah saringan atau kata pencarian." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-100 min-w-860 text-start fs-sm">
                  <thead className="bg-abu-50 fs-xs text-uppercase ls-wider text-tinta-3">
                    <tr>
                      <th className="px-5 py-3 fw-semibold">Guru / Staf</th>
                      <th className="px-3 py-3 fw-semibold">Jam kerja</th>
                      <th className="px-3 py-3 fw-semibold">Masuk</th>
                      <th className="px-3 py-3 fw-semibold">Pulang</th>
                      <th className="px-3 py-3 fw-semibold">Status</th>
                      <th className="px-3 py-3 fw-semibold">Keterangan</th>
                      {akses.kepsek && <th className="px-5 py-3 text-end fw-semibold">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="pembatas-y pembatas-abu">
                    {daftar.map(({ g, rec, kode }) => {
                      const saya = g.id === akses.guruId
                      const jam = jamKerja(g)
                      const telat = menitTerlambat(rec, g)
                      return (
                        <tr key={g.id} className={saya ? 'bg-merah-50' : 'hover-latar'}>
                          <td className="px-5 py-3">
                            <button onClick={() => onDetail(g.id)} className="grup d-flex align-items-center gap-3 text-start">
                              <Avatar nama={g.nama} size="sm" />
                              <span>
                                <span className="d-block fw-semibold text-tinta judul-sorot">
                                  {g.nama}
                                  {saya && <Badge className="ms-2 bg-merah-100 text-merah-700">Anda</Badge>}
                                </span>
                                <span className="d-block fs-xs text-tinta-3">{g.jabatan}</span>
                              </span>
                            </button>
                          </td>
                          <td className="text-nowrap px-3 py-3 angka text-tinta-3">
                            {jam.masuk}–{jam.pulang}
                          </td>
                          <td className="text-nowrap px-3 py-3 angka">
                            <span className="fw-semibold text-tinta">{rec?.masuk ?? '–'}</span>
                            {telat > 0 && <span className="d-block fs-xs fw-medium text-warning-emphasis">+{telat} menit</span>}
                          </td>
                          <td className="text-nowrap px-3 py-3 angka">
                            <span className="fw-semibold text-tinta">{rec?.pulang ?? '–'}</span>
                            {pulangCepat(rec, g) && <span className="d-block fs-xs fw-medium text-warning-emphasis">lebih awal</span>}
                            {rec?.status === 'H' && rec.masuk && !rec.pulang && tanggal < hariIni && (
                              <span className="d-block fs-xs text-abu-400">tidak absen pulang</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <StatusPresensi kode={kode} hariIni={adalahHariIni} />
                          </td>
                          <td className="mw-xs px-3 py-3 fs-xs text-tinta-2">
                            <Keterangan rec={rec} g={g} />
                          </td>
                          {akses.kepsek && (
                            <td className="px-5 py-3 text-end">
                              <button
                                onClick={() => onKoreksi({ g, rec, tanggal })}
                                className="d-inline-flex align-items-center gap-1 rounded-1 px-2-5 py-1-5 fs-xs fw-semibold text-tinta-2 hover-latar-abu"
                              >
                                <PencilLine className="h-3-5 w-3-5" /> Koreksi
                              </button>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <p className="d-flex align-items-start gap-2 border-top border-abu-100 px-5 py-3 fs-xs text-tinta-3">
              <Eye className="mt-0-5 h-3-5 w-3-5 flex-shrink-0" />
              Semua guru & staf dapat melihat papan ini. Alasan izin dan keterlambatan hanya terlihat oleh yang bersangkutan dan Kepala Sekolah. Setiap koreksi
              tercatat beserta nama pengoreksi dan alasannya.
            </p>
          </Card>
        </>
      )}
    </>
  )
}

const keJam = (j) => (j ? j.replace('.', ':') : '')
const dariJam = (j) => (j ? j.replace(':', '.') : null)

// Koreksi presensi oleh Kepala Sekolah
function ModalKoreksi({ item, onClose }) {
  const { koreksiPresensi } = useData()
  const { nama } = useAkses()
  const { g, rec, tanggal } = item
  const [form, setForm] = useState({ status: rec?.status ?? 'H', masuk: keJam(rec?.masuk), pulang: keJam(rec?.pulang), ket: rec?.ket ?? '', alasan: '' })
  const [galat, setGalat] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const [menyimpan, setMenyimpan] = useState(false)

  const simpan = async (e) => {
    e.preventDefault()
    if (menyimpan) return
    if (form.status === 'H' && !form.masuk) return setGalat('Isi jam masuk untuk status Hadir.')
    if (form.status === 'H' && form.pulang && form.pulang <= form.masuk) return setGalat('Jam pulang harus setelah jam masuk.')
    if (!form.alasan.trim()) return setGalat('Alasan koreksi wajib diisi.')
    const perubahan =
      form.status === 'H'
        ? { status: 'H', masuk: dariJam(form.masuk), pulang: dariJam(form.pulang) }
        : { status: form.status, masuk: null, pulang: null, ket: form.ket.trim() }
    // Nama pengoreksi & waktunya dicatat server
    setMenyimpan(true)
    const pesan = await koreksiPresensi(tanggal, g.id, perubahan, form.alasan.trim(), { diam: true })
    setMenyimpan(false)
    if (pesan) return setGalat(pesan)
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Koreksi presensi"
      footer={
        <>
          <button onClick={onClose} className={btn.secondary}>
            Batal
          </button>
          <button type="submit" form="form-koreksi" disabled={menyimpan} className={btn.primary}>
            <Check className="h-4 w-4" /> Simpan koreksi
          </button>
        </>
      }
    >
      <div className="mb-4 d-flex align-items-center gap-3 rounded-2 bg-abu-50 p-3">
        <Avatar nama={g.nama} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="fw-semibold text-tinta">{g.nama}</p>
          <p className="fs-xs text-tinta-3">{formatHari(tanggal)}</p>
        </div>
        <StatusPresensi kode={kodePresensi(rec, g)} hariIni={tanggal === todayKey()} />
      </div>
      <form id="form-koreksi" onSubmit={simpan} className="antara-y-4">
        {galat && <Alert tone="error">{galat}</Alert>}
        <div>
          <label htmlFor="status-koreksi" className={labelCls}>
            Status
          </label>
          <select id="status-koreksi" value={form.status} onChange={set('status')} className={inputCls}>
            {Object.entries(STATUS_PRESENSI)
              .filter(([k]) => k !== 'T')
              .map(([k, s]) => (
                <option key={k} value={k}>
                  {s.label}
                </option>
              ))}
          </select>
          {form.status === 'H' && <p className="mt-1 fs-xs text-tinta-3">Status terlambat dihitung otomatis dari jam masuk.</p>}
        </div>
        {form.status === 'H' ? (
          <div className="d-grid kolom-2 gap-3">
            <div>
              <label htmlFor="jam-masuk" className={labelCls}>
                Jam masuk
              </label>
              <input id="jam-masuk" type="time" value={form.masuk} onChange={set('masuk')} className={inputCls} />
            </div>
            <div>
              <label htmlFor="jam-pulang" className={labelCls}>
                Jam pulang
              </label>
              <input id="jam-pulang" type="time" value={form.pulang} onChange={set('pulang')} className={inputCls} />
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="ket-koreksi" className={labelCls}>
              Keterangan
            </label>
            <input id="ket-koreksi" value={form.ket} onChange={set('ket')} className={inputCls} placeholder="Contoh: Rapat di Dinas Pendidikan" />
          </div>
        )}
        <div>
          <label htmlFor="alasan-koreksi" className={labelCls}>
            Alasan koreksi <span className="text-danger">*</span>
          </label>
          <textarea
            id="alasan-koreksi"
            rows={2}
            value={form.alasan}
            onChange={set('alasan')}
            className={inputCls}
            placeholder="Contoh: Lupa absen masuk, kehadiran dikonfirmasi satpam."
          />
          <p className="mt-1 fs-xs text-tinta-3">Koreksi dicatat atas nama {nama} dan terlihat oleh semua guru & staf.</p>
        </div>
        {rec?.koreksi?.length > 0 && <RiwayatKoreksi koreksi={rec.koreksi} />}
      </form>
    </Modal>
  )
}

const URUT = { jabatan: 'Urut jabatan', hadir: 'Kehadiran terendah', telat: 'Terlambat terbanyak' }

function Legenda() {
  return (
    <div className="d-flex flex-wrap column-gap-4 row-gap-2 border-top border-abu-100 px-5 py-3 fs-xs text-tinta-2">
      {Object.entries(STATUS_PRESENSI).map(([k, s]) => (
        <span key={k} className="d-flex align-items-center gap-1-5">
          <span className={`d-flex h-5 w-5 align-items-center justify-content-center rounded-1 fs-10 fw-bold ${s.sel}`}>{k}</span>
          {s.label}
        </span>
      ))}
      <span className="d-flex align-items-center gap-1-5">
        <span className="d-flex h-5 w-5 align-items-center justify-content-center rounded-1 bg-abu-100 text-abu-400">·</span>
        Tidak ada catatan
      </span>
    </div>
  )
}

function Angka({ n }) {
  return <td className={`px-2 py-3 text-center angka ${n ? 'fw-semibold text-tinta' : 'text-abu-300'}`}>{n}</td>
}

const warnaPersen = (p) => (p >= 95 ? 'titik-emerald' : p >= 85 ? 'titik-amber' : 'titik-rose')

function Rekap({ onDetail }) {
  const { data } = useData()
  const akses = useAkses()
  const periode = periodePresensi(data.presensiStaf)
  const [kode, setKode] = useState('20')
  const [urut, setUrut] = useState('jabatan')
  const hariIni = todayKey()

  const p = periode.find((x) => x.kode === kode) ?? periode[0]
  let baris = data.guru.map((g) => ({ g, r: rekapPresensi(data.presensiStaf, g, p.tanggal) }))
  if (urut === 'hadir') baris = [...baris].sort((a, b) => (a.r.persenHadir ?? 101) - (b.r.persenHadir ?? 101))
  if (urut === 'telat') baris = [...baris].sort((a, b) => b.r.T - a.r.T || b.r.menitTelat - a.r.menitTelat)

  const total = (k) => baris.reduce((a, b) => a + b.r[k], 0)
  const tercatat = total('tercatat')
  const persenHadir = tercatat ? Math.round((total('hadir') / tercatat) * 100) : null
  const diSekolah = total('H') + total('T')
  const persenTepat = diSekolah ? Math.round((total('H') / diSekolah) * 100) : null

  // Unduh rekap sebagai CSV untuk diolah di Excel
  const unduhCsv = () => {
    const kepala = [
      'Nama',
      'Jabatan',
      'Hari tercatat',
      'Hadir tepat waktu',
      'Terlambat',
      'Menit terlambat',
      'Dinas luar',
      'Izin',
      'Sakit',
      'Cuti',
      'Alpa',
      'Kehadiran (%)',
      'Tepat waktu (%)',
      'Rata-rata masuk',
      'Tidak absen pulang',
      'Pulang awal',
    ]
    const isi = baris.map(({ g, r }) => [
      g.nama,
      g.jabatan,
      r.tercatat,
      r.H,
      r.T,
      r.menitTelat,
      r.D,
      r.I,
      r.S,
      r.C,
      r.A,
      r.persenHadir ?? '',
      r.persenTepat ?? '',
      r.rataMasuk ?? '',
      r.lupaPulang,
      r.pulangAwal,
    ])
    unduhFileCsv(`presensi-staf-${p.kode === '20' ? '20-hari-terakhir' : p.kode}.csv`, [kepala, ...isi])
  }

  return (
    <>
      <Card className="mb-4 d-flex flex-column gap-3 p-4 flex-sm-row align-items-sm-center justify-content-sm-between">
        <div className="d-flex flex-wrap gap-3">
          <select value={p.kode} onChange={(e) => setKode(e.target.value)} className={`${inputCls} w-auto`} aria-label="Periode rekap">
            {periode.map((x) => (
              <option key={x.kode} value={x.kode}>
                {x.label}
              </option>
            ))}
          </select>
          <select value={urut} onChange={(e) => setUrut(e.target.value)} className={`${inputCls} w-auto`} aria-label="Urutan">
            {Object.entries(URUT).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button onClick={unduhCsv} className={btn.secondary}>
          <Download className="h-4 w-4" /> Unduh CSV
        </button>
      </Card>

      <div className="mb-4 d-grid kolom-2 gap-4 kolom-lg-4">
        <StatCard
          icon={UserCheck}
          label="Rata-rata kehadiran"
          value={persenHadir === null ? '–' : `${persenHadir}%`}
          hint={`${p.tanggal.length} hari kerja`}
          tone="emerald"
        />
        <StatCard icon={Clock} label="Ketepatan waktu" value={persenTepat === null ? '–' : `${persenTepat}%`} hint="dari hari hadir di sekolah" tone="sky" />
        <StatCard icon={Timer} label="Keterlambatan" value={`${total('T')} kali`} hint={`total ${total('menitTelat')} menit`} tone="amber" />
        <StatCard
          icon={FileText}
          label="Izin, sakit, cuti"
          value={`${total('I') + total('S') + total('C')} hari`}
          hint={`${total('D')} hari dinas · ${total('A')} alpa`}
          tone="primary"
        />
      </div>

      <Card className="mb-4 overflow-hidden">
        <div className="border-bottom border-abu-100 px-5 py-4">
          <h2 className="fw-bold text-tinta">Kalender kehadiran</h2>
          <p className="fs-sm text-tinta-3">Satu kotak = satu hari kerja. Arahkan kursor ke kotak untuk melihat jam masuk dan pulang.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="fs-xs">
            <thead>
              <tr>
                <th className="position-sticky start-0 z-10 bg-white px-5 py-2 text-start fw-semibold text-tinta-3">Nama</th>
                {p.tanggal.map((t) => (
                  <th key={t} className={`px-0-5 py-2 text-center fw-semibold angka ${t === hariIni ? 'text-primary' : 'text-tinta-3'}`}>
                    <span className="d-block fs-10 fw-medium text-abu-400">{namaHari(t).slice(0, 3)}</span>
                    {parseKey(t).getDate()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {baris.map(({ g }) => (
                <tr key={g.id}>
                  <th scope="row" className="position-sticky start-0 z-10 bg-white px-5 py-0-5 text-start fw-semibold text-tinta-2">
                    <button
                      onClick={() => onDetail(g.id)}
                      className={`d-block mw-44 text-truncate hover-teks-merah ${g.id === akses.guruId ? 'text-merah-700' : ''}`}
                    >
                      {g.nama.split(',')[0]}
                    </button>
                  </th>
                  {p.tanggal.map((t) => {
                    const rec = data.presensiStaf[t]?.[g.id]
                    const k = kodePresensi(rec, g)
                    const label = k ? STATUS_PRESENSI[k].label : 'Tidak ada catatan'
                    const jam = rec?.masuk ? ` · ${rec.masuk}–${rec.pulang ?? '…'}` : ''
                    return (
                      <td key={t} className="px-0-5 py-0-5">
                        <span
                          title={`${g.nama.split(',')[0]} · ${formatTanggal(t, { weekday: 'short', year: undefined })}: ${label}${jam}`}
                          className={`d-flex h-7 w-7 align-items-center justify-content-center rounded-1 fs-2xs fw-bold ${k ? STATUS_PRESENSI[k].sel : 'bg-abu-100 text-abu-400'} ${
                            rec?.koreksi?.length ? 'cincin-tanda' : ''
                          }`}
                        >
                          {k ?? '·'}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Legenda />
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-100 min-w-980 text-start fs-sm">
            <thead className="bg-abu-50 fs-xs text-uppercase ls-wider text-tinta-3">
              <tr>
                <th className="px-5 py-3 fw-semibold">Guru / Staf</th>
                <th className="px-2 py-3 text-center fw-semibold">Tepat</th>
                <th className="px-2 py-3 text-center fw-semibold">Telat</th>
                <th className="px-2 py-3 text-center fw-semibold">Dinas</th>
                <th className="px-2 py-3 text-center fw-semibold">Izin</th>
                <th className="px-2 py-3 text-center fw-semibold">Sakit</th>
                <th className="px-2 py-3 text-center fw-semibold">Cuti</th>
                <th className="px-2 py-3 text-center fw-semibold">Alpa</th>
                <th className="px-3 py-3 fw-semibold">Kehadiran</th>
                <th className="px-2 py-3 text-center fw-semibold">Tepat waktu</th>
                <th className="px-2 py-3 text-center fw-semibold">Rata² masuk</th>
                <th className="px-5 py-3 fw-semibold">Catatan</th>
              </tr>
            </thead>
            <tbody className="pembatas-y pembatas-abu">
              {baris.map(({ g, r }) => (
                <tr key={g.id} className={g.id === akses.guruId ? 'bg-merah-50' : 'hover-latar'}>
                  <td className="px-5 py-3">
                    <button onClick={() => onDetail(g.id)} className="grup d-flex align-items-center gap-3 text-start">
                      <Avatar nama={g.nama} size="sm" />
                      <span>
                        <span className="d-block fw-semibold text-tinta judul-sorot">{g.nama}</span>
                        <span className="d-block fs-xs text-tinta-3">{g.jabatan}</span>
                      </span>
                    </button>
                  </td>
                  <Angka n={r.H} />
                  <td className={`px-2 py-3 text-center angka ${r.T ? 'fw-semibold text-warning-emphasis' : 'text-abu-300'}`}>
                    {r.T}
                    {r.T > 0 && <span className="d-block text-nowrap fs-2xs fw-normal text-abu-400">{r.menitTelat} mnt</span>}
                  </td>
                  <Angka n={r.D} />
                  <Angka n={r.I} />
                  <Angka n={r.S} />
                  <Angka n={r.C} />
                  <td className={`px-2 py-3 text-center angka ${r.A ? 'fw-semibold text-danger' : 'text-abu-300'}`}>{r.A}</td>
                  <td className="w-44 px-3 py-3">
                    <div className="d-flex align-items-center gap-2">
                      <Progres nilai={r.persenHadir ?? 0} warna={warnaPersen(r.persenHadir ?? 0)} className="flex-1" />
                      <span className="w-10 text-end fw-bold angka text-tinta">{r.persenHadir === null ? '–' : `${r.persenHadir}%`}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center angka text-tinta-2">{r.persenTepat === null ? '–' : `${r.persenTepat}%`}</td>
                  <td className="px-2 py-3 text-center angka text-tinta-2">{r.rataMasuk ?? '–'}</td>
                  <td className="px-5 py-3 fs-xs text-tinta-3">
                    {[r.lupaPulang > 0 && `${r.lupaPulang}× tidak absen pulang`, r.pulangAwal > 0 && `${r.pulangAwal}× pulang awal`]
                      .filter(Boolean)
                      .join(' · ') || '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="d-flex align-items-start gap-2 border-top border-abu-100 px-5 py-3 fs-xs text-tinta-3">
          <Info className="mt-0-5 h-3-5 w-3-5 flex-shrink-0" />
          Kehadiran = (hadir + dinas luar) ÷ hari yang tercatat. Ketepatan waktu dihitung dari hari hadir di sekolah. Hari tanpa catatan tidak ikut dihitung.
          Kotak bergaris tepi di kalender menandakan catatan yang pernah dikoreksi.
        </p>
      </Card>
    </>
  )
}

function DaftarIzin() {
  const { data, prosesIzinStaf, batalkanIzinStaf } = useData()
  const akses = useAkses()
  const [saring, setSaring] = useState('Menunggu')
  const [catatan, setCatatan] = useState({})

  const semua = [...data.izinStaf].sort((a, b) => b.diajukan.localeCompare(a.diajukan))
  const pilihan = [
    ['Menunggu', 'Menunggu', (i) => i.status === 'Menunggu'],
    ['Semua', 'Semua', () => true],
    ...(akses.guruId ? [['Saya', 'Pengajuan saya', (i) => i.guruId === akses.guruId]] : []),
  ]
  const cocok = pilihan.find((x) => x[0] === saring)?.[2] ?? (() => true)
  const daftar = semua.filter(cocok)
  const jabatan = (id) => data.guru.find((g) => g.id === id)?.jabatan ?? ''

  const proses = async (id, status) => {
    if (await prosesIzinStaf(id, status, catatan[id]?.trim() || '')) return
    setCatatan({ ...catatan, [id]: '' })
  }

  return (
    <>
      <div className="mb-4 d-flex flex-wrap gap-2">
        {pilihan.map(([k, label, f]) => (
          <button
            key={k}
            onClick={() => setSaring(k)}
            aria-pressed={saring === k}
            className={`ui-saring rounded-pill px-3-5 py-1-5 fs-sm fw-semibold transisi ${
              saring === k ? 'bg-tinta text-white' : 'bg-white text-tinta-2 border border-abu-200 hover-latar'
            }`}
          >
            {label}
            <span className="ms-1-5 fs-xs opacity-70">{semua.filter(f).length}</span>
          </button>
        ))}
      </div>

      {daftar.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="Tidak ada pengajuan"
            desc={saring === 'Menunggu' ? 'Semua pengajuan izin sudah diproses.' : 'Belum ada pengajuan izin.'}
          />
        </Card>
      ) : (
        <div className="d-grid gap-4 kolom-lg-2">
          {daftar.map((i) => {
            const Icon = IKON_IZIN[i.jenis] ?? FileText
            const boleh = bolehLihat(akses, i.guruId)
            const hari = rentangHariSekolah(i.tanggalMulai, i.tanggalSelesai).length
            return (
              <Card key={i.id} className="d-flex flex-column p-5">
                <div className="d-flex align-items-start gap-3">
                  <Avatar nama={i.nama} />
                  <div className="min-w-0 flex-1">
                    <p className="fw-bold text-tinta">{i.nama}</p>
                    <p className="fs-xs text-tinta-3">{jabatan(i.guruId)}</p>
                  </div>
                  <IzinBadge status={i.status} />
                </div>
                <div className="mt-4 d-flex flex-wrap align-items-center gap-2 fs-sm">
                  <Badge className={STATUS_PRESENSI[KODE_IZIN_STAF[i.jenis]].cls}>
                    <Icon className="me-1 h-3-5 w-3-5" /> {i.jenis}
                  </Badge>
                  <span className="fw-medium text-tinta-2">{rentang(i.tanggalMulai, i.tanggalSelesai)}</span>
                  <span className="fs-xs text-abu-400">· {hari} hari kerja</span>
                </div>

                {boleh || i.jenis === 'Dinas Luar' ? (
                  <>
                    <p className="mt-3 rounded-2 bg-abu-50 px-4 py-3 fs-sm text-tinta-2">{i.alasan}</p>
                    {i.lampiran && (
                      <p className="mt-2 d-flex align-items-center gap-1-5 fs-xs text-tinta-3">
                        <Paperclip className="h-3-5 w-3-5" /> {i.lampiran}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-3 d-flex align-items-center gap-1-5 rounded-2 bg-abu-50 px-4 py-3 fs-xs text-tinta-3">
                    <Lock className="h-3-5 w-3-5" /> Alasan hanya dapat dilihat oleh yang bersangkutan dan Kepala Sekolah.
                  </p>
                )}

                <p className="mt-3 fs-xs text-abu-400">Diajukan {waktuLengkap(i.diajukan)}</p>

                {i.status !== 'Menunggu' && (
                  <div className="mt-2 fs-xs text-tinta-3">
                    {i.status} oleh <span className="fw-semibold text-tinta-2">{i.diprosesOleh}</span>
                    {i.diproses && ` · ${waktuLengkap(i.diproses)}`}
                    {i.catatan && boleh && <p className="mt-1-5 rounded-1 bg-abu-50 px-3 py-2 fs-sm text-tinta-2">“{i.catatan}”</p>}
                  </div>
                )}

                {i.status === 'Menunggu' && akses.kepsek && (
                  <div className="mt-auto pt-4">
                    <input
                      value={catatan[i.id] ?? ''}
                      onChange={(e) => setCatatan({ ...catatan, [i.id]: e.target.value })}
                      placeholder="Catatan untuk yang mengajukan (opsional)"
                      aria-label={`Catatan untuk ${i.nama}`}
                      className={inputCls}
                    />
                    <div className="mt-3 d-grid kolom-2 gap-2">
                      <button onClick={() => proses(i.id, 'Ditolak')} className={btn.danger}>
                        <X className="h-4 w-4" /> Tolak
                      </button>
                      <button onClick={() => proses(i.id, 'Disetujui')} className={btn.primary}>
                        <Check className="h-4 w-4" /> Setujui
                      </button>
                    </div>
                  </div>
                )}
                {i.status === 'Menunggu' && !akses.kepsek && i.guruId === akses.guruId && (
                  <button onClick={() => batalkanIzinStaf(i.id)} className={`${btn.secondary} mt-4`}>
                    <X className="h-4 w-4" /> Batalkan pengajuan
                  </button>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}

const CONTOH_ALASAN = {
  Sakit: 'Contoh: Demam sejak semalam, sudah periksa ke dokter.',
  Izin: 'Contoh: Menghadiri acara keluarga di luar kota.',
  Cuti: 'Contoh: Cuti tahunan.',
  'Dinas Luar': 'Contoh: Pelatihan Kurikulum Merdeka di Dinas Pendidikan.',
}

function FormIzinStaf({ onClose, onTerkirim }) {
  const { ajukanIzinStaf } = useData()
  const [form, setForm] = useState(() => ({ jenis: 'Sakit', tanggalMulai: todayKey(), tanggalSelesai: todayKey(), alasan: '', lampiran: '' }))
  const [galat, setGalat] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const hari = form.tanggalSelesai >= form.tanggalMulai ? rentangHariSekolah(form.tanggalMulai, form.tanggalSelesai).length : 0

  const [menyimpan, setMenyimpan] = useState(false)

  const kirim = async (e) => {
    e.preventDefault()
    if (menyimpan) return
    if (form.tanggalSelesai < form.tanggalMulai) return setGalat('Tanggal selesai tidak boleh sebelum tanggal mulai.')
    if (!hari) return setGalat('Rentang tanggal tidak mencakup hari sekolah.')
    setMenyimpan(true)
    const pesan = await ajukanIzinStaf({ ...form, alasan: form.alasan.trim() }, { diam: true })
    setMenyimpan(false)
    if (pesan) return setGalat(pesan)
    onTerkirim()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Ajukan izin / cuti"
      footer={
        <>
          <button onClick={onClose} className={btn.secondary}>
            Batal
          </button>
          <button type="submit" form="form-izin-staf" disabled={menyimpan} className={btn.primary}>
            <Send className="h-4 w-4" /> Kirim pengajuan
          </button>
        </>
      }
    >
      <form id="form-izin-staf" onSubmit={kirim} className="antara-y-4">
        {galat && <Alert tone="error">{galat}</Alert>}
        <div>
          <span className={labelCls}>Jenis</span>
          <div className="d-grid kolom-2 gap-2 kolom-sm-4">
            {JENIS_IZIN_STAF.map((j) => {
              const Icon = IKON_IZIN[j]
              return (
                <button
                  key={j}
                  type="button"
                  aria-pressed={form.jenis === j}
                  onClick={() => setForm({ ...form, jenis: j })}
                  className={`d-flex flex-column align-items-center gap-1 rounded-2 border border-2 px-3 py-3 fs-xs fw-semibold transisi ${
                    form.jenis === j ? 'border-merah-500 bg-merah-50 text-merah-700' : 'border-abu-200 text-tinta-2 hover-garis-abu'
                  }`}
                >
                  <Icon className="h-5 w-5" /> {j}
                </button>
              )
            })}
          </div>
        </div>
        <div className="d-grid kolom-2 gap-3">
          <div>
            <label htmlFor="izin-mulai" className={labelCls}>
              Dari tanggal
            </label>
            <input id="izin-mulai" type="date" required value={form.tanggalMulai} onChange={set('tanggalMulai')} className={inputCls} />
          </div>
          <div>
            <label htmlFor="izin-selesai" className={labelCls}>
              Sampai tanggal
            </label>
            <input id="izin-selesai" type="date" required value={form.tanggalSelesai} onChange={set('tanggalSelesai')} className={inputCls} />
          </div>
        </div>
        <p className="mt-n2 fs-xs text-tinta-3">{hari} hari kerja (Sabtu & Minggu tidak dihitung)</p>
        <div>
          <label htmlFor="izin-alasan" className={labelCls}>
            Keterangan
          </label>
          <textarea
            id="izin-alasan"
            required
            rows={3}
            value={form.alasan}
            onChange={set('alasan')}
            className={inputCls}
            placeholder={CONTOH_ALASAN[form.jenis]}
          />
        </div>
        <div>
          <label htmlFor="izin-lampiran" className={labelCls}>
            Lampiran (opsional)
          </label>
          <input
            id="izin-lampiran"
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setForm({ ...form, lampiran: e.target.files[0]?.name ?? '' })}
            className="isian-berkas d-block w-100 fs-sm text-tinta-3"
          />
          <p className="mt-1 fs-xs text-tinta-3">Surat dokter, surat tugas, atau undangan (JPG, PNG, PDF).</p>
        </div>
        <p className="d-flex align-items-start gap-2 rounded-2 bg-info-subtle px-3 py-2-5 fs-xs text-info-emphasis">
          <Info className="mt-0-5 h-3-5 w-3-5 flex-shrink-0" />
          Setelah disetujui Kepala Sekolah, tanggal tersebut otomatis tercatat di presensi.{' '}
          {form.jenis === 'Dinas Luar'
            ? 'Keterangan dinas luar dapat dilihat semua staf.'
            : 'Rekan kerja hanya melihat jenis dan tanggalnya, bukan keterangannya.'}
        </p>
      </form>
    </Modal>
  )
}

// Riwayat presensi satu orang
function DetailStaf({ guruId, onClose }) {
  const { data } = useData()
  const periode = periodePresensi(data.presensiStaf)
  const [kode, setKode] = useState('20')
  const g = data.guru.find((x) => x.id === guruId)
  if (!g) return null

  const p = periode.find((x) => x.kode === kode) ?? periode[0]
  const r = rekapPresensi(data.presensiStaf, g, p.tanggal)
  const jam = jamKerja(g)
  const hariIni = todayKey()
  const kotak = [
    ['Kehadiran', r.persenHadir === null ? '–' : `${r.persenHadir}%`, 'bg-success-subtle text-success'],
    ['Tepat waktu', r.persenTepat === null ? '–' : `${r.persenTepat}%`, 'bg-info-subtle text-info'],
    ['Terlambat', `${r.T}×`, 'bg-warning-subtle text-warning-emphasis'],
    ['Rata-rata masuk', r.rataMasuk ?? '–', 'bg-abu-100 text-tinta-2'],
  ]

  return (
    <Modal open onClose={onClose} title="Riwayat presensi" size="max-w-2xl">
      <div className="d-flex flex-wrap align-items-center gap-4">
        <Avatar nama={g.nama} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="fs-lg fw-bold text-tinta">{g.nama}</p>
          <p className="fs-sm text-tinta-3">
            {g.jabatan}
            {g.nip && ` · NIP ${g.nip}`}
          </p>
          <p className="fs-xs text-tinta-3">
            Jam kerja {jam.masuk} – {jam.pulang}
          </p>
        </div>
        <select value={p.kode} onChange={(e) => setKode(e.target.value)} className={`${inputCls} w-auto`} aria-label="Periode">
          {periode.map((x) => (
            <option key={x.kode} value={x.kode}>
              {x.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 d-grid kolom-2 gap-3 kolom-sm-4">
        {kotak.map(([label, nilai, warna]) => (
          <div key={label} className={`rounded-2 p-3 ${warna}`}>
            <p className="fs-xs">{label}</p>
            <p className="fs-xl fw-extrabold">{nilai}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 d-flex flex-wrap gap-2">
        {Object.entries(STATUS_PRESENSI).map(([k, s]) => (
          <Badge key={k} className={r[k] ? s.cls : 'bg-abu-50 text-abu-400'}>
            {s.label} {r[k]}
          </Badge>
        ))}
      </div>

      <ul className="mt-5 pembatas-y pembatas-abu border-top border-abu-100">
        {[...p.tanggal].reverse().map((t) => {
          const rec = data.presensiStaf[t]?.[g.id]
          const durasi = durasiKerja(rec)
          return (
            <li key={t} className="py-2-5 fs-sm">
              <div className="d-flex flex-wrap align-items-center column-gap-4 row-gap-1">
                <span className="w-40 text-nowrap fw-medium text-tinta-2">{formatTanggal(t, { weekday: 'short', year: undefined })}</span>
                <StatusPresensi kode={kodePresensi(rec, g)} hariIni={t === hariIni} />
                {rec?.masuk && (
                  <span className="angka text-tinta-2">
                    {rec.masuk} – {rec.pulang ?? '…'}
                  </span>
                )}
                {durasi && <span className="fs-xs text-abu-400">{durasi}</span>}
              </div>
              <div className="mt-1 fs-xs text-tinta-3 ps-sm-44">
                <Keterangan rec={rec} g={g} kosong={null} />
              </div>
              {rec?.koreksi?.length > 0 && (
                <div className="mt-2 ps-sm-44">
                  <RiwayatKoreksi koreksi={rec.koreksi} />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}

export default function PresensiStaf() {
  const { data } = useData()
  const akses = useAkses()
  const [tab, setTab] = useState('harian')
  const [detail, setDetail] = useState(null)
  const [koreksi, setKoreksi] = useState(null)
  const [formIzin, setFormIzin] = useState(false)
  const [terkirim, setTerkirim] = useState(false)
  const menunggu = data.izinStaf.filter((i) => i.status === 'Menunggu').length

  return (
    <>
      <DashHeader
        title="Presensi Guru & Staf"
        desc="Kehadiran seluruh guru dan tenaga kependidikan, terbuka untuk semua staf agar transparan."
        action={
          akses.guruId && (
            <button
              onClick={() => {
                setFormIzin(true)
                setTerkirim(false)
              }}
              className={btn.secondary}
            >
              <FilePlus className="h-4 w-4" /> Ajukan Izin / Cuti
            </button>
          )
        }
      />

      {terkirim && (
        <div className="mb-4">
          <Alert>Pengajuan terkirim dan menunggu persetujuan Kepala Sekolah.</Alert>
        </div>
      )}

      {akses.guruId && <KartuPresensiSaya className="mb-6" />}

      <div className="mb-5 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            ['harian', 'Papan Harian'],
            ['rekap', 'Rekap & Kalender'],
            ['izin', 'Pengajuan Izin', menunggu],
          ]}
        />
        <p className="d-flex align-items-center gap-1-5 fs-xs text-tinta-3">
          <Eye className="h-4 w-4" /> Dapat dilihat oleh semua guru & staf
        </p>
      </div>

      {tab === 'harian' && <PapanHarian onDetail={setDetail} onKoreksi={setKoreksi} />}
      {tab === 'rekap' && <Rekap onDetail={setDetail} />}
      {tab === 'izin' && <DaftarIzin />}

      {detail && <DetailStaf guruId={detail} onClose={() => setDetail(null)} />}
      {koreksi && <ModalKoreksi item={koreksi} onClose={() => setKoreksi(null)} />}
      {formIzin && (
        <FormIzinStaf
          onClose={() => setFormIzin(false)}
          onTerkirim={() => {
            setFormIzin(false)
            setTerkirim(true)
            setTab('izin')
          }}
        />
      )}
    </>
  )
}
