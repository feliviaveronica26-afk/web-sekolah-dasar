import { useState } from 'react'
import { CheckCircle2, CircleDashed, ClipboardList, UserX } from 'lucide-react'
import { Badge, Card, DashHeader, EmptyState, Progres, Tabs } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { MAPEL } from '../../data/dummy'
import { formatTanggal } from '../../utils/format'
import { namaPengampu } from '../../utils/jadwal'
import { infoTenggat } from '../siswa/helpers'

export default function OrtuTugas() {
  const { user } = useAuth()
  const { data } = useData()
  const [tab, setTab] = useState('aktif')
  const anak = data.siswa.find((s) => s.nis === user.anakNis)
  if (!anak) return <EmptyState icon={UserX} title="Data anak tidak ditemukan" />

  const selesai = data.tugasSelesai[anak.nis] ?? []
  const tugas = data.tugas.filter((t) => t.kelas === anak.kelas).sort((a, b) => a.tenggat.localeCompare(b.tenggat))
  const aktif = tugas.filter((t) => !selesai.includes(t.id))
  const daftar = tab === 'aktif' ? aktif : tugas.filter((t) => selesai.includes(t.id))
  const panggilan = anak.nama.split(' ')[0]

  return (
    <>
      <DashHeader title="Tugas Ananda" desc={`Pantau tugas dan PR ${panggilan}. Status "selesai" ditandai sendiri oleh ananda di Portal Siswa.`} />

      <Card className="mb-6 p-5">
        <div className="d-flex align-items-center justify-content-between fs-sm">
          <span className="fw-semibold text-tinta-2">Progres tugas kelas {anak.kelas}</span>
          <span className="fw-bold text-tinta">
            {tugas.length - aktif.length}/{tugas.length} selesai
          </span>
        </div>
        <Progres nilai={tugas.length ? ((tugas.length - aktif.length) / tugas.length) * 100 : 0} warna="bg-emerald-500" tinggi="h-3" className="mt-3" />
      </Card>

      <Tabs
        value={tab}
        onChange={setTab}
        className="mb-5"
        items={[
          ['aktif', 'Belum selesai', aktif.length],
          ['selesai', 'Sudah selesai', tugas.length - aktif.length],
        ]}
      />

      {daftar.length === 0 ? (
        <Card>
          <EmptyState icon={ClipboardList} title={tab === 'aktif' ? 'Semua tugas sudah selesai 🎉' : 'Belum ada tugas yang selesai'} />
        </Card>
      ) : (
        <div className="d-grid gap-4 kolom-md-2">
          {daftar.map((t) => {
            const done = selesai.includes(t.id)
            const tenggat = infoTenggat(t.tenggat)
            return (
              <Card key={t.id} className="p-5">
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <span className={`rounded-1 px-2 py-0-5 fs-xs fw-bold ${MAPEL[t.mapel].warna}`}>{MAPEL[t.mapel].nama}</span>
                  {done ? <Badge className="bg-success-subtle text-success">Selesai</Badge> : <Badge className={tenggat.cls}>{tenggat.teks}</Badge>}
                </div>
                <h3 className="mt-2 d-flex align-items-start gap-2 fw-bold text-tinta">
                  {done ? <CheckCircle2 className="mt-0-5 h-5 w-5 flex-shrink-0 teks-terang-emerald" /> : <CircleDashed className="mt-0-5 h-5 w-5 flex-shrink-0 text-abu-300" />}
                  {t.judul}
                </h3>
                <p className="mt-1 fs-sm text-tinta-2">{t.deskripsi}</p>
                <p className="mt-3 fs-xs text-tinta-3">
                  Diberikan {formatTanggal(t.diberikan, { year: undefined })} · Dikumpulkan <span className="fw-semibold text-tinta-2">{formatTanggal(t.tenggat, { year: undefined })}</span> · {namaPengampu(data.guru, anak.kelas, t.mapel)}
                </p>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
