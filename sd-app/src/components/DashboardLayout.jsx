import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  BookOpenCheck,
  Boxes,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  Contact,
  Fingerprint,
  KeyRound,
  Landmark,
  ClipboardList,
  FileCheck,
  FileText,
  Globe,
  GraduationCap,
  HeartHandshake,
  HouseHeart,
  IdCard,
  LayoutDashboard,
  Library,
  ListChecks,
  LogOut,
  Megaphone,
  Loader2,
  Menu,
  MessagesSquare,
  RotateCcw,
  ServerOff,
  UserX,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Star,
  Tent,
  UserPlus,
  Users,
  Wallet,
  Wrench,
  X,
} from 'lucide-react'
import Logo from './Logo'
import { FormGantiPassword, WajibGantiPassword } from './GantiPassword'
import { Avatar, Card, EmptyState, Modal, btn } from './ui'
import { useAuth } from '../context/AuthContext'
import { useChatSaya } from '../context/ChatContext'
import { useData } from '../context/DataContext'
import { PERAN, useAkses } from '../context/akses'
import { LABEL_ROLE } from '../data/dummy'
import { formatHari, isHariSekolah, todayKey } from '../utils/format'
import { useAnimasiKeluar } from '../utils/gerak'
import { sesiAktifKelas, sudahHadirDiSesi } from '../utils/otp'
import { bulanWajibBayar } from '../utils/spp'

// Menu portal Siswa & Orang Tua, dikelompokkan agar mudah dipindai
const MENU_TETAP = {
  siswa: [
    { judul: null, items: [{ to: '/dashboard/siswa', label: 'Beranda', icon: LayoutDashboard, end: true }] },
    {
      judul: 'Belajar',
      items: [
        { to: '/dashboard/siswa/presensi', label: 'Presensi Hari Ini', icon: KeyRound, badge: 'presensiSiswa' },
        { to: '/dashboard/siswa/jadwal', label: 'Jadwal Pelajaran', icon: BookOpen },
        { to: '/dashboard/siswa/tugas', label: 'Tugas & PR', icon: ClipboardList, badge: 'tugas' },
        { to: '/dashboard/siswa/nilai', label: 'Nilai Saya', icon: Star },
        { to: '/dashboard/siswa/absensi', label: 'Absensi per Mapel', icon: CalendarCheck },
      ],
    },
    {
      judul: 'Komunikasi',
      items: [
        { to: '/dashboard/siswa/chat', label: 'Chat Kelas', icon: MessagesSquare, badge: 'chat' },
        { to: '/dashboard/siswa/pengumuman', label: 'Pengumuman', icon: Megaphone },
      ],
    },
    {
      judul: 'Kegiatan',
      items: [
        { to: '/dashboard/siswa/lencana', label: 'Lencana & Poin', icon: Award },
        { to: '/dashboard/siswa/ekskul', label: 'Ekstrakurikuler', icon: Tent },
        { to: '/dashboard/siswa/perpustakaan', label: 'Perpustakaan', icon: Library },
        { to: '/dashboard/siswa/kalender', label: 'Kalender Akademik', icon: CalendarDays },
      ],
    },
    { judul: 'Akun', items: [{ to: '/dashboard/siswa/profil', label: 'Profil Saya', icon: IdCard }] },
  ],
  ortu: [
    { judul: null, items: [{ to: '/dashboard/ortu', label: 'Beranda', icon: LayoutDashboard, end: true }] },
    {
      judul: 'Perkembangan Ananda',
      items: [
        { to: '/dashboard/ortu/nilai', label: 'Nilai & Rapor', icon: Star },
        { to: '/dashboard/ortu/sikap', label: 'Catatan Sikap', icon: Award },
        { to: '/dashboard/ortu/tugas', label: 'Tugas Ananda', icon: ListChecks, badge: 'tugasAnak' },
        { to: '/dashboard/ortu/absensi', label: 'Absensi', icon: CalendarCheck },
      ],
    },
    {
      judul: 'Komunikasi',
      items: [
        { to: '/dashboard/ortu/chat', label: 'Chat', icon: MessagesSquare, badge: 'chat' },
        { to: '/dashboard/ortu/izin', label: 'Izin Tidak Masuk', icon: FileText },
        { to: '/dashboard/ortu/pengumuman', label: 'Pengumuman', icon: Megaphone },
      ],
    },
    {
      judul: 'Administrasi',
      items: [
        { to: '/dashboard/ortu/spp', label: 'Pembayaran SPP', icon: Wallet, badge: 'spp' },
        { to: '/dashboard/ortu/keluarga', label: 'Data Keluarga', icon: HouseHeart },
        { to: '/dashboard/ortu/kalender', label: 'Kalender Akademik', icon: CalendarDays },
      ],
    },
  ],
}

