import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Download,
  File,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Image as IkonFoto,
  Info,
  Lock,
  MessageCirclePlus,
  MessagesSquare,
  Mic,
  Pin,
  Music,
  Paperclip,
  Pause,
  Play,
  Presentation,
  Search,
  Send,
  ShieldCheck,
  Square,
  Trash2,
  Users,
  UsersRound,
  X,
} from 'lucide-react'
import { Avatar, Modal, btn, inputCls } from '../components/ui'
import { useChat, useChatSaya } from '../context/ChatContext'
import { useData, useSegarCepat } from '../context/DataContext'
import { perkecilFoto, urlBerkas } from '../utils/berkasChat'
import {
  MAKS_DURASI_SUARA,
  MAKS_TEKS,
  MAKS_UKURAN,
  TERIMA,
  adminGrup,
  bolehBuka,
  bolehKirim,
  bolehPribadi,
  ekstensi,
  formatDurasi,
  formatUkuran,
  idPribadi,
  infoGrup,
  jenisBerkas,
  kontakPribadi,
  namaAman,
  pesertaPribadi,
  pidKepsekOrtu,
  profil,
  ringkas,
} from '../utils/chat'
import { formatTanggal, tambahHari, toKey, todayKey } from '../utils/format'

const PER_HALAMAN = 60
const jam = (iso) => new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')
const kunciTanggal = (iso) => toKey(new Date(iso))
function labelTanggal(key) {
  if (key === todayKey()) return 'Hari ini'
  if (key === tambahHari(todayKey(), -1)) return 'Kemarin'
  return formatTanggal(key)
}
const waktuDaftar = (iso) => {
  const key = kunciTanggal(iso)
  return key === todayKey() ? jam(iso) : key === tambahHari(todayKey(), -1) ? 'Kemarin' : formatTanggal(key, { year: undefined })
}

const WARNA_NAMA = ['text-info', 'text-success', 'teks-violet', 'teks-orange', 'text-danger', 'teks-teal', 'teks-indigo']
const warnaNama = (id) => WARNA_NAMA[[...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 997, 7) % WARNA_NAMA.length]

const GAYA_GRUP = {
  kelas: { ikon: GraduationCap, cls: 'bg-merah-100 text-merah-700' },
  ortu: { ikon: UsersRound, cls: 'bg-warning-subtle text-warning-emphasis' },
  staf: { ikon: Users, cls: 'bg-info-subtle text-info' },
}

const CATATAN_GRUP = {
  kelas: 'Grup kelas dipantau guru. Gunakan bahasa yang sopan dan saling menghargai ya! 😊',
  ortu: 'Grup resmi orang tua bersama wali kelas dan kepala sekolah. Untuk izin tidak masuk, gunakan menu Izin.',
  staf: 'Grup internal guru & staf sekolah.',
}

// Nama, keterangan & tampilan untuk satu percakapan
function infoPercakapan(data, saya, pid) {
  if (pid.startsWith('grup:')) {
    const g = infoGrup(data, pid)
    return { ...g, grup: true, gaya: GAYA_GRUP[g.tipe] }
  }
  const lawan = pesertaPribadi(pid).find((x) => x !== saya)
  const p = profil(data, lawan)
  return { id: pid, grup: false, nama: p.nama, sub: p.sub, lawan }
}

function AvatarPercakapan({ info, size = 'md' }) {
  if (!info.grup) return <Avatar nama={info.nama} size={size} />
  const Ikon = info.gaya.ikon
  const ukuran = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11'
  return (
    <span className={`d-flex flex-shrink-0 align-items-center justify-content-center rounded-pill ${ukuran} ${info.gaya.cls}`}>
      <Ikon className="h-5 w-5" />
    </span>
  )
}

// Ubah alamat web di teks menjadi tautan yang aman (tab baru, tanpa akses ke halaman ini)
function tautkan(teks) {
  return teks.split(/(https?:\/\/[^\s<]+)/g).map((b, i) =>
    i % 2 ? (
      <a key={i} href={b} target="_blank" rel="noopener noreferrer" className="text-break text-decoration-underline link-offset-1">
        {b}
      </a>
    ) : (
      b
    ),
  )
}

// Berkas diambil langsung dari server; jika gagal dimuat (mis. sudah dihapus) tampil keterangan
function useUrlBerkas(id) {
  const [hilang, setHilang] = useState(false)
  useEffect(() => setHilang(false), [id])
  return { url: urlBerkas(id), status: hilang ? 'hilang' : 'siap', onError: () => setHilang(true) }
}

