import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck, Clock, MousePointerClick, Search, Users } from 'lucide-react'
import { CekKunjungan, DenahSekolah, FormKunjungan, IKON_FASILITAS } from '../../components/Fasilitas'
import { Card, Modal, PageHeader, SectionTitle, btn } from '../../components/ui'
import { FASILITAS, KUNJUNGAN } from '../../data/dummy'

export default function Fasilitas() {
  const [form, setForm] = useState(false)

  return (
    <>
      <PageHeader
        title="Fasilitas Sekolah"
        subtitle="Jelajahi setiap sudut SD Harapan Gemilang secara virtual, lalu jadwalkan kunjungan untuk melihatnya langsung."
      />

      {/* Denah interaktif */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <SectionTitle eyebrow="Tur Virtual" title="Denah Sekolah" center={false} />
            <p className="-mt-6 mb-5 flex items-center gap-2 text-sm text-slate-500">
              <MousePointerClick className="h-4 w-4" /> Klik salah satu area untuk melihat detail fasilitas.
            </p>
            <DenahSekolah />
          </div>

          <div className="space-y-5 lg:pt-20">
            <Card className="overflow-hidden">
              <div className="bg-primary-600 p-6 text-white">
                <CalendarCheck className="h-8 w-8" />
                <h2 className="mt-3 text-xl font-extrabold">Ingin melihat langsung?</h2>
                <p className="mt-1 text-sm text-primary-50">Jadwalkan kunjungan ke sekolah, kami akan mendampingi Anda berkeliling.</p>
              </div>
              <div className="space-y-3 p-6 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary-600" /> Senin – Jumat · {KUNJUNGAN.sesi.length} sesi per hari
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary-600" /> Maksimal {KUNJUNGAN.maksOrang} orang per rombongan
                </p>
                <button onClick={() => setForm(true)} className={`${btn.primary} mt-2 w-full py-3`}>
                  Jadwalkan Kunjungan
                </button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="flex items-center gap-2 font-bold text-slate-900">
                <Search className="h-4 w-4 text-primary-600" /> Cek Status Kunjungan
              </h2>
              <p className="mb-3 mt-1 text-sm text-slate-500">Masukkan kode yang Anda terima saat mendaftar.</p>
              <CekKunjungan />
            </Card>
          </div>
        </div>
      </section>

      {/* Daftar fasilitas */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle eyebrow="Sarana" title="Semua Fasilitas" desc="Pilih fasilitas untuk melihat foto, kegiatan, dan informasi lengkapnya." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FASILITAS.map((f) => {
              const Icon = IKON_FASILITAS[f.ikon]
              return (
                <Link
                  key={f.id}
                  to={`/fasilitas/${f.id}`}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-bold text-slate-900">{f.nama}</h3>
                  <p className="mt-1 flex-1 text-sm text-slate-600">{f.ringkas}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
                    Kunjungi <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <Modal open={form} onClose={() => setForm(false)} title="Jadwalkan Kunjungan Sekolah">
        <FormKunjungan />
      </Modal>
    </>
  )
}
