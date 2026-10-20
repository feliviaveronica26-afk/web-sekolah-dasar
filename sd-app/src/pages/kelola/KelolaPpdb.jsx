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
  const { data, prosesPendaftar } = useData()
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

  const proses = async (statusBaru) => {
    if (await prosesPendaftar(p.id, statusBaru, catatan.trim())) return
    setDipilih(null)
  }

  return (
    <>
      <DashHeader title="PPDB Online" desc={`Pendaftar peserta didik baru tahun ajaran ${PPDB.tahunAjaran}.`} />

      <div className="d-grid kolom-2 gap-4 kolom-lg-4">
        <StatCard icon={UserPlus} label="Total pendaftar" value={data.pendaftar.length} tone="sky" />
        <StatCard icon={ClipboardList} label="Perlu diverifikasi" value={hitung('Menunggu Verifikasi')} tone="amber" />
        <StatCard icon={FileText} label="Berkas lengkap" value={hitung('Terverifikasi')} hint="siap observasi" tone="primary" />
        <StatCard icon={CheckCircle2} label="Diterima" value={hitung('Diterima')} hint={`dari ${PPDB.jalur.reduce((a, j) => a + j.kuota, 0)} kursi`} tone="emerald" />
      </div>

      <Card className="mt-6 p-5">
        <p className="mb-3 fs-sm fw-bold text-tinta-2">Keterisian kuota per jalur</p>
        <div className="d-grid gap-4 kolom-sm-3">
          {PPDB.jalur.map((j) => {
            const n = data.pendaftar.filter((x) => x.jalur === j.nama && x.status !== 'Tidak Diterima').length
            return (
              <div key={j.nama}>
                <div className="mb-1 d-flex justify-content-between fs-sm">
                  <span className="fw-semibold text-tinta-2">{j.nama}</span>
                  <span className="text-tinta-3">
                    {n}/{j.kuota}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-pill bg-abu-100">
                  <div className="h-100 rounded-pill bg-merah-500" style={{ width: `${Math.min(100, (n / j.kuota) * 100)}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="mt-6 overflow-hidden">
        <div className="d-flex flex-column gap-3 border-bottom border-abu-100 p-4 flex-lg-row">
          <div className="position-relative flex-1">
            <Search className="pe-none position-absolute start-3-5 top-50 h-4 w-4 translate-middle-y text-abu-400" />
            <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama atau nomor pendaftaran..." className={`${inputCls} ps-10`} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} w-lg-52`}>
            <option value="">Semua status</option>
            {Object.keys(STATUS_PPDB).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select value={jalur} onChange={(e) => setJalur(e.target.value)} className={`${inputCls} w-lg-48`}>
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
            <table className="w-100 min-w-720 text-start fs-sm">
              <thead className="bg-abu-50 fs-xs text-uppercase ls-wider text-tinta-3">
                <tr>
                  <th className="px-5 py-3">Calon Siswa</th>
                  <th className="px-5 py-3">Usia</th>
                  <th className="px-5 py-3">Jalur</th>
                  <th className="px-5 py-3">Tanggal Daftar</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-end">Aksi</th>
                </tr>
              </thead>
              <tbody className="pembatas-y pembatas-abu">
                {daftar.map((x) => {
                  const usia = hitungUsia(x.tanggalLahir)
                  return (
                    <tr key={x.id} className="hover-latar">
                      <td className="px-5 py-3">
                        <span className="d-flex align-items-center gap-3">
                          <Avatar nama={x.nama} size="sm" />
                          <span>
                            <span className="d-block fw-semibold text-tinta">{x.nama}</span>
                            <span className="d-block font-monospace fs-xs text-tinta-3">{x.nomor}</span>
                          </span>
                        </span>
                      </td>
                      <td className="px-5 py-3 text-tinta-2">
                        {usia.tahun} th {usia.bulan} bln
                      </td>
                      <td className="px-5 py-3">{x.jalur}</td>
                      <td className="px-5 py-3 text-tinta-2">{new Date(x.dibuat).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-5 py-3">
                        <Badge className={STATUS_PPDB[x.status].cls}>{x.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-end">
                        <button onClick={() => buka(x)} className="rounded-1 px-3 py-1-5 fs-sm fw-semibold text-primary hover-latar-merah">
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
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 rounded-3 bg-abu-50 p-4">
              <div className="d-flex align-items-center gap-3">
                <Avatar nama={p.nama} />
                <div>
                  <p className="fw-bold text-tinta">{p.nama}</p>
                  <p className="font-monospace fs-xs text-tinta-3">{p.nomor}</p>
                </div>
              </div>
              <Badge className={STATUS_PPDB[p.status].cls}>{p.status}</Badge>
            </div>

            <div className="mt-5 d-grid gap-5 kolom-sm-2">
              <dl className="antara-y-2 fs-sm">
                <p className="fw-bold text-tinta-2">Calon siswa</p>
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
                  <div key={k} className="d-grid kolom-110-isi gap-2">
                    <dt className="text-tinta-3">{k}</dt>
                    <dd className="fw-medium text-tinta">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="antara-y-5">
                <dl className="antara-y-2 fs-sm">
                  <p className="fw-bold text-tinta-2">Orang tua</p>
                  {[
                    ['Ayah', p.namaAyah ? `${p.namaAyah}${p.pekerjaanAyah ? ` · ${p.pekerjaanAyah}` : ''}` : '-'],
                    ['Ibu', p.namaIbu ? `${p.namaIbu}${p.pekerjaanIbu ? ` · ${p.pekerjaanIbu}` : ''}` : '-'],
                    ['Email', p.email || '-'],
                  ].map(([k, v]) => (
                    <div key={k} className="d-grid kolom-110-isi gap-2">
                      <dt className="text-tinta-3">{k}</dt>
                      <dd className="fw-medium text-tinta">{v}</dd>
                    </div>
                  ))}
                  <a
                    href={`https://wa.me/${nomorWa(p.whatsapp)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="d-inline-flex align-items-center gap-1-5 fw-semibold text-success"
                  >
                    <MessageCircle className="h-4 w-4" /> {p.whatsapp}
                  </a>
                </dl>
                <div className="fs-sm">
                  <p className="fw-bold text-tinta-2">Jalur {p.jalur}</p>
                  {p.infoJalur && <p className="mt-1 text-tinta-2">{p.infoJalur}</p>}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 fs-sm fw-bold text-tinta-2">Berkas</p>
              <ul className="d-grid gap-2 kolom-sm-2">
                {PPDB.berkas
                  .filter((b) => !b.jalur || b.jalur === p.jalur)
                  .map((b) => (
                    <li
                      key={b.id}
                      className={`d-flex align-items-center gap-2 rounded-2 px-3 py-2 fs-sm ${p.berkas[b.id] ? 'bg-success-subtle text-success-emphasis' : 'bg-danger-subtle text-danger'}`}
                    >
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="min-w-0 flex-1 text-truncate">
                        {b.label}
                        <span className="d-block text-truncate fs-xs opacity-75">{p.berkas[b.id] ?? 'Belum diunggah'}</span>
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="mt-5">
              <label htmlFor="catatan-ppdb" className="mb-1-5 d-block fs-sm fw-bold text-tinta-2">Catatan untuk orang tua</label>
              <textarea
                id="catatan-ppdb"
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                disabled={!AKSI[p.status].length}
                placeholder="Contoh: Mohon unggah ulang pas foto dengan latar merah."
                className={inputCls}
              />
              <p className="mt-1 fs-xs text-tinta-3">Catatan tampil saat orang tua mengecek status pendaftaran.</p>
            </div>

            {AKSI[p.status].length > 0 && (
              <div className="mt-5 d-flex flex-column-reverse gap-2 border-top border-abu-100 pt-4 flex-sm-row justify-content-sm-end">
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
