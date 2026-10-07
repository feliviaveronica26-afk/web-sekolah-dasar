import { useState } from 'react'
import { Check, Clock3, Lock, Plus, UserRound } from 'lucide-react'
import { Ikon } from '../../components/Ikon'
import { Alert, Badge, Card, DashHeader, EmptyState } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { EKSKUL, HARI_SEKOLAH, MAKS_EKSKUL } from '../../data/dummy'
import { bolehIkutEkskul } from '../../utils/prestasi'

export default function SiswaEkskul() {
  const { user } = useAuth()
  const { data, toggleEkskul } = useData()
  const [pesan, setPesan] = useState('')
  const siswa = data.siswa.find((s) => s.nis === user.nis)
  if (!siswa) return <EmptyState title="Data siswa tidak ditemukan" />

  const pilihan = data.ekskul[siswa.nis] ?? []
  const diikuti = EKSKUL.filter((e) => (e.wajib && bolehIkutEkskul(e, siswa.kelas)) || pilihan.includes(e.id))

  const ubah = (e) => {
    if (pilihan.includes(e.id)) {
      toggleEkskul(siswa.nis, e.id)
      setPesan(`Kamu keluar dari ${e.nama}.`)
    } else if (pilihan.length >= MAKS_EKSKUL) {
      setPesan(`Kamu sudah memilih ${MAKS_EKSKUL} ekskul. Keluar dari salah satu dulu ya.`)
    } else {
      toggleEkskul(siswa.nis, e.id)
      setPesan(`Yeay! Kamu bergabung dengan ${e.nama}. Sampai jumpa hari ${e.hari}! 🎉`)
    }
  }

  // Jadwal mingguan ekskul yang diikuti
  const perHari = HARI_SEKOLAH.map((h) => ({ hari: h, daftar: diikuti.filter((e) => e.hari.includes(h)) }))

  return (
    <>
      <DashHeader title="Ekstrakurikuler" desc={`Pilih maksimal ${MAKS_EKSKUL} ekskul sesuai minatmu. Pramuka wajib untuk kelas 3 – 6.`} />

      {pesan && (
        <div className="mb-5">
          <Alert tone={pesan.startsWith('Kamu sudah') ? 'warning' : 'success'}>{pesan}</Alert>
        </div>
      )}

      <Card className="mb-6 p-5">
        <p className="mb-3 text-sm font-bold text-slate-700">
          Jadwal ekskulku minggu ini · {pilihan.length}/{MAKS_EKSKUL} pilihan
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {perHari.map(({ hari, daftar }) => (
            <div key={hari} className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{hari}</p>
              {daftar.length === 0 ? (
                <p className="mt-1 text-sm text-slate-400">–</p>
              ) : (
                daftar.map((e) => (
                  <p key={e.id} className={`mt-1.5 rounded-lg px-2 py-1 text-xs font-bold ${e.warna}`}>
                    {e.nama}
                    <span className="block font-medium opacity-80">{e.jam}</span>
                  </p>
                ))
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {EKSKUL.map((e) => {
          const boleh = bolehIkutEkskul(e, siswa.kelas)
          const ikut = (e.wajib && boleh) || pilihan.includes(e.id)
          return (
            <Card key={e.id} className={`flex flex-col p-5 transition ${ikut ? 'ring-2 ring-emerald-400' : ''} ${boleh ? '' : 'opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <span className={`grid h-14 w-14 place-items-center rounded-2xl ${e.warna}`}>
                  <Ikon nama={e.ikon} className="h-7 w-7" />
                </span>
                {ikut && <Badge className="bg-emerald-100 text-emerald-700">✓ Diikuti</Badge>}
                {e.wajib && boleh && <Badge className="bg-primary-100 text-primary-700">Wajib</Badge>}
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">{e.nama}</h2>
              <p className="mt-1 flex-1 text-sm text-slate-600">{e.desc}</p>
              <div className="mt-4 space-y-1 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-slate-400" /> {e.hari}, {e.jam}
                </p>
                <p className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-slate-400" /> {e.pembina}
                </p>
              </div>
              {!boleh ? (
                <p className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-500">
                  <Lock className="h-4 w-4" /> Untuk {e.untuk.toLowerCase()}
                </p>
              ) : e.wajib ? (
                <p className="mt-4 rounded-xl bg-primary-50 py-2.5 text-center text-sm font-semibold text-primary-700">Diikuti semua siswa kelas {e.minKelas} – 6</p>
              ) : (
                <button
                  onClick={() => ubah(e)}
                  className={`mt-4 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition ${
                    ikut ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700' : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {ikut ? (
                    <>
                      <Check className="h-4 w-4" /> Sudah ikut · Keluar
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Ikut ekskul ini
                    </>
                  )}
                </button>
              )}
            </Card>
          )
        })}
      </div>
    </>
  )
}
