import { useState } from 'react'
import { CalendarX2, Check, Clock3, Lock, Plus, UserRound } from 'lucide-react'
import { Ikon } from '../../components/Ikon'
import { Badge, Card, DashHeader, EmptyState } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { EKSKUL, HARI_SEKOLAH } from '../../data/dummy'
import { ekskulBentrok } from '../../utils/ekskul'
import { bolehIkutEkskul } from '../../utils/prestasi'

export default function SiswaEkskul() {
  const { user } = useAuth()
  const { data, toggleEkskul } = useData()
  // Pesan ditampilkan di kartu ekskul yang baru diklik, agar langsung terlihat
  const [pesan, setPesan] = useState(null) // { id, gabung, teks, galat? }
  const [sibuk, setSibuk] = useState(null) // id ekskul yang sedang disimpan
  const siswa = data.siswa.find((s) => s.nis === user.nis)
  if (!siswa) return <EmptyState title="Data siswa tidak ditemukan" />

  const pilihan = data.ekskul[siswa.nis] ?? []
  const diikuti = EKSKUL.filter((e) => (e.wajib && bolehIkutEkskul(e, siswa.kelas)) || pilihan.includes(e.id))

  const ubah = async (e) => {
    if (sibuk) return
    const keluar = pilihan.includes(e.id)
    setSibuk(e.id)
    const galat = await toggleEkskul(e.id)
    setSibuk(null)
    if (galat) return setPesan({ id: e.id, galat: true, teks: galat })
    setPesan({ id: e.id, gabung: !keluar, teks: keluar ? `Kamu keluar dari ${e.nama}.` : `Yeay! Kamu bergabung dengan ${e.nama}. Sampai jumpa hari ${e.hari}! 🎉` })
  }

  // Jadwal mingguan ekskul yang diikuti
  const perHari = HARI_SEKOLAH.map((h) => ({ hari: h, daftar: diikuti.filter((e) => e.hari.includes(h)) }))

  return (
    <>
      <DashHeader title="Ekstrakurikuler" desc="Ikuti ekskul sebanyak yang kamu mau, asal jadwalnya tidak bentrok. Pramuka wajib untuk kelas 3 – 6." />

      <Card className="mb-6 p-5">
        <p className="mb-3 fs-sm fw-bold text-tinta-2">Jadwal ekskulku minggu ini · {diikuti.length} ekskul</p>
        <div className="d-grid kolom-2 gap-2 kolom-sm-5">
          {perHari.map(({ hari, daftar }) => (
            <div key={hari} className="rounded-2 bg-abu-50 p-3">
              <p className="fs-xs fw-bold text-uppercase ls-wider text-tinta-3">{hari}</p>
              {daftar.length === 0 ? (
                <p className="mt-1 fs-sm text-abu-400">–</p>
              ) : (
                daftar.map((e) => (
                  <p key={e.id} className={`mt-1-5 rounded-1 px-2 py-1 fs-xs fw-bold ${e.warna}`}>
                    {e.nama}
                    <span className="d-block fw-medium opacity-80">{e.jam}</span>
                  </p>
                ))
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="d-grid gap-5 kolom-sm-2 kolom-xl-3">
        {EKSKUL.map((e) => {
          const boleh = bolehIkutEkskul(e, siswa.kelas)
          const ikut = (e.wajib && boleh) || pilihan.includes(e.id)
          const bentrok = !ikut && boleh && !e.wajib ? ekskulBentrok(e, diikuti) : null
          return (
            <Card key={e.id} className={`d-flex flex-column p-5 transisi ${ikut ? 'border border-2 border-success' : ''} ${boleh ? '' : 'opacity-60'}`}>
              <div className="d-flex align-items-start justify-content-between gap-3">
                <span className={`d-flex h-14 w-14 align-items-center justify-content-center rounded-3 ${e.warna}`}>
                  <Ikon nama={e.ikon} className="h-7 w-7" />
                </span>
                {ikut && <Badge className="bg-success-subtle text-success">✓ Diikuti</Badge>}
                {e.wajib && boleh && <Badge className="bg-merah-100 text-merah-700">Wajib</Badge>}
              </div>
              <h2 className="mt-4 fs-xl fw-bold text-tinta">{e.nama}</h2>
              <p className="mt-1 flex-1 fs-sm text-tinta-2">{e.desc}</p>
              <div className="mt-4 antara-y-1 fs-sm text-tinta-2">
                <p className="d-flex align-items-center gap-2">
                  <Clock3 className="h-4 w-4 text-abu-400" /> {e.hari}, {e.jam}
                </p>
                <p className="d-flex align-items-center gap-2">
                  <UserRound className="h-4 w-4 text-abu-400" /> {e.pembina}
                </p>
              </div>
              {!boleh ? (
                <p className="mt-4 d-flex align-items-center justify-content-center gap-2 rounded-2 bg-abu-100 py-2-5 fs-sm fw-semibold text-tinta-3">
                  <Lock className="h-4 w-4" /> Untuk {e.untuk.toLowerCase()}
                </p>
              ) : e.wajib ? (
                <p className="mt-4 rounded-2 bg-merah-50 py-2-5 text-center fs-sm fw-semibold text-merah-700">Diikuti semua siswa kelas {e.minKelas} – 6</p>
              ) : bentrok ? (
                <p className="mt-4 rounded-2 bg-warning-subtle px-3 py-2-5 text-center fs-sm text-warning-emphasis">
                  <span className="d-block fw-semibold">
                    <CalendarX2 className="me-1-5 d-inline h-4 w-4 turun-3px" />
                    Jadwal bentrok dengan {bentrok.nama}
                  </span>
                  <span className="mt-0-5 d-block fs-xs">Keluar dari {bentrok.nama} dulu jika ingin ikut ekskul ini.</span>
                </p>
              ) : (
                <button
                  onClick={() => ubah(e)}
                  disabled={!!sibuk}
                  className={`mt-4 d-inline-flex align-items-center justify-content-center gap-2 rounded-2 py-2-5 fs-sm fw-bold transisi ${
                    ikut ? 'bg-abu-100 text-tinta-2 hover-latar-merah hover-teks-merah' : 'bg-primary text-white hover-latar-merah-tua'
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
              <p
                aria-live="polite"
                className={pesan?.id === e.id ? `mt-2 text-center fs-sm fw-semibold ${pesan.galat ? 'text-danger' : pesan.gabung ? 'text-success' : 'text-tinta-2'}` : 'visually-hidden'}
              >
                {pesan?.id === e.id ? pesan.teks : ''}
              </p>
            </Card>
          )
        })}
      </div>
    </>
  )
}
