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
  primary: 'bg-primary-50 text-primary-600',
  sky: 'bg-sky-50 text-sky-600',
  amber: 'bg-amber-50 text-amber-600',
  slate: 'bg-slate-100 text-slate-600',
}

// Kartu angka dengan ikon di samping label, agar angka mendapat lebar penuh di HP
function KartuAngka({ icon: Icon, label, value, hint, tone }) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="flex items-start gap-2 text-sm font-medium text-slate-500">
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${WARNA_KARTU[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="pt-1 leading-tight">{label}</span>
      </p>
      <p className="mt-2 whitespace-nowrap text-xl font-extrabold text-slate-900 sm:text-2xl">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
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
    <form id="form-kas" onSubmit={kirim} className="grid gap-4 sm:grid-cols-2">
      {galat && (
        <div key={galat} ref={(el) => el?.scrollIntoView({ block: 'nearest' })} className="sm:col-span-2">
          <Alert tone="error">{galat}</Alert>
        </div>
      )}
      <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1.5 sm:col-span-2" role="radiogroup" aria-label="Jenis transaksi">
        {Object.entries(JENIS_KAS).map(([j, { label }]) => (
          <button
            key={j}
            type="button"
            role="radio"
            aria-checked={form.jenis === j}
            onClick={() => gantiJenis(j)}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition ${form.jenis === j ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
        <p className="-mt-2 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800 sm:col-span-2">
          {form.kategori === SALDO_AWAL
            ? 'Saldo awal dipakai sekali saat mulai mencatat, untuk sisa kas sebelumnya. Tidak dihitung sebagai pemasukan bulanan.'
            : 'Pembayaran SPP tidak perlu dicatat di sini karena sudah masuk otomatis dari menu Keuangan SPP.'}
        </p>
      )}
      <div className="sm:col-span-2">
        <label htmlFor="kas-uraian" className={labelCls}>
          Uraian
        </label>
        <input id="kas-uraian" required maxLength={200} value={form.uraian} onChange={(e) => ubah('uraian', e.target.value)} placeholder={CONTOH_URAIAN[form.jenis]} className={inputCls} />
      </div>
      <div>
        <label htmlFor="kas-jumlah" className={labelCls}>
          Jumlah
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">Rp</span>
          <input
            id="kas-jumlah"
            inputMode="numeric"
            autoComplete="off"
            required
            value={teksDariAngka(form.jumlah)}
            onChange={(e) => ubah('jumlah', angkaDariTeks(e.target.value))}
            placeholder="0"
            className={`${inputCls} pl-10 font-semibold tabular-nums`}
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
      <div className="sm:col-span-2">
        <label htmlFor="kas-bukti" className={labelCls}>
          No. bukti <span className="font-normal text-slate-400">(opsional)</span>
        </label>
        <input id="kas-bukti" maxLength={40} value={form.bukti} onChange={(e) => ubah('bukti', e.target.value)} placeholder="Contoh: BKK-2026-10-004" className={inputCls} />
        <p className="mt-1.5 text-xs text-slate-500">Nomor kuitansi atau bukti transfer, agar mudah dicocokkan saat pemeriksaan.</p>
      </div>
      <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
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
        <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Belum ada {JENIS_KAS[jenis].label.toLowerCase()} di bulan ini.</p>
      ) : (
        <ul className="space-y-3.5">
          {daftar.map(([kategori, jumlah]) => (
            <li key={kategori}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 text-slate-700">
                  {kategori}
                  {kategori === KATEGORI_SPP && <span className="ml-1.5 text-xs text-slate-400">otomatis</span>}
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-slate-900">
                  {rupiah(jumlah)} <span className="ml-1 text-xs font-normal text-slate-500">{Math.round((jumlah / total) * 100)}%</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full" style={{ width: `${(jumlah / total) * 100}%`, background: JENIS_KAS[jenis].warna }} />
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
        <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
          <button onClick={() => bukaForm('masuk')} disabled={!kas} className={`${btn.primary} whitespace-nowrap px-3 sm:px-4`}>
            <Plus className="h-4 w-4" />
            <span>
              <span className="hidden sm:inline">Catat </span>Pemasukan
            </span>
          </button>
          <button onClick={() => bukaForm('keluar')} disabled={!kas} className={`${btn.secondary} whitespace-nowrap px-3 sm:px-4`}>
            <Minus className="h-4 w-4" />
            <span>
              <span className="hidden sm:inline">Catat </span>Pengeluaran
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

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label htmlFor="kas-bulan" className="text-sm font-medium text-slate-600">
          Bulan
        </label>
        <select id="kas-bulan" value={bulan} onChange={(e) => setBulan(e.target.value)} className={`${inputCls} w-auto! py-2 font-semibold`}>
          {daftarBulan.map((b) => (
            <option key={b} value={b}>
              {namaBulan(b)}
            </option>
          ))}
        </select>
        <button onClick={unduhCsv} className={`${btn.secondary} ml-auto py-2`}>
          <Download className="h-4 w-4" /> Unduh laporan (CSV)
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
        <p className="-mt-2 mb-4 text-sm text-slate-500">Klik salah satu bulan untuk melihat rinciannya.</p>
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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Rincian judul="Dari mana uang masuk" jenis="masuk" perKategori={r.perKategori.masuk} total={r.masuk} />
        <Rincian judul="Ke mana uang keluar" jenis="keluar" perKategori={r.perKategori.keluar} total={r.keluar} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center">
          <h2 className="font-bold text-slate-900 lg:mr-auto">Buku kas · {namaB}</h2>
          <Tabs
            value={saring}
            onChange={setSaring}
            items={[
              ['semua', 'Semua', milikBulan.length],
              ['masuk', 'Masuk', milikBulan.filter((t) => t.jenis === 'masuk').length],
              ['keluar', 'Keluar', milikBulan.filter((t) => t.jenis === 'keluar').length],
            ]}
          />
          <div className="relative lg:w-64">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari uraian atau no. bukti…" aria-label="Cari transaksi" className={`${inputCls} pl-10`} />
          </div>
        </div>

        {tampil.length === 0 ? (
          <EmptyState icon={Inbox} title="Belum ada transaksi" desc={q ? 'Coba kata kunci lain.' : `Belum ada catatan kas di bulan ${namaB}.`} />
        ) : (
          <ul className="divide-y divide-slate-100">
            {tampil.map((t) => {
              const masuk = t.jenis === 'masuk'
              const [, bln, tgl] = t.tanggal.split('-')
              return (
                <li key={t.id} className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
                  <div className="w-11 shrink-0 rounded-xl bg-slate-50 py-1.5 text-center" title={formatTanggal(t.tanggal)}>
                    <p className="text-base font-bold leading-tight text-slate-800">{Number(tgl)}</p>
                    <p className="text-[10px] font-semibold uppercase text-slate-500">{namaBulan(`2000-${bln}`, { month: 'short' })}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* HP sempit: nominal di bawah uraian agar uraian tidak terjepit */}
                    <div className="flex flex-col items-start gap-0.5 min-[480px]:flex-row min-[480px]:justify-between min-[480px]:gap-3">
                      <p className="min-w-0 font-semibold text-slate-800">{t.uraian}</p>
                      <p className={`shrink-0 whitespace-nowrap text-sm font-bold tabular-nums sm:text-base ${masuk ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {masuk ? '+' : '−'}
                        {rupiah(t.jumlah)}
                      </p>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-slate-500">
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-sm" style={{ background: JENIS_KAS[t.jenis].warna }} /> {t.kategori}
                        </span>
                        {t.metode && <span>· {t.metode}</span>}
                        {t.bukti && <span>· {t.bukti}</span>}
                        {t.otomatis && <Badge className="bg-sky-50 text-sky-700">Otomatis dari SPP</Badge>}
                      </p>
                      <p className="ml-auto whitespace-nowrap tabular-nums">Saldo {rupiahTanda(saldo[t.id])}</p>
                    </div>
                  </div>
                  <div className="flex w-8 shrink-0 flex-col items-end gap-0.5 sm:w-16 sm:flex-row sm:justify-end">
                    {!t.otomatis && (
                      <>
                        <button onClick={() => bukaForm(t.jenis, t)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label={`Ubah ${t.uraian}`}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setHapusItem(t)
                            setGalatHapus('')
                          }}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
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
        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 px-5 py-3 text-sm">
          <span className="text-slate-500">
            {tampil.length} dari {milikBulan.length} transaksi
          </span>
          <span className="text-slate-600">
            Saldo akhir {namaPendek}: <span className="font-bold tabular-nums text-slate-900">{rupiahTanda(r.saldoAkhir)}</span>
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
            <button onClick={konfirmasiHapus} disabled={menghapus} className={`${btn.primary} bg-rose-600 hover:bg-rose-700`}>
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
          <p className="text-slate-600">
            <span className="font-semibold text-slate-900">{hapusItem.uraian}</span> sebesar {rupiah(hapusItem.jumlah)} pada {formatTanggal(hapusItem.tanggal)} akan dihapus
            dari buku kas.
          </p>
        )}
      </Modal>
    </>
  )
}
