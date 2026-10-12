import { HARI_SEKOLAH, JADWAL, MAPEL } from '../data/dummy'
import { guruPelajaran } from './jadwal'

/*
  Chat sekolah. Setiap pengguna punya ID chat:
    s:<nis> siswa · o:<nis anak> orang tua · g:<id guru> guru, staf, kepala sekolah
  Percakapan:
    grup:kelas:<kelas>  siswa kelas itu + wali kelas + guru mapel yang mengajar di kelas itu
    grup:ortu:<kelas>   orang tua siswa kelas itu + wali kelas + kepala sekolah
    grup:staf           seluruh guru & staf (termasuk kepala sekolah)
    p:<id>|<id>         chat pribadi (siswa tidak punya chat pribadi)
  Anggota grup dihitung dari data siswa, guru, dan jadwal, jadi selalu mengikuti perubahan data.
*/

export const ID_GRUP_STAF = 'grup:staf'
export const idSiswa = (nis) => `s:${nis}`
export const idOrtu = (nis) => `o:${nis}`
export const idGuru = (guruId) => `g:${guruId}`
export const idGrupKelas = (kelas) => `grup:kelas:${kelas}`
export const idGrupOrtu = (kelas) => `grup:ortu:${kelas}`
export const idPribadi = (a, b) => `p:${[a, b].sort().join('|')}`
export const pesertaPribadi = (pid) => pid.slice(2).split('|')
export const jenisId = (id) => ({ s: 'siswa', o: 'ortu', g: 'staf' })[id?.[0]] ?? null

// ID chat pengguna yang sedang login (kepala sekolah memakai data guru berjabatan Kepala Sekolah)
export function idChatDari(user, akses) {
  if (!user) return null
  if (user.role === 'siswa') return idSiswa(user.nis)
  if (user.role === 'ortu') return idOrtu(user.anakNis)
  return akses?.guruId ? idGuru(akses.guruId) : null
}

// ===== Indeks data (dihitung sekali per versi data siswa & guru) =====
const cache = new WeakMap()
function indeks(data) {
  let perGuru = cache.get(data.guru)
  if (!perGuru) cache.set(data.guru, (perGuru = new WeakMap()))
  let i = perGuru.get(data.siswa)
  if (i) return i

  const siswa = new Map(data.siswa.map((s) => [s.nis, s]))
  const guru = new Map(data.guru.map((g) => [g.id, g]))
  const kelasList = [...new Set(data.siswa.map((s) => s.kelas))].sort()
  const siswaKelas = new Map(kelasList.map((k) => [k, data.siswa.filter((s) => s.kelas === k)]))
  const guruKelas = new Map() // kelas → { wali, guru: [id] }
  const kelasGuru = new Map() // id guru → Set kelas yang diajar
  for (const kelas of kelasList) {
    const wali = data.guru.find((g) => g.peran?.includes('wali_kelas') && g.kelas === kelas) ?? null
    const ids = new Set(wali ? [wali.id] : [])
    for (const h of HARI_SEKOLAH) {
      for (const m of JADWAL[kelas]?.[h] ?? []) {
        if (MAPEL[m]?.absensi === false) continue
        const g = guruPelajaran(data.guru, kelas, m)
        if (g) ids.add(g.id)
      }
    }
    guruKelas.set(kelas, { wali, guru: [...ids] })
    for (const id of ids) (kelasGuru.get(id) ?? kelasGuru.set(id, new Set()).get(id)).add(kelas)
  }
  const kepsek = data.guru.find((g) => g.jabatan === 'Kepala Sekolah') ?? null
  const tu = data.guru.filter((g) => g.peran?.includes('tata_usaha'))
  i = { siswa, guru, kelasList, siswaKelas, guruKelas, kelasGuru, kepsek, tu, kontak: new Map() }
  perGuru.set(data.siswa, i)
  return i
}

// Nama & keterangan untuk ditampilkan
export function profil(data, id) {
  const ix = indeks(data)
  const kunci = id.slice(2)
  if (id.startsWith('s:')) {
    const s = ix.siswa.get(kunci)
    return { id, peran: 'siswa', nama: s?.nama ?? 'Siswa', sub: s ? `Siswa ${s.kelas}` : 'Siswa', label: 'Siswa' }
  }
  if (id.startsWith('o:')) {
    const s = ix.siswa.get(kunci)
    return { id, peran: 'ortu', nama: s?.ortu ?? `Orang tua ${s?.nama ?? ''}`, sub: s ? `Orang tua ${s.nama} · ${s.kelas}` : 'Orang tua', label: 'Orang tua' }
  }
  const g = ix.guru.get(kunci)
  return { id, peran: 'staf', nama: g?.nama ?? 'Guru & Staf', sub: g?.jabatan ?? 'Guru & Staf', label: g?.jabatan === 'Kepala Sekolah' ? 'Kepsek' : 'Guru' }
}

