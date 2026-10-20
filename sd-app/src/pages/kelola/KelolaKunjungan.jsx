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
  const { data, prosesKunjungan } = useData()
  const [tab, setTab] = useState('Menunggu')
  const [catatan, setCatatan] = useState({})

  const hariIni = todayKey()
  const sepekan = tambahHari(hariIni, 7)
  const daftar = data.kunjungan
    .filter(TAB[tab])
    .sort((a, b) => (tab === 'Riwayat' ? b.tanggal.localeCompare(a.tanggal) : a.tanggal.localeCompare(b.tanggal)) || a.sesi.localeCompare(b.sesi))
  const aktif = data.kunjungan.filter((k) => k.status === 'Dikonfirmasi')

  const proses = async (k, status) => {
    if (await prosesKunjungan(k.id, status, catatan[k.id]?.trim() || k.catatanTu || '')) return
    setCatatan({ ...catatan, [k.id]: '' })
  }

  return (
    <>
      <DashHeader title="Kunjungan Sekolah" desc="Permintaan kunjungan dari calon orang tua murid dan tamu sekolah." />

      <div className="d-grid kolom-2 gap-4 kolom-lg-4">
        <StatCard icon={CalendarClock} label="Menunggu konfirmasi" value={data.kunjungan.filter(TAB.Menunggu).length} tone="amber" />
        <StatCard icon={CalendarCheck} label="Kunjungan hari ini" value={aktif.filter((k) => k.tanggal === hariIni).length} tone="emerald" />
        <StatCard icon={CalendarCheck} label="7 hari ke depan" value={aktif.filter((k) => k.tanggal >= hariIni && k.tanggal <= sepekan).length} tone="sky" />
        <StatCard icon={Users} label="Total tamu terjadwal" value={aktif.reduce((acc, k) => acc + k.jumlah, 0)} hint="orang" tone="primary" />
      </div>

      <div className="my-5 d-inline-flex mw-100 overflow-x-auto rounded-2 bg-abu-100 p-1">
        {Object.keys(TAB).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-shrink-0 text-nowrap rounded-1 px-4 py-2 fs-sm fw-semibold transisi ${tab === t ? 'bg-white text-tinta shadow-sm' : 'text-tinta-3'}`}
          >
            {t} <span className="ms-1 fs-xs text-abu-400">({data.kunjungan.filter(TAB[t]).length})</span>
          </button>
        ))}
      </div>

      {daftar.length === 0 ? (
        <Card>
          <EmptyState icon={CalendarClock} title="Tidak ada data" desc="Belum ada kunjungan pada kategori ini." />
        </Card>
      ) : (
        <div className="d-grid gap-4 kolom-lg-2">
          {daftar.map((k) => (
            <Card key={k.id} className="p-5">
              <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
                <div>
                  <p className="fw-bold text-tinta">{k.nama}</p>
                  <p className="fs-sm text-tinta-3">
                    {k.keperluan} · {k.jumlah} orang
                  </p>
                </div>
                <div className="text-end">
                  <Badge className={STATUS_KUNJUNGAN[k.status]}>{k.status}</Badge>
                  <p className="mt-1 font-monospace fs-xs text-abu-400">{k.kode}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2 bg-abu-50 px-4 py-3">
                <p className="fw-semibold text-tinta">{formatHari(k.tanggal)}</p>
                <p className="fs-sm text-tinta-2">Pukul {k.sesi} WIB</p>
              </div>

              {k.fasilitas.length > 0 && (
                <div className="mt-3 d-flex flex-wrap gap-1-5">
                  {k.fasilitas.map((id) => (
                    <Badge key={id} className="bg-merah-50 text-merah-700">
                      {FASILITAS.find((f) => f.id === id)?.nama ?? id}
                    </Badge>
                  ))}
                </div>
              )}
              {k.catatan && <p className="mt-3 fs-sm text-tinta-2">“{k.catatan}”</p>}
              {k.catatanTu && <p className="mt-2 fs-sm text-tinta-3">Catatan TU: {k.catatanTu}</p>}

              <a
                href={`https://wa.me/${nomorWa(k.whatsapp)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 d-inline-flex align-items-center gap-1-5 fs-sm fw-semibold text-success"
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
                  <div className="mt-3 d-grid kolom-2 gap-2">
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
