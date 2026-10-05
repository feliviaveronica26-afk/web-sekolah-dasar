import { useState } from 'react'
import SiswaJadwal from '../siswa/SiswaJadwal'
import { inputCls } from '../../components/ui'
import { JADWAL } from '../../data/dummy'

// Jadwal pelajaran per kelas untuk guru & staf. Saat ini baru kelas yang datanya sudah diisi.
export default function JadwalKelas() {
  const daftarKelas = Object.keys(JADWAL)
  const [kelas, setKelas] = useState(daftarKelas[0])

  return (
    <SiswaJadwal
      kelas={kelas}
      aksi={
        <select value={kelas} onChange={(e) => setKelas(e.target.value)} className={`${inputCls} sm:w-44`} aria-label="Pilih kelas">
          {daftarKelas.map((k) => (
            <option key={k} value={k}>
              Kelas {k}
            </option>
          ))}
        </select>
      }
    />
  )
}
