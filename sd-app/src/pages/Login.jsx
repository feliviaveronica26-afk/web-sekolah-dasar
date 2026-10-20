import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Muncul, TeksNaik } from '../components/Hiasan'
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

  const kartuAkun = (aktif) => `btn rounded-2 min-h-11 px-2 py-2 d-block text-center ${aktif ? 'btn-primary' : 'btn-kedua'}`

  return (
    <div className="d-grid min-vh-100 tata-login">
      {/* Panel merah berlatar foto */}
      <div className="position-relative isolate d-none d-lg-flex flex-column justify-content-between overflow-hidden bg-merah-800 p-12 p-xl-16 text-white">
        <span aria-hidden="true" className="position-absolute inset-0 z-n2">
          <Foto foto={FOTO.sahabat} alt="" prioritas className="foto-pelan" />
        </span>
        <span aria-hidden="true" className="tirai-login position-absolute inset-0 z-n1" />
        <span className="turun-awal align-self-start rounded-3 bg-white px-4 py-2-5">
          <Merek />
        </span>
        <div>
          <p className="masuk-awal d-inline-flex rounded-pill bg-stabilo px-3-5 py-1-5 fs-sm fw-bold text-tinta" style={{ '--tunda': '150ms' }}>
            Selamat datang kembali
          </p>
          <p className="mt-5 mw-md fs-5xl fw-extrabold lh-105 ls-tight" style={{ '--tunda-teks': '250ms' }}>
            <TeksNaik teks="Satu portal untuk seluruh warga sekolah." />
          </p>
          <Muncul as="dl" gaya="bertahap" jeda={600} className="mt-10 d-grid mw-lg kolom-2 gap-3">
            {PORTAL.map(([j, d]) => (
              <div key={j} className="rounded-3 bg-white bg-opacity-10 p-4 fs-15 border border-white border-opacity-15 buram-sm">
                <dt className="fw-bold">{j}</dt>
                <dd className="mt-1 lh-snug text-krem">{d}</dd>
              </div>
            ))}
          </Muncul>
        </div>
        <p className="masuk-awal fs-sm fw-semibold text-krem" style={{ '--tunda': '1000ms' }}>
          {SEKOLAH.slogan}.
        </p>
      </div>

      {/* Formulir: bagian-bagiannya muncul berurutan (lihat .bertahap) */}
      <main className="d-flex flex-column justify-content-center px-4 py-10 px-sm-12">
        <div className="bertahap mx-auto w-100 mw-md">
          <Link to="/" className="d-inline-flex min-h-11 align-items-center gap-1-5 fs-sm fw-semibold text-tinta-2 hover-teks-tinta">
            <ArrowLeft className="ukuran-4" /> Kembali ke beranda
          </Link>
          <div className="mt-6 d-lg-none">
            <Merek />
          </div>
          <h1 className="judul-login mt-8 lh-tight">Masuk ke portal</h1>
          <p className="mt-3 text-tinta-2">Silakan masuk menggunakan akun yang diberikan sekolah.</p>

          <form onSubmit={masuk} className="mt-8 d-flex flex-column gap-5">
            <div aria-live="polite">
              {alasanKeluar && PESAN_KELUAR[alasanKeluar] && !error && <Alert tone="info">{PESAN_KELUAR[alasanKeluar]}</Alert>}
              {/* Pesan galat bergetar singkat setiap muncul (setiap percobaan yang gagal) */}
              {kunci > 0 ? (
                <div className="goyang-galat">
                  <Alert tone="error">
                    Login dikunci sementara karena terlalu banyak percobaan yang salah. Coba lagi dalam <b>{formatTunggu(kunci)}</b>.
                  </Alert>
                </div>
              ) : (
                error && (
                  <div className="goyang-galat">
                    <Alert tone="error">{error}</Alert>
                  </div>
                )
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
              <div className="position-relative">
                <input
                  id="password"
                  type={lihat ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${isian} pe-12`}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setLihat(!lihat)}
                  className="position-absolute top-0 bottom-0 end-0 d-flex w-12 align-items-center justify-content-center text-tinta-3 hover-teks-tinta"
                  aria-label={lihat ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {lihat ? <EyeOff className="ukuran-5" /> : <Eye className="ukuran-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={memproses || kunci > 0} className={`${tombol.utama} w-100`}>
              {memproses && <Loader2 className="ukuran-4 berputar" />} {memproses ? 'Memeriksa...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-10 d-flex flex-column gap-4 rounded-kartu latar-kertas-lembut p-5">
            {Object.entries(LABEL_ROLE).map(([role, label]) => (
              <div key={role}>
                <p className="mb-2 fs-xs fw-semibold text-uppercase ls-widest text-tinta-3">{label}</p>
                <div className="d-grid kolom-2 kolom-sm-3 gap-2">
                  {/* Peran tanpa akun demo (Kepala Sekolah): kolom dikosongkan, diisi manual */}
                  {!AKUN_DEMO.some((a) => a.role === role) && (
                    <button type="button" onClick={() => isiManual(role)} aria-pressed={manual === role} className={kartuAkun(manual === role)}>
                      <span className="d-block fs-sm fw-semibold">{label}</span>
                    </button>
                  )}
                  {AKUN_DEMO.filter((a) => a.role === role).map((a) => (
                    <button key={a.username} type="button" onClick={() => isiDemo(a)} aria-pressed={username === a.username} className={kartuAkun(username === a.username)}>
                      <span className="d-block fs-sm fw-semibold">{a.label}</span>
                      <span className={`d-block fs-xs fw-normal ${username === a.username ? 'text-white text-opacity-80' : 'text-tinta-3'}`}>{a.username}</span>
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
