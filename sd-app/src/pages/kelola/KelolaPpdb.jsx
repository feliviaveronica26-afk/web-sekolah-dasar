import { useState } from 'react'
import { CheckCircle2, ClipboardList, FileText, MessageCircle, Search, UserPlus, Users } from 'lucide-react'
import { STATUS_PPDB, hitungUsia } from '../../components/Ppdb'
import { Avatar, Badge, Card, DashHeader, EmptyState, Modal, StatCard, btn, inputCls } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { PPDB } from '../../data/dummy'
import { formatTanggal } from '../../utils/format'

// 0812-3456-7890 → 6281234567890 untuk tautan wa.me
const nomorWa = (no) => no.replace(/\D/g, '').replace(/^0/, '62')

// Aksi yang tersedia untuk tiap status
const AKSI = {
  'Menunggu Verifikasi': [
    ['Perlu Perbaikan', 'Minta Perbaikan', 'secondary'],
    ['Terverifikasi', 'Berkas Lengkap', 'primary'],
  ],
  'Perlu Perbaikan': [['Terverifikasi', 'Berkas Lengkap', 'primary']],
  Terverifikasi: [
    ['Tidak Diterima', 'Tidak Diterima', 'danger'],
    ['Diterima', 'Terima', 'primary'],
  ],
  Diterima: [],
  'Tidak Diterima': [],
}

