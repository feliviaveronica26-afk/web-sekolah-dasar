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
    <button type="button" onClick={salin} className="rounded-1 p-2 text-tinta-3 hover-latar-abu hover-teks-tinta" aria-label={`Salin ${label}`}>
      {tersalin ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}

// Status akun login di tabel (akun = { username, aktif, wajibGanti } dari server, atau null)
export function StatusAkun({ akun }) {
  if (!akun) return <Badge className="bg-danger-subtle text-danger">Belum punya akun</Badge>
  return (
    <span className="d-block">
      <span className="d-block font-monospace fs-xs fw-semibold text-tinta">{akun.username}</span>
      {!akun.aktif ? (
        <Badge className="bg-abu-100 text-tinta-3">Nonaktif</Badge>
      ) : akun.wajibGanti ? (
        <Badge className="bg-warning-subtle text-warning-emphasis">Belum ganti password awal</Badge>
      ) : (
        <Badge className="bg-success-subtle text-success">Aktif</Badge>
      )}
    </span>
  )
}

// Tombol di kolom Aksi: buat akun (belum punya) atau atur ulang password (sudah punya)
export function TombolAkun({ akun, nama, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-1 p-2 text-tinta-3 hover-latar-merah hover-teks-merah"
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
            <button onClick={lanjut} disabled={menyimpan} className={`${btn.primary} `}>
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
        <div className="antara-y-4">
          <p className="fs-sm text-tinta-2">
            Berikan data login ini kepada <span className="fw-semibold text-tinta">{pemilik.nama}</span>; saat pertama login, password wajib diganti dengan
            buatan sendiri.
          </p>
          <dl className="pembatas-y pembatas-abu rounded-2 border border-abu-200">
            {[
              ['Username', hasil.username],
              ['Password awal', hasil.password],
            ].map(([label, nilai]) => (
              <div key={label} className="d-flex align-items-center justify-content-between gap-3 px-4 py-2-5">
                <div className="min-w-0">
                  <dt className="fs-xs text-tinta-3">{label}</dt>
                  <dd className="text-truncate font-monospace fs-base fw-semibold text-tinta">{nilai}</dd>
                </div>
                <TombolSalin teks={nilai} label={label.toLowerCase()} />
              </div>
            ))}
          </dl>
          <Alert tone="warning">Catat sekarang. Password awal ini tidak akan ditampilkan lagi; bila hilang, atur ulang password.</Alert>
        </div>
      ) : adaAkun ? (
        <p className="text-tinta-2">
          Password akun <span className="font-monospace fw-semibold text-tinta">{pemilik.akun.username}</span> milik {pemilik.nama} akan diganti dengan password awal
          yang baru. Password lama tidak berlaku lagi dan semua perangkat yang sedang login akan dikeluarkan.
        </p>
      ) : (
        <p className="text-tinta-2">
          Akun login {portal} akan dibuat untuk <span className="fw-semibold text-tinta">{pemilik.nama}</span> dengan password awal acak.
        </p>
      )}
    </Modal>
  )
}
