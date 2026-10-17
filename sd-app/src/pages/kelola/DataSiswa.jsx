import { useState } from 'react'
import { ClipboardList, HeartPulse, KeyRound, Users } from 'lucide-react'
import CrudPage from '../../components/CrudPage'
import ModalAkun, { StatusAkun, TombolAkun } from '../../components/ModalAkun'
import { Avatar, Badge, StatCard } from '../../components/ui'
import { useAkses } from '../../context/akses'
import { useData } from '../../context/DataContext'
import { KELAS, PPDB } from '../../data/dummy'
import { GOLONGAN_DARAH, teksLahir } from '../../utils/siswa'

// Biodata pokok yang sebaiknya terisi untuk rapor & Dapodik
const belumLengkap = (s) => !s.nisn || !s.tanggalLahir || !s.tempatLahir || !s.agama

export default function DataSiswa() {
  const { data, buatAkunSiswa } = useData()
  const akses = useAkses()
  const [akunUntuk, setAkunUntuk] = useState(null)
  // Akun siswa diatur Tata Usaha & Kepala Sekolah (sama dengan Akses::kelolaAkunSiswa di Laravel)
  const kelolaAkun = akses.kepsek || akses.peran.includes('tata_usaha')

  const siswa = data.siswa
  const punyaAkun = siswa.filter((s) => s.akun).length
  const kurang = siswa.filter(belumLengkap).length
  const catatanSehat = siswa.filter((s) => s.catatanKesehatan).length
  const laki = siswa.filter((s) => s.jk === 'L').length
  const dipilih = siswa.find((s) => s.id === akunUntuk)

  return (
    <>
      <CrudPage
        title="Data Siswa"
        desc="Data pokok, biodata, riwayat sekolah, dan catatan kesehatan seluruh siswa. Biodata hanya terlihat oleh pengelola data siswa, wali kelasnya, dan keluarga siswa itu sendiri."
        koleksi="siswa"
        itemLabel="Siswa"
        ringkasan={
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Users} label="Siswa" value={siswa.length} hint={`${laki} laki-laki · ${siswa.length - laki} perempuan`} tone="sky" />
            <StatCard icon={ClipboardList} label="Biodata belum lengkap" value={kurang} hint="NISN, kelahiran, atau agama kosong" tone="amber" />
            <StatCard icon={HeartPulse} label="Punya catatan kesehatan" value={catatanSehat} hint="Alergi atau kondisi khusus" tone="primary" />
            {kelolaAkun ? (
              <StatCard icon={KeyRound} label="Punya akun login" value={punyaAkun} hint={`${siswa.length - punyaAkun} belum`} tone="emerald" />
            ) : (
              <StatCard icon={KeyRound} label="Kelas" value={KELAS.length} hint="Kelas 1A – 6C" tone="emerald" />
            )}
          </div>
        }
        searchKeys={['nama', 'nis', 'nisn', 'ortu']}
        cariTambahan={(s) => [s.catatanKesehatan, s.asalSekolah, s.akun?.username].filter(Boolean).join(' ')}
        filter={{ key: 'kelas', label: 'Kelas', options: KELAS }}
        urutkan={(a, b) => a.kelas.localeCompare(b.kelas) || a.nama.localeCompare(b.nama)}
        kosong={{
          nis: '', nisn: '', nama: '', kelas: '', jk: '', ortu: '', tempatLahir: '', tanggalLahir: '', agama: '', golonganDarah: '',
          tanggalMasuk: '', asalSekolah: '', catatanKesehatan: '',
        }}
        validasi={(form, semua, editId) => {
          const nis = form.nis.trim()
          if (semua.some((s) => s.nis === nis && s.id !== editId)) return `NIS ${nis} sudah dipakai siswa lain.`
          const nisn = String(form.nisn ?? '').replace(/\s+/g, '')
          if (nisn && !/^[0-9]{10}$/.test(nisn)) return 'NISN harus 10 angka.'
          const kembar = nisn && semua.find((s) => s.nisn === nisn && s.id !== editId)
          if (kembar) return `NISN ${nisn} sudah dipakai ${kembar.nama}.`
          form.nisn = nisn
          return null
        }}
        fields={[
          { name: 'nis', label: 'NIS', required: true, placeholder: 'Contoh: 261125', hint: 'Juga menjadi username akun siswa.' },
          { name: 'nisn', label: 'NISN', placeholder: '10 angka', hint: 'Nomor Induk Siswa Nasional (opsional).' },
          { name: 'nama', label: 'Nama Lengkap', required: true, full: true },
          { name: 'kelas', label: 'Kelas', type: 'select', options: KELAS, required: true },
          { name: 'jk', label: 'Jenis Kelamin', type: 'select', required: true, options: [{ value: 'L', label: 'Laki-laki' }, { value: 'P', label: 'Perempuan' }] },
          { name: 'ortu', label: 'Nama Orang Tua/Wali', required: true, full: true, hint: 'Nama yang tampil di portal. Data lengkap ayah, ibu, dan kontak keluarga ada di menu Data Orang Tua.' },
          { name: 'judul-biodata', label: 'Biodata', type: 'judul' },
          { name: 'tempatLahir', label: 'Tempat Lahir' },
          { name: 'tanggalLahir', label: 'Tanggal Lahir', type: 'date' },
          { name: 'agama', label: 'Agama', type: 'select', options: PPDB.agama },
          { name: 'golonganDarah', label: 'Golongan Darah', type: 'select', options: GOLONGAN_DARAH },
          { name: 'judul-riwayat', label: 'Riwayat sekolah', type: 'judul' },
          { name: 'tanggalMasuk', label: 'Tanggal Masuk', type: 'date' },
          { name: 'asalSekolah', label: 'Asal TK / Sekolah', placeholder: 'Contoh: TK Pertiwi', hint: 'Untuk siswa pindahan, isi sekolah asalnya.' },
          { name: 'judul-kesehatan', label: 'Kesehatan', type: 'judul' },
          {
            name: 'catatanKesehatan',
            label: 'Catatan Kesehatan',
            full: true,
            placeholder: 'Contoh: Alergi kacang',
            hint: 'Alergi atau kondisi yang perlu diketahui guru. Tampil di daftar kelas wali kelasnya.',
          },
        ]}
        columns={[
          {
            key: 'nis',
            label: 'NIS',
            render: (s) => (
              <span className="block whitespace-nowrap">
                <span className="block font-mono text-slate-800">{s.nis}</span>
                {s.nisn && <span className="block font-mono text-[11px] text-slate-400">NISN {s.nisn}</span>}
              </span>
            ),
          },
          {
            key: 'nama',
            label: 'Nama',
            render: (s) => (
              <span className="flex items-center gap-3">
                <Avatar nama={s.nama} size="sm" />
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-800">{s.nama}</span>
                  {teksLahir(s) && <span className="block text-xs text-slate-500">{teksLahir(s)}</span>}
                  {s.catatanKesehatan && (
                    <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-amber-700">
                      <HeartPulse className="h-3 w-3 shrink-0" aria-hidden="true" /> {s.catatanKesehatan}
                    </span>
                  )}
                </span>
              </span>
            ),
          },
          { key: 'kelas', label: 'Kelas', render: (s) => <Badge className="bg-primary-50 text-primary-700">{s.kelas}</Badge> },
          { key: 'jk', label: 'L/P' },
          { key: 'ortu', label: 'Orang Tua' },
          ...(kelolaAkun ? [{ key: 'akun', label: 'Akun Login', render: (s) => <StatusAkun akun={s.akun} /> }] : []),
        ]}
        aksiBaris={(s) => kelolaAkun && <TombolAkun akun={s.akun} nama={s.nama} onClick={() => setAkunUntuk(s.id)} />}
      />
      <ModalAkun pemilik={dipilih ?? null} portal="Portal Siswa" buat={buatAkunSiswa} onTutup={() => setAkunUntuk(null)} />
    </>
  )
}
