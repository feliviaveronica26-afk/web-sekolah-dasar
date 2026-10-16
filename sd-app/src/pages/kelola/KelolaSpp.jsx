import { useEffect, useState } from 'react'
import { AlertTriangle, Banknote, Camera, CheckCircle2, History, Search, TrendingUp, Users, X } from 'lucide-react'
import { Alert, Badge, Card, DashHeader, EmptyState, Modal, StatCard, btn, inputCls } from '../../components/ui'
import { Kuitansi, LegendaSpp, PilihBulan, StripBulan, riwayatPembayaran } from '../../components/Spp'
import { useData } from '../../context/DataContext'
import { KELAS, SPP } from '../../data/dummy'
import { ringkasSpp } from '../../utils/ringkasan'
import { formatTanggal } from '../../utils/format'
import { STATUS_SPP, bulanIni, bulanWajibBayar, bulanBisaDibayar, daftarBulan, namaBulan, rupiah } from '../../utils/spp'

// Foto bukti pembayaran; src memakai endpoint berwenang (/api/spp/bukti/:id, cookie TU).
function BuktiFoto({ bukti, className = 'max-h-64' }) {
  if (!bukti) return null
  const url = `/api/spp/bukti/${bukti.id}`
  return (
    <a href={url} target="_blank" rel="noreferrer" className="mt-1.5 block w-fit">
      <img src={url} alt="Bukti pembayaran" className={`${className} w-auto rounded-xl object-contain ring-1 ring-slate-200`} />
    </a>
  )
}

