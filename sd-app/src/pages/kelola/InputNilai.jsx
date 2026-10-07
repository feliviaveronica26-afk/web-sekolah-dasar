import { useState } from 'react'
import { Download, Info, NotebookPen, Target, TrendingUp, Users } from 'lucide-react'
import { SEMESTER } from '../../components/Nilai'
import { Avatar, Badge, Card, DashHeader, EmptyState, StatCard, btn, inputCls, labelCls } from '../../components/ui'
import { useLingkup } from '../../context/akses'
import { useData } from '../../context/DataContext'
import { KKTP, MAPEL } from '../../data/dummy'
import { JUMLAH_TUGAS, nilaiAkhir, predikat } from '../../utils/nilai'

// Ubah isian kotak menjadi angka 0–100, atau null jika dikosongkan
const keAngka = (v) => (v === '' ? null : Math.max(0, Math.min(100, Math.round(Number(v)))))

function KotakNilai({ nilai, onChange, label }) {
  const kurang = nilai !== null && nilai !== undefined && nilai < KKTP
  return (
    <input
      type="number"
      min={0}
      max={100}
      inputMode="numeric"
      aria-label={label}
      value={nilai ?? ''}
      onChange={(e) => onChange(keAngka(e.target.value))}
      className={`w-14 rounded-lg border px-1.5 py-1.5 text-center text-sm tabular-nums [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:ring-2 focus:ring-primary-200 ${
        kurang ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-slate-200 bg-white text-slate-800'
      }`}
    />
  )
}

