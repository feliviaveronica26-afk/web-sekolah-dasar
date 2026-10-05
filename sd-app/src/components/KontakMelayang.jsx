import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Clock, Mail, MapPin, MessageCircle, Phone, Send, X } from 'lucide-react'
import { SEKOLAH } from '../data/dummy'

// '0812-3456-7890' -> '6281234567890' (format wa.me)
const nomorWa = (no) => no.replace(/\D/g, '').replace(/^0/, '62')

const PESAN_WA = `Halo ${SEKOLAH.nama}, saya ingin bertanya.`

const KONTAK = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    nilai: SEKOLAH.whatsapp,
    href: `https://wa.me/${nomorWa(SEKOLAH.whatsapp)}?text=${encodeURIComponent(PESAN_WA)}`,
    warna: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Phone,
    label: 'Telepon',
    nilai: SEKOLAH.telepon,
    href: `tel:${SEKOLAH.telepon.replace(/\D/g, '')}`,
    warna: 'bg-primary-50 text-primary-600',
  },
  {
    icon: Mail,
    label: 'Email',
    nilai: SEKOLAH.email,
    href: `mailto:${SEKOLAH.email}`,
    warna: 'bg-sky-50 text-sky-600',
  },
  {
    icon: MapPin,
    label: 'Alamat',
    nilai: SEKOLAH.alamat,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SEKOLAH.alamat)}`,
    warna: 'bg-amber-50 text-amber-600',
  },
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
          className="w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl"
        >
          <div className="bg-primary-600 px-5 py-4 text-white">
            <p className="font-bold">Hubungi {SEKOLAH.nama}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-primary-100">
              <Clock className="h-3.5 w-3.5" /> {SEKOLAH.jamOperasional}
            </p>
          </div>

          <ul className="divide-y divide-slate-100">
            {KONTAK.map(({ icon: Icon, label, nilai, href, warna }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50"
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${warna}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-slate-500">{label}</span>
                    <span className="block truncate text-sm font-semibold text-slate-800">{nilai}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </a>
              </li>
            ))}
          </ul>

          <Link
            to="/kontak"
            onClick={() => setBuka(false)}
            className="flex items-center justify-center gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 text-sm font-semibold text-primary-600 hover:bg-primary-50"
          >
            <Send className="h-4 w-4" /> Kirim pesan lewat formulir
          </Link>
        </div>
      )}

      <button
        onClick={() => setBuka(!buka)}
        aria-label={buka ? 'Tutup kontak' : 'Hubungi kami'}
        aria-expanded={buka}
        aria-controls="panel-kontak"
        className="flex items-center gap-2 rounded-full bg-primary-600 px-4 py-3.5 font-semibold text-white shadow-lg transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
      >
        {buka ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        <span className="hidden text-sm sm:inline">{buka ? 'Tutup' : 'Hubungi Kami'}</span>
      </button>
    </div>
  )
}
