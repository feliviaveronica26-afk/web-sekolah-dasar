import { useEffect, useRef, useState } from 'react'

// Elemen yang muncul perlahan saat masuk layar. `jeda` dalam milidetik untuk efek berurutan.
export function Muncul({ as: Tag = 'div', jeda = 0, className = '', children, ...props }) {
  const ref = useRef(null)
  const [tampil, setTampil] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return setTampil(true)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTampil(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag ref={ref} style={{ transitionDelay: `${jeda}ms` }} className={`muncul ${tampil ? 'muncul-aktif' : ''} ${className}`} {...props}>
      {children}
    </Tag>
  )
}

// Angka yang menghitung naik saat pertama kali terlihat, mis. '432' atau '95%'
export function AngkaNaik({ nilai, durasi = 1200 }) {
  const target = Number(String(nilai).replace(/[^\d]/g, '')) || 0
  const akhiran = String(nilai).replace(/[\d.,]/g, '')
  const ref = useRef(null)
  const [n, setN] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return setN(target)
    let raf
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const mulai = performance.now()
      const langkah = (t) => {
        const p = Math.min(1, (t - mulai) / durasi)
        setN(Math.round(target * (1 - Math.pow(1 - p, 3))))
        if (p < 1) raf = requestAnimationFrame(langkah)
      }
      raf = requestAnimationFrame(langkah)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [target, durasi])

  return (
    <span ref={ref}>
      {n.toLocaleString('id-ID')}
      {akhiran}
    </span>
  )
}

// Pembatas bergelombang antar-bagian. `warna` = kelas teks (warna isian), `atas` = dibalik untuk tepi atas.
export function Gelombang({ warna = 'text-white', atas = false, className = '' }) {
  return (
    <svg
      className={`pointer-events-none absolute left-0 w-full ${atas ? '-top-px rotate-180' : '-bottom-px'} ${warna} ${className}`}
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path fill="currentColor" d="M0,56 C240,96 480,8 720,40 C960,72 1200,96 1440,44 L1440,90 L0,90 Z" />
    </svg>
  )
}

export function Bintang({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M12 1.8l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 16.8l-6.1 3.4 1.5-6.8L2.2 8.8l6.9-.7z" />
    </svg>
  )
}

export function Awan({ className = '' }) {
  return (
    <svg viewBox="0 0 64 32" className={className} aria-hidden="true">
      <path fill="currentColor" d="M16 30h34a12 12 0 0 0 0-24 14 14 0 0 0-26 3A10.5 10.5 0 0 0 16 30z" />
    </svg>
  )
}

