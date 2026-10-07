import { Lock, Sparkles } from 'lucide-react'
import { Bintang } from '../../components/Hiasan'
import { Card, DashHeader, EmptyState, JudulKartu, Progres } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { SIKAP } from '../../data/dummy'
import { formatTanggal } from '../../utils/format'
import { infoSikap, lencanaSiswa, levelSiswa, ringkasSikap } from '../../utils/prestasi'

// Riwayat poin sikap — dipakai di portal siswa & orang tua
export function RiwayatSikap({ nis, batas }) {
  const { data } = useData()
  const { daftar } = ringkasSikap(data, nis)
  const tampil = batas ? daftar.slice(0, batas) : daftar
  if (!daftar.length) return <EmptyState title="Belum ada catatan sikap" desc="Apresiasi dari guru akan muncul di sini." />
  return (
    <ol className="space-y-2.5">
      {tampil.map((s) => {
        const k = infoSikap(s.kode)
        const positif = s.poin > 0
        return (
          <li key={s.id} className={`flex items-start gap-3 rounded-2xl p-3.5 ${positif ? 'bg-emerald-50/70' : 'bg-amber-50/70'}`}>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-2xl shadow-sm">{k.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-slate-900">{k.label}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${positif ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                  {positif ? `+${s.poin}` : s.poin} poin
                </span>
              </div>
              {s.catatan && <p className="mt-0.5 text-sm text-slate-700">{s.catatan}</p>}
              <p className="mt-1 text-xs text-slate-500">
                {formatTanggal(s.tanggal)} · {s.oleh}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

// Ringkasan jumlah apresiasi per kategori
export function KategoriSikap({ nis }) {
  const { data } = useData()
  const { perKategori } = ringkasSikap(data, nis)
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {[...SIKAP.positif, ...SIKAP.perbaikan].map((k) => (
        <div key={k.kode} className={`flex items-center gap-2 rounded-xl px-3 py-2 ${perKategori[k.kode] ? (k.poin > 0 ? 'bg-emerald-50' : 'bg-amber-50') : 'bg-slate-50 opacity-60'}`}>
          <span className="text-xl">{k.emoji}</span>
          <span className="min-w-0 flex-1 text-xs font-semibold leading-tight text-slate-700">{k.label}</span>
          <span className="text-sm font-bold text-slate-900">{perKategori[k.kode] ?? 0}</span>
        </div>
      ))}
    </div>
  )
}

export default function SiswaLencana() {
  const { user } = useAuth()
  const { data } = useData()
  const siswa = data.siswa.find((s) => s.nis === user.nis)
  if (!siswa) return <EmptyState title="Data siswa tidak ditemukan" />

  const lencana = lencanaSiswa(data, siswa)
  const level = levelSiswa(data, siswa)
  const sikap = ringkasSikap(data, siswa.nis)

  return (
    <>
      <DashHeader title="Lencana & Poin" desc="Kumpulkan lencana dengan rajin hadir, menyelesaikan tugas, dan bersikap baik. Semangat!" />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="p-6">
          <JudulKartu icon={Sparkles} judul={`Koleksi lencana · ${lencana.filter((l) => l.didapat).length} dari ${lencana.length}`} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {lencana.map((l) => (
              <div
                key={l.kode}
                className={`relative flex flex-col items-center rounded-3xl p-4 text-center transition ${
                  l.didapat ? 'bg-white shadow-md ring-1 ring-slate-100 hover:-translate-y-1' : 'bg-slate-50'
                }`}
              >
                <span
                  className={`grid h-20 w-20 place-items-center rounded-full text-4xl ${
                    l.didapat ? `bg-linear-to-br shadow-lg ${l.warna}` : 'bg-slate-200 grayscale'
                  }`}
                >
                  {l.didapat ? l.emoji : <Lock className="h-8 w-8 text-slate-400" />}
                </span>
                {l.didapat && <Bintang className="absolute right-4 top-3 h-5 w-5 text-amber-400" />}
                <p className={`mt-3 font-display font-bold leading-tight ${l.didapat ? 'text-slate-900' : 'text-slate-500'}`}>{l.nama}</p>
                <p className="mt-1 text-xs text-slate-500">{l.syarat}</p>
                {!l.didapat && <Progres nilai={l.progres * 100} warna="bg-amber-400" tinggi="h-2" className="mt-3 w-full" />}
                <p className={`mt-1.5 text-xs font-semibold ${l.didapat ? 'text-emerald-600' : 'text-slate-600'}`}>{l.didapat ? 'Didapat! 🎉' : l.teks}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="bg-linear-to-br from-amber-300 to-orange-400 p-6 text-center text-amber-950">
              <p className="text-sm font-bold uppercase tracking-wider">Level kamu</p>
              <p className="font-display text-6xl font-bold">{level.level}</p>
              <p className="font-display text-xl font-bold">{level.gelar}</p>
            </div>
            <div className="p-5">
              <Progres nilai={level.progres * 100} warna="bg-amber-400" />
              <p className="mt-2 text-sm text-slate-600">
                {level.xp} XP · butuh {level.sisa} XP lagi untuk naik level
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-500">
                <li>⭐ 1 poin sikap = 5 XP</li>
                <li>✅ 1 tugas selesai = 10 XP</li>
                <li>🏅 1 lencana = 20 XP</li>
              </ul>
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-slate-500">Total poin sikap</p>
            <p className="text-4xl font-extrabold text-slate-900">{sikap.total > 0 ? `+${sikap.total}` : sikap.total}</p>
            <p className="text-sm text-slate-500">
              {sikap.positif} apresiasi · {sikap.perbaikan} catatan perbaikan
            </p>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="p-6">
          <JudulKartu judul="Poin per kategori" />
          <KategoriSikap nis={siswa.nis} />
        </Card>
        <Card className="p-6">
          <JudulKartu judul="Riwayat apresiasi dari guru" />
          <RiwayatSikap nis={siswa.nis} />
        </Card>
      </div>
    </>
  )
}
