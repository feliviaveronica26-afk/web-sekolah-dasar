import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone, X } from 'lucide-react'
import { SEKOLAH } from '../data/dummy'
import { useAnimasiKeluar } from '../utils/gerak'

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
  const [panelTampil, panelKeluar] = useAnimasiKeluar(buka)

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
    <div ref={ref} className="kontak-melayang position-fixed z-50 d-flex flex-column align-items-end gap-3">
      {panelTampil && (
        <div
          id="panel-kontak"
          role="dialog"
          aria-label="Kontak sekolah"
          data-keluar={panelKeluar || undefined}
          className="panel-kontak card overflow-hidden rounded-4 text-tinta"
        >
          <div className="border-bottom px-5 pb-4 pt-5">
            <p className="fs-xl fw-extrabold lh-tight ls-tight">Ada yang bisa kami bantu?</p>
            <p className="mt-1 fs-sm text-tinta-3">Tata Usaha: {SEKOLAH.jamOperasional}</p>
          </div>

          <ul className="list-group list-group-flush">
            {KONTAK.map(({ icon: Icon, label, nilai, href }) => (
              <li key={label} className="list-group-item p-0">
                <a
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="list-group-item-action d-flex align-items-center gap-3-5 px-5 py-3"
                >
                  <Icon className="ukuran-5 flex-shrink-0 text-merah-700" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="d-block fs-xs text-tinta-3">{label}</span>
                    <span className="d-block text-truncate fs-15 fw-semibold">{nilai}</span>
                  </span>
                  <ArrowUpRight className="ukuran-4 flex-shrink-0 text-tinta-3" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>

          <Link to="/kontak" onClick={() => setBuka(false)} className="tautan-bawah d-block border-top bg-kertas px-5 py-3-5 text-center fs-sm fw-semibold text-merah-700">
            Atau kirim pesan lewat formulir
          </Link>
        </div>
      )}

      <button
        type="button"
        onClick={() => setBuka(!buka)}
        aria-label={buka ? 'Tutup kontak' : 'Hubungi kami'}
        aria-expanded={buka}
        aria-controls="panel-kontak"
        className="tombol-melayang btn btn-primary melayang-awal min-h-12 px-4 fw-semibold"
      >
        {buka ? <X key="tutup" className="ikon-putar ukuran-5" /> : <MessageCircle key="buka" className="ikon-putar ukuran-5" />}
        <span className="d-none d-sm-inline fs-sm">{buka ? 'Tutup' : 'Hubungi kami'}</span>
      </button>
    </div>
  )
}
