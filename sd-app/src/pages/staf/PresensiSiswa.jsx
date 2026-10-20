import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, CalendarClock, CheckCheck, ClipboardCheck, Info, KeyRound, Lock, Maximize2, RefreshCw, Search, Square, Users, X } from 'lucide-react'
import { useJamBerjalan } from '../../components/Presensi'
import { teksJejak } from '../../components/PresensiOtp'
import { Alert, Avatar, Card, DashHeader, EmptyState, Modal, Progres, STATUS_ABSEN, btn, inputCls, labelCls } from '../../components/ui'
import { useLingkup } from '../../context/akses'
import { useData, useSegarCepat } from '../../context/DataContext'
import { MAPEL, SESI } from '../../data/dummy'
import { formatHari, isHariSekolah, namaHari, parseKey, todayKey } from '../../utils/format'
import { guruPelajaran, jadwalMengajar, jamPelajaran, labelSesi, pelajaranHari, statusDiPelajaran, statusPelajaran } from '../../utils/jadwal'
import { MAKS_PERCOBAAN, MASA_BERLAKU_MENIT, formatSisa, jamDari, sesiAktifKelas, sesiBerlaku, sesiTerakhir, sisaDetik } from '../../utils/otp'

const HARIAN = 'harian'

const keMenit = (jam) => {
  const [h, m] = jam.split('.').map(Number)
  return h * 60 + m
}

// Indeks sesi yang sedang berlangsung (mulai 10 menit sebelum bel), -1 jika di luar jam pelajaran
function sesiSekarang() {
  const d = new Date()
  const menit = d.getHours() * 60 + d.getMinutes()
  return SESI.findIndex((s) => menit >= keMenit(s.mulai) - 10 && menit < keMenit(s.selesai))
}

// Kelas & pelajaran yang sedang diajar guru ini menurut jadwal, untuk pilihan bawaan
function ajarSekarang(guru, guruId, daftarKelas) {
  const i = sesiSekarang()
  if (i < 0) return null
  for (const kelas of daftarKelas) {
    const p = pelajaranHari(kelas, todayKey()).find((x) => x.jam === i)
    if (p && guruPelajaran(guru, kelas, p.mapel)?.id === guruId) return { kelas, kunci: p.kunci }
  }
  return null
}

