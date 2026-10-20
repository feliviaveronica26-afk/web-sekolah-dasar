import { useEffect, useState } from 'react'

/*
  Pembantu animasi. Semua animasi situs memakai transform/opacity saja (tidak menggeser tata letak)
  dan mati bila pengguna memilih "kurangi gerakan" di perangkatnya. Token durasi & easing ada di
  styles/_gerak.scss (--gerak-*, --ease-*).
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

/*
  true sejak elemen `ref` pertama kali masuk layar (sekali saja, lalu berhenti mengamati).
  Peramban tanpa IntersectionObserver langsung dianggap terlihat.
*/
export function useTerlihat(ref, { ambang = 0.12, tepi = '0px 0px -40px 0px' } = {}) {
  const [terlihat, setTerlihat] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return setTerlihat(true)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTerlihat(true)
          io.disconnect()
        }
      },
      { threshold: ambang, rootMargin: tepi },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, ambang, tepi])

  return terlihat
}

/*
  Mengurai nilai tampilan yang boleh dihitung naik, mis. 432, '95%', '+12', '84,5', 'Rp172.200.000',
  'Rp152,3 jt'. Mengembalikan { n, format } (format(x) menulis x dengan bentuk yang sama), atau null
  untuk teks yang bukan satu angka: jam '07.15', '3/5', '4A', '–'.
*/
const POLA_ANGKA = /^(Rp\s?|\+)?(0|[1-9]\d{0,2}(?:\.\d{3})+|[1-9]\d*)(?:,(\d+))?(%|\s[A-Za-z]+)?$/

export function uraiAngka(nilai) {
  if (typeof nilai === 'number') {
    if (!Number.isFinite(nilai) || nilai < 0) return null
    const desimal = (String(nilai).split('.')[1] ?? '').length
    return { n: nilai, format: (x) => x.toFixed(desimal) }
  }
  if (typeof nilai !== 'string') return null
  const m = POLA_ANGKA.exec(nilai)
  if (!m) return null
  const [, awalan = '', bulat, pecahan, akhiran = ''] = m
  const pakaiTitik = bulat.includes('.')
  const desimal = pecahan?.length ?? 0
  return {
    n: Number(bulat.replaceAll('.', '')) + (pecahan ? Number(`0.${pecahan}`) : 0),
    format: (x) => {
      const [b, p] = x.toFixed(desimal).split('.')
      return `${awalan}${pakaiTitik ? b.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : b}${p ? `,${p}` : ''}${akhiran}`
    },
  }
}
