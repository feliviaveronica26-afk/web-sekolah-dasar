import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, Landmark, Loader2, LockKeyhole, Search, TriangleAlert } from 'lucide-react'
import { Alert, btn, inputCls } from '../components/ui'
import { api } from '../utils/api'
import { rupiah } from '../utils/spp'

/*
  SIMULATOR BANK untuk demo pembayaran SPP tanpa payment gateway sungguhan. Halaman ini berperan sebagai
  aplikasi bank/e-wallet milik orang tua (dibuka dengan scan QR di HP atau memasukkan nomor VA): setelah
  PIN dimasukkan, "bank" mengirim notifikasi bertanda tangan ke server sekolah, dan barulah SPP lunas.
  Server menolak semua permintaan ke simulator bila mode simulasi mati (selalu mati di produksi).
*/
export default function SimulasiBayar() {
  const [params] = useSearchParams()
  const [kode, setKode] = useState(params.get('kode') ?? '')
  const [tagihan, setTagihan] = useState(null)
  const [pin, setPin] = useState('')
  const [galat, setGalat] = useState('')
  const [proses, setProses] = useState(false)
  const [hasil, setHasil] = useState(null)

  const cari = async (k = kode) => {
    if (!k.trim()) return
    setProses(true)
    setGalat('')
    setHasil(null)
    try {
      // latar: tanpa bilah muat berlogo sekolah (halaman ini mewakili aplikasi bank, punya penanda prosesnya sendiri)
      setTagihan(await api(`/simulasi-gateway/${encodeURIComponent(k.trim())}`, { latar: true }))
    } catch (e) {
      setTagihan(null)
      setGalat(e.status === 404 ? 'Kode QRIS / nomor virtual account tidak ditemukan, atau simulator sedang tidak aktif.' : e.message)
    }
    setProses(false)
  }

  // Dibuka dari scan QR: langsung tampilkan tagihannya
  useEffect(() => {
    const awal = params.get('kode')
    if (awal) cari(awal)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const bayar = async (e) => {
    e.preventDefault()
    if (proses) return
    setProses(true)
    setGalat('')
    try {
      setHasil(await api('/simulasi-gateway/bayar', { method: 'POST', body: { kode: tagihan.kode, pin }, latar: true }))
    } catch (err) {
      setGalat(err.message)
    }
    setPin('')
    setProses(false)
  }

  return (
    <main className="min-h-dvh bg-slate-900 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-sm">
        <p className="mb-4 flex items-center justify-center gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
          <Landmark className="h-4 w-4" aria-hidden="true" /> Simulator Bank · Mode Demo
        </p>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl">
          <div className="bg-slate-800 px-6 py-5 text-white">
            <h1 className="font-sans text-lg font-bold">Bayar Tagihan</h1>
            <p className="mt-1 text-xs text-slate-300">
              Pengganti aplikasi bank/e-wallet untuk demo. Bukan bagian dari website sekolah dan tidak memakai uang sungguhan.
            </p>
          </div>

          <div className="space-y-5 p-6">
            {hasil ? (
              <div className="py-4 text-center" role="status">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
                </span>
                <p className="mt-4 text-xl font-extrabold">Pembayaran berhasil</p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-600">{rupiah(hasil.jumlah)}</p>
                <p className="mt-1 text-xs text-slate-500">Ref. {hasil.noTransaksi}</p>
                <p className="mt-4 text-sm text-slate-600">Bank sudah mengirim konfirmasi ke sekolah. Status di Portal Orang Tua berubah menjadi Lunas dengan sendirinya.</p>
              </div>
            ) : (
              <>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    cari()
                  }}
                >
                  <label htmlFor="kode-bayar" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Kode QRIS / nomor virtual account
                  </label>
                  <div className="flex gap-2">
                    <input id="kode-bayar" value={kode} onChange={(e) => setKode(e.target.value)} className={inputCls} placeholder="Tempel kode di sini" autoComplete="off" />
                    <button type="submit" disabled={proses} className={`${btn.secondary} shrink-0`} aria-label="Cari tagihan">
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </form>

                {galat && <Alert tone="error">{galat}</Alert>}

                {tagihan && (
                  <>
                    <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200 text-sm">
                      {[
                        ['Penerima', tagihan.merchant],
                        ['Keterangan', tagihan.keterangan],
                        ['Atas nama', tagihan.atasNama],
                        ['Metode', tagihan.metode],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                          <dt className="text-slate-500">{k}</dt>
                          <dd className="text-right font-semibold">{v || '–'}</dd>
                        </div>
                      ))}
                      <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                        <dt className="text-slate-500">Nominal</dt>
                        <dd className="text-xl font-extrabold">{rupiah(tagihan.jumlah)}</dd>
                      </div>
                    </dl>

                    {tagihan.status === 'menunggu' ? (
                      <form onSubmit={bayar} className="space-y-3">
                        <label htmlFor="pin-bayar" className="block text-sm font-semibold text-slate-700">
                          PIN (6 angka, bebas untuk demo)
                        </label>
                        <input
                          id="pin-bayar"
                          type="password"
                          inputMode="numeric"
                          autoComplete="off"
                          maxLength={6}
                          value={pin}
                          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className={`${inputCls} text-center font-mono text-xl tracking-[0.5em]`}
                          placeholder="••••••"
                        />
                        <button type="submit" disabled={proses || pin.length !== 6} className={`${btn.primary} w-full py-3 disabled:opacity-60`}>
                          {proses ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />} Bayar {rupiah(tagihan.jumlah)}
                        </button>
                      </form>
                    ) : (
                      <p className="flex items-start gap-2 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        {tagihan.status === 'berhasil'
                          ? 'Tagihan ini sudah dibayar.'
                          : tagihan.status === 'kedaluwarsa'
                            ? 'Batas waktu pembayaran sudah habis. Minta orang tua membuat pembayaran baru.'
                            : 'Tagihan ini sudah dibatalkan.'}
                      </p>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
