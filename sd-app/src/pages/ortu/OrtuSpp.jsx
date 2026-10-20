import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, Clock, ExternalLink, Landmark, Loader2, MessageCircle, PartyPopper, QrCode, Receipt, RefreshCw, Smartphone, UserX, Wallet } from 'lucide-react'
import { Alert, Badge, Card, DashHeader, EmptyState, Modal, btn } from '../../components/ui'
import { Kuitansi, LegendaSpp, PilihBulan, QrPembayaran, StripBulan, TombolSalin, riwayatPembayaran } from '../../components/Spp'
import { useAuth } from '../../context/AuthContext'
import { useData, useSegarCepat } from '../../context/DataContext'
import { BANK_VA, SEKOLAH, SPP } from '../../data/dummy'
import { formatTanggal } from '../../utils/format'
import { bulanBisaDibayar, bulanWajibBayar, daftarBulan, kadaluarsa, rupiah, statusSpp, transaksiAktif } from '../../utils/spp'

const MENU_BANK = {
  bca: 'm-Transfer → BCA Virtual Account',
  bri: 'Pembayaran → BRIVA',
  mandiri: 'Bayar → Virtual Account',
  bni: 'Transfer → Virtual Account Billing',
}


function Langkah({ aktif }) {
  const daftar = ['Pilih Bulan', 'Cara Bayar', 'Bayar']
  return (
    <ol className="mb-5 d-flex align-items-center gap-2">
      {daftar.map((l, i) => (
        <li key={l} className="d-flex flex-1 align-items-center gap-2">
          <span
            className={`d-flex h-7 w-7 flex-shrink-0 align-items-center justify-content-center rounded-pill fs-xs fw-bold ${
              i < aktif ? 'titik-emerald text-white' : i === aktif ? 'bg-primary text-white' : 'bg-abu-100 text-abu-400'
            }`}
          >
            {i < aktif ? '✓' : i + 1}
          </span>
          <span className={`fs-xs fw-semibold ${i === aktif ? 'text-tinta' : 'text-abu-400'}`}>{l}</span>
          {i < daftar.length - 1 && <span className="h-0-5 flex-1 rounded-1 bg-abu-100" />}
        </li>
      ))}
    </ol>
  )
}

