import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, ChevronRight, ClipboardCheck, Contact, Download, HeartPulse, Search, Star, TrendingUp, UserCheck, Users } from 'lucide-react'
import { teksJejak } from '../../components/PresensiOtp'
import { Avatar, Badge, Card, DashHeader, EmptyState, Modal, Progres, STATUS_ABSEN, StatCard, btn, inputCls } from '../../components/ui'
import { useLingkup } from '../../context/akses'
import { ringkasAbsensi, useData } from '../../context/DataContext'
import { KELAS, KKTP } from '../../data/dummy'
import { formatTanggal, parseKey, todayKey } from '../../utils/format'
import { rekapNilai } from '../../utils/nilai'
import { ekskulSiswa, infoSikap, ringkasSikap } from '../../utils/prestasi'
import { rataHadir, siswaBaru } from '../../utils/ringkasan'
import { unduhFileCsv } from '../../utils/keamanan'
import { adaBiodata, namaJk, teksLahir, usia } from '../../utils/siswa'

const URUT = { nama: 'Urut nama', nis: 'Urut NIS', hadir: 'Kehadiran terendah', nilai: 'Nilai terendah' }
const warnaHadir = (p) => (p >= 90 ? 'titik-emerald' : p >= 75 ? 'titik-amber' : 'titik-rose')

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
  const keluarga = (data.orangTua ?? []).find((k) => k.anak?.includes(s.nis))
  const ekskul = ekskulSiswa(data, s)
  // Biodata pribadi hanya dikirim server ke wali kelasnya & pengelola Data Siswa
  const bio = adaBiodata(s)
  const info = [
    ['NIS', s.nis],
    ...(bio ? [['NISN', s.nisn || '–']] : []),
    ['Jenis kelamin', namaJk(s.jk)],
    ...(bio
      ? [
          ['Tempat, tanggal lahir', teksLahir(s) ? `${teksLahir(s)}${s.tanggalLahir ? ` (${usia(s.tanggalLahir)} th)` : ''}` : '–'],
          ['Agama', s.agama || '–'],
          ['Golongan darah', s.golonganDarah || '–'],
          ['Asal TK / sekolah', s.asalSekolah || '–'],
        ]
      : []),
    ['Orang tua/wali', s.ortu || '–'],
    // Kontak keluarga hanya dikirim server ke wali kelasnya, Tata Usaha, BK, Kesiswaan, dan Kepala Sekolah
    ['Kontak orang tua', keluarga?.whatsapp || (keluarga ? '–' : 'Hanya untuk wali kelas')],
    ['Alamat', keluarga?.alamat || '–'],
    ['Ekstrakurikuler', ekskul.map((e) => e.nama).join(', ') || '–'],
  ]

  return (
    <Modal open onClose={onClose} title="Detail siswa" size="max-w-2xl">
      <div className="d-flex align-items-center gap-4">
        <Avatar nama={s.nama} size="lg" />
        <div>
          <p className="fs-lg fw-bold text-tinta">{s.nama}</p>
          <p className="fs-sm text-tinta-3">Kelas {s.kelas}</p>
        </div>
      </div>

      {s.catatanKesehatan && (
        <p className="mt-5 d-flex align-items-start gap-2 rounded-2 border border-warning-subtle bg-warning-subtle px-4 py-3 fs-sm text-warning-emphasis">
          <HeartPulse className="mt-0-5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>
            Catatan kesehatan: <span className="fw-semibold">{s.catatanKesehatan}</span>
          </span>
        </p>
      )}

      <dl className="mt-5 d-grid column-gap-6 row-gap-2 rounded-2 bg-abu-50 p-4 fs-sm kolom-sm-2">
        {info.map(([k, v]) => (
          <div key={k} className="d-flex justify-content-between gap-3 d-sm-block">
            <dt className="text-tinta-3">{k}</dt>
            <dd className="fw-semibold text-tinta">{v}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-6 fw-bold text-tinta">Kehadiran 20 hari sekolah terakhir</h3>
      <div className="mt-2 d-flex flex-wrap gap-2">
        {Object.entries(STATUS_ABSEN).map(([k, st]) => (
          <Badge key={k} className={hadir[k] ? st.cls : 'bg-abu-50 text-abu-400'}>
            {st.label} {hadir[k]}
          </Badge>
        ))}
        <Badge className="bg-tinta text-white">{hadir.total ? `${hadir.persen}% hadir` : 'Belum ada presensi'}</Badge>
      </div>
      <div className="mt-3 d-flex flex-wrap gap-1">
        {[...tanggal20].reverse().map((t) => {
          const k = data.absensi[t]?.[s.nis]
          const j = teksJejak(data.jejakAbsensi[t]?.[s.nis])
          return (
            <span
              key={t}
              title={`${formatTanggal(t, { weekday: 'short', year: undefined })}: ${k ? STATUS_ABSEN[k].label : 'Tidak ada catatan'}${j ? ` (${j.teks})` : ''}`}
              className={`d-flex h-8 w-8 align-items-center justify-content-center rounded-1 fs-xs fw-bold ${k ? `${STATUS_ABSEN[k].dot} text-white` : 'bg-abu-100 text-abu-400'} ${
                t === hariIni ? 'cincin-tanda' : ''
              }`}
            >
              {k ?? parseKey(t).getDate()}
            </span>
          )
        })}
      </div>

      <h3 className="mt-6 fw-bold text-tinta">Nilai semester ini</h3>
      <p className="fs-sm text-tinta-3">
        Rata-rata <b className="text-tinta">{nilai.rataRata ?? '–'}</b> · {nilai.tuntas} dari {nilai.daftar.length} mapel tuntas (KKTP {KKTP})
      </p>
      <ul className="mt-3 d-grid column-gap-6 row-gap-1-5 fs-sm kolom-sm-2">
        {nilai.daftar.map((d) => (
          <li key={d.kode} className="d-flex align-items-center justify-content-between gap-3">
            <span className="text-truncate text-tinta-2">{d.nama}</span>
            <span className={`fw-bold angka ${d.akhir !== null && d.akhir < KKTP ? 'text-warning-emphasis' : 'text-tinta'}`}>{d.akhir ?? '–'}</span>
          </li>
        ))}
      </ul>

      <h3 className="mt-6 fw-bold text-tinta">Poin sikap</h3>
      <p className="fs-sm text-tinta-3">
        Total <b className="text-tinta">{sikap.total}</b> poin · {sikap.positif} catatan positif · {sikap.perbaikan} perlu perbaikan
      </p>
      <ul className="mt-2 antara-y-1-5 fs-sm">
        {sikap.daftar.slice(0, 3).map((x) => (
          <li key={x.id} className="d-flex align-items-center gap-2 text-tinta-2">
            <span>{infoSikap(x.kode).emoji}</span>
            <span className="flex-1">{infoSikap(x.kode).label}</span>
            <span className="fs-xs text-abu-400">{formatTanggal(x.tanggal, { year: undefined })}</span>
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
  const rataKehadiran = rataHadir(baris.map((b) => b.hadir))
  // Siswa yang masuk 30 hari terakhir diberi tanda "Baru" (tanggal masuk hanya diterima wali kelasnya & pengelola data siswa)
  const nisBaru = new Set(siswaBaru(data).map((s) => s.nis))
  const nilaiAda = baris.map((b) => b.nilai.rataRata).filter((n) => n !== null)
  const rataNilai = nilaiAda.length ? Math.round((nilaiAda.reduce((a, b) => a + b, 0) / nilaiAda.length) * 10) / 10 : '–'
  const hadirHariIni = baris.filter((b) => data.absensi[hariIni]?.[b.s.nis] === 'H').length
  const laki = baris.filter((b) => b.s.jk === 'L').length

  const kunci = cari.trim().toLowerCase()
  baris = baris.filter((b) => !kunci || b.s.nama.toLowerCase().includes(kunci) || b.s.nis.includes(kunci) || b.s.ortu?.toLowerCase().includes(kunci))
  const pembanding = {
    nama: (a, b) => a.s.nama.localeCompare(b.s.nama),
    nis: (a, b) => a.s.nis.localeCompare(b.s.nis),
    // Siswa tanpa catatan presensi (mis. siswa baru) di urutan terakhir
    hadir: (a, b) => (a.hadir.total ? a.hadir.persen : 101) - (b.hadir.total ? b.hadir.persen : 101),
    nilai: (a, b) => (a.nilai.rataRata ?? 101) - (b.nilai.rataRata ?? 101),
  }
  baris.sort(pembanding[urut])

  // Unduh daftar siswa kelas ini sebagai CSV
  const unduhCsv = () => {
    const kepala = ['No', 'NIS', 'Nama', 'L/P', 'Orang tua/wali', 'Kehadiran 20 hari (%)', 'Sakit', 'Izin', 'Alpa', 'Rata-rata nilai', 'Poin sikap']
    const isi = baris.map((b, i) => [
      i + 1,
      b.s.nis,
      b.s.nama,
      b.s.jk,
      b.s.ortu ?? '',
      b.hadir.total ? b.hadir.persen : '',
      b.hadir.S,
      b.hadir.I,
      b.hadir.A,
      b.nilai.rataRata ?? '',
      b.sikap.total,
    ])
    unduhFileCsv(`daftar-siswa-${kelas}.csv`, [kepala, ...isi])
  }

  return (
    <>
      <DashHeader title="Daftar Siswa" desc={`${data.siswa.length} siswa di ${daftarKelas.length} kelas. Pilih kelas untuk melihat daftar dan ringkasannya.`} />

      <Card className="mb-6 p-4 p-sm-5">
        <div className="d-grid kolom-3 gap-2 kolom-sm-6 kolom-lg-9" role="tablist" aria-label="Pilih kelas">
          {daftarKelas.map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={kelas === k}
              onClick={() => setKelas(k)}
              className={`position-relative rounded-2 px-2 py-2-5 text-center transisi ${
                kelas === k
                  ? 'bg-primary text-white bayangan-merah'
                  : 'bg-abu-50 text-tinta-2 border border-abu-200 hover-latar-putih hover-garis-merah'
              }`}
            >
              <span className="d-block fs-lg fw-bold lh-tight">{k}</span>
              <span className={`d-block fs-2xs ${kelas === k ? 'text-merah-100' : 'text-tinta-3'}`}>{jumlahPerKelas(k)} siswa</span>
              {k === L.kelas && (
                <Star className={`position-absolute end-1-5 top-1-5 h-3 w-3 ${kelas === k ? 'teks-terang-amber' : 'teks-terang-amber'}`} aria-label="Kelas Anda" />
              )}
            </button>
          ))}
        </div>
      </Card>

      <div className="mb-4 d-flex flex-column gap-3 flex-sm-row align-items-sm-end justify-content-sm-between">
        <div>
          <h2 className="fs-xl fw-bold text-tinta">Kelas {kelas}</h2>
          <p className="fs-sm text-tinta-3">
            Wali kelas: <span className="fw-semibold text-tinta-2">{wali?.nama ?? 'Belum ditentukan'}</span> ·{' '}
            {baris.length === jumlahPerKelas(kelas) ? '' : `${baris.length} cocok dari `}
            {jumlahPerKelas(kelas)} siswa ({laki} L, {jumlahPerKelas(kelas) - laki} P)
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
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

      <div className="mb-4 d-grid kolom-2 gap-4 kolom-lg-4">
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
        <StatCard icon={CalendarCheck} label="Rata-rata kehadiran" value={`${rataKehadiran}%`} hint="20 hari sekolah terakhir" tone="amber" />
        <StatCard icon={TrendingUp} label="Rata-rata nilai" value={rataNilai} hint="semester ini" tone="primary" />
      </div>

      <Card className="overflow-hidden">
        <div className="d-flex flex-column gap-3 border-bottom border-abu-100 p-4 flex-sm-row align-items-sm-center justify-content-sm-between">
          <div className="position-relative w-sm-80">
            <Search className="pe-none position-absolute start-3-5 top-50 h-4 w-4 translate-middle-y text-abu-400" />
            <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama, NIS, atau orang tua..." className={`${inputCls} ps-10`} />
          </div>
          <select value={urut} onChange={(e) => setUrut(e.target.value)} className={`${inputCls} w-auto`} aria-label="Urutan">
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
            <table className="w-100 min-w-880 text-start fs-sm">
              <thead className="bg-abu-50 fs-xs text-uppercase ls-wider text-tinta-3">
                <tr>
                  <th className="px-5 py-3 fw-semibold">No</th>
                  <th className="px-3 py-3 fw-semibold">Siswa</th>
                  <th className="px-3 py-3 fw-semibold">L/P</th>
                  <th className="px-3 py-3 fw-semibold">Orang tua/wali</th>
                  <th className="px-3 py-3 fw-semibold">Kehadiran 20 hari</th>
                  <th className="px-3 py-3 fw-semibold">Hari ini</th>
                  <th className="px-3 py-3 text-center fw-semibold">Nilai</th>
                  <th className="px-3 py-3 text-center fw-semibold">Poin sikap</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="pembatas-y pembatas-abu">
                {baris.map((b, i) => {
                  const st = data.absensi[hariIni]?.[b.s.nis]
                  return (
                    <tr key={b.s.nis} onClick={() => setDetail(b)} className="cursor-pointer hover-latar">
                      <td className="px-5 py-3 text-abu-400">{i + 1}</td>
                      <td className="px-3 py-3">
                        <button onClick={() => setDetail(b)} className="d-flex align-items-center gap-3 text-start">
                          <Avatar nama={b.s.nama} size="sm" />
                          <span>
                            <span className="d-block fw-semibold text-tinta">
                              {b.s.nama}
                              {nisBaru.has(b.s.nis) && <Badge className="ms-1-5 bg-info-subtle text-info-emphasis">Baru</Badge>}
                            </span>
                            <span className="d-block fs-xs text-tinta-3">NIS {b.s.nis}</span>
                            {b.s.catatanKesehatan && (
                              <span className="d-flex align-items-center gap-1 fs-xs fw-medium text-warning-emphasis">
                                <HeartPulse className="h-3 w-3 flex-shrink-0" aria-hidden="true" /> {b.s.catatanKesehatan}
                              </span>
                            )}
                          </span>
                        </button>
                      </td>
                      <td className="px-3 py-3 text-tinta-2">{b.s.jk}</td>
                      <td className="px-3 py-3 text-tinta-2">{b.s.ortu ?? '–'}</td>
                      <td className="w-48 px-3 py-3">
                        <div className="d-flex align-items-center gap-2">
                          <Progres nilai={b.hadir.persen} warna={warnaHadir(b.hadir.persen)} className="flex-1" />
                          <span className="w-10 text-end fw-bold angka text-tinta">{b.hadir.total ? `${b.hadir.persen}%` : '–'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {st ? (
                          <Badge className={STATUS_ABSEN[st].cls}>{STATUS_ABSEN[st].label}</Badge>
                        ) : (
                          <Badge className="bg-abu-100 text-tinta-3">Belum tercatat</Badge>
                        )}
                      </td>
                      <td
                        className={`px-3 py-3 text-center fw-bold angka ${b.nilai.rataRata !== null && b.nilai.rataRata < KKTP ? 'text-warning-emphasis' : 'text-tinta'}`}
                      >
                        {b.nilai.rataRata ?? '–'}
                      </td>
                      <td className={`px-3 py-3 text-center fw-semibold angka ${b.sikap.total < 0 ? 'text-danger' : 'text-tinta-2'}`}>
                        {b.sikap.total}
                      </td>
                      <td className="px-3 py-3 text-abu-400">
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
