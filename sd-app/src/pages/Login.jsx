import { useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react'
import { Bintang, Gumpalan } from '../components/Hiasan'
import { Alert, btn, inputCls, labelCls } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { AKUN_DEMO, LABEL_ROLE, SEKOLAH } from '../data/dummy'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [lihat, setLihat] = useState(false)
  const [error, setError] = useState('')
  const [manual, setManual] = useState(null)
  const usernameRef = useRef(null)

  if (user) return <Navigate to={`/dashboard/${user.role}`} replace />

  const masuk = (e) => {
    e.preventDefault()
    const hasil = login(username, password)
    if (hasil.error) return setError(hasil.error)
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

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel kiri */}
      <div className="relative hidden overflow-hidden bg-linear-to-br from-primary-600 to-primary-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pola-titik absolute inset-0" />
        <Gumpalan className="absolute -right-28 -top-28 h-[26rem] w-[26rem] text-white/10" />
        <Bintang className="absolute right-16 top-32 h-7 w-7 animate-melayang text-amber-300" />
        <Link to="/" className="relative flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-14 w-14 object-contain drop-shadow-lg" />
          <span className="font-display text-2xl font-bold">{SEKOLAH.nama}</span>
        </Link>
        <div className="relative">
          <h1 className="text-5xl font-bold leading-tight">Satu portal untuk seluruh warga sekolah.</h1>
          <p className="mt-4 max-w-md text-lg text-primary-50">
            Pantau kehadiran, nilai, tugas, dan kabar sekolah dengan mudah dari mana saja.
          </p>
          <div className="mt-8 grid max-w-lg grid-cols-2 gap-3">
            {[
              ['🎒', 'Siswa', 'Tugas, nilai, lencana'],
              ['👨‍👩‍👧', 'Orang Tua', 'Kehadiran, SPP, pesan'],
              ['🧑‍🏫', 'Guru & Staf', 'Absensi, nilai, layanan'],
              ['🏫', 'Kepala Sekolah', 'Laporan & kebijakan'],
            ].map(([e, j, d]) => (
              <div key={j} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
                <p className="text-2xl">{e}</p>
                <p className="mt-2 font-display text-lg font-bold">{j}</p>
                <p className="text-sm text-primary-100">{d}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-primary-200">{SEKOLAH.slogan}</p>
      </div>

      {/* Form */}
      <div className="flex flex-col justify-center px-4 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600">
            <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
          </Link>
          <img src="/logo.png" alt="" className="mt-8 h-16 w-16 object-contain lg:hidden" />
          <h2 className="mt-6 text-4xl font-bold text-slate-900">Masuk ke Portal</h2>
          <p className="mt-2 text-slate-500">Silakan masuk menggunakan akun yang diberikan sekolah.</p>

          <form onSubmit={masuk} className="mt-8 space-y-4">
            {error && <Alert tone="error">{error}</Alert>}
            <div>
              <label htmlFor="username" className={labelCls}>Username</label>
              <input
                id="username"
                ref={usernameRef}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputCls}
                placeholder="Masukkan username"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className={labelCls}>Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={lihat ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputCls} pr-11`}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setLihat(!lihat)}
                  className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-600"
                  aria-label={lihat ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {lihat ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button type="submit" className={`${btn.primary} w-full py-3`}>
              <LogIn className="h-4 w-4" /> Masuk
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
            {Object.entries(LABEL_ROLE).map(([role, label]) => (
              <div key={role} className="mt-3 first:mt-0">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {/* Peran tanpa akun demo (Kepala Sekolah): kolom dikosongkan, diisi manual */}
                  {!AKUN_DEMO.some((a) => a.role === role) && (
                    <button
                      type="button"
                      onClick={() => isiManual(role)}
                      className={`rounded-xl border bg-white px-2 py-2 text-center transition hover:border-primary-300 hover:bg-primary-50 ${
                        manual === role ? 'border-primary-400 ring-2 ring-primary-100' : 'border-slate-200'
                      }`}
                    >
                      <span className="block text-sm font-bold text-slate-800">{label}</span>
                    </button>
                  )}
                  {AKUN_DEMO.filter((a) => a.role === role).map((a) => (
                    <button
                      key={a.username}
                      type="button"
                      onClick={() => isiDemo(a)}
                      className={`rounded-xl border bg-white px-2 py-2 text-center transition hover:border-primary-300 hover:bg-primary-50 ${
                        username === a.username ? 'border-primary-400 ring-2 ring-primary-100' : 'border-slate-200'
                      }`}
                    >
                      <span className="block text-sm font-bold text-slate-800">{a.label}</span>
                      <span className="block text-xs text-slate-500">{a.username}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