// Riwayat pembayaran satu siswa beserta foto buktinya (untuk dilihat ulang kapan saja)
function RiwayatSpp({ siswa, data }) {
  const riwayat = riwayatPembayaran(data, siswa.nis)
  return (
    <>
      <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3">
        <p className="font-bold text-slate-900">{siswa.nama}</p>
        <p className="text-sm text-slate-500">
          NIS {siswa.nis} · Kelas {siswa.kelas}
        </p>
      </div>
      {riwayat.length === 0 ? (
        <EmptyState icon={Banknote} title="Belum ada pembayaran" desc="Siswa ini belum punya riwayat pembayaran SPP." />
      ) : (
        <div className="space-y-3">
          {riwayat.map((t) => (
            <div key={t.noTransaksi} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">{daftarBulan(t.bulan)}</p>
                  <p className="text-xs text-slate-500">
                    {formatTanggal(t.tanggal)} · {t.metode} · No. {t.noTransaksi}
                  </p>
                </div>
                <span className="shrink-0 font-bold text-slate-900">{rupiah(t.bulan.length * SPP.nominal)}</span>
              </div>
              {t.bukti ? <BuktiFoto bukti={t.bukti} className="max-h-48" /> : <p className="mt-2 text-xs text-slate-400">Tanpa foto bukti</p>}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

const PER_HALAMAN = 50

export default function KelolaSpp() {
  const { data, catatTunai } = useData()
  const [cari, setCari] = useState('')
  const [kelas, setKelas] = useState('')
  const [hanyaMenunggak, setHanyaMenunggak] = useState(false)
  const [tunai, setTunai] = useState(null) // siswa yang sedang dicatat pembayarannya
  const [terpilih, setTerpilih] = useState([])
  const [bukti, setBukti] = useState(null) // File foto bukti pembayaran (opsional)
  const [buktiUrl, setBuktiUrl] = useState(null) // pratinjau lokal
  const [kuitansi, setKuitansi] = useState(null)
  const [riwayat, setRiwayat] = useState(null) // siswa yang riwayat pembayarannya sedang dilihat
  const [batas, setBatas] = useState(PER_HALAMAN) // jumlah baris yang ditampilkan

  // Pratinjau foto bukti dari file lokal, dibersihkan saat ganti/batal
  useEffect(() => {
    if (!bukti) return setBuktiUrl(null)
    const url = URL.createObjectURL(bukti)
    setBuktiUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [bukti])

  const r = ringkasSpp(data)
  const q = cari.trim().toLowerCase()
  const daftar = r.perSiswa
    .filter((s) => (!q || s.nama.toLowerCase().includes(q) || s.nis.includes(q)) && (!kelas || s.kelas === kelas) && (!hanyaMenunggak || s.tunggakan.length))
    .sort((a, b) => b.tunggakan.length - a.tunggakan.length || a.kelas.localeCompare(b.kelas) || a.nama.localeCompare(b.nama))

  const bukaTunai = (siswa) => {
    const wajib = bulanWajibBayar(data, siswa.nis)
    setTerpilih(wajib.length ? wajib : bulanBisaDibayar(data, siswa.nis).slice(0, 1))
    setBukti(null)
    setTunai(siswa)
  }

  const pilihBukti = (e) => {
    const f = e.target.files?.[0]
    if (f) setBukti(f)
    e.target.value = '' // agar file yang sama bisa dipilih lagi setelah dihapus
  }

  // Nomor kuitansi & tanggal dari server; kuitansi hanya tampil jika pembayaran tersimpan
  const simpanTunai = async () => {
    const hasil = await catatTunai(tunai.nis, terpilih, bukti)
    if (!hasil) return
    setKuitansi({ siswa: tunai, pembayaran: { ...hasil, metode: 'Tunai', bulan: terpilih } })
    setTunai(null)
    setBukti(null)
  }

  return (
    <>
      <DashHeader title="Keuangan SPP" desc={`Tahun ajaran ${SPP.tahunAjaran} · ${rupiah(SPP.nominal)} per bulan`} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label={`Terkumpul ${namaBulan(bulanIni(), { month: 'long' })}`} value={rupiah(r.terkumpul)} tone="emerald" />
        <StatCard icon={CheckCircle2} label="Lunas bulan ini" value={`${r.lunasBulanIni}/${data.siswa.length}`} hint="siswa" tone="sky" />
        <StatCard icon={Users} label="Siswa menunggak" value={r.menunggak} hint="lewat jatuh tempo" tone="amber" />
        <StatCard icon={AlertTriangle} label="Total tunggakan" value={rupiah(r.totalTunggakan)} tone="primary" />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={cari}
              onChange={(e) => {
                setCari(e.target.value)
                setBatas(PER_HALAMAN)
              }}
              placeholder="Cari nama atau NIS..."
              className={`${inputCls} pl-10`}
            />
          </div>
          <select
            value={kelas}
            onChange={(e) => {
              setKelas(e.target.value)
              setBatas(PER_HALAMAN)
            }}
            className={`${inputCls} lg:w-44`}
          >
            <option value="">Semua kelas</option>
            {KELAS.map((k) => (
              <option key={k} value={k}>
                Kelas {k}
              </option>
            ))}
          </select>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={hanyaMenunggak} onChange={(e) => {
                setHanyaMenunggak(e.target.checked)
                setBatas(PER_HALAMAN)
              }} className="h-4 w-4 accent-primary-600" />
            Hanya yang menunggak
          </label>
        </div>

        {daftar.length === 0 ? (
          <EmptyState icon={Banknote} title="Tidak ada data" desc="Coba ubah filter pencarian." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Siswa</th>
                  <th className="px-5 py-3">Kelas</th>
                  <th className="px-5 py-3">Jul – Jun</th>
                  <th className="px-5 py-3">Bulan ini</th>
                  <th className="px-5 py-3">Tunggakan</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daftar.slice(0, batas).map((s) => (
                  <tr key={s.nis} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800">{s.nama}</p>
                      <p className="text-xs text-slate-500">NIS {s.nis}</p>
                    </td>
                    <td className="px-5 py-3">{s.kelas}</td>
                    <td className="px-5 py-3">
                      <StripBulan data={data} nis={s.nis} kecil />
                    </td>
                    <td className="px-5 py-3">
                      <Badge className={STATUS_SPP[s.statusBulanIni].cls}>{STATUS_SPP[s.statusBulanIni].label}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      {s.tunggakan.length ? (
                        <span className="font-semibold text-rose-600">
                          {rupiah(s.tunggakan.length * SPP.nominal)}
                          <span className="block text-xs font-normal text-slate-500">{s.tunggakan.length} bulan</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">–</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setRiwayat(s)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <History className="h-4 w-4" /> Riwayat
                        </button>
                        <button
                          onClick={() => bukaTunai(s)}
                          disabled={bulanBisaDibayar(data, s.nis).length === 0}
                          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                        >
                          Catat Tunai
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {daftar.length > batas && (
          <div className="flex flex-col items-center gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-center">
            <p className="text-sm text-slate-500">
              Menampilkan {batas} dari {daftar.length} siswa
            </p>
            <button onClick={() => setBatas(batas + PER_HALAMAN)} className={btn.secondary}>
              Tampilkan {Math.min(PER_HALAMAN, daftar.length - batas)} lagi
            </button>
          </div>
        )}
        <div className="border-t border-slate-100 px-5 py-3">
          <LegendaSpp />
        </div>
      </Card>

      <Modal open={!!tunai} onClose={() => setTunai(null)} title="Catat Pembayaran Tunai">
        {tunai && (
          <>
            <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3">
              <p className="font-bold text-slate-900">{tunai.nama}</p>
              <p className="text-sm text-slate-500">
                NIS {tunai.nis} · Kelas {tunai.kelas}
              </p>
            </div>
            <PilihBulan data={data} nis={tunai.nis} terpilih={terpilih} onChange={setTerpilih} />

            <div className="mt-4">
              <p className="mb-1.5 block text-sm font-medium text-slate-700">
                Foto bukti pembayaran <span className="font-normal text-slate-400">(opsional)</span>
              </p>
              {buktiUrl ? (
                <div className="relative w-fit">
                  <img src={buktiUrl} alt="Pratinjau bukti pembayaran" className="max-h-44 w-auto rounded-xl object-contain ring-1 ring-slate-200" />
                  <button
                    type="button"
                    onClick={() => setBukti(null)}
                    className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700"
                    aria-label="Hapus foto bukti"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm font-semibold text-slate-500 transition hover:border-primary-400 hover:text-primary-600">
                  <Camera className="h-6 w-6" />
                  Ambil atau unggah foto bukti
                  <span className="text-xs font-normal text-slate-400">Struk, kuitansi, atau uang tunai yang diterima</span>
                  <input type="file" accept="image/*" capture="environment" onChange={pilihBukti} className="hidden" />
                </label>
              )}
            </div>

            <div className="mt-4">
              <Alert tone="info">Pastikan uang tunai sudah diterima sebelum menyimpan. Kuitansi akan langsung dibuat.</Alert>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs text-slate-500">{terpilih.length ? daftarBulan(terpilih) : 'Belum ada bulan dipilih'}</p>
                <p className="text-xl font-extrabold text-slate-900">{rupiah(terpilih.length * SPP.nominal)}</p>
              </div>
              <button onClick={simpanTunai} disabled={!terpilih.length} className={btn.primary}>
                Simpan Pembayaran
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!kuitansi} onClose={() => setKuitansi(null)} title="Pembayaran Tersimpan">
        {kuitansi && (
          <>
            <Kuitansi siswa={kuitansi.siswa} pembayaran={kuitansi.pembayaran} />
            {kuitansi.pembayaran.bukti && (
              <div className="mt-4">
                <p className="mb-1 text-sm font-medium text-slate-700">Foto bukti pembayaran</p>
                <BuktiFoto bukti={kuitansi.pembayaran.bukti} />
              </div>
            )}
          </>
        )}
      </Modal>

      <Modal open={!!riwayat} onClose={() => setRiwayat(null)} title="Riwayat Pembayaran">
        {riwayat && <RiwayatSpp siswa={riwayat} data={data} />}
      </Modal>
    </>
  )
}
