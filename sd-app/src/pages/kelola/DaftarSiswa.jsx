import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, ChevronRight, ClipboardCheck, Contact, Download, Search, Star, TrendingUp, UserCheck, Users } from 'lucide-react'
import { teksJejak } from '../../components/PresensiOtp'
import { Avatar, Badge, Card, DashHeader, EmptyState, Modal, Progres, STATUS_ABSEN, StatCard, btn, inputCls } from '../../components/ui'
import { useLingkup } from '../../context/akses'
import { ringkasAbsensi, useData } from '../../context/DataContext'
import { BIODATA, KELAS, KKTP } from '../../data/dummy'
import { formatTanggal, parseKey, todayKey } from '../../utils/format'
import { rekapNilai } from '../../utils/nilai'
import { ekskulSiswa, infoSikap, ringkasSikap } from '../../utils/prestasi'

const URUT = { nama: 'Urut nama', nis: 'Urut NIS', hadir: 'Kehadiran terendah', nilai: 'Nilai terendah' }
const warnaHadir = (p) => (p >= 90 ? 'bg-emerald-500' : p >= 75 ? 'bg-amber-400' : 'bg-rose-500')

// Ringkasan satu siswa: kehadiran 20 hari, nilai, dan poin sikap
function ringkasSiswa(data, s, tanggal20) {
  const hadir = ringkasAbsensi(data.absensi, s.nis, tanggal20)
  const nilai = rekapNilai(data, s)
  const sikap = ringkasSikap(data, s.nis)
  return { s, hadir, nilai, sikap }
}

function DetailSiswa({ item, tanggal20, onClose }) {
  const { data } = useData()
  const { s, hadir, nilai, sikap } = item
  const hariIni = todayKey()
  const bio = BIODATA[s.nis] ?? {}
  const ekskul = ekskulSiswa(data, s)
  const info = [
    ['NIS', s.nis],
    ['Jenis kelamin', s.jk === 'L' ? 'Laki-laki' : 'Perempuan'],
    ['Orang tua/wali', s.ortu || '–'],
    ['Kontak orang tua', bio.teleponOrtu ?? '–'],
    ['Ekstrakurikuler', ekskul.map((e) => e.nama).join(', ') || '–'],
  ]

  return (
    <Modal open onClose={onClose} title="Detail siswa" size="max-w-2xl">
      <div className="flex items-center gap-4">
        <Avatar nama={s.nama} size="lg" />
        <div>
          <p className="text-lg font-bold text-slate-900">{s.nama}</p>
          <p className="text-sm text-slate-500">Kelas {s.kelas}</p>
        </div>
      </div>

      <dl className="mt-5 grid gap-x-6 gap-y-2 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
        {info.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 sm:block">
            <dt className="text-slate-500">{k}</dt>
            <dd className="font-semibold text-slate-800">{v}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-6 font-bold text-slate-900">Kehadiran 20 hari sekolah terakhir</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {Object.entries(STATUS_ABSEN).map(([k, st]) => (
          <Badge key={k} className={hadir[k] ? st.cls : 'bg-slate-50 text-slate-400'}>
            {st.label} {hadir[k]}
          </Badge>
        ))}
        <Badge className="bg-slate-900 text-white">{hadir.persen}% hadir</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {[...tanggal20].reverse().map((t) => {
          const k = data.absensi[t]?.[s.nis]
          const j = teksJejak(data.jejakAbsensi[t]?.[s.nis])
          return (
            <span
              key={t}
              title={`${formatTanggal(t, { weekday: 'short', year: undefined })}: ${k ? STATUS_ABSEN[k].label : 'Tidak ada catatan'}${j ? ` (${j.teks})` : ''}`}
              className={`grid h-8 w-8 place-items-center rounded-md text-xs font-bold ${k ? `${STATUS_ABSEN[k].dot} text-white` : 'bg-slate-100 text-slate-400'} ${
                t === hariIni ? 'ring-2 ring-slate-900/40 ring-offset-1' : ''
              }`}
            >
              {k ?? parseKey(t).getDate()}
            </span>
          )
        })}
      </div>

      <h3 className="mt-6 font-bold text-slate-900">Nilai semester ini</h3>
      <p className="text-sm text-slate-500">
        Rata-rata <b className="text-slate-800">{nilai.rataRata ?? '–'}</b> · {nilai.tuntas} dari {nilai.daftar.length} mapel tuntas (KKTP {KKTP})
      </p>
      <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        {nilai.daftar.map((d) => (
          <li key={d.kode} className="flex items-center justify-between gap-3">
            <span className="truncate text-slate-600">{d.nama}</span>
            <span className={`font-bold tabular-nums ${d.akhir !== null && d.akhir < KKTP ? 'text-amber-700' : 'text-slate-800'}`}>{d.akhir ?? '–'}</span>
          </li>
        ))}
      </ul>

      <h3 className="mt-6 font-bold text-slate-900">Poin sikap</h3>
      <p className="text-sm text-slate-500">
        Total <b className="text-slate-800">{sikap.total}</b> poin · {sikap.positif} catatan positif · {sikap.perbaikan} perlu perbaikan
      </p>
      <ul className="mt-2 space-y-1.5 text-sm">
        {sikap.daftar.slice(0, 3).map((x) => (
          <li key={x.id} className="flex items-center gap-2 text-slate-600">
            <span>{infoSikap(x.kode).emoji}</span>
            <span className="flex-1">{infoSikap(x.kode).label}</span>
            <span className="text-xs text-slate-400">{formatTanggal(x.tanggal, { year: undefined })}</span>
          </li>
        ))}
      </ul>
    </Modal>
  )
}

