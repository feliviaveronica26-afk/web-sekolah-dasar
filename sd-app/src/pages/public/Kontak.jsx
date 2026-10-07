import { useState } from 'react'
import { ArrowUpRight, Clock3, Mail, MapPin, MessageCircle, Navigation, Phone, Send } from 'lucide-react'
import Faq from '../../components/Faq'
import { Muncul } from '../../components/Hiasan'
import { Alert, Card, PageHeader, SectionTitle, btn, inputCls, labelCls } from '../../components/ui'
import { FAQ, SEKOLAH } from '../../data/dummy'

const nomorWa = (no) => no.replace(/\D/g, '').replace(/^0/, '62')
const petaUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SEKOLAH.alamat)}`

const KANAL = [
  { icon: MessageCircle, label: 'WhatsApp', nilai: SEKOLAH.whatsapp, href: `https://wa.me/${nomorWa(SEKOLAH.whatsapp)}`, cls: 'bg-emerald-500', ket: 'Respons tercepat' },
  { icon: Phone, label: 'Telepon', nilai: SEKOLAH.telepon, href: `tel:${SEKOLAH.telepon.replace(/\D/g, '')}`, cls: 'bg-primary-600', ket: 'Jam kerja' },
  { icon: Mail, label: 'Email', nilai: SEKOLAH.email, href: `mailto:${SEKOLAH.email}`, cls: 'bg-sky-500', ket: 'Dibalas 1×24 jam' },
  { icon: Navigation, label: 'Datang langsung', nilai: 'Petunjuk arah', href: petaUrl, cls: 'bg-amber-400 text-amber-950', ket: 'Ruang Tata Usaha' },
]

// Peta ilustratif lokasi sekolah (pengganti peta interaktif)
function PetaIlustrasi() {
  return (
    <a href={petaUrl} target="_blank" rel="noreferrer" className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-emerald-50 ring-1 ring-slate-200">
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <rect width="400" height="300" fill="#ecfdf5" />
        <path d="M0 210 C120 190 220 240 400 200 V300 H0Z" fill="#bae6fd" opacity=".7" />
        <path d="M-10 120 H410" stroke="#fff" strokeWidth="26" />
        <path d="M150 -10 V310" stroke="#fff" strokeWidth="22" />
        <path d="M290 -10 L250 310" stroke="#fff" strokeWidth="16" />
        <path d="M-10 120 H410 M150 -10 V310" stroke="#fde68a" strokeWidth="2" strokeDasharray="10 10" />
        {[[30, 30], [200, 30], [320, 40], [30, 150], [320, 150], [190, 165]].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="60" height="44" rx="8" fill="#d1fae5" />
        ))}
        <circle cx="60" cy="230" r="14" fill="#86efac" />
        <circle cx="350" cy="250" r="18" fill="#86efac" />
        <text x="40" y="112" fontSize="11" fill="#64748b" fontFamily="Plus Jakarta Sans, sans-serif">Jl. Merdeka</text>
        <text x="158" y="290" fontSize="11" fill="#64748b" fontFamily="Plus Jakarta Sans, sans-serif">Jl. Melati</text>
      </svg>
      <div className="absolute left-[44%] top-[22%] -translate-x-1/2 text-center">
        <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-600 text-white shadow-xl ring-4 ring-white transition group-hover:-translate-y-1">
          <MapPin className="h-7 w-7" />
          <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-primary-600" />
        </div>
        <span className="mt-3 inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-800 shadow">{SEKOLAH.nama}</span>
      </div>
      <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary-700 shadow">
        Buka di Google Maps <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </a>
  )
}

export default function Kontak() {
  const [terkirim, setTerkirim] = useState(false)

  // Belum terhubung ke backend: pesan hanya ditampilkan sebagai terkirim
  const kirim = (e) => {
    e.preventDefault()
    e.target.reset()
    setTerkirim(true)
  }

  return (
    <>
      <PageHeader eyebrow="Kami Siap Membantu" title="Hubungi Kami" subtitle="Punya pertanyaan seputar sekolah, PPDB, atau administrasi? Pilih cara yang paling nyaman untuk Bapak/Ibu." />

      <section className="relative z-10 mx-auto -mt-10 max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {KANAL.map(({ icon: Icon, label, nilai, href, cls, ket }, i) => (
            <Muncul key={label} jeda={i * 70}>
              <a
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="group flex h-full flex-col rounded-3xl bg-white p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <span className={`grid h-12 w-12 place-items-center rounded-2xl text-white transition group-hover:scale-110 ${cls}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
                <span className={`mt-0.5 font-bold text-slate-900 [overflow-wrap:anywhere] ${nilai.includes('@') ? 'text-sm' : ''}`}>{nilai}</span>
                <span className="mt-1 text-xs text-slate-500">{ket}</span>
              </a>
            </Muncul>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <PetaIlustrasi />
          <Card className="p-6">
            <div className="flex gap-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
              <div>
                <p className="font-bold text-slate-900">Alamat</p>
                <p className="text-sm text-slate-600">{SEKOLAH.alamat}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-4">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
              <div>
                <p className="font-bold text-slate-900">Jam Operasional</p>
                <p className="text-sm text-slate-600">{SEKOLAH.jamOperasional}</p>
                <p className="text-sm text-slate-600">Sabtu, Minggu & hari libur nasional: tutup</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">Kirim Pesan</h2>
          <p className="mt-1 text-sm text-slate-500">Kami akan membalas melalui WhatsApp pada jam kerja.</p>
          {terkirim && (
            <div className="mt-4">
              <Alert>Terima kasih! Pesan Anda sudah kami terima.</Alert>
            </div>
          )}
          <form onSubmit={kirim} className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="nama">Nama lengkap</label>
              <input id="nama" required className={inputCls} placeholder="Nama Bapak/Ibu" />
            </div>
            <div>
              <label className={labelCls} htmlFor="hp">No. WhatsApp</label>
              <input id="hp" required type="tel" className={inputCls} placeholder="08xx-xxxx-xxxx" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="topik">Topik</label>
              <select id="topik" className={inputCls}>
                <option>Informasi PPDB</option>
                <option>Kunjungan sekolah</option>
                <option>Akademik</option>
                <option>Administrasi & Keuangan</option>
                <option>Kerja sama / kemitraan</option>
                <option>Lainnya</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="pesan">Pesan</label>
              <textarea id="pesan" required rows={6} className={inputCls} placeholder="Tulis pertanyaan Anda..." />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className={`${btn.primary} w-full rounded-full! py-3 sm:w-auto sm:px-8`}>
                <Send className="h-4 w-4" /> Kirim Pesan
              </button>
            </div>
          </form>
        </Card>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionTitle eyebrow="FAQ" title="Mungkin jawabannya sudah ada di sini" />
          <Faq daftar={FAQ.slice(2)} />
        </div>
      </section>
    </>
  )
}
