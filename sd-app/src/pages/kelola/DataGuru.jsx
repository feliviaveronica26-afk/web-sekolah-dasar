import CrudPage from '../../components/CrudPage'
import { Avatar, Badge } from '../../components/ui'
import { PERAN } from '../../context/akses'
import { KELAS } from '../../data/dummy'

export default function DataGuru() {
  return (
    <CrudPage
      title="Data Guru & Staf"
      desc="Atur jabatan setiap guru dan staf. Menu di Portal Guru & Staf langsung menyesuaikan jabatan yang dicentang."
      koleksi="guru"
      itemLabel="Guru/Staf"
      searchKeys={['nama', 'nip', 'jabatan', 'mapel']}
      kosong={{ nama: '', nip: '', jabatan: '', mapel: '', peran: [], kelas: '' }}
      validasi={(form, semua, editId) => {
        const wali = form.peran?.includes('wali_kelas')
        if (wali && !form.kelas) return 'Pilih kelas untuk wali kelas.'
        const bentrok = wali && semua.find((g) => g.id !== editId && g.peran?.includes('wali_kelas') && g.kelas === form.kelas)
        if (bentrok) return `Kelas ${form.kelas} sudah memiliki wali kelas: ${bentrok.nama}.`
        if (!wali) form.kelas = ''
        return null
      }}
      fields={[
        { name: 'nama', label: 'Nama Lengkap & Gelar', required: true, full: true },
        { name: 'nip', label: 'NIP/NUPTK', placeholder: 'Opsional' },
        { name: 'jabatan', label: 'Jabatan', required: true, placeholder: 'Contoh: Wali Kelas 2A' },
        { name: 'mapel', label: 'Mata Pelajaran', placeholder: 'Contoh: Guru Kelas / PJOK' },
        { name: 'kelas', label: 'Wali kelas untuk', type: 'select', options: KELAS, hint: 'Diisi jika jabatan Wali Kelas dicentang.' },
        {
          name: 'peran',
          label: 'Jabatan & hak akses di portal',
          type: 'checkboxes',
          options: Object.entries(PERAN).map(([value, p]) => ({ value, label: p.label })),
          hint: 'Boleh lebih dari satu. Contoh: guru yang juga Wakasek Kurikulum.',
        },
      ]}
      columns={[
        {
          key: 'nama',
          label: 'Nama',
          render: (g) => (
            <span className="flex items-center gap-3">
              <Avatar nama={g.nama} size="sm" />
              <span>
                <span className="block font-semibold text-slate-800">{g.nama}</span>
                <span className="block text-xs text-slate-500">{g.jabatan}</span>
              </span>
            </span>
          ),
        },
        {
          key: 'peran',
          label: 'Hak Akses Portal',
          render: (g) =>
            g.jabatan === 'Kepala Sekolah' ? (
              <Badge className="bg-primary-100 text-primary-700">Kepala Sekolah (akses penuh)</Badge>
            ) : (
              <span className="flex flex-wrap gap-1">
                {(g.peran ?? []).map((p) => (
                  <Badge key={p} className="bg-sky-50 text-sky-700">
                    {PERAN[p]?.label}
                    {p === 'wali_kelas' && g.kelas && ` ${g.kelas}`}
                  </Badge>
                ))}
                {!g.peran?.length && <span className="text-slate-400">–</span>}
              </span>
            ),
        },
        { key: 'mapel', label: 'Mapel', render: (g) => (g.mapel && g.mapel !== '-' ? g.mapel : '–') },
        { key: 'nip', label: 'NIP', render: (g) => g.nip || '–' },
      ]}
    />
  )
}
