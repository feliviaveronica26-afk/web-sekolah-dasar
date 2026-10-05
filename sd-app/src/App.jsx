import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import PublicLayout from './components/PublicLayout'
import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute, { AksesMenu } from './components/ProtectedRoute'
import KalenderAkademik from './components/KalenderAkademik'

import Home from './pages/public/Home'
import Profil from './pages/public/Profil'
import Fasilitas from './pages/public/Fasilitas'
import FasilitasDetail from './pages/public/FasilitasDetail'
import Berita from './pages/public/Berita'
import BeritaDetail from './pages/public/BeritaDetail'
import Galeri from './pages/public/Galeri'
import PPDBPage from './pages/public/PPDB'
import Kontak from './pages/public/Kontak'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

import SiswaDashboard from './pages/siswa/SiswaDashboard'
import SiswaJadwal from './pages/siswa/SiswaJadwal'
import SiswaAbsensi from './pages/siswa/SiswaAbsensi'
import SiswaTugas from './pages/siswa/SiswaTugas'
import SiswaProfil from './pages/siswa/SiswaProfil'

import OrtuDashboard from './pages/ortu/OrtuDashboard'
import OrtuSpp from './pages/ortu/OrtuSpp'
import OrtuAbsensi from './pages/ortu/OrtuAbsensi'
import OrtuIzin from './pages/ortu/OrtuIzin'
import OrtuPengumuman from './pages/ortu/OrtuPengumuman'

import StafDashboard from './pages/staf/StafDashboard'
import AbsensiKelas from './pages/staf/AbsensiKelas'
import PersetujuanIzin from './pages/staf/PersetujuanIzin'
import KepsekDashboard from './pages/kepsek/KepsekDashboard'

import DataSiswa from './pages/kelola/DataSiswa'
import DataGuru from './pages/kelola/DataGuru'
import RekapKehadiran from './pages/kelola/RekapKehadiran'
import KelolaSpp from './pages/kelola/KelolaSpp'
import KelolaKunjungan from './pages/kelola/KelolaKunjungan'
import KelolaPpdb from './pages/kelola/KelolaPpdb'
import KelolaPengumuman from './pages/kelola/KelolaPengumuman'
import Perpustakaan from './pages/kelola/Perpustakaan'
import JadwalKelas from './pages/kelola/JadwalKelas'
import Konseling from './pages/kelola/Konseling'
import BukuTamu from './pages/kelola/BukuTamu'
import Inventaris from './pages/kelola/Inventaris'
import LaporanKerusakan from './pages/kelola/LaporanKerusakan'

// Gulir ke atas saat pindah halaman, atau ke elemen tujuan jika alamat memakai #anchor
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 50)
      return () => clearTimeout(t)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

const dashboard = (role) => (
  <ProtectedRoute role={role}>
    <DashboardLayout />
  </ProtectedRoute>
)

// Halaman kelola yang dipakai bersama Portal Guru & Staf dan Portal Kepala Sekolah
const HALAMAN_KELOLA = {
  absensi: <AbsensiKelas />,
  izin: <PersetujuanIzin />,
  siswa: <DataSiswa />,
  guru: <DataGuru />,
  kehadiran: <RekapKehadiran />,
  konseling: <Konseling />,
  spp: <KelolaSpp />,
  ppdb: <KelolaPpdb />,
  kunjungan: <KelolaKunjungan />,
  bukutamu: <BukuTamu />,
  pengumuman: <KelolaPengumuman />,
  perpustakaan: <Perpustakaan />,
  inventaris: <Inventaris />,
  kerusakan: <LaporanKerusakan />,
  jadwal: <JadwalKelas />,
  kalender: <KalenderAkademik />,
}

const ruteKelola = Object.entries(HALAMAN_KELOLA).map(([menu, halaman]) => (
  <Route key={menu} path={menu} element={<AksesMenu menu={menu}>{halaman}</AksesMenu>} />
))

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/fasilitas" element={<Fasilitas />} />
          <Route path="/fasilitas/:id" element={<FasilitasDetail />} />
          <Route path="/berita" element={<Berita />} />
          <Route path="/berita/:id" element={<BeritaDetail />} />
          <Route path="/galeri" element={<Galeri />} />
          <Route path="/ppdb" element={<PPDBPage />} />
          <Route path="/kontak" element={<Kontak />} />
        </Route>

        <Route path="/login" element={<Login />} />

        <Route path="/dashboard/siswa" element={dashboard('siswa')}>
          <Route index element={<SiswaDashboard />} />
          <Route path="jadwal" element={<SiswaJadwal />} />
          <Route path="absensi" element={<SiswaAbsensi />} />
          <Route path="tugas" element={<SiswaTugas />} />
          <Route path="kalender" element={<KalenderAkademik />} />
          <Route path="profil" element={<SiswaProfil />} />
        </Route>

        <Route path="/dashboard/ortu" element={dashboard('ortu')}>
          <Route index element={<OrtuDashboard />} />
          <Route path="spp" element={<OrtuSpp />} />
          <Route path="absensi" element={<OrtuAbsensi />} />
          <Route path="izin" element={<OrtuIzin />} />
          <Route path="kalender" element={<KalenderAkademik />} />
          <Route path="pengumuman" element={<OrtuPengumuman />} />
        </Route>

        <Route path="/dashboard/staf" element={dashboard('staf')}>
          <Route index element={<StafDashboard />} />
          {ruteKelola}
        </Route>

        <Route path="/dashboard/kepsek" element={dashboard('kepsek')}>
          <Route index element={<KepsekDashboard />} />
          {ruteKelola}
        </Route>

        {/* Alamat lama sebelum portal digabung */}
        <Route path="/dashboard/guru/*" element={<Navigate to="/dashboard/staf" replace />} />
        <Route path="/dashboard/admin/*" element={<Navigate to="/dashboard/kepsek" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
