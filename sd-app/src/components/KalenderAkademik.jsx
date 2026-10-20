import { useState } from 'react'
import { CalendarPlus, ChevronLeft, ChevronRight, Info, Pencil, Trash2 } from 'lucide-react'
import { Alert, Card, DashHeader, Modal, btn, inputCls, labelCls, selectCls } from './ui'
import { useData } from '../context/DataContext'
import { semuaAgenda } from '../utils/acuan'
import { formatTanggal, todayKey, toKey } from '../utils/format'

const NAMA_HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export const JENIS_AGENDA = {
  libur: { label: 'Libur', blok: 'titik-rose text-white', soft: 'bg-danger-subtle text-danger-emphasis', dot: 'titik-rose' },
  ujian: { label: 'Ujian', blok: 'titik-amber text-tinta', soft: 'bg-warning-subtle text-warning-emphasis', dot: 'titik-amber' },
  kegiatan: { label: 'Kegiatan', blok: 'titik-sky text-white', soft: 'bg-info-subtle text-info-emphasis', dot: 'titik-sky' },
}

// Agenda dari server (tabel kalender), lihat src/utils/acuan.js
export const agendaPada = (key, daftar = semuaAgenda()) => daftar.filter((e) => key >= e.mulai && key <= (e.selesai ?? e.mulai))

export const agendaMendatang = (n, dari = todayKey()) =>
  semuaAgenda()
    .filter((e) => (e.selesai ?? e.mulai) >= dari)
    .sort((a, b) => a.mulai.localeCompare(b.mulai))
    .slice(0, n)

export function rentangAgenda(e) {
  if (!e.selesai || e.selesai === e.mulai) return formatTanggal(e.mulai)
  return `${formatTanggal(e.mulai, { year: undefined })} – ${formatTanggal(e.selesai)}`
}

const KOSONG = { judul: '', jenis: 'kegiatan', mulai: '', selesai: '', perkiraan: false, keterangan: '' }

