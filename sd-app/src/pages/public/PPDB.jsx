import { Link } from 'react-router-dom'
import { CheckCircle2, FileCheck2, HandCoins } from 'lucide-react'
import Faq from '../../components/Faq'
import { Muncul } from '../../components/Hiasan'
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
      <PitaMerah className="pb-14 pt-8 sm:pt-10 lg:pb-20 lg:pt-12">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <Jejak
              daftar={[
                ['/', 'Beranda'],
                [null, `PPDB ${PPDB.tahunAjaran}`],
              ]}
            />
            <h1 className="mt-6 max-w-4xl text-[2.6rem] leading-[1.03] sm:text-6xl lg:text-[4.25rem]">
              Penerimaan siswa baru tahun ajaran <span className="angka text-stabilo">{PPDB.tahunAjaran}</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-krem sm:text-xl">
              Pendaftaran untuk kelas 1 dilakukan online, kapan saja dan di mana saja. Tidak ada tes membaca, menulis, dan berhitung.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
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
          <FotoBingkai foto={FOTO.siswi} prioritas className="ml-4 lg:ml-0" />
        </div>

        {/* Jadwal pelaksanaan */}
        <ol className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PPDB.jadwal.map((j, i) => (
            <li key={j.tahap} className="flex gap-4 rounded-[1.5rem] bg-white/[0.08] p-5 ring-1 ring-inset ring-white/10">
              <span className="angka grid h-10 w-10 shrink-0 place-items-center rounded-full bg-stabilo font-extrabold text-tinta">{i + 1}</span>
              <span>
                <span className="block text-lg font-bold leading-snug">{j.tahap}</span>
                <span className="angka mt-0.5 block text-[15px] text-krem">{j.tanggal}</span>
              </span>
            </li>
          ))}
        </ol>
      </PitaMerah>

      {/* Alur & persyaratan */}
      <section className={`${wadah} grid gap-16 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:py-28`}>
        <div>
          <JudulBagian label="Langkah mudah" judul="Alur pendaftaran." className="mb-10" />
          <ol className="grid gap-4 sm:grid-cols-2">
            {ALUR.map((a, i) => (
              <Muncul as="li" key={a.judul} jeda={i * 70} className="rounded-[1.75rem] bg-kartu p-6 ring-1 ring-garis sm:p-7">
                <span className="angka grid h-12 w-12 place-items-center rounded-2xl bg-primary-600 text-xl font-extrabold text-white">{i + 1}</span>
                <span className="mt-5 block text-xl font-bold">{a.judul}</span>
                <span className="mt-1.5 block leading-relaxed text-tinta-2">{a.desc}</span>
              </Muncul>
            ))}
          </ol>
        </div>
        <div className="h-fit rounded-[2rem] bg-tinta p-7 text-white sm:p-9 lg:mt-24">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-stabilo text-tinta">
            <FileCheck2 className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-3xl">Persyaratan</h2>
          <p className="mt-2 text-[15px] text-white/70">Siapkan sebelum mengisi formulir.</p>
          <ul className="mt-6 space-y-3">
            {PPDB.syarat.map((s) => (
              <li key={s} className="flex gap-3 leading-relaxed">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-stabilo" aria-hidden="true" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Jalur & kuota */}
      <section className="bg-kertas-tua/70 py-20 lg:py-28">
        <div className={wadah}>
          <JudulBagian label="Kuota" judul="Jalur pendaftaran." desc="Kuota dihitung dari pendaftar yang masih dalam proses atau sudah diterima." />
          <ul className="grid gap-4 md:grid-cols-3">
            {PPDB.jalur.map((j) => {
              const terisi = pendaftarJalur(j.nama)
              return (
                <li key={j.nama} className="rounded-[1.75rem] bg-white p-7 ring-1 ring-garis">
                  <p className="text-2xl font-extrabold tracking-tight">Jalur {j.nama}</p>
                  <p className="mt-2 leading-relaxed text-tinta-2">{j.ket}</p>
                  <p className="angka mt-6 flex items-baseline justify-between text-[15px]">
                    <span>
                      <span className="text-4xl font-extrabold tracking-tight text-primary-700">{j.kuota}</span> kursi
                    </span>
                    <span className="text-tinta-3">{terisi} pendaftar</span>
                  </p>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-primary-50" role="img" aria-label={`${terisi} dari ${j.kuota} kursi terisi`}>
                    <div className="h-full rounded-full bg-primary-600" style={{ width: `${Math.min(100, (terisi / j.kuota) * 100)}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* Biaya pendidikan */}
      <section id="biaya" className="scroll-mt-24 py-20 lg:py-28">
        <div className={wadah}>
          <JudulBagian
            label="Transparan"
            judul={`Biaya pendidikan ${BIAYA.tahunAjaran}.`}
            desc="Tanpa biaya tersembunyi. Semua rincian bisa ditanyakan langsung kepada panitia."
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="rounded-[2rem] bg-kartu p-5 ring-1 ring-garis sm:p-9">
              <table className="w-full text-left">
                <caption className="pb-4 text-left text-sm font-bold uppercase tracking-[0.14em] text-tinta-3">Rincian biaya</caption>
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Komponen</th>
                    <th scope="col">Biaya</th>
                  </tr>
                </thead>
                <tbody>
                  {BIAYA.rincian.map((b) => (
                    <tr key={b.nama} className="border-b border-garis align-top">
                      <td className="py-4 pr-4">
                        <p className="font-semibold">{b.nama}</p>
                        <p className="mt-0.5 text-sm text-tinta-3">{b.ket}</p>
                      </td>
                      <td className="angka whitespace-nowrap py-4 text-right font-bold sm:text-lg">{rupiah(b.nominal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Total di luar tabel agar label & nominal bisa bersusun di layar sempit */}
              <p className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                <span className="max-w-sm text-[15px] font-semibold text-tinta-2">Total tahun pertama (uang pangkal, seragam, buku, dan SPP 12 bulan)</span>
                <span className="angka inline-block whitespace-nowrap rounded-2xl bg-primary-600 px-4 py-2 text-xl font-extrabold text-white sm:text-2xl">{rupiah(totalTahunPertama)}</span>
              </p>
            </div>
            <div className="h-fit rounded-[2rem] bg-stabilo p-7 sm:p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-tinta text-stabilo">
                <HandCoins className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-2xl">Keringanan biaya</h3>
              <ul className="mt-4 space-y-3">
                {BIAYA.keringanan.map((k) => (
                  <li key={k} className="flex gap-3 font-medium leading-relaxed">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                    {k}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Formulir pendaftaran */}
      <section id="daftar" className="scroll-mt-24 bg-kertas-tua/70 py-20 lg:py-28">
        <div className={`${wadah} grid gap-6 lg:grid-cols-[1fr_360px]`}>
          <div className="min-w-0 rounded-[2rem] bg-kartu p-5 ring-1 ring-garis sm:p-10">
            <Label>Pendaftaran online</Label>
            <h2 className="mt-5 text-4xl leading-tight">Formulir pendaftaran</h2>
            <p className="mb-8 mt-3 leading-relaxed text-tinta-2">
              Siapkan Kartu Keluarga, akta kelahiran, pas foto, dan KTP orang tua. Kolom bertanda <span className="text-primary-700">*</span> wajib diisi.
            </p>
            <FormPpdb />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div id="cek-status" className="scroll-mt-28 rounded-[2rem] bg-kartu p-6 ring-1 ring-garis sm:p-7">
              <h2 className="text-2xl">Cek status pendaftaran</h2>
              <p className="mb-5 mt-2 text-[15px] text-tinta-2">Sudah mendaftar? Masukkan nomor pendaftaran dan tanggal lahir anak.</p>
              <CekStatusPpdb />
            </div>
            <div className="rounded-[2rem] bg-primary-700 p-6 text-white sm:p-7">
              <h2 className="text-2xl">Butuh bantuan?</h2>
              <p className="mt-2 text-[15px] text-krem">Panitia PPDB siap membantu pada jam kerja.</p>
              <p className="angka mt-3 font-bold">WhatsApp {SEKOLAH.whatsapp}</p>
              <Link to="/kontak" className={`${tombol.terang} mt-5 w-full`}>
                Hubungi panitia
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className={`${wadah} grid gap-12 lg:grid-cols-[0.8fr_1.2fr]`}>
          <JudulBagian label="Tanya jawab" judul="Pertanyaan yang sering diajukan." className="lg:sticky lg:top-28 lg:self-start" />
          <Faq />
        </div>
      </section>
    </>
  )
}
