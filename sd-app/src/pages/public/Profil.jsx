import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, BadgeCheck, CheckCircle2, Trophy } from 'lucide-react'
import { IKON_FASILITAS } from '../../components/Fasilitas'
import { AngkaNaik, Muncul, TeksNaik } from '../../components/Hiasan'
import { Foto, FotoBingkai, IndeksHalaman, Jejak, JudulBagian, Label, PitaMerah, TautanPanah, tombol, wadah } from '../../components/Situs'
import { Avatar } from '../../components/ui'
import { useData } from '../../context/DataContext'
import { FASILITAS, KARAKTER, PPDB, PRESTASI, SEKOLAH, STATISTIK } from '../../data/dummy'
import { FOTO, FOTO_FASILITAS } from '../../data/foto'

const BAGIAN = [
  ['sejarah', 'Sejarah'],
  ['visi-misi', 'Visi & misi'],
  ['karakter', 'Nilai karakter'],
  ['keberagaman', 'Keberagaman'],
  ['struktur', 'Struktur'],
  ['prestasi', 'Prestasi'],
  ['fasilitas', 'Fasilitas'],
]

const STAT = Object.fromEntries(STATISTIK.map((s) => [s.label, s.nilai]))

const PERJALANAN = [
  { tahun: '2005', teks: 'Berdiri dengan 3 ruang kelas dan 45 siswa.' },
  { tahun: '2011', teks: 'Membangun perpustakaan dan lapangan olahraga.' },
  { tahun: '2016', teks: 'Meraih akreditasi A untuk pertama kalinya.' },
  { tahun: '2021', teks: 'Lab komputer & program robotik dibuka.' },
  { tahun: '2025', teks: 'Penghargaan Sekolah Adiwiyata tingkat kota.' },
  { tahun: '2026', teks: 'Portal digital sekolah untuk siswa & orang tua.' },
]

// Kata kunci visi yang diberi sorotan kuning
const SOROT_VISI = ['beriman', 'cerdas', 'berkarakter', 'peduli lingkungan']

const POIN_KEBERAGAMAN = [
  'Pendidikan Agama diberikan sesuai agama yang dianut setiap siswa.',
  'Ruang ibadah tersedia untuk semua agama.',
  'Hari besar setiap agama diperingati dengan saling menghormati.',
]

const URUTAN_TINGKAT = ['Internasional', 'Nasional', 'Provinsi', 'Kota', 'Kecamatan']

function sorot(teks, kata) {
  return teks.split(new RegExp(`(${kata.join('|')})`, 'gi')).map((bagian, i) =>
    i % 2 ? (
      <mark key={i} className="sorot-visi">
        {bagian}
      </mark>
    ) : (
      <Fragment key={i}>{bagian}</Fragment>
    ),
  )
}

const namaKepsek = (data) => data.guru.find((g) => g.jabatan === 'Kepala Sekolah')?.nama ?? SEKOLAH.kepalaSekolah

