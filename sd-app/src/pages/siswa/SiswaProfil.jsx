import { Phone, Trophy, UserX } from 'lucide-react'
import { Avatar, Card, DashHeader, EmptyState } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { BIODATA, SEKOLAH } from '../../data/dummy'
import { ekskulSiswa } from '../../utils/prestasi'
import { formatTanggal } from '../../utils/format'

export default function SiswaProfil() {
  const { user } = useAuth()
  const { data } = useData()
  const siswa = data.siswa.find((s) => s.nis === user.nis)

  if (!siswa) return <EmptyState icon={UserX} title="Data siswa tidak ditemukan" desc="Silakan hubungi admin sekolah." />

  const bio = BIODATA[siswa.nis] ?? {}
  const ekskul = ekskulSiswa(data, siswa)
  const waliKelas = data.guru.find((g) => g.peran?.includes('wali_kelas') && g.kelas === siswa.kelas)
  const temanSekelas = data.siswa.filter((s) => s.kelas === siswa.kelas && s.nis !== siswa.nis).sort((a, b) => a.nama.localeCompare(b.nama))

  const biodata = [
    ['Nama Lengkap', siswa.nama],
    ['NIS', siswa.nis],
    ['NISN', bio.nisn],
    ['Kelas', siswa.kelas],
    ['Jenis Kelamin', siswa.jk === 'L' ? 'Laki-laki' : 'Perempuan'],
    ['Tempat, Tanggal Lahir', bio.tanggalLahir && `${bio.tempatLahir}, ${formatTanggal(bio.tanggalLahir)}`],
    ['Agama', bio.agama],
    ['Golongan Darah', bio.golonganDarah],
    ['Alamat', bio.alamat],
    ['Nama Orang Tua/Wali', siswa.ortu],
  ]

  return (
    <>
      <DashHeader title="Profil Saya" desc="Data diri dan kartu pelajar digital. Hubungi wali kelas jika ada data yang salah." />

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <div className="space-y-6">
          {/* Kartu pelajar digital */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary-600 to-primary-800 p-5 text-white shadow-lg">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/5" />
            <div className="relative flex items-center gap-3 border-b border-white/20 pb-3">
              <img src="/logo.png" alt="" className="h-11 w-11 object-contain drop-shadow-md" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-100">Kartu Pelajar</p>
                <p className="font-extrabold">{SEKOLAH.nama}</p>
              </div>
            </div>
            <div className="relative mt-4 flex gap-4">
              <Avatar nama={siswa.nama} size="xl" className="bg-white text-primary-700 ring-4 ring-white/30" />
              <div className="min-w-0 space-y-1.5 text-sm">
                <p className="text-lg font-extrabold leading-tight">{siswa.nama}</p>
                <p>
                  <span className="text-primary-200">NIS</span> {siswa.nis}
                </p>
                {bio.nisn && (
                  <p>
                    <span className="text-primary-200">NISN</span> {bio.nisn}
                  </p>
                )}
                <p>
                  <span className="text-primary-200">Kelas</span> {siswa.kelas}
                </p>
              </div>
            </div>
            <div className="stripe-merah-putih relative mt-4 h-1.5 rounded-full" />
            <p className="relative mt-2 text-[10px] text-primary-100">Berlaku selama menjadi siswa · {SEKOLAH.alamat}</p>
          </div>

          {waliKelas && (
            <Card className="flex items-center gap-4 p-5">
              <Avatar nama={waliKelas.nama} />
              <div>
                <p className="text-xs text-slate-500">Wali Kelas {siswa.kelas}</p>
                <p className="font-bold text-slate-900">{waliKelas.nama}</p>
              </div>
            </Card>
          )}

          {ekskul.length > 0 && (
            <Card className="p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Trophy className="h-4 w-4 text-primary-600" /> Ekstrakurikuler yang diikuti
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ekskul.map((e) => (
                  <span key={e.id} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${e.warna}`}>
                    {e.nama}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-bold text-slate-900">Biodata</h2>
            </div>
            <dl className="divide-y divide-slate-100">
              {biodata.map(([k, v]) => (
                <div key={k} className="grid gap-1 px-6 py-3 text-sm sm:grid-cols-[200px_1fr]">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="font-semibold text-slate-800">{v || '–'}</dd>
                </div>
              ))}
            </dl>
            {bio.teleponOrtu && (
              <div className="flex items-center gap-2 bg-slate-50 px-6 py-3 text-sm text-slate-600">
                <Phone className="h-4 w-4" /> Kontak orang tua: <span className="font-semibold text-slate-800">{bio.teleponOrtu}</span>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-bold text-slate-900">
              Teman Sekelas <span className="font-normal text-slate-400">({temanSekelas.length})</span>
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {temanSekelas.map((t) => (
                <div key={t.nis} className="flex flex-col items-center rounded-2xl bg-slate-50 p-3 text-center">
                  <Avatar nama={t.nama} />
                  <p className="mt-2 text-xs font-semibold leading-snug text-slate-700">{t.nama}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
