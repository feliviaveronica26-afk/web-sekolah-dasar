import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  DoorOpen,
  Feather,
  HandHeart,
  HeartPulse,
  Laptop,
  Search,
  Server,
  ShieldUser,
  SquareParking,
  Tent,
  Trees,
  Trophy,
  Users,
  Utensils,
  Volleyball,
} from 'lucide-react'
import { agendaPada } from './KalenderAkademik'
import { TombolSalin } from './Spp'
import { isian, labelIsian, pilihan, tombol } from './Situs'
import { Alert, Badge, JebakanBot } from './ui'
import { useData } from '../context/DataContext'
import { DENAH_GERBANG, DENAH_JALUR, DENAH_LAIN, DENAH_ZONA, FASILITAS, KUNJUNGAN, SEKOLAH, UKURAN_DENAH } from '../data/dummy'
import { formatHari, isHariSekolah, parseKey, tambahHari, todayKey } from '../utils/format'
import { api } from '../utils/api'
import { catatKirim, tungguKirim } from '../utils/keamanan'

export const IKON_FASILITAS = {
  kelas: Building2,
  buku: BookOpen,
  komputer: Laptop,
  lapangan: Trophy,
  ibadah: HandHeart,
  uks: HeartPulse,
  kantin: Utensils,
  taman: Trees,
}

export const STATUS_KUNJUNGAN = {
  Menunggu: 'bg-amber-100 text-amber-800',
  Dikonfirmasi: 'bg-emerald-100 text-emerald-700',
  Ditolak: 'bg-rose-100 text-rose-700',
  Selesai: 'bg-slate-100 text-slate-600',
}

const { lebar: LEBAR, tinggi: TINGGI } = UKURAN_DENAH
const persen = (n, total) => `${(n / total) * 100}%`
const posisi = ({ x, y, w, h }) => ({ left: persen(x, LEBAR), top: persen(y, TINGGI), width: persen(w, LEBAR), height: persen(h, TINGGI) })
const areaDari = (f) => (Array.isArray(f.denah) ? f.denah : [f.denah])

// Ikon untuk area denah yang bukan fasilitas & sub-area lapangan
const IKON_DENAH = {
  guru: Users,
  kepsek: Briefcase,
  server: Server,
  satpam: ShieldUser,
  parkir: SquareParking,
  futsal: Volleyball,
  bulutangkis: Feather,
  pramuka: Tent,
}

// Area terbuka diberi warna rumput/taman, bangunan berwarna putih
const GAYA_FASILITAS = {
  lapangan: 'border-lime-300 bg-lime-100 text-lime-900',
  taman: 'border-emerald-300 bg-emerald-200/70 text-emerald-900',
}

const label = 'text-[7px] font-bold leading-tight @sm:text-[8px] @lg:text-[10px] @2xl:text-xs'

function IsiArea({ Ikon, teks, kecil }) {
  return (
    <>
      <Ikon className="h-3 w-3 shrink-0 @lg:h-4 @lg:w-4 @2xl:h-5 @2xl:w-5" />
      {!kecil && <span className={`hidden max-w-full @sm:block ${label}`}>{teks}</span>}
    </>
  )
}

// Tiang bendera di Lapangan Upacara
function TiangBendera() {
  return (
    <svg viewBox="0 0 24 32" className="absolute left-1/2 top-[8%] h-[55%] -translate-x-1/2" aria-hidden="true">
      <rect x="5" y="2" width="1.6" height="27" rx="0.8" fill="#64748b" />
      <rect x="6.6" y="3" width="13" height="4" fill="#d91a28" />
      <rect x="6.6" y="7" width="13" height="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.4" />
      <rect x="2" y="28.5" width="7.6" height="2.5" rx="1" fill="#94a3b8" />
    </svg>
  )
}

