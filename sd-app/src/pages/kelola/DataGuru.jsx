import { useEffect, useState } from 'react'
import { CloudOff, Database, LoaderCircle, RefreshCw } from 'lucide-react'
import CrudPage from '../../components/CrudPage'
import ModalAkun, { StatusAkun, TombolAkun } from '../../components/ModalAkun'
import { Avatar, Badge } from '../../components/ui'
import { PERAN } from '../../context/akses'
import { useData } from '../../context/DataContext'
import { KELAS, MAPEL, MAPEL_DIAMPU, PPDB, STATUS_PEGAWAI } from '../../data/dummy'

// Keterangan sumber data: database MySQL (lewat Laravel) atau salinan di browser saat server mati
function StatusServer() {
  const { data, statusGuru, muatGuru } = useData()
  if (statusGuru === 'memuat') {
    return (
      <p className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <LoaderCircle className="h-4 w-4 shrink-0 animate-spin" /> Menghubungkan ke database sekolah…
      </p>
    )
  }
  if (statusGuru === 'server') {
    return (
      <p className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <Database className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <strong>Tersambung ke database MySQL</strong> · {data.guru.length} guru & staf. Perubahan di halaman ini langsung tersimpan di server dan
          terlihat di semua perangkat. Biodata pribadi hanya terlihat oleh Kepala Sekolah dan pemiliknya.
        </span>
      </p>
    )
  }
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center">
      <p className="flex flex-1 items-start gap-2">
        <CloudOff className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <strong>Server database tidak tersambung.</strong> Yang tampil adalah salinan terakhir di browser ini dan belum bisa diubah. Pastikan server
          Laravel berjalan.
        </span>
      </p>
      <button onClick={muatGuru} className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-semibold text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100">
        <RefreshCw className="h-3.5 w-3.5" /> Coba lagi
      </button>
    </div>
  )
}

const kepsek = (g) => g.jabatan === 'Kepala Sekolah'

