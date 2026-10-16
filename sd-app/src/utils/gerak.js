import { useEffect, useState } from 'react'

/*
  Pembantu animasi. Semua animasi situs memakai transform/opacity saja (tidak menggeser tata letak)
  dan mati bila pengguna memilih "kurangi gerakan" di perangkatnya. Token durasi & easing ada di
  index.css (--gerak-*, --ease-*).
*/

// true bila pengguna meminta gerakan dikurangi (pengaturan aksesibilitas perangkat)
export const kurangiGerak = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/*
  Menahan elemen tetap terpasang sebentar setelah `buka` menjadi false agar animasi keluarnya
  sempat berjalan. Mengembalikan [tampil, keluar]: render elemen selama `tampil`, dan beri penanda
  `data-keluar` selama `keluar`. Bisa disela: membuka lagi saat sedang keluar langsung membatalkan
  keluarnya. Tidak bergantung pada event animationend, jadi selalu tertutup walau animasi gagal.
*/
export function useAnimasiKeluar(buka, ms = 160) {
  const [terpasang, setTerpasang] = useState(buka)
  const [keluar, setKeluar] = useState(false)

  useEffect(() => {
    if (buka) {
      setTerpasang(true)
      setKeluar(false)
      return
    }
    if (!terpasang) return
    if (kurangiGerak()) {
      setTerpasang(false)
      return
    }
    setKeluar(true)
    const t = setTimeout(() => {
      setTerpasang(false)
      setKeluar(false)
    }, ms)
    return () => clearTimeout(t)
  }, [buka, ms, terpasang])

  return [buka || terpasang, keluar && !buka]
}