// ===== Grup =====
export function infoGrup(data, gid) {
  const ix = indeks(data)
  if (gid === ID_GRUP_STAF) {
    const anggota = data.guru.map((g) => idGuru(g.id))
    return { id: gid, tipe: 'staf', nama: 'Guru & Staf', sub: `${anggota.length} anggota`, anggota, admin: ix.kepsek ? [idGuru(ix.kepsek.id)] : [] }
  }
  const [, tipe, kelas] = gid.split(':')
  const siswa = ix.siswaKelas.get(kelas)
  if (!siswa || !['kelas', 'ortu'].includes(tipe)) return null
  const { wali, guru } = ix.guruKelas.get(kelas)
  if (tipe === 'kelas') {
    return {
      id: gid,
      tipe,
      kelas,
      nama: `Kelas ${kelas}`,
      sub: `${siswa.length} siswa · ${guru.length} guru`,
      anggota: [...guru.map(idGuru), ...siswa.map((s) => idSiswa(s.nis))],
      // Semua guru di grup boleh mengatur grup & menghapus pesan yang tidak pantas
      admin: guru.map(idGuru),
    }
  }
  // Kepala sekolah ikut di grup orang tua agar orang tua mudah berkonsultasi langsung
  const pengelola = [wali, ix.kepsek].filter(Boolean).map((g) => idGuru(g.id))
  return {
    id: gid,
    tipe,
    kelas,
    nama: `Orang Tua Kelas ${kelas}`,
    sub: `${siswa.length} orang tua${wali ? ` · wali kelas ${wali.nama.split(',')[0]}` : ''}${ix.kepsek ? ' · kepala sekolah' : ''}`,
    anggota: [...pengelola, ...siswa.map((s) => idOrtu(s.nis))],
    admin: pengelola,
  }
}

// Grup yang diikuti seseorang
export function grupMilik(data, id) {
  const ix = indeks(data)
  const kunci = id.slice(2)
  if (id.startsWith('s:')) return ix.siswa.has(kunci) ? [idGrupKelas(ix.siswa.get(kunci).kelas)] : []
  if (id.startsWith('o:')) return ix.siswa.has(kunci) ? [idGrupOrtu(ix.siswa.get(kunci).kelas)] : []
  if (!ix.guru.has(kunci)) return []
  const hasil = [ID_GRUP_STAF]
  for (const kelas of ix.kelasGuru.get(kunci) ?? []) hasil.push(idGrupKelas(kelas))
  const kepsek = ix.kepsek?.id === kunci
  for (const kelas of ix.kelasList) if (kepsek || ix.guruKelas.get(kelas).wali?.id === kunci) hasil.push(idGrupOrtu(kelas))
  return hasil
}

/*
  Kontak chat pribadi:
  - siswa: tidak ada (cukup grup kelas)
  - orang tua: wali kelas & guru anaknya, Tata Usaha, kepala sekolah
  - guru & staf: semua guru & staf, plus orang tua siswa di kelas yang diajarnya
    (Tata Usaha & kepala sekolah: semua orang tua)
*/
export function kontakPribadi(data, id) {
  const ix = indeks(data)
  if (ix.kontak.has(id)) return ix.kontak.get(id)
  const kunci = id.slice(2)
  let hasil = []
  if (id.startsWith('o:') && ix.siswa.has(kunci)) {
    const ids = new Set(ix.guruKelas.get(ix.siswa.get(kunci).kelas)?.guru ?? [])
    ix.tu.forEach((g) => ids.add(g.id))
    if (ix.kepsek) ids.add(ix.kepsek.id)
    hasil = [...ids].map(idGuru)
  } else if (id.startsWith('g:') && ix.guru.has(kunci)) {
    const staf = data.guru.filter((g) => g.id !== kunci).map((g) => idGuru(g.id))
    const semua = ix.kepsek?.id === kunci || ix.tu.some((g) => g.id === kunci)
    const kelas = semua ? ix.kelasList : [...(ix.kelasGuru.get(kunci) ?? [])].sort()
    hasil = [...staf, ...kelas.flatMap((k) => ix.siswaKelas.get(k).map((s) => idOrtu(s.nis)))]
  }
  const set = new Set(hasil)
  ix.kontak.set(id, set)
  return set
}

export const bolehPribadi = (data, a, b) => a !== b && kontakPribadi(data, a).has(b)

// Anggota sebuah percakapan
export function anggota(data, pid) {
  if (pid.startsWith('grup:')) return infoGrup(data, pid)?.anggota ?? []
  if (pid.startsWith('p:')) return pesertaPribadi(pid)
  return []
}

// Boleh membuka percakapan ini? (mencegah membuka chat orang lain lewat alamat)
export function bolehBuka(data, saya, pid) {
  if (!saya || !pid) return false
  if (pid.startsWith('grup:')) return anggota(data, pid).includes(saya)
  if (!pid.startsWith('p:')) return false
  const [a, b] = pesertaPribadi(pid)
  return (a === saya && bolehPribadi(data, a, b)) || (b === saya && bolehPribadi(data, b, a))
}

