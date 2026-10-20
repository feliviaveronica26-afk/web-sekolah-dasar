import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import DenahKelas from '../../components/DenahKelas'
import { DenahSekolah, FormKunjungan, IKON_FASILITAS } from '../../components/Fasilitas'
import { Muncul, TeksNaik } from '../../components/Hiasan'
import { Foto, FotoBingkai, Jejak, JudulBagian, PitaMerah, selarasKertas, tombol, wadah } from '../../components/Situs'
import { Modal } from '../../components/ui'
import { FASILITAS } from '../../data/dummy'
import { FOTO_FASILITAS } from '../../data/foto'

// Kotak foto kecil memakai bidang warna berikon sampai ada foto asli tiap sudut fasilitas
const NADA = ['merah', 'tua', 'stabilo']

function Daftar({ judul, isi }) {
  return (
    <div>
      <h3 className="fs-2xl">{judul}</h3>
      <ul className="mt-4 d-flex flex-column gap-2-5">
        {isi.map((x) => (
          <li key={x} className="d-flex gap-3 rounded-3 bg-white p-3-5 lh-relaxed border border-garis">
            <CheckCircle2 className="mt-0-5 ukuran-5 flex-shrink-0 text-primary" aria-hidden="true" />
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
        <h1 className="fs-4xl">Fasilitas tidak ditemukan.</h1>
        <p className="mt-3 fs-lg text-tinta-2">Tautannya mungkin salah. Silakan kembali ke daftar fasilitas.</p>
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
      <PitaMerah className="pb-14 pt-8 pt-sm-10 pb-lg-20 pt-lg-12">
        <div className="row gx-0 gy-12 gx-lg-16 align-items-center">
          <div className="col-lg-6">
            <div className="turun-awal">
              <Jejak
                daftar={[
                  ['/', 'Beranda'],
                  ['/fasilitas', 'Fasilitas'],
                  [null, f.nama],
                ]}
              />
            </div>
            <h1 className="judul-halaman mt-6" style={{ '--tunda-teks': '120ms' }}>
              <TeksNaik teks={f.nama} />
            </h1>
            <p className="masuk-awal mt-5 mw-2xl fs-lg fs-sm-xl lh-relaxed text-krem" style={{ '--tunda': '380ms' }}>
              {f.ringkas}
            </p>
            <Muncul as="dl" gaya="bertahap" jeda={450} className="mt-8 d-grid gap-3 kolom-sm-3">
              {[
                ['Lokasi', f.lokasi],
                ['Jam buka', f.jam],
                ['Kapasitas', f.kapasitas],
              ].map(([k, v]) => (
                <div key={k} className="rounded-3 bg-white bg-opacity-10 p-4 border border-white border-opacity-10">
                  <dt className="fs-sm text-krem">{k}</dt>
                  <dd className="angka mt-1 fw-bold lh-snug">{v}</dd>
                </div>
              ))}
            </Muncul>
          </div>
          <div className="col-lg-6">
            {foto ? (
              <FotoBingkai foto={foto} prioritas className="ms-4 ms-lg-0" />
            ) : (
              <div className="tirai-awal ms-4 ms-lg-0 rasio-4x3 overflow-hidden rounded-5" style={{ '--tunda': '200ms', '--sudut-tirai': '2rem' }}>
                <Foto ikon={Icon} nada="tua" besar />
              </div>
            )}
          </div>
        </div>
      </PitaMerah>

      <section className={`${wadah} py-14 py-lg-20`}>
        <ul className="d-grid gap-4 kolom-sm-3">
          {f.foto.map((judul, i) => (
            <li key={judul} className={i === 0 ? 'rentang-sm-3 rentang-lg-1' : ''}>
              <span className="d-block rasio-4x3 overflow-hidden rounded-4">
                <Foto ikon={Icon} nada={NADA[i % NADA.length]} />
              </span>
              <span className="mt-3 d-block fs-15 fw-semibold text-tinta-2">{judul}</span>
            </li>
          ))}
        </ul>

        <div className="mt-16 row gx-0 gy-14 gx-lg-16">
          <div className="col-lg-8 min-w-0">
            <h2 className="fs-3xl">Tentang {f.nama}</h2>
            <p className="mt-5 fs-lg fs-sm-xl lh-relaxed text-tinta-2">{f.deskripsi}</p>
            <div className="mt-12 d-grid gap-12 kolom-sm-2">
              <Daftar judul="Yang ada di sini" isi={f.fitur} />
              <Daftar judul="Kegiatan rutin" isi={f.kegiatan} />
            </div>

            {/* Navigasi antarfasilitas */}
            <nav aria-label="Fasilitas lain" className="mt-14 d-grid kolom-2 gap-4">
              <Link to={`/fasilitas/${sebelum.id}`} className="kartu-zoom rounded-4 bg-white p-5 border border-garis transisi hover-garis-merah">
                <span className="d-flex align-items-center gap-1 fs-sm text-tinta-3">
                  <ArrowLeft className="ukuran-3-5" /> Sebelumnya
                </span>
                <span className="judul-sorot mt-1 d-block fs-lg fw-bold">{sebelum.nama}</span>
              </Link>
              <Link to={`/fasilitas/${sesudah.id}`} className="kartu-zoom rounded-4 bg-white p-5 text-end border border-garis transisi hover-garis-merah">
                <span className="d-flex align-items-center justify-content-end gap-1 fs-sm text-tinta-3">
                  Berikutnya <ArrowRight className="ukuran-3-5" />
                </span>
                <span className="judul-sorot mt-1 d-block fs-lg fw-bold">{sesudah.nama}</span>
              </Link>
            </nav>
          </div>

          <div className="col-lg-4">
            <aside className="d-flex flex-column gap-4 position-lg-sticky top-lg-28">
              <div className="rounded-5 bg-white p-5 p-sm-6 border border-garis">
                <h2 className="fs-2xl">Letak di denah</h2>
                <div className="mt-4">
                  <DenahSekolah aktif={f.id} kecil />
                </div>
              </div>
              <div className="rounded-5 bg-merah-tua p-6 p-sm-7 text-white">
                <p className="fs-2xl fw-extrabold lh-snug ls-tight">Lihat {f.nama} secara langsung.</p>
                <p className="mt-2 fs-15 text-krem">Jadwalkan kunjungan, kami akan mendampingi Anda.</p>
                <button type="button" onClick={() => setForm(true)} className={`${tombol.terang} mt-5 w-100`}>
                  Jadwalkan kunjungan
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {f.id === 'ruang-kelas' && (
        <section id="denah-kelas" className="gulir-mt-24 latar-kertas-lembut py-20">
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