/*
  Denah sekolah interaktif. Klik area fasilitas untuk membuka halaman detailnya.
  `kecil` = versi ringkas tanpa label (untuk sidebar); ukuran teks mengikuti lebar denah (container query).
*/
export function DenahSekolah({ aktif, kecil = false }) {
  const fasilitasAktif = FASILITAS.find((f) => f.id === aktif)

  return (
    <div>
      <div
        className="@container relative w-full overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50"
        style={{ aspectRatio: `${LEBAR} / ${TINGGI}` }}
        role="group"
        aria-label="Denah sekolah"
      >
        {/* Zona berlatar */}
        {DENAH_ZONA.map((z) => (
          <div key={z.nama} style={posisi(z.denah)} className="absolute rounded-lg border border-dashed border-emerald-300 bg-emerald-100/70">
            {!kecil && <span className="absolute -top-px left-1.5 hidden text-[7px] font-bold uppercase tracking-wider text-emerald-700/70 @md:block @2xl:text-[9px]">{z.nama}</span>}
          </div>
        ))}

        {/* Jalan & selasar */}
        {DENAH_JALUR.map((j, i) => (
          <div key={i} style={posisi(j)} className="absolute bg-amber-100" />
        ))}

        {/* Pagar keliling sekolah */}
        <div className="pointer-events-none absolute inset-[0.9%] rounded-xl border-[3px] border-slate-400/80" title="Pagar sekolah" />

        {/* Gerbang utama di pagar kanan */}
        <div
          title="Gerbang Utama"
          className="absolute right-0 z-10 flex items-center justify-center rounded-l-md bg-amber-200 text-primary-700 ring-2 ring-primary-500"
          style={{ top: persen(DENAH_GERBANG.y, TINGGI), height: persen(DENAH_GERBANG.h, TINGGI), width: '3.4%' }}
        >
          <DoorOpen className="h-2.5 w-2.5 @lg:h-3.5 @lg:w-3.5" />
        </div>
        {!kecil && (
          <span
            className="absolute z-10 hidden -translate-y-1/2 whitespace-nowrap text-[8px] font-bold text-primary-700 @md:block @2xl:text-[10px]"
            style={{ right: '4.2%', top: persen(DENAH_GERBANG.y + DENAH_GERBANG.h / 2, TINGGI) }}
          >
            Gerbang Utama →
          </span>
        )}

        {/* Bangunan & area yang bukan fasilitas */}
        {DENAH_LAIN.map((a) =>
          a.jenis === 'upacara' ? (
            <div key={a.nama} style={posisi(a.denah)} title="Lapangan Upacara & tiang bendera" className="absolute rounded-lg border-2 border-stone-300 bg-stone-100 text-stone-600">
              <TiangBendera />
              {!kecil && <span className={`absolute inset-x-0 bottom-[10%] hidden text-center @sm:block ${label}`}>Lapangan Upacara · Tiang Bendera</span>}
            </div>
          ) : (
            <div
              key={a.nama}
              style={posisi(a.denah)}
              title={a.nama}
              className={`absolute flex flex-col items-center justify-center gap-0.5 rounded-lg p-0.5 text-center @lg:gap-1 ${
                a.jenis === 'parkir' ? 'border border-dashed border-slate-400 bg-slate-100/80 text-slate-500' : 'bg-slate-200 text-slate-600'
              }`}
            >
              <IsiArea Ikon={IKON_DENAH[a.ikon] ?? Building2} teks={a.nama} kecil={kecil} />
            </div>
          ),
        )}

        {/* Fasilitas (bisa diklik) */}
        {FASILITAS.flatMap((f) =>
          areaDari(f).map((area, i) => {
            const dipilih = aktif === f.id
            const Ikon = IKON_DENAH[area.ikon] ?? IKON_FASILITAS[f.ikon]
            return (
              <Link
                key={`${f.id}-${i}`}
                to={`/fasilitas/${f.id}`}
                style={posisi(area)}
                title={area.label ?? f.nama}
                aria-label={area.label ?? f.nama}
                className={`group absolute flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 p-0.5 text-center transition @lg:gap-1 ${
                  dipilih
                    ? 'z-10 border-primary-700 bg-primary-600 text-white shadow-lg'
                    : `${GAYA_FASILITAS[f.id] ?? 'border-white bg-white text-slate-700 shadow-sm'} hover:z-10 hover:-translate-y-0.5 hover:border-primary-400 hover:text-primary-700 hover:shadow-md`
                }`}
              >
                <IsiArea Ikon={Ikon} teks={area.label ?? f.nama} kecil={kecil} />
              </Link>
            )
          }),
        )}
      </div>

      {kecil ? (
        fasilitasAktif && (
          <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-primary-600" />
            <span>
              <b className="text-slate-700">{fasilitasAktif.nama}</b> · {fasilitasAktif.lokasi}
            </span>
          </p>
        )
      ) : (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-4 rounded-sm border-2 border-slate-400" /> Pagar sekolah
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-4 rounded-sm bg-amber-100 ring-1 ring-amber-200" /> Jalan
          </li>
          <li className="flex items-center gap-1.5">
            <DoorOpen className="h-3.5 w-3.5 text-primary-600" /> Gerbang utama & pos satpam (kanan)
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-4 rounded-sm border-2 border-white bg-white shadow ring-1 ring-slate-200" /> Fasilitas (klik untuk detail)
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-4 rounded-sm bg-slate-200" /> Ruang guru, kepala sekolah & lab server
          </li>
        </ul>
      )}
    </div>
  )
}

