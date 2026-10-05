import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Building2, CheckCircle2, DoorOpen, HeartPulse, Laptop, Moon, Search, Trees, Trophy, Utensils } from 'lucide-react'
import { agendaPada } from './KalenderAkademik'
import { TombolSalin } from './Spp'
import { Alert, Badge, btn, inputCls, labelCls } from './ui'
import { useData } from '../context/DataContext'
import { DENAH_LAIN, FASILITAS, KUNJUNGAN, SEKOLAH } from '../data/dummy'
import { formatHari, isHariSekolah, parseKey, tambahHari, todayKey } from '../utils/format'

export const IKON_FASILITAS = {
  kelas: Building2,
  buku: BookOpen,
  komputer: Laptop,
  lapangan: Trophy,
  mushola: Moon,
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

const posisi = ({ x, y, w, h }) => ({ left: `${x}%`, top: `${(y / 70) * 100}%`, width: `${w}%`, height: `${(h / 70) * 100}%` })

// Denah sekolah interaktif. Klik area fasilitas untuk membuka halaman detailnya.
// `kecil` = versi ringkas tanpa label (untuk sidebar); ukuran teks mengikuti lebar denah (container query).
export function DenahSekolah({ aktif, kecil = false }) {
  const fasilitasAktif = FASILITAS.find((f) => f.id === aktif)

  return (
    <div>
      <div className="@container relative aspect-[10/7] w-full overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50">
        {/* Jalan setapak */}
        <div className="absolute bg-amber-100/80" style={{ left: '42.5%', top: 0, width: '2%', height: '100%' }} />
        <div className="absolute bg-amber-100/80" style={{ left: 0, top: '62%', width: '100%', height: '3%' }} />

        {DENAH_LAIN.map((a) => (
          <div
            key={a.nama}
            style={posisi(a.denah)}
            title={a.nama}
            className={`absolute flex items-center justify-center gap-1 rounded-lg px-1 text-center text-[8px] font-semibold leading-tight @lg:text-xs ${
              a.gerbang ? 'border-2 border-dashed border-slate-400 text-slate-500' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {a.gerbang && <DoorOpen className={kecil ? 'h-3 w-3' : 'hidden h-3.5 w-3.5 @lg:block'} />}
            {!kecil && a.nama}
          </div>
        ))}

        {FASILITAS.map((f) => {
          const Icon = IKON_FASILITAS[f.ikon]
          const dipilih = aktif === f.id
          return (
            <Link
              key={f.id}
              to={`/fasilitas/${f.id}`}
              style={posisi(f.denah)}
              title={f.nama}
              aria-label={f.nama}
              className={`group absolute flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 p-1 text-center transition @lg:gap-1 ${
                dipilih
                  ? 'z-10 border-primary-700 bg-primary-600 text-white shadow-lg'
                  : 'border-white bg-white text-slate-700 shadow-sm hover:z-10 hover:-translate-y-0.5 hover:border-primary-400 hover:text-primary-700 hover:shadow-md'
              }`}
            >
              <Icon className="h-3.5 w-3.5 @lg:h-5 @lg:w-5" />
              {!kecil && <span className="text-[8px] font-bold leading-tight @lg:text-xs">{f.nama}</span>}
            </Link>
          )
        })}
      </div>
      {kecil && fasilitasAktif && (
        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-primary-600" />
          <span>
            <b className="text-slate-700">{fasilitasAktif.nama}</b> · {fasilitasAktif.lokasi}
          </span>
        </p>
      )}
    </div>
  )
}

const besok = () => tambahHari(todayKey(), 1)

// Form penjadwalan kunjungan langsung ke sekolah
export function FormKunjungan({ fasilitasAwal = [] }) {
  const { data, tambah } = useData()
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

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const terisi = (sesi) => data.kunjungan.filter((k) => k.tanggal === form.tanggal && k.sesi === sesi && k.status !== 'Ditolak').length
  const libur = form.tanggal && (!isHariSekolah(parseKey(form.tanggal)) || agendaPada(form.tanggal).some((e) => e.jenis === 'libur'))
  const toggleFasilitas = (id) =>
    setForm({ ...form, fasilitas: form.fasilitas.includes(id) ? form.fasilitas.filter((x) => x !== id) : [...form.fasilitas, id] })

  const kirim = (e) => {
    e.preventDefault()
    if (libur) return setError('Kunjungan hanya tersedia pada hari sekolah (Senin – Jumat, bukan hari libur).')
    if (!form.sesi) return setError('Pilih sesi kunjungan.')
    if (terisi(form.sesi) >= KUNJUNGAN.kuotaPerSesi) return setError('Sesi ini sudah penuh. Silakan pilih sesi atau tanggal lain.')
    const kunjungan = {
      ...form,
      jumlah: Number(form.jumlah),
      kode: `KJG-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Menunggu',
      dibuat: new Date().toISOString(),
    }
    tambah('kunjungan', kunjungan)
    setBerhasil(kunjungan)
  }

  if (berhasil) {
    return (
      <div className="py-2 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <p className="mt-4 text-xl font-extrabold text-slate-900">Permintaan kunjungan terkirim!</p>
        <p className="mt-2 text-sm text-slate-600">
          {formatHari(berhasil.tanggal)}, pukul {berhasil.sesi} WIB
        </p>
        <div className="mx-auto mt-5 max-w-xs rounded-2xl border-2 border-dashed border-primary-300 bg-primary-50 p-4">
          <p className="text-xs text-primary-700">Kode kunjungan Anda</p>
          <p className="mt-1 font-mono text-3xl font-extrabold tracking-wider text-primary-700">{berhasil.kode}</p>
          <div className="mt-2">
            <TombolSalin teks={berhasil.kode} label="Salin kode" />
          </div>
        </div>
        <p className="mt-5 text-sm text-slate-600">
          Tata Usaha akan mengonfirmasi melalui WhatsApp <b>{berhasil.whatsapp}</b>. Simpan kode ini untuk mengecek status di halaman Fasilitas.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={kirim} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="kj-nama" className={labelCls}>Nama lengkap</label>
          <input id="kj-nama" required value={form.nama} onChange={set('nama')} className={inputCls} placeholder="Nama Bapak/Ibu" />
        </div>
        <div>
          <label htmlFor="kj-wa" className={labelCls}>No. WhatsApp</label>
          <input id="kj-wa" required type="tel" value={form.whatsapp} onChange={set('whatsapp')} className={inputCls} placeholder="08xx-xxxx-xxxx" />
        </div>
        <div>
          <label htmlFor="kj-tanggal" className={labelCls}>Tanggal kunjungan</label>
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
            className={inputCls}
          />
          {form.tanggal && (
            <p className={`mt-1 text-xs ${libur ? 'font-semibold text-rose-600' : 'text-slate-500'}`}>
              {libur ? 'Hari libur — pilih Senin sampai Jumat.' : formatHari(form.tanggal)}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="kj-jumlah" className={labelCls}>Jumlah pengunjung</label>
          <select id="kj-jumlah" value={form.jumlah} onChange={set('jumlah')} className={inputCls}>
            {Array.from({ length: KUNJUNGAN.maksOrang }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} orang
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <span className={labelCls}>Sesi</span>
        <div className="grid grid-cols-3 gap-2">
          {KUNJUNGAN.sesi.map((s) => {
            const sisa = KUNJUNGAN.kuotaPerSesi - terisi(s)
            const penuh = !form.tanggal || libur || sisa <= 0
            return (
              <button
                key={s}
                type="button"
                disabled={penuh}
                onClick={() => setForm({ ...form, sesi: s })}
                className={`rounded-xl border-2 px-2 py-2.5 text-center transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  form.sesi === s ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="block text-sm font-bold">{s}</span>
                <span className="block text-[11px] text-slate-500">{!form.tanggal ? 'Pilih tanggal' : sisa > 0 ? `Sisa ${sisa}` : 'Penuh'}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label htmlFor="kj-keperluan" className={labelCls}>Keperluan</label>
        <select id="kj-keperluan" value={form.keperluan} onChange={set('keperluan')} className={inputCls}>
          {KUNJUNGAN.keperluan.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </div>

      <div>
        <span className={labelCls}>Fasilitas yang ingin dilihat (opsional)</span>
        <div className="flex flex-wrap gap-2">
          {FASILITAS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => toggleFasilitas(f.id)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                form.fasilitas.includes(f.id) ? 'border-primary-500 bg-primary-600 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {f.nama}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="kj-catatan" className={labelCls}>Catatan (opsional)</label>
        <textarea id="kj-catatan" rows={3} value={form.catatan} onChange={set('catatan')} className={inputCls} placeholder="Misalnya: ingin bertanya tentang program ekstrakurikuler." />
      </div>

      <button type="submit" className={`${btn.primary} w-full py-3`}>
        Kirim Permintaan Kunjungan
      </button>
      <p className="text-center text-xs text-slate-500">
        Kunjungan didampingi guru/staf {SEKOLAH.nama}. Mohon membawa kartu identitas.
      </p>
    </form>
  )
}

// Cek status kunjungan dengan kode booking
export function CekKunjungan() {
  const { data } = useData()
  const [kode, setKode] = useState('')
  const [hasil, setHasil] = useState(undefined)

  const cek = (e) => {
    e.preventDefault()
    setHasil(data.kunjungan.find((k) => k.kode.toLowerCase() === kode.trim().toLowerCase()) ?? null)
  }

  return (
    <div>
      <form onSubmit={cek} className="flex gap-2">
        <input value={kode} onChange={(e) => setKode(e.target.value)} placeholder="Contoh: KJG-4821" className={`${inputCls} font-mono uppercase`} aria-label="Kode kunjungan" />
        <button type="submit" className={btn.primary} aria-label="Cek status">
          <Search className="h-4 w-4" />
        </button>
      </form>
      {hasil === null && <p className="mt-3 text-sm text-rose-600">Kode tidak ditemukan. Periksa kembali kode Anda.</p>}
      {hasil && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono font-bold text-slate-800">{hasil.kode}</span>
            <Badge className={STATUS_KUNJUNGAN[hasil.status]}>{hasil.status}</Badge>
          </div>
          <p className="mt-2 text-slate-700">
            {formatHari(hasil.tanggal)} · {hasil.sesi}
          </p>
          <p className="text-slate-500">
            {hasil.nama} · {hasil.jumlah} orang
          </p>
          {hasil.catatanTu && <p className="mt-2 rounded-lg bg-white px-3 py-2 text-slate-600">💬 {hasil.catatanTu}</p>}
        </div>
      )}
    </div>
  )
}
