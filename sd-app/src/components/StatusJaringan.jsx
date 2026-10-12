import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, CloudOff, TriangleAlert, WifiOff, X } from 'lucide-react'

const INTERVAL_CEK = 20000 // jeda antarpemeriksaan saat halaman sedang dilihat
const BATAS_LAMBAT = 2500 // respons server lebih lama dari ini dianggap lambat
const BATAS_WAKTU = 8000 // tanpa respons selama ini dianggap gagal
const LAMA_PULIH = 4000 // lama pesan "koneksi kembali normal" tampil

const PESAN = {
  offline: {
    ikon: WifiOff,
    judul: 'Anda sedang offline',
    teks: 'Periksa WiFi atau data seluler. Halaman akan tersambung lagi secara otomatis.',
    cls: 'bg-slate-900 text-white',
    peran: 'alert',
  },
  terputus: {
    ikon: CloudOff,
    judul: 'Tidak dapat terhubung ke server sekolah',
    teks: 'Koneksi internet bermasalah. Kami terus mencoba menyambung kembali.',
    cls: 'bg-rose-600 text-white',
    peran: 'alert',
  },
  lemah: {
    ikon: TriangleAlert,
    judul: 'Jaringan kurang stabil',
    teks: 'Halaman mungkin lambat dimuat. Tunggu sebentar sebelum menyimpan atau mengirim data.',
    cls: 'bg-amber-400 text-amber-950',
    peran: 'status',
  },
  pulih: { ikon: CheckCircle2, judul: 'Koneksi kembali normal', cls: 'bg-emerald-600 text-white', peran: 'status' },
}

// Kualitas jaringan menurut browser (Network Information API, tersedia di Chrome & Android)
function browserMelaporkanLemah() {
  const c = navigator.connection
  if (!c) return false
  return ['slow-2g', '2g'].includes(c.effectiveType) || c.rtt > 1500 || (c.downlink > 0 && c.downlink < 0.3)
}

// Waktu respons server dalam ms (permintaan kecil tanpa cache), atau null jika gagal
async function ukurServer() {
  const batal = new AbortController()
  const t = setTimeout(() => batal.abort(), BATAS_WAKTU)
  const mulai = performance.now()
  try {
    await fetch(`/favicon.png?cek=${Date.now()}`, { method: 'HEAD', cache: 'no-store', signal: batal.signal })
    return performance.now() - mulai
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

/*
  Pemberitahuan saat koneksi terputus atau kurang stabil. "Kurang stabil" baru ditampilkan jika
  2 dari 3 pemeriksaan terakhir lambat/gagal (termasuk yang terakhir), agar tidak berkedip
  karena gangguan sesaat.
*/
export default function StatusJaringan() {
  const [status, setStatus] = useState(() => (typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'baik'))
  const [ditutup, setDitutup] = useState(null)
  const statusRef = useRef(status)

  useEffect(() => {
    let aktif = true
    let timerPulih
    let riwayat = []

    const tetapkan = (baru) => {
      if (!aktif) return
      const lama = statusRef.current
      if (baru === 'baik') {
        if (lama === 'baik' || lama === 'pulih') return
        baru = 'pulih'
        clearTimeout(timerPulih)
        timerPulih = setTimeout(() => {
          statusRef.current = 'baik'
          setStatus('baik')
        }, LAMA_PULIH)
      } else {
        clearTimeout(timerPulih)
      }
      statusRef.current = baru
      setStatus(baru)
    }

    const cek = async () => {
      if (!navigator.onLine) return tetapkan('offline')
      if (document.visibilityState === 'hidden') return
      const ms = await ukurServer()
      riwayat = [...riwayat, ms].slice(-3)
      const buruk = (x) => x === null || x > BATAS_LAMBAT
      const terakhir = riwayat.at(-1)
      if (riwayat.length >= 2 && riwayat.slice(-2).every((x) => x === null)) tetapkan('terputus')
      else if ((buruk(terakhir) && riwayat.filter(buruk).length >= 2) || browserMelaporkanLemah()) tetapkan('lemah')
      else tetapkan('baik')
    }

    const putus = () => tetapkan('offline')
    const sambung = () => {
      riwayat = []
      cek()
    }
    window.addEventListener('offline', putus)
    window.addEventListener('online', sambung)
    window.addEventListener('focus', cek)
    navigator.connection?.addEventListener?.('change', cek)
    const jam = setInterval(cek, INTERVAL_CEK)
    cek()
    return () => {
      aktif = false
      clearTimeout(timerPulih)
      clearInterval(jam)
      window.removeEventListener('offline', putus)
      window.removeEventListener('online', sambung)
      window.removeEventListener('focus', cek)
      navigator.connection?.removeEventListener?.('change', cek)
    }
  }, [])

  // Pemberitahuan yang ditutup akan muncul lagi bila jaringan sempat pulih lalu bermasalah lagi
  useEffect(() => {
    if (status === 'baik' || status === 'pulih') setDitutup(null)
  }, [status])

  if (status === 'baik' || ditutup === status) return null
  const { ikon: Ikon, judul, teks, cls, peran } = PESAN[status]

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[70] flex justify-center px-4">
      <div role={peran} className={`tampil-lembut pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl ${cls}`}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-black/10">
          <Ikon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{judul}</p>
          {teks && <p className="text-xs opacity-90">{teks}</p>}
        </div>
        {status !== 'pulih' && (
          <button onClick={() => setDitutup(status)} aria-label="Tutup pemberitahuan" className="rounded-lg p-1.5 opacity-80 transition hover:bg-white/15 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
