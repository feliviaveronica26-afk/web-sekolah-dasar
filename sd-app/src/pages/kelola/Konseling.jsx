import { CircleCheck, Eye, HeartHandshake, Lock } from 'lucide-react'
import CrudPage from '../../components/CrudPage'
import { Avatar, Badge, StatCard } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { KATEGORI_KONSELING, LAYANAN_KONSELING, STATUS_KONSELING } from '../../data/dummy'
import { formatTanggal, todayKey } from '../../utils/format'

export const WARNA_KONSELING = {
  'Dalam Proses': 'bg-sky-100 text-sky-700',
  'Perlu Pemantauan': 'bg-amber-100 text-amber-700',
  Selesai: 'bg-emerald-100 text-emerald-700',
}

export default function Konseling() {
  const { data } = useData()
  const hitung = (status) => data.konseling.filter((k) => k.status === status).length
  const pilihanSiswa = [...data.siswa]
    .sort((a, b) => a.kelas.localeCompare(b.kelas) || a.nama.localeCompare(b.nama))
    .map((s) => ({ value: s.nis, label: `${s.nama} — Kelas ${s.kelas}` }))

  return (
    <CrudPage
      title="Bimbingan Konseling"
      desc="Catatan layanan BK untuk setiap siswa. Bersifat rahasia — hanya Guru BK dan Kepala Sekolah yang dapat melihatnya."
      ringkasan={
        <>
          <div className="mb-4 grid grid-cols-3 gap-4">
            <StatCard icon={HeartHandshake} label="Dalam proses" value={hitung('Dalam Proses')} tone="sky" />
            <StatCard icon={Eye} label="Perlu pemantauan" value={hitung('Perlu Pemantauan')} tone="amber" />
            <StatCard icon={CircleCheck} label="Selesai" value={hitung('Selesai')} tone="emerald" />
          </div>
          <p className="mb-4 flex items-center gap-2 text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5" /> Jaga kerahasiaan: jangan menyalin isi catatan ke grup atau pengumuman.
          </p>
        </>
      }
      koleksi="konseling"
      itemLabel="Catatan Konseling"
      searchKeys={['nama', 'kelas', 'kategori', 'layanan', 'masalah']}
      filter={{ key: 'status', label: 'Status', options: STATUS_KONSELING }}
      kosong={{ nis: '', tanggal: todayKey(), kategori: '', layanan: '', masalah: '', tindakLanjut: '', status: 'Dalam Proses' }}
      // Kasus yang belum selesai di atas, lalu yang terbaru
      urutkan={(a, b) => (a.status === 'Selesai') - (b.status === 'Selesai') || b.tanggal.localeCompare(a.tanggal)}
      validasi={(form) => {
        const siswa = data.siswa.find((s) => s.nis === form.nis)
        if (!siswa) return 'Pilih siswa.'
        form.nama = siswa.nama
        form.kelas = siswa.kelas
        return null
      }}
      fields={[
        { name: 'nis', label: 'Siswa', type: 'select', options: pilihanSiswa, required: true, full: true },
        { name: 'tanggal', label: 'Tanggal', type: 'date', required: true },
        { name: 'kategori', label: 'Bidang', type: 'select', options: KATEGORI_KONSELING, required: true },
        { name: 'layanan', label: 'Jenis Layanan', type: 'select', options: LAYANAN_KONSELING, required: true },
        { name: 'status', label: 'Status', type: 'select', options: STATUS_KONSELING, required: true },
        { name: 'masalah', label: 'Permasalahan', type: 'textarea', required: true, placeholder: 'Uraikan permasalahan siswa...' },
        { name: 'tindakLanjut', label: 'Tindak Lanjut', type: 'textarea', placeholder: 'Langkah yang disepakati / rencana sesi berikutnya' },
      ]}
      columns={[
        {
          key: 'nama',
          label: 'Siswa',
          render: (k) => (
            <span className="flex items-center gap-3">
              <Avatar nama={k.nama} size="sm" />
              <span>
                <span className="block font-semibold text-slate-800">{k.nama}</span>
                <span className="block text-xs text-slate-500">Kelas {k.kelas}</span>
              </span>
            </span>
          ),
        },
        {
          key: 'tanggal',
          label: 'Layanan',
          render: (k) => (
            <span>
              <span className="block text-slate-800">{k.layanan}</span>
              <span className="block text-xs text-slate-500">
                {formatTanggal(k.tanggal)} · {k.kategori}
              </span>
            </span>
          ),
        },
        {
          key: 'masalah',
          label: 'Permasalahan & Tindak Lanjut',
          render: (k) => (
            <span className="block max-w-sm">
              <span className="block text-slate-700">{k.masalah}</span>
              {k.tindakLanjut && <span className="mt-1 block text-xs text-slate-500">→ {k.tindakLanjut}</span>}
            </span>
          ),
        },
        { key: 'status', label: 'Status', render: (k) => <Badge className={WARNA_KONSELING[k.status]}>{k.status}</Badge> },
      ]}
    />
  )
}
