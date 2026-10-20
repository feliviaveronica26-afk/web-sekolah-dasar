import { Link } from 'react-router-dom'
import { CheckCircle2, FileCheck2, HandCoins } from 'lucide-react'
import Faq from '../../components/Faq'
import { Muncul, TeksNaik } from '../../components/Hiasan'
import { CekStatusPpdb, FormPpdb } from '../../components/Ppdb'
import { FotoBingkai, Jejak, JudulBagian, Label, PitaMerah, TautanPanah, tombol, wadah } from '../../components/Situs'
import { useData } from '../../context/DataContext'
import { BIAYA, PPDB, SEKOLAH } from '../../data/dummy'
import { FOTO } from '../../data/foto'
import { rupiah } from '../../utils/spp'

const ALUR = [
  { judul: 'Isi formulir', desc: 'Lengkapi data calon siswa dan orang tua secara online, sekitar 10 menit.' },
  { judul: 'Unggah berkas', desc: 'Foto atau scan akta kelahiran, KK, pas foto, dan KTP orang tua.' },
  { judul: 'Observasi', desc: 'Observasi kesiapan anak yang santai dan wawancara orang tua. Tanpa tes calistung.' },
  { judul: 'Daftar ulang', desc: 'Konfirmasi penerimaan dan selesaikan administrasi.' },
]

const totalTahunPertama = BIAYA.rincian.reduce((a, b) => a + (b.nama === 'SPP bulanan' ? b.nominal * 12 : b.nominal), 0)