export default function DaftarSiswa() {
  const { data } = useData()
  const L = useLingkup('kelas')
  const presensi = useLingkup('absensi')
  const daftarKelas = [...new Set([...KELAS, ...L.daftarKelas])].sort()
  const [kelas, setKelas] = useState(L.kelas && daftarKelas.includes(L.kelas) ? L.kelas : daftarKelas[0])
  const [cari, setCari] = useState('')
  const [urut, setUrut] = useState('nama')
  const [detail, setDetail] = useState(null)

  const hariIni = todayKey()
  const tanggal20 = Object.keys(data.absensi).sort().reverse().slice(0, 20)
  const jumlahPerKelas = (k) => data.siswa.filter((s) => s.kelas === k).length
  const wali = data.guru.find((g) => g.peran?.includes('wali_kelas') && g.kelas === kelas)

  let baris = data.siswa.filter((s) => s.kelas === kelas).map((s) => ringkasSiswa(data, s, tanggal20))
  const rataHadir = baris.length ? Math.round(baris.reduce((a, b) => a + b.hadir.persen, 0) / baris.length) : 0
  const nilaiAda = baris.map((b) => b.nilai.rataRata).filter((n) => n !== null)
  const rataNilai = nilaiAda.length ? Math.round((nilaiAda.reduce((a, b) => a + b, 0) / nilaiAda.length) * 10) / 10 : '–'
  const hadirHariIni = baris.filter((b) => data.absensi[hariIni]?.[b.s.nis] === 'H').length
  const laki = baris.filter((b) => b.s.jk === 'L').length

  const kunci = cari.trim().toLowerCase()
  baris = baris.filter((b) => !kunci || b.s.nama.toLowerCase().includes(kunci) || b.s.nis.includes(kunci) || b.s.ortu?.toLowerCase().includes(kunci))
  const pembanding = {
    nama: (a, b) => a.s.nama.localeCompare(b.s.nama),
    nis: (a, b) => a.s.nis.localeCompare(b.s.nis),
    hadir: (a, b) => a.hadir.persen - b.hadir.persen,
    nilai: (a, b) => (a.nilai.rataRata ?? 101) - (b.nilai.rataRata ?? 101),
  }
  baris.sort(pembanding[urut])

  // Unduh daftar siswa kelas ini sebagai CSV
  const unduhCsv = () => {
    const kepala = ['No', 'NIS', 'Nama', 'L/P', 'Orang tua/wali', 'Kehadiran 20 hari (%)', 'Sakit', 'Izin', 'Alpa', 'Rata-rata nilai', 'Poin sikap']
    const isi = baris.map((b, i) => [
      i + 1,
      b.s.nis,
      `"${b.s.nama}"`,
      b.s.jk,
      `"${b.s.ortu ?? ''}"`,
      b.hadir.persen,
      b.hadir.S,
      b.hadir.I,
      b.hadir.A,
      b.nilai.rataRata ?? '',
      b.sikap.total,
    ])
    const csv = [kepala, ...isi].map((r) => r.join(';')).join('\n')
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `daftar-siswa-${kelas}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <DashHeader title="Daftar Siswa" desc={`${data.siswa.length} siswa di ${daftarKelas.length} kelas. Pilih kelas untuk melihat daftar dan ringkasannya.`} />

      <Card className="mb-6 p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-9" role="tablist" aria-label="Pilih kelas">
          {daftarKelas.map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={kelas === k}
              onClick={() => setKelas(k)}
              className={`relative rounded-xl px-2 py-2.5 text-center transition ${
                kelas === k
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                  : 'bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-white hover:ring-primary-200'
              }`}
            >
              <span className="block font-display text-lg font-bold leading-tight">{k}</span>
              <span className={`block text-[11px] ${kelas === k ? 'text-primary-100' : 'text-slate-500'}`}>{jumlahPerKelas(k)} siswa</span>
              {k === L.kelas && (
                <Star className={`absolute right-1.5 top-1.5 h-3 w-3 ${kelas === k ? 'text-amber-300' : 'text-amber-400'}`} aria-label="Kelas Anda" />
              )}
            </button>
          ))}
        </div>
      </Card>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kelas {kelas}</h2>
          <p className="text-sm text-slate-500">
            Wali kelas: <span className="font-semibold text-slate-700">{wali?.nama ?? 'Belum ditentukan'}</span> ·{' '}
            {baris.length === jumlahPerKelas(kelas) ? '' : `${baris.length} cocok dari `}
            {jumlahPerKelas(kelas)} siswa ({laki} L, {jumlahPerKelas(kelas) - laki} P)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {presensi.daftarKelas.includes(kelas) && (
            <Link to={`${L.base}/absensi?kelas=${kelas}`} className={btn.primary}>
              <ClipboardCheck className="h-4 w-4" /> Presensi kelas ini
            </Link>
          )}
          <button onClick={unduhCsv} className={btn.secondary}>
            <Download className="h-4 w-4" /> Unduh CSV
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Jumlah siswa"
          value={jumlahPerKelas(kelas)}
          hint={`${laki} laki-laki · ${jumlahPerKelas(kelas) - laki} perempuan`}
          tone="sky"
        />
        <StatCard
          icon={UserCheck}
          label="Hadir hari ini"
          value={`${hadirHariIni}/${jumlahPerKelas(kelas)}`}
          hint={formatTanggal(hariIni, { year: undefined })}
          tone="emerald"
        />
        <StatCard icon={CalendarCheck} label="Rata-rata kehadiran" value={`${rataHadir}%`} hint="20 hari sekolah terakhir" tone="amber" />
        <StatCard icon={TrendingUp} label="Rata-rata nilai" value={rataNilai} hint="semester ini" tone="primary" />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama, NIS, atau orang tua..." className={`${inputCls} pl-10`} />
          </div>
          <select value={urut} onChange={(e) => setUrut(e.target.value)} className={`${inputCls} w-auto!`} aria-label="Urutan">
            {Object.entries(URUT).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {baris.length === 0 ? (
          <EmptyState icon={Contact} title="Tidak ada siswa" desc={cari ? 'Tidak ada yang cocok dengan pencarian.' : 'Kelas ini belum memiliki siswa.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">No</th>
                  <th className="px-3 py-3 font-semibold">Siswa</th>
                  <th className="px-3 py-3 font-semibold">L/P</th>
                  <th className="px-3 py-3 font-semibold">Orang tua/wali</th>
                  <th className="px-3 py-3 font-semibold">Kehadiran 20 hari</th>
                  <th className="px-3 py-3 font-semibold">Hari ini</th>
                  <th className="px-3 py-3 text-center font-semibold">Nilai</th>
                  <th className="px-3 py-3 text-center font-semibold">Poin sikap</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {baris.map((b, i) => {
                  const st = data.absensi[hariIni]?.[b.s.nis]
                  return (
                    <tr key={b.s.nis} onClick={() => setDetail(b)} className="cursor-pointer hover:bg-slate-50/80">
                      <td className="px-5 py-3 text-slate-400">{i + 1}</td>
                      <td className="px-3 py-3">
                        <button onClick={() => setDetail(b)} className="flex items-center gap-3 text-left">
                          <Avatar nama={b.s.nama} size="sm" />
                          <span>
                            <span className="block font-semibold text-slate-800">{b.s.nama}</span>
                            <span className="block text-xs text-slate-500">NIS {b.s.nis}</span>
                          </span>
                        </button>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{b.s.jk}</td>
                      <td className="px-3 py-3 text-slate-600">{b.s.ortu ?? '–'}</td>
                      <td className="w-48 px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Progres nilai={b.hadir.persen} warna={warnaHadir(b.hadir.persen)} className="flex-1" />
                          <span className="w-10 text-right font-bold tabular-nums text-slate-900">{b.hadir.persen}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {st ? (
                          <Badge className={STATUS_ABSEN[st].cls}>{STATUS_ABSEN[st].label}</Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-500">Belum tercatat</Badge>
                        )}
                      </td>
                      <td
                        className={`px-3 py-3 text-center font-bold tabular-nums ${b.nilai.rataRata !== null && b.nilai.rataRata < KKTP ? 'text-amber-700' : 'text-slate-800'}`}
                      >
                        {b.nilai.rataRata ?? '–'}
                      </td>
                      <td className={`px-3 py-3 text-center font-semibold tabular-nums ${b.sikap.total < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {b.sikap.total}
                      </td>
                      <td className="px-3 py-3 text-slate-400">
                        <ChevronRight className="h-4 w-4" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {detail && <DetailSiswa item={detail} tanggal20={tanggal20} onClose={() => setDetail(null)} />}
    </>
  )
}
