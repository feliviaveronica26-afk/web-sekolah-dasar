import { useState } from 'react'
import { Briefcase, HouseHeart, Mail, MapPin, Pencil, Phone, UserRound } from 'lucide-react'
import { Alert, Avatar, Badge, Card, DashHeader, EmptyState, JudulKartu, Modal, btn, inputCls, labelCls } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { adaBiodata, teksLahir } from '../../utils/siswa'

// Kolom yang boleh diubah orang tua sendiri (sama dengan OrangTua::KONTAK di Laravel)
const ISIAN_KONTAK = [
  { name: 'whatsapp', label: 'Nomor WhatsApp', type: 'tel', hint: 'Nomor ini yang dihubungi sekolah, mis. saat anak sakit atau ada pengumuman penting.' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'alamat', label: 'Alamat Rumah', full: true },
  { name: 'pekerjaanAyah', label: 'Pekerjaan Ayah' },
  { name: 'pekerjaanIbu', label: 'Pekerjaan Ibu' },
]

function Baris({ icon: Icon, label, nilai }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`font-semibold ${nilai ? 'text-slate-800' : 'text-slate-400'}`}>{nilai || 'Belum diisi'}</p>
      </div>
    </div>
  )
}

export default function OrtuKeluarga() {
  const { user } = useAuth()
  const { data, ubah, beritahu } = useData()
  const [form, setForm] = useState(null)
  const [galat, setGalat] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)
  const keluarga = (data.orangTua ?? []).find((k) => k.anak?.includes(user.anakNis))

  if (!keluarga) {
    return (
      <>
        <DashHeader title="Data Keluarga" desc="Data orang tua/wali yang tercatat di sekolah." />
        <Card>
          <EmptyState icon={HouseHeart} title="Data keluarga belum tersedia" desc="Sekolah belum mencatat data keluarga Anda. Silakan hubungi Tata Usaha." />
        </Card>
      </>
    )
  }

  const anak = keluarga.anak.map((n) => data.siswa.find((s) => s.nis === n)).filter(Boolean)
  const buka = () => {
    setForm(Object.fromEntries(ISIAN_KONTAK.map((f) => [f.name, keluarga[f.name] ?? ''])))
    setGalat('')
  }
  const simpan = async (e) => {
    e.preventDefault()
    if (menyimpan) return
    setMenyimpan(true)
    const pesan = await ubah('orangTua', keluarga.id, form, { diam: true })
    setMenyimpan(false)
    if (pesan) return setGalat(pesan)
    setForm(null)
    beritahu('Kontak keluarga sudah diperbarui.')
  }

  const orang = [
    ['Ayah', keluarga.namaAyah, keluarga.pekerjaanAyah],
    ['Ibu', keluarga.namaIbu, keluarga.pekerjaanIbu],
    ...(keluarga.namaWali ? [[`Wali (${keluarga.hubunganWali || 'wali'})`, keluarga.namaWali, '']] : []),
  ]

  return (
    <>
      <DashHeader
        title="Data Keluarga"
        desc="Data orang tua/wali yang tercatat di sekolah. Pastikan nomor WhatsApp selalu aktif agar sekolah mudah menghubungi Anda."
        action={
          <button onClick={buka} className={btn.primary}>
            <Pencil className="h-4 w-4" /> Perbarui Kontak
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <JudulKartu icon={UserRound} judul="Orang tua / wali" />
          <div className="divide-y divide-slate-100">
            {orang.map(([peran, nama, kerja]) => (
              <div key={peran} className="flex items-center gap-3 py-3">
                <Avatar nama={nama || peran} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">{peran}</p>
                  <p className={`font-semibold ${nama ? 'text-slate-800' : 'text-slate-400'}`}>{nama || 'Belum diisi'}</p>
                </div>
                {kerja && (
                  <span className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Briefcase className="h-3.5 w-3.5" /> {kerja}
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">Nama orang tua dan data anak diubah oleh Tata Usaha. Hubungi Tata Usaha bila ada yang keliru.</p>
        </Card>

        <Card className="p-6">
          <JudulKartu icon={Phone} judul="Kontak & alamat" />
          <div className="divide-y divide-slate-100">
            <Baris icon={Phone} label="WhatsApp" nilai={keluarga.whatsapp} />
            <Baris icon={Mail} label="Email" nilai={keluarga.email} />
            <Baris icon={MapPin} label="Alamat rumah" nilai={keluarga.alamat} />
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <JudulKartu icon={HouseHeart} judul={anak.length > 1 ? 'Anak yang bersekolah di sini' : 'Ananda'} />
          <ul className="grid gap-3 sm:grid-cols-2">
            {anak.map((s) => (
              <li key={s.nis} className="rounded-2xl border border-slate-100 p-3">
                <div className="flex items-center gap-3">
                  <Avatar nama={s.nama} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800">{s.nama}</p>
                    <p className="text-xs text-slate-500">NIS {s.nis}</p>
                  </div>
                  <Badge className="ml-auto bg-primary-50 text-primary-700">Kelas {s.kelas}</Badge>
                </div>
                {adaBiodata(s) && (
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-sm">
                    {[
                      ['NISN', s.nisn],
                      ['Tempat, tanggal lahir', teksLahir(s)],
                      ['Agama', s.agama],
                      ['Golongan darah', s.golonganDarah],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-xs text-slate-500">{k}</dt>
                        <dd className={`font-semibold ${v ? 'text-slate-800' : 'text-slate-400'}`}>{v || 'Belum diisi'}</dd>
                      </div>
                    ))}
                    <div className="col-span-2">
                      <dt className="text-xs text-slate-500">Catatan kesehatan untuk guru</dt>
                      <dd className={`font-semibold ${s.catatanKesehatan ? 'text-amber-800' : 'text-slate-400'}`}>{s.catatanKesehatan || 'Tidak ada'}</dd>
                    </div>
                  </dl>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            Biodata dan catatan kesehatan Ananda dicatat Tata Usaha dan hanya terlihat oleh wali kelas, pengelola data siswa, dan keluarga. Hubungi Tata Usaha
            bila ada yang perlu diperbarui, mis. alergi baru.
          </p>
        </Card>
      </div>

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title="Perbarui Kontak Keluarga"
        footer={
          <>
            <button type="button" onClick={() => setForm(null)} className={btn.secondary}>
              Batal
            </button>
            <button type="submit" form="form-keluarga" disabled={menyimpan} className={`${btn.primary} disabled:opacity-60`}>
              {menyimpan ? 'Menyimpan…' : 'Simpan'}
            </button>
          </>
        }
      >
        {form && (
          <form id="form-keluarga" onSubmit={simpan} className="grid gap-4 sm:grid-cols-2">
            {galat && (
              <div className="sm:col-span-2">
                <Alert tone="error">{galat}</Alert>
              </div>
            )}
            {ISIAN_KONTAK.map((f) => (
              <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
                <label htmlFor={`keluarga-${f.name}`} className={labelCls}>
                  {f.label}
                </label>
                <input
                  id={`keluarga-${f.name}`}
                  type={f.type ?? 'text'}
                  value={form[f.name]}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  className={inputCls}
                />
                {f.hint && <p className="mt-1.5 text-xs text-slate-500">{f.hint}</p>}
              </div>
            ))}
          </form>
        )}
      </Modal>
    </>
  )
}
