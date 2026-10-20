import { Fragment, useState } from 'react'
import { AlertTriangle, Coffee, Pencil, Save, X } from 'lucide-react'
import SiswaJadwal from '../siswa/SiswaJadwal'
import { Alert, Card, DashHeader, btn, inputCls } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { HARI_SEKOLAH, ISTIRAHAT, KELAS, MAPEL, SESI } from '../../data/dummy'
import { mapelDiampu, namaPengampu } from '../../utils/jadwal'

// Mapel yang boleh masuk jadwal kelas (sama dengan Referensi::mapelJadwal di Laravel): IPAS & Informatika mulai kelas 3
const mapelUntuk = (kelas) => Object.keys(MAPEL).filter((m) => Number(kelas[0]) >= 3 || !['ipas', 'info'].includes(m))

const salinJadwal = (jadwal) => Object.fromEntries(HARI_SEKOLAH.map((h) => [h, SESI.map((_, i) => jadwal?.[h]?.[i] ?? null)]))

/*
  Guru mapel yang sama sudah mengajar kelas lain di jam itu? (sama dengan JadwalController::periksaBentrok)
  Kegiatan bersama (upacara, senam, pramuka) dan mapel wali kelas tidak dihitung.
*/
function cariBentrok(data, kelas, hari, jam, mapel) {
  if (!mapel || MAPEL[mapel]?.absensi === false) return null
  const pengampu = data.guru.find((g) => mapelDiampu(g).includes(mapel))
  if (!pengampu) return null
  const diampu = mapelDiampu(pengampu)
  for (const [k, perHari] of Object.entries(data.jadwal ?? {})) {
    const lain = perHari[hari]?.[jam]
    if (k !== kelas && lain && diampu.includes(lain)) return { kelas: k, guru: pengampu.nama.split(',')[0], mapel: lain }
  }
  return null
}