export default function DataGuru() {
  const { data, muatGuru, buatAkunGuru } = useData()
  const [akunUntuk, setAkunUntuk] = useState(null)

  // Muat ulang dengan sesi Kepala Sekolah agar NIP, biodata, dan status akun ikut terkirim dari server
  useEffect(() => {
    muatGuru()
  }, [muatGuru])

  return (
    <>
      <CrudPage
        title="Data Guru & Staf"
        desc="Atur jabatan, biodata, mapel yang diampu, dan akun login setiap guru dan staf. Menu di Portal Guru & Staf langsung menyesuaikan jabatan yang dicentang."
        koleksi="guru"
        itemLabel="Guru/Staf"
        ringkasan={<StatusServer />}
        searchKeys={['nama', 'nip', 'jabatan', 'mapel']}
        kosong={{
          nama: '', nip: '', jabatan: '', mapel: '', peran: [], kelas: '', mapelDiampu: [], jk: '', tempatLahir: '', tanggalLahir: '', agama: '',
          alamat: '', whatsapp: '', email: '', pendidikan: '', statusPegawai: '', mulaiTugas: '',
        }}
        validasi={(form, semua, editId) => {
          const wali = form.peran?.includes('wali_kelas')
          if (wali && !form.kelas) return 'Pilih kelas untuk wali kelas.'
          const bentrok = wali && semua.find((g) => g.id !== editId && g.peran?.includes('wali_kelas') && g.kelas === form.kelas)
          if (bentrok) return `Kelas ${form.kelas} sudah memiliki wali kelas: ${bentrok.nama}.`
          if (!wali) form.kelas = ''
          if (!form.peran?.includes('guru_mapel')) form.mapelDiampu = []
          for (const m of form.mapelDiampu ?? []) {
            const lain = semua.find((g) => g.id !== editId && g.peran?.includes('guru_mapel') && g.mapelDiampu?.includes(m))
            if (lain) return `${MAPEL[m].nama} sudah diampu ${lain.nama}.`
          }
          return null
        }}
        fields={[
          { name: 'nama', label: 'Nama Lengkap & Gelar', required: true, full: true },
          { name: 'nip', label: 'NIP/NUPTK', placeholder: 'Opsional' },
          { name: 'jabatan', label: 'Jabatan', required: true, placeholder: 'Contoh: Wali Kelas 2A' },
          { name: 'mapel', label: 'Keterangan Mengajar', placeholder: 'Contoh: Guru Kelas / PJOK' },
          { name: 'kelas', label: 'Wali kelas untuk', type: 'select', options: KELAS, hint: 'Diisi jika jabatan Wali Kelas dicentang.' },
          {
            name: 'peran',
            label: 'Jabatan & hak akses di portal',
            type: 'checkboxes',
            options: Object.entries(PERAN).map(([value, p]) => ({ value, label: p.label })),
            hint: 'Boleh lebih dari satu. Contoh: guru yang juga Wakasek Kurikulum.',
          },
          {
            name: 'mapelDiampu',
            label: 'Mapel yang diampu (semua kelas)',
            type: 'checkboxes',
            options: MAPEL_DIAMPU.map((m) => ({ value: m, label: MAPEL[m].nama })),
            hint: 'Guru mapel menilai & mengabsen mapel ini di semua kelas; wali kelas tidak lagi menilainya. Satu mapel hanya untuk satu guru.',
            tampil: (form) => form.peran?.includes('guru_mapel'),
          },
          { name: 'judul-biodata', label: 'Biodata', type: 'judul' },
          { name: 'jk', label: 'Jenis Kelamin', type: 'select', options: [{ value: 'L', label: 'Laki-laki' }, { value: 'P', label: 'Perempuan' }] },
          { name: 'agama', label: 'Agama', type: 'select', options: PPDB.agama },
          { name: 'tempatLahir', label: 'Tempat Lahir' },
          { name: 'tanggalLahir', label: 'Tanggal Lahir', type: 'date' },
          { name: 'pendidikan', label: 'Pendidikan Terakhir', placeholder: 'Contoh: S1 Pendidikan Guru SD', full: true },
          { name: 'alamat', label: 'Alamat Rumah', full: true },
          { name: 'judul-kontak', label: 'Kontak & kepegawaian', type: 'judul' },
          { name: 'whatsapp', label: 'Nomor WhatsApp', type: 'tel', placeholder: '08xx-xxxx-xxxx' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'statusPegawai', label: 'Status Kepegawaian', type: 'select', options: STATUS_PEGAWAI },
          { name: 'mulaiTugas', label: 'Mulai Bertugas', type: 'date' },
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
                  <span className="block text-xs text-slate-500">
                    {g.jabatan}
                    {g.statusPegawai && ` · ${g.statusPegawai}`}
                  </span>
                  {g.nip && <span className="block font-mono text-[11px] text-slate-400">NIP {g.nip}</span>}
                </span>
              </span>
            ),
          },
          {
            key: 'peran',
            label: 'Hak Akses Portal',
            render: (g) =>
              kepsek(g) ? (
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
          {
            key: 'mapel',
            label: 'Mapel',
            render: (g) => {
              const diampu = g.peran?.includes('guru_mapel') ? (g.mapelDiampu ?? []) : []
              return diampu.length ? (
                <span className="flex flex-wrap gap-1">
                  {diampu.map((m) => (
                    <span key={m} className={`rounded-md px-2 py-0.5 text-xs font-bold ${MAPEL[m]?.warna}`}>
                      {MAPEL[m]?.nama ?? m}
                    </span>
                  ))}
                </span>
              ) : g.mapel && g.mapel !== '-' ? (
                g.mapel
              ) : (
                '–'
              )
            },
          },
          { key: 'whatsapp', label: 'WhatsApp', render: (g) => <span className="whitespace-nowrap">{g.whatsapp || '–'}</span> },
          {
            key: 'akun',
            label: 'Akun Login',
            render: (g) => (kepsek(g) ? <span className="text-xs text-slate-500">Akun Kepala Sekolah</span> : <StatusAkun akun={g.akun} />),
          },
        ]}
        aksiBaris={(g) => !kepsek(g) && <TombolAkun akun={g.akun} nama={g.nama} onClick={() => setAkunUntuk(g.id)} />}
      />
      <ModalAkun
        pemilik={data.guru.find((g) => g.id === akunUntuk) ?? null}
        portal="Portal Guru & Staf"
        buat={buatAkunGuru}
        onTutup={() => setAkunUntuk(null)}
      />
    </>
  )
}