// Coretan berkelok di bawah kata yang ditonjolkan
export function Coretan({ className = '' }) {
  return (
    <svg viewBox="0 0 200 12" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d="M2 9 C40 2, 80 2, 110 6 S170 11, 198 4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
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

// Ilustrasi gedung sekolah dengan bendera merah putih (pengganti foto sampai ada foto asli)
export function IlustrasiSekolah({ className = '' }) {
  const jendela = [
    [86, 196], [124, 196], [86, 236], [124, 236],
    [250, 196], [288, 196], [250, 236], [288, 236],
  ]
  return (
    <svg viewBox="0 0 400 330" className={className} role="img" aria-label="Ilustrasi gedung SD Harapan Gemilang">
      {/* Langit & tanah */}
      <circle cx="200" cy="175" r="150" fill="#fff7ed" />
      <ellipse cx="200" cy="302" rx="190" ry="26" fill="#bbf7d0" />

      {/* Matahari */}
      <g className="animate-putar-lambat" style={{ transformOrigin: '332px 66px' }}>
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x="329" y="22" width="6" height="14" rx="3" fill="#fbbf24" transform={`rotate(${i * 45} 332 66)`} />
        ))}
      </g>
      <circle cx="332" cy="66" r="24" fill="#fbbf24" />
      <circle cx="324" cy="62" r="2.5" fill="#92400e" />
      <circle cx="340" cy="62" r="2.5" fill="#92400e" />
      <path d="M324 72 q8 7 16 0" fill="none" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" />

      {/* Awan */}
      <g className="animate-melayang">
        <path fill="#ffffff" d="M58 88h52a14 14 0 0 0 0-28 18 18 0 0 0-33 4 12 12 0 0 0-19 24z" />
      </g>

      {/* Pohon kiri */}
      <rect x="34" y="246" width="8" height="40" rx="3" fill="#a16207" />
      <circle cx="38" cy="236" r="26" fill="#4ade80" />
      <circle cx="26" cy="226" r="7" fill="#86efac" />

      {/* Sayap gedung */}
      <rect x="66" y="172" width="268" height="114" rx="8" fill="#ffffff" stroke="#fecdd3" strokeWidth="2" />
      <rect x="58" y="160" width="284" height="18" rx="6" fill="#b5121f" />
      {jendela.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="28" height="26" rx="5" fill="#bae6fd" />
          <path d={`M${x + 14} ${y} v26 M${x} ${y + 13} h28`} stroke="#ffffff" strokeWidth="2" />
        </g>
      ))}

      {/* Gedung tengah */}
      <rect x="150" y="118" width="100" height="168" rx="6" fill="#ffffff" stroke="#fecdd3" strokeWidth="2" />
      <path d="M138 126 L200 78 L262 126 Z" fill="#d91a28" />
      <circle cx="200" cy="108" r="11" fill="#ffffff" />
      <path d="M200 101 l2.2 4.6 5 .6-3.8 3.4 1.1 5-4.5-2.6-4.5 2.6 1.1-5-3.8-3.4 5-.6z" fill="#fbbf24" />
      <rect x="164" y="138" width="72" height="18" rx="5" fill="#d91a28" />
      <text x="200" y="151" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff" fontFamily="Fredoka, sans-serif">
        SD HARAPAN
      </text>
      <rect x="172" y="168" width="22" height="22" rx="4" fill="#bae6fd" />
      <rect x="206" y="168" width="22" height="22" rx="4" fill="#bae6fd" />
      <path d="M178 286 v-44 a22 22 0 0 1 44 0 v44 z" fill="#7c161f" />
      <circle cx="212" cy="266" r="2.5" fill="#fbbf24" />

      {/* Jalan setapak */}
      <path d="M180 286 h40 l26 34 h-92 z" fill="#fde68a" />

      {/* Tiang & bendera merah putih */}
      <rect x="352" y="132" width="4" height="160" rx="2" fill="#94a3b8" />
      <circle cx="354" cy="130" r="4" fill="#fbbf24" />
      <g className="animate-goyang" style={{ transformOrigin: '356px 138px' }}>
        <rect x="356" y="136" width="36" height="11" fill="#d91a28" />
        <rect x="356" y="147" width="36" height="11" fill="#ffffff" stroke="#e2e8f0" />
      </g>

      {/* Semak */}
      <circle cx="96" cy="288" r="12" fill="#22c55e" />
      <circle cx="112" cy="290" r="9" fill="#4ade80" />
      <circle cx="292" cy="289" r="11" fill="#22c55e" />
      <circle cx="306" cy="291" r="8" fill="#4ade80" />
    </svg>
  )
}

// Ilustrasi kecil bertema belajar untuk kartu kosong / sapaan
export function IlustrasiBuku({ className = '' }) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden="true">
      <ellipse cx="60" cy="90" rx="46" ry="6" fill="#0f172a" opacity="0.08" />
      <path d="M14 26 q23 -10 46 4 v56 q-23 -14 -46 -4 z" fill="#ffffff" stroke="#fecdd3" strokeWidth="2" />
      <path d="M106 26 q-23 -10 -46 4 v56 q23 -14 46 -4 z" fill="#fff1f2" stroke="#fecdd3" strokeWidth="2" />
      <path d="M24 40 q14 -4 28 2 M24 52 q14 -4 28 2 M68 42 q14 -6 28 -2 M68 54 q14 -6 28 -2" stroke="#fda4af" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M82 6 l3 6.5 7 .7 -5.3 4.7 1.6 7 -6.3 -3.6 -6.3 3.6 1.6 -7 -5.3 -4.7 7 -.7z" fill="#fbbf24" />
    </svg>
  )
}
