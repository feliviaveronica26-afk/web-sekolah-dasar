import { CircleCheck, Hammer, TriangleAlert } from 'lucide-react'
import CrudPage from '../../components/CrudPage'
import { Badge, StatCard } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { LOKASI_SEKOLAH, STATUS_KERUSAKAN } from '../../data/dummy'
import { formatTanggal, todayKey } from '../../utils/format'

const PRIORITAS = ['Tinggi', 'Sedang', 'Rendah']

const WARNA_STATUS = {
  Dilaporkan: 'bg-amber-100 text-amber-700',
  Diperbaiki: 'bg-sky-100 text-sky-700',
  Selesai: 'bg-emerald-100 text-emerald-700',
}

const WARNA_PRIORITAS = {
  Tinggi: 'bg-rose-100 text-rose-700',
  Sedang: 'bg-amber-50 text-amber-700',
  Rendah: 'bg-slate-100 text-slate-600',
}

export default function LaporanKerusakan() {
  const { data } = useData()
  const hitung = (status) => data.kerusakan.filter((k) => k.status === status).length

  return (
    <CrudPage
      title="Laporan Kerusakan"
      desc="Catat kerusakan fasilitas sekolah dan pantau perbaikannya sampai selesai."
      ringkasan={
        <div className="mb-6 grid grid-cols-3 gap-4">
          <StatCard icon={TriangleAlert} label="Baru dilaporkan" value={hitung('Dilaporkan')} tone="amber" />
          <StatCard icon={Hammer} label="Sedang diperbaiki" value={hitung('Diperbaiki')} tone="sky" />
          <StatCard icon={CircleCheck} label="Selesai" value={hitung('Selesai')} tone="emerald" />
        </div>
      }
      koleksi="kerusakan"
      itemLabel="Laporan"
      searchKeys={['nama', 'lokasi', 'pelapor', 'keterangan']}
      filter={{ key: 'status', label: 'Status', options: STATUS_KERUSAKAN }}
      kosong={{ nama: '', lokasi: '', pelapor: '', tanggal: todayKey(), prioritas: 'Sedang', status: 'Dilaporkan', keterangan: '' }}
      // Yang belum selesai di atas, lalu prioritas tertinggi, lalu yang terbaru
      urutkan={(a, b) =>
        (a.status === 'Selesai') - (b.status === 'Selesai') ||
        PRIORITAS.indexOf(a.prioritas) - PRIORITAS.indexOf(b.prioritas) ||
        b.tanggal.localeCompare(a.tanggal)
      }
      fields={[
        { name: 'nama', label: 'Kerusakan', required: true, full: true, placeholder: 'Contoh: Keran wastafel bocor' },
        { name: 'lokasi', label: 'Lokasi', type: 'select', options: LOKASI_SEKOLAH, required: true },
        { name: 'pelapor', label: 'Dilaporkan oleh', required: true, placeholder: 'Nama pelapor' },
        { name: 'tanggal', label: 'Tanggal Lapor', type: 'date', required: true },
        { name: 'prioritas', label: 'Prioritas', type: 'select', options: PRIORITAS, required: true },
        { name: 'status', label: 'Status', type: 'select', options: STATUS_KERUSAKAN, required: true },
        { name: 'keterangan', label: 'Keterangan / Tindak Lanjut', type: 'textarea', placeholder: 'Contoh: Teknisi dijadwalkan datang hari Kamis' },
      ]}
      columns={[
        {
          key: 'nama',
          label: 'Kerusakan',
          render: (k) => (
            <span>
              <span className="block font-semibold text-slate-800">{k.nama}</span>
              <span className="block text-xs text-slate-500">
                {k.lokasi} · oleh {k.pelapor}
              </span>
            </span>
          ),
        },
        { key: 'tanggal', label: 'Tanggal', render: (k) => formatTanggal(k.tanggal) },
        { key: 'prioritas', label: 'Prioritas', render: (k) => <Badge className={WARNA_PRIORITAS[k.prioritas]}>{k.prioritas}</Badge> },
        { key: 'status', label: 'Status', render: (k) => <Badge className={WARNA_STATUS[k.status]}>{k.status}</Badge> },
        { key: 'keterangan', label: 'Tindak Lanjut', render: (k) => <span className="text-slate-500">{k.keterangan || '–'}</span> },
      ]}
    />
  )
}
