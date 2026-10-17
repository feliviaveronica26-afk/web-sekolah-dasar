import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { HeartPulse, Phone, Trophy, UserX } from 'lucide-react'
import KartuTeman from '../../components/KartuTeman'
import { Avatar, Card, DashHeader, EmptyState } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { SEKOLAH } from '../../data/dummy'
import { ekskulSiswa } from '../../utils/prestasi'
import { formatTanggal } from '../../utils/format'
import { namaJk, teksLahir, usia } from '../../utils/siswa'

export default function SiswaProfil() {
  const { user } = useAuth()
  const { data } = useData()
  // { teman, asal (elemen kotak nama yang diklik), nomorAbsen }
  const [pilihan, setPilihan] = useState(null)
  const tutupKartu = useCallback(() => setPilihan(null), [])
  const siswa = data.siswa.find((s) => s.nis === user.nis)

  if (!siswa) return <EmptyState icon={UserX} title="Data siswa tidak ditemukan" desc="Silakan hubungi admin sekolah." />

  // Alamat & kontak keluarga sendiri (server hanya mengirim data keluarga siswa yang login)
  const keluarga = (data.orangTua ?? []).find((k) => k.anak?.includes(siswa.nis))
  const ekskul = ekskulSiswa(data, siswa)
  const waliKelas = data.guru.find((g) => g.peran?.includes('wali_kelas') && g.kelas === siswa.kelas)
  const temanSekelas = data.siswa.filter((s) => s.kelas === siswa.kelas && s.nis !== siswa.nis).sort((a, b) => a.nama.localeCompare(b.nama))
  // Nomor absen = urutan nama di seluruh kelas (termasuk siswa yang login)
  const urutanKelas = data.siswa
    .filter((s) => s.kelas === siswa.kelas)
    .sort((a, b) => a.nama.localeCompare(b.nama))
    .map((s) => s.nis)

  const biodata = [
    ['Nama Lengkap', siswa.nama],
    ['NIS', siswa.nis],
    ['NISN', siswa.nisn],
    ['Kelas', siswa.kelas],
    ['Jenis Kelamin', namaJk(siswa.jk)],
    ['Tempat, Tanggal Lahir', teksLahir(siswa) && `${teksLahir(siswa)}${siswa.tanggalLahir ? ` (${usia(siswa.tanggalLahir)} tahun)` : ''}`],
    ['Agama', siswa.agama],
    ['Golongan Darah', siswa.golonganDarah],
    ['Alamat', keluarga?.alamat],
    ['Nama Orang Tua/Wali', siswa.ortu],
    ['Masuk Sekolah Ini', siswa.tanggalMasuk && formatTanggal(siswa.tanggalMasuk)],
    ['Asal TK / Sekolah', siswa.asalSekolah],
  ]

  return (
    <>
      <DashHeader title="Profil Saya" desc="Data diri dan kartu pelajar digital. Hubungi wali kelas atau Tata Usaha jika ada data yang salah." />

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
                {siswa.nisn && (
                  <p>
                    <span className="text-primary-200">NISN</span> {siswa.nisn}
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
                  <Link key={e.id} to="/dashboard/siswa/ekskul" className={`rounded-full px-3 py-1.5 text-sm font-semibold transition hover:brightness-95 ${e.warna}`}>
                    {e.nama}
                  </Link>
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
            {siswa.catatanKesehatan && (
              <div className="flex items-start gap-2 border-t border-amber-100 bg-amber-50 px-6 py-3 text-sm text-amber-900">
                <HeartPulse className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Catatan kesehatan: <span className="font-semibold">{siswa.catatanKesehatan}</span>
                </span>
              </div>
            )}
            {keluarga?.whatsapp && (
              <div className="flex items-center gap-2 bg-slate-50 px-6 py-3 text-sm text-slate-600">
                <Phone className="h-4 w-4" /> Kontak orang tua: <span className="font-semibold text-slate-800">{keluarga.whatsapp}</span>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-bold text-slate-900">
              Teman Sekelas <span className="font-normal text-slate-400">({temanSekelas.length})</span>
            </h2>
            <p className="mt-1 text-sm text-slate-500">Ketuk nama teman untuk melihat kartu data dirinya.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {temanSekelas.map((t) => (
                <button
                  key={t.nis}
                  type="button"
                  aria-haspopup="dialog"
                  onClick={(e) => setPilihan({ teman: t, asal: e.currentTarget, nomorAbsen: urutanKelas.indexOf(t.nis) + 1 })}
                  className="flex flex-col items-center rounded-2xl bg-slate-50 p-3 text-center transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md hover:ring-1 hover:ring-primary-100 active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                >
                  <Avatar nama={t.nama} />
                  <p className="mt-2 text-xs font-semibold leading-snug text-slate-700">{t.nama}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {pilihan && <KartuTeman teman={pilihan.teman} asal={pilihan.asal} nomorAbsen={pilihan.nomorAbsen} data={data} onTutup={tutupKartu} />}
    </>
  )
}
