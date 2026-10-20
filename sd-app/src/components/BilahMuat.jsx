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
      className={`pe-none w-100 mw-xs ${selesai ? 'bilah-keluar' : 'tampil-lembut'}`}
    >
      <div className="bilah-kotak px-4 pb-4 pt-3 buram">
        <p aria-hidden="true" className="text-center fs-13 fw-bold text-tinta">
          {teks}
        </p>
        {/* Jalur bilah: isian merah putih bergaris dengan lencana logo sekolah di ujungnya */}
        <div className="bilah-jalur position-relative mt-3 h-4 rounded-pill bg-merah-50">
          <div className="bilah-isi position-absolute top-0 bottom-0 start-0 overflow-hidden rounded-pill bg-primary" style={{ width: ujung }}>
            <span aria-hidden="true" className="bilah-garis position-absolute inset-0" />
            <span aria-hidden="true" className="bilah-kilau position-absolute top-0 bottom-0 w-50" style={{ left: '-50%' }} />
          </div>
          <span
            aria-hidden="true"
            className="bilah-logo position-absolute top-50 translate-middle-y d-flex align-items-center justify-content-center ukuran-9"
            style={{ left: `calc(${ujung} - 1.4rem)` }}
          >
            <span className="cincin-denyut position-absolute inset-0 rounded-circle bg-merah-200" />
            <span className="bilah-lencana position-relative d-flex align-items-center justify-content-center ukuran-9 rounded-circle bg-white">
              <img src="/logo.png" alt="" className="logo-ayun ukuran-6 object-fit-contain" />
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
