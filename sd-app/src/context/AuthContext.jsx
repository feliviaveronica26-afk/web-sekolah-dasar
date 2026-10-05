import { createContext, useContext, useState } from 'react'
import { AKUN_DEMO, AKUN_TERDAFTAR, LABEL_ROLE } from '../data/dummy'

const AuthContext = createContext(null)
const STORAGE_KEY = 'sdhg-user'

function bacaUser() {
  try {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEY))
    // Abaikan sesi lama dengan peran yang sudah tidak ada (mis. 'admin', 'guru')
    // atau milik akun yang sudah dihapus (mis. akun demo 'kepsek')
    const akunAda = [...AKUN_TERDAFTAR, ...AKUN_DEMO].some((a) => a.username === user?.username && a.role === user?.role)
    return akunAda && LABEL_ROLE[user.role] ? user : null
  } catch {
    return null
  }
}

// Login sementara memakai akun demo. Akan diganti dengan API backend.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(bacaUser)

  const login = (username, password) => {
    const nama = username.trim().replace(/\s+/g, ' ').toLowerCase()
    const akun = [...AKUN_TERDAFTAR, ...AKUN_DEMO].find((a) => a.username === nama && a.password === password)
    if (!akun) return { error: 'Username atau password salah.' }
    const { password: _, ...dataUser } = akun
    setUser(dataUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataUser))
    return { user: dataUser }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
