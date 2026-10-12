/*
  Berkas chat (foto, video, suara, dokumen) disimpan di IndexedDB, terpisah dari data utama di
  localStorage, dan baru dibaca saat pesannya ditampilkan. Jadi data aplikasi tetap kecil & cepat.
  Saat backend siap, simpanBerkas/ambilBerkas cukup diganti dengan unggah/unduh ke server.
*/

const NAMA_DB = 'sdhg-chat-berkas'
const STORE = 'berkas'
let dbJanji = null

function bukaDb() {
  dbJanji ??= new Promise((ok, gagal) => {
    const r = indexedDB.open(NAMA_DB, 1)
    r.onupgradeneeded = () => r.result.createObjectStore(STORE)
    r.onsuccess = () => ok(r.result)
    r.onerror = () => gagal(r.error)
  })
  return dbJanji
}

async function transaksi(mode, kerja) {
  const db = await bukaDb()
  return new Promise((ok, gagal) => {
    const tx = db.transaction(STORE, mode)
    const permintaan = kerja(tx.objectStore(STORE))
    tx.oncomplete = () => ok(permintaan?.result)
    tx.onerror = () => gagal(tx.error)
    tx.onabort = () => gagal(tx.error)
  })
}

export const simpanBerkas = (id, blob) => transaksi('readwrite', (s) => s.put(blob, id))
export const ambilBerkas = (id) => transaksi('readonly', (s) => s.get(id))

const cacheUrl = new Map()

export async function hapusBerkas(id) {
  lepasUrl(id)
  await transaksi('readwrite', (s) => s.delete(id))
}

export async function hapusSemuaBerkas() {
  cacheUrl.forEach((url) => URL.revokeObjectURL(url))
  cacheUrl.clear()
  await transaksi('readwrite', (s) => s.clear())
}

// URL sementara untuk menampilkan berkas; dibuat sekali lalu dipakai ulang selama halaman terbuka
export async function urlBerkas(id) {
  if (cacheUrl.has(id)) return cacheUrl.get(id)
  const blob = await ambilBerkas(id)
  if (!blob) return null
  const url = URL.createObjectURL(blob)
  cacheUrl.set(id, url)
  return url
}

export function lepasUrl(id) {
  if (!cacheUrl.has(id)) return
  URL.revokeObjectURL(cacheUrl.get(id))
  cacheUrl.delete(id)
}

// Perkecil foto sebelum dikirim (sisi terpanjang maks. 1600 px). GIF dibiarkan agar animasinya tetap.
export async function perkecilFoto(file, sisiMaks = 1600, kualitas = 0.82) {
  if (file.type === 'image/gif') return file
  try {
    const gambar = await createImageBitmap(file)
    const skala = Math.min(1, sisiMaks / Math.max(gambar.width, gambar.height))
    if (skala === 1 && file.size < 400 * 1024) return file
    const kanvas = document.createElement('canvas')
    kanvas.width = Math.round(gambar.width * skala)
    kanvas.height = Math.round(gambar.height * skala)
    kanvas.getContext('2d').drawImage(gambar, 0, 0, kanvas.width, kanvas.height)
    gambar.close?.()
    // PNG bisa transparan, jadi memakai WebP; selain itu JPEG
    const tipe = file.type === 'image/png' ? 'image/webp' : 'image/jpeg'
    const hasil = await new Promise((ok) => kanvas.toBlob(ok, tipe, kualitas))
    return hasil && hasil.size < file.size ? hasil : file
  } catch {
    return file
  }
}
