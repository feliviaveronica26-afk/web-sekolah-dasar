import { useState } from 'react'
import { ArrowLeft, MessagesSquare, Search } from 'lucide-react'
import Percakapan from '../../components/Percakapan'
import { Avatar, Card, DashHeader, EmptyState, inputCls } from '../../components/ui'
import { useAkses } from '../../context/akses'
import { useData } from '../../context/DataContext'
import { formatTanggal, todayKey } from '../../utils/format'

const waktuSingkat = (iso) => {
  const d = new Date(iso)
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return key === todayKey() ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.') : formatTanggal(key, { year: undefined })
}

// Kotak masuk wali kelas: satu percakapan per siswa
export default function PesanOrtu() {
  const { data } = useData()
  const akses = useAkses()
  const [cari, setCari] = useState('')
  const siswaKelas = data.siswa.filter((s) => s.kelas === akses.kelas)

  const daftar = siswaKelas
    .map((s) => {
      const pesan = data.pesan.filter((p) => p.nis === s.nis).sort((a, b) => b.waktu.localeCompare(a.waktu))
      return { s, terakhir: pesan[0], belum: pesan.filter((p) => !p.dibacaGuru).length }
    })
    .filter(({ s }) => !cari.trim() || `${s.nama} ${s.ortu}`.toLowerCase().includes(cari.trim().toLowerCase()))
    .sort((a, b) => b.belum - a.belum || (b.terakhir?.waktu ?? '').localeCompare(a.terakhir?.waktu ?? '') || a.s.nama.localeCompare(b.s.nama))

  const [nisAktif, setNisAktif] = useState(null)
  const aktif = siswaKelas.find((s) => s.nis === nisAktif)

  if (!akses.kelas) return <EmptyState icon={MessagesSquare} title="Khusus wali kelas" desc="Menu ini tersedia untuk wali kelas." />

  return (
    <>
      <DashHeader title="Pesan Orang Tua" desc={`Percakapan dengan orang tua siswa kelas ${akses.kelas}. Pesan baru ditandai dan muncul di notifikasi.`} />
      <Card className="grid overflow-hidden lg:grid-cols-[320px_1fr]">
        {/* Daftar percakapan */}
        <div className={`border-slate-100 lg:border-r ${aktif ? 'hidden lg:block' : ''}`}>
          <div className="border-b border-slate-100 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari siswa / orang tua..." className={`${inputCls} pl-10`} />
            </div>
          </div>
          <ul className="max-h-[32rem] divide-y divide-slate-50 overflow-y-auto">
            {daftar.map(({ s, terakhir, belum }) => (
              <li key={s.nis}>
                <button
                  onClick={() => setNisAktif(s.nis)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${nisAktif === s.nis ? 'bg-primary-50' : ''}`}
                >
                  <Avatar nama={s.ortu ?? s.nama} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`truncate text-sm ${belum ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>Ortu {s.nama.split(' ')[0]}</span>
                      {terakhir && <span className="shrink-0 text-[11px] text-slate-400">{waktuSingkat(terakhir.waktu)}</span>}
                    </span>
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-slate-500">{terakhir ? terakhir.isi : `${s.ortu} · belum ada pesan`}</span>
                      {belum > 0 && <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary-600 px-1.5 text-[10px] font-bold text-white">{belum}</span>}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Isi percakapan */}
        <div className={aktif ? '' : 'hidden lg:block'}>
          {aktif ? (
            <>
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                <button onClick={() => setNisAktif(null)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Kembali">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar nama={aktif.ortu ?? aktif.nama} size="sm" />
                <div>
                  <p className="font-bold text-slate-900">Orang tua {aktif.nama}</p>
                  <p className="text-xs text-slate-500">
                    {aktif.ortu} · Kelas {aktif.kelas}
                  </p>
                </div>
              </div>
              <Percakapan nis={aktif.nis} pihak="guru" namaPengirim={akses.nama} namaLawan={`orang tua ${aktif.nama.split(' ')[0]}`} />
            </>
          ) : (
            <div className="grid h-full min-h-[32rem] place-items-center">
              <EmptyState icon={MessagesSquare} title="Pilih percakapan" desc="Pilih orang tua siswa di sebelah kiri untuk membaca dan membalas pesan." />
            </div>
          )}
        </div>
      </Card>
    </>
  )
}
