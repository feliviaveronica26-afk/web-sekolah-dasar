import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, BarChart3, Download, Inbox, Landmark, Minus, Pencil, Plus, Scale, Search, Trash2 } from 'lucide-react'
import { GrafikKolomGanda } from '../../components/Grafik'
import { StatusKas, useKasSekolah } from '../../components/Keuangan'
import { Alert, Badge, Card, DashHeader, EmptyState, JudulKartu, Modal, Tabs, btn, inputCls, labelCls } from '../../components/ui'
import { formatTanggal, todayKey } from '../../utils/format'
import { unduhFileCsv } from '../../utils/keamanan'
import {
  JENIS_KAS,
  KATEGORI_KAS,
  KATEGORI_SPP,
  METODE_KAS,
  SALDO_AWAL,
  angkaDariTeks,
  bulanTersedia,
  geserBulan,
  ringkasBulan,
  rupiahRingkas,
  rupiahTanda,
  saldoBerjalan,
  teksDariAngka,
} from '../../utils/keuangan'
import { bulanIni, namaBulan, rupiah } from '../../utils/spp'

const CONTOH_URAIAN = {
  masuk: 'Contoh: Dana BOS Reguler tahap II tahun 2026',
  keluar: 'Contoh: Tagihan listrik PLN bulan September',
}

// Pembanding bulan sebelumnya, mis. "Naik 12% dari Sep". Bulan berjalan belum selesai, jadi
// cukup ditampilkan angka bulan lalu agar tidak terkesan turun tajam.
function banding(sekarang, lalu, bulanLalu, berjalan) {
  const nama = namaBulan(bulanLalu, { month: 'long' })
  if (!lalu) return `Belum ada data ${nama}`
  if (berjalan) return `${nama}: ${rupiahRingkas(lalu)}`
  const persen = Math.round(((sekarang - lalu) / lalu) * 100)
  if (persen === 0) return `Sama dengan ${nama}`
  return `${persen > 0 ? 'Naik' : 'Turun'} ${Math.abs(persen)}% dari ${nama}`
}

const WARNA_KARTU = {
  primary: 'bg-merah-50 text-primary',
  sky: 'bg-info-subtle text-info',
  amber: 'bg-warning-subtle text-warning-emphasis',
  slate: 'bg-abu-100 text-tinta-2',
}

