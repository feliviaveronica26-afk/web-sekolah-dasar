import { useState } from 'react'
import { Award, Trash2, Trophy, Users } from 'lucide-react'
import { Alert, Avatar, Card, DashHeader, EmptyState, JudulKartu, Modal, Tabs, btn, inputCls, labelCls } from '../../components/ui'
import { useLingkup } from '../../context/akses'
import { useData } from '../../context/DataContext'
import { SIKAP } from '../../data/dummy'
import { formatTanggal } from '../../utils/format'
import { infoSikap, ringkasSikap } from '../../utils/prestasi'

export default function PoinSikap() {
  const { data, beriSikap, hapusSikap } = useData()
  const L = useLingkup('sikap')
  const [kelas, setKelas] = useState(L.daftarKelas[0] ?? '')
  const [dipilih, setDipilih] = useState(null) // nis, atau 'semua' untuk seluruh kelas
  const [jenis, setJenis] = useState('positif')
  const [catatan, setCatatan] = useState('')
  const [pesan, setPesan] = useState('')

  if (!L.daftarKelas.length) return <EmptyState icon={Award} title="Belum ada kelas" desc="Anda belum memiliki kelas untuk diberi poin sikap." />

  const siswa = data.siswa.filter((s) => s.kelas === kelas).sort((a, b) => a.nama.localeCompare(b.nama))
  const nisKelas = siswa.map((s) => s.nis)
  const riwayatKelas = data.sikap.filter((s) => nisKelas.includes(s.nis)).sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id.localeCompare(a.id))
  const peringkat = siswa
    .map((s) => ({ ...s, total: ringkasSikap(data, s.nis).total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
  const namaSiswa = (nis) => data.siswa.find((s) => s.nis === nis)?.nama ?? nis

  const tutup = () => {
    setDipilih(null)
    setCatatan('')
  }

  // Satu permintaan untuk satu siswa atau seluruh kelas; tanggal & nama guru dicatat server
  const beri = async (k) => {
    const sasaran = dipilih === 'semua' ? nisKelas : [dipilih]
    const galat = await beriSikap(sasaran, k.kode, catatan.trim())
    if (galat) return
    setPesan(`${k.emoji} ${k.label} (${k.poin > 0 ? '+' : ''}${k.poin}) diberikan kepada ${dipilih === 'semua' ? `seluruh kelas ${kelas}` : namaSiswa(dipilih)}.`)
    tutup()
  }

  return (
    <>
      <DashHeader
        title="Poin Sikap"
        desc="Beri apresiasi atas perilaku baik dan catatan perbaikan. Siswa & orang tua langsung melihatnya di portal."
        action={
          <select value={kelas} onChange={(e) => setKelas(e.target.value)} className={`${inputCls} w-auto`} aria-label="Pilih kelas">
            {L.daftarKelas.map((k) => (
              <option key={k} value={k}>
                Kelas {k}
              </option>
            ))}
          </select>
        }
      />

      {pesan && (
        <div className="mb-5">
          <Alert>{pesan}</Alert>
        </div>
      )}

      <div className="d-grid gap-6 kolom-xl-isi-340">
        <Card className="p-6">
          <JudulKartu icon={Users} judul={`Kelas ${kelas} · ${siswa.length} siswa`}>
            <button onClick={() => setDipilih('semua')} className={btn.secondary}>
              <Award className="h-4 w-4" /> Seluruh kelas
            </button>
          </JudulKartu>
          <p className="mt-n2 mb-4 fs-sm text-tinta-3">Klik nama siswa untuk memberi poin.</p>
          <div className="d-grid kolom-2 gap-3 kolom-sm-3 kolom-lg-4">
            {siswa.map((s) => {
              const total = ringkasSikap(data, s.nis).total
              return (
                <button
                  key={s.nis}
                  onClick={() => setDipilih(s.nis)}
                  className="grup position-relative d-flex flex-column align-items-center rounded-3 bg-abu-50 p-4 text-center transisi hover-angkat-sedikit hover-latar-putih hover-bayangan-kecil"
                >
                  <span
                    className={`position-absolute end-2 top-2 rounded-pill px-2 py-0-5 fs-xs fw-bold ${
                      total > 0 ? 'bg-success-subtle text-success' : total < 0 ? 'bg-warning-subtle text-warning-emphasis' : 'bg-abu-200 text-tinta-2'
                    }`}
                  >
                    {total > 0 ? `+${total}` : total}
                  </span>
                  <Avatar nama={s.nama} size="lg" className="transisi grup-besar" />
                  <span className="mt-2 fs-sm fw-semibold lh-snug text-tinta">{s.nama}</span>
                </button>
              )
            })}
          </div>
        </Card>

        <div className="antara-y-6">
          <Card className="p-6">
            <JudulKartu icon={Trophy} judul="Poin tertinggi" />
            <ol className="antara-y-2-5">
              {peringkat.map((s, i) => (
                <li key={s.nis} className="d-flex align-items-center gap-3">
                  <span className={`d-flex h-7 w-7 align-items-center justify-content-center rounded-pill fs-xs fw-bold ${['bg-warning-subtle text-warning-emphasis', 'bg-abu-300 text-tinta', 'titik-orange teks-orange'][i] ?? 'bg-abu-100 text-tinta-2'}`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-truncate fs-sm fw-semibold text-tinta">{s.nama}</span>
                  <span className="fs-sm fw-bold text-tinta">{s.total > 0 ? `+${s.total}` : s.total}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-6">
            <JudulKartu icon={Award} judul="Riwayat terbaru" />
            {riwayatKelas.length === 0 ? (
              <p className="fs-sm text-tinta-3">Belum ada catatan.</p>
            ) : (
              <ul className="antara-y-2">
                {riwayatKelas.slice(0, 8).map((r) => {
                  const k = infoSikap(r.kode)
                  return (
                    <li key={r.id} className="grup d-flex align-items-center gap-2-5 rounded-2 bg-abu-50 px-3 py-2">
                      <span className="fs-lg">{k.emoji}</span>
                      <span className="min-w-0 flex-1">
                        <span className="d-block text-truncate fs-sm fw-semibold text-tinta">{namaSiswa(r.nis)}</span>
                        <span className="d-block text-truncate fs-xs text-tinta-3">
                          {k.label} · {formatTanggal(r.tanggal, { year: undefined })}
                        </span>
                      </span>
                      <span className={`fs-xs fw-bold ${r.poin > 0 ? 'text-success' : 'text-warning-emphasis'}`}>{r.poin > 0 ? `+${r.poin}` : r.poin}</span>
                      {r.oleh === L.nama && (
                        <button onClick={() => hapusSikap(r.id)} className="rounded-1 p-1 text-abu-300 opacity-0 grup-tampil transisi hover-teks-merah" aria-label="Hapus catatan">
                          <Trash2 className="h-3-5 w-3-5" />
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Modal open={!!dipilih} onClose={tutup} title={dipilih === 'semua' ? `Poin untuk seluruh kelas ${kelas}` : `Poin untuk ${namaSiswa(dipilih)}`} size="max-w-2xl">
        <Tabs
          value={jenis}
          onChange={setJenis}
          className="mb-4"
          items={[
            ['positif', '👍 Apresiasi'],
            ['perbaikan', '📝 Perlu perbaikan'],
          ]}
        />
        <div className="d-grid kolom-2 gap-3 kolom-sm-4">
          {SIKAP[jenis].map((k) => (
            <button
              key={k.kode}
              onClick={() => beri(k)}
              className={`d-flex flex-column align-items-center rounded-3 p-4 text-center transisi hover-angkat-sedikit hover-bayangan-kecil ${
                jenis === 'positif' ? 'bg-success-subtle hover-redup' : 'bg-warning-subtle hover-redup'
              }`}
            >
              <span className="fs-3xl">{k.emoji}</span>
              <span className="mt-2 fs-sm fw-semibold lh-tight text-tinta">{k.label}</span>
              <span className={`mt-1 fs-xs fw-bold ${k.poin > 0 ? 'text-success' : 'text-warning-emphasis'}`}>
                {k.poin > 0 ? '+' : ''}
                {k.poin} poin
              </span>
            </button>
          ))}
        </div>
        <div className="mt-5">
          <label className={labelCls} htmlFor="catatan-sikap">
            Catatan (opsional)
          </label>
          <input id="catatan-sikap" value={catatan} onChange={(e) => setCatatan(e.target.value)} className={inputCls} placeholder="Contoh: Membantu teman memahami soal pecahan" />
          <p className="mt-1-5 fs-xs text-tinta-3">Isi catatan dulu, lalu klik salah satu kategori di atas.</p>
        </div>
      </Modal>
    </>
  )
}
