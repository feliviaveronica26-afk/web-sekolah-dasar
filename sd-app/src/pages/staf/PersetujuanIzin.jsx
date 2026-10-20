import { useState } from 'react'
import { Check, FileCheck, Paperclip, X } from 'lucide-react'
import { Avatar, Card, DashHeader, EmptyState, IzinBadge, btn, inputCls } from '../../components/ui'
import { useAkses } from '../../context/akses'
import { useData } from '../../context/DataContext'
import { formatTanggal } from '../../utils/format'

function rentang(i) {
  return i.tanggalSelesai !== i.tanggalMulai
    ? `${formatTanggal(i.tanggalMulai)} – ${formatTanggal(i.tanggalSelesai)}`
    : formatTanggal(i.tanggalMulai)
}

export default function PersetujuanIzin() {
  const { kelas } = useAkses()
  const { data, prosesIzin } = useData()
  const [tab, setTab] = useState('Menunggu')
  const [catatan, setCatatan] = useState({})

  const izinKelas = data.izin.filter((i) => i.kelas === kelas)
  const menunggu = izinKelas.filter((i) => i.status === 'Menunggu')
  const riwayat = izinKelas.filter((i) => i.status !== 'Menunggu')

  const proses = (id, status) => {
    prosesIzin(id, status, catatan[id]?.trim() || '')
    setCatatan({ ...catatan, [id]: '' })
  }

  return (
    <>
      <DashHeader title="Persetujuan Izin" desc="Tinjau pengajuan izin dari orang tua. Izin yang disetujui otomatis tercatat di absensi." />

      <div className="mb-5 d-inline-flex mw-100 overflow-x-auto rounded-2 bg-abu-100 p-1">
        {[
          ['Menunggu', menunggu.length],
          ['Riwayat', riwayat.length],
        ].map(([t, n]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-shrink-0 text-nowrap rounded-1 px-4 py-2 fs-sm fw-semibold transisi ${tab === t ? 'bg-white text-tinta shadow-sm' : 'text-tinta-3'}`}
          >
            {t} <span className="ms-1 fs-xs text-abu-400">({n})</span>
          </button>
        ))}
      </div>

      {tab === 'Menunggu' &&
        (menunggu.length === 0 ? (
          <Card>
            <EmptyState icon={FileCheck} title="Tidak ada pengajuan baru" desc="Semua pengajuan izin sudah ditinjau." />
          </Card>
        ) : (
          <div className="d-grid gap-4 kolom-lg-2">
            {menunggu.map((i) => (
              <Card key={i.id} className="p-5">
                <div className="d-flex align-items-start gap-3">
                  <Avatar nama={i.namaSiswa} />
                  <div className="flex-1">
                    <p className="fw-bold text-tinta">{i.namaSiswa}</p>
                    <p className="fs-sm text-tinta-3">
                      {i.jenis} · {rentang(i)}
                    </p>
                  </div>
                  <IzinBadge status={i.status} />
                </div>
                <p className="mt-4 rounded-2 bg-abu-50 px-4 py-3 fs-sm text-tinta-2">{i.alasan}</p>
                {i.lampiran && (
                  <p className="mt-2 d-flex align-items-center gap-1-5 fs-xs text-tinta-3">
                    <Paperclip className="h-3-5 w-3-5" /> {i.lampiran}
                  </p>
                )}
                <input
                  value={catatan[i.id] ?? ''}
                  onChange={(e) => setCatatan({ ...catatan, [i.id]: e.target.value })}
                  placeholder="Catatan untuk orang tua (opsional)"
                  className={`${inputCls} mt-4`}
                />
                <div className="mt-3 d-grid kolom-2 gap-2">
                  <button onClick={() => proses(i.id, 'Ditolak')} className={btn.danger}>
                    <X className="h-4 w-4" /> Tolak
                  </button>
                  <button onClick={() => proses(i.id, 'Disetujui')} className={btn.primary}>
                    <Check className="h-4 w-4" /> Setujui
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ))}

      {tab === 'Riwayat' && (
        <Card className="overflow-hidden">
          {riwayat.length === 0 ? (
            <EmptyState icon={FileCheck} title="Belum ada riwayat" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-100 min-w-640 text-start fs-sm">
                <thead className="bg-abu-50 fs-xs text-uppercase ls-wider text-tinta-3">
                  <tr>
                    <th className="px-5 py-3">Siswa</th>
                    <th className="px-5 py-3">Jenis</th>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3">Catatan</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="pembatas-y pembatas-abu">
                  {riwayat.map((i) => (
                    <tr key={i.id}>
                      <td className="px-5 py-3 fw-semibold text-tinta">{i.namaSiswa}</td>
                      <td className="px-5 py-3">{i.jenis}</td>
                      <td className="px-5 py-3 text-tinta-2">{rentang(i)}</td>
                      <td className="px-5 py-3 text-tinta-2">{i.catatanGuru || '–'}</td>
                      <td className="px-5 py-3">
                        <IzinBadge status={i.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </>
  )
}
