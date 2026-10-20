import { useState } from 'react'
import { BookOpenCheck, Eye, Target, TrendingUp, Users } from 'lucide-react'
import { GrafikBatang } from '../../components/Grafik'
import { KartuRapor, SEMESTER } from '../../components/Nilai'
import { Avatar, Badge, Card, DashHeader, EmptyState, JudulKartu, Modal, StatCard, inputCls } from '../../components/ui'
import { useLingkup } from '../../context/akses'
import { ringkasAbsensi, useData } from '../../context/DataContext'
import { KKTP } from '../../data/dummy'
import { mapelRapor, predikat, rekapNilai } from '../../utils/nilai'
import { ringkasSikap } from '../../utils/prestasi'
import { teksHadir } from '../../utils/ringkasan'

export default function RaporKelas() {
  const { data } = useData()
  const L = useLingkup('rapor')
  const [kelas, setKelas] = useState(L.daftarKelas[0] ?? '')
  const [lihat, setLihat] = useState(null)

  if (!L.daftarKelas.length) return <EmptyState icon={BookOpenCheck} title="Belum ada kelas" desc="Rapor kelas tersedia untuk wali kelas, wakasek kurikulum, dan kepala sekolah." />

  const tanggal = Object.keys(data.absensi)
  const siswa = data.siswa
    .filter((s) => s.kelas === kelas)
    .map((s) => {
      const r = rekapNilai(data, s)
      return { s, r, hadir: ringkasAbsensi(data.absensi, s.nis, tanggal), poin: ringkasSikap(data, s.nis).total }
    })
    .sort((a, b) => (b.r.rataRata ?? 0) - (a.r.rataRata ?? 0))

  // Siswa yang belum punya nilai (mis. siswa baru) tidak ikut rata-rata kelas
  const adaNilai = siswa.filter((x) => x.r.rataRata !== null)
  const rataKelas = adaNilai.length ? Math.round((adaNilai.reduce((a, x) => a + x.r.rataRata, 0) / adaNilai.length) * 10) / 10 : null
  const semuaTuntas = siswa.filter((x) => x.r.tuntas === x.r.daftar.length).length
  // Rata-rata kelas per mapel
  const perMapel = mapelRapor(kelas).map((kode) => {
    const nilai = siswa.map((x) => x.r.daftar.find((d) => d.kode === kode)?.akhir).filter((n) => n !== null && n !== undefined)
    return { kode, nama: siswa[0]?.r.daftar.find((d) => d.kode === kode)?.nama ?? kode, nilai: nilai.length ? Math.round(nilai.reduce((a, b) => a + b, 0) / nilai.length) : null }
  })
  const siswaDilihat = data.siswa.find((s) => s.nis === lihat)

  return (
    <>
      <DashHeader
        title="Rapor Kelas"
        desc={`${SEMESTER}. Pantau capaian seluruh siswa dan cetak rapor sementara.`}
        action={
          L.daftarKelas.length > 1 && (
            <select value={kelas} onChange={(e) => setKelas(e.target.value)} className={`${inputCls} w-auto`} aria-label="Pilih kelas">
              {L.daftarKelas.map((k) => (
                <option key={k} value={k}>
                  Kelas {k}
                </option>
              ))}
            </select>
          )
        }
      />

      <div className="d-grid kolom-2 gap-4 kolom-lg-4">
        <StatCard icon={Users} label="Jumlah siswa" value={siswa.length} hint={`Kelas ${kelas}`} tone="sky" />
        <StatCard icon={TrendingUp} label="Rata-rata kelas" value={rataKelas ?? '–'} hint={predikat(rataKelas).label} tone="emerald" />
        <StatCard icon={Target} label="Tuntas semua mapel" value={`${semuaTuntas}/${siswa.length}`} hint={`KKTP ${KKTP}`} tone="amber" />
        <StatCard icon={BookOpenCheck} label="Mapel dinilai" value={perMapel.length} tone="primary" />
      </div>

      <div className="mt-6 d-grid gap-6 kolom-xl-14-10">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-100 min-w-620 text-start fs-sm">
              <thead className="bg-abu-50 fs-xs text-uppercase ls-wider text-tinta-3">
                <tr>
                  <th className="px-5 py-3 fw-semibold">#</th>
                  <th className="px-5 py-3 fw-semibold">Siswa</th>
                  <th className="px-3 py-3 text-center fw-semibold">Rata-rata</th>
                  <th className="px-3 py-3 text-center fw-semibold">Tuntas</th>
                  <th className="px-3 py-3 text-center fw-semibold">Hadir</th>
                  <th className="px-3 py-3 text-center fw-semibold">Poin</th>
                  <th className="px-5 py-3 text-end fw-semibold">Rapor</th>
                </tr>
              </thead>
              <tbody className="pembatas-y pembatas-abu angka">
                {siswa.map(({ s, r, hadir, poin }, i) => (
                  <tr key={s.nis} className="hover-latar">
                    <td className="px-5 py-3 fw-bold text-abu-400">{i + 1}</td>
                    <td className="px-5 py-3">
                      <span className="d-flex align-items-center gap-3">
                        <Avatar nama={s.nama} size="sm" />
                        <span className="fw-semibold text-tinta">{s.nama}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Badge className={predikat(r.rataRata).cls}>{r.rataRata ?? '–'}</Badge>
                    </td>
                    <td className="px-3 py-3 text-center text-tinta-2">
                      {r.tuntas}/{r.daftar.length}
                    </td>
                    <td className="px-3 py-3 text-center text-tinta-2">{teksHadir(hadir)}</td>
                    <td className="px-3 py-3 text-center text-tinta-2">{poin > 0 ? `+${poin}` : poin}</td>
                    <td className="px-5 py-3 text-end">
                      <button onClick={() => setLihat(s.nis)} className="d-inline-flex align-items-center gap-1-5 rounded-1 px-2-5 py-1-5 fs-xs fw-semibold text-primary hover-latar-merah">
                        <Eye className="h-4 w-4" /> Lihat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="h-auto p-6">
          <JudulKartu icon={TrendingUp} judul="Rata-rata kelas per mapel" />
          <GrafikBatang judul={`Rata-rata kelas ${kelas} per mata pelajaran`} data={perMapel.map((m) => ({ label: m.nama, nilai: m.nilai }))} acuan={{ nilai: KKTP, label: 'KKTP' }} />
        </Card>
      </div>

      <Modal open={!!siswaDilihat} onClose={() => setLihat(null)} title={`Rapor ${siswaDilihat?.nama ?? ''}`} size="max-w-4xl">
        {siswaDilihat && <KartuRapor siswa={siswaDilihat} bisaEdit={L.kelas === siswaDilihat.kelas} />}
      </Modal>
    </>
  )
}
