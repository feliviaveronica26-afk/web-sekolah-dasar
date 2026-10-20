import { useState } from 'react'
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import Faq from '../../components/Faq'
import { Catatan, JudulBagian, KepalaHalaman, isian, isianPilih, labelIsian, tombol, wadah } from '../../components/Situs'
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
    <a href={petaUrl} target="_blank" rel="noreferrer" className="sketsa-peta position-relative d-block overflow-hidden rounded-5 bg-white border border-garis">
      <svg viewBox="0 0 400 300" className="d-block h-auto w-100" role="img" aria-label={`Sketsa peta lokasi ${SEKOLAH.nama} di Jl. Merdeka. Buka di Google Maps.`}>
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
      <span className="penanda-peta position-absolute text-center">
        <span className="d-block rounded-pill bg-primary px-3 py-1 fs-xs fw-bold text-white shadow">{SEKOLAH.nama}</span>
        <span aria-hidden="true" className="mx-auto d-block h-3 bg-merah-700" style={{ width: 1 }} />
      </span>
      <span className="tombol-peta position-absolute bottom-0 end-0 mb-4 me-4 d-inline-flex align-items-center gap-1 rounded-pill bg-tinta px-4 py-2 fs-xs fw-bold text-white transisi">
        Buka di Google Maps <ArrowUpRight className="ukuran-3-5" />
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

      <section className={`${wadah} pt-14 pt-lg-20`}>
        <ul className="d-grid gap-4 kolom-sm-2 kolom-lg-4">
          {KANAL.map((k, i) => (
            <li key={k.label}>
              <a
                href={k.href}
                target={k.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className={`hover-angkat d-flex h-100 flex-column rounded-kartu p-6 ${i === 0 ? 'bg-primary text-white' : 'bg-white border border-garis'}`}
              >
                <span className={`d-flex align-items-center justify-content-center ukuran-12 rounded-3 ${i === 0 ? 'bg-white bg-opacity-15' : 'bg-merah-50 text-merah-700'}`}>
                  <k.icon className="ukuran-6" aria-hidden="true" />
                </span>
                <span className={`mt-6 fs-sm fw-bold text-uppercase ls-widest ${i === 0 ? 'text-white text-opacity-85' : 'text-merah-700'}`}>{k.label}</span>
                <span className={`mt-1 d-block fw-extrabold lh-snug ls-tight ${k.nilai.includes('@') ? 'fs-lg' : 'fs-2xl'}`}>
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
                <span className={`mt-1 d-block fs-15 ${i === 0 ? 'text-white text-opacity-85' : 'text-tinta-3'}`}>{k.ket}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${wadah} py-6 pb-16 pb-lg-24`}>
        <div className="row g-6">
          <div className="col-lg-5 d-flex flex-column gap-4">
            <SketsaPeta />
            <dl className="pembatas-y rounded-5 bg-white px-6 py-2 fs-15 border border-garis">
              {[
                ['Alamat', SEKOLAH.alamat],
                ['Jam operasional', SEKOLAH.jamOperasional],
                ['Tutup', 'Sabtu, Minggu & hari libur nasional'],
              ].map(([k, v]) => (
                <div key={k} className="info-kontak d-grid gap-3 py-3-5">
                  <dt className="text-tinta-3">{k}</dt>
                  <dd className="fw-semibold lh-relaxed">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="col-lg-7">
            <div className="rounded-5 bg-white p-6 p-sm-10 border border-garis">
              <h2 className="fs-4xl lh-tight">Kirim pesan</h2>
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
              <form onSubmit={kirim} className="position-relative mt-7 d-grid gap-5 kolom-sm-2">
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
                <div className="rentang-sm-2">
                  <label className={labelIsian} htmlFor="topik">
                    Topik
                  </label>
                  <select id="topik" className={isianPilih}>
                    <option>Informasi PPDB</option>
                    <option>Kunjungan sekolah</option>
                    <option>Akademik</option>
                    <option>Administrasi & Keuangan</option>
                    <option>Kerja sama / kemitraan</option>
                    <option>Lainnya</option>
                  </select>
                </div>
                <div className="rentang-sm-2">
                  <label className={labelIsian} htmlFor="pesan">
                    Pesan
                  </label>
                  <textarea id="pesan" required rows={6} className={isian} placeholder="Tulis pertanyaan Anda..." />
                </div>
                <div className="rentang-sm-2">
                  <button type="submit" className={`${tombol.utama} w-100 w-sm-auto px-sm-8`}>
                    <Send className="ukuran-4" /> Kirim pesan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="latar-kertas-lembut py-20 py-lg-28">
        <div className={wadah}>
          <div className="row gx-0 gy-12 gx-lg-12">
            <div className="col-lg-5">
              <JudulBagian label="Tanya jawab" judul="Mungkin jawabannya sudah ada di sini." className="position-lg-sticky top-lg-28" />
            </div>
            <div className="col-lg-7">
              <Faq daftar={FAQ.slice(2)} />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
