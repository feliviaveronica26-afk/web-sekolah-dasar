import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { KartuRapor, RincianNilai, RingkasanNilai, SEMESTER } from '../../components/Nilai'
import { Card, DashHeader, EmptyState, Tabs } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { KKTP } from '../../data/dummy'
import { rekapNilai } from '../../utils/nilai'

// Halaman nilai dipakai bersama oleh siswa (nilainya sendiri) dan orang tua (nilai anak)
export function HalamanNilai({ siswa, untukOrtu = false }) {
  const { data } = useData()
  const [tab, setTab] = useState('rincian')

  if (!siswa) return <EmptyState title="Data siswa tidak ditemukan" desc="Silakan hubungi wali kelas." />

  const r = rekapNilai(data, siswa)
  const terendah = [...r.daftar].filter((d) => d.akhir !== null).sort((a, b) => a.akhir - b.akhir).slice(0, 2)
  const panggilan = siswa.nama.split(' ')[0]

  return (
    <>
      <DashHeader
        title={untukOrtu ? 'Nilai & Rapor Ananda' : 'Nilai Saya'}
        desc={`${SEMESTER} · Kelas ${siswa.kelas}. Nilai diperbarui setiap kali guru menginput nilai baru.`}
        action={
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              ['rincian', 'Rincian Nilai'],
              ['rapor', 'Rapor Sementara'],
            ]}
          />
        }
      />

      {tab === 'rincian' ? (
        <div className="antara-y-6">
          <RingkasanNilai siswa={siswa} />
          <div className="d-grid gap-6 kolom-xl-isi-320">
            <RincianNilai siswa={siswa} />
            <Card className="h-auto p-6">
              <span className="d-flex h-11 w-11 align-items-center justify-content-center rounded-3 bg-warning-subtle text-warning-emphasis">
                <Lightbulb className="h-5 w-5" />
              </span>
              <h2 className="mt-4 fs-lg fw-bold text-tinta">{untukOrtu ? 'Saran pendampingan' : 'Tips belajar untukmu'}</h2>
              {terendah.length === 0 ? (
                <p className="mt-2 fs-sm text-tinta-2">Belum ada nilai.</p>
              ) : (
                <>
                  <p className="mt-2 fs-sm text-tinta-2">
                    {untukOrtu ? `Mapel yang bisa didampingi lebih di rumah bersama ${panggilan}:` : 'Mapel yang bisa kamu latih lagi:'}
                  </p>
                  <ul className="mt-3 antara-y-2">
                    {terendah.map((d) => (
                      <li key={d.kode} className="d-flex align-items-center justify-content-between gap-2 rounded-2 bg-abu-50 px-3 py-2-5">
                        <span className={`rounded-1 px-2 py-1 fs-xs fw-bold ${d.warna}`}>{d.nama}</span>
                        <span className="fs-sm fw-bold text-tinta">{d.akhir}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 fs-sm text-tinta-2">
                    {terendah.some((d) => d.akhir < KKTP)
                      ? `Ada nilai di bawah KKTP ${KKTP}. ${untukOrtu ? 'Wali kelas akan memberikan program remedial; Bapak/Ibu dapat bertanya lewat menu Pesan.' : 'Jangan sedih, ikuti remedial dan tanya guru kalau bingung ya!'}`
                      : untukOrtu
                        ? 'Semua mapel sudah tuntas. Terus beri semangat dan apresiasi ya!'
                        : 'Semua mapel sudah tuntas. Hebat! Pertahankan semangatmu. 🌟'}
                  </p>
                </>
              )}
            </Card>
          </div>
        </div>
      ) : (
        <KartuRapor siswa={siswa} />
      )}
    </>
  )
}

export default function SiswaNilai() {
  const { user } = useAuth()
  const { data } = useData()
  return <HalamanNilai siswa={data.siswa.find((s) => s.nis === user.nis)} />
}
