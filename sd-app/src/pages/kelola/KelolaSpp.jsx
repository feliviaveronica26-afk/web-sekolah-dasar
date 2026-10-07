import { useState } from 'react'
import { AlertTriangle, Banknote, CheckCircle2, Search, TrendingUp, Users } from 'lucide-react'
import { Alert, Badge, Card, DashHeader, EmptyState, Modal, StatCard, btn, inputCls } from '../../components/ui'
import { Kuitansi, LegendaSpp, PilihBulan, StripBulan } from '../../components/Spp'
import { useData } from '../../context/DataContext'
import { KELAS, SPP } from '../../data/dummy'
import { ringkasSpp } from '../../utils/ringkasan'
import { STATUS_SPP, bulanIni, buatNoTransaksi, bulanWajibBayar, bulanBisaDibayar, daftarBulan, namaBulan, rupiah } from '../../utils/spp'
import { todayKey } from '../../utils/format'

const PER_HALAMAN = 50

export default function KelolaSpp() {
  const { data, catatTunai } = useData()
  const [cari, setCari] = useState('')
  const [kelas, setKelas] = useState('')
  const [hanyaMenunggak, setHanyaMenunggak] = useState(false)
  const [tunai, setTunai] = useState(null) // siswa yang sedang dicatat pembayarannya
  const [terpilih, setTerpilih] = useState([])
  const [kuitansi, setKuitansi] = useState(null)
  const [batas, setBatas] = useState(PER_HALAMAN) // jumlah baris yang ditampilkan

  const r = ringkasSpp(data)
  const q = cari.trim().toLowerCase()
  const daftar = r.perSiswa
    .filter((s) => (!q || s.nama.toLowerCase().includes(q) || s.nis.includes(q)) && (!kelas || s.kelas === kelas) && (!hanyaMenunggak || s.tunggakan.length))
    .sort((a, b) => b.tunggakan.length - a.tunggakan.length || a.kelas.localeCompare(b.kelas) || a.nama.localeCompare(b.nama))

  const bukaTunai = (siswa) => {
    const wajib = bulanWajibBayar(data, siswa.nis)
    setTerpilih(wajib.length ? wajib : bulanBisaDibayar(data, siswa.nis).slice(0, 1))
    setTunai(siswa)
  }

  const simpanTunai = () => {
    const pembayaran = { noTransaksi: buatNoTransaksi(), tanggal: todayKey(), metode: 'Tunai', bulan: terpilih }
    catatTunai(tunai.nis, terpilih, pembayaran.noTransaksi)
    setKuitansi({ siswa: tunai, pembayaran })
    setTunai(null)
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
                      <button
                        onClick={() => bukaTunai(s)}
                        disabled={bulanBisaDibayar(data, s.nis).length === 0}
                        className="rounded-lg px-3 py-1.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                      >
                        Catat Tunai
                      </button>
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
              <Alert tone="info">Pastikan uang tunai sudah diterima sebelum menyimpan. Kuitansi akan langsung dibuat.</Alert>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
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
        {kuitansi && <Kuitansi siswa={kuitansi.siswa} pembayaran={kuitansi.pembayaran} />}
      </Modal>
    </>
  )
}
