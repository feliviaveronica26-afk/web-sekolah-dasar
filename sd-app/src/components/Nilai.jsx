import { useState } from 'react'
import { Award, BookOpenCheck, Medal, Printer, Target, TrendingUp } from 'lucide-react'
import { GrafikBatang } from './Grafik'
import { Badge, Card, JudulKartu, StatCard, Tabs, btn } from './ui'
import { ringkasAbsensi, useData } from '../context/DataContext'
import { KKTP, SEKOLAH, SPP } from '../data/dummy'
import { formatTanggal, todayKey } from '../utils/format'
import { JUMLAH_TUGAS, catatanWaliBawaan, deskripsiCapaian, peringkatKelas, predikat, rekapNilai } from '../utils/nilai'
import { ekskulSiswa, ringkasSikap } from '../utils/prestasi'

export const SEMESTER = `Ganjil ${SPP.tahunAjaran}`

// Empat angka utama nilai seorang siswa
export function RingkasanNilai({ siswa }) {
  const { data } = useData()
  const r = rekapNilai(data, siswa)
  const peringkat = peringkatKelas(data, siswa)
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard icon={TrendingUp} label="Rata-rata nilai" value={r.rataRata ?? '–'} hint={predikat(r.rataRata).label} tone="sky" />
      <StatCard icon={Target} label="Mapel tuntas" value={`${r.tuntas}/${r.daftar.length}`} hint={`KKTP ${KKTP}`} tone="emerald" />
      <StatCard icon={Medal} label="Nilai tertinggi" value={r.terbaik?.akhir ?? '–'} hint={r.terbaik?.nama} tone="amber" />
      <StatCard icon={Award} label="Peringkat kelas" value={`${peringkat.posisi}`} hint={`dari ${peringkat.dari} siswa`} tone="primary" />
    </div>
  )
}

const sel = (v) => (v === null || v === undefined || v === '' ? '–' : v)

