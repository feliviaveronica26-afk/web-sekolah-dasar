import { useState } from 'react'
import { Eye, EyeOff, KeyRound, LogOut, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Alert, Card, btn, inputCls, labelCls } from './ui'
import { useAuth } from '../context/AuthContext'

const MIN = 8

// Satu isian password dengan tombol tampilkan/sembunyikan
function IsianPassword({ id, label, value, onChange, autoComplete, galat, petunjuk }) {
  const [lihat, setLihat] = useState(false)
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={lihat ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
          maxLength={72}
          aria-invalid={galat ? true : undefined}
          aria-describedby={petunjuk ? `${id}-petunjuk` : undefined}
          className={`${inputCls} pr-11 ${galat ? 'border-rose-400' : ''}`}
        />
        <button
          type="button"
          onClick={() => setLihat(!lihat)}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-slate-400 hover:text-slate-700"
          aria-label={lihat ? `Sembunyikan ${label.toLowerCase()}` : `Tampilkan ${label.toLowerCase()}`}
        >
          {lihat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {petunjuk && (
        <p id={`${id}-petunjuk`} className="mt-1.5 text-xs text-slate-500">
          {petunjuk}
        </p>
      )}
    </div>
  )
}

/*
  Formulir ganti password akun sendiri. Pemeriksaan sebenarnya (password lama, panjang, tidak memuat
  username) dilakukan server; di sini hanya pemeriksaan cepat agar pesan muncul tanpa menunggu.
*/
export function FormGantiPassword({ onSelesai, tombolLain }) {
  const { user, gantiPassword } = useAuth()
  const [lama, setLama] = useState('')
  const [baru, setBaru] = useState('')
  const [ulangi, setUlangi] = useState('')
  const [galat, setGalat] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)

  const kirim = async (e) => {
    e.preventDefault()
    if (menyimpan) return
    if (baru.length < MIN) return setGalat({ galat: `Password baru minimal ${MIN} karakter.`, kolom: 'passwordBaru' })
    if (baru !== ulangi) return setGalat({ galat: 'Ulangi password baru dengan sama persis.', kolom: 'passwordBaru' })
    if (baru.toLowerCase().includes(user.username.toLowerCase())) return setGalat({ galat: 'Password baru tidak boleh memuat username.', kolom: 'passwordBaru' })
    setMenyimpan(true)
    const hasil = await gantiPassword(lama, baru, ulangi)
    setMenyimpan(false)
    if (hasil) return setGalat(hasil)
    onSelesai?.()
  }

  return (
    <form onSubmit={kirim} className="space-y-4" noValidate>
      {galat && (
        <Alert key={galat.galat} tone="error">
          {galat.galat}
        </Alert>
      )}
      <IsianPassword id="password-lama" label="Password saat ini" value={lama} onChange={setLama} autoComplete="current-password" galat={galat?.kolom === 'passwordLama'} />
      <IsianPassword
        id="password-baru"
        label="Password baru"
        value={baru}
        onChange={setBaru}
        autoComplete="new-password"
        galat={galat?.kolom === 'passwordBaru'}
        petunjuk={`Minimal ${MIN} karakter dan tidak memuat username. Gabungan kata, angka, dan tanda baca lebih aman.`}
      />
      <IsianPassword id="password-ulangi" label="Ulangi password baru" value={ulangi} onChange={setUlangi} autoComplete="new-password" galat={galat?.kolom === 'passwordBaru'} />
      <div className="flex flex-wrap justify-end gap-2 pt-2">
        {tombolLain}
        <button type="submit" disabled={menyimpan} className={`${btn.primary} disabled:opacity-60`}>
          <KeyRound className="h-4 w-4" /> {menyimpan ? 'Menyimpan…' : 'Simpan Password'}
        </button>
      </div>
    </form>
  )
}

// Ditampilkan sebagai pengganti isi portal selama akun masih memakai password awal dari sekolah
export function WajibGantiPassword() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <Card className="mx-auto max-w-lg p-6 sm:p-8">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-50 text-primary-600">
        <ShieldCheck className="h-6 w-6" />
      </span>
      <h1 className="mt-4 text-xl font-extrabold text-slate-900">Buat password baru Anda</h1>
      <p className="mt-2 text-sm text-slate-600">
        Akun <span className="font-semibold text-slate-800">{user.username}</span> masih memakai password awal dari sekolah. Demi keamanan, ganti dulu dengan
        password buatan Anda sendiri sebelum memakai portal.
      </p>
      <div className="mt-6">
        <FormGantiPassword
          tombolLain={
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className={btn.secondary}
            >
              <LogOut className="h-4 w-4" /> Keluar
            </button>
          }
        />
      </div>
    </Card>
  )
}
