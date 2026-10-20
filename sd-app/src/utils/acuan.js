/*
  Jadwal pelajaran & kalender akademik dari server (tabel jadwal_pelajaran & kalender di Laravel).
  Banyak fungsi (presensi per pelajaran, rekap hari sekolah, kalender) dipanggil tanpa akses ke
  DataContext, jadi DataProvider menyalin data terbarunya ke sini setiap kali berubah
  (sinkronkanAcuan). Komponen tetap membaca data.jadwal/data.kalender agar ikut tergambar ulang.
*/

let jadwal = {}
let kalender = []
let hariLibur = new Map() // 'YYYY-MM-DD' → judul agenda libur

const kunciTanggal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function hitungLibur(daftar) {
  const hasil = new Map()
  for (const e of daftar) {
    if (e.jenis !== 'libur') continue
    const [y, m, d] = e.mulai.split('-').map(Number)
    const tanggal = new Date(y, m - 1, d)
    const akhir = e.selesai ?? e.mulai
    for (let i = 0; i < 400 && kunciTanggal(tanggal) <= akhir; i++) {
      const k = kunciTanggal(tanggal)
      if (!hasil.has(k)) hasil.set(k, e.judul)
      tanggal.setDate(tanggal.getDate() + 1)
    }
  }
  return hasil
}

export function sinkronkanAcuan(data) {
  if (data.jadwal && data.jadwal !== jadwal) jadwal = data.jadwal
  if (data.kalender && data.kalender !== kalender) {
    kalender = data.kalender
    hariLibur = hitungLibur(kalender)
  }
}

// { kelas: { hari: [kode mapel | null per sesi] } }
export const semuaJadwal = () => jadwal

export const jadwalKelas = (kelas) => jadwal[kelas] ?? {}

// [{ id, mulai, selesai?, judul, jenis: 'libur'|'ujian'|'kegiatan', perkiraan, keterangan }]
export const semuaAgenda = () => kalender

// Judul agenda libur pada tanggal 'YYYY-MM-DD', atau null
export const liburPada = (key) => hariLibur.get(key) ?? null
