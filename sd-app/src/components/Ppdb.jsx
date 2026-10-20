import { cloneElement, isValidElement, useId, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, FileUp, Printer, Search, Send } from 'lucide-react'
import { isian, isianPilih, labelIsian, pilihan, tombol } from './Situs'
import { TombolSalin } from './Spp'
import { Alert, Badge, JebakanBot } from './ui'
import { useData } from '../context/DataContext'
import { api } from '../utils/api'
import { PPDB, SEKOLAH } from '../data/dummy'
import { formatTanggal, parseKey } from '../utils/format'
import { catatKirim, tungguKirim } from '../utils/keamanan'

export const STATUS_PPDB = {
  'Menunggu Verifikasi': { cls: 'warna-amber', ket: 'Berkas sedang diperiksa panitia (1–3 hari kerja).' },
  'Perlu Perbaikan': { cls: 'warna-orange', ket: 'Ada data/berkas yang perlu dilengkapi. Lihat catatan panitia.' },
  Terverifikasi: { cls: 'warna-sky', ket: 'Berkas lengkap. Tunggu jadwal observasi dari panitia.' },
  Diterima: { cls: 'warna-emerald', ket: 'Selamat! Silakan lakukan daftar ulang sesuai jadwal.' },
  'Tidak Diterima': { cls: 'warna-rose', ket: 'Mohon maaf, calon siswa belum dapat diterima.' },
}

// Usia (tahun & bulan) pada tanggal acuan PPDB
export function hitungUsia(tanggalLahir, pada = PPDB.tanggalAcuanUsia) {
  const lahir = parseKey(tanggalLahir)
  const acuan = parseKey(pada)
  let bulan = (acuan.getFullYear() - lahir.getFullYear()) * 12 + (acuan.getMonth() - lahir.getMonth())
  if (acuan.getDate() < lahir.getDate()) bulan--
  return { tahun: Math.floor(bulan / 12), bulan: bulan % 12 }
}

const LANGKAH = ['Data calon siswa', 'Data orang tua', 'Jalur & berkas', 'Periksa & kirim']

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

// Satu kolom formulir. Jika isinya input/select/textarea, label & petunjuk otomatis ditautkan ke kolom itu.
function Kolom({ label, wajib, full, hint, children }) {
  const id = useId()
  const kolom = isValidElement(children) && ['input', 'select', 'textarea'].includes(children.type)
  const isi = kolom ? cloneElement(children, { id, 'aria-describedby': hint ? `${id}-ket` : undefined, 'aria-required': wajib || undefined }) : children
  const judul = (
    <>
      {label} {wajib && <span className="text-merah-700">*</span>}
    </>
  )
  return (
    <div className={full ? 'rentang-sm-2' : ''} {...(kolom ? {} : { role: 'group', 'aria-labelledby': `${id}-label` })}>
      {kolom ? (
        <label htmlFor={id} className={labelIsian}>
          {judul}
        </label>
      ) : (
        <p id={`${id}-label`} className={labelIsian}>
          {judul}
        </p>
      )}
      {isi}
      {hint && (
        <p id={`${id}-ket`} className="mt-1-5 fs-sm text-tinta-3">
          {hint}
        </p>
      )}
    </div>
  )
}

