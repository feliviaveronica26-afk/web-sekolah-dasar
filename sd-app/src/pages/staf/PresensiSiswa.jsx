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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 p-6 text-white"
    >
      <div className="pola-titik absolute inset-0 opacity-30" />
      <button onClick={onTutup} className="absolute right-6 top-6 rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label="Tutup layar penuh">
        <X className="h-6 w-6" />
      </button>
      <p className="relative text-center text-xl font-semibold text-slate-300">
        Presensi Kelas {sesi.kelas}
        {sesi.kunci && ` · ${MAPEL[sesi.mapel]?.nama}`}
      </p>
      <p className="relative mt-2 text-center text-slate-400">Buka portal siswa → Presensi Hari Ini → ketik kode ini</p>
      <div className="relative mt-10 flex gap-3 sm:gap-5">
        {sesi.kode.split('').map((d, i) => (
          <span
            key={i}
            className={`grid h-24 w-16 place-items-center rounded-2xl bg-white font-display text-6xl font-bold text-slate-900 sm:h-36 sm:w-28 sm:text-8xl ${i === 3 ? 'ml-4 sm:ml-8' : ''}`}
          >
            {d}
          </span>
        ))}
      </div>
      {sisa > 0 && !sesi.ditutup ? (
        <p className={`relative mt-10 font-display text-5xl font-bold tabular-nums ${sisa < 180 ? 'text-amber-300' : 'text-emerald-300'}`}>
          {formatSisa(sisa)}
        </p>
      ) : (
        <p className="relative mt-10 font-display text-4xl font-bold text-rose-300">Kode sudah tidak berlaku</p>
      )}
      <p className="relative mt-3 text-lg text-slate-300">
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
        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary-50 text-primary-600">
            <KeyRound className="h-7 w-7" />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">
              Buka presensi {tujuan} Kelas {kelas}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Kode 6 angka acak berlaku {MASA_BERLAKU_MENIT} menit. Tampilkan di proyektor, lalu siswa memasukkan kodenya di menu{' '}
              <span className="font-semibold text-slate-700">Presensi Hari Ini</span>.{' '}
              {pel ? 'Siswa yang memasukkan kode tercatat hadir di pelajaran ini.' : 'Siswa yang memasukkan kode tercatat hadir hari ini.'}
            </p>
          </div>
          <button onClick={buka} className={`${btn.primary} py-3! md:w-52`}>
            <KeyRound className="h-5 w-5" /> {sesi ? 'Buka sesi baru' : 'Buka Presensi'}
          </button>
        </div>
        {lain && (
          <p className="flex items-start gap-2 border-t border-amber-100 bg-amber-50 px-6 py-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Kode {lain.kunci ? labelSesi(lain) : 'presensi harian'} dari {lain.oleh.split(',')[0]} masih berlaku sampai {jamDari(lain.berakhir)}. Membuka presensi ini akan
            menutup kode tersebut.
          </p>
        )}
        {sesi && (
          <p className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-sm text-slate-600">
            Sesi terakhir {jamDari(sesi.mulai)}–{jamDari(sesi.berakhir)} oleh {sesi.oleh.split(',')[0]} · <b>{lewatOtp}</b> siswa hadir lewat kode
            {terkunci > 0 && ` · ${terkunci} siswa terkunci karena salah kode`}
          </p>
        )}
      </Card>
    )
  }

  return (
    <>
      <Card className="mb-6 overflow-hidden border-emerald-200">
        <div className="grid gap-6 p-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Kode {pel ? MAPEL[pel.mapel].nama : 'presensi harian'} · {kelas}
            </p>
            <div className="mt-3 flex gap-1.5" aria-label={`Kode ${sesi.kode}`}>
              {sesi.kode.split('').map((d, i) => (
                <span
                  key={i}
                  className={`grid h-14 w-11 place-items-center rounded-xl bg-slate-900 font-display text-3xl font-bold text-white ${i === 3 ? 'ml-2' : ''}`}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm text-slate-500">
                Berlaku sampai <b className="text-slate-800">{jamDari(sesi.berakhir)}</b>
              </p>
              <p className={`font-display text-2xl font-bold tabular-nums ${sisa < 180 ? 'text-amber-600' : 'text-emerald-600'}`}>{formatSisa(sisa)}</p>
            </div>
            <Progres nilai={(sisa / (MASA_BERLAKU_MENIT * 60)) * 100} warna={sisa < 180 ? 'bg-amber-400' : 'bg-emerald-500'} className="mt-2" />
            <p className="mt-3 text-sm text-slate-600">
              <b className="text-slate-900">{hadir}</b> dari {siswaKelas.length} siswa hadir · {lewatOtp} lewat kode
              {terkunci > 0 && <span className="text-rose-600"> · {terkunci} terkunci</span>}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:flex-col">
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
      className={`relative w-44 shrink-0 rounded-2xl p-3.5 text-left transition sm:w-48 ${
        aktif ? 'bg-slate-900 text-white shadow-lg' : 'bg-white ring-1 ring-slate-200 hover:ring-slate-300'
      }`}
    >
      {berjalan && <span className="absolute right-3 top-3 h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" title="Kode sedang berlaku" />}
      <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${aktif ? 'bg-white/15 text-white' : warna}`}>{judul}</span>
      <p className={`mt-2 truncate text-xs ${aktif ? 'text-slate-300' : 'text-slate-500'}`}>{sub}</p>
      <p className={`mt-0.5 text-sm font-semibold ${aktif ? 'text-white' : 'text-slate-800'}`}>{ringkas}</p>
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

      <Card className="mb-4 flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:p-5">
        <div>
          <label htmlFor="kelas" className={labelCls}>
            Kelas
          </label>
          {L.daftarKelas.length > 1 ? (
            <select id="kelas" value={kelas} onChange={(e) => setKelas(e.target.value)} className={`${inputCls} sm:w-44`}>
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
            <p id="kelas" className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-800">
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
            className={`${inputCls} sm:w-48`}
          />
        </div>
        <div className="text-sm text-slate-500 sm:pb-2.5">
          {formatHari(tanggal)} · {siswaKelas.length} siswa{wali && ` · Wali kelas ${wali.nama.split(',')[0]}`}
        </div>
      </Card>

      {ajarHariIni.length > 0 && !waliIni && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-slate-600">
            <CalendarClock className="h-4 w-4" /> Jadwal Anda {tanggal === hariIni ? 'hari ini' : namaHari(tanggal)}:
          </span>
          {ajarHariIni.map((j) => (
            <button
              key={j.kelas + j.kunci}
              onClick={() => {
                setKelas(j.kelas)
                setPilihan(j.kunci)
              }}
              className={`rounded-full px-3 py-1 font-semibold transition ${
                j.kelas === kelas && j.kunci === pilih ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
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
          <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="group" aria-label="Pilih presensi">
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
                <p className="font-semibold">Kehadiran di pelajaran berbeda dengan presensi harian:</p>
                <ul className="mt-1 space-y-0.5">
                  {selisih.map(({ s, p, st, harian }) => (
                    <li key={s.nis + p.kunci}>
                      {s.nama} — {STATUS_ABSEN[st].label} di {MAPEL[p.mapel].nama} ({jamPelajaran(p)}), harian {STATUS_ABSEN[harian].label}
                    </li>
                  ))}
                </ul>
              </Alert>
            </div>
          )}

          <div className="mb-4 flex flex-wrap gap-2">
            {SARING.map(([k, label]) => (
              <button
                key={k}
                onClick={() => setSaring(k)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  saring === k ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {label}
                <span className="ml-1.5 text-xs opacity-70">{hitung(k)}</span>
              </button>
            ))}
          </div>

          <Card>
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative lg:w-72">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama siswa..." className={`${inputCls} pl-10`} />
              </div>
              <div className="flex flex-wrap gap-2">
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
              <ul className="divide-y divide-slate-100">
                {daftar.map((s) => {
                  const st = statusSiswa(s.nis)
                  const ikutHarian = pel && st.status && st.sumber === 'harian'
                  const j = ikutHarian ? { teks: 'Ikut presensi harian', cls: 'text-slate-500' } : teksJejak(jejakSiswa(s.nis))
                  const kunci = sesi && (sesi.gagal?.[s.nis] ?? 0) >= MAKS_PERCOBAAN && st.status !== 'H'
                  return (
                    <li key={s.nis} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="w-6 shrink-0 text-sm text-slate-400">{siswaKelas.indexOf(s) + 1}</span>
                        <Avatar nama={s.nama} size="sm" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">{s.nama}</p>
                          <p className="text-xs text-slate-500">
                            NIS {s.nis}
                            {j && <span className={`ml-2 ${j.cls}`}>· {j.teks}</span>}
                            {kunci && (
                              <span className="ml-2 inline-flex items-center gap-1 text-rose-600">
                                · <Lock className="h-3 w-3" /> {MAKS_PERCOBAAN}× salah kode
                              </span>
                            )}
                          </p>
                          {/* Wali kelas: kehadiran siswa di tiap pelajaran hari itu */}
                          {!pel && waliIni && semuaPelajaran.length > 0 && (
                            <div className="mt-1.5 flex gap-1" aria-label={`Kehadiran ${s.nama} per pelajaran`}>
                              {semuaPelajaran.map((p) => {
                                const sp = statusPelajaran(data, tanggal, s.nis, p.kunci)
                                const info = sp.sumber === 'pelajaran' ? STATUS_ABSEN[sp.status] : null
                                return (
                                  <span
                                    key={p.kunci}
                                    title={`${MAPEL[p.mapel].nama} (${jamPelajaran(p)}): ${info ? info.label : 'belum dipresensi tersendiri'}`}
                                    className={`h-1.5 w-6 rounded-full ${info ? info.dot : 'bg-slate-200'}`}
                                  />
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 sm:flex" role="radiogroup" aria-label={`Kehadiran ${s.nama}`}>
                        {Object.entries(STATUS_ABSEN).map(([kode, info]) => {
                          const terpilih = st.status === kode
                          return (
                            <button
                              key={kode}
                              role="radio"
                              aria-checked={terpilih}
                              onClick={() => tandai({ [s.nis]: kode })}
                              title={info.label}
                              className={`rounded-lg px-3 py-2 text-sm font-bold transition sm:w-14 ${
                                terpilih
                                  ? `${info.cls} ${ikutHarian ? 'outline-1 outline-dashed outline-current opacity-80' : 'ring-2 ring-current'}`
                                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              <span className="sm:hidden">{info.label}</span>
                              <span className="hidden sm:inline">{kode}</span>
                            </button>
                          )
                        })}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            <p className="flex items-start gap-2 rounded-b-2xl border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
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
              className={`${btn.primary} bg-rose-600 hover:bg-rose-700`}
            >
              Ya, tandai Alpa
            </button>
          </>
        }
      >
        <p className="text-slate-600">
          {belum.length} siswa yang belum tercatat {pel ? `di pelajaran ${MAPEL[pel.mapel].nama}` : 'hari ini'} akan ditandai <b>Alpa</b>:{' '}
          {belum.map((s) => s.nama.split(' ')[0]).join(', ')}.
        </p>
      </Modal>
    </>
  )
}
