import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { LABEL_ROLE } from '../data/dummy'
import { SESI_BERAKHIR, api } from '../utils/api'
import { BATAS_DIAM_MENIT, BATAS_SESI_JAM } from '../utils/keamanan'

const AuthContext = createContext(null)
const STORAGE_KEY = 'sdhg-user'
// Alasan keluar otomatis, dibaca halaman login untuk ditampilkan
export const ALASAN_KELUAR_KEY = 'sdhg-alasan-keluar'
// Selama pengguna aktif, sesi di server (batas diam 30 menit) disegarkan paling sering tiap 5 menit
const SEGARKAN_SERVER_MS = 5 * 60000

// Sesi habis karena lama tidak aktif atau sudah terlalu lama sejak login
function alasanSesiHabis(user, sekarang = Date.now()) {
  if (user.aktif && sekarang - user.aktif > BATAS_DIAM_MENIT * 60000) return 'diam'
  if (user.masuk && sekarang - user.masuk > BATAS_SESI_JAM * 3600000) return 'kedaluwarsa'
  return null
}

/*
  Salinan profil di browser hanya untuk tampilan, agar halaman langsung tampil saat dibuka.
  Yang menentukan boleh tidaknya membuka data di server adalah sesi Laravel (cookie HttpOnly),
  jadi profil yang diubah sendiri di browser tidak memberi akses apa pun ke server.
*/
function bacaUser(saatHabis) {
  try {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!user?.username || !LABEL_ROLE[user.role]) return null
    const alasan = alasanSesiHabis(user)
    if (alasan) {
      sessionStorage.setItem(ALASAN_KELUAR_KEY, alasan)
      localStorage.removeItem(STORAGE_KEY)
      saatHabis?.()
      return null
    }
    return user
  } catch {
    return null
  }
}

const KOLOM_PROFIL = ['username', 'role', 'label', 'nama', 'guruId', 'nis', 'kelas', 'anakNis', 'wajibGanti']
const profilSama = (a, b) => KOLOM_PROFIL.every((k) => a?.[k] === b?.[k])

/*
  Logout di server yang sedang berjalan. Login baru menunggu ini selesai dulu: jawaban logout yang
  datang belakangan membawa cookie sesi tamu dan akan menimpa cookie sesi login yang baru.
*/
let keluarBerjalan = Promise.resolve()
const keluarDiServer = () => {
  keluarBerjalan = api('/keluar', { method: 'POST' }).catch(() => {})
  return keluarBerjalan
}

