/*
  Lapisan keamanan sisi browser: batas waktu sesi, anti-spam formulir publik, kode acak, dan CSV
  yang aman dibuka di Excel. Pemeriksaan password, batas percobaan login, dan sesi login kini
  dilakukan backend Laravel (lihat src/utils/api.js dan src/context/AuthContext.jsx).
*/

// ===== Sesi =====
export const BATAS_DIAM_MENIT = 30 // keluar otomatis jika tidak ada aktivitas
export const BATAS_SESI_JAM = 12 // sesi maksimal sejak login

// ===== Formulir publik (anti-spam) =====
// Maksimal `maks` pengiriman per `menit` menit dari browser ini. Hasil: sisa menit tunggu (0 = boleh)
export function tungguKirim(nama, maks = 3, menit = 10) {
  try {
    const batas = Date.now() - menit * 60000
    const riwayat = (JSON.parse(localStorage.getItem(`sdhg-kirim-${nama}`)) ?? []).filter((t) => t > batas)
    return riwayat.length < maks ? 0 : Math.max(1, Math.ceil((riwayat[0] + menit * 60000 - Date.now()) / 60000))
  } catch {
    return 0
  }
}

export function catatKirim(nama, menit = 10) {
  try {
    const batas = Date.now() - menit * 60000
    const riwayat = (JSON.parse(localStorage.getItem(`sdhg-kirim-${nama}`)) ?? []).filter((t) => t > batas)
    localStorage.setItem(`sdhg-kirim-${nama}`, JSON.stringify([...riwayat, Date.now()]))
  } catch {
    /* abaikan */
  }
}

// ===== CSV =====
// Setiap sel diberi tanda kutip; teks yang diawali = + - @ diberi tanda petik agar tidak
// dijalankan sebagai rumus oleh Excel (serangan "CSV injection")
export function selCsv(nilai) {
  let s = String(nilai ?? '')
  if (typeof nilai !== 'number' && /^[=+\-@\t\r]/.test(s) && !/^-?\d+([.,]\d+)?$/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

export function unduhFileCsv(namaFile, baris) {
  const csv = baris.map((r) => r.map(selCsv).join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = namaFile
  a.click()
  URL.revokeObjectURL(url)
}
