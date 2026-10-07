import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, Clock, Landmark, MessageCircle, PartyPopper, QrCode, Receipt, UserX, Wallet } from 'lucide-react'
import { Alert, Badge, Card, DashHeader, EmptyState, Modal, btn } from '../../components/ui'
import { Kuitansi, LegendaSpp, PilihBulan, QrDemo, StripBulan, TombolSalin, riwayatPembayaran } from '../../components/Spp'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { BANK_VA, SEKOLAH, SPP } from '../../data/dummy'
import { formatTanggal, uid } from '../../utils/format'
import { buatNoTransaksi, bulanBisaDibayar, bulanWajibBayar, daftarBulan, kadaluarsa, rupiah, statusSpp, transaksiAktif } from '../../utils/spp'

const BATAS_MENIT = 30

const MENU_BANK = {
  bca: 'm-Transfer → BCA Virtual Account',
  bri: 'Pembayaran → BRIVA',
  mandiri: 'Bayar → Virtual Account',
  bni: 'Transfer → Virtual Account Billing',
}


function Langkah({ aktif }) {
  const daftar = ['Pilih Bulan', 'Cara Bayar', 'Bayar']
  return (
    <ol className="mb-5 flex items-center gap-2">
      {daftar.map((l, i) => (
        <li key={l} className="flex flex-1 items-center gap-2">
          <span
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
              i < aktif ? 'bg-emerald-500 text-white' : i === aktif ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {i < aktif ? '✓' : i + 1}
          </span>
          <span className={`text-xs font-semibold ${i === aktif ? 'text-slate-900' : 'text-slate-400'}`}>{l}</span>
          {i < daftar.length - 1 && <span className="h-0.5 flex-1 rounded bg-slate-100" />}
        </li>
      ))}
    </ol>
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
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
      <Clock className="h-4 w-4" /> {mm}:{ss}
    </span>
  )
}