// Kartu identitas sekolah yang menumpuk di tepi bawah latar merah
function KartuIdentitas() {
  const { data } = useData()
  const [huruf, ket] = SEKOLAH.akreditasi.match(/^(\S+)\s*\((.+)\)$/)?.slice(1) ?? [SEKOLAH.akreditasi, '']
  const fakta = [
    ['NPSN', SEKOLAH.npsn],
    ['Status', SEKOLAH.status],
    ['Berdiri', SEKOLAH.tahunBerdiri],
    ['Kurikulum', SEKOLAH.kurikulum],
    ['Kepala sekolah', namaKepsek(data)],
    ['Alamat', SEKOLAH.alamat],
  ]
  return (
    <div className="kartu-identitas d-grid gap-8 rounded-5 bg-white p-6 p-sm-8 border border-garis">
      <div className="d-flex align-items-center gap-4 flex-lg-column align-items-lg-start">
        <img src="/logo.png" alt={`Logo ${SEKOLAH.nama}`} className="ukuran-16 ukuran-sm-20 flex-shrink-0 object-fit-contain" />
        <div>
          <p className="fs-xs fw-bold text-uppercase ls-lebar text-tinta-3">Identitas sekolah</p>
          <p className="mt-1 fs-2xl fw-extrabold lh-tight ls-tight">{SEKOLAH.nama}</p>
          <p className="mt-3 d-inline-flex align-items-center gap-1-5 rounded-pill bg-primary px-3 py-1-5 fs-sm fw-bold text-white">
            <BadgeCheck className="ukuran-4" aria-hidden="true" /> Akreditasi {huruf}
            {ket && ` · ${ket}`}
          </p>
        </div>
      </div>
      <dl className="d-grid kolom-2 kolom-lg-3 gap-3">
        {fakta.map(([k, v]) => (
          <div key={k} className={`rounded-3 bg-kertas p-4 ${k === 'Alamat' || k === 'Kepala sekolah' ? 'rentang-2 rentang-sm-1' : ''}`}>
            <dt className="fs-sm fw-normal text-tinta-3">{k}</dt>
            <dd className="mt-1 fw-bold lh-snug">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Pembuka() {
  return (
    <>
      <PitaMerah className="pb-36 pt-8 pt-sm-10 pb-lg-40 pt-lg-12">
        <div className="row gx-0 gy-12 gx-lg-16 align-items-center">
          <div className="col-lg-7">
            <div className="turun-awal">
              <Jejak
                daftar={[
                  ['/', 'Beranda'],
                  [null, 'Profil sekolah'],
                ]}
              />
            </div>
            <h1 className="judul-profil mt-6" style={{ '--tunda-teks': '120ms' }}>
              <TeksNaik teks="Rumah kedua tempat anak tumbuh" />{' '}
              <span className="text-stabilo">
                <TeksNaik teks="gemilang." mulai={5} />
              </span>
            </h1>
            <p className="masuk-awal mt-6 mw-xl fs-lg fs-sm-xl lh-relaxed text-krem" style={{ '--tunda': '520ms' }}>
              Sejak {SEKOLAH.tahunBerdiri}, {SEKOLAH.nama} mendampingi anak-anak belajar dengan gembira, tumbuh berkarakter, dan menghargai setiap
              perbedaan.
            </p>
            <p
              className="masuk-awal mt-7 d-inline-flex rounded-pill bg-merah-900 bg-opacity-70 px-4 py-2 fs-sm fw-bold text-stabilo border border-white border-opacity-10"
              style={{ '--tunda': '620ms' }}
            >
              {SEKOLAH.slogan}
            </p>
          </div>
          <div className="col-lg-5">
            <FotoBingkai foto={FOTO.sahabat} prioritas className="ms-4 ms-lg-0" />
          </div>
        </div>
        <IndeksHalaman daftar={BAGIAN} />
      </PitaMerah>
      <div className={`${wadah} position-relative z-10 mt-n24`}>
        <KartuIdentitas />
      </div>
    </>
  )
}

function Sejarah() {
  const dulu = [
    ['Siswa', '45', STAT['Siswa Aktif']],
    ['Rombongan belajar', '3', STAT['Rombongan Belajar']],
  ]
  return (
    <section id="sejarah" className="gulir-mt-24 py-20 py-lg-28">
      <div className={wadah}>
        <div className="row gx-0 gy-14 gx-lg-16 align-items-center">
          <div className="col-lg-6">
            <Muncul>
              <Label>Sejak {SEKOLAH.tahunBerdiri}</Label>
              <h2 className="judul-sedang mt-5">Berawal dari tiga ruang kelas.</h2>
              <p className="mt-6 fs-lg fs-sm-xl lh-relaxed text-tinta-2">{SEKOLAH.sejarah}</p>
              <dl className="mt-9 d-grid gap-4 kolom-sm-2">
                {dulu.map(([label, a, b]) => (
                  <div key={label} className="rounded-4 bg-white p-5 border border-garis">
                    <dt className="fs-sm fw-semibold text-tinta-3">{label}</dt>
                    <dd className="mt-2 d-flex align-items-center gap-3">
                      <span className="angka fs-2xl fw-bold text-tinta-3">{a}</span>
                      <ArrowRight className="ukuran-5 text-primary" aria-hidden="true" />
                      <span className="visually-hidden">menjadi</span>
                      <span className="angka fs-4xl fw-extrabold ls-tight text-merah-700">
                        <AngkaNaik nilai={b} tunda={250} />
                      </span>
                    </dd>
                    <dd className="angka mt-1 fs-xs text-tinta-3">
                      {SEKOLAH.tahunBerdiri} → {new Date().getFullYear()}
                    </dd>
                  </div>
                ))}
              </dl>
            </Muncul>
          </div>
          <div className="col-lg-6">
            <Muncul jeda={120} className="sejarah-foto">
              <figure className="sejarah-foto__gedung m-0 overflow-hidden rounded-5">
                <Foto foto={FOTO.gedung} />
              </figure>
              <figure className="sejarah-foto__upacara m-0 overflow-hidden rounded-5">
                <Foto foto={FOTO.upacara} />
              </figure>
              <div className="sejarah-foto__angka d-flex flex-column justify-content-end rounded-5 bg-primary p-5 text-white">
                <span className="angka fs-4xl fw-extrabold ls-tight">
                  <AngkaNaik nilai={STAT['Tahun Berpengalaman']} tunda={200} />
                </span>
                <span className="mt-1 fs-sm fw-semibold">tahun mendidik</span>
              </div>
            </Muncul>
          </div>
        </div>
      </div>

      {/* Linimasa perjalanan sekolah */}
      <div className={`${wadah} mt-20`}>
        <h3 className="fs-2xl fs-sm-3xl">Langkah demi langkah</h3>
        <ol className="position-relative mt-8 d-grid gap-4 kolom-sm-2 kolom-lg-6">
          <span aria-hidden="true" className="perjalanan__garis d-none d-lg-block" />
          {PERJALANAN.map((p, i) => (
            <Muncul as="li" key={p.tahun} jeda={i * 70} className="position-relative">
              <span className="angka position-relative z-10 d-inline-flex h-12 align-items-center rounded-pill bg-primary px-5 fs-lg fw-extrabold text-white cincin-kertas">
                {p.tahun}
              </span>
              <p className="mt-4 lh-relaxed text-tinta-2">{p.teks}</p>
            </Muncul>
          ))}
        </ol>
      </div>
    </section>
  )
}

function VisiMisi() {
  return (
    <section id="visi-misi" className="gulir-mt-24 latar-kertas-lembut py-20 py-lg-28">
      <div className={wadah}>
        <Muncul>
          <Label>Visi kami</Label>
          <p className="visi-teks mt-6 mw-5xl fw-extrabold ls-tight">{sorot(SEKOLAH.visi, SOROT_VISI)}</p>
        </Muncul>

        <div className="mt-16">
          <div className="d-flex flex-wrap align-items-end justify-content-between gap-4">
            <h2 className="fs-3xl fs-sm-4xl">Misi: {SEKOLAH.misi.length} langkah menuju visi.</h2>
            <p className="mw-md text-tinta-2">Cara kami mewujudkannya setiap hari, bersama orang tua dan masyarakat.</p>
          </div>
          <ol className="mt-8 d-grid gap-4 kolom-sm-2 kolom-lg-3">
            {SEKOLAH.misi.map((m, i) => (
              <Muncul as="li" key={m} jeda={(i % 3) * 70} className="d-flex flex-column gap-6 rounded-kartu bg-white p-7 border border-garis">
                <span className="angka d-flex align-items-center justify-content-center ukuran-12 rounded-3 bg-merah-50 fs-xl fw-extrabold text-merah-700">{i + 1}</span>
                <span className="fs-lg fw-semibold lh-snug">{m}</span>
              </Muncul>
            ))}
            <Muncul as="li" jeda={140} className="min-h-56 overflow-hidden rounded-kartu" aria-hidden="true">
              <Foto foto={FOTO.jelajah} alt="" />
            </Muncul>
          </ol>
        </div>
      </div>
    </section>
  )
}

// Nilai GEMILANG sebagai akrostik
function NilaiKarakter() {
  return (
    <section id="karakter" className="gulir-mt-24 bg-merah-tua py-20 py-lg-28 text-white">
      <div className={wadah}>
        <JudulBagian
          terang
          label="Budaya sekolah"
          judul="Delapan huruf, satu semangat."
          desc="Nilai karakter GEMILANG kami hidupkan di kelas, di lapangan, dan di rumah."
        />
        <ol aria-label="Nilai karakter GEMILANG" className="d-grid gap-4 kolom-sm-2 kolom-lg-4">
          {KARAKTER.map((k, i) => (
            <Muncul
              as="li"
              key={i}
              jeda={(i % 4) * 60}
              className="rounded-kartu bg-white bg-opacity-7 p-6 border border-white border-opacity-10 transisi hover-terang"
            >
              <span aria-hidden="true" className="d-flex align-items-center justify-content-center ukuran-16 rounded-3 bg-stabilo fs-4xl fw-extrabold text-tinta">
                {k.huruf}
              </span>
              <span className="mt-6 d-block fs-xl fw-bold">{k.nama}</span>
              <span className="mt-1-5 d-block lh-relaxed text-krem">{k.desc}</span>
            </Muncul>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Keberagaman() {
  return (
    <section id="keberagaman" className="gulir-mt-24 py-20 py-lg-28">
      <div className={wadah}>
        <div className="row gx-0 gy-14 gx-lg-16 align-items-center">
          <div className="col-lg-6">
            <Muncul>
              <Label>Keberagaman</Label>
              <h2 className="judul-sedang mt-5">Satu sekolah, beragam keyakinan.</h2>
              <p className="mt-6 fs-lg lh-relaxed text-tinta-2">
                Sebagai sekolah swasta umum, {SEKOLAH.nama} terbuka bagi siswa dari semua agama. Perbedaan tidak untuk dibandingkan, tetapi untuk
                dipelajari dan dihormati bersama sejak dini.
              </p>
              <ul className="mt-8 d-flex flex-column gap-3">
                {POIN_KEBERAGAMAN.map((p) => (
                  <li key={p} className="d-flex gap-3 rounded-3 bg-white p-4 lh-relaxed border border-garis">
                    <CheckCircle2 className="mt-0-5 ukuran-5 flex-shrink-0 text-primary" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
            </Muncul>
          </div>
          <div className="col-lg-6">
            <Muncul jeda={120} className="rounded-5 bg-tinta p-8 p-sm-12 text-white">
              <p className="fs-4xl fs-sm-5xl fw-extrabold lh-tight ls-tight">Bhinneka Tunggal Ika</p>
              <p className="mt-2 fs-lg text-white text-opacity-70">Berbeda-beda tetapi tetap satu.</p>
              <p className="mt-10 fs-sm fw-bold text-uppercase ls-lebar text-stabilo">Pendidikan Agama untuk</p>
              <ul className="mt-5 d-flex flex-wrap gap-2-5">
                {PPDB.agama.map((a) => (
                  <li key={a} className="rounded-pill bg-white bg-opacity-10 px-5 py-2-5 fs-lg fw-semibold border border-white border-opacity-15">
                    {a}
                  </li>
                ))}
              </ul>
            </Muncul>
          </div>
        </div>
      </div>
    </section>
  )
}

// `tingkat`: 'utama' (kepala sekolah), 'tengah' (wakasek, di bawah garis bagan), atau baris biasa
function KartuOrang({ g, tingkat }) {
  const tegak = tingkat === 'utama' || tingkat === 'tengah'
  return (
    <div
      className={`d-flex align-items-center gap-4 rounded-4 bg-white p-4 ${tegak ? 'flex-column gap-3 px-6 py-6 text-center' : ''} ${
        tingkat === 'utama' ? 'border border-2 border-merah-200' : 'border border-garis'
      }`}
    >
      <Avatar
        nama={g.nama}
        size={tingkat === 'utama' ? 'xl' : tingkat === 'tengah' ? 'lg' : 'md'}
        className={tingkat === 'utama' ? 'bg-primary fs-3xl text-white' : 'bg-merah-50 text-merah-700'}
      />
      <div>
        <p className={`fw-bold lh-snug ${tingkat === 'utama' ? 'fs-xl' : 'fs-17'}`}>{g.nama}</p>
        <p className="fs-15 text-tinta-3">{g.jabatan}</p>
      </div>
    </div>
  )
}

function Struktur() {
  const { data } = useData()
  const kepsek = data.guru.find((g) => g.jabatan === 'Kepala Sekolah')
  const wakasek = data.guru.filter((g) => g.peran?.some((p) => p.startsWith('wakasek')))
  const pendukung = data.guru.filter((g) => g.peran?.some((p) => ['tata_usaha', 'guru_bk', 'pustakawan'].includes(p)))

  return (
    <section id="struktur" className="gulir-mt-24 latar-kertas-lembut py-20 py-lg-28">
      <div className={wadah}>
        <JudulBagian
          label="Organisasi"
          judul="Orang-orang di balik sekolah."
          desc="Tim pimpinan dan pendukung yang membuat setiap hari di sekolah berjalan hangat dan tertib."
          aksi={<TautanPanah to="/guru">Seluruh guru & staf</TautanPanah>}
        />
        {kepsek && (
          <Muncul className="d-flex flex-column align-items-center">
            <KartuOrang g={kepsek} tingkat="utama" />
            <span aria-hidden="true" className="garis-bagan-v d-none d-sm-block h-10" />
          </Muncul>
        )}
        {wakasek.length > 0 && (
          <div className="position-relative mt-10 d-grid gap-10 mt-sm-0 pt-sm-8" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(12rem, 1fr))` }}>
            {/* Garis bagan dari tengah kolom pertama ke tengah kolom terakhir (jarak antarkolom 2,5rem ikut dihitung) */}
            <span
              aria-hidden="true"
              className="garis-bagan-h position-absolute top-0 d-none d-sm-block"
              style={{ left: `calc((100% - ${(wakasek.length - 1) * 2.5}rem) / ${2 * wakasek.length})`, right: `calc((100% - ${(wakasek.length - 1) * 2.5}rem) / ${2 * wakasek.length})` }}
            />
            {wakasek.map((g, i) => (
              <Muncul key={g.id} jeda={i * 80} className="position-relative d-flex justify-content-center">
                <span aria-hidden="true" className="garis-bagan-v garis-bagan-v--atas position-absolute start-50 d-none d-sm-block h-8" />
                <KartuOrang g={g} tingkat="tengah" />
              </Muncul>
            ))}
          </div>
        )}
        {pendukung.length > 0 && (
          <div className="mt-16">
            <p className="fs-sm fw-bold text-uppercase ls-lebar text-tinta-3">Tim pendukung</p>
            <div className="mt-5 d-grid gap-4 kolom-sm-2 kolom-lg-4">
              {pendukung.map((g) => (
                <KartuOrang key={g.id} g={g} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function Prestasi() {
  const [utama, ...lain] = PRESTASI
  const tahun = PRESTASI.map((p) => p.tahun)
  const perTingkat = URUTAN_TINGKAT.map((t) => [t, PRESTASI.filter((p) => p.tingkat === t).length]).filter(([, n]) => n)

  return (
    <section id="prestasi" className="gulir-mt-24 py-20 py-lg-28">
      <div className={wadah}>
        <JudulBagian
          label="Prestasi"
          judul="Jejak prestasi siswa & sekolah."
          desc="Setiap piala adalah cerita tentang kerja keras, keberanian mencoba, dan dukungan orang tua."
        />
        <div className="row g-6">
          <div className="col-lg-8">
            <Muncul className="position-relative isolate mb-4 overflow-hidden rounded-5 bg-stabilo p-8 p-sm-10">
              <Trophy aria-hidden="true" strokeWidth={1.25} className="piala-latar piala-latar--kecil" />
              <span className="d-inline-flex rounded-pill bg-tinta px-3-5 py-1-5 fs-sm fw-bold text-stabilo">
                Terbaru · <span className="angka mx-1">{utama.tahun}</span> · Tingkat {utama.tingkat}
              </span>
              <p className="mt-6 fs-4xl fs-sm-5xl fw-extrabold lh-tight ls-tight">{utama.judul}</p>
              <p className="mt-2 fs-lg fw-medium">{utama.oleh}</p>
            </Muncul>
            <ol className="d-grid gap-3">
              {lain.map((p) => (
                <li key={p.judul} className="prestasi-baris rounded-4 bg-white p-4 p-sm-5 border border-garis">
                  <span className="d-flex align-items-center justify-content-center ukuran-12 rounded-3 bg-merah-50 text-merah-700">
                    <Trophy className="ukuran-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="d-block fs-lg fw-bold lh-snug">{p.judul}</span>
                    <span className="angka fs-15 text-tinta-3">
                      {p.tahun} · {p.bidang} · Tingkat {p.tingkat}
                    </span>
                  </span>
                  <span className="prestasi-baris__oleh fs-15 text-tinta-2">{p.oleh}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="col-lg-4">
            <aside className="rounded-5 bg-merah-tua p-7 text-white position-lg-sticky top-lg-28">
              <p className="angka fs-7xl fw-extrabold ls-tight">
                <AngkaNaik nilai={PRESTASI.length} />
              </p>
              <p className="mt-2 fw-semibold text-krem">prestasi dalam {Math.max(...tahun) - Math.min(...tahun) + 1} tahun terakhir</p>
              <dl className="mt-6 d-flex flex-column gap-2">
                {perTingkat.map(([t, n]) => (
                  <div key={t} className="d-flex align-items-center justify-content-between rounded-2 bg-white bg-opacity-10 px-4 py-3">
                    <dt className="fw-normal">Tingkat {t}</dt>
                    <dd className="angka fs-xl fw-extrabold">{n}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}

function Fasilitas() {
  return (
    <section id="fasilitas" className="gulir-mt-24 latar-kertas-lembut py-20 py-lg-28">
      <div className={wadah}>
        <JudulBagian
          label="Sarana"
          judul="Fasilitas sekolah."
          desc="Lingkungan belajar yang aman, nyaman, dan mendukung tumbuh kembang anak."
          aksi={<TautanPanah to="/fasilitas">Denah & tur virtual</TautanPanah>}
        />
        <ul className="d-grid gap-4 kolom-sm-2 kolom-lg-4">
          {FASILITAS.map((f, i) => (
            <Muncul as="li" key={f.id} jeda={(i % 4) * 60}>
              <Link to={`/fasilitas/${f.id}`} className="kartu-zoom hover-angkat d-flex h-100 flex-column overflow-hidden rounded-kartu bg-white border border-garis">
                <span className="d-block rasio-4x3 overflow-hidden">
                  <Foto foto={FOTO_FASILITAS[f.id]} alt="" ikon={IKON_FASILITAS[f.ikon]} nada="merah" />
                </span>
                <span className="d-flex flex-1 flex-column p-5">
                  <span className="judul-sorot d-flex align-items-center justify-content-between gap-2 fs-lg fw-bold">
                    {f.nama}
                    <ArrowUpRight className="ukuran-5 flex-shrink-0 text-tinta-3" aria-hidden="true" />
                  </span>
                  <span className="mt-1 fs-15 lh-relaxed text-tinta-2">{f.ringkas}</span>
                </span>
              </Link>
            </Muncul>
          ))}
        </ul>

        <Muncul className="mt-10 d-flex flex-column gap-6 rounded-5 bg-merah-tua px-6 py-10 text-white px-sm-10 flex-md-row align-items-md-center justify-content-md-between">
          <div>
            <h3 className="fs-3xl lh-tight">Lebih seru dilihat langsung.</h3>
            <p className="mt-2 text-krem">Ajak ananda berkeliling sekolah dan berkenalan dengan para guru.</p>
          </div>
          <div className="d-flex flex-wrap gap-3">
            <Link to="/fasilitas#kunjungan" className={tombol.terang}>
              Jadwalkan kunjungan
            </Link>
            <Link to="/ppdb" className={tombol.garisTerang}>
              Daftar PPDB
            </Link>
          </div>
        </Muncul>
      </div>
    </section>
  )
}

export default function Profil() {
  return (
    <>
      <Pembuka />
      <Sejarah />
      <VisiMisi />
      <NilaiKarakter />
      <Keberagaman />
      <Struktur />
      <Prestasi />
      <Fasilitas />
    </>
  )
}
