// Presensi siswa dengan kode OTP. Guru membuka sesi untuk satu kelas, siswa memasukkan
// kode 6 digit di portalnya selama sesi masih berlaku.
// Catatan: di versi frontend ini kode tersimpan di browser. Saat backend siap, pembuatan
// dan pemeriksaan kode WAJIB dipindah ke server agar kode tidak bisa dibaca siswa.

export const MASA_BERLAKU_MENIT = 15
export const MAKS_PERCOBAAN = 5 // salah kode lebih dari ini → siswa dikunci pada sesi tersebut
export const PANJANG_KODE = 6

// Kode acak dari generator kriptografis browser (bukan Math.random)
export function buatKodeOtp() {
  const angka = new Uint32Array(1)
  crypto.getRandomValues(angka)
  return String(angka[0] % 10 ** PANJANG_KODE).padStart(PANJANG_KODE, '0')
}

export const sisaDetik = (sesi, sekarang = Date.now()) => Math.max(0, Math.round((Date.parse(sesi.berakhir) - sekarang) / 1000))

export const sesiBerlaku = (sesi, sekarang = Date.now()) => !sesi.ditutup && Date.parse(sesi.berakhir) > sekarang

// Sesi terbaru suatu kelas pada tanggal tertentu (aktif maupun sudah berakhir)
export const sesiTerakhir = (data, kelas, tanggal) =>
  data.sesiPresensi.filter((s) => s.kelas === kelas && s.tanggal === tanggal).sort((a, b) => b.mulai.localeCompare(a.mulai))[0] ?? null

export const sesiAktifKelas = (data, kelas, tanggal, sekarang = Date.now()) => {
  const s = sesiTerakhir(data, kelas, tanggal)
  return s && sesiBerlaku(s, sekarang) ? s : null
}

export const formatSisa = (detik) => `${String(Math.floor(detik / 60)).padStart(2, '0')}:${String(detik % 60).padStart(2, '0')}`

export const jamDari = (iso) => {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`
}