const besok = () => tambahHari(todayKey(), 1)

// Form penjadwalan kunjungan langsung ke sekolah
export function FormKunjungan({ fasilitasAwal = [] }) {
  const { data, pesanKunjungan } = useData()
  const [mengirim, setMengirim] = useState(false)
  const [form, setForm] = useState({
    nama: '',
    whatsapp: '',
    tanggal: '',
    sesi: '',
    jumlah: '1',
    keperluan: KUNJUNGAN.keperluan[0],
    fasilitas: fasilitasAwal,
    catatan: '',
  })
  const [error, setError] = useState('')
  const [berhasil, setBerhasil] = useState(null)
  const [jebakan, setJebakan] = useState('')

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const terisi = (sesi) => data.kunjungan.filter((k) => k.tanggal === form.tanggal && k.sesi === sesi && k.status !== 'Ditolak').length
  const libur = form.tanggal && (!isHariSekolah(parseKey(form.tanggal)) || agendaPada(form.tanggal).some((e) => e.jenis === 'libur'))
  const toggleFasilitas = (id) =>
    setForm({ ...form, fasilitas: form.fasilitas.includes(id) ? form.fasilitas.filter((x) => x !== id) : [...form.fasilitas, id] })

  const kirim = async (e) => {
    e.preventDefault()
    if (mengirim) return
    if (libur) return setError('Kunjungan hanya tersedia pada hari sekolah (Senin – Jumat, bukan hari libur).')
    if (!form.sesi) return setError('Pilih sesi kunjungan.')
    if (terisi(form.sesi) >= KUNJUNGAN.kuotaPerSesi) return setError('Sesi ini sudah penuh. Silakan pilih sesi atau tanggal lain.')
    if (jebakan) return setError('Permintaan tidak dapat diproses. Muat ulang halaman lalu coba lagi.')
    const tunggu = tungguKirim('kunjungan', 3, 10)
    if (tunggu) return setError(`Terlalu banyak permintaan dari perangkat ini. Coba lagi dalam ${tunggu} menit.`)
    // Kuota sesi diperiksa ulang server; kode acak 6 huruf dibuat server agar tidak bisa ditebak
    setMengirim(true)
    const { kunjungan, galat } = await pesanKunjungan({ ...form, jumlah: Number(form.jumlah) })
    setMengirim(false)
    if (galat) return setError(galat)
    catatKirim('kunjungan', 10)
    setBerhasil(kunjungan)
  }

  if (berhasil) {
    return (
      <div className="py-2">
        <CheckCircle2 className="h-10 w-10 text-emerald-700" aria-hidden="true" />
        <p className="mt-4 text-3xl font-extrabold tracking-tight leading-tight">Permintaan kunjungan terkirim.</p>
        <p className="angka mt-2 text-tinta-2">
          {formatHari(berhasil.tanggal)}, pukul {berhasil.sesi} WIB
        </p>
        <div className="mt-6 rounded-xl border-2 border-dashed border-tinta/40 bg-white p-5">
          <p className="text-sm text-tinta-3">Kode kunjungan Anda</p>
          <p className="mt-1 font-mono text-3xl font-bold tracking-wider text-primary-700">{berhasil.kode}</p>
          <div className="mt-3">
            <TombolSalin teks={berhasil.kode} label="Salin kode" />
          </div>
        </div>
        <p className="mt-5 text-[15px] leading-relaxed text-tinta-2">
          Tata Usaha akan mengonfirmasi melalui WhatsApp <b>{berhasil.whatsapp}</b>. Simpan kode ini untuk mengecek status di halaman Fasilitas.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={kirim} className="relative space-y-5">
      <JebakanBot value={jebakan} onChange={setJebakan} />
      {error && (
        <div role="alert">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="kj-nama" className={labelIsian}>Nama lengkap</label>
          <input id="kj-nama" required value={form.nama} onChange={set('nama')} className={isian} placeholder="Nama Bapak/Ibu" />
        </div>
        <div>
          <label htmlFor="kj-wa" className={labelIsian}>No. WhatsApp</label>
          <input id="kj-wa" required type="tel" value={form.whatsapp} onChange={set('whatsapp')} className={isian} placeholder="08xx-xxxx-xxxx" />
        </div>
        <div>
          <label htmlFor="kj-tanggal" className={labelIsian}>Tanggal kunjungan</label>
          <input
            id="kj-tanggal"
            type="date"
            required
            min={besok()}
            value={form.tanggal}
            onChange={(e) => {
              setForm({ ...form, tanggal: e.target.value, sesi: '' })
              setError('')
            }}
            className={isian}
          />
          {form.tanggal && (
            <p className={`mt-1.5 text-sm ${libur ? 'font-semibold text-rose-700' : 'text-tinta-3'}`}>
              {libur ? 'Hari libur — pilih Senin sampai Jumat.' : formatHari(form.tanggal)}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="kj-jumlah" className={labelIsian}>Jumlah pengunjung</label>
          <select id="kj-jumlah" value={form.jumlah} onChange={set('jumlah')} className={isian}>
            {Array.from({ length: KUNJUNGAN.maksOrang }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} orang
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p id="kj-sesi-label" className={labelIsian}>
          Sesi
        </p>
        <div role="group" aria-labelledby="kj-sesi-label" className="grid grid-cols-3 gap-2">
          {KUNJUNGAN.sesi.map((s) => {
            const sisa = KUNJUNGAN.kuotaPerSesi - terisi(s)
            const penuh = !form.tanggal || libur || sisa <= 0
            return (
              <button
                key={s}
                type="button"
                disabled={penuh}
                aria-pressed={form.sesi === s}
                onClick={() => setForm({ ...form, sesi: s })}
                className={`px-2 text-center ${pilihan(form.sesi === s)}`}
              >
                <span className="angka block text-sm font-bold">{s}</span>
                <span className={`block text-xs font-normal ${form.sesi === s ? 'text-krem' : 'text-tinta-3'}`}>
                  {!form.tanggal ? 'Pilih tanggal' : sisa > 0 ? `Sisa ${sisa}` : 'Penuh'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label htmlFor="kj-keperluan" className={labelIsian}>Keperluan</label>
        <select id="kj-keperluan" value={form.keperluan} onChange={set('keperluan')} className={isian}>
          {KUNJUNGAN.keperluan.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </div>

      <div>
        <p id="kj-fasilitas-label" className={labelIsian}>
          Fasilitas yang ingin dilihat (opsional)
        </p>
        <div role="group" aria-labelledby="kj-fasilitas-label" className="flex flex-wrap gap-2">
          {FASILITAS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={form.fasilitas.includes(f.id)}
              onClick={() => toggleFasilitas(f.id)}
              className={`py-2! text-sm! ${pilihan(form.fasilitas.includes(f.id))}`}
            >
              {f.nama}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="kj-catatan" className={labelIsian}>Catatan (opsional)</label>
        <textarea id="kj-catatan" rows={3} value={form.catatan} onChange={set('catatan')} className={isian} placeholder="Misalnya: ingin bertanya tentang program ekstrakurikuler." />
      </div>

      <button type="submit" disabled={mengirim} className={`${tombol.utama} w-full`}>
        {mengirim ? 'Mengirim...' : 'Kirim Permintaan Kunjungan'}
      </button>
      <p className="text-center text-sm text-tinta-3">
        Kunjungan didampingi guru/staf {SEKOLAH.nama}. Mohon membawa kartu identitas.
      </p>
    </form>
  )
}

// Cek status kunjungan dengan kode booking
export function CekKunjungan() {
  const [kode, setKode] = useState('')
  const [hasil, setHasil] = useState(undefined)
  const [galat, setGalat] = useState('')
  const [batas, setBatas] = useState(0)

  // Dicocokkan di server; dibatasi agar kode orang lain tidak bisa ditebak berulang-ulang
  const cek = async (e) => {
    e.preventDefault()
    const tunggu = tungguKirim('cek-kunjungan', 10, 10)
    setBatas(tunggu)
    setGalat('')
    if (tunggu) return setHasil(undefined)
    catatKirim('cek-kunjungan', 10)
    try {
      setHasil((await api('/kunjungan/cek', { method: 'POST', body: { kode: kode.trim() } })).kunjungan)
    } catch (e) {
      setHasil(undefined)
      setGalat(e.message)
    }
  }

  return (
    <div>
      <form onSubmit={cek}>
        <label htmlFor="cek-kode" className={labelIsian}>
          Kode kunjungan
        </label>
        <div className="flex gap-2">
          <input id="cek-kode" value={kode} onChange={(e) => setKode(e.target.value)} placeholder="Contoh: KJG-7QX2MP" className={`${isian} font-mono uppercase`} />
          <button type="submit" className={`${tombol.utama} shrink-0 px-4!`}>
            <Search className="h-4 w-4" /> Cek
          </button>
        </div>
      </form>
      <div aria-live="polite">
        {batas > 0 && <p className="mt-3 text-[15px] text-rose-700">Terlalu banyak pengecekan. Coba lagi dalam {batas} menit.</p>}
        {galat && <p className="mt-3 text-[15px] text-rose-700">{galat}</p>}
        {hasil === null && <p className="mt-3 text-[15px] text-rose-700">Kode tidak ditemukan. Periksa kembali kode Anda.</p>}
        {hasil && (
          <div className="mt-5 border-t border-garis pt-4 text-[15px]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold">{hasil.kode}</span>
              <Badge className={STATUS_KUNJUNGAN[hasil.status]}>{hasil.status}</Badge>
            </div>
            <p className="angka mt-2">
              {formatHari(hasil.tanggal)} · {hasil.sesi}
            </p>
            <p className="text-tinta-3">
              {hasil.nama} · {hasil.jumlah} orang
            </p>
            {hasil.catatanTu && (
              <p className="mt-3 border-l-2 border-primary-600 pl-3 text-tinta-2">
                <span className="block text-sm text-tinta-3">Catatan Tata Usaha</span>
                {hasil.catatanTu}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
