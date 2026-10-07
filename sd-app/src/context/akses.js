import { useAuth } from './AuthContext'
import { useData } from './DataContext'
import { MAPEL } from '../data/dummy'
import { mapelRapor } from '../utils/nilai'

// Jabatan di Portal Guru & Staf beserta menu yang dibukanya.
// Satu orang boleh punya beberapa jabatan; menunya digabung.
export const PERAN = {
  wali_kelas: { label: 'Wali Kelas', menu: ['kelas', 'absensi', 'izin', 'nilai', 'tugas', 'sikap', 'pesan', 'rapor'] },
  guru_mapel: { label: 'Guru Mapel', menu: ['kelas', 'absensi', 'nilai', 'tugas', 'sikap'] },
  wakasek_kurikulum: { label: 'Wakasek Kurikulum', menu: ['jadwal', 'kalender', 'pengumuman', 'nilai', 'rapor'] },
  wakasek_kesiswaan: { label: 'Wakasek Kesiswaan', menu: ['siswa', 'kehadiran', 'sikap'] },
  tata_usaha: { label: 'Tata Usaha', menu: ['siswa', 'spp', 'ppdb', 'kunjungan'] },
  pustakawan: { label: 'Pustakawan', menu: ['perpustakaan'] },
  wakasek_sarpras: { label: 'Wakasek Sarana & Prasarana', menu: ['inventaris', 'kerusakan'] },
  guru_bk: { label: 'Guru BK', menu: ['konseling', 'sikap', 'siswa', 'kehadiran'] },
  satpam: { label: 'Satpam', menu: ['bukutamu'] },
}

// Menu yang dimiliki semua guru & staf, apa pun jabatannya
export const MENU_UMUM = ['presensi']

// Kepala Sekolah memegang akses tertinggi: semua menu kelola + pengaturan jabatan guru & staf.
// Absensi kelas, persetujuan izin, dan pesan orang tua tidak termasuk karena itu tugas harian wali kelas.
export const MENU_KEPSEK = [
  'presensi', 'kelas', 'siswa', 'guru', 'kehadiran', 'nilai', 'rapor', 'sikap', 'konseling', 'tugas', 'spp', 'ppdb', 'kunjungan', 'bukutamu',
  'pengumuman', 'perpustakaan', 'inventaris', 'kerusakan', 'jadwal', 'kalender',
]

export function useAkses() {
  const { user } = useAuth()
  const { data } = useData()

  if (user?.role === 'kepsek') {
    // Presensi Kepala Sekolah dicatat pada data guru & staf berjabatan Kepala Sekolah
    const guruId = data.guru.find((g) => g.jabatan === 'Kepala Sekolah')?.id ?? null
    return { base: '/dashboard/kepsek', nama: user.nama, guruId, peran: [], menu: MENU_KEPSEK, kelas: '', kepsek: true, punya: (m) => MENU_KEPSEK.includes(m) }
  }

  const guru = user?.role === 'staf' ? data.guru.find((g) => g.id === user.guruId) : null
  const peran = guru?.peran ?? []
  const menu = [...new Set([...MENU_UMUM, ...peran.flatMap((p) => PERAN[p]?.menu ?? [])])]
  return {
    base: '/dashboard/staf',
    nama: guru?.nama ?? user?.nama,
    guruId: guru?.id ?? null,
    peran,
    menu,
    kelas: peran.includes('wali_kelas') ? guru.kelas : '',
    kepsek: false,
    punya: (m) => menu.includes(m),
  }
}

const urutKelas = (daftar) => [...new Set(daftar)].filter(Boolean).sort()

/*
  Lingkup kerja per menu: kelas mana yang boleh dibuka dan mapel apa yang boleh dinilai.
  - Wali kelas: kelasnya sendiri, semua mapel kecuali mapel yang diampu guru mapel khusus
  - Guru mapel: semua kelas, hanya mapel yang ia ampu (termasuk presensi siswa saat mengajar)
  - Kepala Sekolah & wakasek terkait: semua kelas & mapel
  - Daftar siswa ('kelas'): semua kelas bisa dilihat oleh setiap guru
*/
export function useLingkup(menu) {
  const akses = useAkses()
  const { data } = useData()
  const semuaKelas = urutKelas(data.siswa.map((s) => s.kelas))
  const punyaPeran = (p) => akses.peran.includes(p)

  // Mapel yang diampu guru mapel khusus (agama, bahasa Inggris, PJOK, informatika, ...)
  const namaGuruMapel = data.guru.filter((g) => g.peran?.includes('guru_mapel')).map((g) => g.nama)
  const mapelKhusus = Object.keys(MAPEL).filter((k) => namaGuruMapel.includes(MAPEL[k].guru))
  const mapelSaya = Object.keys(MAPEL).filter((k) => MAPEL[k].guru === akses.nama)

  const penuh =
    akses.kepsek ||
    menu === 'kelas' ||
    (menu === 'nilai' && punyaPeran('wakasek_kurikulum')) ||
    (menu === 'rapor' && punyaPeran('wakasek_kurikulum')) ||
    (menu === 'sikap' && (punyaPeran('wakasek_kesiswaan') || punyaPeran('guru_bk') || punyaPeran('guru_mapel')))

  let kelas = []
  if (penuh) kelas = semuaKelas
  else {
    if (akses.kelas) kelas.push(akses.kelas)
    if (['nilai', 'tugas', 'absensi'].includes(menu) && punyaPeran('guru_mapel')) kelas.push(...semuaKelas)
    kelas = urutKelas(kelas)
  }

  const mapel = (k) => {
    const daftar = mapelRapor(k)
    if (penuh) return daftar
    const boleh = new Set()
    if (k === akses.kelas) daftar.filter((m) => !mapelKhusus.includes(m)).forEach((m) => boleh.add(m))
    if (punyaPeran('guru_mapel')) daftar.filter((m) => mapelSaya.includes(m)).forEach((m) => boleh.add(m))
    return daftar.filter((m) => boleh.has(m))
  }

  return { ...akses, daftarKelas: kelas, mapel, penuh }
}
