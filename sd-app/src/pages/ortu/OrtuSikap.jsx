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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Award} label="Total poin" value={sikap.total > 0 ? `+${sikap.total}` : sikap.total} tone="amber" />
        <StatCard icon={Award} label="Apresiasi" value={sikap.positif} hint="dari guru" tone="emerald" />
        <StatCard icon={Award} label="Catatan perbaikan" value={sikap.perbaikan} tone="sky" />
        <StatCard icon={Award} label="Lencana didapat" value={`${lencana.filter((l) => l.didapat).length}/${lencana.length}`} tone="primary" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-6">
          <JudulKartu judul="Riwayat dari guru" />
          <RiwayatSikap nis={anak.nis} />
        </Card>
        <div className="space-y-6">
          <Card className="p-6">
            <JudulKartu judul="Poin per kategori" />
            <KategoriSikap nis={anak.nis} />
          </Card>
          <Card className="p-6">
            <JudulKartu judul={`Lencana ${panggilan}`} />
            <ul className="space-y-3">
              {lencana.map((l) => (
                <li key={l.kode} className="flex items-center gap-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl ${l.didapat ? `bg-linear-to-br ${l.warna}` : 'bg-slate-100'}`}>
                    {l.didapat ? l.emoji : <Lock className="h-4 w-4 text-slate-400" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800">{l.nama}</p>
                    {l.didapat ? <p className="text-xs font-semibold text-emerald-600">Sudah didapat</p> : <Progres nilai={l.progres * 100} warna="bg-amber-400" tinggi="h-1.5" className="mt-1" />}
                  </div>
                  {!l.didapat && <span className="shrink-0 text-xs text-slate-500">{l.teks}</span>}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
