import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Merek } from '../components/Navbar'
import { Foto, isian, labelIsian, tombol } from '../components/Situs'
import { Alert } from '../components/ui'
import { ALASAN_KELUAR_KEY, useAuth } from '../context/AuthContext'
import { AKUN_DEMO, LABEL_ROLE, SEKOLAH } from '../data/dummy'
import { FOTO } from '../data/foto'
import { BATAS_DIAM_MENIT, BATAS_SESI_JAM } from '../utils/keamanan'

const PESAN_KELUAR = {
  diam: `Anda keluar otomatis karena tidak ada aktivitas selama ${BATAS_DIAM_MENIT} menit. Silakan masuk kembali.`,
  kedaluwarsa: `Sesi Anda sudah berakhir (lebih dari ${BATAS_SESI_JAM} jam sejak masuk). Silakan masuk kembali.`,
  berakhir: 'Sesi Anda sudah berakhir. Silakan masuk kembali.',
}

const PORTAL = [
  ['Siswa', 'Jadwal, tugas, nilai, dan lencana'],
  ['Orang tua', 'Kehadiran, SPP, izin, dan chat wali kelas'],
  ['Guru & staf', 'Presensi, nilai, dan layanan sekolah'],
  ['Kepala sekolah', 'Laporan dan kebijakan'],
]

const formatTunggu = (detik) => (detik >= 60 ? `${Math.floor(detik / 60)} menit ${detik % 60} detik` : `${detik} detik`)

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [lihat, setLihat] = useState(false)
  const [error, setError] = useState('')
  const [manual, setManual] = useState(null)
  const [memproses, setMemproses] = useState(false)
  // Sisa detik penguncian dari server setelah terlalu banyak percobaan salah
  const [kunci, setKunci] = useState(0)
  const [alasanKeluar] = useState(() => sessionStorage.getItem(ALASAN_KELUAR_KEY))
  const usernameRef = useRef(null)

  useEffect(() => sessionStorage.removeItem(ALASAN_KELUAR_KEY), [])

  // Hitung mundur penguncian login
  useEffect(() => {
    if (!kunci) return
    const t = setTimeout(() => setKunci((k) => Math.max(0, k - 1)), 1000)
    return () => clearTimeout(t)
  }, [kunci])

  if (user) return <Navigate to={`/dashboard/${user.role}`} replace />

  const masuk = async (e) => {
    e.preventDefault()
    if (memproses || kunci) return
    setMemproses(true)
    setError('')
    const hasil = await login(username, password)
    setMemproses(false)
    if (hasil.error) {
      setError(hasil.error)
      if (hasil.terkunci) setKunci(hasil.terkunci)
      return
    }
    const tujuan = location.state?.from
    navigate(tujuan?.startsWith(`/dashboard/${hasil.user.role}`) ? tujuan : `/dashboard/${hasil.user.role}`, { replace: true })
  }

  const isiDemo = (akun) => {
    setUsername(akun.username)
    setPassword(akun.password)
    setError('')
    setManual(null)
  }

  const isiManual = (role) => {
    setUsername('')
    setPassword('')
    setError('')
    setManual(role)
    usernameRef.current?.focus()
  }

  const kartuAkun = (aktif) =>
    `min-h-11 rounded-xl border px-2 py-2 text-center transition ${aktif ? 'border-primary-700 bg-primary-700 text-white' : 'border-garis bg-white text-tinta hover:border-primary-600/60'}`

  return (
    <div className="situs grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
      {/* Panel merah berlatar foto */}
      <div className="relative isolate hidden flex-col justify-between overflow-hidden bg-primary-800 p-12 text-white lg:flex xl:p-16">
        <span aria-hidden="true" className="absolute inset-0 -z-20">
          <Foto foto={FOTO.sahabat} alt="" prioritas />
        </span>
        <span aria-hidden="true" className="absolute inset-0 -z-10 bg-primary-800/[0.88]" />
        <span className="w-fit rounded-2xl bg-white px-4 py-2.5">
          <Merek />
        </span>
        <div>
          <p className="inline-flex rounded-full bg-stabilo px-3.5 py-1.5 text-sm font-bold text-tinta">Selamat datang kembali</p>
          <p className="mt-5 max-w-md text-5xl font-extrabold leading-[1.05] tracking-tight">Satu portal untuk seluruh warga sekolah.</p>
          <dl className="mt-10 grid max-w-lg grid-cols-2 gap-3">
            {PORTAL.map(([j, d]) => (
              <div key={j} className="rounded-2xl bg-white/10 p-4 text-[15px] ring-1 ring-inset ring-white/15 backdrop-blur-sm">
                <dt className="font-bold">{j}</dt>
                <dd className="mt-1 leading-snug text-krem">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="text-sm font-semibold text-krem">{SEKOLAH.slogan}.</p>
      </div>

      {/* Formulir */}
      <main className="flex flex-col justify-center px-4 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-tinta-2 hover:text-tinta">
            <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
          </Link>
          <div className="mt-6 lg:hidden">
            <Merek />
          </div>
          <h1 className="mt-8 text-[2.75rem] leading-tight sm:text-5xl">Masuk ke portal</h1>
          <p className="mt-3 text-tinta-2">Silakan masuk menggunakan akun yang diberikan sekolah.</p>

          <form onSubmit={masuk} className="mt-8 space-y-5">
            <div aria-live="polite">
              {alasanKeluar && PESAN_KELUAR[alasanKeluar] && !error && <Alert tone="info">{PESAN_KELUAR[alasanKeluar]}</Alert>}
              {kunci > 0 ? (
                <Alert tone="error">
                  Login dikunci sementara karena terlalu banyak percobaan yang salah. Coba lagi dalam <b>{formatTunggu(kunci)}</b>.
                </Alert>
              ) : (
                error && <Alert tone="error">{error}</Alert>
              )}
            </div>
            <div>
              <label htmlFor="username" className={labelIsian}>
                Username
              </label>
              <input
                id="username"
                ref={usernameRef}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={isian}
                placeholder="Masukkan username"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className={labelIsian}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={lihat ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${isian} pr-12`}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setLihat(!lihat)}
                  className="absolute inset-y-0 right-0 grid w-12 place-items-center text-tinta-3 hover:text-tinta"
                  aria-label={lihat ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {lihat ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={memproses || kunci > 0} className={`${tombol.utama} w-full`}>
              {memproses && <Loader2 className="h-4 w-4 animate-spin" />} {memproses ? 'Memeriksa...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-10 rounded-[1.75rem] bg-kertas-tua/70 p-5">
            {Object.entries(LABEL_ROLE).map(([role, label]) => (
              <div key={role} className="mt-4 first:mt-0">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-tinta-3">{label}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {/* Peran tanpa akun demo (Kepala Sekolah): kolom dikosongkan, diisi manual */}
                  {!AKUN_DEMO.some((a) => a.role === role) && (
                    <button type="button" onClick={() => isiManual(role)} aria-pressed={manual === role} className={kartuAkun(manual === role)}>
                      <span className="block text-sm font-semibold">{label}</span>
                    </button>
                  )}
                  {AKUN_DEMO.filter((a) => a.role === role).map((a) => (
                    <button key={a.username} type="button" onClick={() => isiDemo(a)} aria-pressed={username === a.username} className={kartuAkun(username === a.username)}>
                      <span className="block text-sm font-semibold">{a.label}</span>
                      <span className={`block text-xs ${username === a.username ? 'text-white/80' : 'text-tinta-3'}`}>{a.username}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
