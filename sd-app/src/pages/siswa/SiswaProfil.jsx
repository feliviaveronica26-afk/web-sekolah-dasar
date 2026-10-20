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

      <div className="d-grid gap-6 kolom-lg-400-isi">
        <div className="antara-y-6">
          {/* Kartu pelajar digital */}
          <div className="position-relative overflow-hidden rounded-4 gradasi-merah p-5 text-white shadow-lg">
            <div className="position-absolute end-n12 top-n12 h-40 w-40 rounded-pill bg-white bg-opacity-10" />
            <div className="position-absolute bottom-n20 start-n10 h-40 w-40 rounded-pill bg-white bg-opacity-5" />
            <div className="position-relative d-flex align-items-center gap-3 border-bottom border-white border-opacity-20 pb-3">
              <img src="/logo.png" alt="" className="h-11 w-11 object-fit-contain bayangan-jatuh" />
              <div>
                <p className="fs-10 fw-semibold text-uppercase ls-widest text-merah-100">Kartu Pelajar</p>
                <p className="fw-extrabold">{SEKOLAH.nama}</p>
              </div>
            </div>
            <div className="position-relative mt-4 d-flex gap-4">
              <Avatar nama={siswa.nama} size="xl" className="bg-white text-merah-700 cincin-putih-tebal" />
              <div className="min-w-0 antara-y-1-5 fs-sm">
                <p className="fs-lg fw-extrabold lh-tight">{siswa.nama}</p>
                <p>
                  <span className="text-merah-200">NIS</span> {siswa.nis}
                </p>
                {siswa.nisn && (
                  <p>
                    <span className="text-merah-200">NISN</span> {siswa.nisn}
                  </p>
                )}
                <p>
                  <span className="text-merah-200">Kelas</span> {siswa.kelas}
                </p>
              </div>
            </div>
            <div className="stripe-merah-putih position-relative mt-4 h-1-5 rounded-pill" />
            <p className="position-relative mt-2 fs-10 text-merah-100">Berlaku selama menjadi siswa · {SEKOLAH.alamat}</p>
          </div>

          {waliKelas && (
            <Card className="d-flex align-items-center gap-4 p-5">
              <Avatar nama={waliKelas.nama} />
              <div>
                <p className="fs-xs text-tinta-3">Wali Kelas {siswa.kelas}</p>
                <p className="fw-bold text-tinta">{waliKelas.nama}</p>
              </div>
            </Card>
          )}

          {ekskul.length > 0 && (
            <Card className="p-5">
              <p className="d-flex align-items-center gap-2 fs-sm fw-bold text-tinta-2">
                <Trophy className="h-4 w-4 text-primary" /> Ekstrakurikuler yang diikuti
              </p>
              <div className="mt-3 d-flex flex-wrap gap-2">
                {ekskul.map((e) => (
                  <Link key={e.id} to="/dashboard/siswa/ekskul" className={`rounded-pill px-3 py-1-5 fs-sm fw-semibold transisi hover-redup ${e.warna}`}>
                    {e.nama}
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="antara-y-6">
          <Card className="overflow-hidden">
            <div className="border-bottom border-abu-100 px-6 py-4">
              <h2 className="fw-bold text-tinta">Biodata</h2>
            </div>
            <dl className="pembatas-y pembatas-abu">
              {biodata.map(([k, v]) => (
                <div key={k} className="d-grid gap-1 px-6 py-3 fs-sm kolom-sm-200-isi">
                  <dt className="text-tinta-3">{k}</dt>
                  <dd className="fw-semibold text-tinta">{v || '–'}</dd>
                </div>
              ))}
            </dl>
            {siswa.catatanKesehatan && (
              <div className="d-flex align-items-start gap-2 border-top border-warning-subtle bg-warning-subtle px-6 py-3 fs-sm text-warning-emphasis">
                <HeartPulse className="mt-0-5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>
                  Catatan kesehatan: <span className="fw-semibold">{siswa.catatanKesehatan}</span>
                </span>
              </div>
            )}
            {keluarga?.whatsapp && (
              <div className="d-flex align-items-center gap-2 bg-abu-50 px-6 py-3 fs-sm text-tinta-2">
                <Phone className="h-4 w-4" /> Kontak orang tua: <span className="fw-semibold text-tinta">{keluarga.whatsapp}</span>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="fw-bold text-tinta">
              Teman Sekelas <span className="fw-normal text-abu-400">({temanSekelas.length})</span>
            </h2>
            <p className="mt-1 fs-sm text-tinta-3">Ketuk nama teman untuk melihat kartu data dirinya.</p>
            <div className="mt-4 d-grid kolom-2 gap-3 kolom-sm-3 kolom-xl-4">
              {temanSekelas.map((t) => (
                <button
                  key={t.nis}
                  type="button"
                  aria-haspopup="dialog"
                  onClick={(e) => setPilihan({ teman: t, asal: e.currentTarget, nomorAbsen: urutanKelas.indexOf(t.nis) + 1 })}
                  className="d-flex flex-column align-items-center rounded-3 bg-abu-50 p-3 text-center transisi hover-angkat-sedikit hover-latar-putih hover-bayangan-kecil tekan"
                >
                  <Avatar nama={t.nama} />
                  <p className="mt-2 fs-xs fw-semibold lh-snug text-tinta-2">{t.nama}</p>
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