// Menu Portal Guru & Staf / Kepala Sekolah, ditampilkan sesuai hak akses (urutan tetap)
const MENU_KELOLA = {
  presensi: { label: 'Presensi Staf', icon: Fingerprint, badge: 'presensi' },
  chat: { label: 'Chat', icon: MessagesSquare, badge: 'chat' },
  kelas: { label: 'Daftar Siswa', icon: Contact },
  absensi: { label: 'Presensi Siswa', icon: ClipboardCheck },
  izin: { label: 'Persetujuan Izin', icon: FileCheck, badge: 'izin' },
  nilai: { label: 'Input Nilai', icon: NotebookPen },
  tugas: { label: 'Tugas Kelas', icon: ClipboardList },
  sikap: { label: 'Poin Sikap', icon: Award },
  rapor: { label: 'Rapor Kelas', icon: BookOpenCheck },
  siswa: { label: 'Data Siswa', icon: Users },
  ortu: { label: 'Data Orang Tua', icon: HouseHeart },
  kehadiran: { label: 'Rekap Kehadiran', icon: BarChart3 },
  konseling: { label: 'Bimbingan Konseling', icon: HeartHandshake },
  jadwal: { label: 'Jadwal Pelajaran', icon: BookOpen },
  kalender: { label: 'Kalender Akademik', icon: CalendarDays },
  pengumuman: { label: 'Pengumuman', icon: Megaphone },
  guru: { label: 'Data Guru & Staf', icon: GraduationCap },
  keuangan: { label: 'Keuangan Sekolah', icon: Landmark },
  spp: { label: 'Keuangan SPP', icon: Wallet },
  ppdb: { label: 'PPDB Online', icon: UserPlus, badge: 'ppdb' },
  kunjungan: { label: 'Kunjungan Sekolah', icon: CalendarClock, badge: 'kunjungan' },
  perpustakaan: { label: 'Perpustakaan', icon: Library, badge: 'reservasi' },
  inventaris: { label: 'Inventaris Sarpras', icon: Boxes },
  kerusakan: { label: 'Laporan Kerusakan', icon: Wrench, badge: 'kerusakan' },
  bukutamu: { label: 'Buku Tamu', icon: ShieldCheck, badge: 'bukutamu' },
}

const KELOMPOK_KELOLA = [
  { judul: 'Kelas Saya', menu: ['kelas', 'absensi', 'izin', 'nilai', 'tugas', 'sikap', 'rapor'] },
  { judul: 'Kesiswaan', menu: ['siswa', 'ortu', 'kehadiran', 'konseling'] },
  { judul: 'Akademik', menu: ['jadwal', 'kalender', 'pengumuman'] },
  { judul: 'Administrasi', menu: ['guru', 'keuangan', 'spp', 'ppdb', 'kunjungan'] },
  { judul: 'Sarana & Layanan', menu: ['perpustakaan', 'inventaris', 'kerusakan', 'bukutamu'] },
]

// Keterangan notifikasi untuk tiap lencana angka (teks atau fungsi dari jumlahnya)
const KET_BADGE = {
  izin: 'pengajuan izin menunggu persetujuan',
  tugas: 'tugas belum selesai',
  tugasAnak: 'tugas ananda belum selesai',
  spp: 'bulan SPP perlu dibayar',
  kunjungan: 'permintaan kunjungan baru',
  ppdb: 'pendaftar menunggu verifikasi',
  bukutamu: 'tamu masih di dalam sekolah',
  kerusakan: 'laporan kerusakan baru',
  reservasi: 'pesanan buku dari siswa',
  chat: 'pesan chat belum dibaca',
  presensi: 'pengajuan izin guru/staf menunggu persetujuan',
  presensiSaya: () => 'Anda belum absen masuk hari ini',
  presensiSiswa: () => 'Guru sudah membuka presensi, masukkan kodenya',
}

