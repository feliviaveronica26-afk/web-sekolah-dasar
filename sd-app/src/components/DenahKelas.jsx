import { useEffect, useState } from 'react'
import { ArrowUpDown, BookOpen, Footprints, MapPin, MousePointerClick, Toilet, Users } from 'lucide-react'
import { Avatar } from './ui'
import { useData } from '../context/DataContext'
import { GEDUNG_KELAS, MAPEL } from '../data/dummy'
import { isHariSekolah, jamSekarang, parseKey, todayKey } from '../utils/format'
import { guruPelajaran, jamPelajaran, pelajaranHari } from '../utils/jadwal'

// Warna ruang per tingkat kelas (lihat .ruang-* di _portal.scss)
const WARNA = {
  1: { ruang: 'ruang-sky', pilih: 'ruang-sky--pilih', titik: 'titik-sky' },
  2: { ruang: 'ruang-emerald', pilih: 'ruang-emerald--pilih', titik: 'titik-emerald' },
  3: { ruang: 'ruang-amber', pilih: 'ruang-amber--pilih', titik: 'titik-amber' },
  4: { ruang: 'ruang-violet', pilih: 'ruang-violet--pilih', titik: 'titik-violet' },
  5: { ruang: 'ruang-orange', pilih: 'ruang-orange--pilih', titik: 'titik-orange' },
  6: { ruang: 'ruang-rose', pilih: 'ruang-rose--pilih', titik: 'titik-rose' },
}

// Ruang selain kelas; `lebar` dalam kolom denah (satu lantai = 11 kolom)
const RUANG_LAIN = {
  lift: { ikon: ArrowUpDown, nama: 'Lift', lebar: 'rentang-1' },
  tangga: { ikon: Footprints, nama: 'Tangga', lebar: 'rentang-1' },
  toilet: { ikon: Toilet, nama: 'Toilet L/P', lebar: 'rentang-2' },
}

// Pelajaran yang sedang berlangsung di kelas itu (null di luar jam pelajaran / hari libur)
function pelajaranSekarang(kelas) {
  const hariIni = todayKey()
  if (!isHariSekolah(parseKey(hariIni))) return null
  const jam = jamSekarang()
  return pelajaranHari(kelas, hariIni).find((p) => jam >= p.mulai && jam < p.selesai) ?? null
}

