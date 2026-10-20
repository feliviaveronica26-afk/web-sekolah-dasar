import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { kurangiGerak, uraiAngka, useTerlihat } from '../utils/gerak'

/*
  Elemen yang muncul perlahan saat masuk layar. `jeda` dalam milidetik untuk efek berurutan.
  `gaya` (opsional): kiri | kanan (bergeser masuk dari samping), skala (membesar sedikit),
  tirai (bingkai foto terbuka dari bawah; pakai pada bingkai tanpa bayangan), bertahap (anak-anaknya
  muncul satu per satu). Tanpa `gaya`: naik sambil memudar. Lihat .muncul di styles/_gerak.scss.
*/
export function Muncul({ as: Tag = 'div', jeda = 0, gaya, className = '', style, children, ...props }) {
  const ref = useRef(null)
  const tampil = useTerlihat(ref)
  return (
    <Tag ref={ref} data-gaya={gaya} style={{ '--jeda': `${jeda}ms`, ...style }} className={`muncul ${tampil ? 'muncul-aktif' : ''} ${className}`} {...props}>
      {children}
    </Tag>
  )
}

const AMBANG_ANGKA = { ambang: 0, tepi: '0px' }
const turunCepat = (p) => 1 - (1 - p) ** 4

/*
  Angka yang menghitung naik dari nol saat pertama terlihat, dan dari angka lama ke angka baru saat
  datanya berubah. Teks yang bukan satu angka (mis. '07.15', '3/5', '–') tampil apa adanya.
  Ukuran tidak berubah selama menghitung: nilai akhir tetap ada (transparan) sebagai penahan lebar,
  dan itulah yang dibaca pembaca layar; angka yang berjalan hanya lapisan visual di atasnya.
*/
export function AngkaNaik({ nilai, durasi = 1100, tunda = 0 }) {
  const ref = useRef(null)
  const urai = useMemo(() => {
    const u = uraiAngka(nilai)
    return u && u.n >= 2 ? u : null
  }, [nilai])
  const terlihat = useTerlihat(ref, AMBANG_ANGKA)
  const [teks, setTeks] = useState(null)
  const terakhir = useRef(0)

  // Sebelum layar dilukis pertama kali: tampilkan angka awal (nol), bukan angka akhir yang lalu melompat
  useLayoutEffect(() => {
    if (urai && !kurangiGerak()) setTeks(urai.format(0))
    // hanya saat dipasang
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!urai || kurangiGerak()) {
      terakhir.current = urai?.n ?? 0
      setTeks(null)
      return
    }
    if (!terlihat) return
    const dari = terakhir.current
    if (dari === urai.n) {
      setTeks(null)
      return
    }
    let mulai = null
    let raf
    const langkah = (t) => {
      mulai ??= t + tunda
      const p = Math.min(1, Math.max(0, (t - mulai) / durasi))
      terakhir.current = dari + (urai.n - dari) * turunCepat(p)
      if (p < 1) {
        setTeks(urai.format(terakhir.current))
        raf = requestAnimationFrame(langkah)
      } else {
        terakhir.current = urai.n
        setTeks(null)
      }
    }
    raf = requestAnimationFrame(langkah)
    return () => cancelAnimationFrame(raf)
  }, [urai, terlihat, durasi, tunda])

  return (
    <span ref={ref} className="position-relative">
      {teks === null ? (
        nilai
      ) : (
        <>
          <span className="teks-transparan">{nilai}</span>
          <span aria-hidden="true" className="position-absolute inset-0">
            {teks}
          </span>
        </>
      )}
    </span>
  )
}

/*
  Judul yang kata-katanya naik satu per satu saat halaman dibuka. Pembaca layar membaca kalimat
  utuhnya; potongan kata hanya tampilan. `mulai` = urutan kata pertama (untuk menyambung animasi
  dari TeksNaik sebelumnya di judul yang sama); jeda awal diatur lewat --tunda-teks pada judulnya.
*/
export function TeksNaik({ teks, mulai = 0 }) {
  const kata = teks.split(' ')
  return (
    <>
      <span className="visually-hidden">{teks}</span>
      <span aria-hidden="true">
        {kata.map((k, i) => (
          <Fragment key={i}>
            {i > 0 && ' '}
            <span className="kata-naik" style={{ '--urut': mulai + i }}>
              {k}
            </span>
          </Fragment>
        ))}
      </span>
    </>
  )
}

export function Bintang({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M12 1.8l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 16.8l-6.1 3.4 1.5-6.8L2.2 8.8l6.9-.7z" />
    </svg>
  )
}

// Bentuk bulat tak beraturan untuk latar dekoratif
export function Gumpalan({ className = '' }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M43.6,-58.2C55.7,-49.3,64.1,-35.4,69.1,-19.9C74.1,-4.4,75.7,12.7,69.6,26.4C63.5,40.1,49.7,50.4,35,58.6C20.3,66.8,4.7,72.9,-11.9,72.6C-28.5,72.3,-46.1,65.6,-57.6,53.1C-69.1,40.6,-74.5,22.3,-74.2,4.6C-73.9,-13.1,-67.9,-30.2,-56.6,-39.4C-45.3,-48.6,-28.7,-49.9,-13.4,-55.4C1.9,-60.9,31.5,-67.1,43.6,-58.2Z"
        transform="translate(100 100)"
      />
    </svg>
  )
}
