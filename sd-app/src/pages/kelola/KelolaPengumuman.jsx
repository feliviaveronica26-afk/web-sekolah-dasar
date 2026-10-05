import CrudPage from '../../components/CrudPage'
import { KategoriBadge } from '../../components/ui'
import { KATEGORI_PENGUMUMAN } from '../../data/dummy'
import { formatTanggal, todayKey } from '../../utils/format'

export default function KelolaPengumuman() {
  return (
    <CrudPage
      title="Pengumuman & Berita"
      desc="Pengumuman tampil di halaman Berita pada website dan di portal orang tua."
      koleksi="pengumuman"
      itemLabel="Pengumuman"
      searchKeys={['judul', 'isi']}
      filter={{ key: 'kategori', label: 'Kategori', options: KATEGORI_PENGUMUMAN }}
      urutkan={(a, b) => b.tanggal.localeCompare(a.tanggal)}
      kosong={{ judul: '', kategori: '', tanggal: todayKey(), isi: '' }}
      fields={[
        { name: 'judul', label: 'Judul', required: true, full: true },
        { name: 'kategori', label: 'Kategori', type: 'select', options: KATEGORI_PENGUMUMAN, required: true },
        { name: 'tanggal', label: 'Tanggal', type: 'date', required: true },
        { name: 'isi', label: 'Isi Pengumuman', type: 'textarea', required: true },
      ]}
      columns={[
        { key: 'judul', label: 'Judul', render: (p) => <span className="font-semibold text-slate-800">{p.judul}</span> },
        { key: 'kategori', label: 'Kategori', render: (p) => <KategoriBadge kategori={p.kategori} /> },
        { key: 'tanggal', label: 'Tanggal', render: (p) => formatTanggal(p.tanggal) },
      ]}
    />
  )
}