/*
  Mode demo (server menandai transaksi dengan simulasi: true): tidak ada bank sungguhan, jadi pembayaran
  dilakukan di halaman Simulator Bank yang berperan sebagai aplikasi e-wallet/m-banking. Simulator itulah
  yang mengirim notifikasi bertanda tangan ke server; halaman orang tua tetap tidak bisa menandai lunas.
*/
function PanelSimulasi({ url, qris }) {
  const lokal = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
  return (
    <div className="mt-4 rounded-3 border border-putus border-warning-subtle bg-warning-subtle p-4 fs-sm text-warning-emphasis">
      <p className="d-flex align-items-center gap-2 fw-bold">
        <Smartphone className="h-4 w-4 flex-shrink-0" aria-hidden="true" /> Mode demo: Simulator Bank
      </p>
      <p className="mt-1">
        Website ini belum tersambung ke bank sungguhan. {qris ? 'Scan kode QR di atas dengan kamera HP' : 'Buka simulator'} untuk membayar lewat aplikasi bank
        tiruan; bank tiruan itulah yang mengonfirmasi pembayaran ke server sekolah.
      </p>
      {qris && lokal && (
        <p className="mt-1 fs-xs">
          HP tidak bisa membuka alamat <b>{window.location.host}</b>. Untuk scan dari HP, buka website ini lewat alamat jaringan laptop (mis.
          http://192.168.x.x:5173) dengan HP di Wi-Fi yang sama.
        </p>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 d-inline-flex align-items-center gap-1-5 fw-semibold text-warning-emphasis text-decoration-underline link-offset-1 hover-teks-amber"
      >
        Buka Simulator Bank di tab baru <ExternalLink className="h-3-5 w-3-5" aria-hidden="true" />
      </a>
    </div>
  )
}

function SisaWaktu({ sampai }) {
  const [sekarang, setSekarang] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setSekarang(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const sisa = Math.max(0, Math.floor((new Date(sampai) - sekarang) / 1000))
  const mm = String(Math.floor(sisa / 60)).padStart(2, '0')
  const ss = String(sisa % 60).padStart(2, '0')
  return (
    <span className="d-inline-flex align-items-center gap-1-5 rounded-pill bg-warning-subtle px-3 py-1 fs-sm fw-bold text-warning-emphasis">
      <Clock className="h-4 w-4" /> {mm}:{ss}
    </span>
  )
}

export default function OrtuSpp() {
  const { user } = useAuth()
  const { data, buatTransaksi: kirimTransaksi, batalkanTransaksi, cekStatusTransaksi } = useData()
  const [langkah, setLangkah] = useState(null) // null | 'bulan' | 'metode' | 'bayar' | 'sukses'
  const [terpilih, setTerpilih] = useState([])
  const [metode, setMetode] = useState('qris')
  const [bank, setBank] = useState('bca')
  const [trxId, setTrxId] = useState(null)
  const [tabPanduan, setTabPanduan] = useState('mbanking')
  const [kuitansi, setKuitansi] = useState(null)
  const [memeriksa, setMemeriksa] = useState(false)
  const [pesanCek, setPesanCek] = useState('')
  const trx = data.transaksi.find((t) => t.id === trxId)

  // Selama menunggu pembayaran, status diperiksa ke server tiap beberapa detik
  useSegarCepat(langkah === 'bayar')
  // Lunas hanya setelah server menerima konfirmasi bank/gateway; layar mengikuti status dari server
  useEffect(() => {
    if (langkah === 'bayar' && trx?.status === 'berhasil') setLangkah('sukses')
  }, [langkah, trx?.status])

  const anak = data.siswa.find((s) => s.nis === user.anakNis)
  if (!anak) return <EmptyState icon={UserX} title="Data anak tidak ditemukan" desc="Silakan hubungi Tata Usaha." />

  const nis = anak.nis
  const wajib = bulanWajibBayar(data, nis)
  const bisaDibayar = bulanBisaDibayar(data, nis)
  const terlambat = wajib.filter((b) => statusSpp(data, nis, b) === 'terlambat')
  const trxBerjalan = transaksiAktif(data, nis)
  const riwayat = riwayatPembayaran(data, nis)
  const total = terpilih.length * SPP.nominal

  const mulaiBayar = () => {
    if (trxBerjalan) {
      setTrxId(trxBerjalan.id)
      setLangkah('bayar')
      return
    }
    setTerpilih(wajib.length ? wajib : bisaDibayar.slice(0, 1))
    setLangkah('bulan')
  }

  // Nomor VA/QRIS, nomor transaksi, dan batas waktu bayar (30 menit) dibuat server
  const buatTransaksi = async () => {
    const baru = await kirimTransaksi({ bulan: terpilih, metode, bank: metode === 'va' ? bank : null })
    if (!baru) return
    setTrxId(baru.id)
    setTabPanduan('mbanking')
    setLangkah('bayar')
  }

  const gantiCaraBayar = async () => {
    if (await batalkanTransaksi(trx.id)) return
    setTerpilih(trx.bulan)
    setMetode(trx.metode)
    if (trx.bank) setBank(trx.bank)
    setLangkah('metode')
  }

  // Hanya membaca ulang status dari server; tidak ada cara menandai lunas dari halaman ini
  const cekStatus = async () => {
    setMemeriksa(true)
    setPesanCek('')
    await cekStatusTransaksi()
    setMemeriksa(false)
    setPesanCek('Belum ada pembayaran yang masuk. Status juga diperiksa otomatis setiap beberapa detik.')
  }
  const urlSimulasi = trx && `${window.location.origin}/simulasi-bayar?kode=${encodeURIComponent(trx.kode)}`

  const tutup = () => setLangkah(null)

  const judulModal = { bulan: 'Bayar SPP', metode: 'Bayar SPP', bayar: 'Selesaikan Pembayaran', sukses: 'Pembayaran Berhasil' }[langkah]

  return (
    <>
      <DashHeader title="Pembayaran SPP" desc={`${anak.nama} · Kelas ${anak.kelas} · Tahun ajaran ${SPP.tahunAjaran}`} />

      {trxBerjalan && langkah === null && (
        <div className="mb-6 d-flex flex-column gap-3 rounded-3 border border-info-subtle bg-info-subtle p-5 flex-sm-row align-items-sm-center">
          <Clock className="h-6 w-6 flex-shrink-0 text-info" />
          <div className="flex-1">
            <p className="fw-bold text-info-emphasis">Ada pembayaran yang belum diselesaikan</p>
            <p className="fs-sm text-info-emphasis">
              {rupiah(trxBerjalan.total)} via {trxBerjalan.metodeLabel} · berlaku sampai pukul{' '}
              {new Date(trxBerjalan.kadaluarsa).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button onClick={mulaiBayar} className={btn.primary}>
            Lanjutkan Pembayaran
          </button>
        </div>
      )}

      {/* Ringkasan tagihan */}
      <Card className="mb-6 overflow-hidden">
        {wajib.length > 0 ? (
          <div className="d-flex flex-column gap-5 p-6 flex-sm-row align-items-sm-center p-sm-8">
            <span className="d-flex h-14 w-14 flex-shrink-0 align-items-center justify-content-center rounded-3 bg-merah-50 text-primary">
              <Wallet className="h-7 w-7" />
            </span>
            <div className="flex-1">
              <p className="fs-sm fw-medium text-tinta-3">Tagihan yang perlu dibayar</p>
              <p className="fs-3xl fw-extrabold text-tinta fs-sm-4xl">{rupiah(wajib.length * SPP.nominal)}</p>
              <p className="mt-1 fs-sm text-tinta-2">
                {wajib.length} bulan: {daftarBulan(wajib)}
              </p>
              {terlambat.length > 0 && (
                <p className="mt-2 d-inline-flex rounded-pill bg-danger-subtle px-3 py-1 fs-xs fw-semibold text-danger">
                  {terlambat.length} bulan sudah lewat jatuh tempo
                </p>
              )}
            </div>
            <button onClick={mulaiBayar} disabled={!!trxBerjalan} className={`${btn.primary} px-8 py-3-5 fs-base`}>
              Bayar Sekarang
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-5 p-6 flex-sm-row align-items-sm-center p-sm-8">
            <span className="d-flex h-14 w-14 flex-shrink-0 align-items-center justify-content-center rounded-3 bg-success-subtle text-success">
              <PartyPopper className="h-7 w-7" />
            </span>
            <div className="flex-1">
              <p className="fs-xl fw-extrabold text-tinta">Semua tagihan sudah lunas 🎉</p>
              <p className="mt-1 fs-sm text-tinta-2">Terima kasih, Bapak/Ibu. Tagihan berikutnya jatuh tempo setiap tanggal {SPP.tanggalJatuhTempo}.</p>
            </div>
            {bisaDibayar.length > 0 && !trxBerjalan && (
              <button onClick={mulaiBayar} className={btn.secondary}>
                Bayar Bulan Berikutnya
              </button>
            )}
          </div>
        )}
      </Card>

      <Card className="mb-6 p-6">
        <div className="mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <h2 className="fw-bold text-tinta">Status SPP {SPP.tahunAjaran}</h2>
          <p className="fs-sm text-tinta-3">{rupiah(SPP.nominal)} / bulan · jatuh tempo tanggal {SPP.tanggalJatuhTempo}</p>
        </div>
        <StripBulan data={data} nis={nis} />
        <div className="mt-4">
          <LegendaSpp sebelumMasuk={SPP.bulan.some((b) => statusSpp(data, nis, b) === 'sebelumMasuk')} />
        </div>
      </Card>

      <div className="d-grid gap-6 kolom-lg-isi-320">
        <Card className="p-6">
          <h2 className="fw-bold text-tinta">Riwayat Pembayaran</h2>
          {riwayat.length === 0 ? (
            <EmptyState icon={Receipt} title="Belum ada pembayaran" />
          ) : (
            <ul className="mt-4 pembatas-y pembatas-abu">
              {riwayat.map((r) => (
                <li key={r.noTransaksi} className="d-flex flex-wrap align-items-center gap-3 py-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 teks-terang-emerald" />
                  <div className="min-w-0 flex-1">
                    <p className="fw-semibold text-tinta">SPP {daftarBulan(r.bulan)}</p>
                    <p className="fs-xs text-tinta-3">
                      {formatTanggal(r.tanggal)} · {r.metode} · {rupiah(r.bulan.length * SPP.nominal)}
                    </p>
                  </div>
                  <button onClick={() => setKuitansi(r)} className="d-inline-flex align-items-center gap-1-5 fs-sm fw-semibold text-primary hover-teks-merah">
                    <Receipt className="h-4 w-4" /> Kuitansi
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="h-auto p-6">
          <h2 className="fw-bold text-tinta">Butuh bantuan?</h2>
          <p className="mt-2 fs-sm text-tinta-2">
            Ada kendala pembayaran atau ingin membayar tunai? Hubungi Tata Usaha pada jam kerja.
          </p>
          <p className="mt-4 d-flex align-items-center gap-2 fs-sm fw-semibold text-tinta">
            <MessageCircle className="h-4 w-4 text-success" /> WhatsApp TU: {SEKOLAH.whatsapp}
          </p>
        </Card>
      </div>

      {/* Alur pembayaran */}
      <Modal open={langkah !== null} onClose={tutup} title={judulModal}>
        {langkah === 'bulan' && (
          <>
            <Langkah aktif={0} />
            <PilihBulan data={data} nis={nis} terpilih={terpilih} onChange={setTerpilih} />
            <div className="position-sticky bottom-0 mx-n6 mb-n5 mt-5 d-flex flex-wrap align-items-center justify-content-between gap-3 border-top border-abu-100 bg-white px-6 py-4">
              <div>
                <p className="fs-xs text-tinta-3">Total ({terpilih.length} bulan)</p>
                <p className="fs-xl fw-extrabold text-tinta">{rupiah(total)}</p>
              </div>
              <button onClick={() => setLangkah('metode')} disabled={terpilih.length === 0} className={btn.primary}>
                Lanjut
              </button>
            </div>
          </>
        )}

        {langkah === 'metode' && (
          <>
            <Langkah aktif={1} />
            <div className="antara-y-3">
              <button
                type="button"
                onClick={() => setMetode('qris')}
                className={`d-flex w-100 gap-4 rounded-3 border border-2 p-4 text-start transisi ${
                  metode === 'qris' ? 'border-merah-500 bg-merah-50' : 'border-abu-200 hover-garis-abu'
                }`}
              >
                <QrCode className="mt-0-5 h-7 w-7 flex-shrink-0 text-primary" />
                <span>
                  <span className="d-flex align-items-center gap-2 fw-bold text-tinta">
                    QRIS <Badge className="bg-success-subtle text-success">Paling mudah</Badge>
                  </span>
                  <span className="mt-1 d-block fs-sm text-tinta-2">
                    Scan pakai GoPay, OVO, DANA, ShopeePay, LinkAja, atau aplikasi m-banking apa pun.
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMetode('va')}
                className={`d-flex w-100 gap-4 rounded-3 border border-2 p-4 text-start transisi ${
                  metode === 'va' ? 'border-merah-500 bg-merah-50' : 'border-abu-200 hover-garis-abu'
                }`}
              >
                <Landmark className="mt-0-5 h-7 w-7 flex-shrink-0 text-primary" />
                <span>
                  <span className="d-block fw-bold text-tinta">Transfer Virtual Account</span>
                  <span className="mt-1 d-block fs-sm text-tinta-2">Transfer lewat m-banking, internet banking, atau ATM.</span>
                </span>
              </button>

              {metode === 'va' && (
                <div className="d-grid kolom-4 gap-2 ps-0 ps-sm-11">
                  {BANK_VA.map((b) => (
                    <button
                      key={b.kode}
                      type="button"
                      onClick={() => setBank(b.kode)}
                      className={`rounded-2 border border-2 py-2-5 fs-sm fw-bold transisi ${
                        bank === b.kode ? 'border-merah-500 bg-white text-merah-700' : 'border-abu-200 text-tinta-2 hover-garis-abu'
                      }`}
                    >
                      {b.nama}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 rounded-3 bg-abu-50 p-4 fs-sm">
              <div className="d-flex justify-content-between text-tinta-2">
                <span>SPP {daftarBulan(terpilih)}</span>
                <span>{rupiah(total)}</span>
              </div>
              <div className="mt-1-5 d-flex justify-content-between text-tinta-2">
                <span>Biaya admin</span>
                <span className="fw-semibold text-success">Gratis</span>
              </div>
              <div className="mt-3 d-flex justify-content-between border-top border-abu-200 pt-3 fs-base fw-extrabold text-tinta">
                <span>Total bayar</span>
                <span>{rupiah(total)}</span>
              </div>
            </div>

            <div className="mt-5 d-flex gap-2">
              <button onClick={() => setLangkah('bulan')} className={btn.secondary} aria-label="Kembali">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button onClick={buatTransaksi} className={`${btn.primary} flex-1 py-3`}>
                Bayar {rupiah(total)}
              </button>
            </div>
          </>
        )}

        {langkah === 'bayar' && trx && (
          <>
            <Langkah aktif={2} />
            {kadaluarsa(trx) ? (
              <div className="antara-y-4 text-center">
                <Alert tone="warning">Waktu pembayaran sudah habis. Silakan buat pembayaran baru.</Alert>
                <button onClick={gantiCaraBayar} className={btn.primary}>
                  Buat Pembayaran Baru
                </button>
              </div>
            ) : (
              <>
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 rounded-3 bg-abu-50 p-4">
                  <div>
                    <p className="fs-xs text-tinta-3">Total bayar</p>
                    <div className="d-flex align-items-center gap-2">
                      <p className="fs-2xl fw-extrabold text-tinta">{rupiah(trx.total)}</p>
                      <TombolSalin teks={String(trx.total)} />
                    </div>
                    <p className="mt-0-5 fs-xs text-tinta-3">SPP {daftarBulan(trx.bulan)}</p>
                  </div>
                  <div className="text-end">
                    <p className="mb-1 fs-xs text-tinta-3">Selesaikan dalam</p>
                    <SisaWaktu sampai={trx.kadaluarsa} />
                  </div>
                </div>

                {trx.metode === 'qris' ? (
                  <div className="mt-5">
                    <div className="rounded-3 border border-abu-200 p-5 text-center">
                      <p className="fs-xs fw-bold ls-widest text-tinta-3">QRIS · {SEKOLAH.nama.toUpperCase()}</p>
                      <div className="mt-3">
                        <QrPembayaran isi={trx.simulasi ? urlSimulasi : trx.kode} />
                      </div>
                    </div>
                    <ol className="mt-5 antara-y-2-5 fs-sm text-tinta-2">
                      {[
                        'Buka aplikasi e-wallet atau m-banking di HP Anda.',
                        'Pilih menu Scan / Bayar QRIS.',
                        `Scan kode QR di atas. Pastikan nama penerima "${SEKOLAH.nama}" dan nominal ${rupiah(trx.total)}.`,
                        'Konfirmasi pembayaran dengan PIN Anda.',
                      ].map((t, i) => (
                        <li key={i} className="d-flex gap-3">
                          <span className="d-flex h-6 w-6 flex-shrink-0 align-items-center justify-content-center rounded-pill bg-merah-100 fs-xs fw-bold text-merah-700">{i + 1}</span>
                          {t}
                        </li>
                      ))}
                    </ol>
                    <p className="mt-4 rounded-2 bg-warning-subtle px-4 py-3 fs-xs text-warning-emphasis">
                      <b>Membuka dari HP?</b> Tekan “Simpan gambar QR”, lalu di aplikasi pembayaran pilih Scan → ikon galeri, dan pilih gambar tersebut.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5">
                    <div className="rounded-3 border border-abu-200 p-5">
                      <p className="fs-sm text-tinta-3">Nomor Virtual Account {BANK_VA.find((b) => b.kode === trx.bank)?.nama}</p>
                      <div className="mt-1 d-flex flex-wrap align-items-center gap-3">
                        <p className="font-monospace fs-2xl fw-extrabold ls-wider text-tinta">{trx.kode.replace(/(\d{4})(?=\d)/g, '$1 ')}</p>
                        <TombolSalin teks={trx.kode} label="Salin nomor" />
                      </div>
                      <p className="mt-2 fs-xs text-tinta-3">Atas nama: {SEKOLAH.nama} – {anak.nama}</p>
                    </div>
                    <div className="mt-5 d-inline-flex mw-100 overflow-x-auto rounded-2 bg-abu-100 p-1">
                      {[
                        ['mbanking', 'm-Banking'],
                        ['atm', 'ATM'],
                      ].map(([k, l]) => (
                        <button
                          key={k}
                          onClick={() => setTabPanduan(k)}
                          className={`flex-shrink-0 text-nowrap rounded-1 px-4 py-1-5 fs-sm fw-semibold ${tabPanduan === k ? 'bg-white text-tinta shadow-sm' : 'text-tinta-3'}`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                    <ol className="mt-4 antara-y-2-5 fs-sm text-tinta-2">
                      {(tabPanduan === 'mbanking'
                        ? [
                            `Buka aplikasi ${BANK_VA.find((b) => b.kode === trx.bank)?.nama} Mobile dan login.`,
                            `Pilih menu ${MENU_BANK[trx.bank]}.`,
                            'Tempel (paste) nomor Virtual Account di atas.',
                            `Pastikan nama "${SEKOLAH.nama}" dan nominal ${rupiah(trx.total)} sudah sesuai.`,
                            'Masukkan PIN untuk menyelesaikan pembayaran.',
                          ]
                        : [
                            'Masukkan kartu ATM dan PIN Anda.',
                            'Pilih Transaksi Lainnya → Transfer → Virtual Account.',
                            'Masukkan nomor Virtual Account di atas.',
                            `Periksa nama "${SEKOLAH.nama}" dan nominal, lalu pilih Benar/Ya.`,
                            'Simpan struk ATM sebagai bukti.',
                          ]
                      ).map((t, i) => (
                        <li key={i} className="d-flex gap-3">
                          <span className="d-flex h-6 w-6 flex-shrink-0 align-items-center justify-content-center rounded-pill bg-merah-100 fs-xs fw-bold text-merah-700">{i + 1}</span>
                          {t}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="mt-5 d-flex align-items-start gap-3 rounded-3 border border-info-subtle bg-info-subtle p-4 fs-sm text-info-emphasis" role="status">
                  <Loader2 className="mt-0-5 h-5 w-5 flex-shrink-0 berputar" aria-hidden="true" />
                  <div>
                    <p className="fw-bold">Menunggu konfirmasi dari {trx.metode === 'qris' ? 'penyedia QRIS' : 'bank'}…</p>
                    <p className="mt-0-5">
                      Halaman ini berubah sendiri menjadi <b>Lunas</b> begitu pembayaran diterima. Status hanya diubah oleh bank, bukan dari halaman ini, jadi
                      tidak perlu mengirim bukti transfer.
                    </p>
                  </div>
                </div>
                {trx.simulasi && <PanelSimulasi url={urlSimulasi} qris={trx.metode === 'qris'} />}
                <div className="mt-4 d-flex flex-column-reverse gap-2 flex-sm-row">
                  <button onClick={gantiCaraBayar} className={btn.secondary}>
                    Ganti Cara Bayar
                  </button>
                  <button onClick={cekStatus} disabled={memeriksa} className={`${btn.primary} flex-1 py-3`}>
                    <RefreshCw className={`h-4 w-4 ${memeriksa ? 'berputar' : ''}`} aria-hidden="true" /> {memeriksa ? 'Memeriksa…' : 'Cek Status Pembayaran'}
                  </button>
                </div>
                {pesanCek && (
                  <p className="mt-2 text-center fs-xs text-tinta-3" role="status">
                    {pesanCek}
                  </p>
                )}
              </>
            )}
          </>
        )}

        {langkah === 'sukses' && trx && (
          <div className="py-4 text-center">
            <span className="mx-auto d-flex h-20 w-20 align-items-center justify-content-center rounded-pill bg-success-subtle text-success">
              <CheckCircle2 className="h-11 w-11" />
            </span>
            <p className="mt-5 fs-2xl fw-extrabold text-tinta">Pembayaran Berhasil!</p>
            <p className="mt-2 text-tinta-2">
              SPP {daftarBulan(trx.bulan)} untuk <b>{anak.nama}</b> sudah lunas.
            </p>
            <p className="mt-4 fs-3xl fw-extrabold text-success">{rupiah(trx.total)}</p>
            <p className="mt-1 fs-xs text-tinta-3">
              {trx.metodeLabel} · No. {trx.noTransaksi}
            </p>
            <div className="mt-6 d-flex flex-column gap-2 flex-sm-row">
              <button
                onClick={() => {
                  setKuitansi({ noTransaksi: trx.noTransaksi, tanggal: data.spp[nis]?.[trx.bulan[0]]?.tanggal, metode: trx.metodeLabel, bulan: trx.bulan })
                  tutup()
                }}
                className={`${btn.secondary} flex-1`}
              >
                <Receipt className="h-4 w-4" /> Lihat Kuitansi
              </button>
              <button onClick={tutup} className={`${btn.primary} flex-1`}>
                Selesai
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!kuitansi} onClose={() => setKuitansi(null)} title="Kuitansi Pembayaran">
        {kuitansi && <Kuitansi siswa={anak} pembayaran={kuitansi} />}
      </Modal>
    </>
  )
}