export default function PPDBPage() {
  const { data } = useData()
  const pendaftarJalur = (jalur) => data.pendaftar.filter((p) => p.jalur === jalur && p.status !== 'Tidak Diterima').length

  return (
    <>
      <PitaMerah className="pb-14 pt-8 pt-sm-10 pb-lg-20 pt-lg-12">
        <div className="row gx-0 gy-12 gx-lg-16 align-items-center">
          <div className="col-lg-7">
            <div className="turun-awal">
              <Jejak
                daftar={[
                  ['/', 'Beranda'],
                  [null, `PPDB ${PPDB.tahunAjaran}`],
                ]}
              />
            </div>
            <h1 className="judul-halaman mt-6 mw-4xl" style={{ '--tunda-teks': '120ms' }}>
              <TeksNaik teks="Penerimaan siswa baru tahun ajaran" />{' '}
              <span className="angka text-stabilo">
                <TeksNaik teks={PPDB.tahunAjaran} mulai={5} />
              </span>
              <span aria-hidden="true" className="kata-naik" style={{ '--urut': 6 }}>
                .
              </span>
            </h1>
            <p className="masuk-awal mt-6 mw-2xl fs-lg fs-sm-xl lh-relaxed text-krem" style={{ '--tunda': '520ms' }}>
              Pendaftaran untuk kelas 1 dilakukan online, kapan saja dan di mana saja. Tidak ada tes membaca, menulis, dan berhitung.
            </p>
            <div className="masuk-awal mt-9 d-flex flex-wrap align-items-center column-gap-6 row-gap-3" style={{ '--tunda': '620ms' }}>
              <a href="#daftar" className={tombol.terang}>
                Daftar sekarang
              </a>
              <a href="#biaya" className={tombol.garisTerang}>
                Lihat rincian biaya
              </a>
              <TautanPanah href="#cek-status" terang>
                Cek status pendaftaran
              </TautanPanah>
            </div>
          </div>
          <div className="col-lg-5">
            <FotoBingkai foto={FOTO.siswi} prioritas className="ms-4 ms-lg-0" />
          </div>
        </div>

        {/* Jadwal pelaksanaan */}
        <ol className="mt-16 d-grid gap-3 kolom-sm-2 kolom-lg-4">
          {PPDB.jadwal.map((j, i) => (
            <li key={j.tahap} className="d-flex gap-4 rounded-4 bg-white bg-opacity-7 p-5 border border-white border-opacity-10">
              <span className="angka d-flex align-items-center justify-content-center ukuran-10 flex-shrink-0 rounded-circle bg-stabilo fw-extrabold text-tinta">{i + 1}</span>
              <span>
                <span className="d-block fs-lg fw-bold lh-snug">{j.tahap}</span>
                <span className="angka mt-0-5 d-block fs-15 text-krem">{j.tanggal}</span>
              </span>
            </li>
          ))}
        </ol>
      </PitaMerah>

      {/* Alur & persyaratan */}
      <section className={`${wadah} py-20 py-lg-28`}>
        <div className="row gx-0 gy-16 gx-lg-16">
          <div className="col-lg-7">
            <JudulBagian label="Langkah mudah" judul="Alur pendaftaran." className="mb-10" />
            <ol className="d-grid gap-4 kolom-sm-2">
              {ALUR.map((a, i) => (
                <Muncul as="li" key={a.judul} jeda={i * 70} className="rounded-kartu bg-white p-6 p-sm-7 border border-garis">
                  <span className="angka d-flex align-items-center justify-content-center ukuran-12 rounded-3 bg-primary fs-xl fw-extrabold text-white">{i + 1}</span>
                  <span className="mt-5 d-block fs-xl fw-bold">{a.judul}</span>
                  <span className="mt-1-5 d-block lh-relaxed text-tinta-2">{a.desc}</span>
                </Muncul>
              ))}
            </ol>
          </div>
          <div className="col-lg-5">
            <div className="rounded-5 bg-tinta p-7 p-sm-9 text-white mt-lg-24">
              <span className="d-flex align-items-center justify-content-center ukuran-12 rounded-3 bg-stabilo text-tinta">
                <FileCheck2 className="ukuran-6" aria-hidden="true" />
              </span>
              <h2 className="mt-5 fs-3xl">Persyaratan</h2>
              <p className="mt-2 fs-15 text-white text-opacity-70">Siapkan sebelum mengisi formulir.</p>
              <ul className="mt-6 d-flex flex-column gap-3">
                {PPDB.syarat.map((s) => (
                  <li key={s} className="d-flex gap-3 lh-relaxed">
                    <CheckCircle2 className="mt-0-5 ukuran-5 flex-shrink-0 text-stabilo" aria-hidden="true" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Jalur & kuota */}
      <section className="latar-kertas-lembut py-20 py-lg-28">
        <div className={wadah}>
          <JudulBagian label="Kuota" judul="Jalur pendaftaran." desc="Kuota dihitung dari pendaftar yang masih dalam proses atau sudah diterima." />
          <ul className="d-grid gap-4 kolom-md-3">
            {PPDB.jalur.map((j) => {
              const terisi = pendaftarJalur(j.nama)
              return (
                <li key={j.nama} className="rounded-kartu bg-white p-7 border border-garis">
                  <p className="fs-2xl fw-extrabold ls-tight">Jalur {j.nama}</p>
                  <p className="mt-2 lh-relaxed text-tinta-2">{j.ket}</p>
                  <p className="angka mt-6 d-flex align-items-baseline justify-content-between fs-15">
                    <span>
                      <span className="fs-4xl fw-extrabold ls-tight text-merah-700">{j.kuota}</span> kursi
                    </span>
                    <span className="text-tinta-3">{terisi} pendaftar</span>
                  </p>
                  <div className="progress mt-3 bg-merah-50" role="img" aria-label={`${terisi} dari ${j.kuota} kursi terisi`}>
                    <div className="progress-bar isi-progres bg-primary" style={{ width: `${Math.min(100, (terisi / j.kuota) * 100)}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* Biaya pendidikan */}
      <section id="biaya" className="gulir-mt-24 py-20 py-lg-28">
        <div className={wadah}>
          <JudulBagian
            label="Transparan"
            judul={`Biaya pendidikan ${BIAYA.tahunAjaran}.`}
            desc="Tanpa biaya tersembunyi. Semua rincian bisa ditanyakan langsung kepada panitia."
          />
          <div className="row g-6">
            <div className="col-lg-8">
              <div className="rounded-5 bg-white p-5 p-sm-9 border border-garis">
                <table className="caption-top w-100 text-start">
                  <caption className="pt-0 pb-4 text-start fs-sm fw-bold text-uppercase ls-widest text-tinta-3">Rincian biaya</caption>
                  <thead className="visually-hidden">
                    <tr>
                      <th scope="col">Komponen</th>
                      <th scope="col">Biaya</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BIAYA.rincian.map((b) => (
                      <tr key={b.nama} className="border-bottom border-garis align-top">
                        <td className="py-4 pe-4">
                          <p className="fw-semibold">{b.nama}</p>
                          <p className="mt-0-5 fs-sm text-tinta-3">{b.ket}</p>
                        </td>
                        <td className="angka text-nowrap py-4 text-end fw-bold fs-sm-lg">{rupiah(b.nominal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Total di luar tabel agar label & nominal bisa bersusun di layar sempit */}
                <p className="mt-6 d-flex flex-wrap align-items-center justify-content-between column-gap-6 row-gap-3">
                  <span className="mw-sm fs-15 fw-semibold text-tinta-2">Total tahun pertama (uang pangkal, seragam, buku, dan SPP 12 bulan)</span>
                  <span className="angka d-inline-block text-nowrap rounded-3 bg-primary px-4 py-2 fs-xl fs-sm-2xl fw-extrabold text-white">{rupiah(totalTahunPertama)}</span>
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="rounded-5 bg-stabilo p-7 p-sm-8">
                <span className="d-flex align-items-center justify-content-center ukuran-12 rounded-3 bg-tinta text-stabilo">
                  <HandCoins className="ukuran-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 fs-2xl">Keringanan biaya</h3>
                <ul className="mt-4 d-flex flex-column gap-3">
                  {BIAYA.keringanan.map((k) => (
                    <li key={k} className="d-flex gap-3 fw-medium lh-relaxed">
                      <CheckCircle2 className="mt-0-5 ukuran-5 flex-shrink-0" aria-hidden="true" />
                      {k}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulir pendaftaran */}
      <section id="daftar" className="gulir-mt-24 latar-kertas-lembut py-20 py-lg-28">
        <div className={`${wadah} tata-formulir d-grid gap-6`}>
          <div className="min-w-0 rounded-5 bg-white p-5 p-sm-10 border border-garis">
            <Label>Pendaftaran online</Label>
            <h2 className="mt-5 fs-4xl lh-tight">Formulir pendaftaran</h2>
            <p className="mb-8 mt-3 lh-relaxed text-tinta-2">
              Siapkan Kartu Keluarga, akta kelahiran, pas foto, dan KTP orang tua. Kolom bertanda <span className="text-merah-700">*</span> wajib diisi.
            </p>
            <FormPpdb />
          </div>

          <aside className="d-flex flex-column gap-4 position-lg-sticky top-lg-28 align-self-lg-start">
            <div id="cek-status" className="gulir-mt-28 rounded-5 bg-white p-6 p-sm-7 border border-garis">
              <h2 className="fs-2xl">Cek status pendaftaran</h2>
              <p className="mb-5 mt-2 fs-15 text-tinta-2">Sudah mendaftar? Masukkan nomor pendaftaran dan tanggal lahir anak.</p>
              <CekStatusPpdb />
            </div>
            <div className="rounded-5 bg-merah-tua p-6 p-sm-7 text-white">
              <h2 className="fs-2xl">Butuh bantuan?</h2>
              <p className="mt-2 fs-15 text-krem">Panitia PPDB siap membantu pada jam kerja.</p>
              <p className="angka mt-3 fw-bold">WhatsApp {SEKOLAH.whatsapp}</p>
              <Link to="/kontak" className={`${tombol.terang} mt-5 w-100`}>
                Hubungi panitia
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="py-20 py-lg-28">
        <div className={wadah}>
          <div className="row gx-0 gy-12 gx-lg-12">
            <div className="col-lg-5">
              <JudulBagian label="Tanya jawab" judul="Pertanyaan yang sering diajukan." className="position-lg-sticky top-lg-28" />
            </div>
            <div className="col-lg-7">
              <Faq />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
