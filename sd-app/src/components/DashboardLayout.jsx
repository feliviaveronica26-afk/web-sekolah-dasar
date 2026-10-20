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
        <Card className="mx-auto mw-lg">
          <EmptyState icon={ServerOff} title="Server data tidak bisa dihubungi" desc="Pastikan server Laravel sedang berjalan, lalu coba lagi." />
          <div className="mt-n6 pb-8 text-center">
            <button type="button" onClick={muatUlang} className={btn.primary}>
              <RotateCcw className="ukuran-4" /> Coba lagi
            </button>
          </div>
        </Card>
      )
    }
    return (
      <p role="status" className="d-flex align-items-center justify-content-center gap-2 py-24 fs-sm text-tinta-3">
        <Loader2 className="ukuran-5 berputar" /> Memuat data sekolah...
      </p>
    )
  }
  const nis = user.role === 'siswa' ? user.nis : user.role === 'ortu' ? user.anakNis : null
  if (nis && !data.siswa.some((s) => s.nis === nis)) {
    return (
      <Card className="mx-auto mw-lg">
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

  const tombolBawah = 'd-flex w-100 align-items-center gap-3 rounded-pill px-3 py-2-5 fs-sm fw-bold transisi'
  const sidebar = (
    <div className="d-flex h-100 flex-column">
      <div className="d-flex align-items-center justify-content-between px-5 pb-4 pt-5">
        <Logo />
        <button type="button" onClick={() => setBuka(false)} className="btn btn-polos btn-ikon d-xl-none" aria-label="Tutup menu">
          <X className="ukuran-5" />
        </button>
      </div>

      {/* Kartu pengguna */}
      <div className="position-relative isolate mx-4 mb-3 overflow-hidden rounded-4 bg-merah-tua p-4 text-white">
        <span aria-hidden="true" className="kartu-pengguna__cincin" />
        <div className="position-relative d-flex align-items-center gap-3">
          <Avatar nama={nama} className="bg-white text-merah-700 cincin-putih-40" />
          <div className="min-w-0">
            <p className="text-truncate fw-extrabold ls-tight">{nama}</p>
            <p className="text-truncate fs-xs text-krem">{keterangan}</p>
          </div>
        </div>
        <p className="position-relative mt-3 d-inline-flex align-items-center gap-1-5 rounded-pill bg-white bg-opacity-10 px-2-5 py-0-5 fs-2xs fw-bold border border-white border-opacity-20">
          <span aria-hidden="true" className="ukuran-1-5 rounded-circle bg-stabilo" /> Portal {LABEL_ROLE[user.role]}
        </p>
      </div>

      <nav className="flex-1 d-flex flex-column gap-4 overflow-y-auto px-3 pb-3">
        {kelompok.map((k, i) => (
          <div key={k.judul ?? i}>
            {k.judul && <p className="px-3 pb-1-5 fs-2xs fw-bold text-uppercase ls-wider text-tinta-3">{k.judul}</p>}
            <div className="d-flex flex-column gap-0-5">
              {k.items.map(({ to, label, icon: Icon, end, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `menu-portal d-flex align-items-center gap-3 rounded-pill px-3 py-2-5 fs-sm fw-bold transisi tekan ${
                      isActive ? 'aktif bg-primary text-white bayangan-aktif' : 'text-tinta-2 hover-latar-merah hover-teks-merah'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`menu-portal__ikon d-flex align-items-center justify-content-center ukuran-8 rounded-circle transisi ${isActive ? 'ikon-aktif bg-white text-primary shadow-sm' : 'bg-abu-100 text-tinta-3'}`}
                      >
                        <Icon className="ukuran-4" />
                      </span>
                      <span className="flex-1">{label}</span>
                      {/* key = jumlahnya: lencana memantul setiap kali angkanya berubah (mis. chat baru masuk) */}
                      {badge && jumlahBadge[badge] > 0 && (
                        <span key={jumlahBadge[badge]} className="lencana-pop rounded-pill bg-stabilo px-2 py-0-5 fs-xs fw-bold text-tinta">
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

      <div className="d-flex flex-column gap-0-5 border-top border-abu-100 p-3">
        <NavLink to="/" className={`${tombolBawah} text-tinta-2 hover-latar-abu`}>
          <Globe className="ukuran-5" /> Lihat Website
        </NavLink>
        {!user.wajibGanti && (
          <button
            type="button"
            onClick={() => {
              setBuka(false)
              setGantiPassword(true)
            }}
            className={`${tombolBawah} text-tinta-2 hover-latar-abu`}
          >
            <KeyRound className="ukuran-5" /> Ganti Password
          </button>
        )}
        <button type="button" onClick={keluar} className={`${tombolBawah} text-danger hover-latar-merah`}>
          <LogOut className="ukuran-5" /> Keluar
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-vh-100">
      {/* Sidebar desktop */}
      <aside className="position-fixed top-0 bottom-0 start-0 d-none d-xl-block w-72 border-end border-garis bg-white">{sidebar}</aside>

      {/* Sidebar HP: offcanvas Bootstrap, dibuka-tutup lewat state React */}
      {laciTampil && (
        <div className="position-fixed inset-0 z-50 d-xl-none" data-keluar={laciKeluar || undefined}>
          <div className="latar-modal latar-gelap position-absolute inset-0 buram-sm" onClick={() => setBuka(false)} />
          <aside className="laci offcanvas offcanvas-start show shadow-lg" aria-label="Menu portal">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="isi-portal">
        <header className="position-sticky top-0 z-30 border-bottom border-garis latar-header buram">
          <div className="d-flex align-items-center justify-content-between gap-3 px-4 py-3 px-sm-8">
            <div className="d-flex align-items-center gap-3">
              <button type="button" onClick={() => setBuka(true)} className="btn btn-polos btn-ikon d-xl-none" aria-label="Buka menu">
                <Menu className="ukuran-5" />
              </button>
              <p className="d-none d-sm-block fs-sm text-tinta-3">{formatHari(todayKey())}</p>
            </div>
            <div className="d-flex min-w-0 align-items-center gap-2 gap-sm-3">
              {/* Notifikasi */}
              <div ref={notifRef} className="position-relative">
                <button
                  type="button"
                  onClick={() => setNotif(!notif)}
                  className="btn btn-polos btn-ikon position-relative p-2-5"
                  aria-label={`Notifikasi (${totalNotif})`}
                  aria-expanded={notif}
                >
                  {/* Lonceng bergoyang sekali setiap jumlah notifikasi berubah */}
                  <Bell key={`lonceng-${totalNotif}`} className={`ukuran-5 ${totalNotif > 0 ? 'lonceng-goyang' : ''}`} />
                  {totalNotif > 0 && (
                    <span key={`angka-${totalNotif}`} className="angka-notif lencana-pop position-absolute d-flex align-items-center justify-content-center rounded-pill bg-primary px-1 fw-bold text-white">
                      {totalNotif > 9 ? '9+' : totalNotif}
                    </span>
                  )}
                </button>
                {notifTampil && (
                  <div data-keluar={notifKeluar || undefined} className="panel-notif menu-turun dropdown-menu show position-absolute end-0 top-100 mt-2 p-0 overflow-hidden">
                    <p className="border-bottom border-abu-100 px-4 py-3 fw-extrabold text-tinta">Notifikasi</p>
                    {notifikasi.length === 0 ? (
                      <p className="px-4 py-8 text-center fs-sm text-tinta-3">Semua beres! Tidak ada yang perlu ditindaklanjuti.</p>
                    ) : (
                      <ul className="pembatas-y pembatas-abu overflow-y-auto" style={{ maxHeight: '20rem' }}>
                        {notifikasi.map(({ to, label, icon: Icon, badge }) => (
                          <li key={to}>
                            <Link to={to} className="dropdown-item d-flex align-items-center gap-3 px-4 py-3 text-wrap">
                              <span className="d-flex align-items-center justify-content-center ukuran-9 flex-shrink-0 rounded-circle bg-stabilo text-tinta">
                                <Icon className="ukuran-4" />
                              </span>
                              <span className="min-w-0 fs-sm">
                                <span className="d-block fw-semibold text-tinta">
                                  {typeof KET_BADGE[badge] === 'function' ? KET_BADGE[badge](jumlahBadge[badge]) : `${jumlahBadge[badge]} ${KET_BADGE[badge]}`}
                                </span>
                                <span className="d-block fs-xs text-tinta-3">{label}</span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              <div className="d-none d-sm-block min-w-0 text-end">
                <p className="text-truncate fs-sm fw-bold text-tinta">{nama}</p>
                <p className="text-truncate fs-xs text-tinta-3">{keterangan}</p>
              </div>
              <Avatar nama={nama} size="sm" />
            </div>
          </div>
        </header>
        <main className="px-4 py-6 px-sm-8 py-sm-8">
          {/* Kunci pathname: setiap pindah halaman, bagian-bagian isi muncul naik berurutan (lihat .masuk-halaman) */}
          <div key={pathname} className="masuk-halaman">
            <IsiPortal />
          </div>
        </main>
      </div>

      <Modal open={gantiPassword} onClose={() => setGantiPassword(false)} title="Ganti Password" size="sm">
        <p className="mb-4 fs-sm text-tinta-2">
          Setelah diganti, perangkat lain yang sedang login dengan akun <span className="fw-semibold text-tinta">{user.username}</span> akan dikeluarkan.
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