// Kartu angka dengan ikon di samping label, agar angka mendapat lebar penuh di HP
function KartuAngka({ icon: Icon, label, value, hint, tone }) {
  return (
    <Card className="p-4 p-sm-5">
      <p className="d-flex align-items-start gap-2 fs-sm fw-medium text-tinta-3">
        <span className={`d-flex h-7 w-7 flex-shrink-0 align-items-center justify-content-center rounded-1 ${WARNA_KARTU[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="pt-1 lh-tight">{label}</span>
      </p>
      <p className="mt-2 text-nowrap fs-xl fw-extrabold text-tinta fs-sm-2xl">{value}</p>
      <p className="mt-1 fs-xs text-tinta-3">{hint}</p>
    </Card>
  )
}

function FormKas({ awal, onSimpan, onBatal }) {
  const [form, setForm] = useState(awal)
  const [galat, setGalat] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)
  const ubah = (kolom, nilai) => setForm((f) => ({ ...f, [kolom]: nilai }))
  const gantiJenis = (jenis) => setForm((f) => ({ ...f, jenis, kategori: KATEGORI_KAS[jenis].includes(f.kategori) ? f.kategori : '' }))

  const kirim = async (e) => {
    e.preventDefault()
    if (menyimpan) return
    if (!form.kategori) return setGalat('Pilih kategori.')
    if (!form.jumlah) return setGalat('Isi jumlah uangnya.')
    if (form.tanggal > todayKey()) return setGalat('Tanggal tidak boleh melewati hari ini.')
    setMenyimpan(true)
    const pesan = await onSimpan({ ...form, uraian: form.uraian.trim(), bukti: form.bukti.trim() })
    setMenyimpan(false)
    if (pesan) setGalat(pesan)
  }

  return (
    <form id="form-kas" onSubmit={kirim} className="d-grid gap-4 kolom-sm-2">
      {galat && (
        <div key={galat} ref={(el) => el?.scrollIntoView({ block: 'nearest' })} className="rentang-sm-2">
          <Alert tone="error">{galat}</Alert>
        </div>
      )}
      <div className="d-grid kolom-2 gap-1-5 rounded-2 bg-abu-100 p-1-5 rentang-sm-2" role="radiogroup" aria-label="Jenis transaksi">
        {Object.entries(JENIS_KAS).map(([j, { label }]) => (
          <button
            key={j}
            type="button"
            role="radio"
            aria-checked={form.jenis === j}
            onClick={() => gantiJenis(j)}
            className={`d-flex align-items-center justify-content-center gap-1-5 rounded-1 py-2 fs-sm fw-semibold transisi ${form.jenis === j ? 'bg-white text-tinta shadow-sm' : 'text-tinta-3 hover-teks-tinta'}`}
          >
            {j === 'masuk' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />} {label}
          </button>
        ))}
      </div>
      <div>
        <label htmlFor="kas-tanggal" className={labelCls}>
          Tanggal
        </label>
        <input id="kas-tanggal" type="date" required max={todayKey()} value={form.tanggal} onChange={(e) => ubah('tanggal', e.target.value)} className={inputCls} />
      </div>
      <div>
        <label htmlFor="kas-kategori" className={labelCls}>
          Kategori
        </label>
        <select id="kas-kategori" required value={form.kategori} onChange={(e) => ubah('kategori', e.target.value)} className={inputCls}>
          <option value="">Pilih kategori</option>
          {KATEGORI_KAS[form.jenis].map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </div>
      {form.jenis === 'masuk' && (
        <p className="mt-n2 rounded-1 bg-info-subtle px-3 py-2 fs-xs text-info-emphasis rentang-sm-2">
          {form.kategori === SALDO_AWAL
            ? 'Saldo awal dipakai sekali saat mulai mencatat, untuk sisa kas sebelumnya. Tidak dihitung sebagai pemasukan bulanan.'
            : 'Pembayaran SPP tidak perlu dicatat di sini karena sudah masuk otomatis dari menu Keuangan SPP.'}
        </p>
      )}
      <div className="rentang-sm-2">
        <label htmlFor="kas-uraian" className={labelCls}>
          Uraian
        </label>
        <input id="kas-uraian" required maxLength={200} value={form.uraian} onChange={(e) => ubah('uraian', e.target.value)} placeholder={CONTOH_URAIAN[form.jenis]} className={inputCls} />
      </div>
      <div>
        <label htmlFor="kas-jumlah" className={labelCls}>
          Jumlah
        </label>
        <div className="position-relative">
          <span className="pe-none position-absolute start-3-5 top-50 translate-middle-y fs-sm fw-semibold text-tinta-3">Rp</span>
          <input
            id="kas-jumlah"
            inputMode="numeric"
            autoComplete="off"
            required
            value={teksDariAngka(form.jumlah)}
            onChange={(e) => ubah('jumlah', angkaDariTeks(e.target.value))}
            placeholder="0"
            className={`${inputCls} ps-10 fw-semibold angka`}
          />
        </div>
      </div>
      <div>
        <label htmlFor="kas-metode" className={labelCls}>
          Metode
        </label>
        <select id="kas-metode" value={form.metode} onChange={(e) => ubah('metode', e.target.value)} className={inputCls}>
          {METODE_KAS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="rentang-sm-2">
        <label htmlFor="kas-bukti" className={labelCls}>
          No. bukti <span className="fw-normal text-abu-400">(opsional)</span>
        </label>
        <input id="kas-bukti" maxLength={40} value={form.bukti} onChange={(e) => ubah('bukti', e.target.value)} placeholder="Contoh: BKK-2026-10-004" className={inputCls} />
        <p className="mt-1-5 fs-xs text-tinta-3">Nomor kuitansi atau bukti transfer, agar mudah dicocokkan saat pemeriksaan.</p>
      </div>
      <div className="d-flex flex-wrap justify-content-end gap-2 rentang-sm-2">
        <button type="button" onClick={onBatal} className={btn.secondary}>
          Batal
        </button>
        <button type="submit" disabled={menyimpan} className={btn.primary}>
          {menyimpan ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}

// Rincian per kategori untuk satu jenis (pemasukan / pengeluaran) pada bulan terpilih
function Rincian({ judul, jenis, perKategori, total }) {
  const daftar = Object.entries(perKategori).sort((a, b) => b[1] - a[1])
  return (
    <Card className="p-6">
      <JudulKartu icon={jenis === 'masuk' ? ArrowDownLeft : ArrowUpRight} judul={judul} />
      {daftar.length === 0 ? (
        <p className="rounded-2 bg-abu-50 px-4 py-6 text-center fs-sm text-tinta-3">Belum ada {JENIS_KAS[jenis].label.toLowerCase()} di bulan ini.</p>
      ) : (
        <ul className="antara-y-3-5">
          {daftar.map(([kategori, jumlah]) => (
            <li key={kategori}>
              <div className="d-flex align-items-baseline justify-content-between gap-3 fs-sm">
                <span className="min-w-0 text-tinta-2">
                  {kategori}
                  {kategori === KATEGORI_SPP && <span className="ms-1-5 fs-xs text-abu-400">otomatis</span>}
                </span>
                <span className="flex-shrink-0 fw-semibold angka text-tinta">
                  {rupiah(jumlah)} <span className="ms-1 fs-xs fw-normal text-tinta-3">{Math.round((jumlah / total) * 100)}%</span>
                </span>
              </div>
              <div className="mt-1-5 h-1-5 overflow-hidden rounded-pill bg-abu-100">
                <div className="h-100 rounded-pill" style={{ width: `${(jumlah / total) * 100}%`, background: JENIS_KAS[jenis].warna }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default function KeuanganSekolah() {
  const { kas, galat, muat, simpan, hapus } = useKasSekolah()
  const [bulan, setBulan] = useState(bulanIni())
  const [saring, setSaring] = useState('semua')
  const [cari, setCari] = useState('')
  const [form, setForm] = useState(null) // { awal, id } saat formulir terbuka
  const [hapusItem, setHapusItem] = useState(null)
  const [galatHapus, setGalatHapus] = useState('')
  const [menghapus, setMenghapus] = useState(false)

  const saldo = useMemo(() => (kas ? saldoBerjalan(kas) : {}), [kas])

  const header = (
    <DashHeader
      title="Keuangan Sekolah"
      desc="Catat uang yang masuk dan keluar, lalu pantau saldo kas setiap bulan. Pembayaran SPP tercatat otomatis dari menu Keuangan SPP."
      action={
        <div className="d-grid flex-shrink-0 kolom-2 gap-2 d-sm-flex">
          <button onClick={() => bukaForm('masuk')} disabled={!kas} className={`${btn.primary} text-nowrap px-3 px-sm-4`}>
            <Plus className="h-4 w-4" />
            <span>
              <span className="d-none d-sm-inline">Catat </span>Pemasukan
            </span>
          </button>
          <button onClick={() => bukaForm('keluar')} disabled={!kas} className={`${btn.secondary} text-nowrap px-3 px-sm-4`}>
            <Minus className="h-4 w-4" />
            <span>
              <span className="d-none d-sm-inline">Catat </span>Pengeluaran
            </span>
          </button>
        </div>
      }
    />
  )

  function bukaForm(jenis, t = null) {
    setForm({
      id: t?.id ?? null,
      awal: t
        ? { jenis: t.jenis, tanggal: t.tanggal, kategori: t.kategori, uraian: t.uraian, jumlah: t.jumlah, metode: t.metode, bukti: t.bukti ?? '' }
        : { jenis, tanggal: todayKey(), kategori: '', uraian: '', jumlah: 0, metode: 'Transfer Bank', bukti: '' },
    })
  }

  if (!kas) {
    return (
      <>
        {header}
        <Card className="p-6">
          <StatusKas galat={galat} muat={muat} />
        </Card>
      </>
    )
  }

  const r = ringkasBulan(kas, bulan)
  const bulanLalu = geserBulan(bulan, -1)
  const rLalu = ringkasBulan(kas, bulanLalu)
  const daftarBulan = bulanTersedia(kas, bulanIni())
  const namaB = namaBulan(bulan)
  const namaPendek = namaBulan(bulan, { month: 'long' })
  const grafik = daftarBulan
    .slice(0, 6)
    .reverse()
    .map((b) => {
      const x = ringkasBulan(kas, b)
      return { kunci: b, label: namaBulan(b, { month: 'short' }), labelPanjang: namaBulan(b), nilai: { masuk: x.masuk, keluar: x.keluar } }
    })

  const q = cari.trim().toLowerCase()
  const milikBulan = kas.filter((t) => t.tanggal.startsWith(bulan))
  const tampil = milikBulan
    .filter((t) => saring === 'semua' || t.jenis === saring)
    .filter((t) => !q || [t.uraian, t.kategori, t.bukti].some((v) => String(v ?? '').toLowerCase().includes(q)))
    .reverse()

  const simpanForm = async (item) => {
    const pesan = await simpan(item, form.id)
    if (pesan) return pesan
    setForm(null)
    setBulan(item.tanggal.slice(0, 7))
    return null
  }

  const konfirmasiHapus = async () => {
    if (menghapus) return
    setMenghapus(true)
    const pesan = await hapus(hapusItem.id)
    setMenghapus(false)
    if (pesan) return setGalatHapus(pesan)
    setHapusItem(null)
  }

  // Laporan bulan terpilih: saldo awal, transaksi urut tanggal, lalu total
  const unduhCsv = () => {
    const awal = kas.filter((t) => t.tanggal < `${bulan}-01`).reduce((a, t) => a + (t.jenis === 'masuk' ? t.jumlah : -t.jumlah), 0)
    const masuk = milikBulan.filter((t) => t.jenis === 'masuk').reduce((a, t) => a + t.jumlah, 0)
    const keluar = milikBulan.filter((t) => t.jenis === 'keluar').reduce((a, t) => a + t.jumlah, 0)
    unduhFileCsv(`kas-sekolah-${bulan}.csv`, [
      ['Laporan Kas SD Harapan Gemilang', namaB],
      [],
      ['Tanggal', 'Jenis', 'Kategori', 'Uraian', 'Metode', 'No. Bukti', 'Pemasukan', 'Pengeluaran', 'Saldo'],
      ['', '', '', 'Saldo awal bulan', '', '', '', '', awal],
      ...milikBulan.map((t) => [t.tanggal, JENIS_KAS[t.jenis].label, t.kategori, t.uraian, t.metode, t.bukti, t.jenis === 'masuk' ? t.jumlah : '', t.jenis === 'keluar' ? t.jumlah : '', saldo[t.id]]),
      ['', '', '', 'Total', '', '', masuk, keluar, awal + masuk - keluar],
    ])
  }

  const surplus = r.selisih >= 0
  const berjalan = bulan === bulanIni()

  return (
    <>
      {header}

      <div className="mb-4 d-flex flex-wrap align-items-center gap-2">
        <label htmlFor="kas-bulan" className="fs-sm fw-medium text-tinta-2">
          Bulan
        </label>
        <select id="kas-bulan" value={bulan} onChange={(e) => setBulan(e.target.value)} className={`${inputCls} w-auto py-2 fw-semibold`}>
          {daftarBulan.map((b) => (
            <option key={b} value={b}>
              {namaBulan(b)}
            </option>
          ))}
        </select>
        <button onClick={unduhCsv} className={`${btn.secondary} ms-auto py-2`}>
          <Download className="h-4 w-4" /> Unduh laporan (CSV)
        </button>
      </div>

      <div className="d-grid kolom-2 gap-4 kolom-lg-4">
        <KartuAngka icon={Landmark} label="Saldo kas" value={rupiahRingkas(r.saldoAkhir)} hint={berjalan ? 'per hari ini' : `per akhir ${namaPendek}`} tone="primary" />
        <KartuAngka icon={ArrowDownLeft} label={`Pemasukan ${namaPendek}`} value={rupiahRingkas(r.masuk)} hint={banding(r.masuk, rLalu.masuk, bulanLalu, berjalan)} tone="sky" />
        <KartuAngka icon={ArrowUpRight} label={`Pengeluaran ${namaPendek}`} value={rupiahRingkas(r.keluar)} hint={banding(r.keluar, rLalu.keluar, bulanLalu, berjalan)} tone="amber" />
        <KartuAngka
          icon={Scale}
          label={`${surplus ? 'Surplus' : 'Defisit'} ${namaPendek}`}
          value={rupiahRingkas(r.selisih)}
          hint={surplus ? 'Masuk lebih besar dari keluar' : 'Keluar lebih besar dari masuk'}
          tone="slate"
        />
      </div>

      <Card className="mt-6 p-6">
        <JudulKartu icon={BarChart3} judul="Arus kas per bulan" />
        <p className="mt-n2 mb-4 fs-sm text-tinta-3">Klik salah satu bulan untuk melihat rinciannya.</p>
        <GrafikKolomGanda
          judul="Pemasukan dan pengeluaran per bulan"
          data={grafik}
          seri={Object.entries(JENIS_KAS).map(([kunci, s]) => ({ kunci, ...s }))}
          format={rupiah}
          formatSingkat={(n) => rupiahRingkas(n, { tanpaRp: true })}
          pilih={bulan}
          onPilih={setBulan}
        />
      </Card>

      <div className="mt-6 d-grid gap-6 kolom-lg-2">
        <Rincian judul="Dari mana uang masuk" jenis="masuk" perKategori={r.perKategori.masuk} total={r.masuk} />
        <Rincian judul="Ke mana uang keluar" jenis="keluar" perKategori={r.perKategori.keluar} total={r.keluar} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="d-flex flex-column gap-3 border-bottom border-abu-100 p-4 p-sm-5 flex-lg-row align-items-lg-center">
          <h2 className="fw-bold text-tinta me-lg-auto">Buku kas · {namaB}</h2>
          <Tabs
            value={saring}
            onChange={setSaring}
            items={[
              ['semua', 'Semua', milikBulan.length],
              ['masuk', 'Masuk', milikBulan.filter((t) => t.jenis === 'masuk').length],
              ['keluar', 'Keluar', milikBulan.filter((t) => t.jenis === 'keluar').length],
            ]}
          />
          <div className="position-relative w-lg-64">
            <Search className="pe-none position-absolute start-3-5 top-50 h-4 w-4 translate-middle-y text-abu-400" />
            <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari uraian atau no. bukti…" aria-label="Cari transaksi" className={`${inputCls} ps-10`} />
          </div>
        </div>

        {tampil.length === 0 ? (
          <EmptyState icon={Inbox} title="Belum ada transaksi" desc={q ? 'Coba kata kunci lain.' : `Belum ada catatan kas di bulan ${namaB}.`} />
        ) : (
          <ul className="pembatas-y pembatas-abu">
            {tampil.map((t) => {
              const masuk = t.jenis === 'masuk'
              const [, bln, tgl] = t.tanggal.split('-')
              return (
                <li key={t.id} className="d-flex align-items-start gap-3 px-4 py-3-5 px-sm-5">
                  <div className="w-11 flex-shrink-0 rounded-2 bg-abu-50 py-1-5 text-center" title={formatTanggal(t.tanggal)}>
                    <p className="fs-base fw-bold lh-tight text-tinta">{Number(tgl)}</p>
                    <p className="fs-10 fw-semibold text-uppercase text-tinta-3">{namaBulan(`2000-${bln}`, { month: 'short' })}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* HP sempit: nominal di bawah uraian agar uraian tidak terjepit */}
                    <div className="d-flex flex-column align-items-start gap-0-5 baris-480">
                      <p className="min-w-0 fw-semibold text-tinta">{t.uraian}</p>
                      <p className={`flex-shrink-0 text-nowrap fs-sm fw-bold angka fs-sm-base ${masuk ? 'text-success' : 'text-danger'}`}>
                        {masuk ? '+' : '−'}
                        {rupiah(t.jumlah)}
                      </p>
                    </div>
                    <div className="mt-0-5 d-flex flex-wrap align-items-center justify-content-between column-gap-3 row-gap-1 fs-xs text-tinta-3">
                      <p className="d-flex flex-wrap align-items-center column-gap-2 row-gap-1">
                        <span className="d-flex align-items-center gap-1-5">
                          <span className="h-2 w-2 rounded-1" style={{ background: JENIS_KAS[t.jenis].warna }} /> {t.kategori}
                        </span>
                        {t.metode && <span>· {t.metode}</span>}
                        {t.bukti && <span>· {t.bukti}</span>}
                        {t.otomatis && <Badge className="bg-info-subtle text-info">Otomatis dari SPP</Badge>}
                      </p>
                      <p className="ms-auto text-nowrap angka">Saldo {rupiahTanda(saldo[t.id])}</p>
                    </div>
                  </div>
                  <div className="d-flex w-8 flex-shrink-0 flex-column align-items-end gap-0-5 w-sm-16 flex-sm-row justify-content-sm-end">
                    {!t.otomatis && (
                      <>
                        <button onClick={() => bukaForm(t.jenis, t)} className="rounded-1 p-1-5 text-tinta-3 hover-latar-abu hover-teks-tinta" aria-label={`Ubah ${t.uraian}`}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setHapusItem(t)
                            setGalatHapus('')
                          }}
                          className="rounded-1 p-1-5 text-tinta-3 hover-latar-merah hover-teks-merah"
                          aria-label={`Hapus ${t.uraian}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <div className="d-flex flex-wrap justify-content-between gap-2 border-top border-abu-100 px-5 py-3 fs-sm">
          <span className="text-tinta-3">
            {tampil.length} dari {milikBulan.length} transaksi
          </span>
          <span className="text-tinta-2">
            Saldo akhir {namaPendek}: <span className="fw-bold angka text-tinta">{rupiahTanda(r.saldoAkhir)}</span>
          </span>
        </div>
      </Card>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Ubah Transaksi' : `Catat ${JENIS_KAS[form?.awal.jenis ?? 'masuk'].label}`}>
        {form && <FormKas key={form.id ?? form.awal.jenis} awal={form.awal} onSimpan={simpanForm} onBatal={() => setForm(null)} />}
      </Modal>

      <Modal
        open={!!hapusItem}
        onClose={() => setHapusItem(null)}
        title="Hapus transaksi ini?"
        size="max-w-md"
        footer={
          <>
            <button onClick={() => setHapusItem(null)} className={btn.secondary}>
              Batal
            </button>
            <button onClick={konfirmasiHapus} disabled={menghapus} className="btn btn-danger">
              <Trash2 className="h-4 w-4" /> {menghapus ? 'Menghapus…' : 'Hapus'}
            </button>
          </>
        }
      >
        {galatHapus && (
          <div className="mb-3">
            <Alert tone="error">{galatHapus}</Alert>
          </div>
        )}
        {hapusItem && (
          <p className="text-tinta-2">
            <span className="fw-semibold text-tinta">{hapusItem.uraian}</span> sebesar {rupiah(hapusItem.jumlah)} pada {formatTanggal(hapusItem.tanggal)} akan dihapus
            dari buku kas.
          </p>
        )}
      </Modal>
    </>
  )
}
