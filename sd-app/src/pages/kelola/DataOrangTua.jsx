import { useState } from 'react'
import { HouseHeart, KeyRound, PhoneOff, ShieldAlert } from 'lucide-react'
import CrudPage from '../../components/CrudPage'
import ModalAkun, { StatusAkun, TombolAkun } from '../../components/ModalAkun'
import { Badge, StatCard } from '../../components/ui'
import { useData } from '../../context/DataContext'

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

  return (
    <>
      <CrudPage
        title="Data Orang Tua"
        desc="Data ayah, ibu, atau wali setiap keluarga beserta kontaknya. Kakak-adik cukup satu data keluarga. Orang tua bisa memperbarui kontaknya sendiri dari Portal Orang Tua."
        koleksi="orangTua"
        itemLabel="Data Keluarga"
        ringkasan={
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={HouseHeart} label="Keluarga" value={keluarga.length} hint={`${data.siswa.length} siswa`} tone="sky" />
            <StatCard icon={KeyRound} label="Punya akun login" value={punyaAkun} hint={`${keluarga.length - punyaAkun} belum`} tone="emerald" />
            <StatCard icon={ShieldAlert} label="Belum ganti password awal" value={belumGanti} tone="amber" />
            <StatCard icon={PhoneOff} label="Tanpa nomor WhatsApp" value={tanpaWa} tone="primary" />
          </div>
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
              <span className="block min-w-44">
                {k.namaAyah && <span className="block font-semibold text-slate-800">{k.namaAyah}</span>}
                {k.namaIbu && <span className="block font-semibold text-slate-800">{k.namaIbu}</span>}
                {k.namaWali && (
                  <span className="block font-semibold text-slate-800">
                    {k.namaWali} <span className="text-xs font-normal text-slate-500">({k.hubunganWali || 'wali'})</span>
                  </span>
                )}
              </span>
            ),
          },
          {
            key: 'anak',
            label: 'Anak',
            render: (k) => (
              <span className="block space-y-1">
                {anakDari(k).map((s) => (
                  <span key={s.nis} className="flex items-center gap-2">
                    <Badge className="bg-primary-50 text-primary-700">{s.kelas}</Badge>
                    <span className="text-slate-700">{s.nama}</span>
                  </span>
                ))}
                {!anakDari(k).length && <span className="text-slate-400">Belum terhubung</span>}
              </span>
            ),
          },
          { key: 'whatsapp', label: 'WhatsApp', render: (k) => <span className="whitespace-nowrap">{k.whatsapp || '–'}</span> },
          { key: 'alamat', label: 'Alamat', render: (k) => <span className="line-clamp-2 block max-w-56 text-slate-600">{k.alamat || '–'}</span> },
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
