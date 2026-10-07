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
import { formatHari, formatTanggal, isHariSekolah, namaHari, parseKey, rentangHariSekolah, tambahHari, todayKey } from '../../utils/format'
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
        <p key="ket" className="flex items-center gap-1 text-slate-400">
          <Lock className="h-3 w-3" /> Rincian bersifat pribadi
        </p>
      ),
    )
  if (rec.izinId)
    isi.push(
      <p key="izin" className="text-emerald-700">
        Izin disetujui Kepala Sekolah
      </p>,
    )
  if (boleh && rec.alasanMasuk) isi.push(<p key="am">Alasan terlambat: {rec.alasanMasuk}</p>)
  if (boleh && rec.alasanPulang) isi.push(<p key="ap">Alasan pulang awal: {rec.alasanPulang}</p>)
  if (rec.koreksi?.length) {
    const k = rec.koreksi.at(-1)
    isi.push(
      <p key="kr" className="flex items-start gap-1 text-amber-700">
        <History className="mt-0.5 h-3 w-3 shrink-0" /> Dikoreksi {k.oleh}: {k.alasan}
      </p>,
    )
  }
  return isi.length ? <div className="space-y-0.5">{isi}</div> : kosong
}

function RiwayatKoreksi({ koreksi }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-800">
        <History className="h-3.5 w-3.5" /> Riwayat koreksi
      </p>
      <ul className="space-y-2 text-xs text-slate-600">
        {[...koreksi].reverse().map((k) => (
          <li key={k.waktu}>
            <span className="font-semibold text-slate-800">{k.oleh}</span> · {waktuLengkap(k.waktu)}
            <span className="block">
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
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
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

      <Card className="mb-4 flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setTanggal(hariSekolahGeser(tanggal, -1))}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            aria-label="Hari sekolah sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input
            type="date"
            value={tanggal}
            max={hariIni}
            onChange={(e) => e.target.value && setTanggal(e.target.value)}
            className={`${inputCls} w-auto!`}
            aria-label="Pilih tanggal"
          />
          <button
            onClick={() => setTanggal(berikut)}
            disabled={berikut > hariIni}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            aria-label="Hari sekolah berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-slate-700">{formatHari(tanggal)}</span>
          {!adalahHariIni && (
            <button onClick={() => setTanggal(hariIni)} className="text-sm font-semibold text-primary-600 hover:underline">
              Kembali ke hari ini
            </button>
          )}
        </div>
        <div className="relative lg:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama..." className={`${inputCls} pl-10`} />
        </div>
      </Card>

      {libur ? (
        <Card>
          <EmptyState icon={Clock} title="Hari libur" desc="Tidak ada presensi pada akhir pekan. Pilih hari sekolah lain." />
        </Card>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {SARING.filter(([k]) => k === 'semua' || k === saring || jumlah(k) > 0).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setSaring(k)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  saring === k ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {k === 'belum' && !adalahHariIni ? 'Tanpa catatan' : label}
                <span className="ml-1.5 text-xs opacity-70">{jumlah(k)}</span>
              </button>
            ))}
          </div>

          <Card className="overflow-hidden">
            {daftar.length === 0 ? (
              <EmptyState icon={Users} title="Tidak ada yang cocok" desc="Coba ubah saringan atau kata pencarian." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Guru / Staf</th>
                      <th className="px-3 py-3 font-semibold">Jam kerja</th>
                      <th className="px-3 py-3 font-semibold">Masuk</th>
                      <th className="px-3 py-3 font-semibold">Pulang</th>
                      <th className="px-3 py-3 font-semibold">Status</th>
                      <th className="px-3 py-3 font-semibold">Keterangan</th>
                      {akses.kepsek && <th className="px-5 py-3 text-right font-semibold">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {daftar.map(({ g, rec, kode }) => {
                      const saya = g.id === akses.guruId
                      const jam = jamKerja(g)
                      const telat = menitTerlambat(rec, g)
                      return (
                        <tr key={g.id} className={saya ? 'bg-primary-50/50' : 'hover:bg-slate-50/60'}>
                          <td className="px-5 py-3">
                            <button onClick={() => onDetail(g.id)} className="group flex items-center gap-3 text-left">
                              <Avatar nama={g.nama} size="sm" />
                              <span>
                                <span className="block font-semibold text-slate-800 group-hover:text-primary-700">
                                  {g.nama}
                                  {saya && <Badge className="ml-2 bg-primary-100 text-primary-700">Anda</Badge>}
                                </span>
                                <span className="block text-xs text-slate-500">{g.jabatan}</span>
                              </span>
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 tabular-nums text-slate-500">
                            {jam.masuk}–{jam.pulang}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 tabular-nums">
                            <span className="font-semibold text-slate-800">{rec?.masuk ?? '–'}</span>
                            {telat > 0 && <span className="block text-xs font-medium text-amber-700">+{telat} menit</span>}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 tabular-nums">
                            <span className="font-semibold text-slate-800">{rec?.pulang ?? '–'}</span>
                            {pulangCepat(rec, g) && <span className="block text-xs font-medium text-amber-700">lebih awal</span>}
                            {rec?.status === 'H' && rec.masuk && !rec.pulang && tanggal < hariIni && (
                              <span className="block text-xs text-slate-400">tidak absen pulang</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <StatusPresensi kode={kode} hariIni={adalahHariIni} />
                          </td>
                          <td className="max-w-xs px-3 py-3 text-xs text-slate-600">
                            <Keterangan rec={rec} g={g} />
                          </td>
                          {akses.kepsek && (
                            <td className="px-5 py-3 text-right">
                              <button
                                onClick={() => onKoreksi({ g, rec, tanggal })}
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                              >
                                <PencilLine className="h-3.5 w-3.5" /> Koreksi
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
            <p className="flex items-start gap-2 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
              <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0" />
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

  const simpan = (e) => {
    e.preventDefault()
    if (form.status === 'H' && !form.masuk) return setGalat('Isi jam masuk untuk status Hadir.')
    if (form.status === 'H' && form.pulang && form.pulang <= form.masuk) return setGalat('Jam pulang harus setelah jam masuk.')
    if (!form.alasan.trim()) return setGalat('Alasan koreksi wajib diisi.')
    const perubahan =
      form.status === 'H'
        ? { status: 'H', masuk: dariJam(form.masuk), pulang: dariJam(form.pulang) }
        : { status: form.status, masuk: null, pulang: null, ket: form.ket.trim() }
    koreksiPresensi(tanggal, g.id, perubahan, nama, form.alasan.trim())
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
          <button type="submit" form="form-koreksi" className={btn.primary}>
            <Check className="h-4 w-4" /> Simpan koreksi
          </button>
        </>
      }
    >
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
        <Avatar nama={g.nama} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-800">{g.nama}</p>
          <p className="text-xs text-slate-500">{formatHari(tanggal)}</p>
        </div>
        <StatusPresensi kode={kodePresensi(rec, g)} hariIni={tanggal === todayKey()} />
      </div>
      <form id="form-koreksi" onSubmit={simpan} className="space-y-4">
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
          {form.status === 'H' && <p className="mt-1 text-xs text-slate-500">Status terlambat dihitung otomatis dari jam masuk.</p>}
        </div>
        {form.status === 'H' ? (
          <div className="grid grid-cols-2 gap-3">
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
            Alasan koreksi <span className="text-rose-600">*</span>
          </label>
          <textarea
            id="alasan-koreksi"
            rows={2}
            value={form.alasan}
            onChange={set('alasan')}
            className={inputCls}
            placeholder="Contoh: Lupa absen masuk, kehadiran dikonfirmasi satpam."
          />
          <p className="mt-1 text-xs text-slate-500">Koreksi dicatat atas nama {nama} dan terlihat oleh semua guru & staf.</p>
        </div>
        {rec?.koreksi?.length > 0 && <RiwayatKoreksi koreksi={rec.koreksi} />}
      </form>
    </Modal>
  )
}

const URUT = { jabatan: 'Urut jabatan', hadir: 'Kehadiran terendah', telat: 'Terlambat terbanyak' }

function Legenda() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 px-5 py-3 text-xs text-slate-600">
      {Object.entries(STATUS_PRESENSI).map(([k, s]) => (
        <span key={k} className="flex items-center gap-1.5">
          <span className={`grid h-5 w-5 place-items-center rounded text-[10px] font-bold ${s.sel}`}>{k}</span>
          {s.label}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span className="grid h-5 w-5 place-items-center rounded bg-slate-100 text-slate-400">·</span>
        Tidak ada catatan
      </span>
    </div>
  )
}

function Angka({ n }) {
  return <td className={`px-2 py-3 text-center tabular-nums ${n ? 'font-semibold text-slate-800' : 'text-slate-300'}`}>{n}</td>
}

const warnaPersen = (p) => (p >= 95 ? 'bg-emerald-500' : p >= 85 ? 'bg-amber-400' : 'bg-rose-500')

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
      `"${g.nama}"`,
      `"${g.jabatan}"`,
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
    const csv = [kepala, ...isi].map((x) => x.join(';')).join('\n')
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `presensi-staf-${p.kode === '20' ? '20-hari-terakhir' : p.kode}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Card className="mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <select value={p.kode} onChange={(e) => setKode(e.target.value)} className={`${inputCls} w-auto!`} aria-label="Periode rekap">
            {periode.map((x) => (
              <option key={x.kode} value={x.kode}>
                {x.label}
              </option>
            ))}
          </select>
          <select value={urut} onChange={(e) => setUrut(e.target.value)} className={`${inputCls} w-auto!`} aria-label="Urutan">
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

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-900">Kalender kehadiran</h2>
          <p className="text-sm text-slate-500">Satu kotak = satu hari kerja. Arahkan kursor ke kotak untuk melihat jam masuk dan pulang.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white px-5 py-2 text-left font-semibold text-slate-500">Nama</th>
                {p.tanggal.map((t) => (
                  <th key={t} className={`px-0.5 py-2 text-center font-semibold tabular-nums ${t === hariIni ? 'text-primary-600' : 'text-slate-500'}`}>
                    <span className="block text-[10px] font-medium text-slate-400">{namaHari(t).slice(0, 3)}</span>
                    {parseKey(t).getDate()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {baris.map(({ g }) => (
                <tr key={g.id}>
                  <th scope="row" className="sticky left-0 z-10 bg-white px-5 py-0.5 text-left font-semibold text-slate-700">
                    <button
                      onClick={() => onDetail(g.id)}
                      className={`block max-w-44 truncate hover:text-primary-700 ${g.id === akses.guruId ? 'text-primary-700' : ''}`}
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
                      <td key={t} className="px-0.5 py-0.5">
                        <span
                          title={`${g.nama.split(',')[0]} · ${formatTanggal(t, { weekday: 'short', year: undefined })}: ${label}${jam}`}
                          className={`grid h-7 w-7 place-items-center rounded-md text-[11px] font-bold ${k ? STATUS_PRESENSI[k].sel : 'bg-slate-100 text-slate-400'} ${
                            rec?.koreksi?.length ? 'ring-2 ring-slate-900/40 ring-offset-1' : ''
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
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Guru / Staf</th>
                <th className="px-2 py-3 text-center font-semibold">Tepat</th>
                <th className="px-2 py-3 text-center font-semibold">Telat</th>
                <th className="px-2 py-3 text-center font-semibold">Dinas</th>
                <th className="px-2 py-3 text-center font-semibold">Izin</th>
                <th className="px-2 py-3 text-center font-semibold">Sakit</th>
                <th className="px-2 py-3 text-center font-semibold">Cuti</th>
                <th className="px-2 py-3 text-center font-semibold">Alpa</th>
                <th className="px-3 py-3 font-semibold">Kehadiran</th>
                <th className="px-2 py-3 text-center font-semibold">Tepat waktu</th>
                <th className="px-2 py-3 text-center font-semibold">Rata² masuk</th>
                <th className="px-5 py-3 font-semibold">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {baris.map(({ g, r }) => (
                <tr key={g.id} className={g.id === akses.guruId ? 'bg-primary-50/50' : 'hover:bg-slate-50/60'}>
                  <td className="px-5 py-3">
                    <button onClick={() => onDetail(g.id)} className="group flex items-center gap-3 text-left">
                      <Avatar nama={g.nama} size="sm" />
                      <span>
                        <span className="block font-semibold text-slate-800 group-hover:text-primary-700">{g.nama}</span>
                        <span className="block text-xs text-slate-500">{g.jabatan}</span>
                      </span>
                    </button>
                  </td>
                  <Angka n={r.H} />
                  <td className={`px-2 py-3 text-center tabular-nums ${r.T ? 'font-semibold text-amber-700' : 'text-slate-300'}`}>
                    {r.T}
                    {r.T > 0 && <span className="block whitespace-nowrap text-[11px] font-normal text-slate-400">{r.menitTelat} mnt</span>}
                  </td>
                  <Angka n={r.D} />
                  <Angka n={r.I} />
                  <Angka n={r.S} />
                  <Angka n={r.C} />
                  <td className={`px-2 py-3 text-center tabular-nums ${r.A ? 'font-semibold text-rose-700' : 'text-slate-300'}`}>{r.A}</td>
                  <td className="w-44 px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Progres nilai={r.persenHadir ?? 0} warna={warnaPersen(r.persenHadir ?? 0)} className="flex-1" />
                      <span className="w-10 text-right font-bold tabular-nums text-slate-900">{r.persenHadir === null ? '–' : `${r.persenHadir}%`}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center tabular-nums text-slate-700">{r.persenTepat === null ? '–' : `${r.persenTepat}%`}</td>
                  <td className="px-2 py-3 text-center tabular-nums text-slate-700">{r.rataMasuk ?? '–'}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">
                    {[r.lupaPulang > 0 && `${r.lupaPulang}× tidak absen pulang`, r.pulangAwal > 0 && `${r.pulangAwal}× pulang awal`]
                      .filter(Boolean)
                      .join(' · ') || '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="flex items-start gap-2 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Kehadiran = (hadir + dinas luar) ÷ hari yang tercatat. Ketepatan waktu dihitung dari hari hadir di sekolah. Hari tanpa catatan tidak ikut dihitung.
          Kotak bergaris tepi di kalender menandakan catatan yang pernah dikoreksi.
        </p>
      </Card>
    </>
  )
}

function DaftarIzin() {
  const { data, prosesIzinStaf, hapus } = useData()
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

  const proses = (id, status) => {
    prosesIzinStaf(id, status, catatan[id]?.trim() || '', akses.nama)
    setCatatan({ ...catatan, [id]: '' })
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {pilihan.map(([k, label, f]) => (
          <button
            key={k}
            onClick={() => setSaring(k)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              saring === k ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {label}
            <span className="ml-1.5 text-xs opacity-70">{semua.filter(f).length}</span>
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
        <div className="grid gap-4 lg:grid-cols-2">
          {daftar.map((i) => {
            const Icon = IKON_IZIN[i.jenis] ?? FileText
            const boleh = bolehLihat(akses, i.guruId)
            const hari = rentangHariSekolah(i.tanggalMulai, i.tanggalSelesai).length
            return (
              <Card key={i.id} className="flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <Avatar nama={i.nama} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900">{i.nama}</p>
                    <p className="text-xs text-slate-500">{jabatan(i.guruId)}</p>
                  </div>
                  <IzinBadge status={i.status} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                  <Badge className={STATUS_PRESENSI[KODE_IZIN_STAF[i.jenis]].cls}>
                    <Icon className="mr-1 h-3.5 w-3.5" /> {i.jenis}
                  </Badge>
                  <span className="font-medium text-slate-700">{rentang(i.tanggalMulai, i.tanggalSelesai)}</span>
                  <span className="text-xs text-slate-400">· {hari} hari kerja</span>
                </div>

                {boleh || i.jenis === 'Dinas Luar' ? (
                  <>
                    <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{i.alasan}</p>
                    {i.lampiran && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                        <Paperclip className="h-3.5 w-3.5" /> {i.lampiran}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                    <Lock className="h-3.5 w-3.5" /> Alasan hanya dapat dilihat oleh yang bersangkutan dan Kepala Sekolah.
                  </p>
                )}

                <p className="mt-3 text-xs text-slate-400">Diajukan {waktuLengkap(i.diajukan)}</p>

                {i.status !== 'Menunggu' && (
                  <div className="mt-2 text-xs text-slate-500">
                    {i.status} oleh <span className="font-semibold text-slate-700">{i.diprosesOleh}</span>
                    {i.diproses && ` · ${waktuLengkap(i.diproses)}`}
                    {i.catatan && boleh && <p className="mt-1.5 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">“{i.catatan}”</p>}
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
                    <div className="mt-3 grid grid-cols-2 gap-2">
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
                  <button onClick={() => hapus('izinStaf', i.id)} className={`${btn.secondary} mt-4`}>
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
  const { data, ajukanIzinStaf } = useData()
  const akses = useAkses()
  const [form, setForm] = useState(() => ({ jenis: 'Sakit', tanggalMulai: todayKey(), tanggalSelesai: todayKey(), alasan: '', lampiran: '' }))
  const [galat, setGalat] = useState('')
  const guru = data.guru.find((g) => g.id === akses.guruId)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const hari = form.tanggalSelesai >= form.tanggalMulai ? rentangHariSekolah(form.tanggalMulai, form.tanggalSelesai).length : 0

  const kirim = (e) => {
    e.preventDefault()
    if (form.tanggalSelesai < form.tanggalMulai) return setGalat('Tanggal selesai tidak boleh sebelum tanggal mulai.')
    if (!hari) return setGalat('Rentang tanggal tidak mencakup hari sekolah.')
    ajukanIzinStaf({ ...form, alasan: form.alasan.trim(), guruId: guru.id, nama: guru.nama })
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
          <button type="submit" form="form-izin-staf" className={btn.primary}>
            <Send className="h-4 w-4" /> Kirim pengajuan
          </button>
        </>
      }
    >
      <form id="form-izin-staf" onSubmit={kirim} className="space-y-4">
        {galat && <Alert tone="error">{galat}</Alert>}
        <div>
          <span className={labelCls}>Jenis</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {JENIS_IZIN_STAF.map((j) => {
              const Icon = IKON_IZIN[j]
              return (
                <button
                  key={j}
                  type="button"
                  aria-pressed={form.jenis === j}
                  onClick={() => setForm({ ...form, jenis: j })}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-xs font-semibold transition ${
                    form.jenis === j ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Icon className="h-5 w-5" /> {j}
                </button>
              )
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
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
        <p className="-mt-2 text-xs text-slate-500">{hari} hari kerja (Sabtu & Minggu tidak dihitung)</p>
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
            className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100"
          />
          <p className="mt-1 text-xs text-slate-500">Surat dokter, surat tugas, atau undangan (JPG, PNG, PDF).</p>
        </div>
        <p className="flex items-start gap-2 rounded-xl bg-sky-50 px-3 py-2.5 text-xs text-sky-800">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
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
    ['Kehadiran', r.persenHadir === null ? '–' : `${r.persenHadir}%`, 'bg-emerald-50 text-emerald-700'],
    ['Tepat waktu', r.persenTepat === null ? '–' : `${r.persenTepat}%`, 'bg-sky-50 text-sky-700'],
    ['Terlambat', `${r.T}×`, 'bg-amber-50 text-amber-800'],
    ['Rata-rata masuk', r.rataMasuk ?? '–', 'bg-slate-100 text-slate-700'],
  ]

  return (
    <Modal open onClose={onClose} title="Riwayat presensi" size="max-w-2xl">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar nama={g.nama} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-slate-900">{g.nama}</p>
          <p className="text-sm text-slate-500">
            {g.jabatan}
            {g.nip && ` · NIP ${g.nip}`}
          </p>
          <p className="text-xs text-slate-500">
            Jam kerja {jam.masuk} – {jam.pulang}
          </p>
        </div>
        <select value={p.kode} onChange={(e) => setKode(e.target.value)} className={`${inputCls} w-auto!`} aria-label="Periode">
          {periode.map((x) => (
            <option key={x.kode} value={x.kode}>
              {x.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kotak.map(([label, nilai, warna]) => (
          <div key={label} className={`rounded-xl p-3 ${warna}`}>
            <p className="text-xs">{label}</p>
            <p className="text-xl font-extrabold">{nilai}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(STATUS_PRESENSI).map(([k, s]) => (
          <Badge key={k} className={r[k] ? s.cls : 'bg-slate-50 text-slate-400'}>
            {s.label} {r[k]}
          </Badge>
        ))}
      </div>

      <ul className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
        {[...p.tanggal].reverse().map((t) => {
          const rec = data.presensiStaf[t]?.[g.id]
          const durasi = durasiKerja(rec)
          return (
            <li key={t} className="py-2.5 text-sm">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="w-40 whitespace-nowrap font-medium text-slate-700">{formatTanggal(t, { weekday: 'short', year: undefined })}</span>
                <StatusPresensi kode={kodePresensi(rec, g)} hariIni={t === hariIni} />
                {rec?.masuk && (
                  <span className="tabular-nums text-slate-600">
                    {rec.masuk} – {rec.pulang ?? '…'}
                  </span>
                )}
                {durasi && <span className="text-xs text-slate-400">{durasi}</span>}
              </div>
              <div className="mt-1 text-xs text-slate-500 sm:pl-44">
                <Keterangan rec={rec} g={g} kosong={null} />
              </div>
              {rec?.koreksi?.length > 0 && (
                <div className="mt-2 sm:pl-44">
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

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            ['harian', 'Papan Harian'],
            ['rekap', 'Rekap & Kalender'],
            ['izin', 'Pengajuan Izin', menunggu],
          ]}
        />
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
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
