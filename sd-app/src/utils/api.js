/*
  Penghubung ke backend Laravel (folder ../laravel) yang menyimpan data di MySQL. Website memanggil
  /api/..., lalu proxy di vite.config.js meneruskannya ke Laravel, jadi HP dan laptop lain di
  jaringan yang sama cukup membuka alamat website ini.

  Login memakai sesi Laravel: cookie sesi bersifat HttpOnly (tidak bisa dibaca JavaScript), dan
  setiap permintaan yang mengubah data membawa token CSRF dari cookie XSRF-TOKEN.
*/

import { lacak } from './muat'

// Dikirim saat server menyatakan sesi sudah tidak berlaku; AuthContext lalu mengeluarkan pengguna
export const SESI_BERAKHIR = 'sdhg-sesi-berakhir'

const TIDAK_TERHUBUNG = 'Server data tidak bisa dihubungi. Pastikan server Laravel sedang berjalan, lalu coba lagi.'

export class GalatApi extends Error {
  constructor(pesan, status, isi = null) {
    super(pesan)
    this.status = status
    this.isi = isi
  }
}

const bacaCookie = (nama) => {
  const cocok = document.cookie.match(new RegExp(`(?:^|; )${nama}=([^;]*)`))
  return cocok ? decodeURIComponent(cocok[1]) : ''
}

// Pesan galat dari Laravel yang aman ditampilkan ke pengguna
function pesanGalat(status, isi) {
  if (status === 422) return Object.values(isi?.errors ?? {})[0]?.[0] ?? isi?.message ?? 'Isian belum benar.'
  if (status === 401) return isi?.message ?? 'Silakan masuk terlebih dahulu.'
  if (status === 403) return isi?.message ?? 'Akun Anda tidak berhak mengubah data ini.'
  // Pesan 404 bawaan Laravel berbahasa Inggris; pesan dari aplikasi (bahasa Indonesia) diteruskan
  if (status === 404) return isi?.message && !/^(No query results|Not Found|The route)/i.test(isi.message) ? isi.message : 'Data tidak ditemukan. Mungkin sudah dihapus dari perangkat lain.'
  if (status === 413) return 'Berkas terlalu besar untuk server.'
  if (status === 419) return 'Halaman sudah terlalu lama dibuka. Muat ulang halaman lalu coba lagi.'
  if (status === 429) return isi?.message ?? 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.'
  return `Terjadi galat di server (${status}). Coba lagi sebentar lagi.`
}

// Isian biasa dikirim sebagai JSON; FormData (unggah berkas chat) dikirim apa adanya dengan waktu tunggu lebih lama
const kirim = (path, method, body) => {
  const berkas = body instanceof FormData
  return fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      ...(body && !berkas && { 'Content-Type': 'application/json' }),
      ...(method !== 'GET' && { 'X-XSRF-TOKEN': bacaCookie('XSRF-TOKEN') }),
    },
    body: berkas ? body : body && JSON.stringify(body),
    signal: AbortSignal.timeout(berkas ? 180000 : 20000),
  })
}

/*
  `latar: true` untuk pemeriksaan berkala di latar belakang: tidak memunculkan bilah muat.
  Permintaan lain ikut dihitung, sehingga bilah muat berlogo tampil bila jaringan lambat.
*/
export function api(path, { method = 'GET', body, latar = false } = {}) {
  const janji = minta(path, method, body)
  return latar ? janji : lacak(janji)
}

async function minta(path, method, body) {
  const mulai = Date.now()
  let res
  try {
    // Token CSRF dikirim Laravel lewat cookie pada jawaban apa pun; ambil dulu bila belum ada
    if (method !== 'GET' && !bacaCookie('XSRF-TOKEN')) await kirim('/saya', 'GET')
    res = await kirim(path, method, body)
    // 419 = token CSRF kedaluwarsa (mis. sesi berganti di tab lain): ambil token baru, ulangi sekali
    if (res.status === 419) {
      await kirim('/saya', 'GET')
      res = await kirim(path, method, body)
    }
  } catch {
    throw new GalatApi(TIDAK_TERHUBUNG, 0)
  }
  if (res.status === 204) return null
  // Bukan JSON: Laravel mati (proxy membalas 500 kosong) atau website dibuka tanpa backend
  const isi = await res.json().catch(() => undefined)
  if (isi === undefined) throw new GalatApi(TIDAK_TERHUBUNG, res.status)
  // `mulai`: jawaban 401 untuk permintaan yang dikirim sebelum login terakhir tidak berlaku untuk sesi baru
  if (res.status === 401 && path !== '/masuk') window.dispatchEvent(new CustomEvent(SESI_BERAKHIR, { detail: { mulai } }))
  if (!res.ok) throw new GalatApi(pesanGalat(res.status, isi), res.status, isi)
  return isi
}
