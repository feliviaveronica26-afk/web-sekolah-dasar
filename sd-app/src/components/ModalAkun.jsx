import { useEffect, useState } from 'react'
import { Check, Copy, KeyRound, UserPlus } from 'lucide-react'
import { Alert, Badge, Modal, btn } from './ui'

// Tombol salin dengan tanda berhasil
function TombolSalin({ teks, label }) {
  const [tersalin, setTersalin] = useState(false)
  const salin = async () => {
    try {
      await navigator.clipboard.writeText(teks)
      setTersalin(true)
      setTimeout(() => setTersalin(false), 1500)
    } catch {
      /* clipboard tidak tersedia: teks tetap bisa dipilih manual */
    }
  }
  return (
    <button type="button" onClick={salin} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label={`Salin ${label}`}>
      {tersalin ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}

// Status akun login di tabel (akun = { username, aktif, wajibGanti } dari server, atau null)
export function StatusAkun({ akun }) {
  if (!akun) return <Badge className="bg-rose-50 text-rose-700">Belum punya akun</Badge>
  return (
    <span className="block">
      <span className="block font-mono text-xs font-semibold text-slate-800">{akun.username}</span>
      {!akun.aktif ? (
        <Badge className="bg-slate-100 text-slate-500">Nonaktif</Badge>
      ) : akun.wajibGanti ? (
        <Badge className="bg-amber-50 text-amber-700">Belum ganti password awal</Badge>
      ) : (
        <Badge className="bg-emerald-50 text-emerald-700">Aktif</Badge>
      )}
    </span>
  )
}

// Tombol di kolom Aksi: buat akun (belum punya) atau atur ulang password (sudah punya)
export function TombolAkun({ akun, nama, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg p-2 text-slate-500 hover:bg-primary-50 hover:text-primary-700"
      aria-label={akun ? `Atur ulang password ${nama}` : `Buat akun login ${nama}`}
      title={akun ? 'Atur ulang password' : 'Buat akun login'}
    >
      {akun ? <KeyRound className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
    </button>
  )
}

/*
  Buat akun login atau atur ulang password-nya. `pemilik` = { id, nama, akun } (null = tertutup),
  `buat(id)` = fungsi DataContext yang menghasilkan { username, password } atau { galat }.
  Password awal hanya tampil sekali di sini; pemiliknya wajib menggantinya saat pertama login.
*/
export default function ModalAkun({ pemilik, portal, buat, onTutup }) {
  const [hasil, setHasil] = useState(null)
  const [menyimpan, setMenyimpan] = useState(false)
  const adaAkun = !!pemilik?.akun

  // Hasil (password awal) milik orang sebelumnya tidak boleh terbawa; selama animasi tutup, Modal memakai isi terakhirnya
  const id = pemilik?.id
  useEffect(() => setHasil(null), [id])

  const lanjut = async () => {
    if (menyimpan) return
    setMenyimpan(true)
    setHasil(await buat(pemilik.id))
    setMenyimpan(false)
  }

  // Sudah ditutup: Modal menampilkan isi terakhirnya selama animasi keluar
  if (!pemilik) return <Modal open={false} onClose={onTutup} />
  const berhasil = hasil && !hasil.galat
  return (
    <Modal
      open
      onClose={onTutup}
      title={berhasil ? 'Akun siap dipakai' : adaAkun ? 'Atur ulang password?' : 'Buat akun login?'}
      size="max-w-md"
      footer={
        berhasil ? (
          <button onClick={onTutup} className={btn.primary}>
            Selesai
          </button>
        ) : (
          <>
            <button onClick={onTutup} className={btn.secondary}>
              Batal
            </button>
            <button onClick={lanjut} disabled={menyimpan} className={`${btn.primary} disabled:opacity-60`}>
              <KeyRound className="h-4 w-4" /> {menyimpan ? 'Memproses…' : adaAkun ? 'Atur Ulang' : 'Buat Akun'}
            </button>
          </>
        )
      }
    >
      {hasil?.galat && (
        <div className="mb-3">
          <Alert tone="error">{hasil.galat}</Alert>
        </div>
      )}
      {berhasil ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Berikan data login ini kepada <span className="font-semibold text-slate-900">{pemilik.nama}</span>; saat pertama login, password wajib diganti dengan
            buatan sendiri.
          </p>
          <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {[
              ['Username', hasil.username],
              ['Password awal', hasil.password],
            ].map(([label, nilai]) => (
              <div key={label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="truncate font-mono text-base font-semibold text-slate-900">{nilai}</dd>
                </div>
                <TombolSalin teks={nilai} label={label.toLowerCase()} />
              </div>
            ))}
          </dl>
          <Alert tone="warning">Catat sekarang. Password awal ini tidak akan ditampilkan lagi; bila hilang, atur ulang password.</Alert>
        </div>
      ) : adaAkun ? (
        <p className="text-slate-600">
          Password akun <span className="font-mono font-semibold text-slate-900">{pemilik.akun.username}</span> milik {pemilik.nama} akan diganti dengan password awal
          yang baru. Password lama tidak berlaku lagi dan semua perangkat yang sedang login akan dikeluarkan.
        </p>
      ) : (
        <p className="text-slate-600">
          Akun login {portal} akan dibuat untuk <span className="font-semibold text-slate-900">{pemilik.nama}</span> dengan password awal acak.
        </p>
      )}
    </Modal>
  )
}
