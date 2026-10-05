import { Link } from 'react-router-dom'
import { ArrowDown, CheckCircle2, ClipboardList, FileCheck2, MessageCircle, Search, UserCheck, Users } from 'lucide-react'
import { CekStatusPpdb, FormPpdb } from '../../components/Ppdb'
import { Card, PageHeader, SectionTitle, btn } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { PPDB, SEKOLAH } from '../../data/dummy'

const ALUR = [
  { icon: ClipboardList, judul: 'Isi Formulir', desc: 'Lengkapi data calon siswa dan orang tua secara online.' },
  { icon: FileCheck2, judul: 'Unggah Berkas', desc: 'Unggah foto/scan dokumen persyaratan.' },
  { icon: Users, judul: 'Observasi', desc: 'Observasi kesiapan anak & wawancara orang tua.' },
  { icon: UserCheck, judul: 'Daftar Ulang', desc: 'Konfirmasi dan selesaikan administrasi.' },
]

export default function PPDBPage() {
  const { data } = useData()
  const pendaftarJalur = (jalur) => data.pendaftar.filter((p) => p.jalur === jalur && p.status !== 'Tidak Diterima').length

  return (
    <>
      <PageHeader
        title={`PPDB Tahun Ajaran ${PPDB.tahunAjaran}`}
        subtitle="Pendaftaran peserta didik baru SD Harapan Gemilang kini bisa dilakukan langsung secara online."
      />

      <div className="mx-auto -mt-7 max-w-6xl px-4 sm:px-6">
        <a
          href="#daftar"
          className="relative inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-primary-700 shadow-lg ring-1 ring-slate-100 transition hover:bg-primary-50"
        >
          Daftar Sekarang <ArrowDown className="h-4 w-4" />
        </a>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionTitle eyebrow="Langkah Mudah" title="Alur Pendaftaran" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ALUR.map(({ icon: Icon, judul, desc }, i) => (
            <Card key={judul} className="relative p-6">
              <span className="absolute right-5 top-4 text-4xl font-extrabold text-primary-100">{i + 1}</span>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-600 text-white">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">{judul}</h3>
              <p className="mt-1 text-sm text-slate-600">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900">Jadwal Pelaksanaan</h2>
            <ol className="mt-5 space-y-0">
              {PPDB.jadwal.map((j, i) => (
                <li key={j.tahap} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < PPDB.jadwal.length - 1 && <span className="absolute left-[15px] top-8 h-full w-0.5 bg-primary-100" />}
                  <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-600 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{j.tahap}</p>
                    <p className="text-sm text-slate-500">{j.tanggal}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900">Persyaratan</h2>
            <ul className="mt-5 space-y-3">
              {PPDB.syarat.map((s) => (
                <li key={s} className="flex gap-3 text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" /> {s}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionTitle eyebrow="Kuota" title="Jalur Pendaftaran" />
        <div className="grid gap-5 md:grid-cols-3">
          {PPDB.jalur.map((j) => {
            const terisi = pendaftarJalur(j.nama)
            return (
              <Card key={j.nama} className="p-6 text-center">
                <p className="text-sm font-bold uppercase tracking-wider text-primary-600">Jalur {j.nama}</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{j.kuota} kursi</p>
                <p className="mt-2 text-sm text-slate-600">{j.ket}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.min(100, (terisi / j.kuota) * 100)}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">{terisi} pendaftar</p>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Formulir pendaftaran */}
      <section id="daftar" className="scroll-mt-20 bg-slate-50 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_340px]">
          <Card className="p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-wider text-primary-600">Pendaftaran Online</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Formulir Pendaftaran</h2>
            <p className="mb-6 mt-1 text-sm text-slate-500">Siapkan Kartu Keluarga, akta kelahiran, pas foto, dan KTP orang tua. Pengisian sekitar 10 menit.</p>
            <FormPpdb />
          </Card>

          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card className="p-6">
              <h2 className="flex items-center gap-2 font-bold text-slate-900">
                <Search className="h-4 w-4 text-primary-600" /> Cek Status Pendaftaran
              </h2>
              <p className="mb-4 mt-1 text-sm text-slate-500">Sudah mendaftar? Masukkan nomor pendaftaran dan tanggal lahir anak.</p>
              <CekStatusPpdb />
            </Card>
            <Card className="p-6">
              <h2 className="font-bold text-slate-900">Butuh bantuan?</h2>
              <p className="mt-1 text-sm text-slate-600">Panitia PPDB siap membantu pada jam kerja.</p>
              <p className="mt-3 text-sm font-semibold text-slate-800">WhatsApp: {SEKOLAH.whatsapp}</p>
              <Link to="/kontak" className={`${btn.secondary} mt-4 w-full`}>
                <MessageCircle className="h-4 w-4" /> Hubungi Panitia
              </Link>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}
