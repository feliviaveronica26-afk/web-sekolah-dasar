import { useState } from 'react'
import { Award, Trash2, Trophy, Users } from 'lucide-react'
import { Alert, Avatar, Card, DashHeader, EmptyState, JudulKartu, Modal, Tabs, btn, inputCls, labelCls } from '../../components/ui'
import { useLingkup } from '../../context/akses'
import { useData } from '../../context/DataContext'
import { SIKAP } from '../../data/dummy'
import { formatTanggal, todayKey } from '../../utils/format'
import { infoSikap, ringkasSikap } from '../../utils/prestasi'

export default function PoinSikap() {
  const { data, tambah, hapus } = useData()
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

  const beri = (k) => {
    const sasaran = dipilih === 'semua' ? nisKelas : [dipilih]
    sasaran.forEach((nis) => tambah('sikap', { nis, kode: k.kode, poin: k.poin, tanggal: todayKey(), catatan: catatan.trim(), oleh: L.nama }))
    setPesan(`${k.emoji} ${k.label} (${k.poin > 0 ? '+' : ''}${k.poin}) diberikan kepada ${dipilih === 'semua' ? `seluruh kelas ${kelas}` : namaSiswa(dipilih)}.`)
    tutup()
  }

  return (
    <>
      <DashHeader
        title="Poin Sikap"
        desc="Beri apresiasi atas perilaku baik dan catatan perbaikan. Siswa & orang tua langsung melihatnya di portal."
        action={
          <select value={kelas} onChange={(e) => setKelas(e.target.value)} className={`${inputCls} w-auto!`} aria-label="Pilih kelas">
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

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card className="p-6">
          <JudulKartu icon={Users} judul={`Kelas ${kelas} · ${siswa.length} siswa`}>
            <button onClick={() => setDipilih('semua')} className={btn.secondary}>
              <Award className="h-4 w-4" /> Seluruh kelas
            </button>
          </JudulKartu>
          <p className="-mt-2 mb-4 text-sm text-slate-500">Klik nama siswa untuk memberi poin.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {siswa.map((s) => {
              const total = ringkasSikap(data, s.nis).total
              return (
                <button
                  key={s.nis}
                  onClick={() => setDipilih(s.nis)}
                  className="group relative flex flex-col items-center rounded-2xl bg-slate-50 p-4 text-center transition hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:ring-1 hover:ring-primary-100"
                >
                  <span
                    className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                      total > 0 ? 'bg-emerald-100 text-emerald-700' : total < 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {total > 0 ? `+${total}` : total}
                  </span>
                  <Avatar nama={s.nama} size="lg" className="transition group-hover:scale-110" />
                  <span className="mt-2 text-sm font-semibold leading-snug text-slate-800">{s.nama}</span>
                </button>
              )
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <JudulKartu icon={Trophy} judul="Poin tertinggi" />
            <ol className="space-y-2.5">
              {peringkat.map((s, i) => (
                <li key={s.nis} className="flex items-center gap-3">
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${['bg-amber-300 text-amber-950', 'bg-slate-300 text-slate-800', 'bg-orange-300 text-orange-950'][i] ?? 'bg-slate-100 text-slate-600'}`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-sm font-semibold text-slate-800">{s.nama}</span>
                  <span className="text-sm font-bold text-slate-900">{s.total > 0 ? `+${s.total}` : s.total}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-6">
            <JudulKartu icon={Award} judul="Riwayat terbaru" />
            {riwayatKelas.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada catatan.</p>
            ) : (
              <ul className="space-y-2">
                {riwayatKelas.slice(0, 8).map((r) => {
                  const k = infoSikap(r.kode)
                  return (
                    <li key={r.id} className="group flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2">
                      <span className="text-lg">{k.emoji}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-800">{namaSiswa(r.nis)}</span>
                        <span className="block truncate text-xs text-slate-500">
                          {k.label} · {formatTanggal(r.tanggal, { year: undefined })}
                        </span>
                      </span>
                      <span className={`text-xs font-bold ${r.poin > 0 ? 'text-emerald-600' : 'text-amber-700'}`}>{r.poin > 0 ? `+${r.poin}` : r.poin}</span>
                      {r.oleh === L.nama && (
                        <button onClick={() => hapus('sikap', r.id)} className="rounded p-1 text-slate-300 opacity-0 transition hover:text-rose-600 group-hover:opacity-100" aria-label="Hapus catatan">
                          <Trash2 className="h-3.5 w-3.5" />
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SIKAP[jenis].map((k) => (
            <button
              key={k.kode}
              onClick={() => beri(k)}
              className={`flex flex-col items-center rounded-2xl p-4 text-center transition hover:-translate-y-1 hover:shadow-md ${
                jenis === 'positif' ? 'bg-emerald-50 hover:bg-emerald-100' : 'bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <span className="text-3xl">{k.emoji}</span>
              <span className="mt-2 text-sm font-semibold leading-tight text-slate-800">{k.label}</span>
              <span className={`mt-1 text-xs font-bold ${k.poin > 0 ? 'text-emerald-600' : 'text-amber-700'}`}>
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
          <p className="mt-1.5 text-xs text-slate-500">Isi catatan dulu, lalu klik salah satu kategori di atas.</p>
        </div>
      </Modal>
    </>
  )
}
