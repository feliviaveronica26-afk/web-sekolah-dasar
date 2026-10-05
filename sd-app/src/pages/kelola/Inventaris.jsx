import { Boxes, PackageCheck, PackageX, Wrench } from 'lucide-react'
import CrudPage from '../../components/CrudPage'
import { Badge, StatCard } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { KATEGORI_BARANG, KONDISI_BARANG, LOKASI_SEKOLAH } from '../../data/dummy'

export const WARNA_KONDISI = {
  Baik: 'bg-emerald-100 text-emerald-700',
  'Rusak Ringan': 'bg-amber-100 text-amber-700',
  'Rusak Berat': 'bg-rose-100 text-rose-700',
}

export default function Inventaris() {
  const { data } = useData()
  const total = data.inventaris.reduce((acc, b) => acc + Number(b.jumlah || 0), 0)
  const jenis = (kondisi) => data.inventaris.filter((b) => b.kondisi === kondisi).length

  return (
    <CrudPage
      title="Inventaris Sarana & Prasarana"
      desc="Daftar barang milik sekolah beserta lokasi dan kondisinya."
      ringkasan={
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Boxes} label="Jenis barang" value={data.inventaris.length} tone="sky" />
          <StatCard icon={PackageCheck} label="Total unit" value={total.toLocaleString('id-ID')} tone="emerald" />
          <StatCard icon={Wrench} label="Rusak ringan" value={jenis('Rusak Ringan')} hint="jenis barang" tone="amber" />
          <StatCard icon={PackageX} label="Rusak berat" value={jenis('Rusak Berat')} hint="jenis barang" tone="primary" />
        </div>
      }
      koleksi="inventaris"
      itemLabel="Barang"
      searchKeys={['nama', 'kategori', 'lokasi', 'keterangan']}
      filter={{ key: 'kondisi', label: 'Kondisi', options: KONDISI_BARANG }}
      kosong={{ nama: '', kategori: '', lokasi: '', jumlah: 1, kondisi: 'Baik', keterangan: '' }}
      // Barang rusak berat di atas agar segera ditindaklanjuti
      urutkan={(a, b) => KONDISI_BARANG.indexOf(b.kondisi) - KONDISI_BARANG.indexOf(a.kondisi) || a.nama.localeCompare(b.nama)}
      fields={[
        { name: 'nama', label: 'Nama Barang', required: true, full: true, placeholder: 'Contoh: Proyektor LCD' },
        { name: 'kategori', label: 'Kategori', type: 'select', options: KATEGORI_BARANG, required: true },
        { name: 'lokasi', label: 'Lokasi', type: 'select', options: LOKASI_SEKOLAH, required: true },
        { name: 'jumlah', label: 'Jumlah (unit)', type: 'number', required: true },
        { name: 'kondisi', label: 'Kondisi', type: 'select', options: KONDISI_BARANG, required: true },
        { name: 'keterangan', label: 'Keterangan', type: 'textarea', placeholder: 'Contoh: 1 unit lampunya redup' },
      ]}
      columns={[
        {
          key: 'nama',
          label: 'Barang',
          render: (b) => (
            <span>
              <span className="block font-semibold text-slate-800">{b.nama}</span>
              <span className="block text-xs text-slate-500">{b.kategori}</span>
            </span>
          ),
        },
        { key: 'lokasi', label: 'Lokasi' },
        { key: 'jumlah', label: 'Jumlah', render: (b) => `${Number(b.jumlah).toLocaleString('id-ID')} unit` },
        { key: 'kondisi', label: 'Kondisi', render: (b) => <Badge className={WARNA_KONDISI[b.kondisi]}>{b.kondisi}</Badge> },
        { key: 'keterangan', label: 'Keterangan', render: (b) => <span className="text-slate-500">{b.keterangan || '–'}</span> },
      ]}
    />
  )
}
