import { Fragment, useState } from 'react'
import { Coffee, User } from 'lucide-react'
import { Card, DashHeader } from '../../components/ui'
import DenahKelas from '../../components/DenahKelas'
import JamSekolah from '../../components/JamSekolah'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { HARI_SEKOLAH, ISTIRAHAT, MAPEL, SESI, lantaiKelas } from '../../data/dummy'
import { namaHari, todayKey } from '../../utils/format'
import { namaPengampu } from '../../utils/jadwal'

// `kelas` & `aksi` dipakai saat halaman ini ditampilkan di portal guru & staf
export default function SiswaJadwal({ kelas: kelasProp, aksi }) {
  const { user } = useAuth()
  const { data } = useData()
  const kelas = kelasProp ?? user.kelas
  const guruDari = (kode) => namaPengampu(data.guru, kelas, kode)
  // Jadwal dari server (diatur Wakasek Kurikulum); jam kosong bernilai null
  const jadwal = data.jadwal?.[kelas] ?? {}
  const hariIni = namaHari(todayKey())
  const [hariDipilih, setHariDipilih] = useState(HARI_SEKOLAH.includes(hariIni) ? hariIni : 'Senin')

  // Daftar mapel unik beserta gurunya
  const daftarMapel = [...new Set(Object.values(jadwal).flat())].filter((k) => MAPEL[k] && MAPEL[k].absensi !== false)

  const sel = (kode) =>
    MAPEL[kode] ? (
      <div className={`rounded-2 px-3 py-2-5 ${MAPEL[kode].warna}`}>
        <p className="fs-sm fw-bold">{MAPEL[kode].nama}</p>
        <p className="mt-0-5 fs-xs opacity-80">{guruDari(kode)}</p>
      </div>
    ) : (
      <div className="rounded-2 border border-putus border-abu-200 px-3 py-2-5 fs-sm text-abu-400">Jam kosong</div>
    )

  return (
    <>
      <DashHeader title="Jadwal Pelajaran" desc={`Kelas ${kelas} · Semester Ganjil 2026/2027`} action={aksi} />
      <JamSekolah className="mb-6" untukGuru={!!kelasProp} />

      {/* Tampilan HP: pilih hari */}
      <div className="d-lg-none">
        <div className="mb-4 d-grid kolom-5 gap-1-5 rounded-3 bg-abu-100 p-1-5">
          {HARI_SEKOLAH.map((h) => (
            <button
              key={h}
              onClick={() => setHariDipilih(h)}
              className={`rounded-2 py-2 fs-sm fw-bold transisi ${
                hariDipilih === h ? 'bg-primary text-white shadow-sm' : 'text-tinta-3'
              }`}
            >
              {h.slice(0, 3)}
            </button>
          ))}
        </div>
        <Card className="p-4">
          <ol className="antara-y-2">
            {(jadwal[hariDipilih] ?? []).map((kode, i) => (
              <li key={kode + i}>
                <div className="d-flex align-items-center gap-3">
                  <span className="w-14 flex-shrink-0 fs-xs fw-semibold text-tinta-3">
                    {SESI[i].mulai}
                    <br />
                    {SESI[i].selesai}
                  </span>
                  <div className="flex-1">{sel(kode)}</div>
                </div>
                {i + 1 === ISTIRAHAT.setelahSesi && (
                  <p className="my-2 d-flex align-items-center justify-content-center gap-2 rounded-2 border border-putus border-abu-200 py-2 fs-xs text-tinta-3">
                    <Coffee className="h-3-5 w-3-5" /> Istirahat {ISTIRAHAT.mulai} – {ISTIRAHAT.selesai}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* Tampilan desktop: tabel mingguan */}
      <Card className="d-none overflow-hidden d-lg-block">
        <div className="overflow-x-auto">
          <table className="w-100 tabel-jadwal p-2">
            <thead>
              <tr>
                <th className="w-28 text-start fs-xs fw-bold text-uppercase text-abu-400">Jam</th>
                {HARI_SEKOLAH.map((h) => (
                  <th
                    key={h}
                    className={`rounded-2 py-2-5 fs-sm fw-bold ${h === hariIni ? 'bg-primary text-white' : 'bg-abu-50 text-tinta-2'}`}
                  >
                    {h}
                    {h === hariIni && <span className="ms-1 fs-xs fw-medium opacity-80">(hari ini)</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SESI.map((s, i) => (
                <Fragment key={s.mulai}>
                  <tr>
                    <td className="align-middle fs-sm fw-semibold text-tinta-3">
                      {s.mulai} – {s.selesai}
                    </td>
                    {HARI_SEKOLAH.map((h) => (
                      <td key={h} className="align-top">
                        {jadwal[h]?.[i] && sel(jadwal[h][i])}
                      </td>
                    ))}
                  </tr>
                  {i + 1 === ISTIRAHAT.setelahSesi && (
                    <tr>
                      <td className="fs-sm fw-semibold text-abu-400">
                        {ISTIRAHAT.mulai} – {ISTIRAHAT.selesai}
                      </td>
                      <td colSpan={HARI_SEKOLAH.length}>
                        <p className="d-flex align-items-center justify-content-center gap-2 rounded-2 border border-putus border-abu-200 py-2 fs-sm text-tinta-3">
                          <Coffee className="h-4 w-4" /> Istirahat
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="fw-bold text-tinta">Mata Pelajaran & Guru Pengajar</h2>
        <div className="mt-4 d-grid gap-3 kolom-sm-2 kolom-lg-3">
          {daftarMapel.map((k) => (
            <div key={k} className="d-flex align-items-center gap-3 rounded-2 border border-abu-100 p-3">
              <span className={`d-flex h-10 w-10 flex-shrink-0 align-items-center justify-content-center rounded-2 fs-sm fw-extrabold ${MAPEL[k].warna}`}>
                {MAPEL[k].nama.slice(0, 2)}
              </span>
              <div className="min-w-0">
                <p className="text-truncate fs-sm fw-bold text-tinta">{MAPEL[k].nama}</p>
                <p className="d-flex align-items-center gap-1 text-truncate fs-xs text-tinta-3">
                  <User className="h-3 w-3" /> {guruDari(k)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="fw-bold text-tinta">Letak Ruang Kelas</h2>
        <p className="mb-5 mt-1 fs-sm text-tinta-3">
          Kelas {kelas} ada di Gedung Utama lantai {lantaiKelas(kelas)}. Klik ruang lain untuk melihat wali kelas dan pelajarannya.
        </p>
        <DenahKelas key={kelas} sorot={kelas} />
      </Card>
    </>
  )
}