// Rincian nilai per mapel: grafik + tabel (tabel juga menjadi tampilan aksesibel grafik)
export function RincianNilai({ siswa }) {
  const { data } = useData()
  const r = rekapNilai(data, siswa)
  const [tampil, setTampil] = useState('grafik')

  return (
    <Card className="p-6">
      <JudulKartu icon={BookOpenCheck} judul={`Nilai per mata pelajaran · ${SEMESTER}`}>
        <Tabs
          value={tampil}
          onChange={setTampil}
          items={[
            ['grafik', 'Grafik'],
            ['tabel', 'Tabel'],
          ]}
        />
      </JudulKartu>

      {tampil === 'grafik' ? (
        <GrafikBatang
          judul="Nilai akhir per mata pelajaran"
          data={r.daftar.map((d) => ({ label: d.nama, nilai: d.akhir, ket: d.predikat.label }))}
          acuan={{ nilai: KKTP, label: 'KKTP' }}
        />
      ) : (
        <div className="-mx-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Mata pelajaran</th>
                {Array.from({ length: JUMLAH_TUGAS }, (_, i) => (
                  <th key={i} className="px-2 py-3 text-center font-semibold">
                    T{i + 1}
                  </th>
                ))}
                <th className="px-2 py-3 text-center font-semibold">PTS</th>
                <th className="px-2 py-3 text-center font-semibold">PAS</th>
                <th className="px-2 py-3 text-center font-semibold">Akhir</th>
                <th className="px-6 py-3 font-semibold">Predikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {r.daftar.map((d) => (
                <tr key={d.kode} className="hover:bg-slate-50/60">
                  <td className="px-6 py-3">
                    <span className={`rounded-lg px-2 py-1 text-xs font-bold ${d.warna}`}>{d.nama}</span>
                  </td>
                  {Array.from({ length: JUMLAH_TUGAS }, (_, i) => (
                    <td key={i} className="px-2 py-3 text-center text-slate-600">
                      {sel(d.tugas?.[i])}
                    </td>
                  ))}
                  <td className="px-2 py-3 text-center text-slate-600">{sel(d.pts)}</td>
                  <td className="px-2 py-3 text-center text-slate-400">{sel(d.pas)}</td>
                  <td className="px-2 py-3 text-center font-bold text-slate-900">{sel(d.akhir)}</td>
                  <td className="px-6 py-3">
                    <Badge className={d.predikat.cls}>
                      {d.predikat.huruf} · {d.predikat.label}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-6 pt-3 text-xs text-slate-500">
            Nilai akhir = 40% rata-rata tugas + 30% PTS + 30% PAS. Selama PAS belum dilaksanakan, bobot dihitung dari komponen yang sudah ada.
          </p>
        </div>
      )}
    </Card>
  )
}

// Rapor siswa yang siap dicetak. `bisaEdit` = wali kelas boleh mengubah catatan.
export function KartuRapor({ siswa, bisaEdit = false }) {
  const { data, simpanCatatanWali } = useData()
  const r = rekapNilai(data, siswa)
  const hadir = ringkasAbsensi(data.absensi, siswa.nis, Object.keys(data.absensi))
  const sikap = ringkasSikap(data, siswa.nis)
  const ekskul = ekskulSiswa(data, siswa)
  const wali = data.guru.find((g) => g.peran?.includes('wali_kelas') && g.kelas === siswa.kelas)
  const kepsek = data.guru.find((g) => g.jabatan === 'Kepala Sekolah')
  const catatan = data.catatanWali[siswa.nis] ?? catatanWaliBawaan(siswa.nama, r.rataRata)
  const [ubah, setUbah] = useState(false)
  const [draf, setDraf] = useState(catatan)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-slate-500">Rapor sementara (sebelum PAS). Nilai dapat berubah hingga pembagian rapor 18 Desember 2026.</p>
        <button onClick={() => window.print()} className={btn.secondary}>
          <Printer className="h-4 w-4" /> Cetak Rapor
        </button>
      </div>

      <Card className="area-cetak overflow-hidden">
        <div className="flex items-center gap-4 border-b-4 border-double border-slate-300 bg-white px-6 py-5">
          <img src="/logo.png" alt="" className="h-14 w-14 object-contain" />
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-600">Laporan Hasil Belajar</p>
            <p className="font-display text-xl font-bold text-slate-900">{SEKOLAH.nama}</p>
            <p className="text-xs text-slate-500">
              NPSN {SEKOLAH.npsn} · {SEKOLAH.alamat}
            </p>
          </div>
        </div>

        <dl className="grid gap-x-6 gap-y-1.5 bg-slate-50 px-6 py-4 text-sm sm:grid-cols-2">
          {[
            ['Nama', siswa.nama],
            ['NIS', siswa.nis],
            ['Kelas', siswa.kelas],
            ['Semester', SEMESTER],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-20 text-slate-500">{k}</dt>
              <dd className="font-semibold text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-y border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="w-10 px-4 py-2.5 font-semibold">No</th>
                <th className="px-4 py-2.5 font-semibold">Mata pelajaran</th>
                <th className="px-4 py-2.5 text-center font-semibold">Nilai</th>
                <th className="px-4 py-2.5 font-semibold">Capaian kompetensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {r.daftar.map((d, i) => (
                <tr key={d.kode}>
                  <td className="px-4 py-2.5 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-2.5 font-semibold text-slate-800">{d.nama}</td>
                  <td className="px-4 py-2.5 text-center font-bold tabular-nums text-slate-900">{sel(d.akhir)}</td>
                  <td className="px-4 py-2.5 text-slate-600">{deskripsiCapaian(d.kode, d.akhir)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50">
                <td />
                <td className="px-4 py-2.5 font-bold text-slate-800">Rata-rata</td>
                <td className="px-4 py-2.5 text-center font-bold tabular-nums text-primary-700">{sel(r.rataRata)}</td>
                <td className="px-4 py-2.5 text-slate-600">{predikat(r.rataRata).label}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Ketidakhadiran</p>
            <dl className="mt-2 space-y-1 text-sm">
              {[
                ['Sakit', hadir.S],
                ['Izin', hadir.I],
                ['Tanpa keterangan', hadir.A],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-slate-600">{k}</dt>
                  <dd className="font-semibold text-slate-900">{v} hari</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Ekstrakurikuler</p>
            <ul className="mt-2 space-y-1 text-sm">
              {ekskul.length === 0 && <li className="text-slate-500">–</li>}
              {ekskul.map((e) => (
                <li key={e.id} className="flex justify-between gap-2">
                  <span className="text-slate-700">{e.nama}</span>
                  <span className="font-semibold text-slate-900">Baik</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Sikap</p>
            <p className="mt-2 text-sm text-slate-700">
              {sikap.positif} apresiasi · {sikap.perbaikan} catatan perbaikan
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Total poin: {sikap.total > 0 ? `+${sikap.total}` : sikap.total}</p>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-100">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Catatan wali kelas</p>
              {bisaEdit && !ubah && (
                <button
                  onClick={() => {
                    setDraf(catatan)
                    setUbah(true)
                  }}
                  className="text-xs font-semibold text-amber-800 underline print:hidden"
                >
                  Ubah catatan
                </button>
              )}
            </div>
            {ubah ? (
              <div className="mt-2 print:hidden">
                <textarea value={draf} onChange={(e) => setDraf(e.target.value)} rows={3} className="w-full rounded-xl border border-amber-200 bg-white p-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-100" />
                <div className="mt-2 flex justify-end gap-2">
                  <button onClick={() => setUbah(false)} className={btn.secondary}>
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      simpanCatatanWali(siswa.nis, draf.trim())
                      setUbah(false)
                    }}
                    className={btn.primary}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm italic text-amber-900">“{catatan}”</p>
            )}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs text-slate-600">
            {[
              ['Orang Tua/Wali', siswa.ortu],
              [`Wali Kelas ${siswa.kelas}`, wali?.nama ?? '–'],
              ['Kepala Sekolah', kepsek?.nama ?? SEKOLAH.kepalaSekolah],
            ].map(([peran, n]) => (
              <div key={peran}>
                <p>{peran}</p>
                <div className="h-14" />
                <p className="border-t border-slate-300 pt-1 font-semibold text-slate-800">{n}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-right text-xs text-slate-400">Dicetak dari Portal {SEKOLAH.nama} · {formatTanggal(todayKey())}</p>
        </div>
      </Card>
    </div>
  )
}
