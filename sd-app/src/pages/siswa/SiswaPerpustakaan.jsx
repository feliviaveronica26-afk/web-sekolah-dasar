import { useState } from 'react'
import { BookMarked, BookOpen, Library, Search } from 'lucide-react'
import { Alert, Badge, Card, DashHeader, EmptyState, JudulKartu, inputCls } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { formatTanggal, selisihHari, todayKey } from '../../utils/format'

// Warna sampul buku berdasarkan kategori
const SAMPUL = {
  'Cerita Rakyat': 'gradasi-sampul-rakyat',
  Pengetahuan: 'gradasi-sampul-pengetahuan',
  Pelajaran: 'gradasi-sampul-pelajaran',
  'Fiksi Anak': 'gradasi-sampul-fiksi',
  Sejarah: 'gradasi-sampul-sejarah',
}

export default function SiswaPerpustakaan() {
  const { user } = useAuth()
  const { data, pesanBuku: kirimPesanan, batalPesanBuku } = useData()
  const [cari, setCari] = useState('')
  const [kategori, setKategori] = useState('Semua')
  const [pesan, setPesan] = useState('')

  const hariIni = todayKey()
  const aktif = data.peminjaman.filter((p) => !p.tanggalKembali)
  const pinjamanku = aktif.filter((p) => p.nis === user.nis)
  const riwayat = data.peminjaman.filter((p) => p.nis === user.nis && p.tanggalKembali)
  const reservasiku = data.reservasi.filter((r) => r.nis === user.nis && r.status === 'Menunggu')
  const buku = (id) => data.buku.find((b) => b.id === id)
  const tersedia = (b) => Number(b.stok) - aktif.filter((p) => p.bukuId === b.id).length

  const q = cari.trim().toLowerCase()
  const daftarKategori = ['Semua', ...new Set(data.buku.map((b) => b.kategori))]
  const katalog = data.buku.filter((b) => (kategori === 'Semua' || b.kategori === kategori) && (!q || `${b.judul} ${b.penulis}`.toLowerCase().includes(q)))

  const pesanBuku = async (b) => {
    if (reservasiku.length >= 1) return setPesan('Kamu hanya bisa memesan 1 buku dalam satu waktu.')
    if (pinjamanku.length >= 2) return setPesan('Kamu sedang meminjam 2 buku. Kembalikan dulu sebelum memesan lagi.')
    const galat = await kirimPesanan(b.id)
    setPesan(galat ?? `Buku "${b.judul}" sudah dipesan. Ambil di perpustakaan saat istirahat ya! 📚`)
  }

  return (
    <>
      <DashHeader title="Perpustakaan" desc="Lihat buku yang kamu pinjam dan pesan buku baru untuk diambil di perpustakaan." />

      {pesan && (
        <div className="mb-5">
          <Alert tone={pesan.startsWith('Buku') ? 'success' : 'warning'}>{pesan}</Alert>
        </div>
      )}

      <div className="mb-6 d-grid gap-6 kolom-lg-2">
        <Card className="p-6">
          <JudulKartu icon={BookOpen} judul={`Sedang kupinjam (${pinjamanku.length}/2)`} />
          {pinjamanku.length === 0 ? (
            <p className="rounded-2 bg-abu-50 px-4 py-6 text-center fs-sm text-tinta-3">Belum ada buku yang dipinjam.</p>
          ) : (
            <ul className="antara-y-3">
              {pinjamanku.map((p) => {
                const b = buku(p.bukuId)
                const sisa = selisihHari(hariIni, p.tenggat)
                return (
                  <li key={p.id} className="d-flex align-items-center gap-3 rounded-3 bg-abu-50 p-3 gap-sm-4">
                    <span className={`d-flex h-16 w-12 flex-shrink-0 align-items-center justify-content-center rounded-1 text-white shadow ${SAMPUL[b?.kategori] ?? 'gradasi-sampul-lain'}`}>
                      <BookOpen className="h-5 w-5" />
                    </span>
                    {/* Di HP sempit, label sisa hari turun ke bawah judul */}
                    <div className="d-flex min-w-0 flex-1 flex-column align-items-start gap-1-5 flex-sm-row align-items-sm-center justify-content-sm-between gap-sm-4">
                      <div className="min-w-0">
                        <p className="fw-bold text-tinta">{b?.judul}</p>
                        <p className="fs-xs text-tinta-3">Kembalikan {formatTanggal(p.tenggat)}</p>
                      </div>
                      <Badge className={`flex-shrink-0 ${sisa < 0 ? 'bg-danger-subtle text-danger' : sisa <= 2 ? 'bg-warning-subtle text-warning-emphasis' : 'bg-success-subtle text-success'}`}>
                        {sisa < 0 ? `Terlambat ${-sisa} hari` : sisa === 0 ? 'Hari ini' : `${sisa} hari lagi`}
                      </Badge>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <JudulKartu icon={BookMarked} judul="Pesanan & riwayat" />
          {reservasiku.map((r) => (
            <div key={r.id} className="mb-3 d-flex align-items-center justify-content-between gap-3 rounded-3 bg-info-subtle p-3">
              <div>
                <p className="fs-xs fw-semibold text-info">Menunggu diambil</p>
                <p className="fw-bold text-tinta">{buku(r.bukuId)?.judul}</p>
              </div>
              <button onClick={() => batalPesanBuku(r.id)} className="fs-xs fw-semibold text-danger hover-garis-bawah">
                Batalkan
              </button>
            </div>
          ))}
          {riwayat.length === 0 && reservasiku.length === 0 ? (
            <p className="rounded-2 bg-abu-50 px-4 py-6 text-center fs-sm text-tinta-3">Belum ada riwayat peminjaman.</p>
          ) : (
            <ul className="pembatas-y pembatas-abu">
              {riwayat.map((p) => (
                <li key={p.id} className="d-flex justify-content-between gap-3 py-2-5 fs-sm">
                  <span className="fw-semibold text-tinta-2">{buku(p.bukuId)?.judul}</span>
                  <span className="text-tinta-3">Dikembalikan {formatTanggal(p.tanggalKembali, { year: undefined })}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <JudulKartu icon={Library} judul="Katalog buku" />
        <div className="mb-5 d-flex flex-column gap-3 flex-sm-row">
          <div className="position-relative flex-1">
            <Search className="pe-none position-absolute start-3-5 top-50 h-4 w-4 translate-middle-y text-abu-400" />
            <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari judul atau penulis..." className={`${inputCls} ps-10`} />
          </div>
          <select value={kategori} onChange={(e) => setKategori(e.target.value)} className={`${inputCls} w-sm-52`}>
            {daftarKategori.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </div>
        {katalog.length === 0 ? (
          <EmptyState icon={Library} title="Buku tidak ditemukan" desc="Coba kata kunci lain." />
        ) : (
          <div className="d-grid kolom-2 gap-4 kolom-sm-3 kolom-lg-5">
            {katalog.map((b) => {
              const ada = tersedia(b)
              const sudahPesan = reservasiku.some((r) => r.bukuId === b.id)
              return (
                <div key={b.id} className="d-flex flex-column">
                  <div className={`position-relative d-flex rasio-3x4 align-items-center justify-content-center overflow-hidden rounded-3 p-3 text-center text-white shadow ${SAMPUL[b.kategori] ?? 'gradasi-sampul-lain'}`}>
                    <span className="position-absolute top-0 bottom-0 start-2 w-1 rounded-pill bg-white bg-opacity-30" />
                    <span className="fs-sm fw-bold lh-tight">{b.judul}</span>
                  </div>
                  <p className="mt-2 clamp-2 fs-sm fw-semibold lh-snug text-tinta">{b.judul}</p>
                  <p className="fs-xs text-tinta-3">{b.penulis}</p>
                  <p className={`mt-1 fs-xs fw-semibold ${ada > 0 ? 'text-success' : 'text-danger'}`}>{ada > 0 ? `${ada} tersedia` : 'Sedang dipinjam semua'}</p>
                  <button
                    onClick={() => pesanBuku(b)}
                    disabled={ada <= 0 || sudahPesan}
                    className="mt-2 rounded-1 bg-merah-50 py-1-5 fs-xs fw-bold text-merah-700 transisi hover-latar-merah"
                  >
                    {sudahPesan ? 'Sudah dipesan' : 'Pesan buku'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </>
  )
}