export default function InputNilai() {
  const { data, simpanNilai } = useData()
  const L = useLingkup('nilai')
  const [kelas, setKelas] = useState(L.daftarKelas[0] ?? '')
  const daftarMapel = kelas ? L.mapel(kelas) : []
  const [pilihMapel, setPilihMapel] = useState('')
  const mapel = daftarMapel.includes(pilihMapel) ? pilihMapel : daftarMapel[0]

  if (!L.daftarKelas.length) return <EmptyState icon={NotebookPen} title="Belum ada kelas" desc="Anda belum memiliki kelas atau mapel untuk dinilai." />

  const siswa = data.siswa.filter((s) => s.kelas === kelas).sort((a, b) => a.nama.localeCompare(b.nama))
  const baris = siswa.map((s) => {
    const n = data.nilai[s.nis]?.[mapel] ?? {}
    return { s, n, akhir: nilaiAkhir(n) }
  })
  const terisi = baris.filter((b) => b.akhir !== null)
  const rata = terisi.length ? Math.round((terisi.reduce((a, b) => a + b.akhir, 0) / terisi.length) * 10) / 10 : null
  const belumLengkap = baris.filter((b) => (b.n.tugas ?? []).filter((x) => x !== null && x !== undefined).length < JUMLAH_TUGAS || b.n.pts == null).length

  const ubahTugas = (nis, n, i, v) => {
    const tugas = Array.from({ length: JUMLAH_TUGAS }, (_, k) => n.tugas?.[k] ?? null)
    tugas[i] = v
    simpanNilai(nis, mapel, { tugas })
  }

  // Unduh nilai kelas sebagai CSV untuk diolah di Excel
  const unduhCsv = () => {
    const kepala = ['NIS', 'Nama', ...Array.from({ length: JUMLAH_TUGAS }, (_, i) => `Tugas ${i + 1}`), 'PTS', 'PAS', 'Nilai Akhir', 'Predikat']
    const isi = baris.map(({ s, n, akhir }) => [
      s.nis,
      `"${s.nama}"`,
      ...Array.from({ length: JUMLAH_TUGAS }, (_, i) => n.tugas?.[i] ?? ''),
      n.pts ?? '',
      n.pas ?? '',
      akhir ?? '',
      predikat(akhir).label,
    ])
    const csv = [kepala, ...isi].map((r) => r.join(';')).join('\n')
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `nilai-${kelas}-${MAPEL[mapel].nama.toLowerCase().replace(/\s+/g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <DashHeader
        title="Input Nilai"
        desc={`${SEMESTER}. Nilai tersimpan otomatis dan langsung terlihat oleh siswa serta orang tua.`}
        action={
          <button onClick={unduhCsv} className={btn.secondary} disabled={!mapel}>
            <Download className="h-4 w-4" /> Unduh CSV
          </button>
        }
      />

      <Card className="mb-6 grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="kelas">
            Kelas
          </label>
          <select id="kelas" value={kelas} onChange={(e) => setKelas(e.target.value)} className={inputCls}>
            {L.daftarKelas.map((k) => (
              <option key={k} value={k}>
                Kelas {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="mapel">
            Mata pelajaran
          </label>
          <select id="mapel" value={mapel ?? ''} onChange={(e) => setPilihMapel(e.target.value)} className={inputCls} disabled={!daftarMapel.length}>
            {daftarMapel.length === 0 && <option>Tidak ada mapel yang Anda ampu di kelas ini</option>}
            {daftarMapel.map((m) => (
              <option key={m} value={m}>
                {MAPEL[m].nama}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {!mapel ? (
        <Card>
          <EmptyState icon={NotebookPen} title="Pilih kelas lain" desc="Anda tidak mengampu mata pelajaran di kelas ini." />
        </Card>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Users} label="Jumlah siswa" value={siswa.length} hint={`Kelas ${kelas}`} tone="sky" />
            <StatCard icon={TrendingUp} label="Rata-rata kelas" value={rata ?? '–'} hint={MAPEL[mapel].nama} tone="emerald" />
            <StatCard icon={Target} label="Tuntas KKTP" value={`${terisi.filter((b) => b.akhir >= KKTP).length}/${siswa.length}`} hint={`KKTP ${KKTP}`} tone="amber" />
            <StatCard icon={NotebookPen} label="Belum lengkap" value={belumLengkap} hint="tugas/PTS kosong" tone="primary" />
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Siswa</th>
                    {Array.from({ length: JUMLAH_TUGAS }, (_, i) => (
                      <th key={i} className="px-1.5 py-3 text-center font-semibold">
                        Tugas {i + 1}
                      </th>
                    ))}
                    <th className="px-1.5 py-3 text-center font-semibold">PTS</th>
                    <th className="px-1.5 py-3 text-center font-semibold">PAS</th>
                    <th className="px-3 py-3 text-center font-semibold">Akhir</th>
                    <th className="px-5 py-3 font-semibold">Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {baris.map(({ s, n, akhir }) => {
                    const p = predikat(akhir)
                    return (
                      <tr key={s.nis} className="hover:bg-slate-50/60">
                        <td className="px-5 py-2.5">
                          <span className="flex items-center gap-3">
                            <Avatar nama={s.nama} size="sm" />
                            <span>
                              <span className="block font-semibold text-slate-800">{s.nama}</span>
                              <span className="block text-xs text-slate-500">{s.nis}</span>
                            </span>
                          </span>
                        </td>
                        {Array.from({ length: JUMLAH_TUGAS }, (_, i) => (
                          <td key={i} className="px-1.5 py-2.5 text-center">
                            <KotakNilai nilai={n.tugas?.[i]} label={`Tugas ${i + 1} ${s.nama}`} onChange={(v) => ubahTugas(s.nis, n, i, v)} />
                          </td>
                        ))}
                        <td className="px-1.5 py-2.5 text-center">
                          <KotakNilai nilai={n.pts} label={`PTS ${s.nama}`} onChange={(v) => simpanNilai(s.nis, mapel, { pts: v })} />
                        </td>
                        <td className="px-1.5 py-2.5 text-center">
                          <KotakNilai nilai={n.pas} label={`PAS ${s.nama}`} onChange={(v) => simpanNilai(s.nis, mapel, { pas: v })} />
                        </td>
                        <td className="px-3 py-2.5 text-center text-base font-bold tabular-nums text-slate-900">{akhir ?? '–'}</td>
                        <td className="px-5 py-2.5">
                          <Badge className={p.cls}>
                            {p.huruf} · {p.label}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="flex items-start gap-2 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Nilai akhir = 40% rata-rata tugas + 30% PTS + 30% PAS (dihitung dari komponen yang sudah terisi). Kotak kuning menandakan nilai di bawah KKTP {KKTP}.
            </p>
          </Card>
        </>
      )}
    </>
  )
}
