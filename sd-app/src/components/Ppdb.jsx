import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, FileUp, Printer, Search, Send } from 'lucide-react'
import { TombolSalin } from './Spp'
import { Alert, Badge, btn, inputCls, labelCls } from './ui'
import { useData } from '../context/DataContext'
import { PPDB, SEKOLAH } from '../data/dummy'
import { formatTanggal, parseKey } from '../utils/format'

export const STATUS_PPDB = {
  'Menunggu Verifikasi': { cls: 'bg-amber-100 text-amber-800', ket: 'Berkas sedang diperiksa panitia (1–3 hari kerja).' },
  'Perlu Perbaikan': { cls: 'bg-orange-100 text-orange-800', ket: 'Ada data/berkas yang perlu dilengkapi. Lihat catatan panitia.' },
  Terverifikasi: { cls: 'bg-sky-100 text-sky-700', ket: 'Berkas lengkap. Tunggu jadwal observasi dari panitia.' },
  Diterima: { cls: 'bg-emerald-100 text-emerald-700', ket: 'Selamat! Silakan lakukan daftar ulang sesuai jadwal.' },
  'Tidak Diterima': { cls: 'bg-rose-100 text-rose-700', ket: 'Mohon maaf, calon siswa belum dapat diterima.' },
}

// Usia (tahun & bulan) pada tanggal acuan PPDB
export function hitungUsia(tanggalLahir, pada = PPDB.tanggalAcuanUsia) {
  const lahir = parseKey(tanggalLahir)
  const acuan = parseKey(pada)
  let bulan = (acuan.getFullYear() - lahir.getFullYear()) * 12 + (acuan.getMonth() - lahir.getMonth())
  if (acuan.getDate() < lahir.getDate()) bulan--
  return { tahun: Math.floor(bulan / 12), bulan: bulan % 12 }
}

const LANGKAH = ['Data Calon Siswa', 'Data Orang Tua', 'Jalur & Berkas', 'Periksa & Kirim']

const FORM_KOSONG = {
  nama: '',
  panggilan: '',
  jk: '',
  tempatLahir: '',
  tanggalLahir: '',
  nik: '',
  agama: '',
  asalTk: '',
  alamat: '',
  namaAyah: '',
  pekerjaanAyah: '',
  namaIbu: '',
  pekerjaanIbu: '',
  whatsapp: '',
  email: '',
  jalur: 'Reguler',
  infoJalur: '',
  berkas: {},
  setuju: false,
}

