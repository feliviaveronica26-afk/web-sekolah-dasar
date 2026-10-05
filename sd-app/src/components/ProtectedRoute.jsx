import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAkses } from '../context/akses'

// Halaman kelola hanya bisa dibuka jika jabatan pengguna punya akses ke menu tersebut
export function AksesMenu({ menu, children }) {
  const { punya, base } = useAkses()
  return punya(menu) ? children : <Navigate to={base} replace />
}

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (role && user.role !== role) return <Navigate to={`/dashboard/${user.role}`} replace />
  return children
}
