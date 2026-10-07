import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { HalamanNilai } from '../siswa/SiswaNilai'

export default function OrtuNilai() {
  const { user } = useAuth()
  const { data } = useData()
  return <HalamanNilai siswa={data.siswa.find((s) => s.nis === user.anakNis)} untukOrtu />
}
