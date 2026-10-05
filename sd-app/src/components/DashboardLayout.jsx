import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  Boxes,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileCheck,
  FileText,
  Globe,
  GraduationCap,
  HeartHandshake,
  IdCard,
  LayoutDashboard,
  Library,
  LogOut,
  Megaphone,
  Menu,
  ShieldCheck,
  UserPlus,
  Users,
  Wallet,
  Wrench,
  X,
} from 'lucide-react'
import Logo from './Logo'
import { Avatar } from './ui'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { PERAN, useAkses } from '../context/akses'
import { LABEL_ROLE, TUGAS } from '../data/dummy'
import { formatHari, todayKey } from '../utils/format'
import { bulanWajibBayar } from '../utils/spp'

const MENU_TETAP = {
  siswa: [
    { to: '/dashboard/siswa', label: 'Beranda', icon: LayoutDashboard, end: true },
    { to: '/dashboard/siswa/jadwal', label: 'Jadwal Pelajaran', icon: BookOpen },
    { to: '/dashboard/siswa/absensi', label: 'Absensi per Mapel', icon: CalendarCheck },
    { to: '/dashboard/siswa/tugas', label: 'Tugas & PR', icon: ClipboardList, badge: 'tugas' },
    { to: '/dashboard/siswa/kalender', label: 'Kalender Akademik', icon: CalendarDays },
    { to: '/dashboard/siswa/profil', label: 'Profil Saya', icon: IdCard },
  ],
  ortu: [
    { to: '/dashboard/ortu', label: 'Beranda', icon: LayoutDashboard, end: true },
    { to: '/dashboard/ortu/spp', label: 'Pembayaran SPP', icon: Wallet, badge: 'spp' },
    { to: '/dashboard/ortu/absensi', label: 'Absensi Anak', icon: CalendarCheck },
    { to: '/dashboard/ortu/izin', label: 'Izin Tidak Masuk', icon: FileText },
    { to: '/dashboard/ortu/kalender', label: 'Kalender Akademik', icon: CalendarDays },
    { to: '/dashboard/ortu/pengumuman', label: 'Pengumuman', icon: Megaphone },
  ],
}

// Menu Portal Guru & Staf / Kepala Sekolah, ditampilkan sesuai hak akses (urutan tetap)
const MENU_KELOLA = {
  absensi: { label: 'Absensi Kelas', icon: ClipboardCheck },
  izin: { label: 'Persetujuan Izin', icon: FileCheck, badge: 'izin' },
  siswa: { label: 'Data Siswa', icon: Users },
  guru: { label: 'Data Guru & Staf', icon: GraduationCap },
  kehadiran: { label: 'Rekap Kehadiran', icon: BarChart3 },
  konseling: { label: 'Bimbingan Konseling', icon: HeartHandshake },
  spp: { label: 'Keuangan SPP', icon: Wallet },
  ppdb: { label: 'PPDB Online', icon: UserPlus, badge: 'ppdb' },
  kunjungan: { label: 'Kunjungan Sekolah', icon: CalendarClock, badge: 'kunjungan' },
  bukutamu: { label: 'Buku Tamu', icon: ShieldCheck, badge: 'bukutamu' },
  pengumuman: { label: 'Pengumuman', icon: Megaphone },
  perpustakaan: { label: 'Perpustakaan', icon: Library },
  inventaris: { label: 'Inventaris Sarpras', icon: Boxes },
  kerusakan: { label: 'Laporan Kerusakan', icon: Wrench, badge: 'kerusakan' },
  jadwal: { label: 'Jadwal Pelajaran', icon: BookOpen },
  kalender: { label: 'Kalender Akademik', icon: CalendarDays },
}

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const { data } = useData()
  const akses = useAkses()
  const navigate = useNavigate()
  const [buka, setBuka] = useState(false)

  const kelola = user.role === 'staf' || user.role === 'kepsek'
  const menu = kelola
    ? [
        { to: akses.base, label: 'Beranda', icon: LayoutDashboard, end: true },
        ...Object.keys(MENU_KELOLA)
          .filter((k) => akses.punya(k))
          .map((k) => ({ to: `${akses.base}/${k}`, ...MENU_KELOLA[k] })),
      ]
    : MENU_TETAP[user.role]

  const jumlahBadge = {
    izin: data.izin.filter((i) => i.kelas === akses.kelas && i.status === 'Menunggu').length,
    tugas: TUGAS.filter((t) => t.kelas === user.kelas && !(data.tugasSelesai[user.nis] ?? []).includes(t.id)).length,
    spp: user.anakNis ? bulanWajibBayar(data, user.anakNis).length : 0,
    kunjungan: data.kunjungan.filter((k) => k.status === 'Menunggu').length,
    ppdb: data.pendaftar.filter((p) => p.status === 'Menunggu Verifikasi').length,
    // Tamu hari ini yang belum tercatat keluar
    bukutamu: data.bukuTamu.filter((t) => t.tanggal === todayKey() && !t.keluar).length,
    kerusakan: data.kerusakan.filter((k) => k.status === 'Dilaporkan').length,
  }

  const nama = kelola ? akses.nama : user.nama
  const keterangan =
    user.role === 'staf'
      ? akses.peran.map((p) => (p === 'wali_kelas' ? `Wali Kelas ${akses.kelas}` : PERAN[p]?.label)).join(' · ') || 'Guru & Staf'
      : `${LABEL_ROLE[user.role]}${user.kelas ? ` · Kelas ${user.kelas}` : ''}`

  const keluar = () => {
    logout()
    navigate('/login')
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Logo />
        <button onClick={() => setBuka(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden" aria-label="Tutup menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="stripe-merah-putih mx-5 mb-4 h-1 rounded-full" />

      <p className="px-6 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Menu {LABEL_ROLE[user.role]}</p>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {menu.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setBuka(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-primary-50 hover:text-primary-700'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span className="flex-1">{label}</span>
            {badge && jumlahBadge[badge] > 0 && (
              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950">{jumlahBadge[badge]}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-slate-100 p-3">
        <NavLink to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
          <Globe className="h-5 w-5" /> Lihat Website
        </NavLink>
        <button
          onClick={keluar}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
        >
          <LogOut className="h-5 w-5" /> Keluar
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">{sidebar}</aside>

      {/* Sidebar mobile */}
      {buka && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setBuka(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setBuka(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Buka menu">
                <Menu className="h-5 w-5" />
              </button>
              <p className="hidden text-sm text-slate-500 sm:block">{formatHari(todayKey())}</p>
            </div>
            <div className="flex min-w-0 items-center gap-3">
              <div className="min-w-0 text-right">
                <p className="truncate text-sm font-bold text-slate-800">{nama}</p>
                <p className="truncate text-xs text-slate-500">{keterangan}</p>
              </div>
              <Avatar nama={nama} size="sm" />
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
