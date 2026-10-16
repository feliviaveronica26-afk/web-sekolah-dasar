import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone, X } from 'lucide-react'
import { SEKOLAH } from '../data/dummy'

// '0812-3456-7890' -> '6281234567890' (format wa.me)
const nomorWa = (no) => no.replace(/\D/g, '').replace(/^0/, '62')

const PESAN_WA = `Halo ${SEKOLAH.nama}, saya ingin bertanya.`

const KONTAK = [
  { icon: MessageCircle, label: 'WhatsApp', nilai: SEKOLAH.whatsapp, href: `https://wa.me/${nomorWa(SEKOLAH.whatsapp)}?text=${encodeURIComponent(PESAN_WA)}` },
  { icon: Phone, label: 'Telepon', nilai: SEKOLAH.telepon, href: `tel:${SEKOLAH.telepon.replace(/\D/g, '')}` },
  { icon: Mail, label: 'Email', nilai: SEKOLAH.email, href: `mailto:${SEKOLAH.email}` },
  { icon: MapPin, label: 'Alamat', nilai: SEKOLAH.alamat, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SEKOLAH.alamat)}` },
]

// Tombol kontak melayang di pojok kanan bawah halaman publik
export default function KontakMelayang() {
  const [buka, setBuka] = useState(false)
  const ref = useRef(null)

  // Tutup saat klik di luar panel atau menekan Esc
  useEffect(() => {
    if (!buka) return
    const klikLuar = (e) => ref.current && !ref.current.contains(e.target) && setBuka(false)
    const tekanEsc = (e) => e.key === 'Escape' && setBuka(false)
    document.addEventListener('mousedown', klikLuar)
    document.addEventListener('keydown', tekanEsc)
    return () => {
      document.removeEventListener('mousedown', klikLuar)
      document.removeEventListener('keydown', tekanEsc)
    }
  }, [buka])

  return (
    <div ref={ref} className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {buka && (
        <div
          id="panel-kontak"
          role="dialog"
          aria-label="Kontak sekolah"
          className="tampil-lembut w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-[1.5rem] border border-garis bg-white text-tinta shadow-[0_18px_50px_-12px_rgb(29_26_22/0.35)]"
        >
          <div className="border-b border-garis px-5 pb-4 pt-5">
            <p className="text-xl font-extrabold leading-tight tracking-tight">Ada yang bisa kami bantu?</p>
            <p className="mt-1 text-sm text-tinta-3">Tata Usaha: {SEKOLAH.jamOperasional}</p>
          </div>

          <ul className="divide-y divide-garis">
            {KONTAK.map(({ icon: Icon, label, nilai, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="group flex items-center gap-3.5 px-5 py-3 transition hover:bg-kertas"
                >
                  <Icon className="h-5 w-5 shrink-0 text-primary-700" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-tinta-3">{label}</span>
                    <span className="block truncate text-[15px] font-semibold">{nilai}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-tinta-3 transition group-hover:text-tinta" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>

          <Link
            to="/kontak"
            onClick={() => setBuka(false)}
            className="block border-t border-garis bg-kertas px-5 py-3.5 text-center text-sm font-semibold text-primary-700 underline-offset-4 hover:underline"
          >
            Atau kirim pesan lewat formulir
          </Link>
        </div>
      )}

      <button
        onClick={() => setBuka(!buka)}
        aria-label={buka ? 'Tutup kontak' : 'Hubungi kami'}
        aria-expanded={buka}
        aria-controls="panel-kontak"
        className="flex min-h-12 items-center gap-2 rounded-full bg-primary-600 px-4 font-semibold text-white shadow-[0_10px_30px_-10px_rgb(68_6_11/0.7)] ring-2 ring-white/80 transition hover:bg-primary-700"
      >
        {buka ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        <span className="hidden text-sm sm:inline">{buka ? 'Tutup' : 'Hubungi kami'}</span>
      </button>
    </div>
  )
}
