import { useState } from 'react'
import { CalendarCheck, CalendarClock, Check, MessageCircle, Users, X } from 'lucide-react'
import { STATUS_KUNJUNGAN } from '../../components/Fasilitas'
import { Badge, Card, DashHeader, EmptyState, StatCard, btn, inputCls } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { FASILITAS } from '../../data/dummy'
import { formatHari, tambahHari, todayKey } from '../../utils/format'

const TAB = {
  Menunggu: (k) => k.status === 'Menunggu',
  Dikonfirmasi: (k) => k.status === 'Dikonfirmasi',
  Riwayat: (k) => k.status === 'Selesai' || k.status === 'Ditolak',
}

// 0812-3456-7890 → 6281234567890 untuk tautan wa.me
const nomorWa = (no) => no.replace(/\D/g, '').replace(/^0/, '62')

export default function KelolaKunjungan() {
  const { data, ubah } = useData()
  const [tab, setTab] = useState('Menunggu')
  const [catatan, setCatatan] = useState({})

  const hariIni = todayKey()
  const sepekan = tambahHari(hariIni, 7)
  const daftar = data.kunjungan
    .filter(TAB[tab])
    .sort((a, b) => (tab === 'Riwayat' ? b.tanggal.localeCompare(a.tanggal) : a.tanggal.localeCompare(b.tanggal)) || a.sesi.localeCompare(b.sesi))
  const aktif = data.kunjungan.filter((k) => k.status === 'Dikonfirmasi')

  const proses = (k, status) => {
    ubah('kunjungan', k.id, { status, catatanTu: catatan[k.id]?.trim() || k.catatanTu || '' })
    setCatatan({ ...catatan, [k.id]: '' })
  }

  return (
    <>
      <DashHeader title="Kunjungan Sekolah" desc="Permintaan kunjungan dari calon orang tua murid dan tamu sekolah." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={CalendarClock} label="Menunggu konfirmasi" value={data.kunjungan.filter(TAB.Menunggu).length} tone="amber" />
        <StatCard icon={CalendarCheck} label="Kunjungan hari ini" value={aktif.filter((k) => k.tanggal === hariIni).length} tone="emerald" />
        <StatCard icon={CalendarCheck} label="7 hari ke depan" value={aktif.filter((k) => k.tanggal >= hariIni && k.tanggal <= sepekan).length} tone="sky" />
        <StatCard icon={Users} label="Total tamu terjadwal" value={aktif.reduce((acc, k) => acc + k.jumlah, 0)} hint="orang" tone="primary" />
      </div>

      <div className="my-5 inline-flex rounded-xl bg-slate-100 p-1">
        {Object.keys(TAB).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            {t} <span className="ml-1 text-xs text-slate-400">({data.kunjungan.filter(TAB[t]).length})</span>
          </button>
        ))}
      </div>

      {daftar.length === 0 ? (
        <Card>
          <EmptyState icon={CalendarClock} title="Tidak ada data" desc="Belum ada kunjungan pada kategori ini." />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {daftar.map((k) => (
            <Card key={k.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">{k.nama}</p>
                  <p className="text-sm text-slate-500">
                    {k.keperluan} · {k.jumlah} orang
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={STATUS_KUNJUNGAN[k.status]}>{k.status}</Badge>
                  <p className="mt-1 font-mono text-xs text-slate-400">{k.kode}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
                <p className="font-semibold text-slate-800">{formatHari(k.tanggal)}</p>
                <p className="text-sm text-slate-600">Pukul {k.sesi} WIB</p>
              </div>

              {k.fasilitas.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {k.fasilitas.map((id) => (
                    <Badge key={id} className="bg-primary-50 text-primary-700">
                      {FASILITAS.find((f) => f.id === id)?.nama ?? id}
                    </Badge>
                  ))}
                </div>
              )}
              {k.catatan && <p className="mt-3 text-sm text-slate-600">“{k.catatan}”</p>}
              {k.catatanTu && <p className="mt-2 text-sm text-slate-500">Catatan TU: {k.catatanTu}</p>}

              <a
                href={`https://wa.me/${nomorWa(k.whatsapp)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                <MessageCircle className="h-4 w-4" /> {k.whatsapp}
              </a>

              {(k.status === 'Menunggu' || k.status === 'Dikonfirmasi') && (
                <>
                  <input
                    value={catatan[k.id] ?? ''}
                    onChange={(e) => setCatatan({ ...catatan, [k.id]: e.target.value })}
                    placeholder="Catatan untuk pengunjung (opsional)"
                    className={`${inputCls} mt-4`}
                  />
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button onClick={() => proses(k, 'Ditolak')} className={btn.danger}>
                      <X className="h-4 w-4" /> {k.status === 'Menunggu' ? 'Tolak' : 'Batalkan'}
                    </button>
                    {k.status === 'Menunggu' ? (
                      <button onClick={() => proses(k, 'Dikonfirmasi')} className={btn.primary}>
                        <Check className="h-4 w-4" /> Konfirmasi
                      </button>
                    ) : (
                      <button onClick={() => proses(k, 'Selesai')} className={btn.primary}>
                        <Check className="h-4 w-4" /> Tandai Selesai
                      </button>
                    )}
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