export default function OrtuSpp() {
  const { user } = useAuth()
  const { data, tambah, ubah, selesaikanTransaksi } = useData()
  const [langkah, setLangkah] = useState(null) // null | 'bulan' | 'metode' | 'bayar' | 'sukses'
  const [terpilih, setTerpilih] = useState([])
  const [metode, setMetode] = useState('qris')
  const [bank, setBank] = useState('bca')
  const [trxId, setTrxId] = useState(null)
  const [tabPanduan, setTabPanduan] = useState('mbanking')
  const [kuitansi, setKuitansi] = useState(null)

  const anak = data.siswa.find((s) => s.nis === user.anakNis)
  if (!anak) return <EmptyState icon={UserX} title="Data anak tidak ditemukan" desc="Silakan hubungi Tata Usaha." />

  const nis = anak.nis
  const wajib = bulanWajibBayar(data, nis)
  const bisaDibayar = bulanBisaDibayar(data, nis)
  const terlambat = wajib.filter((b) => statusSpp(data, nis, b) === 'terlambat')
  const trxBerjalan = transaksiAktif(data, nis)
  const trx = data.transaksi.find((t) => t.id === trxId)
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

  const buatTransaksi = () => {
    const id = uid()
    const infoBank = BANK_VA.find((b) => b.kode === bank)
    const sekarang = new Date()
    tambah('transaksi', {
      id,
      nis,
      bulan: terpilih,
      total,
      metode,
      bank: metode === 'va' ? bank : null,
      metodeLabel: metode === 'qris' ? 'QRIS' : `VA ${infoBank.nama}`,
      kode: metode === 'va' ? `${infoBank.prefix}${nis}${String(sekarang.getTime()).slice(-5)}` : `QRIS-${id}`,
      noTransaksi: buatNoTransaksi(),
      status: 'menunggu',
      dibuat: sekarang.toISOString(),
      kadaluarsa: new Date(sekarang.getTime() + BATAS_MENIT * 60000).toISOString(),
    })
    setTrxId(id)
    setTabPanduan('mbanking')
    setLangkah('bayar')
  }

  const gantiCaraBayar = () => {
    ubah('transaksi', trx.id, { status: 'dibatalkan' })
    setTerpilih(trx.bulan)
    setMetode(trx.metode)
    if (trx.bank) setBank(trx.bank)
    setLangkah('metode')
  }

  // Mode demo: anggap pembayaran sudah diterima. Di produksi, status datang dari payment gateway.
  const cekStatus = () => {
    selesaikanTransaksi(trx.id)
    setLangkah('sukses')
  }

  const tutup = () => setLangkah(null)

  const judulModal = { bulan: 'Bayar SPP', metode: 'Bayar SPP', bayar: 'Selesaikan Pembayaran', sukses: 'Pembayaran Berhasil' }[langkah]

  return (
    <>
      <DashHeader title="Pembayaran SPP" desc={`${anak.nama} · Kelas ${anak.kelas} · Tahun ajaran ${SPP.tahunAjaran}`} />

      {trxBerjalan && langkah === null && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:flex-row sm:items-center">
          <Clock className="h-6 w-6 shrink-0 text-sky-600" />
          <div className="flex-1">
            <p className="font-bold text-sky-900">Ada pembayaran yang belum diselesaikan</p>
            <p className="text-sm text-sky-800">
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
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary-50 text-primary-600">
              <Wallet className="h-7 w-7" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500">Tagihan yang perlu dibayar</p>
              <p className="text-3xl font-extrabold text-slate-900 sm:text-4xl">{rupiah(wajib.length * SPP.nominal)}</p>
              <p className="mt-1 text-sm text-slate-600">
                {wajib.length} bulan: {daftarBulan(wajib)}
              </p>
              {terlambat.length > 0 && (
                <p className="mt-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                  {terlambat.length} bulan sudah lewat jatuh tempo
                </p>
              )}
            </div>
            <button onClick={mulaiBayar} disabled={!!trxBerjalan} className={`${btn.primary} px-8 py-3.5 text-base!`}>
              Bayar Sekarang
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <PartyPopper className="h-7 w-7" />
            </span>
            <div className="flex-1">
              <p className="text-xl font-extrabold text-slate-900">Semua tagihan sudah lunas 🎉</p>
              <p className="mt-1 text-sm text-slate-600">Terima kasih, Bapak/Ibu. Tagihan berikutnya jatuh tempo setiap tanggal {SPP.tanggalJatuhTempo}.</p>
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-slate-900">Status SPP {SPP.tahunAjaran}</h2>
          <p className="text-sm text-slate-500">{rupiah(SPP.nominal)} / bulan · jatuh tempo tanggal {SPP.tanggalJatuhTempo}</p>
        </div>
        <StripBulan data={data} nis={nis} />
        <div className="mt-4">
          <LegendaSpp />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          <h2 className="font-bold text-slate-900">Riwayat Pembayaran</h2>
          {riwayat.length === 0 ? (
            <EmptyState icon={Receipt} title="Belum ada pembayaran" />
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {riwayat.map((r) => (
                <li key={r.noTransaksi} className="flex flex-wrap items-center gap-3 py-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800">SPP {daftarBulan(r.bulan)}</p>
                    <p className="text-xs text-slate-500">
                      {formatTanggal(r.tanggal)} · {r.metode} · {rupiah(r.bulan.length * SPP.nominal)}
                    </p>
                  </div>
                  <button onClick={() => setKuitansi(r)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700">
                    <Receipt className="h-4 w-4" /> Kuitansi
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="h-fit p-6">
          <h2 className="font-bold text-slate-900">Butuh bantuan?</h2>
          <p className="mt-2 text-sm text-slate-600">
            Ada kendala pembayaran atau ingin membayar tunai? Hubungi Tata Usaha pada jam kerja.
          </p>
          <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp TU: {SEKOLAH.whatsapp}
          </p>
        </Card>
      </div>

      {/* Alur pembayaran */}
      <Modal open={langkah !== null} onClose={tutup} title={judulModal}>
        {langkah === 'bulan' && (
          <>
            <Langkah aktif={0} />
            <PilihBulan data={data} nis={nis} terpilih={terpilih} onChange={setTerpilih} />
            <div className="sticky bottom-0 -mx-6 -mb-5 mt-5 flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4">
              <div>
                <p className="text-xs text-slate-500">Total ({terpilih.length} bulan)</p>
                <p className="text-xl font-extrabold text-slate-900">{rupiah(total)}</p>
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
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setMetode('qris')}
                className={`flex w-full gap-4 rounded-2xl border-2 p-4 text-left transition ${
                  metode === 'qris' ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <QrCode className="mt-0.5 h-7 w-7 shrink-0 text-primary-600" />
                <span>
                  <span className="flex items-center gap-2 font-bold text-slate-900">
                    QRIS <Badge className="bg-emerald-100 text-emerald-700">Paling mudah</Badge>
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">
                    Scan pakai GoPay, OVO, DANA, ShopeePay, LinkAja, atau aplikasi m-banking apa pun.
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMetode('va')}
                className={`flex w-full gap-4 rounded-2xl border-2 p-4 text-left transition ${
                  metode === 'va' ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Landmark className="mt-0.5 h-7 w-7 shrink-0 text-primary-600" />
                <span>
                  <span className="block font-bold text-slate-900">Transfer Virtual Account</span>
                  <span className="mt-1 block text-sm text-slate-600">Transfer lewat m-banking, internet banking, atau ATM.</span>
                </span>
              </button>

              {metode === 'va' && (
                <div className="grid grid-cols-4 gap-2 pl-0 sm:pl-11">
                  {BANK_VA.map((b) => (
                    <button
                      key={b.kode}
                      type="button"
                      onClick={() => setBank(b.kode)}
                      className={`rounded-xl border-2 py-2.5 text-sm font-bold transition ${
                        bank === b.kode ? 'border-primary-500 bg-white text-primary-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {b.nama}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>SPP {daftarBulan(terpilih)}</span>
                <span>{rupiah(total)}</span>
              </div>
              <div className="mt-1.5 flex justify-between text-slate-600">
                <span>Biaya admin</span>
                <span className="font-semibold text-emerald-600">Gratis</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold text-slate-900">
                <span>Total bayar</span>
                <span>{rupiah(total)}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
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
              <div className="space-y-4 text-center">
                <Alert tone="warning">Waktu pembayaran sudah habis. Silakan buat pembayaran baru.</Alert>
                <button onClick={gantiCaraBayar} className={btn.primary}>
                  Buat Pembayaran Baru
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                  <div>
                    <p className="text-xs text-slate-500">Total bayar</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-extrabold text-slate-900">{rupiah(trx.total)}</p>
                      <TombolSalin teks={String(trx.total)} />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">SPP {daftarBulan(trx.bulan)}</p>
                  </div>
                  <div className="text-right">
                    <p className="mb-1 text-xs text-slate-500">Selesaikan dalam</p>
                    <SisaWaktu sampai={trx.kadaluarsa} />
                  </div>
                </div>

                {trx.metode === 'qris' ? (
                  <div className="mt-5">
                    <div className="rounded-2xl border border-slate-200 p-5 text-center">
                      <p className="text-xs font-bold tracking-widest text-slate-500">QRIS · {SEKOLAH.nama.toUpperCase()}</p>
                      <div className="mt-3">
                        <QrDemo teks={trx.kode} />
                      </div>
                    </div>
                    <ol className="mt-5 space-y-2.5 text-sm text-slate-700">
                      {[
                        'Buka aplikasi e-wallet atau m-banking di HP Anda.',
                        'Pilih menu Scan / Bayar QRIS.',
                        `Scan kode QR di atas. Pastikan nama penerima "${SEKOLAH.nama}" dan nominal ${rupiah(trx.total)}.`,
                        'Konfirmasi pembayaran dengan PIN Anda.',
                      ].map((t, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">{i + 1}</span>
                          {t}
                        </li>
                      ))}
                    </ol>
                    <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
                      <b>Membuka dari HP?</b> Tekan “Simpan gambar QR”, lalu di aplikasi pembayaran pilih Scan → ikon galeri, dan pilih gambar tersebut.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5">
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-sm text-slate-500">Nomor Virtual Account {BANK_VA.find((b) => b.kode === trx.bank)?.nama}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        <p className="font-mono text-2xl font-extrabold tracking-wider text-slate-900">{trx.kode.replace(/(\d{4})(?=\d)/g, '$1 ')}</p>
                        <TombolSalin teks={trx.kode} label="Salin nomor" />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">Atas nama: {SEKOLAH.nama} – {anak.nama}</p>
                    </div>
                    <div className="mt-5 inline-flex rounded-xl bg-slate-100 p-1">
                      {[
                        ['mbanking', 'm-Banking'],
                        ['atm', 'ATM'],
                      ].map(([k, l]) => (
                        <button
                          key={k}
                          onClick={() => setTabPanduan(k)}
                          className={`rounded-lg px-4 py-1.5 text-sm font-semibold ${tabPanduan === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                    <ol className="mt-4 space-y-2.5 text-sm text-slate-700">
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
                        <li key={i} className="flex gap-3">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">{i + 1}</span>
                          {t}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="mt-5">
                  <Alert tone="info">
                    Status akan berubah menjadi <b>Lunas</b> otomatis setelah pembayaran diterima — tidak perlu mengirim bukti transfer.
                    <span className="mt-1 block text-xs opacity-80">Mode demo: tekan “Saya Sudah Bayar” untuk mensimulasikan pembayaran berhasil.</span>
                  </Alert>
                </div>
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row">
                  <button onClick={gantiCaraBayar} className={btn.secondary}>
                    Ganti Cara Bayar
                  </button>
                  <button onClick={cekStatus} className={`${btn.primary} flex-1 py-3`}>
                    Saya Sudah Bayar
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {langkah === 'sukses' && trx && (
          <div className="py-4 text-center">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-11 w-11" />
            </span>
            <p className="mt-5 text-2xl font-extrabold text-slate-900">Pembayaran Berhasil!</p>
            <p className="mt-2 text-slate-600">
              SPP {daftarBulan(trx.bulan)} untuk <b>{anak.nama}</b> sudah lunas.
            </p>
            <p className="mt-4 text-3xl font-extrabold text-emerald-600">{rupiah(trx.total)}</p>
            <p className="mt-1 text-xs text-slate-500">
              {trx.metodeLabel} · No. {trx.noTransaksi}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
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
