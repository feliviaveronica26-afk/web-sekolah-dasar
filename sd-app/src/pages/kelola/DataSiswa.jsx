import CrudPage from '../../components/CrudPage'
import { Avatar, Badge } from '../../components/ui'
import { KELAS } from '../../data/dummy'

export default function DataSiswa() {
  return (
    <CrudPage
      title="Data Siswa"
      desc="Kelola data seluruh siswa SD Harapan Gemilang."
      koleksi="siswa"
      itemLabel="Siswa"
      searchKeys={['nama', 'nis', 'ortu']}
      filter={{ key: 'kelas', label: 'Kelas', options: KELAS }}
      urutkan={(a, b) => a.kelas.localeCompare(b.kelas) || a.nama.localeCompare(b.nama)}
      kosong={{ nis: '', nama: '', kelas: '', jk: '', ortu: '' }}
      validasi={(form, semua, editId) =>
        semua.some((s) => s.nis === form.nis.trim() && s.id !== editId) ? `NIS ${form.nis} sudah dipakai siswa lain.` : null
      }
      fields={[
        { name: 'nis', label: 'NIS', required: true, placeholder: 'Contoh: 230413' },
        { name: 'nama', label: 'Nama Lengkap', required: true },
        { name: 'kelas', label: 'Kelas', type: 'select', options: KELAS, required: true },
        { name: 'jk', label: 'Jenis Kelamin', type: 'select', required: true, options: [{ value: 'L', label: 'Laki-laki' }, { value: 'P', label: 'Perempuan' }] },
        { name: 'ortu', label: 'Nama Orang Tua/Wali', required: true, full: true },
      ]}
      columns={[
        { key: 'nis', label: 'NIS' },
        {
          key: 'nama',
          label: 'Nama',
          render: (s) => (
            <span className="flex items-center gap-3">
              <Avatar nama={s.nama} size="sm" />
              <span className="font-semibold text-slate-800">{s.nama}</span>
            </span>
          ),
        },
        { key: 'kelas', label: 'Kelas', render: (s) => <Badge className="bg-primary-50 text-primary-700">{s.kelas}</Badge> },
        { key: 'jk', label: 'L/P' },
        { key: 'ortu', label: 'Orang Tua' },
      ]}
    />
  )
}
