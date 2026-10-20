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
  // Siswa & orang tua tidak menerima nilai teman sekelas, jadi peringkatnya dihitung server
  const peringkat = data.peringkat[siswa.nis] ?? peringkatKelas(data, siswa)
  return (
    <div className="d-grid kolom-2 gap-4 kolom-lg-4">
      <StatCard icon={TrendingUp} label="Rata-rata nilai" value={r.rataRata ?? '–'} hint={predikat(r.rataRata).label} tone="sky" />
      <StatCard icon={Target} label="Mapel tuntas" value={`${r.tuntas}/${r.daftar.length}`} hint={`KKTP ${KKTP}`} tone="emerald" />
      <StatCard icon={Medal} label="Nilai tertinggi" value={r.terbaik?.akhir ?? '–'} hint={r.terbaik?.nama} tone="amber" />
      <StatCard
        icon={Award}
        label="Peringkat kelas"
        value={peringkat.posisi ?? '–'}
        hint={peringkat.posisi ? `dari ${peringkat.dari} siswa` : 'Belum ada nilai'}
        tone="primary"
      />
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
        <div className="mx-n6 overflow-x-auto">
          <table className="w-100 min-w-640 text-start fs-sm">
            <thead className="bg-abu-50 fs-xs text-uppercase ls-wider text-tinta-3">
              <tr>
                <th className="px-6 py-3 fw-semibold">Mata pelajaran</th>
                {Array.from({ length: JUMLAH_TUGAS }, (_, i) => (
                  <th key={i} className="px-2 py-3 text-center fw-semibold">
                    T{i + 1}
                  </th>
                ))}
                <th className="px-2 py-3 text-center fw-semibold">PTS</th>
                <th className="px-2 py-3 text-center fw-semibold">PAS</th>
                <th className="px-2 py-3 text-center fw-semibold">Akhir</th>
                <th className="px-6 py-3 fw-semibold">Predikat</th>
              </tr>
            </thead>
            <tbody className="pembatas-y pembatas-abu angka">
              {r.daftar.map((d) => (
                <tr key={d.kode} className="hover-latar">
                  <td className="px-6 py-3">
                    <span className={`rounded-1 px-2 py-1 fs-xs fw-bold ${d.warna}`}>{d.nama}</span>
                  </td>
                  {Array.from({ length: JUMLAH_TUGAS }, (_, i) => (
                    <td key={i} className="px-2 py-3 text-center text-tinta-2">
                      {sel(d.tugas?.[i])}
                    </td>
                  ))}
                  <td className="px-2 py-3 text-center text-tinta-2">{sel(d.pts)}</td>
                  <td className="px-2 py-3 text-center text-abu-400">{sel(d.pas)}</td>
                  <td className="px-2 py-3 text-center fw-bold text-tinta">{sel(d.akhir)}</td>
                  <td className="px-6 py-3">
                    <Badge className={d.predikat.cls}>
                      {d.predikat.huruf} · {d.predikat.label}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-6 pt-3 fs-xs text-tinta-3">
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
      <div className="mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3 d-print-none">
        <p className="fs-sm text-tinta-3">Rapor sementara (sebelum PAS). Nilai dapat berubah hingga pembagian rapor 18 Desember 2026.</p>
        <button onClick={() => window.print()} className={btn.secondary}>
          <Printer className="h-4 w-4" /> Cetak Rapor
        </button>
      </div>

      <Card className="area-cetak overflow-hidden">
        <div className="d-flex align-items-center gap-4 garis-ganda-bawah border-abu-300 bg-white px-6 py-5">
          <img src="/logo.png" alt="" className="h-14 w-14 object-fit-contain" />
          <div className="flex-1">
            <p className="fs-xs fw-bold text-uppercase ls-widest text-primary">Laporan Hasil Belajar</p>
            <p className="fs-xl fw-bold text-tinta">{SEKOLAH.nama}</p>
            <p className="fs-xs text-tinta-3">
              NPSN {SEKOLAH.npsn} · {SEKOLAH.alamat}
            </p>
          </div>
        </div>

        <dl className="d-grid column-gap-6 row-gap-1-5 bg-abu-50 px-6 py-4 fs-sm kolom-sm-2">
          {[
            ['Nama', siswa.nama],
            ['NIS', siswa.nis],
            ['Kelas', siswa.kelas],
            ['Semester', SEMESTER],
          ].map(([k, v]) => (
            <div key={k} className="d-flex gap-3">
              <dt className="w-20 text-tinta-3">{k}</dt>
              <dd className="fw-semibold text-tinta">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="overflow-x-auto">
          <table className="w-100 min-w-620 text-start fs-sm">
            <thead className="border-top border-bottom border-abu-200 fs-xs text-uppercase ls-wider text-tinta-3">
              <tr>
                <th className="w-10 px-4 py-2-5 fw-semibold">No</th>
                <th className="px-4 py-2-5 fw-semibold">Mata pelajaran</th>
                <th className="px-4 py-2-5 text-center fw-semibold">Nilai</th>
                <th className="px-4 py-2-5 fw-semibold">Capaian kompetensi</th>
              </tr>
            </thead>
            <tbody className="pembatas-y pembatas-abu">
              {r.daftar.map((d, i) => (
                <tr key={d.kode}>
                  <td className="px-4 py-2-5 text-tinta-3">{i + 1}</td>
                  <td className="px-4 py-2-5 fw-semibold text-tinta">{d.nama}</td>
                  <td className="px-4 py-2-5 text-center fw-bold angka text-tinta">{sel(d.akhir)}</td>
                  <td className="px-4 py-2-5 text-tinta-2">{deskripsiCapaian(d.kode, d.akhir)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-top border-abu-200 bg-abu-50">
                <td />
                <td className="px-4 py-2-5 fw-bold text-tinta">Rata-rata</td>
                <td className="px-4 py-2-5 text-center fw-bold angka text-merah-700">{sel(r.rataRata)}</td>
                <td className="px-4 py-2-5 text-tinta-2">{predikat(r.rataRata).label}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="d-grid gap-4 p-6 kolom-md-3">
          <div className="rounded-2 border border-abu-200 p-4">
            <p className="fs-xs fw-bold text-uppercase ls-wider text-tinta-3">Ketidakhadiran</p>
            <dl className="mt-2 antara-y-1 fs-sm">
              {[
                ['Sakit', hadir.S],
                ['Izin', hadir.I],
                ['Tanpa keterangan', hadir.A],
              ].map(([k, v]) => (
                <div key={k} className="d-flex justify-content-between">
                  <dt className="text-tinta-2">{k}</dt>
                  <dd className="fw-semibold text-tinta">{v} hari</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-2 border border-abu-200 p-4">
            <p className="fs-xs fw-bold text-uppercase ls-wider text-tinta-3">Ekstrakurikuler</p>
            <ul className="mt-2 antara-y-1 fs-sm">
              {ekskul.length === 0 && <li className="text-tinta-3">–</li>}
              {ekskul.map((e) => (
                <li key={e.id} className="d-flex justify-content-between gap-2">
                  <span className="text-tinta-2">{e.nama}</span>
                  <span className="fw-semibold text-tinta">Baik</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2 border border-abu-200 p-4">
            <p className="fs-xs fw-bold text-uppercase ls-wider text-tinta-3">Sikap</p>
            <p className="mt-2 fs-sm text-tinta-2">
              {sikap.positif} apresiasi · {sikap.perbaikan} catatan perbaikan
            </p>
            <p className="mt-1 fs-sm fw-semibold text-tinta">Total poin: {sikap.total > 0 ? `+${sikap.total}` : sikap.total}</p>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-2 bg-warning-subtle p-4 border border-warning-subtle">
            <div className="d-flex align-items-center justify-content-between gap-3">
              <p className="fs-xs fw-bold text-uppercase ls-wider text-warning-emphasis">Catatan wali kelas</p>
              {bisaEdit && !ubah && (
                <button
                  onClick={() => {
                    setDraf(catatan)
                    setUbah(true)
                  }}
                  className="fs-xs fw-semibold text-warning-emphasis text-decoration-underline d-print-none"
                >
                  Ubah catatan
                </button>
              )}
            </div>
            {ubah ? (
              <div className="mt-2 d-print-none">
                <textarea value={draf} onChange={(e) => setDraf(e.target.value)} rows={3} className="w-100 rounded-2 border border-warning-subtle bg-white p-3 fs-sm" />
                <div className="mt-2 d-flex flex-wrap justify-content-end gap-2">
                  <button onClick={() => setUbah(false)} className={btn.secondary}>
                    Batal
                  </button>
                  <button
                    onClick={async () => {
                      if (!(await simpanCatatanWali(siswa.nis, draf.trim()))) setUbah(false)
                    }}
                    className={btn.primary}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 fs-sm fst-italic text-warning-emphasis">“{catatan}”</p>
            )}
          </div>

          <div className="mt-8 d-grid kolom-3 gap-4 text-center fs-xs text-tinta-2">
            {[
              ['Orang Tua/Wali', siswa.ortu],
              [`Wali Kelas ${siswa.kelas}`, wali?.nama ?? '–'],
              ['Kepala Sekolah', kepsek?.nama ?? SEKOLAH.kepalaSekolah],
            ].map(([peran, n]) => (
              <div key={peran}>
                <p>{peran}</p>
                <div className="h-14" />
                <p className="border-top border-abu-300 pt-1 fw-semibold text-tinta">{n}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-end fs-xs text-abu-400">Dicetak dari Portal {SEKOLAH.nama} · {formatTanggal(todayKey())}</p>
        </div>
      </Card>
    </div>
  )
}