function PilihKelas({ kelas, onChange, disabled }) {
  return (
    <select value={kelas} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={`${inputCls} w-sm-44`} aria-label="Pilih kelas">
      {[...new Set(KELAS.map((k) => k[0]))].map((t) => (
        <optgroup key={t} label={`Kelas ${t}`}>
          {KELAS.filter((k) => k[0] === t).map((k) => (
            <option key={k} value={k}>
              Kelas {k}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

// Jadwal pelajaran per kelas (1A–6C). Menu ini milik Wakasek Kurikulum & Kepala Sekolah, yang juga bisa mengubahnya.
export default function JadwalKelas() {
  const { data, simpanJadwal, beritahu } = useData()
  const [kelas, setKelas] = useState(KELAS[0])
  const [draf, setDraf] = useState(null) // null = melihat; { hari: [kode mapel | null] } = sedang mengubah
  const [galat, setGalat] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)

  if (!draf) {
    return (
      <SiswaJadwal
        kelas={kelas}
        aksi={
          <div className="d-flex flex-column gap-2 flex-sm-row">
            <PilihKelas kelas={kelas} onChange={setKelas} />
            <button
              onClick={() => {
                setGalat('')
                setDraf(salinJadwal(data.jadwal?.[kelas]))
              }}
              className={btn.primary}
            >
              <Pencil className="h-4 w-4" /> Ubah Jadwal
            </button>
          </div>
        }
      />
    )
  }

  const asli = salinJadwal(data.jadwal?.[kelas])
  const pilihan = mapelUntuk(kelas)
  const kegiatan = pilihan.filter((m) => MAPEL[m].absensi === false)
  const pelajaran = pilihan.filter((m) => MAPEL[m].absensi !== false)
  const bentrok = HARI_SEKOLAH.flatMap((h) => SESI.map((_, i) => ({ h, i, b: cariBentrok(data, kelas, h, i, draf[h][i]) }))).filter((x) => x.b)
  const berubah = HARI_SEKOLAH.some((h) => draf[h].some((m, i) => m !== asli[h][i]))
  const atur = (h, i, m) => setDraf({ ...draf, [h]: draf[h].map((x, j) => (j === i ? m || null : x)) })

  const simpan = async () => {
    if (menyimpan) return
    setMenyimpan(true)
    setGalat('')
    const pesan = await simpanJadwal(kelas, draf)
    setMenyimpan(false)
    if (pesan) return setGalat(pesan)
    setDraf(null)
    beritahu(`Jadwal kelas ${kelas} disimpan. Semua portal langsung memakai jadwal baru.`)
  }

  return (
    <>
      <DashHeader
        title={`Ubah Jadwal Kelas ${kelas}`}
        desc="Pilih mata pelajaran untuk setiap jam. Presensi per pelajaran, jadwal siswa, dan grup chat kelas mengikuti jadwal ini."
        action={
          <div className="d-flex flex-column-reverse gap-2 flex-sm-row">
            <button onClick={() => setDraf(null)} className={btn.secondary}>
              <X className="h-4 w-4" /> Batal
            </button>
            <button onClick={simpan} disabled={menyimpan || !berubah} className={`${btn.primary} `}>
              <Save className="h-4 w-4" /> {menyimpan ? 'Menyimpan…' : 'Simpan Jadwal'}
            </button>
          </div>
        }
      />

      {galat && (
        <div className="mb-4">
          <Alert tone="error">{galat}</Alert>
        </div>
      )}
      {bentrok.length > 0 && (
        <p className="mb-4 d-flex align-items-start gap-2 rounded-2 border border-warning-subtle bg-warning-subtle px-4 py-3 fs-sm text-warning-emphasis">
          <AlertTriangle className="mt-0-5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>
            {bentrok.length} jam bentrok dengan kelas lain (guru mapel yang sama mengajar di jam itu). Bentrok pada jam yang Anda ubah akan ditolak
            saat disimpan; bentrok lama ditandai agar bisa dibereskan.
          </span>
        </p>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-100 min-w-760 tabel-jadwal p-2">
            <thead>
              <tr>
                <th className="w-28 text-start fs-xs fw-bold text-uppercase text-abu-400">Jam</th>
                {HARI_SEKOLAH.map((h) => (
                  <th key={h} className="rounded-2 bg-abu-50 py-2-5 fs-sm fw-bold text-tinta-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SESI.map((s, i) => (
                <Fragment key={s.mulai}>
                  <tr>
                    <td className="align-top pt-3 fs-sm fw-semibold text-tinta-3">
                      Jam ke-{i + 1}
                      <span className="d-block fs-xs fw-normal">
                        {s.mulai} – {s.selesai}
                      </span>
                    </td>
                    {HARI_SEKOLAH.map((h) => {
                      const m = draf[h][i]
                      const b = cariBentrok(data, kelas, h, i, m)
                      const diubah = m !== asli[h][i]
                      return (
                        <td key={h} className="align-top">
                          <select
                            value={m ?? ''}
                            onChange={(e) => atur(h, i, e.target.value)}
                            aria-label={`${h} jam ke-${i + 1}`}
                            className={`${inputCls} px-2 fs-sm ${m ? MAPEL[m]?.warna : ''} ${diubah ? 'border border-2 border-info' : ''} ${b ? 'border-warning' : ''}`}
                          >
                            <option value="">— Kosong —</option>
                            <optgroup label="Mata pelajaran">
                              {pelajaran.map((k) => (
                                <option key={k} value={k}>
                                  {MAPEL[k].nama}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Kegiatan bersama">
                              {kegiatan.map((k) => (
                                <option key={k} value={k}>
                                  {MAPEL[k].nama}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                          <p className="mt-1 text-truncate px-1 fs-2xs text-tinta-3">{m ? namaPengampu(data.guru, kelas, m) : ' '}</p>
                          {b && (
                            <p className="mt-0-5 d-flex align-items-start gap-1 px-1 fs-2xs fw-semibold lh-tight text-warning-emphasis">
                              <AlertTriangle className="mt-px h-3 w-3 flex-shrink-0" aria-hidden="true" /> {b.guru} juga di {b.kelas}
                            </p>
                          )}
                        </td>
                      )
                    })}
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
      <p className="mt-3 fs-xs text-tinta-3">Kotak bergaris biru = jam yang Anda ubah. Pengampu mengikuti mapel yang diampu di Data Guru & Staf.</p>
    </>
  )
}