export default function KelolaPpdb() {
  const { data, ubah } = useData()
  const [cari, setCari] = useState('')
  const [status, setStatus] = useState('')
  const [jalur, setJalur] = useState('')
  const [dipilih, setDipilih] = useState(null)
  const [catatan, setCatatan] = useState('')

  const q = cari.trim().toLowerCase()
  const daftar = data.pendaftar
    .filter((p) => (!q || p.nama.toLowerCase().includes(q) || p.nomor.toLowerCase().includes(q)) && (!status || p.status === status) && (!jalur || p.jalur === jalur))
    .sort((a, b) => b.nomor.localeCompare(a.nomor))
  const p = data.pendaftar.find((x) => x.id === dipilih)
  const hitung = (s) => data.pendaftar.filter((x) => x.status === s).length

  const buka = (x) => {
    setDipilih(x.id)
    setCatatan(x.catatanPanitia ?? '')
  }

  const proses = (statusBaru) => {
    ubah('pendaftar', p.id, { status: statusBaru, catatanPanitia: catatan.trim() })
    setDipilih(null)
  }

  return (
    <>
      <DashHeader title="PPDB Online" desc={`Pendaftar peserta didik baru tahun ajaran ${PPDB.tahunAjaran}.`} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={UserPlus} label="Total pendaftar" value={data.pendaftar.length} tone="sky" />
        <StatCard icon={ClipboardList} label="Perlu diverifikasi" value={hitung('Menunggu Verifikasi')} tone="amber" />
        <StatCard icon={FileText} label="Berkas lengkap" value={hitung('Terverifikasi')} hint="siap observasi" tone="primary" />
        <StatCard icon={CheckCircle2} label="Diterima" value={hitung('Diterima')} hint={`dari ${PPDB.jalur.reduce((a, j) => a + j.kuota, 0)} kursi`} tone="emerald" />
      </div>

      <Card className="mt-6 p-5">
        <p className="mb-3 text-sm font-bold text-slate-700">Keterisian kuota per jalur</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {PPDB.jalur.map((j) => {
            const n = data.pendaftar.filter((x) => x.jalur === j.nama && x.status !== 'Tidak Diterima').length
            return (
              <div key={j.nama}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">{j.nama}</span>
                  <span className="text-slate-500">
                    {n}/{j.kuota}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.min(100, (n / j.kuota) * 100)}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama atau nomor pendaftaran..." className={`${inputCls} pl-10`} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} lg:w-52`}>
            <option value="">Semua status</option>
            {Object.keys(STATUS_PPDB).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select value={jalur} onChange={(e) => setJalur(e.target.value)} className={`${inputCls} lg:w-48`}>
            <option value="">Semua jalur</option>
            {PPDB.jalur.map((j) => (
              <option key={j.nama}>{j.nama}</option>
            ))}
          </select>
        </div>

        {daftar.length === 0 ? (
          <EmptyState icon={Users} title="Belum ada pendaftar" desc="Pendaftar dari formulir di halaman PPDB akan muncul di sini." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Calon Siswa</th>
                  <th className="px-5 py-3">Usia</th>
                  <th className="px-5 py-3">Jalur</th>
                  <th className="px-5 py-3">Tanggal Daftar</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daftar.map((x) => {
                  const usia = hitungUsia(x.tanggalLahir)
                  return (
                    <tr key={x.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-3">
                          <Avatar nama={x.nama} size="sm" />
                          <span>
                            <span className="block font-semibold text-slate-800">{x.nama}</span>
                            <span className="block font-mono text-xs text-slate-500">{x.nomor}</span>
                          </span>
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {usia.tahun} th {usia.bulan} bln
                      </td>
                      <td className="px-5 py-3">{x.jalur}</td>
                      <td className="px-5 py-3 text-slate-600">{new Date(x.dibuat).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-5 py-3">
                        <Badge className={STATUS_PPDB[x.status].cls}>{x.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => buka(x)} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-primary-600 hover:bg-primary-50">
                          {AKSI[x.status].length ? 'Periksa' : 'Detail'}
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

      <Modal open={!!p} onClose={() => setDipilih(null)} title="Data Pendaftar" size="max-w-2xl">
        {p && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Avatar nama={p.nama} />
                <div>
                  <p className="font-bold text-slate-900">{p.nama}</p>
                  <p className="font-mono text-xs text-slate-500">{p.nomor}</p>
                </div>
              </div>
              <Badge className={STATUS_PPDB[p.status].cls}>{p.status}</Badge>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <dl className="space-y-2 text-sm">
                <p className="font-bold text-slate-700">Calon siswa</p>
                {[
                  ['Panggilan', p.panggilan || '-'],
                  ['Jenis kelamin', p.jk === 'L' ? 'Laki-laki' : 'Perempuan'],
                  ['TTL', `${p.tempatLahir}, ${formatTanggal(p.tanggalLahir)}`],
                  ['Usia (1 Jul 2027)', `${hitungUsia(p.tanggalLahir).tahun} tahun ${hitungUsia(p.tanggalLahir).bulan} bulan`],
                  ['NIK', p.nik],
                  ['Agama', p.agama],
                  ['Asal TK', p.asalTk || '-'],
                  ['Alamat', p.alamat],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[110px_1fr] gap-2">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-medium text-slate-800">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="space-y-5">
                <dl className="space-y-2 text-sm">
                  <p className="font-bold text-slate-700">Orang tua</p>
                  {[
                    ['Ayah', p.namaAyah ? `${p.namaAyah}${p.pekerjaanAyah ? ` · ${p.pekerjaanAyah}` : ''}` : '-'],
                    ['Ibu', p.namaIbu ? `${p.namaIbu}${p.pekerjaanIbu ? ` · ${p.pekerjaanIbu}` : ''}` : '-'],
                    ['Email', p.email || '-'],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[110px_1fr] gap-2">
                      <dt className="text-slate-500">{k}</dt>
                      <dd className="font-medium text-slate-800">{v}</dd>
                    </div>
                  ))}
                  <a
                    href={`https://wa.me/${nomorWa(p.whatsapp)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    <MessageCircle className="h-4 w-4" /> {p.whatsapp}
                  </a>
                </dl>
                <div className="text-sm">
                  <p className="font-bold text-slate-700">Jalur {p.jalur}</p>
                  {p.infoJalur && <p className="mt-1 text-slate-600">{p.infoJalur}</p>}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-bold text-slate-700">Berkas</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {PPDB.berkas
                  .filter((b) => !b.jalur || b.jalur === p.jalur)
                  .map((b) => (
                    <li
                      key={b.id}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${p.berkas[b.id] ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'}`}
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">
                        {b.label}
                        <span className="block truncate text-xs opacity-75">{p.berkas[b.id] ?? 'Belum diunggah'}</span>
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="mt-5">
              <label htmlFor="catatan-ppdb" className="mb-1.5 block text-sm font-bold text-slate-700">Catatan untuk orang tua</label>
              <textarea
                id="catatan-ppdb"
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                disabled={!AKSI[p.status].length}
                placeholder="Contoh: Mohon unggah ulang pas foto dengan latar merah."
                className={inputCls}
              />
              <p className="mt-1 text-xs text-slate-500">Catatan tampil saat orang tua mengecek status pendaftaran.</p>
            </div>

            {AKSI[p.status].length > 0 && (
              <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                {AKSI[p.status].map(([statusBaru, label, gaya]) => (
                  <button key={statusBaru} onClick={() => proses(statusBaru)} className={btn[gaya]}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  )
}
