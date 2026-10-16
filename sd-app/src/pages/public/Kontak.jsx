import { useState } from 'react'
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import Faq from '../../components/Faq'
import { Catatan, JudulBagian, KepalaHalaman, isian, labelIsian, tombol, wadah } from '../../components/Situs'
import { Alert, JebakanBot } from '../../components/ui'
import { FAQ, SEKOLAH } from '../../data/dummy'
import { FOTO } from '../../data/foto'
import { catatKirim, tungguKirim } from '../../utils/keamanan'

const nomorWa = (no) => no.replace(/\D/g, '').replace(/^0/, '62')
const petaUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SEKOLAH.alamat)}`

const KANAL = [
  { label: 'WhatsApp', icon: MessageCircle, nilai: SEKOLAH.whatsapp, href: `https://wa.me/${nomorWa(SEKOLAH.whatsapp)}`, ket: 'Respons tercepat pada jam kerja' },
  { label: 'Telepon', icon: Phone, nilai: SEKOLAH.telepon, href: `tel:${SEKOLAH.telepon.replace(/\D/g, '')}`, ket: 'Tata Usaha, Senin – Jumat' },
  { label: 'Email', icon: Mail, nilai: SEKOLAH.email, href: `mailto:${SEKOLAH.email}`, ket: 'Dibalas dalam 1×24 jam kerja' },
  { label: 'Datang langsung', icon: MapPin, nilai: 'Petunjuk arah', href: petaUrl, ket: 'Ruang Tata Usaha, dekat gerbang utama' },
]

// Sketsa peta lokasi sekolah (pengganti peta interaktif)
function SketsaPeta() {
  return (
    <a href={petaUrl} target="_blank" rel="noreferrer" className="group relative block overflow-hidden rounded-[2rem] bg-kartu ring-1 ring-garis">
      <svg viewBox="0 0 400 300" className="block h-auto w-full" role="img" aria-label={`Sketsa peta lokasi ${SEKOLAH.nama} di Jl. Merdeka. Buka di Google Maps.`}>
        <g fill="none" stroke="var(--color-tinta)" strokeWidth="1.5" strokeLinecap="round">
          {/* Jalan (garis ganda) */}
          <path d="M-10 110 H410 M-10 134 H410" />
          <path d="M140 -10 V110 M162 -10 V110 M140 134 V310 M162 134 V310" />
          <path d="M288 -10 L270 110 M308 -10 L290 110 M266 134 L246 310 M286 134 L266 310" />
          <path d="M-10 122 H410" strokeDasharray="6 8" strokeWidth="1" opacity="0.5" />
          {/* Sungai */}
          <path d="M-10 238 C 60 222, 110 260, 140 250 M162 246 C 200 236, 230 250, 252 246 M282 244 C 320 236, 360 256, 410 240" stroke="rgb(74 120 190 / 0.6)" strokeWidth="2" />
          {/* Blok bangunan */}
          {[
            [24, 30, 92, 56],
            [186, 26, 72, 34],
            [330, 30, 54, 56],
            [24, 160, 92, 52],
            [300, 160, 84, 50],
          ].map(([x, y, w, h]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} fill="var(--color-kertas-tua)" strokeWidth="1" />
          ))}
          {/* Sekolah */}
          <rect x="182" y="152" width="70" height="64" fill="var(--color-primary-100)" stroke="var(--color-primary-700)" strokeWidth="1.5" />
          <path d="M182 152 l35 -18 l35 18" stroke="var(--color-primary-700)" />
          {/* Pohon */}
          <circle cx="60" cy="270" r="9" />
          <circle cx="352" cy="270" r="11" />
        </g>
        <g fontFamily="Plus Jakarta Sans, sans-serif" fontSize="11" fill="var(--color-tinta-2)">
          <text x="20" y="104">Jl. Merdeka</text>
          <text x="168" y="296" transform="rotate(-90 168 296)">Jl. Melati</text>
        </g>
      </svg>
      <span className="absolute left-[54%] top-[38%] -translate-x-1/2 -translate-y-full text-center">
        <span className="block rounded-full bg-primary-600 px-3 py-1 text-xs font-bold text-white shadow">{SEKOLAH.nama}</span>
        <span aria-hidden="true" className="mx-auto block h-3 w-px bg-primary-700" />
      </span>
      <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-tinta px-4 py-2 text-xs font-bold text-white transition group-hover:bg-black">
        Buka di Google Maps <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </a>
  )
}