function PemutarSuara({ url, durasi }) {
  const ref = useRef(null)
  const [main, setMain] = useState(false)
  const [posisi, setPosisi] = useState(0)
  const total = durasi || 0
  return (
    <div className="d-flex w-60 mw-100 align-items-center gap-3 py-1">
      <button
        type="button"
        onClick={() => (main ? ref.current.pause() : ref.current.play())}
        className="d-flex h-10 w-10 flex-shrink-0 align-items-center justify-content-center rounded-pill latar-arus-15"
        aria-label={main ? 'Jeda pesan suara' : 'Putar pesan suara'}
      >
        {main ? <Pause className="h-5 w-5" /> : <Play className="ms-0-5 h-5 w-5" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="h-1-5 overflow-hidden rounded-pill latar-arus-20">
          <div className="h-100 rounded-pill latar-arus" style={{ width: `${total ? Math.min(100, (posisi / total) * 100) : 0}%` }} />
        </div>
        <p className="mt-1 fs-2xs opacity-75">
          <Mic className="me-0-5 d-inline h-3 w-3" /> {formatDurasi(main || posisi ? posisi : total)}
        </p>
      </div>
      <audio
        ref={ref}
        src={url}
        preload="metadata"
        onPlay={() => setMain(true)}
        onPause={() => setMain(false)}
        onEnded={() => {
          setMain(false)
          setPosisi(0)
        }}
        onTimeUpdate={(e) => setPosisi(e.currentTarget.currentTime)}
      />
    </div>
  )
}

const IKON_DOKUMEN = {
  pdf: [FileText, 'text-danger'],
  doc: [FileText, 'text-info'],
  docx: [FileText, 'text-info'],
  odt: [FileText, 'text-info'],
  rtf: [FileText, 'text-info'],
  txt: [FileText, 'text-tinta-2'],
  xls: [FileSpreadsheet, 'text-success'],
  xlsx: [FileSpreadsheet, 'text-success'],
  ods: [FileSpreadsheet, 'text-success'],
  csv: [FileSpreadsheet, 'text-success'],
  ppt: [Presentation, 'teks-orange'],
  pptx: [Presentation, 'teks-orange'],
  odp: [Presentation, 'teks-orange'],
}

function Lampiran({ l, onLihatFoto }) {
  const { url, status, onError } = useUrlBerkas(l.id)
  if (status === 'hilang') return <p className="rounded-2 latar-arus-10 px-3 py-2 fs-xs fst-italic opacity-80">Berkas tidak bisa dimuat</p>
  if (l.jenis === 'foto') {
    return (
      <button type="button" onClick={() => onLihatFoto({ url, nama: l.nama })} className="d-block overflow-hidden rounded-2" aria-label={`Lihat foto ${l.nama}`}>
        <img src={url} alt={l.nama} loading="lazy" onError={onError} className="mh-72 w-100 mw-xs object-fit-cover" />
      </button>
    )
  }
  if (l.jenis === 'video') return <video src={url} controls preload="metadata" onError={onError} className="mh-72 w-100 mw-xs rounded-2 bg-black" />
  if (l.jenis === 'suara') return <PemutarSuara url={url} durasi={l.durasi} />
  if (l.jenis === 'audio') {
    return (
      <div className="w-64 mw-100">
        <p className="mb-1 d-flex align-items-center gap-1-5 text-truncate fs-xs fw-semibold">
          <Music className="h-3-5 w-3-5 flex-shrink-0" /> {l.nama}
        </p>
        <audio src={url} controls preload="metadata" className="h-10 w-100" />
      </div>
    )
  }
  const ext = ekstensi(l.nama)
  const [Ikon, warna] = IKON_DOKUMEN[ext] ?? [File, 'text-tinta-2']
  return (
    <a href={url} download={l.nama} className="d-flex w-64 mw-100 align-items-center gap-3 rounded-2 latar-arus-10 p-2-5 transisi hover-latar-arus-15">
      <span className={`d-flex h-10 w-10 flex-shrink-0 align-items-center justify-content-center rounded-1 bg-white ${warna}`}>
        <Ikon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="d-block text-truncate fs-sm fw-semibold">{l.nama}</span>
        <span className="d-block fs-xs opacity-75">
          {ext.toUpperCase()} · {formatUkuran(l.ukuran)}
        </span>
      </span>
      <Download className="h-4 w-4 flex-shrink-0" />
    </a>
  )
}

function Gelembung({ p, saya, data, grup, anggotaLain, dibaca, bisaHapus, onHapus, onLihatFoto }) {
  const milikSaya = p.dari === saya
  const pengirim = profil(data, p.dari)
  if (p.dihapus) {
    const olehSendiri = p.dihapus.oleh === p.dari
    return (
      <div className={`d-flex ${milikSaya ? 'justify-content-end' : 'justify-content-start'}`}>
        <p className="rounded-3 bg-white bg-opacity-70 px-3 py-2 fs-xs fst-italic text-abu-400 border border-abu-200">
          🚫 {olehSendiri ? 'Pesan ini dihapus' : `Pesan dihapus oleh ${profil(data, p.dihapus.oleh).nama.split(',')[0]}`}
        </p>
      </div>
    )
  }
  // Status baca pesan sendiri: ✓ terkirim, ✓✓ biru = dibaca semua penerima
  const pembaca = milikSaya ? anggotaLain.filter((a) => (dibaca[a]?.[p.pid] ?? '') >= p.waktu).length : 0
  const semuaBaca = milikSaya && anggotaLain.length > 0 && pembaca === anggotaLain.length
  return (
    <div className={`grup d-flex ${milikSaya ? 'justify-content-end' : 'justify-content-start'}`}>
      <div
        className={`position-relative lebar-gelembung rounded-3 px-3 py-2 shadow-sm ${
          milikSaya ? 'sudut-bawah-kanan-kecil bg-primary text-white' : 'sudut-bawah-kiri-kecil bg-white text-tinta border border-abu-100'
        }`}
      >
        {grup && !milikSaya && (
          <p className={`mb-0-5 text-truncate fs-xs fw-bold ${warnaNama(p.dari)}`}>
            {pengirim.nama.split(',')[0]} <span className="fw-medium text-abu-400">· {pengirim.label}</span>
          </p>
        )}
        {p.lampiran && (
          <div className={p.teks ? 'mb-1-5' : ''}>
            <Lampiran l={p.lampiran} onLihatFoto={onLihatFoto} />
          </div>
        )}
        {p.teks && <p className="spasi-pre-wrap text-break fs-sm lh-relaxed">{tautkan(p.teks)}</p>}
        <p className={`mt-0-5 d-flex align-items-center justify-content-end gap-1 fs-10 ${milikSaya ? 'text-merah-100' : 'text-abu-400'}`}>
          {jam(p.waktu)}
          {milikSaya &&
            (semuaBaca ? (
              <CheckCheck className="h-3-5 w-3-5 teks-terang-sky" aria-label="Dibaca" />
            ) : (
              <span title={grup ? `Dibaca ${pembaca} dari ${anggotaLain.length} anggota` : 'Terkirim'} className="d-inline-flex">
                {pembaca > 0 ? <CheckCheck className="h-3-5 w-3-5" aria-label="Dibaca sebagian" /> : <Check className="h-3-5 w-3-5" aria-label="Terkirim" />}
              </span>
            ))}
        </p>
        {bisaHapus && (
          <button
            type="button"
            onClick={onHapus}
            title="Hapus pesan"
            aria-label="Hapus pesan"
            className={`position-absolute top-n2 d-flex h-7 w-7 align-items-center justify-content-center rounded-pill bg-white text-danger opacity-0 grup-tampil shadow border border-abu-200 transisi ${
              milikSaya ? '-left-3' : '-right-3'
            }`}
          >
            <Trash2 className="h-3-5 w-3-5" />
          </button>
        )}
      </div>
    </div>
  )
}

// Rekam pesan suara dengan mikrofon (butuh localhost/HTTPS)
function Perekam({ onSelesai, onBatal, onGagal }) {
  const [detik, setDetik] = useState(0)
  const rekam = useRef(null)
  const batal = useRef(false)
  const mulai = useRef(0)

  useEffect(() => {
    let jalan = true
    let timer
    ;(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (!jalan) return stream.getTracks().forEach((t) => t.stop())
        const tipe = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4'].find((t) => MediaRecorder.isTypeSupported(t))
        const rec = new MediaRecorder(stream, { ...(tipe && { mimeType: tipe }), audioBitsPerSecond: 32000 })
        const potongan = []
        rec.ondataavailable = (e) => e.data.size && potongan.push(e.data)
        rec.onstop = () => {
          stream.getTracks().forEach((t) => t.stop())
          clearInterval(timer)
          if (batal.current) return
          const durasi = Math.max(1, Math.round((Date.now() - mulai.current) / 1000))
          onSelesai(new Blob(potongan, { type: rec.mimeType || 'audio/webm' }), durasi)
        }
        rekam.current = rec
        mulai.current = Date.now()
        rec.start(250)
        timer = setInterval(() => {
          const d = Math.floor((Date.now() - mulai.current) / 1000)
          setDetik(d)
          if (d >= MAKS_DURASI_SUARA) rec.state === 'recording' && rec.stop()
        }, 250)
      } catch (e) {
        onGagal(e.name === 'NotAllowedError' ? 'Izin mikrofon ditolak. Izinkan mikrofon di pengaturan browser.' : 'Mikrofon tidak dapat digunakan di perangkat ini.')
      }
    })()
    return () => {
      jalan = false
      batal.current = true
      clearInterval(timer)
      if (rekam.current?.state === 'recording') rekam.current.stop()
    }
    // Perekam hanya berjalan sekali selama komponen tampil
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="d-flex align-items-center gap-3" role="status" aria-live="polite">
      <button
        type="button"
        onClick={() => {
          batal.current = true
          rekam.current?.state === 'recording' && rekam.current.stop()
          onBatal()
        }}
        className="d-flex h-11 w-11 flex-shrink-0 align-items-center justify-content-center rounded-pill text-danger hover-latar-merah"
        aria-label="Batalkan rekaman"
      >
        <Trash2 className="h-5 w-5" />
      </button>
      <div className="d-flex flex-1 align-items-center gap-2 rounded-pill bg-danger-subtle px-4 py-2-5 fs-sm fw-semibold text-danger">
        <span className="h-2-5 w-2-5 berdenyut rounded-pill titik-rose" /> Merekam {formatDurasi(detik)}
        <span className="ms-auto fs-xs fw-normal teks-terang-rose">maks. {MAKS_DURASI_SUARA / 60} menit</span>
      </div>
      <button
        type="button"
        onClick={() => rekam.current?.state === 'recording' && rekam.current.stop()}
        className="d-flex h-11 w-11 flex-shrink-0 align-items-center justify-content-center rounded-pill bg-primary text-white hover-latar-merah-tua"
        aria-label="Kirim pesan suara"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  )
}

