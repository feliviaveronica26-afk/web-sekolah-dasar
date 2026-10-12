import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { AKUN_DEMO, AKUN_TERDAFTAR, LABEL_ROLE } from '../data/dummy'
import { BATAS_DIAM_MENIT, BATAS_SESI_JAM, buatTokenSesi, catatGagalLogin, resetGagalLogin, sisaKunciLogin, tokenSesiSah } from '../utils/keamanan'

const AuthContext = createContext(null)
const STORAGE_KEY = 'sdhg-user'
// Alasan keluar otomatis, dibaca halaman login untuk ditampilkan
export const ALASAN_KELUAR_KEY = 'sdhg-alasan-keluar'

const akunDari = (user) => [...AKUN_TERDAFTAR, ...AKUN_DEMO].find((a) => a.username === user?.username && a.role === user?.role)

// Sesi habis karena lama tidak aktif atau sudah terlalu lama sejak login
function alasanSesiHabis(user, sekarang = Date.now()) {
  if (user.aktif && sekarang - user.aktif > BATAS_DIAM_MENIT * 60000) return 'diam'
  if (user.masuk && sekarang - user.masuk > BATAS_SESI_JAM * 3600000) return 'kedaluwarsa'
  return null
}

function bacaUser() {
  try {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEY))
    const akun = akunDari(user)
    // Abaikan sesi milik peran/akun yang sudah tidak ada (mis. 'admin', akun demo 'kepsek')
    if (!akun || !LABEL_ROLE[user.role]) return null
    // Akun sungguhan wajib membawa token dari password; sesi yang dibuat manual ditolak
    if (akun.hash && !tokenSesiSah(user.token, akun.hash)) return null
    const alasan = alasanSesiHabis(user)
    if (alasan) {
      sessionStorage.setItem(ALASAN_KELUAR_KEY, alasan)
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return user
  } catch {
    return null
  }
}

// Login sementara memakai akun di kode. Akan diganti dengan API backend.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(bacaUser)

  /*
    Hasil: { user } jika berhasil, atau { error, terkunci } jika gagal.
    Password akun sungguhan diperiksa lewat hash PBKDF2 (lihat src/utils/keamanan.js).
  */
  const login = async (username, password) => {
    const terkunci = sisaKunciLogin()
    if (terkunci) return { error: 'Terlalu banyak percobaan yang salah.', terkunci }
    const nama = username.trim().replace(/\s+/g, ' ').toLowerCase()
    const akun = [...AKUN_TERDAFTAR, ...AKUN_DEMO].find((a) => a.username === nama)
    let token = null
    let cocok = false
    if (akun?.hash) {
      token = await buatTokenSesi(password, akun.hash)
      cocok = tokenSesiSah(token, akun.hash)
    } else if (akun) {
      cocok = akun.password === password
    }
    if (!cocok) {
      const gagal = catatGagalLogin()
      if (gagal.terkunci) return { error: 'Terlalu banyak percobaan yang salah.', terkunci: gagal.terkunci }
      return { error: `Username atau password salah. Sisa ${gagal.sisa} percobaan sebelum login dikunci sementara.` }
    }
    resetGagalLogin()
    const { password: _, hash: __, ...dataUser } = akun
    const sekarang = Date.now()
    const sesi = { ...dataUser, ...(token && { token }), masuk: sekarang, aktif: sekarang }
    sessionStorage.removeItem(ALASAN_KELUAR_KEY)
    setUser(sesi)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sesi))
    return { user: sesi }
  }

  const keluar = useCallback((alasan) => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    if (alasan) sessionStorage.setItem(ALASAN_KELUAR_KEY, alasan)
  }, [])

  // Keluar otomatis bila tidak ada aktivitas atau sesi terlalu lama (komputer sekolah dipakai bersama)
  useEffect(() => {
    if (!user) return
    let terakhirTulis = 0
    const catat = () => {
      const sekarang = Date.now()
      if (sekarang - terakhirTulis < 15000) return
      terakhirTulis = sekarang
      try {
        const sesi = JSON.parse(localStorage.getItem(STORAGE_KEY))
        if (sesi?.username === user.username) localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...sesi, aktif: sekarang }))
      } catch {
        /* abaikan */
      }
    }
    const periksa = () => {
      try {
        // Aktivitas di tab lain ikut dihitung karena waktu aktif disimpan bersama
        const sesi = JSON.parse(localStorage.getItem(STORAGE_KEY))
        if (!sesi) return keluar()
        const alasan = alasanSesiHabis(sesi)
        if (alasan) keluar(alasan)
      } catch {
        keluar()
      }
    }
    catat()
    const peristiwa = ['pointerdown', 'keydown', 'scroll', 'touchstart']
    peristiwa.forEach((p) => window.addEventListener(p, catat, { passive: true }))
    document.addEventListener('visibilitychange', periksa)
    const jam = setInterval(periksa, 30000)
    return () => {
      peristiwa.forEach((p) => window.removeEventListener(p, catat))
      document.removeEventListener('visibilitychange', periksa)
      clearInterval(jam)
    }
  }, [user, keluar])

  const logout = () => keluar()

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
