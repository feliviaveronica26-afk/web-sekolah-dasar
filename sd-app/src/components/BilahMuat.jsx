import { useEffect, useRef, useState } from 'react'
import { dengarMuat } from '../utils/muat'

const TUNDA_NORMAL = 800 // permintaan yang belum selesai selama ini dianggap lambat, bilah ditampilkan
const TUNDA_LEMAH = 150 // jaringan sudah diketahui lemah: bilah tampil hampir seketika
const MIN_TAMPIL = 700 // lama tampil minimal agar bilah tidak berkedip
const LAMA_SELESAI = 750 // bilah penuh sejenak sebelum menghilang

/*
  Bilah muat berbentuk kapsul dengan logo sekolah di ujung isian. Tampil hanya bila permintaan ke
  server lambat (jaringan kurang stabil); di jaringan normal permintaan selesai sebelum bilah sempat
  muncul. Kemajuannya perkiraan (makin lama makin pelan, berhenti di 92%), lalu penuh saat selesai.
*/
export default function BilahMuat({ lemah = false }) {
  const [sibuk, setSibuk] = useState(false)
  const [fase, setFase] = useState('diam') // 'diam' | 'jalan' | 'selesai'
  const [persen, setPersen] = useState(0)
  const mulai = useRef(0)

  useEffect(() => dengarMuat((n) => setSibuk(n > 0)), [])

  useEffect(() => {
    if (sibuk && fase === 'diam') {
      const t = setTimeout(
        () => {
          mulai.current = Date.now()
          setPersen(14)
          setFase('jalan')
        },
        lemah ? TUNDA_LEMAH : TUNDA_NORMAL,
      )
      return () => clearTimeout(t)
    }
    if (sibuk && fase === 'selesai') {
      setPersen((p) => Math.min(p, 60))
      setFase('jalan')
    }
    if (!sibuk && fase === 'jalan') {
      const t = setTimeout(
        () => {
          setPersen(100)
          setFase('selesai')
        },
        Math.max(0, MIN_TAMPIL - (Date.now() - mulai.current)),
      )
      return () => clearTimeout(t)
    }
    if (fase === 'selesai') {
      const t = setTimeout(() => {
        setFase('diam')
        setPersen(0)
      }, LAMA_SELESAI)
      return () => clearTimeout(t)
    }
  }, [sibuk, fase, lemah])

  // Kemajuan perkiraan: mendekati 92% makin lama makin pelan
  useEffect(() => {
    if (fase !== 'jalan') return
    const t = setInterval(() => setPersen((p) => Math.min(92, p + (92 - p) * 0.09)), 350)
    return () => clearInterval(t)
  }, [fase])

  if (fase === 'diam') return null

  const selesai = fase === 'selesai'
  const teks = selesai ? 'Selesai!' : lemah ? 'Jaringan lambat, tetap memuat…' : 'Sebentar ya, sedang memuat…'
  // Isian minimal selebar setengah lencana logo, agar logo tidak keluar dari jalur
  const ujung = `max(1.25rem, ${persen}%)`

  return (
    <div
      role="progressbar"
      aria-label="Memuat data dari server"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(persen)}
      className={`pointer-events-none w-full max-w-xs ${selesai ? 'bilah-keluar' : 'tampil-lembut'}`}
    >
      <div className="rounded-[1.4rem] bg-white/95 px-4 pb-4 pt-3 shadow-[0_18px_40px_-14px_rgb(68_6_11/0.5)] ring-1 ring-black/5 backdrop-blur">
        <p aria-hidden="true" className="text-center text-[13px] font-bold text-tinta">
          {teks}
        </p>
        {/* Jalur bilah: isian merah putih bergaris dengan lencana logo sekolah di ujungnya */}
        <div className="relative mt-3 h-4 rounded-full bg-primary-50 ring-1 ring-inset ring-primary-100">
          <div className="bilah-isi absolute inset-y-0 left-0 overflow-hidden rounded-full bg-primary-600" style={{ width: ujung }}>
            <span aria-hidden="true" className="bilah-garis absolute inset-0" />
            <span aria-hidden="true" className="bilah-kilau absolute inset-y-0 -left-1/2 w-1/2" />
          </div>
          <span aria-hidden="true" className="bilah-logo absolute top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center" style={{ left: `calc(${ujung} - 1.4rem)` }}>
            <span className="cincin-denyut absolute inset-0 rounded-full bg-primary-200" />
            <span className="relative grid h-9 w-9 place-items-center rounded-full bg-white shadow-[0_4px_12px_-2px_rgb(68_6_11/0.55)] ring-2 ring-primary-600">
              <img src="/logo.png" alt="" className="logo-ayun h-6 w-6 object-contain" />
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
