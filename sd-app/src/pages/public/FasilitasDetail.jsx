import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CalendarCheck, CheckCircle2, Clock, MapPin, Sparkles, Users } from 'lucide-react'
import { DenahSekolah, FormKunjungan, IKON_FASILITAS } from '../../components/Fasilitas'
import { Card, EmptyState, Modal, btn } from '../../components/ui'
import { FASILITAS } from '../../data/dummy'

// Sementara memakai ilustrasi. Ganti dengan foto asli di folder public/fasilitas/
const GRADASI = ['from-primary-500 to-primary-700', 'from-rose-400 to-primary-600', 'from-primary-600 to-primary-900']

export default function FasilitasDetail() {
  const { id } = useParams()
  const [form, setForm] = useState(false)
  const indeks = FASILITAS.findIndex((f) => f.id === id)
  const f = FASILITAS[indeks]

  if (!f) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Fasilitas tidak ditemukan" desc="Silakan kembali ke halaman fasilitas." />
        <div className="text-center">
          <Link to="/fasilitas" className={btn.primary}>
            Lihat Semua Fasilitas
          </Link>
        </div>
      </section>
    )
  }

  const Icon = IKON_FASILITAS[f.ikon]
  const sebelum = FASILITAS[(indeks - 1 + FASILITAS.length) % FASILITAS.length]
  const sesudah = FASILITAS[(indeks + 1) % FASILITAS.length]

  return (
    <>
      <section className="relative overflow-hidden bg-primary-600 text-white">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <Icon className="absolute -bottom-6 right-6 h-48 w-48 text-white/10" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <Link to="/fasilitas" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-100 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Semua fasilitas
          </Link>
          <div className="mt-5 flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-primary-600">
              <Icon className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{f.nama}</h1>
              <p className="mt-1 text-primary-50">{f.ringkas}</p>
            </div>
          </div>
        </div>
        <div className="stripe-merah-putih h-2" />
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          {/* Galeri */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {f.foto.map((judul, i) => (
              <div
                key={judul}
                className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-linear-to-br ${GRADASI[i % GRADASI.length]} ${i === 0 ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <Icon className="absolute right-3 top-3 h-12 w-12 text-white/25" />
                <p className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/50 to-transparent p-3 text-sm font-semibold text-white">{judul}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-10 text-xl font-extrabold text-slate-900">Tentang {f.nama}</h2>
          <p className="mt-3 leading-relaxed text-slate-700">{f.deskripsi}</p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Card className="p-6">
              <h3 className="flex items-center gap-2 font-bold text-slate-900">
                <CheckCircle2 className="h-5 w-5 text-primary-600" /> Yang ada di sini
              </h3>
              <ul className="mt-4 space-y-2.5">
                {f.fitur.map((x) => (
                  <li key={x} className="flex gap-2.5 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" /> {x}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="flex items-center gap-2 font-bold text-slate-900">
                <Sparkles className="h-5 w-5 text-primary-600" /> Kegiatan rutin
              </h3>
              <ul className="mt-4 space-y-2.5">
                {f.kegiatan.map((x) => (
                  <li key={x} className="flex gap-2.5 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" /> {x}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Navigasi antarfasilitas */}
          <div className="mt-10 grid grid-cols-2 gap-3 border-t border-slate-200 pt-6">
            <Link to={`/fasilitas/${sebelum.id}`} className="rounded-2xl p-4 transition hover:bg-slate-50">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <ArrowLeft className="h-3.5 w-3.5" /> Sebelumnya
              </span>
              <span className="mt-1 block font-bold text-slate-800">{sebelum.nama}</span>
            </Link>
            <Link to={`/fasilitas/${sesudah.id}`} className="rounded-2xl p-4 text-right transition hover:bg-slate-50">
              <span className="flex items-center justify-end gap-1 text-xs text-slate-500">
                Berikutnya <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="mt-1 block font-bold text-slate-800">{sesudah.nama}</span>
            </Link>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="divide-y divide-slate-100">
            {[
              [MapPin, 'Lokasi', f.lokasi],
              [Clock, 'Jam buka', f.jam],
              [Users, 'Kapasitas', f.kapasitas],
            ].map(([Ikon, label, nilai]) => (
              <div key={label} className="flex gap-3 p-4">
                <Ikon className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="font-semibold text-slate-800">{nilai}</p>
                </div>
              </div>
            ))}
          </Card>

          <Card className="p-5 text-center">
            <CalendarCheck className="mx-auto h-8 w-8 text-primary-600" />
            <p className="mt-2 font-bold text-slate-900">Lihat {f.nama} secara langsung</p>
            <p className="mt-1 text-sm text-slate-500">Jadwalkan kunjungan, kami akan mendampingi Anda.</p>
            <button onClick={() => setForm(true)} className={`${btn.primary} mt-4 w-full`}>
              Jadwalkan Kunjungan
            </button>
          </Card>

          <Card className="p-4">
            <p className="mb-3 text-sm font-bold text-slate-700">Letak di denah sekolah</p>
            <DenahSekolah aktif={f.id} kecil />
          </Card>
        </aside>
      </section>

      <Modal open={form} onClose={() => setForm(false)} title="Jadwalkan Kunjungan Sekolah">
        <FormKunjungan key={f.id} fasilitasAwal={[f.id]} />
      </Modal>
    </>
  )
}
