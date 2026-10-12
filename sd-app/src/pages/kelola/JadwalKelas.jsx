import { useState } from 'react'
import SiswaJadwal from '../siswa/SiswaJadwal'
import { inputCls } from '../../components/ui'
import { JADWAL } from '../../data/dummy'

// Jadwal pelajaran per kelas (1A–6C) untuk guru & staf
export default function JadwalKelas() {
  const daftarKelas = Object.keys(JADWAL).sort()
  const [kelas, setKelas] = useState(daftarKelas[0])

  return (
    <SiswaJadwal
      kelas={kelas}
      aksi={
        <select value={kelas} onChange={(e) => setKelas(e.target.value)} className={`${inputCls} sm:w-44`} aria-label="Pilih kelas">
          {[...new Set(daftarKelas.map((k) => k[0]))].map((t) => (
            <optgroup key={t} label={`Kelas ${t}`}>
              {daftarKelas
                .filter((k) => k[0] === t)
                .map((k) => (
                  <option key={k} value={k}>
                    Kelas {k}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      }
    />
  )
}
