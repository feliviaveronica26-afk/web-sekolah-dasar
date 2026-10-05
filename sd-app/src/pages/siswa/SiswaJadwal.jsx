import { Fragment, useState } from 'react'
import { Coffee, User } from 'lucide-react'
import { Card, DashHeader } from '../../components/ui'
import JamSekolah from '../../components/JamSekolah'
import { useAuth } from '../../context/AuthContext'
import { HARI_SEKOLAH, ISTIRAHAT, JADWAL, MAPEL, SESI } from '../../data/dummy'
import { namaHari, todayKey } from '../../utils/format'

// `kelas` & `aksi` dipakai saat halaman ini ditampilkan di portal guru & staf
export default function SiswaJadwal({ kelas: kelasProp, aksi }) {
  const { user } = useAuth()
  const kelas = kelasProp ?? user.kelas
  const jadwal = JADWAL[kelas] ?? {}
  const hariIni = namaHari(todayKey())
  const [hariDipilih, setHariDipilih] = useState(HARI_SEKOLAH.includes(hariIni) ? hariIni : 'Senin')

  // Daftar mapel unik beserta gurunya
  const daftarMapel = [...new Set(Object.values(jadwal).flat())].filter((k) => MAPEL[k].absensi !== false)

  const sel = (kode) => (
    <div className={`rounded-xl px-3 py-2.5 ${MAPEL[kode].warna}`}>
      <p className="text-sm font-bold">{MAPEL[kode].nama}</p>
      <p className="mt-0.5 text-xs opacity-80">{MAPEL[kode].guru}</p>
    </div>
  )

  return (
    <>
      <DashHeader title="Jadwal Pelajaran" desc={`Kelas ${kelas} · Semester Ganjil 2026/2027`} action={aksi} />
      <JamSekolah className="mb-6" untukGuru={!!kelasProp} />

      {/* Tampilan HP: pilih hari */}
      <div className="lg:hidden">
        <div className="mb-4 grid grid-cols-5 gap-1.5 rounded-2xl bg-slate-100 p-1.5">
          {HARI_SEKOLAH.map((h) => (
            <button
              key={h}
              onClick={() => setHariDipilih(h)}
              className={`rounded-xl py-2 text-sm font-bold transition ${
                hariDipilih === h ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              {h.slice(0, 3)}
            </button>
          ))}
        </div>
        <Card className="p-4">
          <ol className="space-y-2">
            {(jadwal[hariDipilih] ?? []).map((kode, i) => (
              <li key={kode + i}>
                <div className="flex items-center gap-3">
                  <span className="w-14 shrink-0 text-xs font-semibold text-slate-500">
                    {SESI[i].mulai}
                    <br />
                    {SESI[i].selesai}
                  </span>
                  <div className="flex-1">{sel(kode)}</div>
                </div>
                {i + 1 === ISTIRAHAT.setelahSesi && (
                  <p className="my-2 flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-2 text-xs text-slate-500">
                    <Coffee className="h-3.5 w-3.5" /> Istirahat {ISTIRAHAT.mulai} – {ISTIRAHAT.selesai}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* Tampilan desktop: tabel mingguan */}
      <Card className="hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-separate border-spacing-2 p-2">
            <thead>
              <tr>
                <th className="w-28 text-left text-xs font-bold uppercase text-slate-400">Jam</th>
                {HARI_SEKOLAH.map((h) => (
                  <th
                    key={h}
                    className={`rounded-xl py-2.5 text-sm font-bold ${h === hariIni ? 'bg-primary-600 text-white' : 'bg-slate-50 text-slate-700'}`}
                  >
                    {h}
                    {h === hariIni && <span className="ml-1 text-xs font-medium opacity-80">(hari ini)</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SESI.map((s, i) => (
                <Fragment key={s.mulai}>
                  <tr>
                    <td className="align-middle text-sm font-semibold text-slate-500">
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
                      <td className="text-sm font-semibold text-slate-400">
                        {ISTIRAHAT.mulai} – {ISTIRAHAT.selesai}
                      </td>
                      <td colSpan={HARI_SEKOLAH.length}>
                        <p className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-2 text-sm text-slate-500">
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
        <h2 className="font-bold text-slate-900">Mata Pelajaran & Guru Pengajar</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {daftarMapel.map((k) => (
            <div key={k} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${MAPEL[k].warna}`}>
                {MAPEL[k].nama.slice(0, 2)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">{MAPEL[k].nama}</p>
                <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                  <User className="h-3 w-3" /> {MAPEL[k].guru}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
