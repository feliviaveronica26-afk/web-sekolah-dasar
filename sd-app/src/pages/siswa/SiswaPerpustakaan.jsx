import { useState } from 'react'
import { BookMarked, BookOpen, Library, Search } from 'lucide-react'
import { Alert, Badge, Card, DashHeader, EmptyState, JudulKartu, inputCls } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { formatTanggal, selisihHari, todayKey } from '../../utils/format'

// Warna sampul buku berdasarkan kategori
const SAMPUL = {
  'Cerita Rakyat': 'from-amber-300 to-orange-500',
  Pengetahuan: 'from-sky-400 to-indigo-500',
  Pelajaran: 'from-emerald-400 to-teal-600',
  'Fiksi Anak': 'from-pink-300 to-rose-500',
  Sejarah: 'from-primary-500 to-primary-700',
}

export default function SiswaPerpustakaan() {
  const { user } = useAuth()
  const { data, tambah, hapus } = useData()
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

  const pesanBuku = (b) => {
    if (reservasiku.length >= 1) return setPesan('Kamu hanya bisa memesan 1 buku dalam satu waktu.')
    if (pinjamanku.length >= 2) return setPesan('Kamu sedang meminjam 2 buku. Kembalikan dulu sebelum memesan lagi.')
    tambah('reservasi', { nis: user.nis, bukuId: b.id, tanggal: hariIni, status: 'Menunggu' })
    setPesan(`Buku "${b.judul}" sudah dipesan. Ambil di perpustakaan saat istirahat ya! 📚`)
  }

  return (
    <>
      <DashHeader title="Perpustakaan" desc="Lihat buku yang kamu pinjam dan pesan buku baru untuk diambil di perpustakaan." />

      {pesan && (
        <div className="mb-5">
          <Alert tone={pesan.startsWith('Buku') ? 'success' : 'warning'}>{pesan}</Alert>
        </div>
      )}

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <JudulKartu icon={BookOpen} judul={`Sedang kupinjam (${pinjamanku.length}/2)`} />
          {pinjamanku.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Belum ada buku yang dipinjam.</p>
          ) : (
            <ul className="space-y-3">
              {pinjamanku.map((p) => {
                const b = buku(p.bukuId)
                const sisa = selisihHari(hariIni, p.tenggat)
                return (
                  <li key={p.id} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3">
                    <span className={`grid h-16 w-12 shrink-0 place-items-center rounded-lg bg-linear-to-br text-white shadow ${SAMPUL[b?.kategori] ?? 'from-slate-400 to-slate-600'}`}>
                      <BookOpen className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">{b?.judul}</p>
                      <p className="text-xs text-slate-500">Kembalikan {formatTanggal(p.tenggat)}</p>
                    </div>
                    <Badge className={sisa < 0 ? 'bg-rose-100 text-rose-700' : sisa <= 2 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'}>
                      {sisa < 0 ? `Terlambat ${-sisa} hari` : sisa === 0 ? 'Hari ini' : `${sisa} hari lagi`}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <JudulKartu icon={BookMarked} judul="Pesanan & riwayat" />
          {reservasiku.map((r) => (
            <div key={r.id} className="mb-3 flex items-center justify-between gap-3 rounded-2xl bg-sky-50 p-3">
              <div>
                <p className="text-xs font-semibold text-sky-700">Menunggu diambil</p>
                <p className="font-bold text-slate-900">{buku(r.bukuId)?.judul}</p>
              </div>
              <button onClick={() => hapus('reservasi', r.id)} className="text-xs font-semibold text-rose-600 hover:underline">
                Batalkan
              </button>
            </div>
          ))}
          {riwayat.length === 0 && reservasiku.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Belum ada riwayat peminjaman.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {riwayat.map((p) => (
                <li key={p.id} className="flex justify-between gap-3 py-2.5 text-sm">
                  <span className="font-semibold text-slate-700">{buku(p.bukuId)?.judul}</span>
                  <span className="text-slate-500">Dikembalikan {formatTanggal(p.tanggalKembali, { year: undefined })}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <JudulKartu icon={Library} judul="Katalog buku" />
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari judul atau penulis..." className={`${inputCls} pl-10`} />
          </div>
          <select value={kategori} onChange={(e) => setKategori(e.target.value)} className={`${inputCls} sm:w-52`}>
            {daftarKategori.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </div>
        {katalog.length === 0 ? (
          <EmptyState icon={Library} title="Buku tidak ditemukan" desc="Coba kata kunci lain." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {katalog.map((b) => {
              const ada = tersedia(b)
              const sudahPesan = reservasiku.some((r) => r.bukuId === b.id)
              return (
                <div key={b.id} className="flex flex-col">
                  <div className={`relative grid aspect-[3/4] place-items-center overflow-hidden rounded-2xl bg-linear-to-br p-3 text-center text-white shadow-md ${SAMPUL[b.kategori] ?? 'from-slate-400 to-slate-600'}`}>
                    <span className="absolute inset-y-0 left-2 w-1 rounded-full bg-white/30" />
                    <span className="font-display text-sm font-bold leading-tight">{b.judul}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-slate-800">{b.judul}</p>
                  <p className="text-xs text-slate-500">{b.penulis}</p>
                  <p className={`mt-1 text-xs font-semibold ${ada > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{ada > 0 ? `${ada} tersedia` : 'Sedang dipinjam semua'}</p>
                  <button
                    onClick={() => pesanBuku(b)}
                    disabled={ada <= 0 || sudahPesan}
                    className="mt-2 rounded-lg bg-primary-50 py-1.5 text-xs font-bold text-primary-700 transition hover:bg-primary-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
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
