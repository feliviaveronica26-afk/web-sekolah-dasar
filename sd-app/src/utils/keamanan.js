/*
  Lapisan keamanan sisi browser. Ini menahan serangan ringan (menebak password, sesi palsu,
  spam formulir, CSV berbahaya), tetapi perlindungan sesungguhnya tetap harus ada di backend
  (Laravel) saat data sudah disimpan di server: batas percobaan login, sesi, dan validasi input.
*/

const enc = new TextEncoder()
const keHex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
const dariHex = (hex) => new Uint8Array((hex.match(/../g) ?? []).map((h) => parseInt(h, 16)))

// ===== SHA-256 (sinkron, agar sesi bisa diperiksa sebelum halaman pertama tampil) =====
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
])
const putar = (x, n) => (x >>> n) | (x << (32 - n))

const H_AWAL = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]

// Satu putaran kompresi SHA-256: W[0..15] berisi satu blok 64 byte, H diperbarui di tempat
function kompres(H, W) {
  for (let i = 16; i < 64; i++) {
    const s0 = putar(W[i - 15], 7) ^ putar(W[i - 15], 18) ^ (W[i - 15] >>> 3)
    const s1 = putar(W[i - 2], 17) ^ putar(W[i - 2], 19) ^ (W[i - 2] >>> 10)
    W[i] = W[i - 16] + s0 + W[i - 7] + s1
  }
  let [a, b, c, d, e, f, g, h] = H
  for (let i = 0; i < 64; i++) {
    const t1 = (h + (putar(e, 6) ^ putar(e, 11) ^ putar(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0
    const t2 = ((putar(a, 2) ^ putar(a, 13) ^ putar(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0
    h = g
    g = f
    f = e
    e = (d + t1) | 0
    d = c
    c = b
    b = a
    a = (t1 + t2) | 0
  }
  H[0] += a
  H[1] += b
  H[2] += c
  H[3] += d
  H[4] += e
  H[5] += f
  H[6] += g
  H[7] += h
}

const keBytes = (H) => {
  const hasil = new Uint8Array(32)
  const dh = new DataView(hasil.buffer)
  H.forEach((v, i) => dh.setUint32(i * 4, v))
  return hasil
}

function sha256Bytes(data) {
  const panjang = data.length
  const ukuran = ((panjang + 9 + 63) >> 6) << 6
  const buf = new Uint8Array(ukuran)
  buf.set(data)
  buf[panjang] = 0x80
  const dv = new DataView(buf.buffer)
  dv.setUint32(ukuran - 8, Math.floor(panjang / 0x20000000))
  dv.setUint32(ukuran - 4, panjang * 8)
  const H = new Uint32Array(H_AWAL)
  const W = new Uint32Array(64)
  for (let o = 0; o < ukuran; o += 64) {
    for (let i = 0; i < 16; i++) W[i] = dv.getUint32(o + i * 4)
    kompres(H, W)
  }
  return keBytes(H)
}

export const sha256Hex = (teks) => keHex(sha256Bytes(enc.encode(teks)))

/*
  PBKDF2-HMAC-SHA256 tanpa WebCrypto, untuk koneksi non-HTTPS (mis. dibuka lewat IP di jaringan lokal).
  Keadaan SHA-256 setelah blok ipad/opad dihitung sekali, jadi setiap iterasi cukup dua kompresi.
*/
function pbkdf2Js(password, garam, iterasi) {
  let kunci = enc.encode(password)
  if (kunci.length > 64) kunci = sha256Bytes(kunci)
  const W = new Uint32Array(64)
  const keadaanSetelah = (pad) => {
    const H = new Uint32Array(H_AWAL)
    for (let i = 0; i < 16; i++) {
      W[i] = 0
      for (let j = 0; j < 4; j++) W[i] = (W[i] << 8) | ((kunci[i * 4 + j] ?? 0) ^ pad)
    }
    kompres(H, W)
    return H
  }
  const dalam = keadaanSetelah(0x36)
  const luar = keadaanSetelah(0x5c)

  // HMAC untuk pesan 32 byte (8 kata): satu blok dalam + satu blok luar
  const H1 = new Uint32Array(8)
  const H2 = new Uint32Array(8)
  const hmac32 = (kata) => {
    H1.set(dalam)
    W.fill(0)
    W.set(kata)
    W[8] = 0x80000000
    W[15] = (64 + 32) * 8
    kompres(H1, W)
    H2.set(luar)
    W.fill(0)
    W.set(H1)
    W[8] = 0x80000000
    W[15] = (64 + 32) * 8
    kompres(H2, W)
    return H2
  }

  // Iterasi pertama: HMAC(garam || 00000001) dengan panjang pesan bebas
  const awal = new Uint8Array(64 + garam.length + 4)
  for (let i = 0; i < 64; i++) awal[i] = (kunci[i] ?? 0) ^ 0x36
  awal.set(garam, 64)
  awal[awal.length - 1] = 1
  const luarAwal = new Uint8Array(96)
  for (let i = 0; i < 64; i++) luarAwal[i] = (kunci[i] ?? 0) ^ 0x5c
  luarAwal.set(sha256Bytes(awal), 64)
  const u1 = new DataView(sha256Bytes(luarAwal).buffer)

  const u = new Uint32Array(8)
  for (let i = 0; i < 8; i++) u[i] = u1.getUint32(i * 4)
  const t = u.slice()
  for (let n = 1; n < iterasi; n++) {
    u.set(hmac32(u))
    for (let i = 0; i < 8; i++) t[i] ^= u[i]
  }
  return keBytes(t)
}

async function pbkdf2(password, garam, iterasi) {
  if (globalThis.crypto?.subtle) {
    const kunci = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
    return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: garam, iterations: iterasi }, kunci, 256))
  }
  return pbkdf2Js(password, garam, iterasi)
}

/*
  Password akun sungguhan TIDAK disimpan di kode. Yang disimpan (VITE_HASH_* di .env.local):
    pbkdf2-sha256:<iterasi>:<garam hex>:<pemeriksa hex>
  - token     = PBKDF2(password, garam, iterasi) → disimpan di sesi browser setelah login
  - pemeriksa = SHA-256(token)                    → boleh terbaca orang, tidak bisa dibalik
  Sesi yang dibuat manual tanpa password tidak punya token yang cocok, jadi ditolak.
  Buat nilainya dengan: npm run hash-password
*/
export function bacaHash(teks) {
  const [jenis, iterasi, garam, pemeriksa] = String(teks ?? '').trim().split(':')
  if (jenis !== 'pbkdf2-sha256' || !/^[0-9a-f]{32,}$/.test(garam ?? '') || !/^[0-9a-f]{64}$/.test(pemeriksa ?? '')) return null
  return { iterasi: Number(iterasi), garam, pemeriksa }
}

export async function buatTokenSesi(password, hash) {
  return keHex(await pbkdf2(password, dariHex(hash.garam), hash.iterasi))
}

export const tokenSesiSah = (token, hash) => typeof token === 'string' && /^[0-9a-f]{64}$/.test(token) && sha256Hex(token) === hash.pemeriksa

// ===== Batas percobaan login (per browser) =====
const KUNCI_GAGAL = 'sdhg-login-gagal'
export const MAKS_GAGAL_LOGIN = 5

const bacaGagal = () => {
  try {
    return JSON.parse(localStorage.getItem(KUNCI_GAGAL)) ?? { gagal: 0, kunci: 0, sampai: 0 }
  } catch {
    return { gagal: 0, kunci: 0, sampai: 0 }
  }
}
const simpanGagal = (s) => {
  try {
    localStorage.setItem(KUNCI_GAGAL, JSON.stringify(s))
  } catch {
    /* penyimpanan penuh/diblokir: abaikan */
  }
}

// Sisa detik penguncian login (0 = boleh mencoba)
export const sisaKunciLogin = (sekarang = Date.now()) => Math.max(0, Math.ceil((bacaGagal().sampai - sekarang) / 1000))

// Setelah 5 kali salah, login dikunci 1 menit; setiap terkunci lagi lamanya berlipat (maks. 30 menit)
export function catatGagalLogin() {
  const s = bacaGagal()
  s.gagal += 1
  if (s.gagal >= MAKS_GAGAL_LOGIN) {
    s.kunci += 1
    s.sampai = Date.now() + Math.min(30, 2 ** (s.kunci - 1)) * 60000
    s.gagal = 0
  }
  simpanGagal(s)
  return { sisa: MAKS_GAGAL_LOGIN - s.gagal, terkunci: sisaKunciLogin() }
}

export const resetGagalLogin = () => {
  try {
    localStorage.removeItem(KUNCI_GAGAL)
  } catch {
    /* abaikan */
  }
}

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

// Kode acak dari generator kriptografis, tanpa huruf yang mirip (0/O, 1/I/L)
const HURUF_KODE = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export function kodeAcak(panjang = 6) {
  const angka = new Uint32Array(panjang)
  crypto.getRandomValues(angka)
  return [...angka].map((n) => HURUF_KODE[n % HURUF_KODE.length]).join('')
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
