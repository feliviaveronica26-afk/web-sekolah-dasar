import { Clock3, Info, MessageCircle, UserX } from 'lucide-react'
import Percakapan from '../../components/Percakapan'
import { Avatar, Card, DashHeader, EmptyState } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { SEKOLAH } from '../../data/dummy'

export default function OrtuPesan() {
  const { user } = useAuth()
  const { data } = useData()
  const anak = data.siswa.find((s) => s.nis === user.anakNis)
  if (!anak) return <EmptyState icon={UserX} title="Data anak tidak ditemukan" desc="Silakan hubungi admin sekolah." />
  const wali = data.guru.find((g) => g.peran?.includes('wali_kelas') && g.kelas === anak.kelas)

  return (
    <>
      <DashHeader title="Pesan Wali Kelas" desc="Berkomunikasi langsung dengan wali kelas tanpa perlu bertukar nomor pribadi." />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <Avatar nama={wali?.nama ?? 'Wali Kelas'} />
            <div>
              <p className="font-bold text-slate-900">{wali?.nama ?? 'Wali Kelas'}</p>
              <p className="text-xs text-slate-500">
                Wali Kelas {anak.kelas} · tentang {anak.nama}
              </p>
            </div>
          </div>
          <Percakapan nis={anak.nis} pihak="ortu" namaPengirim={user.nama} namaLawan={wali?.nama.split(',')[0] ?? 'wali kelas'} />
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <p className="flex items-center gap-2 font-bold text-slate-900">
              <Clock3 className="h-4 w-4 text-primary-600" /> Waktu balasan
            </p>
            <p className="mt-2 text-sm text-slate-600">Wali kelas membalas pada jam kerja, Senin – Jumat pukul 07.00 – 15.00.</p>
          </Card>
          <Card className="p-5">
            <p className="flex items-center gap-2 font-bold text-slate-900">
              <Info className="h-4 w-4 text-primary-600" /> Tips
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
              <li>• Untuk izin sakit/tidak masuk, gunakan menu Izin agar tercatat di absensi.</li>
              <li>• Pertanyaan pembayaran SPP dapat ditujukan ke Tata Usaha.</li>
              <li>• Hal mendesak? Hubungi sekolah di {SEKOLAH.telepon}.</li>
            </ul>
          </Card>
          <Card className="flex items-center gap-3 bg-emerald-50 p-5 ring-1 ring-emerald-100">
            <MessageCircle className="h-8 w-8 shrink-0 text-emerald-600" />
            <p className="text-sm text-emerald-800">Pesan bersifat pribadi antara Bapak/Ibu dan wali kelas.</p>
          </Card>
        </div>
      </div>
    </>
  )
}