function DetailRuang({ kelas, sorot }) {
  const { data } = useData()
  // Jumlah siswa per kelas dari server (pengunjung & siswa tidak menerima daftar siswa kelas lain)
  const jumlah = data.jumlahSiswa[kelas] ?? {}
  const wali = data.guru.find((g) => g.peran?.includes('wali_kelas') && g.kelas === kelas)
  const lantai = GEDUNG_KELAS.find((l) => [...l.utara, ...l.selatan].includes(kelas))?.lantai
  const sekarang = pelajaranSekarang(kelas)
  const hariIni = todayKey()
  const pelajaran = isHariSekolah(parseKey(hariIni)) ? pelajaranHari(kelas, hariIni) : []
  const w = WARNA[kelas[0]]

  return (
    <div className="tampil-lembut" key={kelas}>
      <div className={`rounded-3 p-5 ${w.pilih}`}>
        <p className="fs-xs fw-bold text-uppercase ls-wider opacity-80">{kelas === sorot ? 'Kelasmu' : 'Ruang kelas'}</p>
        <p className="fs-4xl fw-bold">Kelas {kelas}</p>
        <p className="mt-1 d-flex align-items-center gap-1-5 fs-sm opacity-90">
          <MapPin className="ukuran-4" /> Gedung Utama · Lantai {lantai}
        </p>
      </div>
      <dl className="mt-4 d-flex flex-column gap-3 fs-sm">
        {wali && (
          <div className="d-flex align-items-center gap-3">
            <Avatar nama={wali.nama} size="sm" />
            <div className="min-w-0">
              <dt className="fs-xs text-tinta-3">Wali kelas</dt>
              <dd className="text-truncate fw-semibold text-tinta">{wali.nama}</dd>
            </div>
          </div>
        )}
        <div className="d-flex align-items-center gap-3">
          <span className="d-flex align-items-center justify-content-center ukuran-9 flex-shrink-0 rounded-circle bg-abu-100 text-tinta-3">
            <Users className="ukuran-4" />
          </span>
          <div>
            <dt className="fs-xs text-tinta-3">Siswa</dt>
            <dd className="fw-semibold text-tinta">
              {(jumlah.L ?? 0) + (jumlah.P ?? 0)} siswa · {jumlah.L ?? 0} L, {jumlah.P ?? 0} P
            </dd>
          </div>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span
            className={`d-flex align-items-center justify-content-center ukuran-9 flex-shrink-0 rounded-circle ${sekarang ? 'bg-success-subtle text-success' : 'bg-abu-100 text-tinta-3'}`}
          >
            <BookOpen className="ukuran-4" />
          </span>
          <div className="min-w-0">
            <dt className="fs-xs text-tinta-3">Sekarang</dt>
            <dd className="fw-semibold text-tinta">
              {sekarang ? (
                <>
                  {MAPEL[sekarang.mapel].nama} <span className="fw-normal text-tinta-3">· {jamPelajaran(sekarang)}</span>
                  <span className="d-block text-truncate fs-xs fw-normal text-tinta-3">{guruPelajaran(data.guru, kelas, sekarang.mapel)?.nama}</span>
                </>
              ) : (
                <span className="fw-normal text-tinta-3">Tidak ada pelajaran saat ini</span>
              )}
            </dd>
          </div>
        </div>
      </dl>
      {pelajaran.length > 0 && (
        <div className="mt-4 border-top border-abu-100 pt-4">
          <p className="fs-xs fw-semibold text-tinta-3">Pelajaran hari ini</p>
          <div className="mt-2 d-flex flex-wrap gap-1-5">
            {pelajaran.map((p) => (
              <span key={p.kunci} className={`rounded-1 px-2 py-0-5 fs-xs fw-semibold ${MAPEL[p.mapel].warna} ${sekarang?.kunci === p.kunci ? 'cincin-hijau' : ''}`}>
                {p.mulai} {MAPEL[p.mapel].nama}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/*
  Denah Gedung Utama (khusus siswa): dua lantai dengan lift & tangga, klik ruang untuk melihat wali kelas, jumlah siswa, dan pelajaran
  yang sedang berlangsung. `sorot` = kelas yang ditandai (mis. kelas siswa yang sedang login).
*/
export default function DenahKelas({ sorot = null }) {
  const { data } = useData()
  const [pilih, setPilih] = useState(sorot)
  const [, setDetak] = useState(0)

  // Perbarui penanda "sedang belajar" setiap menit
  useEffect(() => {
    const t = setInterval(() => setDetak((n) => n + 1), 60000)
    return () => clearInterval(t)
  }, [])

  const ruang = (r) => {
    if (RUANG_LAIN[r]) {
      const { ikon: Ikon, nama, lebar } = RUANG_LAIN[r]
      return (
        <div
          key={r}
          title={nama}
          className={`${lebar} d-flex flex-column align-items-center justify-content-center gap-0-5 rounded-1 ${r === 'lift' ? 'warna-sky border border-info-subtle' : 'ruang-lain text-tinta-3'}`}
        >
          <Ikon className="ukuran-4" />
          <span className="label-ruang fw-semibold">{nama}</span>
        </div>
      )
    }
    const w = WARNA[r[0]]
    const dipilih = pilih === r
    const wali = data.guru.find((g) => g.peran?.includes('wali_kelas') && g.kelas === r)
    const belajar = pelajaranSekarang(r)
    return (
      <button
        key={r}
        type="button"
        onClick={() => setPilih(r)}
        aria-pressed={dipilih}
        aria-label={`Kelas ${r}${belajar ? `, sedang belajar ${MAPEL[belajar.mapel].nama}` : ''}`}
        className={`ruang position-relative rentang-2 d-flex rasio-4x3 flex-column align-items-center justify-content-center rounded-2 px-1 ${dipilih ? `${w.pilih} ruang--dipilih` : w.ruang}`}
      >
        <span className="nama-ruang fs-lg fw-bold lh-1">{r}</span>
        {wali && <span className="label-ruang mt-1 mw-100 text-truncate fw-medium opacity-80">{wali.nama.split(',')[0]}</span>}
        {belajar && <span className="titik-belajar position-absolute ukuran-2 rounded-circle titik-emerald berdenyut" title="Sedang belajar" />}
        {sorot === r && (
          <span className="lencana-kelasmu position-absolute start-50 text-nowrap rounded-pill bg-primary px-1-5 py-0-5 fw-bold text-uppercase text-white shadow">Kelasmu</span>
        )}
      </button>
    )
  }

  return (
    <div className="tata-denah-kelas d-grid gap-6">
      <div className="denah-kelas min-w-0">
        <div className="d-flex flex-column gap-5">
          {/* Lantai atas digambar di atas */}
          {[...GEDUNG_KELAS].reverse().map((l) => (
            <div key={l.lantai}>
              <p className="mb-2 fs-xs fw-bold text-uppercase ls-wider text-tinta-3">Lantai {l.lantai}</p>
              <div className="rounded-3 border border-2 border-abu-300 bg-abu-100 p-2 pt-3">
                <div className="lantai-kisi">{l.utara.map(ruang)}</div>
                <div className="koridor my-2 d-flex h-6 align-items-center justify-content-center rounded-1 fs-10 fw-semibold text-uppercase">Koridor</div>
                <div className="lantai-kisi">{l.selatan.map(ruang)}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 d-flex flex-wrap align-items-center column-gap-4 row-gap-2 fs-xs text-tinta-2">
          {Object.entries(WARNA).map(([t, w]) => (
            <span key={t} className="d-flex align-items-center gap-1-5">
              <span className={`ukuran-3 rounded-1 ${w.titik}`} /> Kelas {t}
            </span>
          ))}
          <span className="d-flex align-items-center gap-1-5">
            <span className="titik-belajar--legenda ukuran-2 rounded-circle titik-emerald" /> Sedang belajar
          </span>
        </div>
      </div>

      <div className="rounded-3 border border-abu-200 bg-white p-4 position-lg-sticky top-lg-24 align-self-lg-start">
        {pilih ? (
          <DetailRuang kelas={pilih} sorot={sorot} />
        ) : (
          <div className="py-6 text-center">
            <MousePointerClick className="mx-auto ukuran-8 text-abu-300" />
            <p className="mt-2 fw-semibold text-tinta-2">Pilih ruang kelas</p>
            <p className="mt-1 fs-sm text-tinta-3">Klik salah satu kelas di denah untuk melihat wali kelas, jumlah siswa, dan pelajaran yang sedang berlangsung.</p>
          </div>
        )}
      </div>
    </div>
  )
}