const MENU_LAMPIRAN = [
  { jenis: 'media', label: 'Foto & Video', ikon: IkonFoto, terima: `${TERIMA.foto},${TERIMA.video}`, warna: 'warna-violet teks-violet' },
  { jenis: 'dokumen', label: 'Dokumen', ikon: FileText, terima: TERIMA.dokumen, warna: 'bg-info-subtle text-info' },
  { jenis: 'audio', label: 'Audio / Lagu', ikon: Music, terima: TERIMA.audio, warna: 'warna-orange teks-orange' },
]

function Penyusun({ pid, onKirim }) {
  const { batasBerkas } = useData()
  const maksUkuran = Math.min(MAKS_UKURAN, batasBerkas ?? MAKS_UKURAN)
  const [teks, setTeks] = useState('')
  const [lampiran, setLampiran] = useState(null) // { blob, jenis, nama, pratinjau }
  const [menu, setMenu] = useState(false)
  const [merekam, setMerekam] = useState(false)
  const [sibuk, setSibuk] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const teksRef = useRef(null)
  const bisaRekam = typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && 'MediaRecorder' in window

  // Draf & lampiran tidak terbawa ke percakapan lain
  useEffect(() => {
    setTeks('')
    setLampiran((l) => {
      if (l?.pratinjau) URL.revokeObjectURL(l.pratinjau)
      return null
    })
    setError('')
    setMerekam(false)
  }, [pid])

  const buangLampiran = () =>
    setLampiran((l) => {
      if (l?.pratinjau) URL.revokeObjectURL(l.pratinjau)
      return null
    })

  const pilih = async (file) => {
    setMenu(false)
    setError('')
    if (!file) return
    const jenis = jenisBerkas(file)
    if (!jenis) return setError('Jenis berkas ini tidak didukung. Kirim foto, video, audio/lagu, atau dokumen (PDF, Word, Excel, PowerPoint).')
    if (file.size > maksUkuran) return setError(`Ukuran berkas maksimal ${formatUkuran(maksUkuran)} (berkas ini ${formatUkuran(file.size)}).`)
    let blob = file
    let nama = namaAman(file.name)
    if (jenis === 'foto') {
      blob = await perkecilFoto(file)
      if (blob !== file) nama = `${nama.replace(/\.[^.]+$/, '')}.${blob.type === 'image/webp' ? 'webp' : 'jpg'}`
    }
    buangLampiran()
    setLampiran({ blob, jenis, nama, pratinjau: jenis === 'foto' || jenis === 'video' ? URL.createObjectURL(blob) : null })
    teksRef.current?.focus()
  }

  // Kirim ke server; berkas diunggah bersama pesannya
  const simpanDanKirim = async (isi, berkas) => {
    setSibuk(true)
    setError('')
    const galat = await onKirim({ teks: isi, berkas: berkas && { blob: berkas.blob, jenis: berkas.jenis, nama: berkas.nama, durasi: berkas.durasi } })
    setSibuk(false)
    if (galat) setError(galat)
    return !galat
  }

  const kirim = async () => {
    const isi = teks.trim().slice(0, MAKS_TEKS)
    if (sibuk || (!isi && !lampiran)) return
    if (await simpanDanKirim(isi, lampiran)) {
      setTeks('')
      buangLampiran()
    }
  }

  const kirimSuara = async (blob, durasi) => {
    setMerekam(false)
    const ext = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('mp4') ? 'm4a' : 'webm'
    await simpanDanKirim('', { blob, jenis: 'suara', nama: `pesan-suara-${Date.now()}.${ext}`, durasi })
  }

  return (
    <div className="border-top border-abu-200 bg-white p-2-5 p-sm-3">
      {error && (
        <p role="alert" className="mb-2 d-flex align-items-start gap-2 rounded-2 bg-danger-subtle px-3 py-2 fs-xs text-danger">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} aria-label="Tutup pesan galat">
            <X className="h-3-5 w-3-5" />
          </button>
        </p>
      )}
      {lampiran && (
        <div className="mb-2 d-flex align-items-center gap-3 rounded-2 bg-abu-50 p-2 border border-abu-200">
          {lampiran.jenis === 'foto' ? (
            <img src={lampiran.pratinjau} alt="" className="h-14 w-14 rounded-1 object-fit-cover" />
          ) : lampiran.jenis === 'video' ? (
            <video src={lampiran.pratinjau} className="h-14 w-14 rounded-1 bg-black object-fit-cover" muted />
          ) : (
            <span className="d-flex h-14 w-14 align-items-center justify-content-center rounded-1 bg-white text-tinta-3 border border-abu-200">
              {lampiran.jenis === 'audio' ? <Music className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-truncate fs-sm fw-semibold text-tinta">{lampiran.nama}</p>
            <p className="fs-xs text-tinta-3">
              {formatUkuran(lampiran.blob.size)} · tambahkan keterangan (opsional) lalu kirim
            </p>
          </div>
          <button onClick={buangLampiran} className="rounded-1 p-1-5 text-abu-400 hover-latar-abu hover-teks-tinta" aria-label="Batalkan lampiran">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {merekam ? (
        <Perekam
          onSelesai={kirimSuara}
          onBatal={() => setMerekam(false)}
          onGagal={(pesan) => {
            setMerekam(false)
            setError(pesan)
          }}
        />
      ) : (
        <div className="d-flex align-items-end gap-2">
          <div className="position-relative">
            <button
              type="button"
              onClick={() => setMenu(!menu)}
              className={`d-flex h-11 w-11 align-items-center justify-content-center rounded-pill transisi ${menu ? 'bg-abu-200 text-tinta' : 'text-tinta-3 hover-latar-abu'}`}
              aria-label="Lampirkan berkas"
              aria-expanded={menu}
            >
              <Paperclip className="h-5 w-5" />
            </button>
            {menu && (
              <div className="position-absolute bottom-100 start-0 z-20 mb-2 w-52 overflow-hidden rounded-3 bg-white p-1-5 shadow-lg border border-abu-200">
                {MENU_LAMPIRAN.map(({ jenis, label, ikon: Ikon, terima, warna }) => (
                  <button
                    key={jenis}
                    type="button"
                    onClick={() => {
                      inputRef.current.accept = terima
                      inputRef.current.click()
                    }}
                    className="d-flex w-100 align-items-center gap-3 rounded-2 px-3 py-2-5 text-start fs-sm fw-semibold text-tinta-2 hover-latar"
                  >
                    <span className={`d-flex h-8 w-8 align-items-center justify-content-center rounded-1 ${warna}`}>
                      <Ikon className="h-4 w-4" />
                    </span>
                    {label}
                  </button>
                ))}
                <p className="px-3 pb-1-5 pt-1 fs-2xs text-abu-400">Maks. {formatUkuran(MAKS_UKURAN)} per berkas</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              className="d-none"
              data-chat-berkas
              onChange={(e) => {
                pilih(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </div>
          <textarea
            ref={teksRef}
            value={teks}
            onChange={(e) => setTeks(e.target.value.slice(0, MAKS_TEKS))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                kirim()
              }
            }}
            onPaste={(e) => {
              const file = e.clipboardData?.files?.[0]
              if (file) {
                e.preventDefault()
                pilih(file)
              }
            }}
            rows={1}
            placeholder={lampiran ? 'Tambahkan keterangan...' : 'Tulis pesan...'}
            aria-label="Tulis pesan"
            className="mh-32 min-h-11 flex-1 resize-none rounded-4 border border-abu-200 bg-abu-50 px-4 py-2-5 fs-sm ukuran-isi"
          />
          {teks.trim() || lampiran ? (
            <button
              type="button"
              onClick={kirim}
              disabled={sibuk}
              className="d-flex h-11 w-11 flex-shrink-0 align-items-center justify-content-center rounded-pill bg-primary text-white transisi hover-latar-merah-tua"
              aria-label="Kirim pesan"
            >
              <Send className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => (bisaRekam ? setMerekam(true) : setError('Rekam suara hanya bisa lewat koneksi aman (HTTPS) atau localhost, dan browser yang mendukung.'))}
              className="d-flex h-11 w-11 flex-shrink-0 align-items-center justify-content-center rounded-pill bg-primary text-white transisi hover-latar-merah-tua"
              aria-label="Rekam pesan suara"
            >
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function InfoGrup({ info, data, saya, pengaturan, onAtur, onChat, onTutup }) {
  const [cari, setCari] = useState('')
  const admin = info.admin.includes(saya)
  const anggota = info.anggota.map((a) => ({ ...profil(data, a), admin: info.admin.includes(a) }))
  const cocok = anggota.filter((a) => a.nama.toLowerCase().includes(cari.trim().toLowerCase()))
  const kelompok = [
    ['Guru', cocok.filter((a) => a.peran === 'staf')],
    [info.tipe === 'ortu' ? 'Orang tua' : 'Siswa', cocok.filter((a) => a.peran !== 'staf')],
  ].filter(([, d]) => d.length)

  return (
    <Modal open onClose={onTutup} title={info.nama} size="max-w-md">
      <p className="fs-sm text-tinta-3">{info.sub}</p>
      {info.tipe !== 'staf' && (
        <label className={`mt-4 d-flex align-items-start gap-3 rounded-3 p-4 border ${admin ? 'cursor-pointer bg-abu-50 border-abu-200' : 'bg-abu-50 border-abu-100'}`}>
          <input
            type="checkbox"
            checked={!!pengaturan?.hanyaAdmin}
            disabled={!admin}
            onChange={(e) => onAtur({ hanyaAdmin: e.target.checked })}
            className="mt-0-5 h-4 w-4 aksen-merah"
          />
          <span className="fs-sm">
            <span className="d-block fw-semibold text-tinta">Hanya guru yang dapat mengirim pesan</span>
            <span className="d-block text-tinta-3">
              {admin ? 'Cocok untuk pengumuman. Anggota lain tetap bisa membaca.' : 'Diatur oleh guru di grup ini.'}
            </span>
          </span>
        </label>
      )}
      <div className="position-relative mt-4">
        <Search className="pe-none position-absolute start-3-5 top-50 h-4 w-4 translate-middle-y text-abu-400" />
        <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder={`Cari di ${anggota.length} anggota...`} className={`${inputCls} ps-10`} />
      </div>
      {kelompok.map(([judul, daftar]) => (
        <div key={judul} className="mt-4">
          <p className="mb-1 fs-xs fw-bold text-uppercase ls-wider text-abu-400">
            {judul} · {daftar.length}
          </p>
          <ul className="pembatas-y pembatas-abu">
            {daftar.map((a) => (
              <li key={a.id} className="d-flex align-items-center gap-3 py-2">
                <Avatar nama={a.nama} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-truncate fs-sm fw-semibold text-tinta">
                    {a.nama}
                    {a.id === saya && <span className="fw-normal text-abu-400"> (Anda)</span>}
                  </p>
                  <p className="text-truncate fs-xs text-tinta-3">{a.sub}</p>
                </div>
                {a.admin && <span className="rounded-pill bg-merah-50 px-2 py-0-5 fs-10 fw-bold text-merah-700">Pengelola</span>}
                {a.id !== saya && bolehPribadi(data, saya, a.id) && (
                  <button onClick={() => onChat(a.id)} className="rounded-1 p-1-5 text-primary hover-latar-merah" aria-label={`Chat pribadi dengan ${a.nama}`}>
                    <MessagesSquare className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Modal>
  )
}

function ChatBaru({ data, saya, onPilih, onTutup }) {
  const [cari, setCari] = useState('')
  const semua = useMemo(() => [...kontakPribadi(data, saya)].map((id) => profil(data, id)), [data, saya])
  const kata = cari.trim().toLowerCase()
  const cocok = semua.filter((p) => !kata || `${p.nama} ${p.sub}`.toLowerCase().includes(kata))
  const tampil = cocok.slice(0, 60)
  const kelompok = [
    ['Guru & Staf', tampil.filter((p) => p.peran === 'staf')],
    ['Orang Tua', tampil.filter((p) => p.peran === 'ortu')],
  ].filter(([, d]) => d.length)

  return (
    <Modal open onClose={onTutup} title="Chat baru" size="max-w-md">
      <div className="position-relative">
        <Search className="pe-none position-absolute start-3-5 top-50 h-4 w-4 translate-middle-y text-abu-400" />
        <input autoFocus value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama, jabatan, atau kelas..." className={`${inputCls} ps-10`} />
      </div>
      {kelompok.length === 0 && <p className="py-8 text-center fs-sm text-tinta-3">Tidak ada kontak yang cocok.</p>}
      {kelompok.map(([judul, daftar]) => (
        <div key={judul} className="mt-4">
          <p className="mb-1 fs-xs fw-bold text-uppercase ls-wider text-abu-400">{judul}</p>
          <ul>
            {daftar.map((p) => (
              <li key={p.id}>
                <button onClick={() => onPilih(p.id)} className="d-flex w-100 align-items-center gap-3 rounded-2 px-2 py-2 text-start hover-latar">
                  <Avatar nama={p.nama} size="sm" />
                  <span className="min-w-0">
                    <span className="d-block text-truncate fs-sm fw-semibold text-tinta">{p.nama}</span>
                    <span className="d-block text-truncate fs-xs text-tinta-3">{p.sub}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {cocok.length > tampil.length && <p className="mt-3 text-center fs-xs text-tinta-3">Menampilkan 60 dari {cocok.length} kontak. Ketik nama untuk mencari.</p>}
    </Modal>
  )
}

function LihatFoto({ foto, onTutup }) {
  useEffect(() => {
    const tombol = (e) => e.key === 'Escape' && onTutup()
    document.addEventListener('keydown', tombol)
    return () => document.removeEventListener('keydown', tombol)
  }, [onTutup])
  return (
    <div role="dialog" aria-modal="true" aria-label={foto.nama} className="position-fixed inset-0 z-50 d-flex flex-column bg-tinta" onClick={onTutup}>
      <div className="d-flex align-items-center justify-content-between gap-3 p-4 text-white" onClick={(e) => e.stopPropagation()}>
        <p className="text-truncate fs-sm fw-semibold">{foto.nama}</p>
        <div className="d-flex gap-2">
          <a href={foto.url} download={foto.nama} className="rounded-pill bg-white bg-opacity-10 p-2-5 hover-terang" aria-label="Unduh foto">
            <Download className="h-5 w-5" />
          </a>
          <button onClick={onTutup} className="rounded-pill bg-white bg-opacity-10 p-2-5 hover-terang" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="d-flex flex-1 align-items-center justify-content-center p-4">
        <img src={foto.url} alt={foto.nama} className="mh-100 mw-100 rounded-1 object-fit-contain" onClick={(e) => e.stopPropagation()} />
      </div>
    </div>
  )
}

function RuangChat({ pid, saya, onKembali, onChatPribadi }) {
  const { data } = useData()
  const { state, kirim, hapus, tandaiDibaca, aturGrup } = useChat()
  const [batas, setBatas] = useState(PER_HALAMAN)
  const [infoBuka, setInfoBuka] = useState(false)
  const [akanDihapus, setAkanDihapus] = useState(null)
  const [foto, setFoto] = useState(null)
  const gulir = useRef(null)
  const diBawah = useRef(true)

  const info = infoPercakapan(data, saya, pid)
  const semuaPesan = state.pesan[pid] ?? []
  const pesan = semuaPesan.slice(-batas)
  const anggotaLain = info.grup ? info.anggota.filter((a) => a !== saya) : [info.lawan]
  const bisaKirim = bolehKirim(data, state.pengaturan, saya, pid)
  const admin = adminGrup(data, saya, pid)
  const terakhir = semuaPesan.at(-1)

  useEffect(() => {
    setBatas(PER_HALAMAN)
    diBawah.current = true
  }, [pid])

  // Gulir ke pesan terbaru saat membuka percakapan / ada pesan baru (kecuali sedang membaca pesan lama)
  useLayoutEffect(() => {
    const el = gulir.current
    if (el && (diBawah.current || terakhir?.dari === saya)) el.scrollTop = el.scrollHeight
  }, [pid, terakhir?.id, terakhir?.dari, saya])

  // Foto/video dimuat belakangan dan menambah tinggi isi; tetap di bawah jika sebelumnya di bawah
  const isi = useRef(null)
  useEffect(() => {
    const el = gulir.current
    if (!el || !isi.current || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => diBawah.current && (el.scrollTop = el.scrollHeight))
    ro.observe(isi.current)
    return () => ro.disconnect()
  }, [pid])

  // Tandai dibaca saat percakapan sedang dilihat
  useEffect(() => {
    const baca = () => document.visibilityState === 'visible' && tandaiDibaca(saya, pid)
    baca()
    document.addEventListener('visibilitychange', baca)
    return () => document.removeEventListener('visibilitychange', baca)
  }, [pid, saya, terakhir?.id, tandaiDibaca])

  let tanggalSebelum = null
  return (
    <div className="d-flex h-100 min-h-0 flex-column">
      <div className="d-flex align-items-center gap-3 border-bottom border-abu-200 bg-white px-3 py-2-5 px-sm-4">
        <button onClick={onKembali} className="rounded-1 p-1-5 text-tinta-3 hover-latar-abu d-lg-none" aria-label="Kembali ke daftar chat">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <AvatarPercakapan info={info} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-truncate fw-bold text-tinta">{info.nama}</p>
          <p className="text-truncate fs-xs text-tinta-3">{info.sub}</p>
        </div>
        {info.grup && (
          <button onClick={() => setInfoBuka(true)} className="rounded-1 p-2 text-tinta-3 hover-latar-abu" aria-label="Info grup & anggota">
            <Info className="h-5 w-5" />
          </button>
        )}
      </div>

      <div
        ref={gulir}
        onScroll={(e) => {
          const el = e.currentTarget
          diBawah.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
        }}
        className="min-h-0 flex-1 overflow-y-auto bg-abu-100 px-3 py-4 px-sm-6"
        aria-label={`Pesan di ${info.nama}`}
      >
        <div ref={isi} className="antara-y-2">
          {info.grup && <p className="mx-auto mb-3 mw-md rounded-2 bg-warning-subtle px-3 py-2 text-center fs-xs text-warning-emphasis border border-warning-subtle">{CATATAN_GRUP[info.tipe]}</p>}
        {pid === pidKepsekOrtu(data, saya) && (
          <p className="mx-auto mb-3 mw-md rounded-2 bg-success-subtle px-3 py-2 text-center fs-xs text-success-emphasis border border-success-subtle">
            🔒 Percakapan pribadi dengan Kepala Sekolah untuk konsultasi atau pengaduan. Guru dan wali kelas tidak dapat membacanya.
          </p>
        )}
          {semuaPesan.length > pesan.length && (
            <div className="text-center">
              <button onClick={() => setBatas(batas + PER_HALAMAN)} className="rounded-pill bg-white px-4 py-1-5 fs-xs fw-semibold text-tinta-2 shadow-sm hover-latar">
                Tampilkan pesan sebelumnya
              </button>
            </div>
          )}
          {semuaPesan.length === 0 && <p className="py-16 text-center fs-sm text-tinta-3">Belum ada pesan. Mulai percakapan dengan {info.nama.split(',')[0]}. 👋</p>}
          {pesan.map((p) => {
            const tgl = kunciTanggal(p.waktu)
            const pemisah = tgl !== tanggalSebelum
            tanggalSebelum = tgl
            return (
              <div key={p.id}>
                {pemisah && (
                  <p className="my-3 text-center">
                    <span className="rounded-pill bg-white px-3 py-1 fs-xs fw-semibold text-tinta-3 shadow-sm">{labelTanggal(tgl)}</span>
                  </p>
                )}
                <Gelembung
                  p={{ ...p, pid }}
                  saya={saya}
                  data={data}
                  grup={info.grup}
                  anggotaLain={anggotaLain}
                  dibaca={state.dibaca}
                  bisaHapus={!p.dihapus && (p.dari === saya || admin)}
                  onHapus={() => setAkanDihapus(p)}
                  onLihatFoto={setFoto}
                />
              </div>
            )
          })}
        </div>
      </div>

      {bisaKirim ? (
        <Penyusun pid={pid} onKirim={(isi) => kirim(pid, isi)} />
      ) : (
        <p className="d-flex align-items-center justify-content-center gap-2 border-top border-abu-200 bg-white px-4 py-4 fs-sm text-tinta-3">
          <Lock className="h-4 w-4" /> Hanya guru yang dapat mengirim pesan di grup ini.
        </p>
      )}

      {infoBuka && (
        <InfoGrup
          info={info}
          data={data}
          saya={saya}
          pengaturan={state.pengaturan[pid]}
          onAtur={(x) => aturGrup(pid, x)}
          onChat={(id) => {
            setInfoBuka(false)
            onChatPribadi(id)
          }}
          onTutup={() => setInfoBuka(false)}
        />
      )}
      <Modal
        open={!!akanDihapus}
        onClose={() => setAkanDihapus(null)}
        title="Hapus pesan?"
        size="max-w-sm"
        footer={
          <>
            <button onClick={() => setAkanDihapus(null)} className={btn.secondary}>
              Batal
            </button>
            <button
              onClick={() => {
                hapus(pid, akanDihapus.id)
                setAkanDihapus(null)
              }}
              className="btn btn-danger"
            >
              Hapus untuk semua
            </button>
          </>
        }
      >
        <p className="fs-sm text-tinta-2">
          {akanDihapus?.dari === saya ? 'Pesan dan berkasnya akan dihapus untuk semua anggota percakapan.' : 'Sebagai pengelola grup, Anda akan menghapus pesan anggota ini untuk semua anggota.'}
        </p>
      </Modal>
      {foto && <LihatFoto foto={foto} onTutup={() => setFoto(null)} />}
    </div>
  )
}

const SARING = [
  ['semua', 'Semua'],
  ['belum', 'Belum dibaca'],
  ['grup', 'Grup'],
  ['pribadi', 'Pribadi'],
]

export default function Chat() {
  const { data } = useData()
  const { saya, percakapan } = useChatSaya()
  // Pesan baru dari perangkat lain diperiksa tiap beberapa detik selama halaman chat terbuka
  useSegarCepat()
  const [params, setParams] = useSearchParams()
  const [cari, setCari] = useState('')
  const [saring, setSaring] = useState('semua')
  const [baruBuka, setBaruBuka] = useState(false)

  const diminta = params.get('buka')
  const aktif = diminta && bolehBuka(data, saya, diminta) ? diminta : null
  const bisaPribadi = saya && kontakPribadi(data, saya).size > 0

  const buka = (pid) => setParams(pid ? { buka: pid } : {}, { replace: !!aktif && !!pid })

  const daftar = useMemo(() => {
    const kata = cari.trim().toLowerCase()
    return percakapan
      .map((c) => ({ ...c, info: infoPercakapan(data, saya, c.id) }))
      .filter((c) => (saring === 'semua' || (saring === 'belum' ? c.belum > 0 : saring === 'grup' ? c.grup : !c.grup)) && (!kata || c.info.nama.toLowerCase().includes(kata)))
      .sort((a, b) => b.sematkan - a.sematkan || (b.terakhir?.waktu ?? '').localeCompare(a.terakhir?.waktu ?? '') || a.info.nama.localeCompare(b.info.nama))
  }, [percakapan, data, saya, cari, saring])

  if (!saya) return <p className="text-tinta-3">Akun ini belum terhubung dengan data sekolah, jadi belum bisa memakai chat.</p>

  return (
    <div className="mx-n4 my-n6 tata-chat mx-sm-n8 my-sm-n8 mx-lg-0 my-lg-0">
      <div className="d-grid h-100 kolom-1 overflow-hidden bg-white kolom-lg-340-isi kisi-chat">
        {/* Daftar percakapan */}
        <div className={`min-h-0 flex-column border-abu-200 d-lg-flex garis-kanan-lg ${aktif ? 'd-none' : 'd-flex'}`}>
          <div className="antara-y-3 border-bottom border-abu-100 p-4">
            <div className="d-flex align-items-center justify-content-between gap-2">
              <h1 className="fs-2xl fw-bold text-tinta">Chat</h1>
              {bisaPribadi && (
                <button onClick={() => setBaruBuka(true)} className={`${btn.primary} rounded-pill px-3-5 py-2`}>
                  <MessageCirclePlus className="h-4 w-4" /> Chat baru
                </button>
              )}
            </div>
            <div className="position-relative">
              <Search className="pe-none position-absolute start-3-5 top-50 h-4 w-4 translate-middle-y text-abu-400" />
              <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari percakapan..." className={`${inputCls} rounded-pill ps-10`} aria-label="Cari percakapan" />
            </div>
            {bisaPribadi && (
              <div className="d-flex gap-1-5 overflow-x-auto">
                {SARING.map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setSaring(k)}
                    aria-pressed={saring === k}
                    className={`ui-saring flex-shrink-0 rounded-pill px-3 py-1 fs-xs fw-semibold transisi ${saring === k ? 'bg-tinta text-white' : 'bg-abu-100 text-tinta-2 hover-latar-abu'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto" aria-label="Daftar percakapan">
            {daftar.length === 0 && <li className="px-4 py-10 text-center fs-sm text-tinta-3">Tidak ada percakapan.</li>}
            {daftar.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => buka(c.id)}
                  aria-current={aktif === c.id}
                  className={`d-flex w-100 align-items-center gap-3 px-4 py-3 text-start transisi ${aktif === c.id ? 'bg-merah-50' : 'hover-latar'}`}
                >
                  <AvatarPercakapan info={c.info} />
                  <span className="min-w-0 flex-1">
                    <span className="d-flex align-items-baseline justify-content-between gap-2">
                      <span className={`d-flex min-w-0 align-items-center gap-1 fs-sm ${c.belum ? 'fw-bold text-tinta' : 'fw-semibold text-tinta-2'}`}>
                        <span className="text-truncate">{c.info.nama}</span>
                        {c.sematkan && <Pin className="h-3 w-3 flex-shrink-0 miring-45 text-abu-400" aria-label="Disematkan" />}
                      </span>
                      {c.terakhir && <span className={`flex-shrink-0 fs-2xs ${c.belum ? 'fw-semibold text-primary' : 'text-abu-400'}`}>{waktuDaftar(c.terakhir.waktu)}</span>}
                    </span>
                    <span className="mt-0-5 d-flex align-items-center justify-content-between gap-2">
                      <span className="text-truncate fs-xs text-tinta-3">
                        {c.terakhir
                          ? `${c.grup && c.terakhir.dari !== saya && !c.terakhir.dihapus ? `${profil(data, c.terakhir.dari).nama.split(' ')[0]}: ` : c.terakhir.dari === saya && !c.terakhir.dihapus ? 'Anda: ' : ''}${ringkas(c.terakhir)}`
                          : c.sematkan
                            ? 'Kepala Sekolah · konsultasi & pengaduan (pribadi)'
                            : c.info.sub}
                      </span>
                      {c.belum > 0 && <span className="d-flex h-5 min-w-5 flex-shrink-0 align-items-center justify-content-center rounded-pill bg-primary px-1-5 fs-10 fw-bold text-white">{c.belum}</span>}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="d-flex align-items-center gap-1-5 border-top border-abu-100 px-4 py-2-5 fs-2xs text-abu-400">
            <ShieldCheck className="h-3-5 w-3-5 flex-shrink-0" /> Chat hanya dengan warga sekolah. Siswa memakai grup kelas.
          </p>
        </div>

        {/* Isi percakapan */}
        <div className={`min-h-0 ${aktif ? 'd-block' : 'd-none d-lg-block'}`}>
          {aktif ? (
            <RuangChat key={aktif} pid={aktif} saya={saya} onKembali={() => buka(null)} onChatPribadi={(id) => buka(idPribadi(saya, id))} />
          ) : (
            <div className="d-flex h-100 align-items-center justify-content-center bg-abu-50 p-8 text-center">
              <div>
                <span className="mx-auto d-flex h-16 w-16 align-items-center justify-content-center rounded-4 bg-merah-50 text-primary">
                  <MessagesSquare className="h-8 w-8" />
                </span>
                <p className="mt-4 fs-xl fw-bold text-tinta">Chat Sekolah</p>
                <p className="mt-1 mw-sm fs-sm text-tinta-3">Pilih percakapan di sebelah kiri. Kirim pesan, pesan suara, foto, video, dokumen, atau lagu.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {baruBuka && (
        <ChatBaru
          data={data}
          saya={saya}
          onTutup={() => setBaruBuka(false)}
          onPilih={(id) => {
            setBaruBuka(false)
            buka(idPribadi(saya, id))
          }}
        />
      )}
    </div>
  )
}
