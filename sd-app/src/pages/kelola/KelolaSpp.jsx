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
    <a href={url} target="_blank" rel="noreferrer" className="mt-1-5 d-block w-fit">
      <img src={url} alt="Bukti pembayaran" className={`${className} w-auto rounded-2 object-fit-contain border border-abu-200`} />
    </a>
  )
}

// Riwayat pembayaran satu siswa beserta foto buktinya (untuk dilihat ulang kapan saja)
function RiwayatSpp({ siswa, data }) {
  const riwayat = riwayatPembayaran(data, siswa.nis)
  return (
    <>
      <div className="mb-4 rounded-3 bg-abu-50 px-4 py-3">
        <p className="fw-bold text-tinta">{siswa.nama}</p>
        <p className="fs-sm text-tinta-3">
          NIS {siswa.nis} · Kelas {siswa.kelas}
        </p>
      </div>
      {riwayat.length === 0 ? (
        <EmptyState icon={Banknote} title="Belum ada pembayaran" desc="Siswa ini belum punya riwayat pembayaran SPP." />
      ) : (
        <div className="antara-y-3">
          {riwayat.map((t) => (
            <div key={t.noTransaksi} className="rounded-3 border border-abu-200 p-4">
              <div className="d-flex align-items-start justify-content-between gap-3">
                <div>
                  <p className="fw-semibold text-tinta">{daftarBulan(t.bulan)}</p>
                  <p className="fs-xs text-tinta-3">
                    {formatTanggal(t.tanggal)} · {t.metode} · No. {t.noTransaksi}
                  </p>
                </div>
                <span className="flex-shrink-0 fw-bold text-tinta">{rupiah(t.bulan.length * SPP.nominal)}</span>
              </div>
              {t.bukti ? <BuktiFoto bukti={t.bukti} className="max-h-48" /> : <p className="mt-2 fs-xs text-abu-400">Tanpa foto bukti</p>}
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

      <div className="d-grid kolom-2 gap-4 kolom-lg-4">
        <StatCard icon={TrendingUp} label={`Terkumpul ${namaBulan(bulanIni(), { month: 'long' })}`} value={rupiah(r.terkumpul)} tone="emerald" />
        <StatCard icon={CheckCircle2} label="Lunas bulan ini" value={`${r.lunasBulanIni}/${data.siswa.length}`} hint="siswa" tone="sky" />
        <StatCard icon={Users} label="Siswa menunggak" value={r.menunggak} hint="lewat jatuh tempo" tone="amber" />
        <StatCard icon={AlertTriangle} label="Total tunggakan" value={rupiah(r.totalTunggakan)} tone="primary" />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="d-flex flex-column gap-3 border-bottom border-abu-100 p-4 flex-lg-row align-items-lg-center">
          <div className="position-relative flex-1">
            <Search className="pe-none position-absolute start-3-5 top-50 h-4 w-4 translate-middle-y text-abu-400" />
            <input
              value={cari}
              onChange={(e) => {
                setCari(e.target.value)
                setBatas(PER_HALAMAN)
              }}
              placeholder="Cari nama atau NIS..."
              className={`${inputCls} ps-10`}
            />
          </div>
          <select
            value={kelas}
            onChange={(e) => {
              setKelas(e.target.value)
              setBatas(PER_HALAMAN)
            }}
            className={`${inputCls} w-lg-44`}
          >
            <option value="">Semua kelas</option>
            {KELAS.map((k) => (
              <option key={k} value={k}>
                Kelas {k}
              </option>
            ))}
          </select>
          <label className="d-flex cursor-pointer align-items-center gap-2 fs-sm fw-medium text-tinta-2">
            <input type="checkbox" checked={hanyaMenunggak} onChange={(e) => {
                setHanyaMenunggak(e.target.checked)
                setBatas(PER_HALAMAN)
              }} className="h-4 w-4 aksen-merah" />
            Hanya yang menunggak
          </label>
        </div>

        {daftar.length === 0 ? (
          <EmptyState icon={Banknote} title="Tidak ada data" desc="Coba ubah filter pencarian." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-100 min-w-760 text-start fs-sm">
              <thead className="bg-abu-50 fs-xs text-uppercase ls-wider text-tinta-3">
                <tr>
                  <th className="px-5 py-3">Siswa</th>
                  <th className="px-5 py-3">Kelas</th>
                  <th className="px-5 py-3">Jul – Jun</th>
                  <th className="px-5 py-3">Bulan ini</th>
                  <th className="px-5 py-3">Tunggakan</th>
                  <th className="px-5 py-3 text-end">Aksi</th>
                </tr>
              </thead>
              <tbody className="pembatas-y pembatas-abu">
                {daftar.slice(0, batas).map((s) => (
                  <tr key={s.nis} className="hover-latar">
                    <td className="px-5 py-3">
                      <p className="fw-semibold text-tinta">{s.nama}</p>
                      <p className="fs-xs text-tinta-3">NIS {s.nis}</p>
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
                        <span className="fw-semibold text-danger">
                          {rupiah(s.tunggakan.length * SPP.nominal)}
                          <span className="d-block fs-xs fw-normal text-tinta-3">{s.tunggakan.length} bulan</span>
                        </span>
                      ) : (
                        <span className="text-abu-400">–</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-end">
                      <div className="d-inline-flex align-items-center gap-1">
                        <button
                          onClick={() => setRiwayat(s)}
                          className="d-inline-flex align-items-center gap-1-5 rounded-1 px-3 py-1-5 fs-sm fw-semibold text-tinta-3 hover-latar-abu hover-teks-tinta"
                        >
                          <History className="h-4 w-4" /> Riwayat
                        </button>
                        <button
                          onClick={() => bukaTunai(s)}
                          disabled={bulanBisaDibayar(data, s.nis).length === 0}
                          className="rounded-1 px-3 py-1-5 fs-sm fw-semibold text-primary hover-latar-merah"
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
          <div className="d-flex flex-column align-items-center gap-2 border-top border-abu-100 px-5 py-4 flex-sm-row justify-content-sm-center">
            <p className="fs-sm text-tinta-3">
              Menampilkan {batas} dari {daftar.length} siswa
            </p>
            <button onClick={() => setBatas(batas + PER_HALAMAN)} className={btn.secondary}>
              Tampilkan {Math.min(PER_HALAMAN, daftar.length - batas)} lagi
            </button>
          </div>
        )}
        <div className="border-top border-abu-100 px-5 py-3">
          <LegendaSpp sebelumMasuk={r.perSiswa.some((s) => s.tanggalMasuk?.slice(0, 7) > SPP.bulan[0])} />
        </div>
      </Card>

      <Modal open={!!tunai} onClose={() => setTunai(null)} title="Catat Pembayaran Tunai">
        {tunai && (
          <>
            <div className="mb-4 rounded-3 bg-abu-50 px-4 py-3">
              <p className="fw-bold text-tinta">{tunai.nama}</p>
              <p className="fs-sm text-tinta-3">
                NIS {tunai.nis} · Kelas {tunai.kelas}
              </p>
            </div>
            <PilihBulan data={data} nis={tunai.nis} terpilih={terpilih} onChange={setTerpilih} />

            <div className="mt-4">
              <p className="mb-1-5 d-block fs-sm fw-medium text-tinta-2">
                Foto bukti pembayaran <span className="fw-normal text-abu-400">(opsional)</span>
              </p>
              {buktiUrl ? (
                <div className="position-relative w-fit">
                  <img src={buktiUrl} alt="Pratinjau bukti pembayaran" className="mh-44 w-auto rounded-2 object-fit-contain border border-abu-200" />
                  <button
                    type="button"
                    onClick={() => setBukti(null)}
                    className="position-absolute end-n2 top-n2 d-flex h-7 w-7 align-items-center justify-content-center rounded-pill titik-rose text-white shadow hover-redup"
                    aria-label="Hapus foto bukti"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="d-flex cursor-pointer flex-column align-items-center justify-content-center gap-1-5 rounded-2 border border-putus border-abu-300 px-4 py-6 text-center fs-sm fw-semibold text-tinta-3 transisi hover-garis-merah hover-teks-merah">
                  <Camera className="h-6 w-6" />
                  Ambil atau unggah foto bukti
                  <span className="fs-xs fw-normal text-abu-400">Struk, kuitansi, atau uang tunai yang diterima</span>
                  <input type="file" accept="image/*" capture="environment" onChange={pilihBukti} className="d-none" />
                </label>
              )}
            </div>

            <div className="mt-4">
              <Alert tone="info">Pastikan uang tunai sudah diterima sebelum menyimpan. Kuitansi akan langsung dibuat.</Alert>
            </div>
            <div className="mt-5 d-flex flex-wrap align-items-center justify-content-between gap-3 border-top border-abu-100 pt-4">
              <div>
                <p className="fs-xs text-tinta-3">{terpilih.length ? daftarBulan(terpilih) : 'Belum ada bulan dipilih'}</p>
                <p className="fs-xl fw-extrabold text-tinta">{rupiah(terpilih.length * SPP.nominal)}</p>
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
                <p className="mb-1 fs-sm fw-medium text-tinta-2">Foto bukti pembayaran</p>
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
