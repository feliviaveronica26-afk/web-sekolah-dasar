/*
  Berkas chat (foto, video, suara, dokumen) tersimpan di server Laravel (storage/app/private/chat) dan
  hanya bisa dibuka anggota percakapannya. Alamatnya memakai cookie login yang sama dengan website.
*/

export const urlBerkas = (id) => `/api/chat/berkas/${encodeURIComponent(id)}`

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
