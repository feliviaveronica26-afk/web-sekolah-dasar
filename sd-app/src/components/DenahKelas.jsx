import { useEffect, useState } from 'react'
import { ArrowUpDown, BookOpen, Footprints, MapPin, MousePointerClick, Toilet, Users } from 'lucide-react'
import { Avatar } from './ui'
import { useData } from '../context/DataContext'
import { GEDUNG_KELAS, MAPEL } from '../data/dummy'
import { isHariSekolah, jamSekarang, parseKey, todayKey } from '../utils/format'
import { guruPelajaran, jamPelajaran, pelajaranHari } from '../utils/jadwal'

// Warna ruang per tingkat kelas
const WARNA = {
  1: { ruang: 'border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100', pilih: 'border-sky-600 bg-sky-500 text-white', titik: 'bg-sky-500' },
  2: { ruang: 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100', pilih: 'border-emerald-600 bg-emerald-500 text-white', titik: 'bg-emerald-500' },
  3: { ruang: 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100', pilih: 'border-amber-500 bg-amber-400 text-amber-950', titik: 'bg-amber-400' },
  4: { ruang: 'border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100', pilih: 'border-violet-600 bg-violet-500 text-white', titik: 'bg-violet-500' },
  5: { ruang: 'border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100', pilih: 'border-orange-600 bg-orange-500 text-white', titik: 'bg-orange-500' },
  6: { ruang: 'border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100', pilih: 'border-rose-600 bg-rose-500 text-white', titik: 'bg-rose-500' },
}

// Ruang selain kelas; `lebar` dalam kolom denah (satu lantai = 11 kolom)
const RUANG_LAIN = {
  lift: { ikon: ArrowUpDown, nama: 'Lift', lebar: 'col-span-1' },
  tangga: { ikon: Footprints, nama: 'Tangga', lebar: 'col-span-1' },
  toilet: { ikon: Toilet, nama: 'Toilet L/P', lebar: 'col-span-2' },
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
      <div className={`rounded-2xl p-5 ${w.pilih}`}>
        <p className="text-xs font-bold uppercase tracking-wider opacity-80">{kelas === sorot ? 'Kelasmu' : 'Ruang kelas'}</p>
        <p className="font-display text-4xl font-bold">Kelas {kelas}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm opacity-90">
          <MapPin className="h-4 w-4" /> Gedung Utama · Lantai {lantai}
        </p>
      </div>
      <dl className="mt-4 space-y-3 text-sm">
        {wali && (
          <div className="flex items-center gap-3">
            <Avatar nama={wali.nama} size="sm" />
            <div className="min-w-0">
              <dt className="text-xs text-slate-500">Wali kelas</dt>
              <dd className="truncate font-semibold text-slate-800">{wali.nama}</dd>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
            <Users className="h-4 w-4" />
          </span>
          <div>
            <dt className="text-xs text-slate-500">Siswa</dt>
            <dd className="font-semibold text-slate-800">
              {(jumlah.L ?? 0) + (jumlah.P ?? 0)} siswa · {jumlah.L ?? 0} L, {jumlah.P ?? 0} P
            </dd>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${sekarang ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
            <BookOpen className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <dt className="text-xs text-slate-500">Sekarang</dt>
            <dd className="font-semibold text-slate-800">
              {sekarang ? (
                <>
                  {MAPEL[sekarang.mapel].nama} <span className="font-normal text-slate-500">· {jamPelajaran(sekarang)}</span>
                  <span className="block truncate text-xs font-normal text-slate-500">{guruPelajaran(data.guru, kelas, sekarang.mapel)?.nama}</span>
                </>
              ) : (
                <span className="font-normal text-slate-500">Tidak ada pelajaran saat ini</span>
              )}
            </dd>
          </div>
        </div>
      </dl>
      {pelajaran.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-500">Pelajaran hari ini</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {pelajaran.map((p) => (
              <span key={p.kunci} className={`rounded-md px-2 py-0.5 text-xs font-semibold ${MAPEL[p.mapel].warna} ${sekarang?.kunci === p.kunci ? 'ring-2 ring-emerald-400' : ''}`}>
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
          className={`${lebar} flex flex-col items-center justify-center gap-0.5 rounded-lg text-slate-500 ${r === 'lift' ? 'bg-sky-100 text-sky-700 ring-1 ring-sky-200' : 'bg-slate-200/80'}`}
        >
          <Ikon className="h-4 w-4" />
          <span className="hidden text-[10px] font-semibold @xl:block">{nama}</span>
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
        className={`relative col-span-2 flex aspect-[4/3] flex-col items-center justify-center rounded-xl border-2 px-1 transition ${
          dipilih ? `${w.pilih} z-10 scale-105 shadow-lg` : w.ruang
        }`}
      >
        <span className="font-display text-lg font-bold leading-none @xl:text-2xl">{r}</span>
        {wali && <span className="mt-1 hidden max-w-full truncate text-[10px] font-medium opacity-80 @xl:block">{wali.nama.split(',')[0]}</span>}
        {belajar && <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full bg-emerald-500 ring-2 ring-white" title="Sedang belajar" />}
        {sorot === r && (
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white shadow">
            Kelasmu
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="@container min-w-0">
        <div className="space-y-5">
          {/* Lantai atas digambar di atas */}
          {[...GEDUNG_KELAS].reverse().map((l) => (
            <div key={l.lantai}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Lantai {l.lantai}</p>
              <div className="rounded-2xl border-2 border-slate-300 bg-slate-100 p-2 pt-3">
                <div className="grid grid-cols-11 gap-1.5">{l.utara.map(ruang)}</div>
                <div className="my-2 flex h-6 items-center justify-center rounded-md bg-amber-100/80 text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-800/70">
                  Koridor
                </div>
                <div className="grid grid-cols-11 gap-1.5">{l.selatan.map(ruang)}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
          {Object.entries(WARNA).map(([t, w]) => (
            <span key={t} className="flex items-center gap-1.5">
              <span className={`h-3 w-3 rounded ${w.titik}`} /> Kelas {t}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" /> Sedang belajar
          </span>
        </div>
      </div>

      <div className="h-fit rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-24">
        {pilih ? (
          <DetailRuang kelas={pilih} sorot={sorot} />
        ) : (
          <div className="py-6 text-center">
            <MousePointerClick className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 font-semibold text-slate-700">Pilih ruang kelas</p>
            <p className="mt-1 text-sm text-slate-500">Klik salah satu kelas di denah untuk melihat wali kelas, jumlah siswa, dan pelajaran yang sedang berlangsung.</p>
          </div>
        )}
      </div>
    </div>
  )
}