/*
  Kalender akademik. `kelola` (menu Kalender Wakasek Kurikulum & Kepala Sekolah): tambah, ubah, dan hapus
  agenda; agenda berjenis Libur otomatis menutup presensi pada tanggalnya. `tanpaJudul` dipakai saat
  kalender ditanam di halaman lain.
*/
export default function KalenderAkademik({ tanpaJudul = false, kelola = false }) {
  const { data, tambah, ubah, hapus, beritahu } = useData()
  const kalender = data.kalender ?? []
  const [bulan, setBulan] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [form, setForm] = useState(null) // { ...agenda, id? }
  const [hapusId, setHapusId] = useState(null)
  const [galat, setGalat] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)
  const hariIni = todayKey()

  const jumlahHari = new Date(bulan.getFullYear(), bulan.getMonth() + 1, 0).getDate()
  const offset = (bulan.getDay() + 6) % 7
  const hari = Array.from({ length: jumlahHari }, (_, i) => new Date(bulan.getFullYear(), bulan.getMonth(), i + 1))
  const awal = toKey(hari[0])
  const akhir = toKey(hari[hari.length - 1])
  const agendaBulanIni = kalender.filter((e) => e.mulai <= akhir && (e.selesai ?? e.mulai) >= awal).sort((a, b) => a.mulai.localeCompare(b.mulai))
  const liburTerdekat = kalender
    .filter((e) => e.jenis === 'libur' && (e.selesai ?? e.mulai) >= hariIni)
    .sort((a, b) => a.mulai.localeCompare(b.mulai))
    .slice(0, 4)

  const geser = (n) => setBulan(new Date(bulan.getFullYear(), bulan.getMonth() + n, 1))
  const buka = (isi) => {
    setGalat('')
    setForm({ ...KOSONG, ...isi, selesai: isi.selesai ?? '' })
  }
  const simpan = async (e) => {
    e.preventDefault()
    if (menyimpan) return
    if (form.selesai && form.selesai < form.mulai) return setGalat('Tanggal selesai tidak boleh sebelum tanggal mulai.')
    setMenyimpan(true)
    const isian = { judul: form.judul, jenis: form.jenis, mulai: form.mulai, selesai: form.selesai || null, perkiraan: form.perkiraan, keterangan: form.keterangan }
    const pesan = form.id ? await ubah('kalender', form.id, isian, { diam: true }) : await tambah('kalender', isian, { diam: true })
    setMenyimpan(false)
    if (pesan) return setGalat(pesan)
    setForm(null)
    beritahu(form.id ? 'Agenda diperbarui.' : 'Agenda ditambahkan ke kalender.')
  }
  const lanjutHapus = async () => {
    const pesan = await hapus('kalender', hapusId)
    setHapusId(null)
    if (!pesan) beritahu('Agenda dihapus.')
  }

  const tombolTambah = kelola && (
    <button type="button" onClick={() => buka({ mulai: hariIni })} className={btn.primary}>
      <CalendarPlus className="ukuran-4" /> Tambah Agenda
    </button>
  )

  return (
    <>
      {!tanpaJudul && (
        <DashHeader title="Kalender Akademik" desc="Tahun ajaran 2026/2027 — hari libur, ujian, dan kegiatan sekolah." action={tombolTambah} />
      )}
      {kelola && (
        <p className="alert alert-info mb-6 d-flex align-items-start gap-2">
          <Info className="mt-0-5 ukuran-4 flex-shrink-0" aria-hidden="true" />
          <span>
            Agenda berjenis <b>Libur</b> otomatis menutup presensi siswa & staf pada tanggal itu dan tidak dihitung sebagai hari sekolah di rekap. Klik
            tanggal untuk menambah agenda pada hari tersebut.
          </span>
        </p>
      )}

      <div className="tata-kalender d-grid gap-6">
        <Card className="p-4 p-sm-6">
          <div className="mb-5 d-flex align-items-center justify-content-between">
            <button type="button" onClick={() => geser(-1)} className="btn btn-polos btn-ikon" aria-label="Bulan sebelumnya">
              <ChevronLeft className="ukuran-5" />
            </button>
            <h2 className="fs-lg fw-bold text-tinta">{bulan.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h2>
            <button type="button" onClick={() => geser(1)} className="btn btn-polos btn-ikon" aria-label="Bulan berikutnya">
              <ChevronRight className="ukuran-5" />
            </button>
          </div>

          <div className="d-grid kolom-7 gap-1 gap-sm-2">
            {NAMA_HARI.map((h, i) => (
              <div key={h} className={`pb-1 text-center fs-xs fw-bold text-uppercase ${i >= 5 ? 'teks-terang-rose' : 'text-abu-400'}`}>
                {h}
              </div>
            ))}
            {Array.from({ length: offset }, (_, i) => (
              <div key={`kosong-${i}`} />
            ))}
            {hari.map((d) => {
              const key = toKey(d)
              const agenda = agendaPada(key, kalender)
              const libur = agenda.some((e) => e.jenis === 'libur')
              const akhirPekan = d.getDay() === 0 || d.getDay() === 6
              const Sel = kelola ? 'button' : 'div'
              return (
                <Sel
                  key={key}
                  {...(kelola && { type: 'button', onClick: () => buka({ mulai: key }), 'aria-label': `Tambah agenda ${formatTanggal(key)}` })}
                  className={`sel-kalender d-flex min-h-14 min-h-sm-24 flex-column rounded-2 p-1-5 p-sm-2 text-start ${
                    libur ? 'bg-danger-subtle' : akhirPekan ? 'bg-abu-50' : 'bg-white border border-abu-100'
                  } ${key === hariIni ? 'sel-kalender--hari-ini' : ''} ${kelola ? 'sel-kalender--kelola transisi' : ''}`}
                >
                  <span className={`fs-sm fw-bold ${libur || akhirPekan ? 'teks-terang-rose' : 'text-tinta-2'}`}>{d.getDate()}</span>
                  {/* Titik di HP, label di layar lebar */}
                  <span className="mt-1 d-flex flex-wrap gap-1 d-sm-none">
                    {agenda.map((e) => (
                      <span key={e.id ?? e.judul} className={`ukuran-1-5 rounded-circle ${JENIS_AGENDA[e.jenis].dot}`} />
                    ))}
                  </span>
                  <span className="mt-1 d-none w-100 flex-column gap-1 d-sm-flex">
                    {agenda.slice(0, 2).map((e) => (
                      <span key={e.id ?? e.judul} title={e.judul} className={`d-block text-truncate rounded-1 px-1-5 py-0-5 fs-10 fw-semibold ${JENIS_AGENDA[e.jenis].blok}`}>
                        {e.judul}
                      </span>
                    ))}
                    {agenda.length > 2 && <span className="d-block fs-10 text-tinta-3">+{agenda.length - 2} lagi</span>}
                  </span>
                </Sel>
              )
            })}
          </div>

          <div className="mt-5 d-flex flex-wrap gap-4 fs-sm">
            {Object.values(JENIS_AGENDA).map((j) => (
              <span key={j.label} className="d-flex align-items-center gap-2 text-tinta-2">
                <span className={`ukuran-3 rounded-circle ${j.dot}`} /> {j.label}
              </span>
            ))}
          </div>
        </Card>

        <div className="d-flex flex-column gap-6">
          <Card className="p-5">
            <h2 className="fs-base fw-bold text-tinta">Agenda Bulan Ini</h2>
            {agendaBulanIni.length === 0 ? (
              <p className="mt-3 fs-sm text-tinta-3">Tidak ada agenda khusus bulan ini.</p>
            ) : (
              <ul className="mt-4 d-flex flex-column gap-2-5">
                {agendaBulanIni.map((e) => (
                  <li key={e.id ?? e.judul + e.mulai} className={`d-flex align-items-start gap-2 rounded-2 px-4 py-3 ${JENIS_AGENDA[e.jenis].soft}`}>
                    <div className="min-w-0 flex-1">
                      <p className="fs-sm fw-bold">{e.judul}</p>
                      <p className="mt-0-5 fs-xs opacity-80">
                        {rentangAgenda(e)}
                        {e.perkiraan && ' · tanggal perkiraan'}
                      </p>
                      {e.keterangan && <p className="mt-1 fs-xs opacity-80">{e.keterangan}</p>}
                    </div>
                    {kelola && e.id && (
                      <span className="me-n2 d-flex flex-shrink-0">
                        <button type="button" onClick={() => buka(e)} className="btn btn-polos btn-ikon p-1-5 text-reset" aria-label={`Ubah agenda ${e.judul}`}>
                          <Pencil className="ukuran-4" />
                        </button>
                        <button type="button" onClick={() => setHapusId(e.id)} className="btn btn-polos btn-ikon p-1-5 text-reset" aria-label={`Hapus agenda ${e.judul}`}>
                          <Trash2 className="ukuran-4" />
                        </button>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="fs-base fw-bold text-tinta">Libur Terdekat</h2>
            {liburTerdekat.length === 0 ? (
              <p className="mt-3 fs-sm text-tinta-3">Belum ada libur yang dijadwalkan.</p>
            ) : (
              <ul className="mt-4 d-flex flex-column gap-3">
                {liburTerdekat.map((e) => (
                  <li key={e.id ?? e.judul + e.mulai} className="d-flex gap-3">
                    <span className="mt-1-5 ukuran-2 flex-shrink-0 rounded-circle titik-rose" />
                    <div>
                      <p className="fs-sm fw-semibold text-tinta">{e.judul}</p>
                      <p className="fs-xs text-tinta-3">{rentangAgenda(e)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {kelola && (
        <>
          <Modal
            open={!!form}
            onClose={() => setForm(null)}
            title={form?.id ? 'Ubah Agenda' : 'Tambah Agenda'}
            footer={
              <>
                <button type="button" onClick={() => setForm(null)} className={btn.secondary}>
                  Batal
                </button>
                <button type="submit" form="form-agenda" disabled={menyimpan} className={btn.primary}>
                  {menyimpan ? 'Menyimpan…' : 'Simpan'}
                </button>
              </>
            }
          >
            {form && (
              <form id="form-agenda" onSubmit={simpan} className="d-grid gap-4 kolom-sm-2">
                {galat && (
                  <div className="rentang-sm-2">
                    <Alert tone="error">{galat}</Alert>
                  </div>
                )}
                <div className="rentang-sm-2">
                  <label htmlFor="agenda-judul" className={labelCls}>
                    Nama agenda
                  </label>
                  <input id="agenda-judul" required maxLength={150} value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} className={inputCls} placeholder="Contoh: Libur Hari Raya Nyepi" />
                </div>
                <div>
                  <label htmlFor="agenda-jenis" className={labelCls}>
                    Jenis
                  </label>
                  <select id="agenda-jenis" value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })} className={selectCls}>
                    {Object.entries(JENIS_AGENDA).map(([k, j]) => (
                      <option key={k} value={k}>
                        {j.label}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="d-flex align-items-center gap-2-5 align-self-end rounded-2 border border-garis px-3 py-2-5 fs-sm text-tinta-2">
                  <input type="checkbox" checked={form.perkiraan} onChange={(e) => setForm({ ...form, perkiraan: e.target.checked })} className="form-check-input m-0" />
                  Tanggal masih perkiraan
                </label>
                <div>
                  <label htmlFor="agenda-mulai" className={labelCls}>
                    Mulai
                  </label>
                  <input id="agenda-mulai" type="date" required value={form.mulai} onChange={(e) => setForm({ ...form, mulai: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="agenda-selesai" className={labelCls}>
                    Selesai
                  </label>
                  <input id="agenda-selesai" type="date" min={form.mulai || undefined} value={form.selesai} onChange={(e) => setForm({ ...form, selesai: e.target.value })} className={inputCls} />
                  <p className="mt-1-5 fs-xs text-tinta-3">Kosongkan bila hanya satu hari.</p>
                </div>
                <div className="rentang-sm-2">
                  <label htmlFor="agenda-keterangan" className={labelCls}>
                    Keterangan (opsional)
                  </label>
                  <textarea id="agenda-keterangan" rows={3} maxLength={500} value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} className={inputCls} />
                </div>
                {form.jenis === 'libur' && (
                  <div className="rentang-sm-2">
                    <Alert tone="warning">Presensi siswa & staf tidak dibuka pada tanggal libur ini.</Alert>
                  </div>
                )}
              </form>
            )}
          </Modal>

          <Modal
            open={!!hapusId}
            onClose={() => setHapusId(null)}
            title="Hapus agenda?"
            size="sm"
            footer={
              <>
                <button type="button" onClick={() => setHapusId(null)} className={btn.secondary}>
                  Batal
                </button>
                <button type="button" onClick={lanjutHapus} className="btn btn-danger">
                  Hapus
                </button>
              </>
            }
          >
            <p className="fs-sm text-tinta-2">{kalender.find((e) => e.id === hapusId)?.judul} akan dihapus dari kalender semua portal.</p>
          </Modal>
        </>
      )}
    </>
  )
}
