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
