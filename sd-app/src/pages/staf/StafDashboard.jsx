import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Contact,
  FileCheck,
  HeartHandshake,
  Library,
  MessagesSquare,
  NotebookPen,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  UserRoundPlus,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react'
import { GrafikBatang } from '../../components/Grafik'
import { Gumpalan } from '../../components/Hiasan'
import JamSekolah from '../../components/JamSekolah'
import { KartuPresensiSaya, RingkasanPresensi } from '../../components/Presensi'
import { JENIS_AGENDA, agendaMendatang, rentangAgenda } from '../../components/KalenderAkademik'
import { Avatar, Badge, Card, DashHeader, EmptyState, StatCard, btn } from '../../components/ui'
import { PERAN, useAkses, useGayaSitus } from '../../context/akses'
import { useChatSaya } from '../../context/ChatContext'
import { ringkasAbsensi, useData } from '../../context/DataContext'
import { KKTP, MAPEL, MAPEL_RAPOR } from '../../data/dummy'
import { nilaiAkhir, rekapNilai } from '../../utils/nilai'
import { formatHari, formatTanggal, isHariSekolah, namaHari, parseKey, tambahHari, todayKey } from '../../utils/format'
import { jadwalMengajar, mapelDiampu } from '../../utils/jadwal'
import { kehadiranSekolah, perluPerhatianHadir, rataHadir, rekapSiswa, ringkasPerpus, ringkasSpp, siswaBaru, siswaTanpaKeluarga } from '../../utils/ringkasan'
import { rupiah } from '../../utils/spp'

function Panel({ judul, ke, children, className = '' }) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4 d-flex align-items-center justify-content-between gap-3">
        <h2 className="fw-bold text-tinta">{judul}</h2>
        {ke && (
          <Link to={ke} className="ui-tautan d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
            Buka <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </Card>
  )
}

