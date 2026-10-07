import { useState } from 'react'
import { AlertTriangle, BookCopy, BookOpen, Library, Plus, Undo2 } from 'lucide-react'
import CrudPage from '../../components/CrudPage'
import { Alert, Badge, Card, DashHeader, EmptyState, Modal, StatCard, btn, inputCls, labelCls } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { formatTanggal, selisihHari, tambahHari, todayKey } from '../../utils/format'
import { ringkasPerpus } from '../../utils/ringkasan'

const LAMA_PINJAM = 7

export default function Perpustakaan() {
  const { data, tambah, ubah } = useData()
  const [tab, setTab] = useState('aktif')
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')

  const { aktif, terlambat } = ringkasPerpus(data)
  const hariIni = todayKey()
  const dipinjam = (bukuId) => aktif.filter((p) => p.bukuId === bukuId).length
  const tersedia = (b) => Number(b.stok) - dipinjam(b.id)
  const buku = (id) => data.buku.find((b) => b.id === id)
  const siswa = (nis) => data.siswa.find((s) => s.nis === nis)
  const riwayat = data.peminjaman.filter((p) => p.tanggalKembali).sort((a, b) => b.tanggalKembali.localeCompare(a.tanggalKembali))
  const totalEksemplar = data.buku.reduce((acc, b) => acc + Number(b.stok), 0)

  // Pesanan buku dari Portal Siswa yang menunggu diserahkan
  const reservasi = data.reservasi.filter((r) => r.status === 'Menunggu').sort((a, b) => a.tanggal.localeCompare(b.tanggal))
  const serahkan = (r) => {
    const b = buku(r.bukuId)
    if (aktif.filter((p) => p.nis === r.nis).length >= 2) return setError(`${siswa(r.nis)?.nama} sudah meminjam 2 buku.`)
    if (!b || tersedia(b) <= 0) return setError(`Stok "${b?.judul ?? 'buku'}" sedang habis.`)
    tambah('peminjaman', { nis: r.nis, bukuId: r.bukuId, tanggalPinjam: hariIni, tenggat: tambahHari(hariIni, LAMA_PINJAM), tanggalKembali: null })
    ubah('reservasi', r.id, { status: 'Selesai' })
    setError('')
  }

  const simpanPinjam = (e) => {
    e.preventDefault()
    if (!form.nis || !form.bukuId) return setError('Pilih siswa dan buku terlebih dahulu.')
    if (aktif.filter((p) => p.nis === form.nis).length >= 2) return setError('Siswa ini sudah meminjam 2 buku. Kembalikan dulu sebelum meminjam lagi.')
    tambah('peminjaman', { ...form, tanggalPinjam: hariIni, tenggat: tambahHari(hariIni, LAMA_PINJAM), tanggalKembali: null })
    setForm(null)
    setTab('aktif')
  }

  const kolomPinjam = (p) => {
    const s = siswa(p.nis)
    return (
      <>
        <td className="px-5 py-3">
          <p className="font-semibold text-slate-800">{buku(p.bukuId)?.judul ?? '(buku dihapus)'}</p>
          <p className="text-xs text-slate-500">{buku(p.bukuId)?.penulis}</p>
        </td>
        <td className="px-5 py-3">
          <p className="font-medium text-slate-800">{s?.nama ?? p.nis}</p>
          <p className="text-xs text-slate-500">Kelas {s?.kelas}</p>
        </td>
        <td className="px-5 py-3 text-slate-600">{formatTanggal(p.tanggalPinjam, { year: undefined })}</td>
      </>
    )
  }

  return (
    <>
      <DashHeader
        title="Perpustakaan"
        desc={`Peminjaman maksimal 2 buku per siswa, selama ${LAMA_PINJAM} hari.`}
        action={
          <button
            onClick={() => {
              setForm({ nis: '', bukuId: '' })
              setError('')
            }}
            className={btn.primary}
          >
            <Plus className="h-4 w-4" /> Catat Peminjaman
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Library} label="Judul Buku" value={data.buku.length} tone="sky" />
        <StatCard icon={BookCopy} label="Total Eksemplar" value={totalEksemplar} tone="emerald" />
        <StatCard icon={BookOpen} label="Sedang Dipinjam" value={aktif.length} tone="amber" />
        <StatCard icon={AlertTriangle} label="Terlambat Kembali" value={terlambat.length} tone="primary" />
      </div>

      {reservasi.length > 0 && (
        <Card className="mt-5 border-sky-200 bg-sky-50/60 p-5">
          <p className="font-bold text-sky-900">Pesanan buku dari siswa ({reservasi.length})</p>
          <p className="text-sm text-sky-800">Siswa memesan lewat Portal Siswa. Serahkan buku saat siswa datang ke perpustakaan.</p>
          {error && !form && <p className="mt-2 text-sm font-semibold text-rose-700">{error}</p>}
          <ul className="mt-3 space-y-2">
            {reservasi.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-sky-100">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">{buku(r.bukuId)?.judul ?? '(buku dihapus)'}</p>
                  <p className="text-xs text-slate-500">
                    {siswa(r.nis)?.nama ?? r.nis} · Kelas {siswa(r.nis)?.kelas} · dipesan {formatTanggal(r.tanggal, { year: undefined })}
                  </p>
                </div>
                <button onClick={() => ubah('reservasi', r.id, { status: 'Ditolak' })} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100">
                  Tolak
                </button>
                <button onClick={() => serahkan(r)} className={btn.primary}>
                  <BookOpen className="h-4 w-4" /> Serahkan buku
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="my-5 inline-flex flex-wrap rounded-xl bg-slate-100 p-1">
        {[
          ['aktif', `Sedang Dipinjam (${aktif.length})`],
          ['riwayat', 'Riwayat'],
          ['katalog', 'Katalog Buku'],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'aktif' && (
        <Card className="overflow-hidden">
          {aktif.length === 0 ? (
            <EmptyState icon={BookOpen} title="Tidak ada buku yang sedang dipinjam" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Buku</th>
                    <th className="px-5 py-3">Peminjam</th>
                    <th className="px-5 py-3">Dipinjam</th>
                    <th className="px-5 py-3">Batas Kembali</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...aktif]
                    .sort((a, b) => a.tenggat.localeCompare(b.tenggat))
                    .map((p) => {
                      const sisa = selisihHari(hariIni, p.tenggat)
                      return (
                        <tr key={p.id}>
                          {kolomPinjam(p)}
                          <td className="px-5 py-3">
                            <p className="text-slate-700">{formatTanggal(p.tenggat, { year: undefined })}</p>
                            {sisa < 0 ? (
                              <Badge className="mt-1 bg-rose-100 text-rose-700">Terlambat {-sisa} hari</Badge>
                            ) : (
                              <Badge className="mt-1 bg-slate-100 text-slate-600">{sisa === 0 ? 'Hari ini' : `${sisa} hari lagi`}</Badge>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              onClick={() => ubah('peminjaman', p.id, { tanggalKembali: hariIni })}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-primary-600 hover:bg-primary-50"
                            >
                              <Undo2 className="h-4 w-4" /> Dikembalikan
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'riwayat' && (
        <Card className="overflow-hidden">
          {riwayat.length === 0 ? (
            <EmptyState icon={BookOpen} title="Belum ada riwayat pengembalian" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Buku</th>
                    <th className="px-5 py-3">Peminjam</th>
                    <th className="px-5 py-3">Dipinjam</th>
                    <th className="px-5 py-3">Dikembalikan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {riwayat.map((p) => (
                    <tr key={p.id}>
                      {kolomPinjam(p)}
                      <td className="px-5 py-3 text-slate-600">{formatTanggal(p.tanggalKembali, { year: undefined })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'katalog' && (
        <CrudPage
          tanpaHeader
          koleksi="buku"
          itemLabel="Buku"
          searchKeys={['judul', 'penulis', 'kategori']}
          urutkan={(a, b) => a.judul.localeCompare(b.judul)}
          kosong={{ judul: '', penulis: '', kategori: '', stok: '1' }}
          fields={[
            { name: 'judul', label: 'Judul Buku', required: true, full: true },
            { name: 'penulis', label: 'Penulis', required: true },
            { name: 'kategori', label: 'Kategori', required: true, placeholder: 'Contoh: Fiksi Anak' },
            { name: 'stok', label: 'Jumlah Eksemplar', type: 'number', required: true },
          ]}
          columns={[
            { key: 'judul', label: 'Judul', render: (b) => <span className="font-semibold text-slate-800">{b.judul}</span> },
            { key: 'penulis', label: 'Penulis' },
            { key: 'kategori', label: 'Kategori', render: (b) => <Badge className="bg-sky-50 text-sky-700">{b.kategori}</Badge> },
            {
              key: 'stok',
              label: 'Tersedia',
              render: (b) => (
                <span className={tersedia(b) > 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>
                  {tersedia(b)} / {b.stok}
                </span>
              ),
            },
          ]}
        />
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title="Catat Peminjaman">
        {form && (
          <form onSubmit={simpanPinjam} className="space-y-4">
            {error && <Alert tone="error">{error}</Alert>}
            <div>
              <label htmlFor="pinjam-siswa" className={labelCls}>Siswa</label>
              <select id="pinjam-siswa" value={form.nis} onChange={(e) => setForm({ ...form, nis: e.target.value })} className={inputCls}>
                <option value="">Pilih siswa</option>
                {[...data.siswa]
                  .sort((a, b) => a.kelas.localeCompare(b.kelas) || a.nama.localeCompare(b.nama))
                  .map((s) => (
                    <option key={s.nis} value={s.nis}>
                      {s.kelas} · {s.nama}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label htmlFor="pinjam-buku" className={labelCls}>Buku</label>
              <select id="pinjam-buku" value={form.bukuId} onChange={(e) => setForm({ ...form, bukuId: e.target.value })} className={inputCls}>
                <option value="">Pilih buku</option>
                {data.buku.map((b) => (
                  <option key={b.id} value={b.id} disabled={tersedia(b) <= 0}>
                    {b.judul} ({tersedia(b) > 0 ? `tersedia ${tersedia(b)}` : 'habis'})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-slate-500">
              Batas pengembalian: <b className="text-slate-700">{formatTanggal(tambahHari(hariIni, LAMA_PINJAM))}</b>
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setForm(null)} className={btn.secondary}>
                Batal
              </button>
              <button type="submit" className={btn.primary}>
                Simpan
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
