import { useAuth } from './AuthContext'
import { useData } from './DataContext'

// Jabatan di Portal Guru & Staf beserta menu yang dibukanya.
// Satu orang boleh punya beberapa jabatan; menunya digabung.
export const PERAN = {
  wali_kelas: { label: 'Wali Kelas', menu: ['absensi', 'izin'] },
  guru_mapel: { label: 'Guru Mapel', menu: [] },
  wakasek_kurikulum: { label: 'Wakasek Kurikulum', menu: ['jadwal', 'kalender', 'pengumuman'] },
  wakasek_kesiswaan: { label: 'Wakasek Kesiswaan', menu: ['siswa', 'kehadiran'] },
  tata_usaha: { label: 'Tata Usaha', menu: ['siswa', 'spp', 'ppdb', 'kunjungan'] },
  pustakawan: { label: 'Pustakawan', menu: ['perpustakaan'] },
  wakasek_sarpras: { label: 'Wakasek Sarana & Prasarana', menu: ['inventaris', 'kerusakan'] },
  guru_bk: { label: 'Guru BK', menu: ['konseling', 'siswa', 'kehadiran'] },
  satpam: { label: 'Satpam', menu: ['bukutamu'] },
}

// Kepala Sekolah memegang akses tertinggi: semua menu kelola + pengaturan jabatan guru & staf.
// Absensi kelas & persetujuan izin tidak termasuk karena itu tugas harian wali kelas.
export const MENU_KEPSEK = [
  'siswa', 'guru', 'kehadiran', 'konseling', 'spp', 'ppdb', 'kunjungan', 'bukutamu',
  'pengumuman', 'perpustakaan', 'inventaris', 'kerusakan', 'jadwal', 'kalender',
]

export function useAkses() {
  const { user } = useAuth()
  const { data } = useData()

  if (user?.role === 'kepsek') {
    return { base: '/dashboard/kepsek', nama: user.nama, peran: [], menu: MENU_KEPSEK, kelas: '', punya: (m) => MENU_KEPSEK.includes(m) }
  }

  const guru = user?.role === 'staf' ? data.guru.find((g) => g.id === user.guruId) : null
  const peran = guru?.peran ?? []
  const menu = [...new Set(peran.flatMap((p) => PERAN[p]?.menu ?? []))]
  return {
    base: '/dashboard/staf',
    nama: guru?.nama ?? user?.nama,
    peran,
    menu,
    kelas: peran.includes('wali_kelas') ? guru.kelas : '',
    punya: (m) => menu.includes(m),
  }
}