// Halaman portal baru tampil setelah data milik akun ini selesai dimuat dari server
function IsiPortal() {
  const { user } = useAuth()
  const { data, siap, status, muatUlang } = useData()
  // Akun dengan password awal dari sekolah: buat password sendiri dulu (server juga menolak perubahan data)
  if (user.wajibGanti) return <WajibGantiPassword />
  if (!siap) {
    if (status === 'terputus') {
      return (
        <Card className="mx-auto max-w-lg">
          <EmptyState icon={ServerOff} title="Server data tidak bisa dihubungi" desc="Pastikan server Laravel sedang berjalan, lalu coba lagi." />
          <div className="-mt-6 pb-8 text-center">
            <button onClick={muatUlang} className={btn.primary}>
              <RotateCcw className="h-4 w-4" /> Coba lagi
            </button>
          </div>
        </Card>
      )
    }
    return (
      <p role="status" className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" /> Memuat data sekolah...
      </p>
    )
  }
  const nis = user.role === 'siswa' ? user.nis : user.role === 'ortu' ? user.anakNis : null
  if (nis && !data.siswa.some((s) => s.nis === nis)) {
    return (
      <Card className="mx-auto max-w-lg">
        <EmptyState icon={UserX} title="Data siswa tidak ditemukan" desc="Akun ini belum terhubung ke data siswa yang aktif. Silakan hubungi Tata Usaha." />
      </Card>
    )
  }
  return <Outlet />
}

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const { data, beritahu } = useData()
  const akses = useAkses()
  const [gantiPassword, setGantiPassword] = useState(false)
  // Semua portal memakai shell bergaya beranda (reskin size-preserving; lihat .portal-situs & .situs di index.css).
  // Catatan: ini hanya kulit shell; layout halaman per peran tidak ikut berubah (useGayaSitus tetap untuk itu).
  const situs = true
  const { belum: chatBelum } = useChatSaya()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [buka, setBuka] = useState(false)
  const [notif, setNotif] = useState(false)
  const notifRef = useRef(null)
  // Laci menu HP & panel notifikasi tetap terpasang sebentar agar animasi keluarnya sempat berjalan
  const [laciTampil, laciKeluar] = useAnimasiKeluar(buka)
  const [notifTampil, notifKeluar] = useAnimasiKeluar(notif, 120)

  useEffect(() => {
    setBuka(false)
    setNotif(false)
  }, [pathname])

  // Tutup panel notifikasi saat klik di luar
  useEffect(() => {
    if (!notif) return
    const luar = (e) => notifRef.current && !notifRef.current.contains(e.target) && setNotif(false)
    document.addEventListener('mousedown', luar)
    return () => document.removeEventListener('mousedown', luar)
  }, [notif])

  const kelola = user.role === 'staf' || user.role === 'kepsek'
  const kelompok = kelola
    ? [
        {
          judul: null,
          items: [
            { to: akses.base, label: 'Beranda', icon: LayoutDashboard, end: true },
            // Presensi dipakai setiap hari oleh semua staf, jadi diletakkan paling atas
            { to: `${akses.base}/presensi`, ...MENU_KELOLA.presensi, badge: user.role === 'kepsek' ? 'presensi' : 'presensiSaya' },
            ...(akses.punya('chat') ? [{ to: `${akses.base}/chat`, ...MENU_KELOLA.chat }] : []),
          ],
        },
        ...KELOMPOK_KELOLA.map((k) => ({
          // Kepala sekolah tidak memegang kelas sendiri
          judul: k.judul === 'Kelas Saya' && user.role === 'kepsek' ? 'Pembelajaran' : k.judul,
          items: k.menu.filter((m) => akses.punya(m)).map((m) => ({ to: `${akses.base}/${m}`, ...MENU_KELOLA[m] })),
        })).filter((k) => k.items.length),
      ]
    : MENU_TETAP[user.role]

  const nisAnak = user.anakNis
  const anak = data.siswa.find((s) => s.nis === nisAnak)
  const jumlahBadge = {
    izin: data.izin.filter((i) => i.kelas === akses.kelas && i.status === 'Menunggu').length,
    tugas: data.tugas.filter((t) => t.kelas === user.kelas && !(data.tugasSelesai[user.nis] ?? []).includes(t.id)).length,
    tugasAnak: anak ? data.tugas.filter((t) => t.kelas === anak.kelas && t.tenggat >= todayKey() && !(data.tugasSelesai[nisAnak] ?? []).includes(t.id)).length : 0,
    spp: nisAnak ? bulanWajibBayar(data, nisAnak).length : 0,
    kunjungan: data.kunjungan.filter((k) => k.status === 'Menunggu').length,
    ppdb: data.pendaftar.filter((p) => p.status === 'Menunggu Verifikasi').length,
    // Tamu hari ini yang belum tercatat keluar
    bukutamu: data.bukuTamu.filter((t) => t.tanggal === todayKey() && !t.keluar).length,
    kerusakan: data.kerusakan.filter((k) => k.status === 'Dilaporkan').length,
    reservasi: data.reservasi.filter((r) => r.status === 'Menunggu').length,
    chat: chatBelum,
    presensi: data.izinStaf.filter((i) => i.status === 'Menunggu').length,
    presensiSaya: akses.guruId && isHariSekolah(new Date()) && !data.presensiStaf[todayKey()]?.[akses.guruId] ? 1 : 0,
    presensiSiswa: (() => {
      if (user.role !== 'siswa') return 0
      const sesi = sesiAktifKelas(data, user.kelas, todayKey())
      return sesi && !sudahHadirDiSesi(data, sesi, user.nis) ? 1 : 0
    })(),
  }

  const semuaItem = kelompok.flatMap((k) => k.items)
  const notifikasi = semuaItem.filter((m) => m.badge && jumlahBadge[m.badge] > 0)
  const totalNotif = notifikasi.reduce((a, m) => a + jumlahBadge[m.badge], 0)

  const nama = kelola ? akses.nama : user.nama
  const keterangan =
    user.role === 'staf'
      ? akses.peran.map((p) => (p === 'wali_kelas' ? `Wali Kelas ${akses.kelas}` : PERAN[p]?.label)).join(' · ') || 'Guru & Staf'
      : user.role === 'ortu' && anak
        ? `Orang tua ${anak.nama.split(' ')[0]} · ${anak.kelas}`
        : `${LABEL_ROLE[user.role]}${user.kelas ? ` · Kelas ${user.kelas}` : ''}`

  const keluar = () => {
    logout()
    navigate('/login')
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-4 pt-5">
        <Logo />
        <button onClick={() => setBuka(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 xl:hidden" aria-label="Tutup menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Kartu pengguna */}
      <div
        className={`relative isolate mx-4 mb-3 overflow-hidden p-4 text-white ${situs ? 'rounded-[1.5rem] bg-primary-700' : 'rounded-2xl bg-linear-to-br from-primary-600 to-primary-700'}`}
      >
        {situs ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 -z-10 h-48 w-48 rounded-full border-[2.25rem] border-white/[0.07]"
          />
        ) : (
          <div className="pola-titik absolute inset-0" />
        )}
        <div className="relative flex items-center gap-3">
          <Avatar nama={nama} className="bg-white text-primary-700 ring-2 ring-white/40" />
          <div className="min-w-0">
            <p className={`truncate ${situs ? 'font-extrabold tracking-tight' : 'font-bold'}`}>{nama}</p>
            <p className={`truncate text-xs ${situs ? 'text-krem' : 'text-primary-100'}`}>{keterangan}</p>
          </div>
        </div>
        {situs ? (
          <p className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ring-white/20">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-stabilo" /> Portal {LABEL_ROLE[user.role]}
          </p>
        ) : (
          <p className="relative mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold">
            <Sparkles className="h-3 w-3 text-amber-300" /> Portal {LABEL_ROLE[user.role]}
          </p>
        )}
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-3">
        {kelompok.map((k, i) => (
          <div key={k.judul ?? i}>
            {k.judul && <p className={`px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider ${situs ? 'text-tinta-3' : 'text-slate-400'}`}>{k.judul}</p>}
            <div className="space-y-0.5">
              {k.items.map(({ to, label, icon: Icon, end, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 text-sm transition ${situs ? 'rounded-full font-bold' : 'rounded-xl font-semibold'} ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`grid h-8 w-8 place-items-center transition ${situs ? 'rounded-full' : 'rounded-lg'} ${isActive ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-primary-600 group-hover:shadow-sm'}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1">{label}</span>
                      {badge && jumlahBadge[badge] > 0 && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${situs ? 'bg-stabilo text-tinta' : 'bg-amber-400 text-amber-950'}`}>
                          {jumlahBadge[badge]}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-slate-100 p-3">
        <NavLink
          to="/"
          className={`flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 ${situs ? 'rounded-full font-bold' : 'rounded-xl font-semibold'}`}
        >
          <Globe className="h-5 w-5" /> Lihat Website
        </NavLink>
        {!user.wajibGanti && (
          <button
            onClick={() => {
              setBuka(false)
              setGantiPassword(true)
            }}
            className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 ${situs ? 'rounded-full font-bold' : 'rounded-xl font-semibold'}`}
          >
            <KeyRound className="h-5 w-5" /> Ganti Password
          </button>
        )}
        <button
          onClick={keluar}
          className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 ${situs ? 'rounded-full font-bold' : 'rounded-xl font-semibold'}`}
        >
          <LogOut className="h-5 w-5" /> Keluar
        </button>
      </div>
    </div>
  )

  return (
    <div className={situs ? 'situs portal-situs min-h-screen' : 'min-h-screen bg-slate-50'}>
      {/* Sidebar desktop */}
      <aside className={`fixed inset-y-0 left-0 hidden w-72 border-r bg-white xl:block ${situs ? 'border-garis' : 'border-slate-200'}`}>{sidebar}</aside>

      {/* Sidebar mobile */}
      {laciTampil && (
        <div className="fixed inset-0 z-50 xl:hidden" data-keluar={laciKeluar || undefined}>
          <div className="latar-modal absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setBuka(false)} />
          <aside className="laci absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="xl:pl-72">
        <header className={`sticky top-0 z-30 border-b backdrop-blur ${situs ? 'border-garis bg-kertas/90' : 'border-slate-200 bg-white/90'}`}>
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setBuka(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 xl:hidden" aria-label="Buka menu">
                <Menu className="h-5 w-5" />
              </button>
              <p className="hidden text-sm text-slate-500 sm:block">{formatHari(todayKey())}</p>
            </div>
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              {/* Notifikasi */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotif(!notif)}
                  className="relative rounded-full p-2.5 text-slate-600 hover:bg-slate-100"
                  aria-label={`Notifikasi (${totalNotif})`}
                  aria-expanded={notif}
                >
                  <Bell className="h-5 w-5" />
                  {totalNotif > 0 && (
                    <span className="absolute right-1 top-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                      {totalNotif > 9 ? '9+' : totalNotif}
                    </span>
                  )}
                </button>
                {notifTampil && (
                  <div
                    data-keluar={notifKeluar || undefined}
                    className={`menu-turun absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden bg-white shadow-2xl ring-1 ring-slate-200 ${situs ? 'rounded-[1.5rem]' : 'rounded-2xl'}`}
                  >
                    <p className={`border-b border-slate-100 px-4 py-3 text-slate-900 ${situs ? 'font-extrabold' : 'font-bold'}`}>Notifikasi</p>
                    {notifikasi.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-slate-500">Semua beres! Tidak ada yang perlu ditindaklanjuti.{situs ? '' : ' 🎉'}</p>
                    ) : (
                      <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                        {notifikasi.map(({ to, label, icon: Icon, badge }) => (
                          <li key={to}>
                            <Link to={to} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                              <span
                                className={`grid h-9 w-9 shrink-0 place-items-center ${situs ? 'rounded-full bg-stabilo text-tinta' : 'rounded-xl bg-amber-50 text-amber-600'}`}
                              >
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="min-w-0 text-sm">
                                <span className="block font-semibold text-slate-800">
                                  {typeof KET_BADGE[badge] === 'function' ? KET_BADGE[badge](jumlahBadge[badge]) : `${jumlahBadge[badge]} ${KET_BADGE[badge]}`}
                                </span>
                                <span className="block text-xs text-slate-500">{label}</span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              <div className="hidden min-w-0 text-right sm:block">
                <p className="truncate text-sm font-bold text-slate-800">{nama}</p>
                <p className="truncate text-xs text-slate-500">{keterangan}</p>
              </div>
              <Avatar nama={nama} size="sm" />
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-8 sm:py-8">
          {/* Kunci pathname: setiap pindah halaman, bagian-bagian isi muncul naik berurutan (lihat .masuk-halaman) */}
          <div key={pathname} className="masuk-halaman">
            <IsiPortal />
          </div>
        </main>
      </div>

      <Modal open={gantiPassword} onClose={() => setGantiPassword(false)} title="Ganti Password" size="max-w-md">
        <p className="mb-4 text-sm text-slate-600">
          Setelah diganti, perangkat lain yang sedang login dengan akun <span className="font-semibold text-slate-800">{user.username}</span> akan dikeluarkan.
        </p>
        <FormGantiPassword
          onSelesai={() => {
            setGantiPassword(false)
            beritahu('Password berhasil diganti.')
          }}
          tombolLain={
            <button type="button" onClick={() => setGantiPassword(false)} className={btn.secondary}>
              Batal
            </button>
          }
        />
      </Modal>
    </div>
  )
}
