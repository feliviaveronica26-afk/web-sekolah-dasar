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

      <section className={`${wadah} grid items-start gap-12 py-14 lg:grid-cols-[1.6fr_1fr] lg:py-20`}>
        <div className="min-w-0">
          <h2 className="text-3xl sm:text-4xl">Denah sekolah</h2>
          <p className="mb-5 mt-2 text-[15px] text-tinta-2">Klik salah satu area untuk membuka detail fasilitas.</p>
          <DenahSekolah />
          <TautanPanah to="/fasilitas/ruang-kelas#denah-kelas" className="mt-5">
            Lihat denah 18 ruang kelas
          </TautanPanah>
        </div>

        <div id="kunjungan" className="scroll-mt-28 space-y-4 lg:pt-16">
          <div className="rounded-[2rem] bg-primary-700 p-6 text-white sm:p-8">
            <h2 className="text-3xl leading-tight">Ingin melihat langsung?</h2>
            <p className="mt-3 leading-relaxed text-krem">Jadwalkan kunjungan; guru atau staf kami akan mendampingi Anda berkeliling.</p>
            <dl className="mt-5 divide-y divide-white/15 text-[15px]">
              {[
                ['Hari', 'Senin – Jumat, kecuali hari libur'],
                [
                  'Sesi',
                  KUNJUNGAN.sesi.map((s) => (
                    <span key={s} className="block">
                      {s}
                    </span>
                  )),
                ],
                ['Rombongan', `Maksimal ${KUNJUNGAN.maksOrang} orang`],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-3 py-3">
                  <dt className="text-krem">{k}</dt>
                  <dd className="angka font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <button type="button" onClick={() => setForm(true)} className={`${tombol.terang} mt-6 w-full`}>
              Jadwalkan kunjungan
            </button>
          </div>

          <div className="rounded-[2rem] bg-kartu p-6 ring-1 ring-garis sm:p-8">
            <h2 className="text-2xl">Cek status kunjungan</h2>
            <p className="mb-4 mt-2 text-[15px] text-tinta-2">Masukkan kode yang Anda terima saat mendaftar.</p>
            <CekKunjungan />
          </div>
        </div>
      </section>

      <section className="bg-kertas-tua/70 py-20 lg:py-28">
        <div className={wadah}>
          <JudulBagian label="Sarana" judul="Semua fasilitas." desc="Pilih fasilitas untuk melihat kegiatan, jam buka, dan letaknya di denah." />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FASILITAS.map((f, i) => (
              <Muncul as="li" key={f.id} jeda={(i % 4) * 60}>
                <Link to={`/fasilitas/${f.id}`} className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-garis transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgb(68_6_11/0.5)]">
                  <span className="block aspect-[4/3] overflow-hidden">
                    <Foto foto={FOTO_FASILITAS[f.id]} alt="" ikon={IKON_FASILITAS[f.ikon]} nada="merah" className="transition duration-700 group-hover:scale-105" />
                  </span>
                  <span className="block p-5">
                    <span className="block text-lg font-bold group-hover:text-primary-700">{f.nama}</span>
                    <span className="mt-1 block text-[15px] leading-relaxed text-tinta-2">{f.ringkas}</span>
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