function PanelWaliKelas({ kelas, base }) {
  const { data } = useData()
  const siswaKelas = data.siswa.filter((s) => s.kelas === kelas)
  const hariIni = todayKey()
  const absenHariIni = data.absensi[hariIni] ?? {}
  const sudahDiisi = siswaKelas.filter((s) => absenHariIni[s.nis]).length
  const hadirHariIni = siswaKelas.filter((s) => absenHariIni[s.nis] === 'H').length
  const izinMenunggu = data.izin.filter((i) => i.kelas === kelas && i.status === 'Menunggu')
  const { belum: chatBelum } = useChatSaya()
  const nilaiKelas = siswaKelas.map((s) => rekapNilai(data, s).rataRata).filter((n) => n !== null)
  const rataNilai = nilaiKelas.length ? Math.round((nilaiKelas.reduce((a, b) => a + b, 0) / nilaiKelas.length) * 10) / 10 : '–'
  const tugasAktif = data.tugas.filter((t) => t.kelas === kelas && t.tenggat >= todayKey())
  const tanggalTerakhir = Object.keys(data.absensi).sort().reverse().slice(0, 20)
  const rekap = siswaKelas.map((s) => ({ ...s, ...ringkasAbsensi(data.absensi, s.nis, tanggalTerakhir) }))
  const rataRata = rataHadir(rekap)
  const baru = siswaBaru(data).filter((s) => s.kelas === kelas)
  const perluPerhatian = rekap
    .filter((s) => s.total - s.H >= 2)
    .sort((a, b) => b.total - b.H - (a.total - a.H))
    .slice(0, 5)

  return (
    <section>
      <div className="mb-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <h2 className="fs-lg fw-extrabold text-tinta">Kelas {kelas}</h2>
        <Link to={`${base}/absensi`} className={btn.primary}>
          <ClipboardCheck className="h-4 w-4" /> Buka Presensi Hari Ini
        </Link>
      </div>

      {isHariSekolah(new Date()) && sudahDiisi < siswaKelas.length && (
        <div className="mb-4 d-flex align-items-center gap-3 rounded-3 border border-warning-subtle bg-warning-subtle px-5 py-4 fs-sm text-warning-emphasis">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          Absensi hari ini belum lengkap ({sudahDiisi}/{siswaKelas.length} siswa).
        </div>
      )}

      {/* Siswa yang baru ditambahkan pengelola Data Siswa (Kesiswaan/Tata Usaha) langsung masuk daftar kelas */}
      {baru.length > 0 && (
        <Link
          to={`${base}/kelas`}
          className="mb-4 d-flex align-items-center gap-3 rounded-3 border border-info-subtle bg-info-subtle px-5 py-4 fs-sm text-info-emphasis transisi hover-bayangan-kecil"
        >
          <UserRoundPlus className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1">
            Siswa baru di kelas {kelas}: <b>{baru.map((s) => `${s.nama} (masuk ${formatTanggal(s.tanggalMasuk)})`).join(', ')}</b>
          </span>
          <ArrowRight className="h-4 w-4 flex-shrink-0" />
        </Link>
      )}

      <div className="d-grid kolom-2 gap-4 kolom-lg-4">
        <StatCard icon={Users} label="Jumlah Siswa" value={siswaKelas.length} hint={`Kelas ${kelas}`} tone="sky" />
        <StatCard
          icon={CalendarCheck}
          label="Hadir Hari Ini"
          value={sudahDiisi ? `${hadirHariIni}/${siswaKelas.length}` : '–'}
          hint={sudahDiisi ? formatTanggal(hariIni) : 'Belum diisi'}
          tone="emerald"
        />
        <StatCard icon={FileCheck} label="Izin Menunggu" value={izinMenunggu.length} hint="perlu ditinjau" tone="amber" />
        <StatCard icon={ClipboardCheck} label="Rata-rata Kehadiran" value={`${rataRata}%`} hint="20 hari terakhir" tone="primary" />
      </div>

      <div className="mt-4 d-grid gap-4 kolom-sm-3">
        <Link to={`${base}/chat`} className="d-flex align-items-center gap-3 rounded-3 bg-white p-4 border border-abu-200 transisi hover-bayangan-kecil">
          <span className="d-flex h-10 w-10 align-items-center justify-content-center rounded-2 bg-merah-100 text-merah-700">
            <MessagesSquare className="h-5 w-5" />
          </span>
          <span>
            <span className="d-block fs-xl fw-extrabold text-tinta">{chatBelum}</span>
            <span className="d-block fs-xs text-tinta-3">pesan chat belum dibaca</span>
          </span>
        </Link>
        <Link to={`${base}/rapor`} className="d-flex align-items-center gap-3 rounded-3 bg-white p-4 border border-abu-200 transisi hover-bayangan-kecil">
          <span className="d-flex h-10 w-10 align-items-center justify-content-center rounded-2 bg-info-subtle text-info">
            <TrendingUp className="h-5 w-5" />
          </span>
          <span>
            <span className="d-block fs-xl fw-extrabold text-tinta">{rataNilai}</span>
            <span className="d-block fs-xs text-tinta-3">rata-rata nilai kelas</span>
          </span>
        </Link>
        <Link to={`${base}/tugas`} className="d-flex align-items-center gap-3 rounded-3 bg-white p-4 border border-abu-200 transisi hover-bayangan-kecil">
          <span className="d-flex h-10 w-10 align-items-center justify-content-center rounded-2 bg-warning-subtle text-warning-emphasis">
            <ClipboardList className="h-5 w-5" />
          </span>
          <span>
            <span className="d-block fs-xl fw-extrabold text-tinta">{tugasAktif.length}</span>
            <span className="d-block fs-xs text-tinta-3">tugas aktif</span>
          </span>
        </Link>
      </div>

      <div className="mt-4 d-grid gap-6 kolom-lg-2">
        <Panel judul="Izin Menunggu Persetujuan" ke={`${base}/izin`}>
          {izinMenunggu.length === 0 ? (
            <EmptyState icon={FileCheck} title="Semua beres!" desc="Tidak ada pengajuan izin yang menunggu." />
          ) : (
            <div className="bertahap antara-y-2">
              {izinMenunggu.map((i) => (
                <div key={i.id} className="d-flex align-items-center gap-3 rounded-2 bg-abu-50 px-4 py-3">
                  <Avatar nama={i.namaSiswa} size="sm" />
                  <div>
                    <p className="fs-sm fw-semibold text-tinta">{i.namaSiswa}</p>
                    <p className="fs-xs text-tinta-3">
                      {i.jenis} · {formatTanggal(i.tanggalMulai)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel judul="Siswa Perlu Perhatian">
          <p className="mt-n2 mb-3 fs-sm text-tinta-3">Tidak hadir 2 kali atau lebih dalam 20 hari terakhir.</p>
          {perluPerhatian.length === 0 ? (
            <EmptyState icon={Users} title="Kehadiran kelas sangat baik" />
          ) : (
            <div className="bertahap antara-y-2">
              {perluPerhatian.map((s) => (
                <div key={s.nis} className="d-flex align-items-center gap-3 rounded-2 bg-abu-50 px-4 py-3">
                  <Avatar nama={s.nama} size="sm" />
                  <div className="flex-1">
                    <p className="fs-sm fw-semibold text-tinta">{s.nama}</p>
                    <p className="fs-xs text-tinta-3">
                      Sakit {s.S} · Izin {s.I} · Alpa {s.A}
                    </p>
                  </div>
                  <span className="fs-sm fw-bold text-tinta-2">{s.persen}%</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </section>
  )
}

// Pintasan menu yang paling sering dipakai, tampil sesuai hak akses
const AKSI_CEPAT = [
  { menu: 'absensi', label: 'Presensi Siswa', icon: ClipboardCheck, warna: 'bg-success-subtle text-success' },
  { menu: 'kelas', label: 'Daftar Siswa', icon: Contact, warna: 'warna-cyan teks-cyan' },
  // Langsung membuka formulir Tambah Siswa di menu Data Siswa
  { menu: 'siswa', ke: 'siswa?tambah=1', label: 'Tambah Siswa', icon: UserRoundPlus, warna: 'warna-sky teks-sky' },
  { menu: 'nilai', label: 'Input Nilai', icon: NotebookPen, warna: 'bg-info-subtle text-info' },
  { menu: 'tugas', label: 'Buat Tugas', icon: ClipboardList, warna: 'bg-warning-subtle text-warning-emphasis' },
  { menu: 'sikap', label: 'Beri Poin', icon: Award, warna: 'warna-violet teks-violet' },
  { menu: 'chat', label: 'Chat', icon: MessagesSquare, warna: 'bg-merah-100 text-merah-700' },
  { menu: 'rapor', label: 'Rapor Kelas', icon: BookOpenCheck, warna: 'warna-teal teks-teal' },
  { menu: 'konseling', label: 'Konseling', icon: HeartHandshake, warna: 'warna-pink teks-pink' },
  { menu: 'bukutamu', label: 'Buku Tamu', icon: ShieldCheck, warna: 'bg-abu-100 text-tinta-2' },
  { menu: 'kerusakan', label: 'Lapor Kerusakan', icon: Wrench, warna: 'warna-orange teks-orange' },
  { menu: 'perpustakaan', label: 'Perpustakaan', icon: Library, warna: 'warna-indigo teks-indigo' },
  { menu: 'spp', label: 'Keuangan SPP', icon: Wallet, warna: 'bg-success-subtle text-success' },
  { menu: 'ppdb', label: 'PPDB', icon: UserPlus, warna: 'bg-info-subtle text-info' },
]

// Rata-rata nilai mapel yang diampu guru mapel, per kelas
function PanelGuruMapel({ guruId, base }) {
  const { data } = useData()
  const mapelSaya = mapelDiampu(data.guru.find((g) => g.id === guruId)).filter((k) => MAPEL_RAPOR.includes(k))
  const kelas = [...new Set(data.siswa.map((s) => s.kelas))].sort()
  const baris = mapelSaya.flatMap((m) =>
    kelas.map((k) => {
      const nilai = data.siswa
        .filter((s) => s.kelas === k)
        .map((s) => nilaiAkhir(data.nilai[s.nis]?.[m]))
        .filter((n) => n !== null)
      return { label: `${MAPEL[m].nama} · ${k}`, nilai: nilai.length ? Math.round(nilai.reduce((a, b) => a + b, 0) / nilai.length) : null }
    }),
  )
  if (!baris.length) return null
  return (
    <Panel judul="Rata-rata kelas mapel saya" ke={`${base}/nilai`}>
      <GrafikBatang judul="Rata-rata nilai per kelas" data={baris} acuan={{ nilai: KKTP, label: 'KKTP' }} />
    </Panel>
  )
}

// Jadwal mengajar hari ini (atau hari sekolah berikutnya), dengan pintasan ke presensi pelajaran
function PanelMengajar({ guruId, base, bisaPresensi }) {
  const { data } = useData()
  const semua = jadwalMengajar(data.guru, guruId)
  if (!semua.length) return null
  const hariIni = todayKey()
  let tgl = hariIni
  for (let i = 0; i < 7 && !(isHariSekolah(parseKey(tgl)) && semua.some((j) => j.hari === namaHari(tgl))); i++) tgl = tambahHari(tgl, 1)
  const daftar = semua.filter((j) => j.hari === namaHari(tgl))
  const jumlahKelas = new Set(semua.map((j) => j.kelas)).size

  return (
    <Panel judul="Jadwal Mengajar">
      <p className="mt-n2 mb-3 fs-sm text-tinta-3">
        {tgl === hariIni ? 'Hari ini' : namaHari(tgl)} · {daftar.length} pelajaran · {semua.length} sesi per minggu di {jumlahKelas} kelas
      </p>
      <ul className="bertahap antara-y-2">
        {daftar.map((j) => {
          const siswa = data.siswa.filter((s) => s.kelas === j.kelas)
          const catatan = siswa.map((s) => data.absensiMapel[tgl]?.[s.nis]?.[j.kunci]).filter(Boolean)
          return (
            <li key={j.kelas + j.kunci} className="d-flex flex-wrap align-items-center column-gap-3 row-gap-1-5 rounded-2 bg-abu-50 px-4 py-2-5 fs-sm">
              <span className="w-24 text-tinta-3">
                {j.mulai}–{j.selesai}
              </span>
              <span className="min-w-0 flex-1 text-truncate fw-semibold text-tinta">{MAPEL[j.mapel].nama}</span>
              <Badge className="bg-white text-tinta-2">Kelas {j.kelas}</Badge>
              {bisaPresensi && tgl === hariIni && (
                <Link
                  to={`${base}/absensi?kelas=${j.kelas}&pelajaran=${j.kunci}`}
                  className={`rounded-1 px-2-5 py-1 fs-xs fw-bold ${catatan.length ? 'bg-success-subtle text-success' : 'bg-primary text-white hover-latar-merah-tua'}`}
                >
                  {catatan.length ? `${catatan.filter((c) => c === 'H').length}/${siswa.length} hadir` : 'Presensi'}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

export default function StafDashboard() {
  const { data } = useData()
  const { nama, peran, kelas, base, guruId } = useAkses()
  const punyaPeran = (p) => peran.includes(p)
  const { punya } = useAkses()
  const jam = new Date().getHours()
  const salam = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 18 ? 'Selamat sore' : 'Selamat malam'
  const aksi = AKSI_CEPAT.filter((a) => punya(a.menu))
  // Portal satpam: tampilan bergaya beranda situs (urutan isi tetap sama)
  const situs = useGayaSitus()

  return (
    <>
      {situs ? (
        <div className="position-relative isolate mb-6 overflow-hidden rounded-5 bg-merah-700 p-6 text-white p-sm-9">
          <span
            aria-hidden="true"
            className="spanduk-staf__cincin"
          />
          <div className="d-flex flex-column gap-5 flex-sm-row align-items-sm-center gap-sm-7">
            <Avatar nama={nama} size="xl" className="bg-white text-merah-700 cincin-putih-tebal-20" />
            <div>
              <p className="fs-sm fw-semibold text-krem">{formatHari(todayKey())}</p>
              <h1 className="mt-1-5 judul-sapaan text-white fs-sm-5xl">
                {salam}, <span className="text-stabilo">{nama.split(',')[0]}</span>
              </h1>
              <div className="mt-4 d-flex flex-wrap gap-2">
                {peran.map((p) => (
                  <span
                    key={p}
                    className="d-inline-flex align-items-center gap-2 rounded-pill bg-white bg-opacity-10 px-3-5 py-1-5 fs-13 fw-bold border border-white border-opacity-20"
                  >
                    <span aria-hidden="true" className="h-1-5 w-1-5 rounded-pill bg-stabilo" />
                    {PERAN[p]?.label}
                    {p === 'wali_kelas' && kelas && ` ${kelas}`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="position-relative mb-6 overflow-hidden rounded-5 gradasi-merah p-6 text-white p-sm-8">
          <div className="pola-titik position-absolute inset-0" />
          <Gumpalan className="putar-lambat position-absolute end-n20 top-n24 h-80 w-80 text-white text-opacity-10" />
          <div className="position-relative d-flex flex-column gap-5 flex-sm-row align-items-sm-center">
            <Avatar nama={nama} size="xl" className="bg-white text-merah-700 cincin-putih-tebal" />
            <div>
              <p className="fs-sm text-merah-100">{formatHari(todayKey())}</p>
              <h1 className="fs-3xl fw-bold">
                {salam}, {nama.split(',')[0]} <span className="lambai">👋</span>
              </h1>
              <div className="mt-3 d-flex flex-wrap gap-2">
                {peran.map((p) => (
                  <span key={p} className="rounded-pill bg-white bg-opacity-15 px-3 py-1 fs-xs fw-semibold border border-white border-opacity-20">
                    {PERAN[p]?.label}
                    {p === 'wali_kelas' && kelas && ` ${kelas}`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <KartuPresensiSaya tautan className="mb-6" />

      {aksi.length > 0 && situs && (
        // Akses cepat seperti daftar layanan portal di beranda situs
        <div className={`mb-8 d-grid gap-3 ${aksi.length === 3 ? 'kolom-sm-3' : aksi.length < 3 ? 'kolom-sm-2' : 'kolom-sm-2 kolom-lg-4'}`}>
          {aksi.map(({ menu, ke, label, icon: Icon }) => (
            <Link
              key={menu}
              to={`${base}/${ke ?? menu}`}
              className="grup d-flex min-h-16 align-items-center gap-4 rounded-4 bg-white p-4 border border-garis transisi hover-angkat-sedikit hover-garis-merah"
            >
              <span className="d-flex h-12 w-12 flex-shrink-0 align-items-center justify-content-center rounded-3 bg-primary text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="flex-1 fw-bold text-tinta">{label}</span>
              <ArrowRight className="h-4 w-4 text-merah-700 transisi grup-geser" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}

      {aksi.length > 0 && !situs && (
        <div className={`mb-8 d-grid kolom-2 gap-3 ${aksi.length > 6 ? 'kolom-sm-4 kolom-xl-7' : 'kolom-sm-3 kolom-lg-6'}`}>
          {aksi.map(({ menu, ke, label, icon: Icon, warna }) => (
            <Link
              key={menu}
              to={`${base}/${ke ?? menu}`}
              className="grup d-flex flex-column align-items-center gap-2 rounded-3 bg-white p-4 text-center shadow-sm border border-abu-200 transisi hover-angkat-sedikit hover-bayangan-kecil"
            >
              <span className={`d-flex h-11 w-11 align-items-center justify-content-center rounded-2 transisi grup-besar ${warna}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="fs-xs fw-bold text-tinta-2">{label}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="antara-y-8">
        {punyaPeran('wali_kelas') && kelas && <PanelWaliKelas kelas={kelas} base={base} />}

        <div className="d-grid gap-6 kolom-lg-2">
          <RingkasanPresensi />

          <PanelMengajar guruId={guruId} base={base} bisaPresensi={punya('absensi')} />

          {punyaPeran('guru_mapel') && <PanelGuruMapel guruId={guruId} base={base} />}
          {punyaPeran('tata_usaha') && <PanelSpp base={base} />}
          {punyaPeran('pustakawan') && <PanelPerpus base={base} />}

          {punyaPeran('wakasek_kurikulum') && (
            <Panel judul="Agenda Akademik Terdekat" ke={`${base}/kalender`}>
              <ul className="bertahap antara-y-2">
                {agendaMendatang(4).map((e) => (
                  <li key={e.judul + e.mulai} className={`rounded-2 px-4 py-3 ${JENIS_AGENDA[e.jenis].soft}`}>
                    <p className="fs-sm fw-bold">{e.judul}</p>
                    <p className="fs-xs opacity-80">{rentangAgenda(e)}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {punyaPeran('wakasek_kesiswaan') && <PanelKesiswaan base={base} />}
          {punya('ortu') && <PanelSiswaPerluDilengkapi base={base} />}

          {punyaPeran('wakasek_sarpras') && <PanelSarpras base={base} />}
          {punyaPeran('guru_bk') && <PanelBk base={base} />}
          {punyaPeran('satpam') && <PanelKeamanan base={base} />}
        </div>

        <JamSekolah untukGuru />

        {peran.length === 0 && (
          <Card>
            <EmptyState icon={BookOpen} title="Belum ada jabatan" desc="Hubungi Kepala Sekolah untuk mengatur jabatan dan hak akses Anda." />
          </Card>
        )}
      </div>
    </>
  )
}

export function PanelSpp({ base }) {
  const { data } = useData()
  const r = ringkasSpp(data)
  return (
    <Panel judul="Keuangan SPP" ke={`${base}/spp`}>
      <div className="d-grid kolom-2 gap-3">
        <div className="rentang-2 d-flex align-items-center gap-3 rounded-2 bg-success-subtle p-4">
          <Wallet className="h-6 w-6 text-success" />
          <div>
            <p className="fs-xs text-success">Terkumpul bulan ini</p>
            <p className="fs-2xl fw-extrabold text-success">{rupiah(r.terkumpul)}</p>
          </div>
        </div>
        <div className="rounded-2 bg-info-subtle p-4">
          <p className="fs-xs text-info">Lunas bulan ini</p>
          <p className="fs-xl fw-extrabold text-info">
            {r.lunasBulanIni}/{data.siswa.length}
          </p>
        </div>
        <div className="rounded-2 bg-danger-subtle p-4">
          <p className="fs-xs text-danger">Siswa menunggak</p>
          <p className="fs-xl fw-extrabold text-danger">{r.menunggak}</p>
        </div>
      </div>
    </Panel>
  )
}

// Wakasek Kesiswaan: ringkasan siswa & kehadiran, dengan pintasan menambah siswa baru
function PanelKesiswaan({ base }) {
  const { data } = useData()
  const baru = siswaBaru(data)
  return (
    <Panel judul="Kesiswaan" ke={`${base}/kehadiran`}>
      <div className="d-grid kolom-3 gap-3">
        <div className="rounded-2 bg-info-subtle p-4">
          <p className="fs-xs text-info">Jumlah siswa</p>
          <p className="fs-2xl fw-extrabold text-info">{data.siswa.length}</p>
        </div>
        <div className="rounded-2 bg-success-subtle p-4">
          <p className="fs-xs text-success">Kehadiran sekolah</p>
          <p className="fs-2xl fw-extrabold text-success">{kehadiranSekolah(data)}%</p>
        </div>
        <div className="rounded-2 bg-warning-subtle p-4">
          <p className="fs-xs text-warning-emphasis">Kehadiran &lt; 90%</p>
          <p className="fs-2xl fw-extrabold text-warning-emphasis">{rekapSiswa(data).filter(perluPerhatianHadir).length}</p>
        </div>
      </div>
      <div className="mt-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <p className="fs-sm text-tinta-3">{baru.length ? `${baru.length} siswa baru dalam 30 hari terakhir` : 'Belum ada siswa baru dalam 30 hari terakhir'}</p>
        <div className="d-flex flex-wrap gap-2">
          <Link to={`${base}/siswa`} className={btn.secondary}>
            <Users className="h-4 w-4" /> Data Siswa
          </Link>
          <Link to={`${base}/siswa?tambah=1`} className={btn.primary}>
            <UserRoundPlus className="h-4 w-4" /> Tambah Siswa
          </Link>
        </div>
      </div>
    </Panel>
  )
}

/*
  Tata Usaha: siswa yang belum terhubung dengan data keluarga, mis. siswa baru yang ditambahkan Wakasek
  Kesiswaan. Tanpa data keluarga, kontak orang tua & akun Portal Orang Tua belum bisa dibuat.
*/
function PanelSiswaPerluDilengkapi({ base }) {
  const { data } = useData()
  const daftar = siswaTanpaKeluarga(data)
  if (!daftar.length) return null
  return (
    <Panel judul="Data siswa perlu dilengkapi" ke={`${base}/ortu`}>
      <p className="mt-n2 mb-3 fs-sm text-tinta-3">
        {daftar.length} siswa belum terhubung dengan data orang tua, jadi kontak keluarga dan akun orang tuanya belum ada.
      </p>
      <ul className="bertahap antara-y-2">
        {daftar.slice(0, 4).map((s) => (
          <li key={s.nis} className="d-flex align-items-center gap-3 rounded-2 bg-abu-50 px-4 py-3">
            <Avatar nama={s.nama} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="fs-sm fw-semibold text-tinta">{s.nama}</p>
              <p className="fs-xs text-tinta-3">
                NIS {s.nis} · Kelas {s.kelas}
                {!s.akun && ' · akun siswa belum dibuat'}
              </p>
            </div>
            <Link to={`${base}/ortu?anak=${s.nis}`} className="flex-shrink-0 rounded-1 bg-primary px-2-5 py-1 fs-xs fw-bold text-white hover-latar-merah-tua">
              Lengkapi
            </Link>
          </li>
        ))}
      </ul>
      {daftar.length > 4 && <p className="mt-2 fs-xs text-tinta-3">dan {daftar.length - 4} siswa lainnya</p>}
    </Panel>
  )
}

function Angka({ label, nilai, tone }) {
  const warna = { sky: 'bg-info-subtle text-info', amber: 'bg-warning-subtle text-warning-emphasis', rose: 'bg-danger-subtle text-danger', emerald: 'bg-success-subtle text-success' }
  return (
    <div className={`d-flex align-items-center justify-content-between gap-3 rounded-2 px-4 py-2-5 ubin-ringkas-kecil ${warna[tone]}`}>
      <p className="fs-xs">{label}</p>
      <p className="fs-2xl fw-extrabold">{nilai}</p>
    </div>
  )
}

function PanelSarpras({ base }) {
  const { data } = useData()
  const perluPerbaikan = data.kerusakan.filter((k) => k.status !== 'Selesai')
  return (
    <Panel judul="Sarana & Prasarana" ke={`${base}/kerusakan`}>
      <div className="d-grid kolom-2 gap-3">
        <Angka label="Laporan belum selesai" nilai={perluPerbaikan.length} tone="amber" />
        <Angka label="Barang rusak berat" nilai={data.inventaris.filter((b) => b.kondisi === 'Rusak Berat').length} tone="rose" />
      </div>
      {perluPerbaikan.some((k) => k.prioritas === 'Tinggi') && (
        <p className="mt-3 d-flex align-items-center gap-2 fs-sm text-danger">
          <AlertTriangle className="h-4 w-4" /> Ada kerusakan prioritas tinggi yang belum selesai.
        </p>
      )}
    </Panel>
  )
}

function PanelBk({ base }) {
  const { data } = useData()
  const aktif = data.konseling.filter((k) => k.status !== 'Selesai')
  return (
    <Panel judul="Bimbingan Konseling" ke={`${base}/konseling`}>
      <div className="d-grid kolom-2 gap-3">
        <Angka label="Kasus aktif" nilai={aktif.length} tone="sky" />
        <Angka label="Perlu pemantauan" nilai={aktif.filter((k) => k.status === 'Perlu Pemantauan').length} tone="amber" />
      </div>
      <p className="mt-3 fs-sm text-tinta-3">
        {rekapSiswa(data).filter(perluPerhatianHadir).length} siswa kehadirannya di bawah 90% — cek di Rekap Kehadiran.
      </p>
    </Panel>
  )
}

// Angka besar berwarna penuh ala kartu bento beranda situs (portal satpam)
function AngkaBento({ label, nilai, nada }) {
  const gaya = { merah: 'bg-merah-700 text-white', stabilo: 'bg-stabilo text-tinta', gelap: 'bg-tinta text-white' }
  return (
    <div
      className={`d-flex align-items-center justify-content-between gap-3 rounded-3 px-5 py-4 ubin-ringkas ${gaya[nada]}`}
    >
      <p className="fs-sm fw-semibold opacity-90">{label}</p>
      <p className="angka fs-3xl fw-extrabold ls-tight ubin-ringkas__nilai">{nilai}</p>
    </div>
  )
}

function PanelKeamanan({ base }) {
  const { data } = useData()
  const situs = useGayaSitus()
  const hariIni = todayKey()
  const tamu = data.bukuTamu.filter((t) => t.tanggal === hariIni)
  const terjadwal = data.kunjungan.filter((k) => k.status === 'Dikonfirmasi' && k.tanggal === hariIni)
  return (
    <Panel judul="Keamanan & Tamu Hari Ini" ke={`${base}/bukutamu`} className={situs ? 'd-flex flex-column' : ''}>
      {situs ? (
        <div className="d-grid flex-1 gap-2 kisi-ringkas">
          <AngkaBento label="Tamu" nilai={tamu.length} nada="merah" />
          <AngkaBento label="Masih di dalam" nilai={tamu.filter((t) => !t.keluar).length} nada="stabilo" />
          <AngkaBento label="Terjadwal" nilai={terjadwal.length} nada="gelap" />
        </div>
      ) : (
        <div className="d-grid gap-2 kisi-ringkas">
          <Angka label="Tamu" nilai={tamu.length} tone="sky" />
          <Angka label="Masih di dalam" nilai={tamu.filter((t) => !t.keluar).length} tone="amber" />
          <Angka label="Terjadwal" nilai={terjadwal.length} tone="emerald" />
        </div>
      )}
    </Panel>
  )
}

function PanelPerpus({ base }) {
  const { data } = useData()
  const { aktif, terlambat } = ringkasPerpus(data)
  return (
    <Panel judul="Perpustakaan" ke={`${base}/perpustakaan`}>
      <div className="d-grid kolom-2 gap-3">
        <div className="rounded-2 bg-info-subtle p-4">
          <Library className="h-5 w-5 text-info" />
          <p className="mt-2 fs-xs text-info">Sedang dipinjam</p>
          <p className="fs-2xl fw-extrabold text-info">{aktif.length}</p>
        </div>
        <div className="rounded-2 bg-danger-subtle p-4">
          <CalendarDays className="h-5 w-5 text-danger" />
          <p className="mt-2 fs-xs text-danger">Terlambat kembali</p>
          <p className="fs-2xl fw-extrabold text-danger">{terlambat.length}</p>
        </div>
      </div>
    </Panel>
  )
}