// Login lewat backend Laravel (POST /api/masuk). Lihat juga src/utils/api.js.
export function AuthProvider({ children }) {
  // Sesi di browser yang ternyata sudah habis (diam / terlalu lama) saat halaman dibuka
  const habisSaatDibuka = useRef(false)
  const [user, setUser] = useState(() => bacaUser(() => (habisSaatDibuka.current = true)))
  const terakhirServer = useRef(0)
  /*
    Waktu login/keluar terakhir. Jawaban server untuk permintaan yang dikirim sebelum itu sudah basi:
    mis. pemeriksaan sesi saat halaman login dibuka yang baru dijawab setelah login berhasil (jaringan
    lambat) tidak boleh mengeluarkan pengguna lagi, dan yang dijawab setelah keluar tidak boleh memasukkannya lagi.
  */
  const gantiSesi = useRef(0)

  const simpan = useCallback((profil, masuk = Date.now()) => {
    const sesi = { ...profil, masuk, aktif: Date.now() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sesi))
    setUser(sesi)
    return sesi
  }, [])

  // `keluarServer` false bila server sendiri yang menyatakan sesinya sudah berakhir
  const keluar = useCallback((alasan, keluarServer = true) => {
    gantiSesi.current = Date.now()
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    if (alasan) sessionStorage.setItem(ALASAN_KELUAR_KEY, alasan)
    if (keluarServer) keluarDiServer()
  }, [])

  /*
    Cocokkan dengan server: perbarui profil (mis. jabatan diubah Kepala Sekolah), atau keluar bila
    sesi di server sudah tidak ada. Jika server tidak bisa dihubungi, salinan di browser tetap dipakai
    untuk data yang masih tersimpan di browser; data server tetap tertutup.
  */
  const cocokkan = useCallback(async () => {
    const mulai = (terakhirServer.current = Date.now())
    try {
      const { user: profil } = await api('/saya', { latar: true })
      if (mulai < gantiSesi.current) return
      const lokal = bacaUser()
      if (!profil) {
        if (lokal) keluar('berakhir', false)
      } else if (lokal?.username !== profil.username) {
        simpan(profil)
      } else if (!profilSama(lokal, profil)) {
        simpan(profil, lokal.masuk)
      }
    } catch (e) {
      if (e.status === 401 && mulai >= gantiSesi.current) keluar('berakhir', false)
    }
  }, [keluar, simpan])

  // Saat dibuka: sesi yang habis karena diam diakhiri juga di server (bukan diambil alih lagi);
  // selain itu cocokkan dengan sesi server
  useEffect(() => {
    if (habisSaatDibuka.current) keluarDiServer()
    else cocokkan()
  }, [cocokkan])

  // Permintaan data apa pun yang dijawab 401 berarti sesi di server sudah berakhir
  useEffect(() => {
    const berakhir = (e) => e.detail?.mulai >= gantiSesi.current && localStorage.getItem(STORAGE_KEY) && keluar('berakhir', false)
    window.addEventListener(SESI_BERAKHIR, berakhir)
    return () => window.removeEventListener(SESI_BERAKHIR, berakhir)
  }, [keluar])

  /*
    Hasil: { user } jika berhasil, atau { error, terkunci } jika gagal. Pemeriksaan password,
    batas 5 percobaan, dan penguncian dilakukan server.
  */
  const login = async (username, password) => {
    try {
      await keluarBerjalan
      const { user: profil } = await api('/masuk', { method: 'POST', body: { username, password } })
      sessionStorage.removeItem(ALASAN_KELUAR_KEY)
      terakhirServer.current = gantiSesi.current = Date.now()
      return { user: simpan(profil) }
    } catch (e) {
      if (e.status === 429) return { error: e.message, terkunci: e.isi?.terkunci ?? 60 }
      return { error: e.message }
    }
  }

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
      if (sekarang - terakhirServer.current > SEGARKAN_SERVER_MS) cocokkan()
    }
    const periksa = () => {
      try {
        // Aktivitas di tab lain ikut dihitung karena waktu aktif disimpan bersama
        const sesi = JSON.parse(localStorage.getItem(STORAGE_KEY))
        if (!sesi) return keluar(null, false)
        const alasan = alasanSesiHabis(sesi)
        if (alasan) keluar(alasan)
      } catch {
        keluar()
      }
    }
    // Diperiksa saat tab kembali terlihat, bukan saat halaman ditutup/berpindah (logout yang
    // dikirim halaman yang sedang ditutup bisa tiba setelah login berikutnya)
    const saatTerlihat = () => document.visibilityState === 'visible' && periksa()
    catat()
    const peristiwa = ['pointerdown', 'keydown', 'scroll', 'touchstart']
    peristiwa.forEach((p) => window.addEventListener(p, catat, { passive: true }))
    document.addEventListener('visibilitychange', saatTerlihat)
    const jam = setInterval(periksa, 30000)
    return () => {
      peristiwa.forEach((p) => window.removeEventListener(p, catat))
      document.removeEventListener('visibilitychange', saatTerlihat)
      clearInterval(jam)
    }
  }, [user, keluar, cocokkan])

  const logout = () => keluar()

  /*
    Ganti password akun sendiri. Hasil: null jika berhasil, atau { galat, kolom } (pesan dari server).
    Perangkat lain yang login dengan akun ini dikeluarkan oleh server.
  */
  const gantiPassword = async (passwordLama, passwordBaru, ulangi) => {
    try {
      const { user: profil } = await api('/akun/password', {
        method: 'PUT',
        body: { passwordLama, passwordBaru, passwordBaru_confirmation: ulangi },
      })
      simpan(profil, bacaUser()?.masuk)
      return null
    } catch (e) {
      const [kolom] = Object.keys(e.isi?.errors ?? {})
      return { galat: e.message, kolom }
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, gantiPassword }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
