import { Award, Lock, UserX } from 'lucide-react'
import { Card, DashHeader, EmptyState, JudulKartu, Progres, StatCard } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { lencanaSiswa, ringkasSikap } from '../../utils/prestasi'
import { KategoriSikap, RiwayatSikap } from '../siswa/SiswaLencana'

export default function OrtuSikap() {
  const { user } = useAuth()
  const { data } = useData()
  const anak = data.siswa.find((s) => s.nis === user.anakNis)
  if (!anak) return <EmptyState icon={UserX} title="Data anak tidak ditemukan" />

  const sikap = ringkasSikap(data, anak.nis)
  const lencana = lencanaSiswa(data, anak)
  const panggilan = anak.nama.split(' ')[0]

  return (
    <>
      <DashHeader title="Catatan Sikap" desc={`Apresiasi dan catatan perbaikan dari guru untuk ${panggilan}. Rayakan setiap kebaikan kecil di rumah!`} />

      <div className="d-grid kolom-2 gap-4 kolom-lg-4">
        <StatCard icon={Award} label="Total poin" value={sikap.total > 0 ? `+${sikap.total}` : sikap.total} tone="amber" />
        <StatCard icon={Award} label="Apresiasi" value={sikap.positif} hint="dari guru" tone="emerald" />
        <StatCard icon={Award} label="Catatan perbaikan" value={sikap.perbaikan} tone="sky" />
        <StatCard icon={Award} label="Lencana didapat" value={`${lencana.filter((l) => l.didapat).length}/${lencana.length}`} tone="primary" />
      </div>

      <div className="mt-6 d-grid gap-6 kolom-lg-12-10">
        <Card className="p-6">
          <JudulKartu judul="Riwayat dari guru" />
          <RiwayatSikap nis={anak.nis} />
        </Card>
        <div className="antara-y-6">
          <Card className="p-6">
            <JudulKartu judul="Poin per kategori" />
            <KategoriSikap nis={anak.nis} />
          </Card>
          <Card className="p-6">
            <JudulKartu judul={`Lencana ${panggilan}`} />
            <ul className="antara-y-3">
              {lencana.map((l) => (
                <li key={l.kode} className="d-flex align-items-center gap-3">
                  <span className={`d-flex h-10 w-10 flex-shrink-0 align-items-center justify-content-center rounded-pill fs-xl ${l.didapat ? `bg-linear-to-br ${l.warna}` : 'bg-abu-100'}`}>
                    {l.didapat ? l.emoji : <Lock className="h-4 w-4 text-abu-400" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="fs-sm fw-bold text-tinta">{l.nama}</p>
                    {l.didapat ? <p className="fs-xs fw-semibold text-success">Sudah didapat</p> : <Progres nilai={l.progres * 100} warna="bg-amber-400" tinggi="h-1.5" className="mt-1" />}
                  </div>
                  {!l.didapat && <span className="flex-shrink-0 fs-xs text-tinta-3">{l.teks}</span>}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
