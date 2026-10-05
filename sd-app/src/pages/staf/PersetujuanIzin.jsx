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

      <div className="mb-5 inline-flex rounded-xl bg-slate-100 p-1">
        {[
          ['Menunggu', menunggu.length],
          ['Riwayat', riwayat.length],
        ].map(([t, n]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            {t} <span className="ml-1 text-xs text-slate-400">({n})</span>
          </button>
        ))}
      </div>

      {tab === 'Menunggu' &&
        (menunggu.length === 0 ? (
          <Card>
            <EmptyState icon={FileCheck} title="Tidak ada pengajuan baru" desc="Semua pengajuan izin sudah ditinjau." />
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {menunggu.map((i) => (
              <Card key={i.id} className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar nama={i.namaSiswa} />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{i.namaSiswa}</p>
                    <p className="text-sm text-slate-500">
                      {i.jenis} · {rentang(i)}
                    </p>
                  </div>
                  <IzinBadge status={i.status} />
                </div>
                <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{i.alasan}</p>
                {i.lampiran && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <Paperclip className="h-3.5 w-3.5" /> {i.lampiran}
                  </p>
                )}
                <input
                  value={catatan[i.id] ?? ''}
                  onChange={(e) => setCatatan({ ...catatan, [i.id]: e.target.value })}
                  placeholder="Catatan untuk orang tua (opsional)"
                  className={`${inputCls} mt-4`}
                />
                <div className="mt-3 grid grid-cols-2 gap-2">
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
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Siswa</th>
                    <th className="px-5 py-3">Jenis</th>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3">Catatan</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {riwayat.map((i) => (
                    <tr key={i.id}>
                      <td className="px-5 py-3 font-semibold text-slate-800">{i.namaSiswa}</td>
                      <td className="px-5 py-3">{i.jenis}</td>
                      <td className="px-5 py-3 text-slate-600">{rentang(i)}</td>
                      <td className="px-5 py-3 text-slate-600">{i.catatanGuru || '–'}</td>
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