export default function Kontak() {
  const [terkirim, setTerkirim] = useState(false)
  const [error, setError] = useState('')
  const [jebakan, setJebakan] = useState('')

  // Belum terhubung ke backend: pesan hanya ditampilkan sebagai terkirim.
  // Anti-spam: kolom jebakan bot & maksimal 3 pesan per 10 menit dari perangkat yang sama.
  const kirim = (e) => {
    e.preventDefault()
    setTerkirim(false)
    if (jebakan) return setError('Pesan tidak dapat dikirim. Muat ulang halaman lalu coba lagi.')
    const tunggu = tungguKirim('kontak', 3, 10)
    if (tunggu) return setError(`Terlalu banyak pesan dari perangkat ini. Coba lagi dalam ${tunggu} menit.`)
    catatKirim('kontak', 10)
    e.target.reset()
    setError('')
    setTerkirim(true)
  }

  return (
    <>
      <KepalaHalaman
        jejak="Kontak"
        judul="Ada pertanyaan? Kami siap membantu."
        desc="Seputar sekolah, PPDB, atau administrasi. Pilih cara yang paling nyaman untuk Bapak/Ibu."
        foto={FOTO.gedung}
      />

      <section className={`${wadah} pt-14 lg:pt-20`}>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KANAL.map((k, i) => (
            <li key={k.label}>
              <a
                href={k.href}
                target={k.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className={`group flex h-full flex-col rounded-[1.75rem] p-6 transition hover:-translate-y-1 ${
                  i === 0 ? 'bg-primary-600 text-white' : 'bg-kartu ring-1 ring-garis hover:shadow-[0_24px_50px_-30px_rgb(68_6_11/0.5)]'
                }`}
              >
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${i === 0 ? 'bg-white/15' : 'bg-primary-50 text-primary-700'}`}>
                  <k.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className={`mt-6 text-sm font-bold uppercase tracking-[0.14em] ${i === 0 ? 'text-white/85' : 'text-primary-700'}`}>{k.label}</span>
                <span className={`mt-1 block font-extrabold leading-snug tracking-tight ${k.nilai.includes('@') ? 'text-lg' : 'text-2xl'}`}>
                  {/* Email dipatah setelah '@' agar tidak terpotong di tengah kata */}
                  {k.nilai.includes('@') ? (
                    <>
                      {k.nilai.split('@')[0]}@<wbr />
                      {k.nilai.split('@')[1]}
                    </>
                  ) : (
                    k.nilai
                  )}
                </span>
                <span className={`mt-1 block text-[15px] ${i === 0 ? 'text-white/85' : 'text-tinta-3'}`}>{k.ket}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${wadah} grid gap-6 py-6 pb-16 lg:grid-cols-[1fr_1.15fr] lg:pb-24`}>
        <div className="space-y-4">
          <SketsaPeta />
          <dl className="divide-y divide-garis rounded-[2rem] bg-kartu px-6 py-2 text-[15px] ring-1 ring-garis">
            {[
              ['Alamat', SEKOLAH.alamat],
              ['Jam operasional', SEKOLAH.jamOperasional],
              ['Tutup', 'Sabtu, Minggu & hari libur nasional'],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-3 py-3.5">
                <dt className="text-tinta-3">{k}</dt>
                <dd className="font-semibold leading-relaxed">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-[2rem] bg-kartu p-6 ring-1 ring-garis sm:p-10">
          <h2 className="text-4xl leading-tight">Kirim pesan</h2>
          <Catatan className="mt-2">Kami balas lewat WhatsApp pada jam kerja.</Catatan>
          <div aria-live="polite">
            {terkirim && (
              <div className="mt-5">
                <Alert>Terima kasih! Pesan Anda sudah kami terima.</Alert>
              </div>
            )}
            {error && (
              <div className="mt-5" role="alert">
                <Alert tone="error">{error}</Alert>
              </div>
            )}
          </div>
          <form onSubmit={kirim} className="relative mt-7 grid gap-5 sm:grid-cols-2">
            <JebakanBot value={jebakan} onChange={setJebakan} />
            <div>
              <label className={labelIsian} htmlFor="nama">
                Nama lengkap
              </label>
              <input id="nama" required className={isian} placeholder="Nama Bapak/Ibu" autoComplete="name" />
            </div>
            <div>
              <label className={labelIsian} htmlFor="hp">
                No. WhatsApp
              </label>
              <input id="hp" required type="tel" className={isian} placeholder="08xx-xxxx-xxxx" autoComplete="tel" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelIsian} htmlFor="topik">
                Topik
              </label>
              <select id="topik" className={isian}>
                <option>Informasi PPDB</option>
                <option>Kunjungan sekolah</option>
                <option>Akademik</option>
                <option>Administrasi & Keuangan</option>
                <option>Kerja sama / kemitraan</option>
                <option>Lainnya</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelIsian} htmlFor="pesan">
                Pesan
              </label>
              <textarea id="pesan" required rows={6} className={isian} placeholder="Tulis pertanyaan Anda..." />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className={`${tombol.utama} w-full sm:w-auto sm:px-8`}>
                <Send className="h-4 w-4" /> Kirim pesan
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="bg-kertas-tua/70 py-20 lg:py-28">
        <div className={`${wadah} grid gap-12 lg:grid-cols-[0.8fr_1.2fr]`}>
          <JudulBagian label="Tanya jawab" judul="Mungkin jawabannya sudah ada di sini." className="lg:sticky lg:top-28 lg:self-start" />
          <Faq daftar={FAQ.slice(2)} />
        </div>
      </section>
    </>
  )
}