function Kolom({ label, wajib, full, hint, children }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className={labelCls}>
        {label} {wajib && <span className="text-primary-600">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export function FormPpdb() {
  const { data, tambah } = useData()
  const atas = useRef(null)
  const [langkah, setLangkah] = useState(0)
  const [form, setForm] = useState(FORM_KOSONG)
  const [error, setError] = useState('')
  const [hasil, setHasil] = useState(null)

  // Selalu update dari state terbaru agar perubahan beruntun tidak saling menimpa
  const ubahForm = (perubahan) => setForm((f) => ({ ...f, ...perubahan }))
  const set = (k) => (e) => ubahForm({ [k]: e.target.value })
  const usia = form.tanggalLahir ? hitungUsia(form.tanggalLahir) : null
  const berkasDibutuhkan = PPDB.berkas.filter((b) => !b.jalur || b.jalur === form.jalur)
  const wajibBerkas = (b) => b.wajib || b.jalur === form.jalur

  const validasi = () => {
    if (langkah === 0) {
      if (!form.nama.trim() || !form.jk || !form.tempatLahir.trim() || !form.tanggalLahir || !form.agama || !form.alamat.trim())
        return 'Lengkapi semua kolom bertanda *.'
      if (!/^\d{16}$/.test(form.nik)) return 'NIK harus 16 digit angka (lihat Kartu Keluarga).'
      if (usia.tahun < PPDB.usiaMinimal)
        return `Usia calon siswa pada ${formatTanggal(PPDB.tanggalAcuanUsia)} baru ${usia.tahun} tahun ${usia.bulan} bulan. Usia minimal adalah ${PPDB.usiaMinimal} tahun.`
    }
    if (langkah === 1) {
      if (!form.namaAyah.trim() && !form.namaIbu.trim()) return 'Isi minimal satu nama orang tua/wali.'
      if (form.whatsapp.replace(/\D/g, '').length < 10) return 'Nomor WhatsApp belum valid.'
    }
    if (langkah === 2) {
      if (form.jalur === 'Saudara Kandung' && !form.infoJalur.trim()) return 'Isi nama dan kelas kakak yang bersekolah di sini.'
      if (form.jalur === 'Prestasi' && !form.infoJalur.trim()) return 'Tuliskan prestasi yang pernah diraih.'
      const kurang = berkasDibutuhkan.filter((b) => wajibBerkas(b) && !form.berkas[b.id])
      if (kurang.length) return `Unggah berkas: ${kurang.map((b) => b.label).join(', ')}.`
    }
    if (langkah === 3 && !form.setuju) return 'Centang pernyataan bahwa data yang diisi benar.'
    return ''
  }

  const keAtas = () => atas.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const lanjut = () => {
    const pesan = validasi()
    setError(pesan)
    keAtas()
    if (pesan) return
    if (langkah < 3) {
      setLangkah(langkah + 1)
      return
    }
    const urut = Math.max(0, ...data.pendaftar.map((p) => Number(p.nomor.slice(-4)))) + 1
    const { setuju: _, ...isian } = form
    const pendaftar = {
      ...isian,
      nik: form.nik,
      infoJalur: form.jalur === 'Reguler' ? '' : form.infoJalur,
      nomor: `PPDB-${PPDB.tahunAjaran.slice(0, 4)}-${String(urut).padStart(4, '0')}`,
      status: 'Menunggu Verifikasi',
      catatanPanitia: '',
      dibuat: new Date().toISOString(),
    }
    tambah('pendaftar', pendaftar)
    setHasil(pendaftar)
  }

  const kembali = () => {
    setError('')
    setLangkah(langkah - 1)
    keAtas()
  }

  if (hasil) return <SuksesDaftar pendaftar={hasil} />

  const ringkasan = [
    ['Nama calon siswa', `${form.nama} (${form.panggilan || '-'})`],
    ['Jenis kelamin', form.jk === 'L' ? 'Laki-laki' : 'Perempuan'],
    ['Tempat, tanggal lahir', form.tanggalLahir && `${form.tempatLahir}, ${formatTanggal(form.tanggalLahir)}`],
    ['Usia per 1 Juli 2027', usia && `${usia.tahun} tahun ${usia.bulan} bulan`],
    ['NIK', form.nik],
    ['Agama', form.agama],
    ['Asal TK/PAUD', form.asalTk || '-'],
    ['Alamat', form.alamat],
    ['Ayah', form.namaAyah ? `${form.namaAyah}${form.pekerjaanAyah ? ` · ${form.pekerjaanAyah}` : ''}` : '-'],
    ['Ibu', form.namaIbu ? `${form.namaIbu}${form.pekerjaanIbu ? ` · ${form.pekerjaanIbu}` : ''}` : '-'],
    ['WhatsApp', form.whatsapp],
    ['Email', form.email || '-'],
    ['Jalur', form.jalur + (form.jalur !== 'Reguler' && form.infoJalur ? ` — ${form.infoJalur}` : '')],
    ['Berkas', `${Object.keys(form.berkas).length} file diunggah`],
  ]

  return (
    <div ref={atas} className="scroll-mt-24">
      {/* Indikator langkah */}
      <ol className="mb-6 grid grid-cols-4 gap-2">
        {LANGKAH.map((l, i) => (
          <li key={l}>
            <div className={`h-1.5 rounded-full ${i <= langkah ? 'bg-primary-600' : 'bg-slate-200'}`} />
            <p className={`mt-2 text-[11px] font-semibold sm:text-xs ${i === langkah ? 'text-primary-700' : i < langkah ? 'text-slate-600' : 'text-slate-400'}`}>
              <span className="hidden sm:inline">{i + 1}. </span>
              {l}
            </p>
          </li>
        ))}
      </ol>

      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {langkah === 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Kolom label="Nama lengkap" wajib full hint="Sesuai akta kelahiran.">
            <input value={form.nama} onChange={set('nama')} className={inputCls} />
          </Kolom>
          <Kolom label="Nama panggilan">
            <input value={form.panggilan} onChange={set('panggilan')} className={inputCls} />
          </Kolom>
          <Kolom label="Jenis kelamin" wajib>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['L', 'Laki-laki'],
                ['P', 'Perempuan'],
              ].map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => ubahForm({ jk: v })}
                  className={`rounded-xl border-2 py-2.5 text-sm font-semibold transition ${
                    form.jk === v ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </Kolom>
          <Kolom label="Tempat lahir" wajib>
            <input value={form.tempatLahir} onChange={set('tempatLahir')} className={inputCls} />
          </Kolom>
          <Kolom
            label="Tanggal lahir"
            wajib
            hint={usia ? `Usia pada 1 Juli 2027: ${usia.tahun} tahun ${usia.bulan} bulan` : `Minimal ${PPDB.usiaMinimal} tahun pada 1 Juli 2027.`}
          >
            <input type="date" value={form.tanggalLahir} onChange={set('tanggalLahir')} className={inputCls} />
          </Kolom>
          <Kolom label="NIK anak" wajib hint="16 digit, tertera di Kartu Keluarga.">
            <input
              inputMode="numeric"
              maxLength={16}
              value={form.nik}
              onChange={(e) => ubahForm({ nik: e.target.value.replace(/\D/g, '') })}
              className={`${inputCls} font-mono tracking-wider`}
            />
          </Kolom>
          <Kolom label="Agama" wajib>
            <select value={form.agama} onChange={set('agama')} className={inputCls}>
              <option value="">Pilih agama</option>
              {PPDB.agama.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Kolom>
          <Kolom label="Asal TK/PAUD" hint="Kosongkan jika tidak bersekolah TK.">
            <input value={form.asalTk} onChange={set('asalTk')} className={inputCls} />
          </Kolom>
          <Kolom label="Alamat tempat tinggal" wajib full>
            <textarea rows={2} value={form.alamat} onChange={set('alamat')} className={inputCls} />
          </Kolom>
        </div>
      )}

      {langkah === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Kolom label="Nama ayah">
            <input value={form.namaAyah} onChange={set('namaAyah')} className={inputCls} />
          </Kolom>
          <Kolom label="Pekerjaan ayah">
            <input value={form.pekerjaanAyah} onChange={set('pekerjaanAyah')} className={inputCls} />
          </Kolom>
          <Kolom label="Nama ibu">
            <input value={form.namaIbu} onChange={set('namaIbu')} className={inputCls} />
          </Kolom>
          <Kolom label="Pekerjaan ibu">
            <input value={form.pekerjaanIbu} onChange={set('pekerjaanIbu')} className={inputCls} />
          </Kolom>
          <Kolom label="No. WhatsApp aktif" wajib hint="Informasi PPDB akan dikirim ke nomor ini.">
            <input type="tel" value={form.whatsapp} onChange={set('whatsapp')} className={inputCls} placeholder="08xx-xxxx-xxxx" />
          </Kolom>
          <Kolom label="Email">
            <input type="email" value={form.email} onChange={set('email')} className={inputCls} placeholder="Opsional" />
          </Kolom>
          <p className="text-xs text-slate-500 sm:col-span-2">Isi minimal satu nama orang tua atau wali.</p>
        </div>
      )}

      {langkah === 2 && (
        <div className="space-y-5">
          <div>
            <span className={labelCls}>
              Jalur pendaftaran <span className="text-primary-600">*</span>
            </span>
            <div className="grid gap-2 sm:grid-cols-3">
              {PPDB.jalur.map((j) => (
                <button
                  key={j.nama}
                  type="button"
                  onClick={() => ubahForm({ jalur: j.nama, infoJalur: '' })}
                  className={`rounded-xl border-2 p-3 text-left transition ${
                    form.jalur === j.nama ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="block text-sm font-bold text-slate-900">{j.nama}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{j.ket}</span>
                </button>
              ))}
            </div>
          </div>

          {form.jalur === 'Saudara Kandung' && (
            <Kolom label="Nama & kelas kakak" wajib>
              <input value={form.infoJalur} onChange={set('infoJalur')} className={inputCls} placeholder="Contoh: Hafiz Maulana — kelas 4A" />
            </Kolom>
          )}
          {form.jalur === 'Prestasi' && (
            <Kolom label="Prestasi yang pernah diraih" wajib>
              <input value={form.infoJalur} onChange={set('infoJalur')} className={inputCls} placeholder="Contoh: Juara 1 lomba mewarnai tingkat kota 2026" />
            </Kolom>
          )}

          <div>
            <span className={labelCls}>Unggah berkas</span>
            <p className="-mt-1 mb-3 text-xs text-slate-500">Foto/scan yang jelas, format JPG, PNG, atau PDF.</p>
            <ul className="space-y-2">
              {berkasDibutuhkan.map((b) => {
                const file = form.berkas[b.id]
                return (
                  <li key={b.id} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${file ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'}`}>
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${file ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {file ? <Check className="h-4 w-4" /> : <FileUp className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {b.label} {wajibBerkas(b) ? <span className="text-primary-600">*</span> : <span className="font-normal text-slate-400">(opsional)</span>}
                      </p>
                      {file && <p className="truncate text-xs text-emerald-700">{file}</p>}
                    </div>
                    <label className="cursor-pointer rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-primary-700 ring-1 ring-slate-200 hover:bg-primary-50">
                      {file ? 'Ganti' : 'Pilih file'}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="sr-only"
                        onChange={(e) => {
                          const nama = e.target.files[0]?.name
                          if (nama) setForm((f) => ({ ...f, berkas: { ...f.berkas, [b.id]: nama } }))
                        }}
                      />
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}

      {langkah === 3 && (
        <div>
          <p className="mb-3 text-sm text-slate-600">Periksa kembali data berikut sebelum dikirim.</p>
          <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
            {ringkasan.map(([k, v]) => (
              <div key={k} className="grid gap-1 px-4 py-2.5 text-sm sm:grid-cols-[180px_1fr]">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-semibold text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            <input type="checkbox" checked={form.setuju} onChange={(e) => ubahForm({ setuju: e.target.checked })} className="mt-0.5 h-4 w-4 accent-primary-600" />
            Saya menyatakan bahwa data dan berkas yang saya isi adalah benar dan dapat dipertanggungjawabkan.
          </label>
        </div>
      )}

      <div className="mt-6 flex gap-2">
        {langkah > 0 && (
          <button type="button" onClick={kembali} className={btn.secondary}>
            <ArrowLeft className="h-4 w-4" /> Kembali
          </button>
        )}
        <button type="button" onClick={lanjut} className={`${btn.primary} flex-1 py-3`}>
          {langkah < 3 ? (
            <>
              Lanjut <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Kirim Pendaftaran
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function SuksesDaftar({ pendaftar }) {
  return (
    <div>
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <p className="mt-4 text-2xl font-extrabold text-slate-900">Pendaftaran berhasil dikirim!</p>
        <p className="mt-1 text-slate-600">Terima kasih telah mendaftarkan {pendaftar.nama}.</p>
      </div>

      <BuktiPendaftaran pendaftar={pendaftar} />

      <div className="mt-5 rounded-2xl bg-slate-50 p-5">
        <p className="font-bold text-slate-900">Langkah selanjutnya</p>
        <ol className="mt-3 space-y-2 text-sm text-slate-700">
          {[
            'Simpan nomor pendaftaran di atas.',
            `Panitia memeriksa berkas dalam 1–3 hari kerja dan menghubungi Anda lewat WhatsApp ${pendaftar.whatsapp}.`,
            'Pantau status pendaftaran di halaman ini menggunakan nomor pendaftaran dan tanggal lahir anak.',
            `Ikuti observasi sesuai jadwal: ${PPDB.jadwal[1].tanggal}.`,
          ].map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export function BuktiPendaftaran({ pendaftar }) {
  return (
    <>
      <div className="area-cetak mt-6 rounded-2xl border-2 border-dashed border-primary-300 bg-white p-5">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <img src="/logo.png" alt="" className="h-10 w-10 object-contain" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Bukti Pendaftaran PPDB {PPDB.tahunAjaran}</p>
            <p className="font-extrabold text-slate-900">{SEKOLAH.nama}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">Nomor pendaftaran</p>
            <p className="font-mono text-2xl font-extrabold tracking-wider text-primary-700">{pendaftar.nomor}</p>
          </div>
          <TombolSalin teks={pendaftar.nomor} label="Salin nomor" />
        </div>
        <dl className="mt-4 grid grid-cols-[130px_1fr] gap-y-1.5 text-sm">
          <dt className="text-slate-500">Nama calon siswa</dt>
          <dd className="font-semibold text-slate-800">{pendaftar.nama}</dd>
          <dt className="text-slate-500">Tanggal lahir</dt>
          <dd className="font-semibold text-slate-800">{formatTanggal(pendaftar.tanggalLahir)}</dd>
          <dt className="text-slate-500">Jalur</dt>
          <dd className="font-semibold text-slate-800">{pendaftar.jalur}</dd>
          <dt className="text-slate-500">Tanggal daftar</dt>
          <dd className="font-semibold text-slate-800">{new Date(pendaftar.dibuat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</dd>
        </dl>
      </div>
      <button type="button" onClick={() => window.print()} className={`${btn.secondary} mt-3 w-full`}>
        <Printer className="h-4 w-4" /> Cetak / Simpan Bukti Pendaftaran
      </button>
    </>
  )
}

// Cek status: nomor pendaftaran + tanggal lahir (agar data tidak bisa dilihat sembarang orang)
export function CekStatusPpdb() {
  const { data } = useData()
  const [nomor, setNomor] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [hasil, setHasil] = useState(undefined)

  const cek = (e) => {
    e.preventDefault()
    setHasil(data.pendaftar.find((p) => p.nomor.toLowerCase() === nomor.trim().toLowerCase() && p.tanggalLahir === tanggal) ?? null)
  }

  return (
    <div>
      <form onSubmit={cek} className="space-y-3">
        <input value={nomor} onChange={(e) => setNomor(e.target.value)} required placeholder="Nomor pendaftaran, mis. PPDB-2027-0001" className={`${inputCls} font-mono`} aria-label="Nomor pendaftaran" />
        <div>
          <label htmlFor="cek-lahir" className="mb-1 block text-xs text-slate-500">Tanggal lahir anak</label>
          <input id="cek-lahir" type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required className={inputCls} />
        </div>
        <button type="submit" className={`${btn.primary} w-full`}>
          <Search className="h-4 w-4" /> Cek Status
        </button>
      </form>
      {hasil === null && <p className="mt-3 text-sm text-rose-600">Data tidak ditemukan. Periksa nomor pendaftaran dan tanggal lahir.</p>}
      {hasil && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-slate-800">{hasil.nama}</span>
            <Badge className={STATUS_PPDB[hasil.status].cls}>{hasil.status}</Badge>
          </div>
          <p className="mt-1 text-slate-500">
            {hasil.nomor} · Jalur {hasil.jalur}
          </p>
          <p className="mt-2 text-slate-700">{STATUS_PPDB[hasil.status].ket}</p>
          {hasil.catatanPanitia && <p className="mt-2 rounded-lg bg-white px-3 py-2 text-slate-600">💬 {hasil.catatanPanitia}</p>}
        </div>
      )}
    </div>
  )
}