// Kode besar untuk ditampilkan di proyektor kelas
function LayarKode({ sesi, hadir, total, onTutup }) {
  const sekarang = useJamBerjalan()
  const sisa = sisaDetik(sesi, sekarang.getTime())
  useEffect(() => {
    const tombol = (e) => e.key === 'Escape' && onTutup()
    document.addEventListener('keydown', tombol)
    return () => document.removeEventListener('keydown', tombol)
  }, [onTutup])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Kode presensi kelas ${sesi.kelas}`}
      className="position-fixed inset-0 z-50 d-flex flex-column align-items-center justify-content-center bg-tinta p-6 text-white"
    >
      <div className="pola-titik position-absolute inset-0 opacity-30" />
      <button onClick={onTutup} className="position-absolute end-6 top-6 rounded-pill bg-white bg-opacity-10 p-3 hover-terang" aria-label="Tutup layar penuh">
        <X className="h-6 w-6" />
      </button>
      <p className="position-relative text-center fs-xl fw-semibold text-abu-300">
        Presensi Kelas {sesi.kelas}
        {sesi.kunci && ` · ${MAPEL[sesi.mapel]?.nama}`}
      </p>
      <p className="position-relative mt-2 text-center text-abu-400">Buka portal siswa → Presensi Hari Ini → ketik kode ini</p>
      <div className="position-relative mt-10 d-flex gap-3 gap-sm-5">
        {sesi.kode.split('').map((d, i) => (
          <span
            key={i}
            className={`d-flex h-24 w-16 align-items-center justify-content-center rounded-3 bg-white fs-6xl fw-bold text-tinta h-sm-36 w-sm-28 fs-sm-8xl ${i === 3 ? 'ms-4 ms-sm-8' : ''}`}
          >
            {d}
          </span>
        ))}
      </div>
      {sisa > 0 && !sesi.ditutup ? (
        <p className={`position-relative mt-10 fs-5xl fw-bold angka ${sisa < 180 ? 'teks-terang-amber' : 'teks-terang-emerald'}`}>
          {formatSisa(sisa)}
        </p>
      ) : (
        <p className="position-relative mt-10 fs-4xl fw-bold teks-terang-rose">Kode sudah tidak berlaku</p>
      )}
      <p className="position-relative mt-3 fs-lg text-abu-300">
        {hadir} dari {total} siswa sudah hadir
      </p>
    </div>
  )
}

// Panel sesi OTP hari ini untuk presensi harian (`pel` kosong) atau satu pelajaran
function PanelOtp({ kelas, pel, siswaKelas, hadir, jejakSiswa }) {
  const { data, bukaSesiPresensi, tutupSesiPresensi } = useData()
  const sekarang = useJamBerjalan()
  const [layar, setLayar] = useState(false)
  const hariIni = todayKey()
  const sesi = sesiTerakhir(data, kelas, hariIni, pel?.kunci ?? null)
  const aktif = sesi && sesiBerlaku(sesi, sekarang.getTime())
  const lain = !aktif && sesiAktifKelas(data, kelas, hariIni, sekarang.getTime())
  const sisa = sesi ? sisaDetik(sesi, sekarang.getTime()) : 0
  const lewatOtp = sesi ? siswaKelas.filter((s) => jejakSiswa(s.nis)?.sesiId === sesi.id).length : 0
  const terkunci = sesi ? siswaKelas.filter((s) => (sesi.gagal?.[s.nis] ?? 0) >= MAKS_PERCOBAAN).length : 0
  // Selama kode berlaku, siswa yang hadir dari HP masing-masing cepat terlihat di sini
  useSegarCepat(!!aktif)
  const [membuka, setMembuka] = useState(false)
  const buka = async () => {
    if (membuka) return
    setMembuka(true)
    await bukaSesiPresensi(kelas, pel)
    setMembuka(false)
  }
  const tujuan = pel ? `pelajaran ${MAPEL[pel.mapel].nama} (${jamPelajaran(pel)})` : 'harian'

  if (!aktif) {
    return (
      <Card className="mb-6 overflow-hidden">
        <div className="d-flex flex-column gap-5 p-6 flex-md-row align-items-md-center">
          <span className="d-flex h-14 w-14 flex-shrink-0 align-items-center justify-content-center rounded-3 bg-merah-50 text-primary">
            <KeyRound className="h-7 w-7" />
          </span>
          <div className="flex-1">
            <h2 className="fs-lg fw-bold text-tinta">
              Buka presensi {tujuan} Kelas {kelas}
            </h2>
            <p className="mt-1 fs-sm text-tinta-3">
              Kode 6 angka acak berlaku {MASA_BERLAKU_MENIT} menit. Tampilkan di proyektor, lalu siswa memasukkan kodenya di menu{' '}
              <span className="fw-semibold text-tinta-2">Presensi Hari Ini</span>.{' '}
              {pel ? 'Siswa yang memasukkan kode tercatat hadir di pelajaran ini.' : 'Siswa yang memasukkan kode tercatat hadir hari ini.'}
            </p>
          </div>
          <button onClick={buka} className={`${btn.primary} py-3 w-md-52`}>
            <KeyRound className="h-5 w-5" /> {sesi ? 'Buka sesi baru' : 'Buka Presensi'}
          </button>
        </div>
        {lain && (
          <p className="d-flex align-items-start gap-2 border-top border-warning-subtle bg-warning-subtle px-6 py-3 fs-sm text-warning-emphasis">
            <AlertTriangle className="mt-0-5 h-4 w-4 flex-shrink-0" />
            Kode {lain.kunci ? labelSesi(lain) : 'presensi harian'} dari {lain.oleh.split(',')[0]} masih berlaku sampai {jamDari(lain.berakhir)}. Membuka presensi ini akan
            menutup kode tersebut.
          </p>
        )}
        {sesi && (
          <p className="border-top border-abu-100 bg-abu-50 px-6 py-3 fs-sm text-tinta-2">
            Sesi terakhir {jamDari(sesi.mulai)}–{jamDari(sesi.berakhir)} oleh {sesi.oleh.split(',')[0]} · <b>{lewatOtp}</b> siswa hadir lewat kode
            {terkunci > 0 && ` · ${terkunci} siswa terkunci karena salah kode`}
          </p>
        )}
      </Card>
    )
  }

  return (
    <>
      <Card className="mb-6 overflow-hidden border-success-subtle">
        <div className="d-grid gap-6 p-6 kolom-lg-auto-isi-auto align-items-lg-center">
          <div>
            <p className="d-flex align-items-center gap-1-5 fs-xs fw-bold text-uppercase ls-wider text-success">
              <span className="h-2 w-2 berdenyut rounded-pill titik-emerald" /> Kode {pel ? MAPEL[pel.mapel].nama : 'presensi harian'} · {kelas}
            </p>
            <div className="mt-3 d-flex gap-1-5" aria-label={`Kode ${sesi.kode}`}>
              {sesi.kode.split('').map((d, i) => (
                <span
                  key={i}
                  className={`d-flex h-14 w-11 align-items-center justify-content-center rounded-2 bg-tinta fs-3xl fw-bold text-white ${i === 3 ? 'ms-2' : ''}`}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <div className="d-flex align-items-baseline justify-content-between gap-3">
              <p className="fs-sm text-tinta-3">
                Berlaku sampai <b className="text-tinta">{jamDari(sesi.berakhir)}</b>
              </p>
              <p className={`fs-2xl fw-bold angka ${sisa < 180 ? 'text-warning-emphasis' : 'text-success'}`}>{formatSisa(sisa)}</p>
            </div>
            <Progres nilai={(sisa / (MASA_BERLAKU_MENIT * 60)) * 100} warna={sisa < 180 ? 'titik-amber' : 'titik-emerald'} className="mt-2" />
            <p className="mt-3 fs-sm text-tinta-2">
              <b className="text-tinta">{hadir}</b> dari {siswaKelas.length} siswa hadir · {lewatOtp} lewat kode
              {terkunci > 0 && <span className="text-danger"> · {terkunci} terkunci</span>}
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2 flex-lg-column">
            <button onClick={() => setLayar(true)} className={btn.primary}>
              <Maximize2 className="h-4 w-4" /> Layar penuh
            </button>
            <button onClick={buka} className={btn.secondary} title="Kode lama langsung tidak berlaku">
              <RefreshCw className="h-4 w-4" /> Kode baru
            </button>
            <button onClick={() => tutupSesiPresensi(sesi.id)} className={btn.danger}>
              <Square className="h-4 w-4" /> Tutup sesi
            </button>
          </div>
        </div>
      </Card>
      {layar && <LayarKode sesi={sesi} hadir={hadir} total={siswaKelas.length} onTutup={() => setLayar(false)} />}
    </>
  )
}

// Tombol pilihan presensi: harian atau salah satu pelajaran hari itu
function PilihanPresensi({ aktif, onClick, judul, sub, ringkas, warna, berjalan }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={aktif}
      className={`position-relative w-44 flex-shrink-0 rounded-3 p-3-5 text-start transisi w-sm-48 ${
        aktif ? 'bg-tinta text-white shadow-lg' : 'bg-white border border-abu-200 hover-garis-abu'
      }`}
    >
      {berjalan && <span className="position-absolute end-3 top-3 h-2-5 w-2-5 berdenyut rounded-pill titik-emerald" title="Kode sedang berlaku" />}
      <span className={`d-inline-block rounded-1 px-2 py-0-5 fs-xs fw-bold ${aktif ? 'bg-white bg-opacity-15 text-white' : warna}`}>{judul}</span>
      <p className={`mt-2 text-truncate fs-xs ${aktif ? 'text-abu-300' : 'text-tinta-3'}`}>{sub}</p>
      <p className={`mt-0-5 fs-sm fw-semibold ${aktif ? 'text-white' : 'text-tinta'}`}>{ringkas}</p>
    </button>
  )
}

const SARING = [['semua', 'Semua'], ['belum', 'Belum tercatat'], ...Object.entries(STATUS_ABSEN).map(([k, s]) => [k, s.label])]

export default function PresensiSiswa() {
  const L = useLingkup('absensi')
  const { data, ubahAbsensiSiswa, ubahAbsensiPelajaran } = useData()
  const [params] = useSearchParams()
  const hariIni = todayKey()
  const diminta = params.get('kelas')
  const [awal] = useState(() => ajarSekarang(data.guru, L.guruId, L.daftarKelas))
  const [kelas, setKelas] = useState(() =>
    L.daftarKelas.includes(diminta) ? diminta : L.kelas && L.daftarKelas.includes(L.kelas) ? L.kelas : (awal?.kelas ?? L.daftarKelas[0] ?? ''),
  )
  const [tanggal, setTanggal] = useState(hariIni)
  // Wali kelas mulai dari presensi harian; guru mapel dari pelajaran yang sedang ia ajar
  const [pilihan, setPilihan] = useState(() => params.get('pelajaran') ?? (kelas === L.kelas ? HARIAN : awal?.kelas === kelas ? awal.kunci : null))
  const [saring, setSaring] = useState('semua')
  const [cari, setCari] = useState('')
  const [konfirmasiAlpa, setKonfirmasiAlpa] = useState(false)

  if (!L.daftarKelas.length) return <EmptyState icon={ClipboardCheck} title="Belum ada kelas" desc="Anda belum memiliki kelas untuk dipresensi." />

  const siswaKelas = data.siswa.filter((s) => s.kelas === kelas).sort((a, b) => a.nama.localeCompare(b.nama))
  const libur = !isHariSekolah(parseKey(tanggal))
  const wali = data.guru.find((g) => g.peran?.includes('wali_kelas') && g.kelas === kelas)
  const waliIni = L.kelas === kelas

  // Wali kelas memegang presensi harian & melihat semua pelajaran kelasnya; guru mapel hanya pelajarannya
  const semuaPelajaran = pelajaranHari(kelas, tanggal).map((p) => ({ ...p, guru: guruPelajaran(data.guru, kelas, p.mapel) }))
  const daftarPelajaran = semuaPelajaran.filter((p) => waliIni || p.guru?.id === L.guruId)
  const opsi = [...(waliIni ? [HARIAN] : []), ...daftarPelajaran.map((p) => p.kunci)]
  const pilih = opsi.includes(pilihan) ? pilihan : (opsi[0] ?? null)
  const pel = pilih && pilih !== HARIAN ? daftarPelajaran.find((p) => p.kunci === pilih) : null

  const statusSiswa = (nis) => (pel ? statusDiPelajaran(data, tanggal, nis, pel.kunci) : { status: data.absensi[tanggal]?.[nis] ?? null, sumber: 'harian' })
  const jejakSiswa = (nis) => (pel ? data.jejakMapel[tanggal]?.[nis]?.[pel.kunci] : data.jejakAbsensi[tanggal]?.[nis])
  const status = Object.fromEntries(siswaKelas.map((s) => [s.nis, statusSiswa(s.nis).status]))
  const sesi = pilih && tanggal === hariIni ? sesiTerakhir(data, kelas, hariIni, pel?.kunci ?? null) : null
  const sesiAktif = sesi && sesiBerlaku(sesi)
  const hitung = (k) => siswaKelas.filter((s) => (k === 'belum' ? !status[s.nis] : k === 'semua' || status[s.nis] === k)).length
  const belum = siswaKelas.filter((s) => !status[s.nis])
  const daftar = siswaKelas.filter(
    (s) => (saring === 'semua' || (saring === 'belum' ? !status[s.nis] : status[s.nis] === saring)) && s.nama.toLowerCase().includes(cari.trim().toLowerCase()),
  )
  const tandai = (perubahan) => (pel ? ubahAbsensiPelajaran(tanggal, pel.kunci, perubahan) : ubahAbsensiSiswa(tanggal, perubahan))
  const tingkat = [...new Set(L.daftarKelas.map((k) => k[0]))]

  // Ringkasan tiap pilihan untuk tombol di atas daftar
  const hadirHarian = siswaKelas.filter((s) => data.absensi[tanggal]?.[s.nis] === 'H').length
  const ringkasPelajaran = (p) => {
    const tercatat = siswaKelas.filter((s) => data.absensiMapel[tanggal]?.[s.nis]?.[p.kunci])
    if (!tercatat.length) return 'Belum dipresensi'
    return `${tercatat.filter((s) => data.absensiMapel[tanggal][s.nis][p.kunci] === 'H').length}/${siswaKelas.length} hadir`
  }
  const berjalan = (kunci) => {
    const s = tanggal === hariIni && sesiTerakhir(data, kelas, hariIni, kunci)
    return !!s && sesiBerlaku(s)
  }

  // Untuk wali kelas: siswa yang hadir harian tetapi tidak di suatu pelajaran (atau sebaliknya)
  const selisih = !pel && waliIni
    ? siswaKelas.flatMap((s) => {
        const harian = data.absensi[tanggal]?.[s.nis]
        return semuaPelajaran
          .map((p) => ({ p, st: data.absensiMapel[tanggal]?.[s.nis]?.[p.kunci] }))
          .filter(({ st }) => st && harian && (harian === 'H' ? st !== 'H' : st === 'H'))
          .map(({ p, st }) => ({ s, p, st, harian }))
      })
    : []

  // Jadwal mengajar guru mapel hari itu, untuk berpindah cepat
  const ajarHariIni = jadwalMengajar(data.guru, L.guruId).filter((j) => j.hari === namaHari(tanggal))

  return (
    <>
      <DashHeader
        title="Presensi Siswa"
        desc="Wali kelas mencatat kehadiran harian, guru pengampu mencatat kehadiran di pelajarannya. Semuanya bisa dengan kode OTP dan bisa diubah kapan saja."
      />

      <Card className="mb-4 d-flex flex-column gap-4 p-4 flex-sm-row align-items-sm-end p-sm-5">
        <div>
          <label htmlFor="kelas" className={labelCls}>
            Kelas
          </label>
          {L.daftarKelas.length > 1 ? (
            <select id="kelas" value={kelas} onChange={(e) => setKelas(e.target.value)} className={`${inputCls} w-sm-44`}>
              {tingkat.map((t) => (
                <optgroup key={t} label={`Kelas ${t}`}>
                  {L.daftarKelas
                    .filter((k) => k[0] === t)
                    .map((k) => (
                      <option key={k} value={k}>
                        Kelas {k}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          ) : (
            <p id="kelas" className="rounded-2 bg-abu-50 px-3-5 py-2-5 fs-sm fw-semibold text-tinta">
              Kelas {kelas}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="tanggal" className={labelCls}>
            Tanggal
          </label>
          <input
            id="tanggal"
            type="date"
            value={tanggal}
            max={hariIni}
            onChange={(e) => e.target.value && setTanggal(e.target.value)}
            className={`${inputCls} w-sm-48`}
          />
        </div>
        <div className="fs-sm text-tinta-3 pb-sm-2-5">
          {formatHari(tanggal)} · {siswaKelas.length} siswa{wali && ` · Wali kelas ${wali.nama.split(',')[0]}`}
        </div>
      </Card>

      {ajarHariIni.length > 0 && !waliIni && (
        <div className="mb-4 d-flex flex-wrap align-items-center gap-2 fs-sm">
          <span className="d-flex align-items-center gap-1-5 fw-semibold text-tinta-2">
            <CalendarClock className="h-4 w-4" /> Jadwal Anda {tanggal === hariIni ? 'hari ini' : namaHari(tanggal)}:
          </span>
          {ajarHariIni.map((j) => (
            <button
              key={j.kelas + j.kunci}
              onClick={() => {
                setKelas(j.kelas)
                setPilihan(j.kunci)
              }}
              className={`rounded-pill px-3 py-1 fw-semibold transisi ${
                j.kelas === kelas && j.kunci === pilih ? 'bg-tinta text-white' : 'bg-white text-tinta-2 border border-abu-200 hover-latar'
              }`}
            >
              {j.mulai} · {j.kelas} · {MAPEL[j.mapel].nama}
            </button>
          ))}
        </div>
      )}

      {libur ? (
        <div className="mb-4">
          <Alert tone="warning">Tanggal yang dipilih adalah hari libur (Sabtu/Minggu).</Alert>
        </div>
      ) : !opsi.length ? (
        <Card>
          <EmptyState
            icon={CalendarClock}
            title={`Anda tidak mengajar di Kelas ${kelas} pada hari ${namaHari(tanggal)}`}
            desc="Guru mapel mempresensi siswa di pelajaran yang diampunya. Pilih kelas atau jadwal Anda di atas."
          />
        </Card>
      ) : (
        <>
          <div className="mx-n4 mb-4 d-flex gap-2 overflow-x-auto px-4 pb-1 mx-sm-0 px-sm-0" role="group" aria-label="Pilih presensi">
            {waliIni && (
              <PilihanPresensi
                aktif={pilih === HARIAN}
                onClick={() => setPilihan(HARIAN)}
                judul="Harian"
                sub="Kehadiran hari ini · wali kelas"
                ringkas={`${hadirHarian}/${siswaKelas.length} hadir`}
                warna="bg-primary-100 text-primary-700"
                berjalan={berjalan(null)}
              />
            )}
            {daftarPelajaran.map((p) => (
              <PilihanPresensi
                key={p.kunci}
                aktif={pilih === p.kunci}
                onClick={() => setPilihan(p.kunci)}
                judul={MAPEL[p.mapel].nama}
                sub={`${jamPelajaran(p)} · ${p.guru?.nama.split(',')[0] ?? MAPEL[p.mapel].pengampu ?? '–'}`}
                ringkas={ringkasPelajaran(p)}
                warna={MAPEL[p.mapel].warna}
                berjalan={berjalan(p.kunci)}
              />
            ))}
          </div>

          {tanggal === hariIni && (
            <PanelOtp
              key={`${kelas}-${pilih}`}
              kelas={kelas}
              pel={pel}
              siswaKelas={siswaKelas}
              hadir={siswaKelas.filter((s) => status[s.nis] === 'H').length}
              jejakSiswa={jejakSiswa}
            />
          )}

          {selisih.length > 0 && (
            <div className="mb-4">
              <Alert tone="warning">
                <p className="fw-semibold">Kehadiran di pelajaran berbeda dengan presensi harian:</p>
                <ul className="mt-1 antara-y-0-5">
                  {selisih.map(({ s, p, st, harian }) => (
                    <li key={s.nis + p.kunci}>
                      {s.nama} — {STATUS_ABSEN[st].label} di {MAPEL[p.mapel].nama} ({jamPelajaran(p)}), harian {STATUS_ABSEN[harian].label}
                    </li>
                  ))}
                </ul>
              </Alert>
            </div>
          )}

          <div className="mb-4 d-flex flex-wrap gap-2">
            {SARING.map(([k, label]) => (
              <button
                key={k}
                onClick={() => setSaring(k)}
                className={`rounded-pill px-3-5 py-1-5 fs-sm fw-semibold transisi ${
                  saring === k ? 'bg-tinta text-white' : 'bg-white text-tinta-2 border border-abu-200 hover-latar'
                }`}
              >
                {label}
                <span className="ms-1-5 fs-xs opacity-70">{hitung(k)}</span>
              </button>
            ))}
          </div>

          <Card>
            <div className="d-flex flex-column gap-3 border-bottom border-abu-100 px-5 py-4 flex-lg-row align-items-lg-center justify-content-lg-between">
              <div className="position-relative w-lg-72">
                <Search className="pe-none position-absolute start-3-5 top-50 h-4 w-4 translate-middle-y text-abu-400" />
                <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama siswa..." className={`${inputCls} ps-10`} />
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button onClick={() => tandai(Object.fromEntries(belum.map((s) => [s.nis, 'H'])))} disabled={!belum.length} className={btn.secondary}>
                  <CheckCheck className="h-4 w-4" /> Sisanya Hadir
                </button>
                <button
                  onClick={() => setKonfirmasiAlpa(true)}
                  disabled={!belum.length || sesiAktif}
                  title={sesiAktif ? 'Tunggu sesi kode berakhir agar siswa sempat presensi' : undefined}
                  className={btn.secondary}
                >
                  <X className="h-4 w-4" /> Sisanya Alpa
                </button>
              </div>
            </div>

            {daftar.length === 0 ? (
              <EmptyState icon={Users} title="Tidak ada siswa" desc="Coba ubah saringan atau kata pencarian." />
            ) : (
              <ul className="pembatas-y pembatas-abu">
                {daftar.map((s) => {
                  const st = statusSiswa(s.nis)
                  const ikutHarian = pel && st.status && st.sumber === 'harian'
                  const j = ikutHarian ? { teks: 'Ikut presensi harian', cls: 'text-tinta-3' } : teksJejak(jejakSiswa(s.nis))
                  const kunci = sesi && (sesi.gagal?.[s.nis] ?? 0) >= MAKS_PERCOBAAN && st.status !== 'H'
                  return (
                    <li key={s.nis} className="d-flex flex-column gap-3 px-5 py-3-5 flex-sm-row align-items-sm-center">
                      <div className="d-flex min-w-0 flex-1 align-items-center gap-3">
                        <span className="w-6 flex-shrink-0 fs-sm text-abu-400">{siswaKelas.indexOf(s) + 1}</span>
                        <Avatar nama={s.nama} size="sm" />
                        <div className="min-w-0">
                          <p className="fw-semibold text-tinta">{s.nama}</p>
                          <p className="fs-xs text-tinta-3">
                            NIS {s.nis}
                            {j && <span className={`ms-2 ${j.cls}`}>· {j.teks}</span>}
                            {kunci && (
                              <span className="ms-2 d-inline-flex align-items-center gap-1 text-danger">
                                · <Lock className="h-3 w-3" /> {MAKS_PERCOBAAN}× salah kode
                              </span>
                            )}
                          </p>
                          {/* Wali kelas: kehadiran siswa di tiap pelajaran hari itu */}
                          {!pel && waliIni && semuaPelajaran.length > 0 && (
                            <div className="mt-1-5 d-flex gap-1" aria-label={`Kehadiran ${s.nama} per pelajaran`}>
                              {semuaPelajaran.map((p) => {
                                const sp = statusPelajaran(data, tanggal, s.nis, p.kunci)
                                const info = sp.sumber === 'pelajaran' ? STATUS_ABSEN[sp.status] : null
                                return (
                                  <span
                                    key={p.kunci}
                                    title={`${MAPEL[p.mapel].nama} (${jamPelajaran(p)}): ${info ? info.label : 'belum dipresensi tersendiri'}`}
                                    className={`h-1-5 w-6 rounded-pill ${info ? info.dot : 'bg-abu-200'}`}
                                  />
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="d-grid kolom-4 gap-1-5 d-sm-flex" role="radiogroup" aria-label={`Kehadiran ${s.nama}`}>
                        {Object.entries(STATUS_ABSEN).map(([kode, info]) => {
                          const terpilih = st.status === kode
                          return (
                            <button
                              key={kode}
                              role="radio"
                              aria-checked={terpilih}
                              onClick={() => tandai({ [s.nis]: kode })}
                              title={info.label}
                              className={`rounded-1 px-3 py-2 fs-sm fw-bold transisi w-sm-14 ${
                                terpilih
                                  ? `${info.cls} ${ikutHarian ? 'garis-luar-putus opacity-80' : 'cincin-arus'}`
                                  : 'bg-abu-50 text-abu-400 hover-latar-abu'
                              }`}
                            >
                              <span className="d-sm-none">{info.label}</span>
                              <span className="d-none d-sm-inline">{kode}</span>
                            </button>
                          )
                        })}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            <p className="d-flex align-items-start gap-2 rounded-bottom-3 border-top border-abu-100 bg-abu-50 px-5 py-3 fs-xs text-tinta-3">
              <Info className="mt-0-5 h-3-5 w-3-5 flex-shrink-0" />
              {pel
                ? `Presensi pelajaran ${MAPEL[pel.mapel].nama}. Siswa yang sakit, izin, atau alpa hari ini otomatis ikut presensi harian; siswa lain perlu tercatat di pelajaran ini.`
                : 'H = Hadir · S = Sakit · I = Izin · A = Alpa. Garis kecil di bawah nama = kehadiran di tiap pelajaran hari itu.'}{' '}
              Perubahan langsung tersimpan atas nama Anda dan terlihat oleh siswa serta orang tua.
            </p>
          </Card>
        </>
      )}

      <Modal
        open={konfirmasiAlpa}
        onClose={() => setKonfirmasiAlpa(false)}
        title="Tandai sisanya Alpa?"
        size="max-w-md"
        footer={
          <>
            <button onClick={() => setKonfirmasiAlpa(false)} className={btn.secondary}>
              Batal
            </button>
            <button
              onClick={() => {
                tandai(Object.fromEntries(belum.map((s) => [s.nis, 'A'])))
                setKonfirmasiAlpa(false)
              }}
              className="btn btn-danger"
            >
              Ya, tandai Alpa
            </button>
          </>
        }
      >
        <p className="text-tinta-2">
          {belum.length} siswa yang belum tercatat {pel ? `di pelajaran ${MAPEL[pel.mapel].nama}` : 'hari ini'} akan ditandai <b>Alpa</b>:{' '}
          {belum.map((s) => s.nama.split(' ')[0]).join(', ')}.
        </p>
      </Modal>
    </>
  )
}