export function bolehKirim(data, pengaturan, saya, pid) {
  if (!bolehBuka(data, saya, pid)) return false
  if (pid.startsWith('grup:') && pengaturan?.[pid]?.hanyaAdmin) return infoGrup(data, pid).admin.includes(saya)
  return true
}

export const adminGrup = (data, saya, pid) => pid.startsWith('grup:') && (infoGrup(data, pid)?.admin.includes(saya) ?? false)

// ===== Berkas =====
export const MAKS_UKURAN = 25 * 1024 * 1024
export const MAKS_DURASI_SUARA = 5 * 60 // detik
export const MAKS_TEKS = 4000

const EKSTENSI = {
  foto: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  video: ['mp4', 'webm', 'mov', 'm4v', '3gp'],
  audio: ['mp3', 'm4a', 'aac', 'wav', 'ogg', 'oga', 'opus', 'flac', 'weba'],
  dokumen: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'odt', 'ods', 'odp', 'rtf'],
}
const AWALAN_MIME = { foto: 'image/', video: 'video/', audio: 'audio/' }

// Pilihan "accept" untuk input file per jenis
export const TERIMA = Object.fromEntries(Object.entries(EKSTENSI).map(([j, ext]) => [j, ext.map((e) => `.${e}`).join(',')]))

export const ekstensi = (nama) => (nama.includes('.') ? nama.split('.').pop().toLowerCase() : '')

// Jenis berkas yang diizinkan (null = ditolak). Berkas program/skrip/HTML tidak diterima.
export function jenisBerkas(file) {
  const ext = ekstensi(file.name)
  for (const [jenis, daftar] of Object.entries(EKSTENSI)) {
    if (!daftar.includes(ext)) continue
    const awalan = AWALAN_MIME[jenis]
    // Isi harus sesuai ekstensinya (mis. foto berekstensi .jpg harus bertipe image/*)
    if (awalan && file.type && !file.type.startsWith(awalan) && !(ext === 'webm' && file.type.startsWith('audio/'))) return null
    return jenis
  }
  return null
}

// Nama berkas aman untuk ditampilkan & diunduh
export const namaAman = (nama) =>
  String(nama)
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_')
    .slice(0, 120) || 'berkas'

export function formatUkuran(b) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`
  return `${(b / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}

export const formatDurasi = (detik) => `${Math.floor(detik / 60)}:${String(Math.floor(detik % 60)).padStart(2, '0')}`

// Ringkasan pesan untuk daftar percakapan & notifikasi
export function ringkas(p) {
  if (!p) return ''
  if (p.dihapus) return '🚫 Pesan dihapus'
  const l = p.lampiran
  const teks = p.teks?.trim()
  if (!l) return teks ?? ''
  const label = {
    foto: '📷 Foto',
    video: '🎬 Video',
    suara: `🎤 Pesan suara (${formatDurasi(l.durasi ?? 0)})`,
    audio: `🎵 ${l.nama}`,
    dokumen: `📄 ${l.nama}`,
  }[l.jenis]
  return teks ? `${label} · ${teks}` : label
}

// Pesan dari orang lain yang belum dibaca
export function jumlahBelum(pesan, dibacaSaya, saya) {
  const batas = dibacaSaya ?? ''
  let n = 0
  for (let i = pesan.length - 1; i >= 0 && pesan[i].waktu > batas; i--) if (pesan[i].dari !== saya && !pesan[i].dihapus) n++
  return n
}

// Chat pribadi orang tua dengan kepala sekolah (konsultasi & pengaduan), selalu tampil di atas
export function pidKepsekOrtu(data, saya) {
  const kepsek = indeks(data).kepsek
  return saya?.startsWith('o:') && kepsek ? idPribadi(saya, idGuru(kepsek.id)) : null
}

// Semua percakapan milik seseorang: grup yang diikuti + chat pribadi yang sudah berisi pesan
export function daftarPercakapan(data, state, saya) {
  if (!saya) return []
  const sematan = pidKepsekOrtu(data, saya)
  const pribadi = Object.keys(state.pesan).filter((pid) => pid.startsWith('p:') && pid !== sematan && pesertaPribadi(pid).includes(saya) && bolehBuka(data, saya, pid))
  return [...(sematan ? [sematan] : []), ...grupMilik(data, saya), ...pribadi].map((pid) => {
    const pesan = state.pesan[pid] ?? []
    const terakhir = pesan.at(-1) ?? null
    return { id: pid, grup: pid.startsWith('grup:'), sematkan: pid === sematan, terakhir, belum: jumlahBelum(pesan, state.dibaca[saya]?.[pid], saya) }
  })
}
