import { CalendarClock, ClipboardList, PartyPopper } from 'lucide-react'
import CrudPage from '../../components/CrudPage'
import { Badge, EmptyState, Progres, StatCard } from '../../components/ui'
import { useLingkup } from '../../context/akses'
import { useData } from '../../context/DataContext'
import { MAPEL } from '../../data/dummy'
import { formatTanggal, selisihHari, tambahHari, todayKey } from '../../utils/format'
import { infoTenggat } from '../siswa/helpers'

export default function TugasKelas() {
  const { data } = useData()
  const L = useLingkup('tugas')
  const hariIni = todayKey()

  if (!L.daftarKelas.length) return <EmptyState icon={ClipboardList} title="Belum ada kelas" desc="Anda belum memiliki kelas atau mapel untuk diberi tugas." />

  const boleh = (t) => L.daftarKelas.includes(t.kelas) && L.mapel(t.kelas).includes(t.mapel)
  const milik = data.tugas.filter(boleh)
  const semuaMapel = [...new Set(L.daftarKelas.flatMap((k) => L.mapel(k)))]

  // Berapa siswa di kelas tersebut yang sudah menandai tugas selesai
  const progres = (t) => {
    const siswa = data.siswa.filter((s) => s.kelas === t.kelas)
    const selesai = siswa.filter((s) => (data.tugasSelesai[s.nis] ?? []).includes(t.id)).length
    return { selesai, total: siswa.length, persen: siswa.length ? Math.round((selesai / siswa.length) * 100) : 0 }
  }
  const aktif = milik.filter((t) => t.tenggat >= hariIni)
  const pekanIni = aktif.filter((t) => selisihHari(hariIni, t.tenggat) <= 7)
  const rataSelesai = milik.length ? Math.round(milik.reduce((a, t) => a + progres(t).persen, 0) / milik.length) : 0

  return (
    <CrudPage
      title="Tugas Kelas"
      desc="Buat tugas dan PR. Tugas langsung muncul di Portal Siswa dan Portal Orang Tua."
      ringkasan={
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard icon={ClipboardList} label="Tugas aktif" value={aktif.length} hint={`dari ${milik.length} tugas`} tone="sky" />
          <StatCard icon={CalendarClock} label="Tenggat 7 hari ke depan" value={pekanIni.length} tone="amber" />
          <div className="col-span-2 lg:col-span-1">
            <StatCard icon={PartyPopper} label="Rata-rata penyelesaian" value={`${rataSelesai}%`} hint="ditandai selesai oleh siswa" tone="emerald" />
          </div>
        </div>
      }
      koleksi="tugas"
      itemLabel="Tugas"
      saring={boleh}
      searchKeys={['judul', 'deskripsi', 'kelas']}
      filter={L.daftarKelas.length > 1 ? { key: 'kelas', label: 'Kelas', options: L.daftarKelas } : undefined}
      kosong={{ kelas: L.daftarKelas[0], mapel: '', judul: '', deskripsi: '', diberikan: hariIni, tenggat: tambahHari(hariIni, 3) }}
      urutkan={(a, b) => (a.tenggat < hariIni) - (b.tenggat < hariIni) || a.tenggat.localeCompare(b.tenggat)}
      validasi={(form) => {
        if (!L.mapel(form.kelas).includes(form.mapel)) return `Anda tidak mengampu ${MAPEL[form.mapel]?.nama ?? 'mapel ini'} di kelas ${form.kelas}.`
        if (form.tenggat < form.diberikan) return 'Tanggal pengumpulan tidak boleh sebelum tanggal diberikan.'
        return null
      }}
      fields={[
        { name: 'kelas', label: 'Kelas', type: 'select', options: L.daftarKelas, required: true },
        { name: 'mapel', label: 'Mata Pelajaran', type: 'select', options: semuaMapel.map((m) => ({ value: m, label: MAPEL[m].nama })), required: true },
        { name: 'judul', label: 'Judul Tugas', required: true, full: true, placeholder: 'Contoh: Latihan Soal Pecahan' },
        { name: 'deskripsi', label: 'Petunjuk', type: 'textarea', required: true, placeholder: 'Jelaskan apa yang harus dikerjakan siswa...' },
        { name: 'diberikan', label: 'Tanggal Diberikan', type: 'date', required: true },
        { name: 'tenggat', label: 'Dikumpulkan', type: 'date', required: true },
      ]}
      columns={[
        {
          key: 'judul',
          label: 'Tugas',
          render: (t) => (
            <span className="block max-w-xs">
              <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${MAPEL[t.mapel]?.warna}`}>{MAPEL[t.mapel]?.nama}</span>
              <span className="mt-1 block font-semibold text-slate-800">{t.judul}</span>
            </span>
          ),
        },
        { key: 'kelas', label: 'Kelas' },
        {
          key: 'tenggat',
          label: 'Dikumpulkan',
          render: (t) => {
            const info = infoTenggat(t.tenggat)
            return (
              <span>
                <span className="block text-slate-700">{formatTanggal(t.tenggat, { year: undefined })}</span>
                <Badge className={t.tenggat < hariIni ? 'bg-slate-100 text-slate-500' : info.cls}>{t.tenggat < hariIni ? 'Ditutup' : info.teks}</Badge>
              </span>
            )
          },
        },
        {
          key: 'progres',
          label: 'Selesai',
          render: (t) => {
            const p = progres(t)
            return (
              <span className="block w-32">
                <span className="text-xs font-semibold text-slate-600">
                  {p.selesai}/{p.total} siswa
                </span>
                <Progres nilai={p.persen} warna="bg-emerald-500" tinggi="h-1.5" className="mt-1" />
              </span>
            )
          },
        },
      ]}
    />
  )
}
