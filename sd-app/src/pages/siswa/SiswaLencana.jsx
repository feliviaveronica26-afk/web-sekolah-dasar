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
    <ol className="antara-y-2-5">
      {tampil.map((s) => {
        const k = infoSikap(s.kode)
        const positif = s.poin > 0
        return (
          <li key={s.id} className={`d-flex align-items-start gap-3 rounded-3 p-3-5 ${positif ? 'bg-success-subtle' : 'bg-warning-subtle'}`}>
            <span className="d-flex h-11 w-11 flex-shrink-0 align-items-center justify-content-center rounded-2 bg-white fs-2xl shadow-sm">{k.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <p className="fw-bold text-tinta">{k.label}</p>
                <span className={`rounded-pill px-2-5 py-0-5 fs-xs fw-bold ${positif ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}`}>
                  {positif ? `+${s.poin}` : s.poin} poin
                </span>
              </div>
              {s.catatan && <p className="mt-0-5 fs-sm text-tinta-2">{s.catatan}</p>}
              <p className="mt-1 fs-xs text-tinta-3">
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
    <div className="d-grid gap-2 kolom-sm-2">
      {[...SIKAP.positif, ...SIKAP.perbaikan].map((k) => (
        <div key={k.kode} className={`d-flex align-items-center gap-2 rounded-2 px-3 py-2 ${perKategori[k.kode] ? (k.poin > 0 ? 'bg-success-subtle' : 'bg-warning-subtle') : 'bg-abu-50 opacity-60'}`}>
          <span className="fs-xl">{k.emoji}</span>
          <span className="min-w-0 flex-1 fs-xs fw-semibold lh-tight text-tinta-2">{k.label}</span>
          <span className="fs-sm fw-bold text-tinta">{perKategori[k.kode] ?? 0}</span>
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

      <div className="d-grid gap-6 kolom-lg-isi-340">
        <Card className="p-6">
          <JudulKartu icon={Sparkles} judul={`Koleksi lencana · ${lencana.filter((l) => l.didapat).length} dari ${lencana.length}`} />
          <div className="d-grid kolom-2 gap-4 kolom-sm-3 kolom-xl-4">
            {lencana.map((l) => (
              <div
                key={l.kode}
                className={`position-relative d-flex flex-column align-items-center rounded-4 p-4 text-center ${l.didapat ? 'bg-white shadow border border-abu-100' : 'bg-abu-50'}`}
              >
                <span
                  className={`d-flex h-20 w-20 align-items-center justify-content-center rounded-pill fs-4xl ${
                    l.didapat ? `shadow-lg ${l.warna}` : 'bg-abu-200 skala-abu'
                  }`}
                >
                  {l.didapat ? l.emoji : <Lock className="h-8 w-8 text-abu-400" />}
                </span>
                {l.didapat && <Bintang className="position-absolute end-4 top-3 h-5 w-5 teks-terang-amber" />}
                <p className={`mt-3 fw-bold lh-tight ${l.didapat ? 'text-tinta' : 'text-tinta-3'}`}>{l.nama}</p>
                <p className="mt-1 fs-xs text-tinta-3">{l.syarat}</p>
                {!l.didapat && <Progres nilai={l.progres * 100} warna="bg-amber-400" tinggi="h-2" className="mt-3 w-100" />}
                <p className={`mt-1-5 fs-xs fw-semibold ${l.didapat ? 'text-success' : 'text-tinta-2'}`}>{l.didapat ? 'Didapat! 🎉' : l.teks}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="antara-y-6">
          <Card className="overflow-hidden">
            <div className="gradasi-emas p-6 text-center text-warning-emphasis">
              <p className="fs-sm fw-bold text-uppercase ls-wider">Level kamu</p>
              <p className="fs-6xl fw-bold">{level.level}</p>
              <p className="fs-xl fw-bold">{level.gelar}</p>
            </div>
            <div className="p-5">
              <Progres nilai={level.progres * 100} warna="bg-amber-400" />
              <p className="mt-2 fs-sm text-tinta-2">
                {level.xp} XP · butuh {level.sisa} XP lagi untuk naik level
              </p>
              <ul className="mt-4 antara-y-1-5 fs-xs text-tinta-3">
                <li>⭐ 1 poin sikap = 5 XP</li>
                <li>✅ 1 tugas selesai = 10 XP</li>
                <li>🏅 1 lencana = 20 XP</li>
              </ul>
            </div>
          </Card>
          <Card className="p-5">
            <p className="fs-sm text-tinta-3">Total poin sikap</p>
            <p className="fs-4xl fw-extrabold text-tinta">{sikap.total > 0 ? `+${sikap.total}` : sikap.total}</p>
            <p className="fs-sm text-tinta-3">
              {sikap.positif} apresiasi · {sikap.perbaikan} catatan perbaikan
            </p>
          </Card>
        </div>
      </div>

      <div className="mt-6 d-grid gap-6 kolom-lg-10-12">
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