export function FormPpdb() {
  const { daftarPpdb } = useData()
  const atas = useRef(null)
  const [mengirim, setMengirim] = useState(false)
  const [langkah, setLangkah] = useState(0)
  const [form, setForm] = useState(FORM_KOSONG)
  const [error, setError] = useState('')
  const [hasil, setHasil] = useState(null)
  const [jebakan, setJebakan] = useState('')

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

  const lanjut = async () => {
    if (mengirim) return
    const pesan = validasi()
    setError(pesan)
    keAtas()
    if (pesan) return
    if (langkah < 3) {
      setLangkah(langkah + 1)
      return
    }
    // Anti-spam: bot yang mengisi kolom jebakan, atau terlalu banyak pendaftaran dari perangkat ini
    if (jebakan) return setError('Pendaftaran tidak dapat diproses. Muat ulang halaman lalu coba lagi.')
    const tunggu = tungguKirim('ppdb', 3, 30)
    if (tunggu) return setError(`Terlalu banyak pendaftaran dari perangkat ini. Coba lagi dalam ${tunggu} menit.`)
    // Nomor pendaftaran dibuat server (tidak bisa ganda walau banyak yang mendaftar bersamaan)
    const { setuju: _, ...isianForm } = form
    setMengirim(true)
    const { pendaftar, galat } = await daftarPpdb({ ...isianForm, infoJalur: form.jalur === 'Reguler' ? '' : form.infoJalur })
    setMengirim(false)
    if (galat) return setError(galat)
    catatKirim('ppdb', 30)
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
    <div ref={atas} className="gulir-mt-28">
      {/* Indikator langkah */}
      <ol className="mb-8 d-grid kolom-4 gap-3" aria-label="Langkah pendaftaran">
        {LANGKAH.map((l, i) => (
          <li key={l} aria-current={i === langkah ? 'step' : undefined}>
            <div className={`h-1 ${i <= langkah ? 'bg-primary' : 'bg-garis'}`} />
            <p className={`mt-2 fs-xs fs-sm-sm fw-semibold ${i === langkah ? 'text-tinta' : i < langkah ? 'text-tinta-2' : 'text-tinta-3'}`}>
              <span className="angka">{i + 1}.</span> <span className="d-none d-sm-inline">{l}</span>
            </p>
          </li>
        ))}
      </ol>
      <p className="mt-n4 mb-6 fs-2xl fw-extrabold ls-tight d-sm-none">{LANGKAH[langkah]}</p>

      {error && (
        <div className="mb-5" role="alert">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {langkah === 0 && (
        <div className="d-grid gap-5 kolom-sm-2">
          <Kolom label="Nama lengkap" wajib full hint="Sesuai akta kelahiran.">
            <input value={form.nama} onChange={set('nama')} className={isian} autoComplete="off" />
          </Kolom>
          <Kolom label="Nama panggilan">
            <input value={form.panggilan} onChange={set('panggilan')} className={isian} autoComplete="off" />
          </Kolom>
          <Kolom label="Jenis kelamin" wajib>
            <div className="d-grid kolom-2 gap-2">
              {[
                ['L', 'Laki-laki'],
                ['P', 'Perempuan'],
              ].map(([v, l]) => (
                <button key={v} type="button" aria-pressed={form.jk === v} onClick={() => ubahForm({ jk: v })} className={`min-h-11 ${pilihan(form.jk === v)}`}>
                  {l}
                </button>
              ))}
            </div>
          </Kolom>
          <Kolom label="Tempat lahir" wajib>
            <input value={form.tempatLahir} onChange={set('tempatLahir')} className={isian} />
          </Kolom>
          <Kolom
            label="Tanggal lahir"
            wajib
            hint={usia ? `Usia pada 1 Juli 2027: ${usia.tahun} tahun ${usia.bulan} bulan` : `Minimal ${PPDB.usiaMinimal} tahun pada 1 Juli 2027.`}
          >
            <input type="date" value={form.tanggalLahir} onChange={set('tanggalLahir')} className={isian} />
          </Kolom>
          <Kolom label="NIK anak" wajib hint="16 digit, tertera di Kartu Keluarga.">
            <input
              inputMode="numeric"
              maxLength={16}
              value={form.nik}
              onChange={(e) => ubahForm({ nik: e.target.value.replace(/\D/g, '') })}
              className={`${isian} angka ls-wider`}
            />
          </Kolom>
          <Kolom label="Agama" wajib>
            <select value={form.agama} onChange={set('agama')} className={isianPilih}>
              <option value="">Pilih agama</option>
              {PPDB.agama.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Kolom>
          <Kolom label="Asal TK/PAUD" hint="Kosongkan jika tidak bersekolah TK.">
            <input value={form.asalTk} onChange={set('asalTk')} className={isian} />
          </Kolom>
          <Kolom label="Alamat tempat tinggal" wajib full>
            <textarea rows={2} value={form.alamat} onChange={set('alamat')} className={isian} autoComplete="street-address" />
          </Kolom>
        </div>
      )}

      {langkah === 1 && (
        <div className="d-grid gap-5 kolom-sm-2">
          <Kolom label="Nama ayah">
            <input value={form.namaAyah} onChange={set('namaAyah')} className={isian} />
          </Kolom>
          <Kolom label="Pekerjaan ayah">
            <input value={form.pekerjaanAyah} onChange={set('pekerjaanAyah')} className={isian} />
          </Kolom>
          <Kolom label="Nama ibu">
            <input value={form.namaIbu} onChange={set('namaIbu')} className={isian} />
          </Kolom>
          <Kolom label="Pekerjaan ibu">
            <input value={form.pekerjaanIbu} onChange={set('pekerjaanIbu')} className={isian} />
          </Kolom>
          <Kolom label="No. WhatsApp aktif" wajib hint="Informasi PPDB akan dikirim ke nomor ini.">
            <input type="tel" value={form.whatsapp} onChange={set('whatsapp')} className={isian} placeholder="08xx-xxxx-xxxx" autoComplete="tel" />
          </Kolom>
          <Kolom label="Email">
            <input type="email" value={form.email} onChange={set('email')} className={isian} placeholder="Opsional" autoComplete="email" />
          </Kolom>
          <p className="fs-sm text-tinta-3 rentang-sm-2">Isi minimal satu nama orang tua atau wali.</p>
        </div>
      )}

      {langkah === 2 && (
        <div className="d-flex flex-column gap-7">
          <Kolom label="Jalur pendaftaran" wajib>
            <div className="d-grid gap-2 kolom-sm-3">
              {PPDB.jalur.map((j) => (
                <button
                  key={j.nama}
                  type="button"
                  aria-pressed={form.jalur === j.nama}
                  onClick={() => ubahForm({ jalur: j.nama, infoJalur: '' })}
                  className={`d-block text-start ${pilihan(form.jalur === j.nama)}`}
                >
                  <span className="d-block">{j.nama}</span>
                  <span className={`mt-0-5 d-block fs-sm fw-normal ${form.jalur === j.nama ? 'text-krem' : 'text-tinta-3'}`}>{j.ket}</span>
                </button>
              ))}
            </div>
          </Kolom>

          {form.jalur === 'Saudara Kandung' && (
            <Kolom label="Nama & kelas kakak" wajib>
              <input value={form.infoJalur} onChange={set('infoJalur')} className={isian} placeholder="Contoh: Hafiz Maulana — kelas 4A" />
            </Kolom>
          )}
          {form.jalur === 'Prestasi' && (
            <Kolom label="Prestasi yang pernah diraih" wajib>
              <input value={form.infoJalur} onChange={set('infoJalur')} className={isian} placeholder="Contoh: Juara 1 lomba mewarnai tingkat kota 2026" />
            </Kolom>
          )}

          <div>
            <p className={labelIsian}>Unggah berkas</p>
            <p className="mt-n0-5 mb-3 fs-sm text-tinta-3">Foto/scan yang jelas, format JPG, PNG, atau PDF.</p>
            <ul className="border-top border-garis">
              {berkasDibutuhkan.map((b) => {
                const file = form.berkas[b.id]
                return (
                  <li key={b.id} className="d-flex align-items-center gap-3 border-bottom border-garis py-3">
                    <span
                      className={`d-flex align-items-center justify-content-center ukuran-8 flex-shrink-0 rounded-circle ${file ? 'bg-merah-tua text-white' : 'border border-garis text-tinta-3'}`}
                    >
                      {file ? <Check className="ukuran-4" /> : <FileUp className="ukuran-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="fs-15 fw-semibold">
                        {b.label} {wajibBerkas(b) ? <span className="text-merah-700">*</span> : <span className="fw-normal text-tinta-3">(opsional)</span>}
                      </p>
                      {file && <p className="text-truncate fs-sm text-tinta-2">{file}</p>}
                    </div>
                    <label className="pilih-berkas btn btn-kedua rounded-2 min-h-10 px-3 fs-sm fw-semibold">
                      {file ? 'Ganti' : 'Pilih file'}
                      <span className="visually-hidden"> untuk {b.label}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="visually-hidden"
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
        <div className="position-relative">
          <JebakanBot value={jebakan} onChange={setJebakan} />
          <p className="mb-3 fs-15 text-tinta-2">Periksa kembali data berikut sebelum dikirim.</p>
          <dl className="border-top border-garis">
            {ringkasan.map(([k, v]) => (
              <div key={k} className="baris-ringkasan d-grid gap-1 border-bottom border-garis py-2-5 fs-15">
                <dt className="text-tinta-3">{k}</dt>
                <dd className="fw-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <label className="mt-5 d-flex cursor-pointer align-items-start gap-3 rounded-2 border border-garis bg-kertas p-4 fs-15">
            <input type="checkbox" checked={form.setuju} onChange={(e) => ubahForm({ setuju: e.target.checked })} className="form-check-input mt-0-5 ukuran-5 flex-shrink-0 m-0" />
            Saya menyatakan bahwa data dan berkas yang saya isi adalah benar dan dapat dipertanggungjawabkan.
          </label>
        </div>
      )}

      <div className="mt-8 d-flex gap-3 border-top border-garis pt-6">
        {langkah > 0 && (
          <button type="button" onClick={kembali} className={tombol.kedua}>
            <ArrowLeft className="ukuran-4" /> Kembali
          </button>
        )}
        <button type="button" onClick={lanjut} disabled={mengirim} className={`${tombol.utama} flex-1`}>
          {langkah < 3 ? (
            <>
              Lanjut <ArrowRight className="ukuran-4" />
            </>
          ) : (
            <>
              <Send className="ukuran-4" /> {mengirim ? 'Mengirim...' : 'Kirim Pendaftaran'}
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
      <div>
        <CheckCircle2 className="ukuran-10 text-success" aria-hidden="true" />
        <p className="mt-4 fs-3xl fw-extrabold ls-tight lh-tight">Pendaftaran berhasil dikirim.</p>
        <p className="mt-1 text-tinta-2">Terima kasih telah mendaftarkan {pendaftar.nama}.</p>
      </div>

      <BuktiPendaftaran pendaftar={pendaftar} />

      <div className="mt-8">
        <p className="fs-2xl fw-extrabold ls-tight">Langkah selanjutnya</p>
        <ol className="mt-3 border-top border-garis">
          {[
            'Simpan nomor pendaftaran di atas.',
            `Panitia memeriksa berkas dalam 1–3 hari kerja dan menghubungi Anda lewat WhatsApp ${pendaftar.whatsapp}.`,
            'Pantau status pendaftaran di halaman ini menggunakan nomor pendaftaran dan tanggal lahir anak.',
            `Ikuti observasi sesuai jadwal: ${PPDB.jadwal[1].tanggal}.`,
          ].map((t, i) => (
            <li key={i} className="langkah-lanjut d-grid gap-2 border-bottom border-garis py-3 fs-15 lh-relaxed">
              <span className="angka fs-lg fw-extrabold text-merah-700">{i + 1}.</span>
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
      <div className="area-cetak mt-6 rounded-2 border border-2 border-putus border-tinta border-opacity-50 bg-white p-5 p-sm-6">
        <div className="d-flex align-items-center gap-3 border-bottom border-garis pb-4">
          <img src="/logo.png" alt="" className="ukuran-11 object-fit-contain" />
          <div>
            <p className="fs-xs fw-semibold text-uppercase ls-widest text-merah-700">Bukti Pendaftaran PPDB {PPDB.tahunAjaran}</p>
            <p className="fs-xl fw-extrabold ls-tight">{SEKOLAH.nama}</p>
          </div>
        </div>
        <div className="mt-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <p className="fs-sm text-tinta-3">Nomor pendaftaran</p>
            <p className="angka font-monospace fs-2xl fw-bold ls-wider text-merah-700">{pendaftar.nomor}</p>
          </div>
          <TombolSalin teks={pendaftar.nomor} label="Salin nomor" />
        </div>
        <dl className="bukti-ppdb mt-4 d-grid row-gap-1-5 fs-15">
          <dt className="text-tinta-3">Nama calon siswa</dt>
          <dd className="fw-semibold">{pendaftar.nama}</dd>
          <dt className="text-tinta-3">Tanggal lahir</dt>
          <dd className="fw-semibold">{formatTanggal(pendaftar.tanggalLahir)}</dd>
          <dt className="text-tinta-3">Jalur</dt>
          <dd className="fw-semibold">{pendaftar.jalur}</dd>
          <dt className="text-tinta-3">Tanggal daftar</dt>
          <dd className="fw-semibold">{new Date(pendaftar.dibuat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</dd>
        </dl>
      </div>
      <button type="button" onClick={() => window.print()} className={`${tombol.kedua} mt-3 w-100`}>
        <Printer className="ukuran-4" /> Cetak / Simpan Bukti Pendaftaran
      </button>
    </>
  )
}

// Cek status: nomor pendaftaran + tanggal lahir (agar data tidak bisa dilihat sembarang orang)
export function CekStatusPpdb() {
  const [nomor, setNomor] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [hasil, setHasil] = useState(undefined)
  const [galat, setGalat] = useState('')
  const [batas, setBatas] = useState(0)

  // Dicocokkan di server; dibatasi agar tanggal lahir tidak bisa ditebak berulang-ulang
  const cek = async (e) => {
    e.preventDefault()
    const tunggu = tungguKirim('cek-ppdb', 10, 10)
    setBatas(tunggu)
    setGalat('')
    if (tunggu) return setHasil(undefined)
    catatKirim('cek-ppdb', 10)
    try {
      setHasil((await api('/pendaftar/cek', { method: 'POST', body: { nomor: nomor.trim(), tanggalLahir: tanggal } })).pendaftar)
    } catch (e) {
      setHasil(undefined)
      setGalat(e.message)
    }
  }

  return (
    <div>
      <form onSubmit={cek} className="d-flex flex-column gap-4">
        <div>
          <label htmlFor="cek-nomor" className={labelIsian}>
            Nomor pendaftaran
          </label>
          <input
            id="cek-nomor"
            value={nomor}
            onChange={(e) => setNomor(e.target.value)}
            required
            placeholder="PPDB-2027-0001"
            className={`${isian} font-monospace`}
          />
        </div>
        <div>
          <label htmlFor="cek-lahir" className={labelIsian}>
            Tanggal lahir anak
          </label>
          <input id="cek-lahir" type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required className={isian} />
        </div>
        <button type="submit" className={`${tombol.utama} w-100`}>
          <Search className="ukuran-4" /> Cek Status
        </button>
      </form>
      <div aria-live="polite">
        {batas > 0 && <p className="mt-3 fs-15 text-danger-emphasis">Terlalu banyak pengecekan. Coba lagi dalam {batas} menit.</p>}
        {galat && <p className="mt-3 fs-15 text-danger-emphasis">{galat}</p>}
        {hasil === null && <p className="mt-3 fs-15 text-danger-emphasis">Data tidak ditemukan. Periksa nomor pendaftaran dan tanggal lahir.</p>}
        {hasil && (
          <div className="mt-5 border-top border-garis pt-4 fs-15">
            <div className="d-flex align-items-center justify-content-between gap-2">
              <span className="fw-semibold">{hasil.nama}</span>
              <Badge className={STATUS_PPDB[hasil.status].cls}>{hasil.status}</Badge>
            </div>
            <p className="mt-1 text-tinta-3">
              {hasil.nomor} · Jalur {hasil.jalur}
            </p>
            <p className="mt-2">{STATUS_PPDB[hasil.status].ket}</p>
            {hasil.catatanPanitia && (
              <p className="mt-3 border-start border-2 border-primary ps-3 text-tinta-2">
                <span className="d-block fs-sm text-tinta-3">Catatan panitia</span>
                {hasil.catatanPanitia}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
