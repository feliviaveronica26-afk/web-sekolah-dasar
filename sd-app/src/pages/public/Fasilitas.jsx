import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CekKunjungan, DenahSekolah, FormKunjungan, IKON_FASILITAS } from '../../components/Fasilitas'
import { Muncul } from '../../components/Hiasan'
import { Foto, JudulBagian, KepalaHalaman, TautanPanah, tombol, wadah } from '../../components/Situs'
import { Modal } from '../../components/ui'
import { FASILITAS, KUNJUNGAN } from '../../data/dummy'
import { FOTO, FOTO_FASILITAS } from '../../data/foto'

export default function Fasilitas() {
  // Tautan /fasilitas#kunjungan (dari beranda/footer) langsung membuka formulir
  const { hash } = useLocation()
  const [form, setForm] = useState(hash === '#kunjungan')

  return (
    <>
      <KepalaHalaman
        jejak="Fasilitas"
        judul="Jelajahi sekolah sebelum berkunjung."
        desc="Klik area pada denah untuk melihat detail setiap fasilitas, lalu jadwalkan kunjungan untuk melihatnya langsung."
        foto={FOTO.perpustakaan}
      />

      <section className={`${wadah} py-14 py-lg-20`}>
        <div className="row gx-0 gy-12 gx-lg-12 align-items-start">
          <div className="col-lg-7 min-w-0">
            <h2 className="fs-3xl fs-sm-4xl">Denah sekolah</h2>
            <p className="mb-5 mt-2 fs-15 text-tinta-2">Klik salah satu area untuk membuka detail fasilitas.</p>
            <DenahSekolah />
            <TautanPanah to="/fasilitas/ruang-kelas#denah-kelas" className="mt-5">
              Lihat denah 18 ruang kelas
            </TautanPanah>
          </div>

          <div id="kunjungan" className="col-lg-5 gulir-mt-28 d-flex flex-column gap-4 pt-lg-16">
            <div className="rounded-5 bg-merah-tua p-6 p-sm-8 text-white">
              <h2 className="fs-3xl lh-tight">Ingin melihat langsung?</h2>
              <p className="mt-3 lh-relaxed text-krem">Jadwalkan kunjungan; guru atau staf kami akan mendampingi Anda berkeliling.</p>
              <dl className="mt-5 pembatas-y pembatas-terang fs-15">
                {[
                  ['Hari', 'Senin – Jumat, kecuali hari libur'],
                  [
                    'Sesi',
                    KUNJUNGAN.sesi.map((s) => (
                      <span key={s} className="d-block">
                        {s}
                      </span>
                    )),
                  ],
                  ['Rombongan', `Maksimal ${KUNJUNGAN.maksOrang} orang`],
                ].map(([k, v]) => (
                  <div key={k} className="info-kunjungan d-grid gap-3 py-3">
                    <dt className="text-krem">{k}</dt>
                    <dd className="angka fw-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <button type="button" onClick={() => setForm(true)} className={`${tombol.terang} mt-6 w-100`}>
                Jadwalkan kunjungan
              </button>
            </div>

            <div className="rounded-5 bg-white p-6 p-sm-8 border border-garis">
              <h2 className="fs-2xl">Cek status kunjungan</h2>
              <p className="mb-4 mt-2 fs-15 text-tinta-2">Masukkan kode yang Anda terima saat mendaftar.</p>
              <CekKunjungan />
            </div>
          </div>
        </div>
      </section>

      <section className="latar-kertas-lembut py-20 py-lg-28">
        <div className={wadah}>
          <JudulBagian label="Sarana" judul="Semua fasilitas." desc="Pilih fasilitas untuk melihat kegiatan, jam buka, dan letaknya di denah." />
          <ul className="d-grid gap-4 kolom-sm-2 kolom-lg-4">
            {FASILITAS.map((f, i) => (
              <Muncul as="li" key={f.id} jeda={(i % 4) * 60}>
                <Link to={`/fasilitas/${f.id}`} className="kartu-zoom hover-angkat d-flex h-100 flex-column overflow-hidden rounded-kartu bg-white border border-garis">
                  <span className="d-block rasio-4x3 overflow-hidden">
                    <Foto foto={FOTO_FASILITAS[f.id]} alt="" ikon={IKON_FASILITAS[f.ikon]} nada="merah" />
                  </span>
                  <span className="d-block p-5">
                    <span className="judul-sorot d-block fs-lg fw-bold">{f.nama}</span>
                    <span className="mt-1 d-block fs-15 lh-relaxed text-tinta-2">{f.ringkas}</span>
                  </span>
                </Link>
              </Muncul>
            ))}
          </ul>
        </div>
      </section>

      <Modal open={form} onClose={() => setForm(false)} title="Jadwalkan kunjungan sekolah">
        <FormKunjungan />
      </Modal>
    </>
  )
}
