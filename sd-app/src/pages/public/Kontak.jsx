import { useState } from 'react'
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { Alert, Card, PageHeader, btn, inputCls, labelCls } from '../../components/ui'
import { SEKOLAH } from '../../data/dummy'

const INFO = [
  { icon: MapPin, label: 'Alamat', nilai: SEKOLAH.alamat },
  { icon: Phone, label: 'Telepon', nilai: SEKOLAH.telepon },
  { icon: MessageCircle, label: 'WhatsApp', nilai: SEKOLAH.whatsapp },
  { icon: Mail, label: 'Email', nilai: SEKOLAH.email },
  { icon: Clock, label: 'Jam Operasional', nilai: SEKOLAH.jamOperasional },
]

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
      <PageHeader title="Hubungi Kami" subtitle="Punya pertanyaan? Kami siap membantu Bapak/Ibu." />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          {INFO.map(({ icon: Icon, label, nilai }) => (
            <Card key={label} className="flex gap-4 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="font-semibold text-slate-800">{nilai}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">Kirim Pesan</h2>
          <p className="mt-1 text-sm text-slate-500">Kami akan membalas pada jam kerja.</p>
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
                <option>Akademik</option>
                <option>Administrasi & Keuangan</option>
                <option>Lainnya</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="pesan">Pesan</label>
              <textarea id="pesan" required rows={5} className={inputCls} placeholder="Tulis pertanyaan Anda..." />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className={btn.primary}>
                <Send className="h-4 w-4" /> Kirim Pesan
              </button>
            </div>
          </form>
        </Card>
      </section>
    </>
  )
}
