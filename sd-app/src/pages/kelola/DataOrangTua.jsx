import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HouseHeart, KeyRound, PhoneOff, Plus, ShieldAlert, UserRoundPlus } from 'lucide-react'
import CrudPage from '../../components/CrudPage'
import ModalAkun, { StatusAkun, TombolAkun } from '../../components/ModalAkun'
import { Badge, StatCard } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { siswaTanpaKeluarga } from '../../utils/ringkasan'

// Nama keluarga untuk ditampilkan: ibu, ayah, atau wali (sama dengan OrangTua::namaKontak di Laravel)
export const namaKeluarga = (k) => k.namaIbu || k.namaAyah || k.namaWali || 'Keluarga'

// Isian "NIS anak" di formulir berupa teks "230401, 230402"; di data berupa larik
const keDaftarNis = (nilai) => (Array.isArray(nilai) ? nilai : String(nilai ?? '').split(/[\s,;]+/)).map((n) => String(n).trim()).filter(Boolean)

export default function DataOrangTua() {
  const { data, buatAkunOrangTua } = useData()
  const [akunUntuk, setAkunUntuk] = useState(null)
  const siswaPerNis = new Map(data.siswa.map((s) => [s.nis, s]))
  const keluarga = data.orangTua ?? []
  const anakDari = (k) => (k.anak ?? []).map((n) => siswaPerNis.get(n)).filter(Boolean)
  const pertama = (k) => anakDari(k)[0]

  const punyaAkun = keluarga.filter((k) => k.akun).length
  const belumGanti = keluarga.filter((k) => k.akun?.wajibGanti).length
  const tanpaWa = keluarga.filter((k) => !k.whatsapp).length
  const dipilih = keluarga.find((k) => k.id === akunUntuk)
  // Siswa yang belum punya data keluarga, mis. siswa baru dari menu Data Siswa (Wakasek Kesiswaan/Tata Usaha)
  const tanpaKeluarga = siswaTanpaKeluarga(data)
  // Tombol "Lengkapi" di beranda membuka halaman ini dengan ?anak=NIS: formulir langsung terbuka berisi NIS itu
  const [params, setParams] = useSearchParams()
  const [tambahAwal, setTambahAwal] = useState(() => (params.get('anak') ? { anak: params.get('anak') } : null))

  useEffect(() => {
    if (params.has('anak')) setParams({}, { replace: true })
  }, [params, setParams])

  return (
    <>
      <CrudPage
        title="Data Orang Tua"
        desc="Data ayah, ibu, atau wali setiap keluarga beserta kontaknya. Kakak-adik cukup satu data keluarga. Orang tua bisa memperbarui kontaknya sendiri dari Portal Orang Tua."
        koleksi="orangTua"
        itemLabel="Data Keluarga"
        tambahAwal={tambahAwal}
        ringkasan={
          <>
            <div className="mb-6 d-grid kolom-2 gap-4 kolom-lg-4">
              <StatCard icon={HouseHeart} label="Keluarga" value={keluarga.length} hint={`${data.siswa.length} siswa`} tone="sky" />
              <StatCard icon={KeyRound} label="Punya akun login" value={punyaAkun} hint={`${keluarga.length - punyaAkun} belum`} tone="emerald" />
              <StatCard icon={ShieldAlert} label="Belum ganti password awal" value={belumGanti} tone="amber" />
              <StatCard icon={PhoneOff} label="Tanpa nomor WhatsApp" value={tanpaWa} tone="primary" />
            </div>
            {tanpaKeluarga.length > 0 && (
              <div className="mb-6 rounded-3 border border-warning-subtle bg-warning-subtle px-5 py-4 text-warning-emphasis">
                <p className="d-flex align-items-center gap-2 fw-bold">
                  <UserRoundPlus className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {tanpaKeluarga.length} siswa belum terhubung dengan data keluarga
                </p>
                <p className="mt-1 fs-sm">
                  Biasanya siswa baru dari menu Data Siswa. Buat data keluarganya agar kontak orang tua tampil untuk wali kelas dan akun Portal Orang Tua
                  bisa dibuat. Jika kakak/adiknya sudah bersekolah di sini, cukup ubah data keluarga itu dan tambahkan NIS-nya.
                </p>
                <div className="mt-3 d-flex flex-wrap gap-2">
                  {tanpaKeluarga.slice(0, 8).map((s) => (
                    <button
                      key={s.nis}
                      type="button"
                      onClick={() => setTambahAwal({ anak: s.nis })}
                      className="d-inline-flex align-items-center gap-1-5 rounded-pill border border-warning-subtle bg-white px-3 py-1-5 fs-sm fw-semibold text-tinta transisi hover-garis-merah"
                    >
                      <Plus className="h-4 w-4 text-primary" aria-hidden="true" />
                      {s.nama} <span className="fw-normal text-tinta-3">· {s.kelas}</span>
                    </button>
                  ))}
                  {tanpaKeluarga.length > 8 && <span className="align-self-center fs-sm">dan {tanpaKeluarga.length - 8} siswa lainnya</span>}
                </div>
              </div>
            )}
          </>
        }
        searchKeys={['namaAyah', 'namaIbu', 'namaWali', 'whatsapp', 'alamat']}
        cariTambahan={(k) => [...anakDari(k).map((s) => `${s.nama} ${s.nis} ${s.kelas}`), k.akun?.username ?? ''].join(' ')}
        namaItem={(k) => `keluarga ${namaKeluarga(k)}`}
        urutkan={(a, b) => (pertama(a)?.kelas ?? 'Z').localeCompare(pertama(b)?.kelas ?? 'Z') || (pertama(a)?.nama ?? '').localeCompare(pertama(b)?.nama ?? '')}
        kosong={{ anak: '', namaAyah: '', pekerjaanAyah: '', namaIbu: '', pekerjaanIbu: '', namaWali: '', hubunganWali: '', whatsapp: '', email: '', alamat: '' }}
        validasi={(form, semua, editId) => {
          const anak = keDaftarNis(form.anak)
          if (!anak.length) return 'Isi minimal satu NIS anak.'
          const asing = anak.find((n) => !siswaPerNis.has(n))
          if (asing) return `NIS ${asing} tidak ditemukan di data siswa.`
          for (const n of anak) {
            const lain = semua.find((k) => k.id !== editId && k.anak?.includes(n))
            if (lain) return `${siswaPerNis.get(n).nama} (${n}) sudah terhubung dengan keluarga ${namaKeluarga(lain)}. Lepaskan dulu dari keluarga itu.`
          }
          if (![form.namaAyah, form.namaIbu, form.namaWali].some((n) => n?.trim())) return 'Isi minimal satu nama: ayah, ibu, atau wali.'
          form.anak = anak
          return null
        }}
        fields={[
          {
            name: 'anak',
            label: 'NIS Anak',
            required: true,
            full: true,
            placeholder: 'Contoh: 230401, 230115',
            hint: 'Siswa di sekolah ini yang termasuk keluarga ini. Kakak-adik: pisahkan NIS dengan koma.',
          },
          { name: 'judul-ayah', label: 'Ayah', type: 'judul' },
          { name: 'namaAyah', label: 'Nama Ayah' },
          { name: 'pekerjaanAyah', label: 'Pekerjaan Ayah' },
          { name: 'judul-ibu', label: 'Ibu', type: 'judul' },
          { name: 'namaIbu', label: 'Nama Ibu' },
          { name: 'pekerjaanIbu', label: 'Pekerjaan Ibu' },
          { name: 'judul-wali', label: 'Wali (bila anak diasuh wali)', type: 'judul' },
          { name: 'namaWali', label: 'Nama Wali' },
          { name: 'hubunganWali', label: 'Hubungan dengan Anak', placeholder: 'Contoh: Kakek, Paman' },
          { name: 'judul-kontak', label: 'Kontak', type: 'judul' },
          { name: 'whatsapp', label: 'Nomor WhatsApp', type: 'tel', placeholder: '08xx-xxxx-xxxx', hint: 'Nomor utama yang dihubungi sekolah.' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'alamat', label: 'Alamat Rumah', full: true },
        ]}
        columns={[
          {
            key: 'keluarga',
            label: 'Orang Tua / Wali',
            render: (k) => (
              <span className="d-block min-w-44">
                {k.namaAyah && <span className="d-block fw-semibold text-tinta">{k.namaAyah}</span>}
                {k.namaIbu && <span className="d-block fw-semibold text-tinta">{k.namaIbu}</span>}
                {k.namaWali && (
                  <span className="d-block fw-semibold text-tinta">
                    {k.namaWali} <span className="fs-xs fw-normal text-tinta-3">({k.hubunganWali || 'wali'})</span>
                  </span>
                )}
              </span>
            ),
          },
          {
            key: 'anak',
            label: 'Anak',
            render: (k) => (
              <span className="d-block antara-y-1">
                {anakDari(k).map((s) => (
                  <span key={s.nis} className="d-flex align-items-center gap-2">
                    <Badge className="bg-merah-50 text-merah-700">{s.kelas}</Badge>
                    <span className="text-tinta-2">{s.nama}</span>
                  </span>
                ))}
                {!anakDari(k).length && <span className="text-abu-400">Belum terhubung</span>}
              </span>
            ),
          },
          { key: 'whatsapp', label: 'WhatsApp', render: (k) => <span className="text-nowrap">{k.whatsapp || '–'}</span> },
          { key: 'alamat', label: 'Alamat', render: (k) => <span className="clamp-2 d-block mw-56 text-tinta-2">{k.alamat || '–'}</span> },
          { key: 'akun', label: 'Akun Login', render: (k) => <StatusAkun akun={k.akun} /> },
        ]}
        aksiBaris={(k) => anakDari(k).length > 0 && <TombolAkun akun={k.akun} nama={`orang tua ${pertama(k).nama}`} onClick={() => setAkunUntuk(k.id)} />}
      />
      <ModalAkun
        pemilik={dipilih ? { id: dipilih.id, nama: `orang tua ${anakDari(dipilih).map((s) => s.nama).join(' & ')}`, akun: dipilih.akun } : null}
        portal="Portal Orang Tua"
        buat={buatAkunOrangTua}
        onTutup={() => setAkunUntuk(null)}
      />
    </>
  )
}
