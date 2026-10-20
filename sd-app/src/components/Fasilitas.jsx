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
import { isian, isianPilih, labelIsian, pilihan, tombol } from './Situs'
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
  Menunggu: 'warna-amber',
  Dikonfirmasi: 'warna-emerald',
  Ditolak: 'warna-rose',
  Selesai: 'warna-abu',
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

// Area terbuka diberi warna rumput/taman, bangunan berwarna putih (lihat .denah-* di _situs.scss)
const GAYA_FASILITAS = {
  lapangan: 'denah-fasilitas--lapangan',
  taman: 'denah-fasilitas--taman',
}

function IsiArea({ Ikon, teks, kecil }) {
  return (
    <>
      <Ikon className="denah-ikon flex-shrink-0" />
      {!kecil && <span className="denah-label mw-100">{teks}</span>}
    </>
  )
}

// Tiang bendera di Lapangan Upacara
function TiangBendera() {
  return (
    <svg viewBox="0 0 24 32" className="denah-tiang position-absolute start-50" aria-hidden="true">
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
      <div className="denah position-relative w-100 overflow-hidden rounded-3" style={{ aspectRatio: `${LEBAR} / ${TINGGI}` }} role="group" aria-label="Denah sekolah">
        {/* Zona berlatar */}
        {DENAH_ZONA.map((z) => (
          <div key={z.nama} style={posisi(z.denah)} className="denah-zona position-absolute rounded-1">
            {!kecil && <span className="denah-zona__label position-absolute">{z.nama}</span>}
          </div>
        ))}

        {/* Jalan & selasar */}
        {DENAH_JALUR.map((j, i) => (
          <div key={i} style={posisi(j)} className="denah-jalan position-absolute" />
        ))}

        {/* Pagar keliling sekolah */}
        <div className="denah-pagar pe-none position-absolute rounded-2" title="Pagar sekolah" />

        {/* Gerbang utama di pagar kanan */}
        <div
          title="Gerbang Utama"
          className="denah-gerbang position-absolute end-0 z-10 d-flex align-items-center justify-content-center"
          style={{ top: persen(DENAH_GERBANG.y, TINGGI), height: persen(DENAH_GERBANG.h, TINGGI), width: '3.4%' }}
        >
          <DoorOpen className="denah-gerbang__ikon" />
        </div>
        {!kecil && (
          <span className="denah-gerbang__label position-absolute z-10 text-nowrap" style={{ right: '4.2%', top: persen(DENAH_GERBANG.y + DENAH_GERBANG.h / 2, TINGGI) }}>
            Gerbang Utama →
          </span>
        )}

        {/* Bangunan & area yang bukan fasilitas */}
        {DENAH_LAIN.map((a) =>
          a.jenis === 'upacara' ? (
            <div key={a.nama} style={posisi(a.denah)} title="Lapangan Upacara & tiang bendera" className="denah-upacara position-absolute rounded-1">
              <TiangBendera />
              {!kecil && <span className="denah-label denah-upacara__label position-absolute start-0 end-0 text-center">Lapangan Upacara · Tiang Bendera</span>}
            </div>
          ) : (
            <div
              key={a.nama}
              style={posisi(a.denah)}
              title={a.nama}
              className={`denah-area position-absolute d-flex flex-column align-items-center justify-content-center rounded-1 text-center ${
                a.jenis === 'parkir' ? 'denah-area--parkir' : 'denah-area--gedung'
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
                className={`denah-area denah-fasilitas position-absolute d-flex flex-column align-items-center justify-content-center rounded-1 text-center ${
                  dipilih ? 'denah-fasilitas--aktif' : GAYA_FASILITAS[f.id] ?? ''
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
          <p className="mt-2 d-flex align-items-center gap-2 fs-xs text-tinta-3">
            <span className="ukuran-2-5 flex-shrink-0 rounded-1 bg-primary" />
            <span>
              <b className="text-tinta-2">{fasilitasAktif.nama}</b> · {fasilitasAktif.lokasi}
            </span>
          </p>
        )
      ) : (
        <ul className="mt-3 d-flex flex-wrap column-gap-4 row-gap-1-5 fs-xs text-tinta-3">
          <li className="d-flex align-items-center gap-1-5">
            <span className="legenda-denah legenda-denah--pagar" /> Pagar sekolah
          </li>
          <li className="d-flex align-items-center gap-1-5">
            <span className="legenda-denah legenda-denah--jalan" /> Jalan
          </li>
          <li className="d-flex align-items-center gap-1-5">
            <DoorOpen className="ukuran-3-5 text-primary" /> Gerbang utama & pos satpam (kanan)
          </li>
          <li className="d-flex align-items-center gap-1-5">
            <span className="legenda-denah legenda-denah--fasilitas" /> Fasilitas (klik untuk detail)
          </li>
          <li className="d-flex align-items-center gap-1-5">
            <span className="legenda-denah legenda-denah--gedung" /> Ruang guru, kepala sekolah & lab server
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
        <CheckCircle2 className="ukuran-10 text-success" aria-hidden="true" />
        <p className="mt-4 fs-3xl fw-extrabold ls-tight lh-tight">Permintaan kunjungan terkirim.</p>
        <p className="angka mt-2 text-tinta-2">
          {formatHari(berhasil.tanggal)}, pukul {berhasil.sesi} WIB
        </p>
        <div className="mt-6 rounded-2 border border-2 border-putus border-tinta border-opacity-50 bg-white p-5">
          <p className="fs-sm text-tinta-3">Kode kunjungan Anda</p>
          <p className="mt-1 font-monospace fs-3xl fw-bold ls-wider text-merah-700">{berhasil.kode}</p>
          <div className="mt-3">
            <TombolSalin teks={berhasil.kode} label="Salin kode" />
          </div>
        </div>
        <p className="mt-5 fs-15 lh-relaxed text-tinta-2">
          Tata Usaha akan mengonfirmasi melalui WhatsApp <b>{berhasil.whatsapp}</b>. Simpan kode ini untuk mengecek status di halaman Fasilitas.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={kirim} className="position-relative d-flex flex-column gap-5">
      <JebakanBot value={jebakan} onChange={setJebakan} />
      {error && (
        <div role="alert">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      <div className="d-grid gap-5 kolom-sm-2">
        <div>
          <label htmlFor="kj-nama" className={labelIsian}>
            Nama lengkap
          </label>
          <input id="kj-nama" required value={form.nama} onChange={set('nama')} className={isian} placeholder="Nama Bapak/Ibu" />
        </div>
        <div>
          <label htmlFor="kj-wa" className={labelIsian}>
            No. WhatsApp
          </label>
          <input id="kj-wa" required type="tel" value={form.whatsapp} onChange={set('whatsapp')} className={isian} placeholder="08xx-xxxx-xxxx" />
        </div>
        <div>
          <label htmlFor="kj-tanggal" className={labelIsian}>
            Tanggal kunjungan
          </label>
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
            <p className={`mt-1-5 fs-sm ${libur ? 'fw-semibold text-danger-emphasis' : 'text-tinta-3'}`}>
              {libur ? 'Hari libur — pilih Senin sampai Jumat.' : formatHari(form.tanggal)}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="kj-jumlah" className={labelIsian}>
            Jumlah pengunjung
          </label>
          <select id="kj-jumlah" value={form.jumlah} onChange={set('jumlah')} className={isianPilih}>
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
        <div role="group" aria-labelledby="kj-sesi-label" className="d-grid kolom-3 gap-2">
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
                className={`d-block text-center ${pilihan(form.sesi === s, 'px-2 py-2-5 fs-15')}`}
              >
                <span className="angka d-block fs-sm fw-bold">{s}</span>
                <span className={`d-block fs-xs fw-normal ${form.sesi === s ? 'text-krem' : 'text-tinta-3'}`}>
                  {!form.tanggal ? 'Pilih tanggal' : sisa > 0 ? `Sisa ${sisa}` : 'Penuh'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label htmlFor="kj-keperluan" className={labelIsian}>
          Keperluan
        </label>
        <select id="kj-keperluan" value={form.keperluan} onChange={set('keperluan')} className={isianPilih}>
          {KUNJUNGAN.keperluan.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </div>

      <div>
        <p id="kj-fasilitas-label" className={labelIsian}>
          Fasilitas yang ingin dilihat (opsional)
        </p>
        <div role="group" aria-labelledby="kj-fasilitas-label" className="d-flex flex-wrap gap-2">
          {FASILITAS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={form.fasilitas.includes(f.id)}
              onClick={() => toggleFasilitas(f.id)}
              className={pilihan(form.fasilitas.includes(f.id), 'px-3 py-2 fs-sm')}
            >
              {f.nama}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="kj-catatan" className={labelIsian}>
          Catatan (opsional)
        </label>
        <textarea id="kj-catatan" rows={3} value={form.catatan} onChange={set('catatan')} className={isian} placeholder="Misalnya: ingin bertanya tentang program ekstrakurikuler." />
      </div>

      <button type="submit" disabled={mengirim} className={`${tombol.utama} w-100`}>
        {mengirim ? 'Mengirim...' : 'Kirim Permintaan Kunjungan'}
      </button>
      <p className="text-center fs-sm text-tinta-3">Kunjungan didampingi guru/staf {SEKOLAH.nama}. Mohon membawa kartu identitas.</p>
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
        <div className="d-flex gap-2">
          <input id="cek-kode" value={kode} onChange={(e) => setKode(e.target.value)} placeholder="Contoh: KJG-7QX2MP" className={`${isian} font-monospace text-uppercase`} />
          <button type="submit" className={`${tombol.utama} flex-shrink-0 px-4`}>
            <Search className="ukuran-4" /> Cek
          </button>
        </div>
      </form>
      <div aria-live="polite">
        {batas > 0 && <p className="mt-3 fs-15 text-danger-emphasis">Terlalu banyak pengecekan. Coba lagi dalam {batas} menit.</p>}
        {galat && <p className="mt-3 fs-15 text-danger-emphasis">{galat}</p>}
        {hasil === null && <p className="mt-3 fs-15 text-danger-emphasis">Kode tidak ditemukan. Periksa kembali kode Anda.</p>}
        {hasil && (
          <div className="mt-5 border-top border-garis pt-4 fs-15">
            <div className="d-flex align-items-center justify-content-between gap-2">
              <span className="font-monospace fw-bold">{hasil.kode}</span>
              <Badge className={STATUS_KUNJUNGAN[hasil.status]}>{hasil.status}</Badge>
            </div>
            <p className="angka mt-2">
              {formatHari(hasil.tanggal)} · {hasil.sesi}
            </p>
            <p className="text-tinta-3">
              {hasil.nama} · {hasil.jumlah} orang
            </p>
            {hasil.catatanTu && (
              <p className="mt-3 border-start border-2 border-primary ps-3 text-tinta-2">
                <span className="d-block fs-sm text-tinta-3">Catatan Tata Usaha</span>
                {hasil.catatanTu}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
