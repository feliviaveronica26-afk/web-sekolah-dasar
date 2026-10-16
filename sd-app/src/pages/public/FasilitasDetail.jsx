import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import DenahKelas from '../../components/DenahKelas'
import { DenahSekolah, FormKunjungan, IKON_FASILITAS } from '../../components/Fasilitas'
import { Foto, FotoBingkai, Jejak, JudulBagian, PitaMerah, selarasKertas, tombol, wadah } from '../../components/Situs'
import { Modal } from '../../components/ui'
import { FASILITAS } from '../../data/dummy'
import { FOTO_FASILITAS } from '../../data/foto'

// Kotak foto kecil memakai bidang warna berikon sampai ada foto asli tiap sudut fasilitas
const NADA = ['merah', 'tua', 'stabilo']

function Daftar({ judul, isi }) {
  return (
    <div>
      <h3 className="text-2xl">{judul}</h3>
      <ul className="mt-4 space-y-2.5">
        {isi.map((x) => (
          <li key={x} className="flex gap-3 rounded-2xl bg-kartu p-3.5 leading-relaxed ring-1 ring-garis">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" aria-hidden="true" />
            {x}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function FasilitasDetail() {
  const { id } = useParams()
  const [form, setForm] = useState(false)
  const indeks = FASILITAS.findIndex((f) => f.id === id)
  const f = FASILITAS[indeks]

  if (!f) {
    return (
      <section className={`${wadah} py-24`}>
        <h1 className="text-4xl">Fasilitas tidak ditemukan.</h1>
        <p className="mt-3 text-lg text-tinta-2">Tautannya mungkin salah. Silakan kembali ke daftar fasilitas.</p>
        <Link to="/fasilitas" className={`${tombol.utama} mt-8`}>
          Lihat semua fasilitas
        </Link>
      </section>
    )
  }

  const Icon = IKON_FASILITAS[f.ikon]
  const sebelum = FASILITAS[(indeks - 1 + FASILITAS.length) % FASILITAS.length]
  const sesudah = FASILITAS[(indeks + 1) % FASILITAS.length]
  const foto = FOTO_FASILITAS[f.id]

  return (
    <>
      <PitaMerah className="pb-14 pt-8 sm:pt-10 lg:pb-20 lg:pt-12">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Jejak
              daftar={[
                ['/', 'Beranda'],
                ['/fasilitas', 'Fasilitas'],
                [null, f.nama],
              ]}
            />
            <h1 className="mt-6 text-[2.6rem] leading-[1.03] sm:text-6xl lg:text-[4.25rem]">{f.nama}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-krem sm:text-xl">{f.ringkas}</p>
            <dl className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ['Lokasi', f.lokasi],
                ['Jam buka', f.jam],
                ['Kapasitas', f.kapasitas],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-white/10 p-4 ring-1 ring-inset ring-white/10">
                  <dt className="text-sm text-krem">{k}</dt>
                  <dd className="angka mt-1 font-bold leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          {foto ? (
            <FotoBingkai foto={foto} prioritas className="ml-4 lg:ml-0" />
          ) : (
            <div className="ml-4 aspect-[4/3] overflow-hidden rounded-[2rem] lg:ml-0">
              <Foto ikon={Icon} nada="tua" besar />
            </div>
          )}
        </div>
      </PitaMerah>

      <section className={`${wadah} py-14 lg:py-20`}>
        <ul className="grid gap-4 sm:grid-cols-3">
          {f.foto.map((judul, i) => (
            <li key={judul} className={i === 0 ? 'sm:col-span-3 lg:col-span-1' : ''}>
              <span className="block aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                <Foto ikon={Icon} nada={NADA[i % NADA.length]} />
              </span>
              <span className="mt-3 block text-[15px] font-semibold text-tinta-2">{judul}</span>
            </li>
          ))}
        </ul>

        <div className="mt-16 grid gap-14 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
          <div className="min-w-0">
            <h2 className="text-3xl">Tentang {f.nama}</h2>
            <p className="mt-5 text-lg leading-relaxed text-tinta-2 sm:text-xl sm:leading-relaxed">{f.deskripsi}</p>
            <div className="mt-12 grid gap-12 sm:grid-cols-2">
              <Daftar judul="Yang ada di sini" isi={f.fitur} />
              <Daftar judul="Kegiatan rutin" isi={f.kegiatan} />
            </div>

            {/* Navigasi antarfasilitas */}
            <nav aria-label="Fasilitas lain" className="mt-14 grid grid-cols-2 gap-4">
              <Link to={`/fasilitas/${sebelum.id}`} className="group rounded-[1.5rem] bg-kartu p-5 ring-1 ring-garis transition hover:ring-primary-200">
                <span className="flex items-center gap-1 text-sm text-tinta-3">
                  <ArrowLeft className="h-3.5 w-3.5" /> Sebelumnya
                </span>
                <span className="mt-1 block text-lg font-bold group-hover:text-primary-700">{sebelum.nama}</span>
              </Link>
              <Link to={`/fasilitas/${sesudah.id}`} className="group rounded-[1.5rem] bg-kartu p-5 text-right ring-1 ring-garis transition hover:ring-primary-200">
                <span className="flex items-center justify-end gap-1 text-sm text-tinta-3">
                  Berikutnya <ArrowRight className="h-3.5 w-3.5" />
                </span>
                <span className="mt-1 block text-lg font-bold group-hover:text-primary-700">{sesudah.nama}</span>
              </Link>
            </nav>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[2rem] bg-kartu p-5 ring-1 ring-garis sm:p-6">
              <h2 className="text-2xl">Letak di denah</h2>
              <div className="mt-4">
                <DenahSekolah aktif={f.id} kecil />
              </div>
            </div>
            <div className="rounded-[2rem] bg-primary-700 p-6 text-white sm:p-7">
              <p className="text-2xl font-extrabold leading-snug tracking-tight">Lihat {f.nama} secara langsung.</p>
              <p className="mt-2 text-[15px] text-krem">Jadwalkan kunjungan, kami akan mendampingi Anda.</p>
              <button type="button" onClick={() => setForm(true)} className={`${tombol.terang} mt-5 w-full`}>
                Jadwalkan kunjungan
              </button>
            </div>
          </aside>
        </div>
      </section>

      {f.id === 'ruang-kelas' && (
        <section id="denah-kelas" className="scroll-mt-24 bg-kertas-tua/70 py-20">
          <div className={wadah}>
            <JudulBagian
              label="Gedung Utama"
              judul="Denah 18 ruang kelas."
              desc="Gedung Utama khusus siswa: kelas 1 – 3 di lantai 1, kelas 4 – 6 di lantai 2, dengan tangga dan lift."
            />
            <div className={selarasKertas}>
              <DenahKelas />
            </div>
          </div>
        </section>
      )}

      <Modal open={form} onClose={() => setForm(false)} title="Jadwalkan kunjungan sekolah">
        <FormKunjungan key={f.id} fasilitasAwal={[f.id]} />
      </Modal>
    </>
  )
}
