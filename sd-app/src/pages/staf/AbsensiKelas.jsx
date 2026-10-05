import { useState } from 'react'
import { CheckCheck, Save } from 'lucide-react'
import { Alert, Avatar, Card, DashHeader, STATUS_ABSEN, btn, inputCls } from '../../components/ui'
import { useAkses } from '../../context/akses'
import { useData } from '../../context/DataContext'
import { formatHari, isHariSekolah, parseKey, todayKey } from '../../utils/format'

export default function AbsensiKelas() {
  const { kelas } = useAkses()
  const { data, simpanAbsensi } = useData()
  const [tanggal, setTanggal] = useState(todayKey())
  const [draft, setDraft] = useState({})
  const [pesan, setPesan] = useState('')

  const siswaKelas = data.siswa.filter((s) => s.kelas === kelas).sort((a, b) => a.nama.localeCompare(b.nama))
  const status = { ...(data.absensi[tanggal] ?? {}), ...draft }
  const belumDiisi = siswaKelas.filter((s) => !status[s.nis]).length
  const adaPerubahan = Object.keys(draft).length > 0
  const hitung = Object.keys(STATUS_ABSEN).reduce(
    (acc, k) => ({ ...acc, [k]: siswaKelas.filter((s) => status[s.nis] === k).length }),
    {},
  )

  const gantiTanggal = (e) => {
    if (!e.target.value) return
    setTanggal(e.target.value)
    setDraft({})
    setPesan('')
  }

  const tandai = (nis, kode) => {
    setDraft({ ...draft, [nis]: kode })
    setPesan('')
  }

  const semuaHadir = () => {
    const baru = { ...draft }
    for (const s of siswaKelas) if (!status[s.nis]) baru[s.nis] = 'H'
    setDraft(baru)
    setPesan('')
  }

  const simpan = () => {
    simpanAbsensi(tanggal, draft)
    setDraft({})
    setPesan(`Absensi ${formatHari(tanggal)} berhasil disimpan.`)
  }

  return (
    <>
      <DashHeader title="Absensi Kelas" desc={`Kelas ${kelas} · ${siswaKelas.length} siswa`} />

      <Card className="mb-4 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label htmlFor="tanggal" className="mb-1.5 block text-sm font-medium text-slate-700">Tanggal</label>
            <input id="tanggal" type="date" value={tanggal} max={todayKey()} onChange={gantiTanggal} className={`${inputCls} sm:w-56`} />
            <p className="mt-1.5 text-sm text-slate-500">{formatHari(tanggal)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_ABSEN).map(([k, s]) => (
              <span key={k} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${s.cls}`}>
                {s.label}: {hitung[k]}
              </span>
            ))}
          </div>
        </div>
        {!isHariSekolah(parseKey(tanggal)) && (
          <div className="mt-4">
            <Alert tone="warning">Tanggal yang dipilih adalah hari libur (Sabtu/Minggu).</Alert>
          </div>
        )}
      </Card>

      {pesan && (
        <div className="mb-4">
          <Alert>{pesan}</Alert>
        </div>
      )}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <p className="text-sm text-slate-500">
            {belumDiisi > 0 ? (
              <>
                <span className="font-bold text-amber-600">{belumDiisi} siswa</span> belum diisi
              </>
            ) : (
              <span className="font-semibold text-emerald-600">Semua siswa sudah diisi ✓</span>
            )}
          </p>
          <button onClick={semuaHadir} disabled={belumDiisi === 0} className={btn.secondary}>
            <CheckCheck className="h-4 w-4" /> Tandai sisanya Hadir
          </button>
        </div>

        <ul className="divide-y divide-slate-100">
          {siswaKelas.map((s, i) => (
            <li key={s.nis} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3">
                <span className="w-6 text-sm text-slate-400">{i + 1}</span>
                <Avatar nama={s.nama} size="sm" />
                <div>
                  <p className="font-semibold text-slate-800">{s.nama}</p>
                  <p className="text-xs text-slate-500">NIS {s.nis}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5 sm:flex">
                {Object.entries(STATUS_ABSEN).map(([kode, info]) => (
                  <button
                    key={kode}
                    onClick={() => tandai(s.nis, kode)}
                    title={info.label}
                    className={`rounded-lg px-3 py-2 text-sm font-bold transition sm:w-16 ${
                      status[s.nis] === kode ? `${info.cls} ring-2 ring-current` : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span className="sm:hidden">{info.label}</span>
                    <span className="hidden sm:inline">{kode}</span>
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>

        <div className="sticky bottom-0 flex items-center justify-between gap-3 rounded-b-2xl border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
          <p className="text-xs text-slate-500">H = Hadir · S = Sakit · I = Izin · A = Alpa</p>
          <button onClick={simpan} disabled={!adaPerubahan} className={btn.primary}>
            <Save className="h-4 w-4" /> Simpan Absensi
          </button>
        </div>
      </Card>
    </>
  )
}
