// Semua tanggal disimpan sebagai string 'YYYY-MM-DD' (waktu lokal)
export const toKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const todayKey = () => toKey(new Date())

export const parseKey = (key) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const formatTanggal = (key, opts = {}) =>
  parseKey(key).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', ...opts })

export const formatHari = (key) => formatTanggal(key, { weekday: 'long' })

export const namaHari = (key) => parseKey(key).toLocaleDateString('id-ID', { weekday: 'long' })

export const isHariSekolah = (d) => d.getDay() !== 0 && d.getDay() !== 6

// n hari sekolah terakhir sebelum tanggal `dari` (tidak termasuk hari itu)
export function hariSekolahSebelum(n, dari = new Date()) {
  const hasil = []
  const d = new Date(dari)
  d.setHours(0, 0, 0, 0)
  while (hasil.length < n) {
    d.setDate(d.getDate() - 1)
    if (isHariSekolah(d)) hasil.push(toKey(d))
  }
  return hasil
}

// Semua hari sekolah dari `mulai` sampai `selesai` (inklusif)
export function rentangHariSekolah(mulai, selesai) {
  const hasil = []
  const d = parseKey(mulai)
  const akhir = parseKey(selesai)
  while (d <= akhir) {
    if (isHariSekolah(d)) hasil.push(toKey(d))
    d.setDate(d.getDate() + 1)
  }
  return hasil
}

export const tambahHari = (key, n) => {
  const d = parseKey(key)
  d.setDate(d.getDate() + n)
  return toKey(d)
}

// Selisih hari dari `dari` ke `ke` (positif = ke masa depan)
export const selisihHari = (dari, ke) => Math.round((parseKey(ke) - parseKey(dari)) / 86400000)

export const inisial = (nama = '') =>
  nama
    .replace(/^(Dra?|Drs|Ibu|Bpk|Bapak)\.?\s+/i, '')
    .split(/[\s,]+/)
    .filter((w) => w && w[0] === w[0].toUpperCase() && /[A-Za-z]/.test(w[0]))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

export const uid = () => Math.random().toString(36).slice(2, 10)

// Jam sekarang dalam format Indonesia, mis. '09.40'
export const jamSekarang = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`
}
