import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from './AuthContext'
import { jamSekarang, todayKey } from '../utils/format'
import { pelajaranHari } from '../utils/jadwal'
import { api, unduhBerkas } from '../utils/api'

const DataContext = createContext(null)

/*
  Data sekolah tersimpan di MySQL lewat Laravel (folder ../laravel). Website memuat data yang boleh dilihat
  pengguna dari GET /api/data, lalu menanyakan /api/versi secara berkala dan hanya memuat ulang koleksi
  yang berubah (mis. siswa mengisi kode presensi dari HP lain). Setiap perubahan dikirim ke server;
  jawabannya (potongan data terbaru) digabung ke state dengan terapkan().

  Bentuk state sama dengan versi lama yang memakai localStorage, jadi halaman cukup membaca `data`.
*/

// State sebelum data dari server tiba
export const DATA_KOSONG = {
  guru: [],
  siswa: [],
  jumlahSiswa: {}, // { kelas: { L, P } }
  orangTua: [], // data keluarga yang boleh dilihat: [{ id, namaAyah, namaIbu, whatsapp, alamat, anak: [nis], akun? }]
  pengumuman: [],
  absensi: {}, // { 'YYYY-MM-DD': { nis: 'H'|'S'|'I'|'A' } }
  jejakAbsensi: {}, // { 'YYYY-MM-DD': { nis: { cara: 'otp'|'guru'|'izin', jam, oleh?, sebelum?, otp?, sesiId? } } }
  absensiMapel: {}, // { 'YYYY-MM-DD': { nis: { kunci: status } } } (lihat src/utils/jadwal.js)
  jejakMapel: {},
  sesiPresensi: [],
  izin: [],
  presensiStaf: {}, // { 'YYYY-MM-DD': { guruId: { status, masuk, pulang, ... } } }
  izinStaf: [],
  tugas: [],
  tugasSelesai: {}, // { nis: [id tugas] }
  nilai: {}, // { nis: { mapel: { tugas: [], pts, pas } } }
  peringkat: {}, // portal siswa/orang tua: { nis: { posisi, dari } }, dihitung server
  catatanWali: {}, // { nis: teks }
  sikap: [],
  ekskul: {}, // { nis: [id ekskul pilihan] }
  spp: {}, // { nis: { 'YYYY-MM': { tanggal, metode, noTransaksi, jumlah } } }
  transaksi: [],
  buku: [],
  peminjaman: [],
  reservasi: [],
  pendaftar: [],
  kunjungan: [],
  bukuTamu: [],
  inventaris: [],
  kerusakan: [],
  konseling: [],
}

// Koleksi berbentuk peta: jumlah tingkat kunci sampai satu catatan (untuk menggabungkan potongan data)
const KEDALAMAN = { absensi: 2, jejakAbsensi: 2, absensiMapel: 3, jejakMapel: 3, presensiStaf: 2, nilai: 2, peringkat: 1, catatanWali: 1, ekskul: 1, tugasSelesai: 1, spp: 2 }

function gabungPeta(lama, baru, kedalaman) {
  const hasil = { ...lama }
  for (const [k, v] of Object.entries(baru)) {
    if (kedalaman > 1) hasil[k] = gabungPeta(hasil[k] ?? {}, v, kedalaman - 1)
    else if (v === null) delete hasil[k]
    else hasil[k] = v
  }
  return hasil
}

// Gabungkan jawaban server { data, hapus } ke state. Daftar: catatan diganti per id, yang baru di depan.
export function terapkan(d, { data = {}, hapus = {} }) {
  const baru = { ...d }
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v) && Array.isArray(baru[k])) {
      const perId = new Map(v.map((x) => [x.id, x]))
      const ada = new Set(baru[k].map((x) => x.id))
      baru[k] = [...v.filter((x) => !ada.has(x.id)), ...baru[k].map((x) => perId.get(x.id) ?? x)]
    } else if (KEDALAMAN[k]) baru[k] = gabungPeta(baru[k], v, KEDALAMAN[k])
    else baru[k] = v
  }
  for (const [k, ids] of Object.entries(hapus)) {
    if (Array.isArray(baru[k])) baru[k] = baru[k].filter((x) => !ids.includes(x.id))
  }
  return baru
}

// Alamat API tiap koleksi untuk tambah/ubah/hapus umum (formulir CrudPage, buku tamu)
const ALAMAT = { bukuTamu: 'buku-tamu', orangTua: 'orang-tua' }
const alamat = (koleksi) => `/${ALAMAT[koleksi] ?? koleksi}`

// Kolom guru yang dikirim ke server (formulir bisa membawa kolom lain, mis. id dan status akun)
const KOLOM_GURU = [
  'nama', 'nip', 'jabatan', 'mapel', 'peran', 'kelas', 'mapelDiampu', 'jk', 'tempatLahir', 'tanggalLahir', 'agama',
  'alamat', 'whatsapp', 'email', 'pendidikan', 'statusPegawai', 'mulaiTugas',
]
const isianGuru = (g) => Object.fromEntries(KOLOM_GURU.filter((k) => g[k] !== undefined).map((k) => [k, g[k] === '' && /^(tanggal|mulai)/.test(k) ? null : g[k]]))

const JEDA_PERIKSA = 15000 // ms; halaman yang butuh cepat (presensi, chat) memakai useSegarCepat()
const JEDA_CEPAT = 3000
const JEDA_FOKUS = 10000 // kembali ke tab setelah selama ini: muat ulang semua data

// Data lama dari versi website sebelumnya (tersimpan di browser) tidak dipakai lagi
function bersihkanDataLama() {
  try {
    for (const k of ['sdhg-data-v2', 'sdhg-data-v3', 'sdhg-chat-v1']) localStorage.removeItem(k)
    indexedDB?.deleteDatabase('sdhg-chat-berkas')
  } catch {
    /* penyimpanan browser tidak tersedia */
  }
}

/*
  `awal`: data siap pakai tanpa memuat dari server (dipakai uji render). Mutasi mengembalikan
  Promise berisi pesan galat (atau null jika berhasil); galat juga tampil sebagai pemberitahuan,
  kecuali dipanggil dengan { diam: true } karena halamannya menampilkan galat sendiri.
*/
export function DataProvider({ children, awal }) {
  const { user } = useAuth()
  const [data, setData] = useState(() => awal ?? DATA_KOSONG)
  const [status, setStatus] = useState(awal ? 'siap' : 'memuat') // 'memuat' | 'siap' | 'terputus'
  // Hasil hubungan terakhir ke server; data yang sudah dimuat tetap tampil walau server sempat mati
  const [terhubung, setTerhubung] = useState(true)
  const [batasBerkas, setBatasBerkas] = useState(null)
  const [versiChat, setVersiChat] = useState('')
  const [pemberitahuan, setPemberitahuan] = useState(null)
  const [cepat, setCepat] = useState(0)
  const akun = user ? `${user.role}:${user.username}` : ''
  // Pemilik data yang sedang dipegang: halaman portal baru ditampilkan jika sama dengan akun yang login
  const [pemilik, setPemilik] = useState(awal ? akun : null)
  const pemilikRef = useRef(pemilik)
  const versi = useRef({})
  const generasi = useRef(0) // naik setiap pengguna berganti; jawaban untuk pengguna lama dibuang
  const terakhirLengkap = useRef(0) // waktu pemuatan semua data terakhir

  // Muat semua data (untukAkun diisi) atau sebagian kelompok saja. `latar`: pemuatan ulang di latar belakang.
  const muat = useCallback(async (kelompok, untukAkun, latar = false) => {
    const gen = generasi.current
    try {
      const hasil = await api(`/data${kelompok ? `?koleksi=${kelompok.join(',')}` : ''}`, { latar })
      if (gen !== generasi.current) return
      setData((d) => ({ ...(kelompok ? d : DATA_KOSONG), ...hasil.data }))
      versi.current = kelompok ? { ...versi.current, ...hasil.versi } : hasil.versi
      if (!kelompok) terakhirLengkap.current = Date.now()
      setBatasBerkas(hasil.batasBerkas)
      if (untukAkun !== undefined) setPemilik((pemilikRef.current = untukAkun))
      setStatus('siap')
      setTerhubung(true)
    } catch {
      if (gen !== generasi.current) return
      setTerhubung(false)
      setStatus((s) => (s === 'siap' ? s : 'terputus'))
    }
  }, [])

  // Halaman Data Guru memuat ulang guru (NIP hanya untuk Kepala Sekolah) di useEffect-nya. Harus fungsi
  // yang tetap sama antar-render: fungsi baru tiap render membuat halaman itu memuat ulang tanpa henti.
  const muatGuru = useCallback(() => muat(['guru']), [muat])

  // Muat ulang semua saat pengguna berganti (login/keluar); data pengguna sebelumnya langsung dibuang
  const awalPertama = useRef(!!awal)
  useEffect(() => {
    if (awalPertama.current) {
      awalPertama.current = false
      return
    }
    bersihkanDataLama()
    generasi.current++
    setData(DATA_KOSONG)
    setStatus('memuat')
    versi.current = {}
    muat(null, akun)
  }, [akun, muat])

  /*
    Selama login, /api/versi diperiksa berkala (perubahan dari perangkat lain). Saat kembali ke tab,
    semua data dimuat ulang agar perubahan yang dibuat langsung di database (mis. lewat MySQL
    Workbench, yang tidak mengganti penanda versi) juga terlihat; berlaku juga untuk pengunjung.
  */
  useEffect(() => {
    if (awal) return
    let berjalan = false
    const periksa = async () => {
      if (berjalan || document.visibilityState !== 'visible') return
      berjalan = true
      const gen = generasi.current
      try {
        const v = await api('/versi', { latar: true })
        if (gen !== generasi.current) return
        const berubah = Object.keys(v).filter((k) => k !== 'chat' && v[k] !== versi.current[k])
        // Pemuatan pertama gagal (mis. server sempat mati): muat ulang semuanya
        if (pemilikRef.current !== akun) await muat(null, akun, true)
        else if (berubah.length) await muat(berubah, undefined, true)
        setVersiChat(v.chat)
        setTerhubung(true)
      } catch {
        // Server sedang tidak bisa dihubungi; dicoba lagi pada pemeriksaan berikutnya
        if (gen === generasi.current) setTerhubung(false)
      } finally {
        berjalan = false
      }
    }
    const saatKembali = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - terakhirLengkap.current >= JEDA_FOKUS) muat(null, akun, true)
      else if (akun) periksa()
    }
    const id = akun ? setInterval(periksa, cepat > 0 ? JEDA_CEPAT : JEDA_PERIKSA) : null
    window.addEventListener('focus', saatKembali)
    document.addEventListener('visibilitychange', saatKembali)
    return () => {
      clearInterval(id)
      window.removeEventListener('focus', saatKembali)
      document.removeEventListener('visibilitychange', saatKembali)
    }
  }, [akun, awal, cepat, muat])

  const beritahu = useCallback((teks) => setPemberitahuan({ teks, id: Date.now() }), [])
  useEffect(() => {
    if (!pemberitahuan) return
    const t = setTimeout(() => setPemberitahuan(null), 6000)
    return () => clearTimeout(t)
  }, [pemberitahuan])

  /*
    Kirim perubahan ke server lalu gabungkan jawabannya. Hasil: { hasil } jika berhasil, { galat } jika gagal.
    Penanda versi baru dipakai hanya jika website memegang versi sebelumnya (tidak ada perubahan lain yang terlewat).
  */
  const kirim = useCallback(
    async (path, { method = 'POST', body, diam = false } = {}) => {
      try {
        const hasil = await api(path, { method, body })
        if (hasil?.data || hasil?.hapus) setData((d) => terapkan(d, hasil))
        for (const [k, baru] of Object.entries(hasil?.versi ?? {})) {
          if (versi.current[k] === hasil.versiLama?.[k]) versi.current[k] = baru
        }
        return { hasil }
      } catch (e) {
        if (e.status === 0) setTerhubung(false)
        if (!diam) beritahu(e.message)
        return { galat: e.message }
      }
    },
    [beritahu],
  )
  // Bentuk singkat: Promise<pesan galat | null>
  const ubahData = async (path, opsi) => (await kirim(path, opsi)).galat ?? null

  // ===== Guru (jawaban server berupa data guru apa adanya) =====
  const simpanGuru = async (method, id, item) => {
    try {
      const hasil = await api(id ? `/guru/${encodeURIComponent(id)}` : '/guru', { method, body: item && isianGuru(item) })
      setData((d) => ({
        ...d,
        guru: method === 'POST' ? [...d.guru, hasil] : method === 'PUT' ? d.guru.map((g) => (g.id === id ? hasil : g)) : d.guru.filter((g) => g.id !== id),
      }))
      return null
    } catch (e) {
      return e.message
    }
  }

  /*
    Kepala Sekolah membuat akun login guru/staf, atau mengatur ulang password-nya.
    Hasil: { username, password } (password awal hanya ada di jawaban ini) atau { galat }.
  */
  const buatAkunGuru = async (id) => {
    try {
      const hasil = await api(`/guru/${encodeURIComponent(id)}/akun`, { method: 'POST' })
      setData((d) => ({ ...d, guru: d.guru.map((g) => (g.id === id ? hasil.guru : g)) }))
      return { username: hasil.username, password: hasil.password }
    } catch (e) {
      return { galat: e.message }
    }
  }

  // Tata Usaha / Kepala Sekolah membuat akun login orang tua untuk satu keluarga (atau mengatur ulang password-nya)
  const buatAkunOrangTua = async (id) => {
    const { hasil, galat } = await kirim(`/orang-tua/${encodeURIComponent(id)}/akun`, { diam: true })
    return hasil ? { username: hasil.username, password: hasil.password } : { galat }
  }

  // Tata Usaha / Kepala Sekolah membuat akun login siswa (username = NIS) atau mengatur ulang password-nya
  const buatAkunSiswa = async (id) => {
    const { hasil, galat } = await kirim(`/siswa/${encodeURIComponent(id)}/akun`, { diam: true })
    return hasil ? { username: hasil.username, password: hasil.password } : { galat }
  }

  // ===== Tambah/ubah/hapus umum: siswa, guru, orang tua, pengumuman, inventaris, kerusakan, konseling, buku, tugas, buku tamu =====
  const tambah = (koleksi, item, { diam = false } = {}) => {
    if (koleksi === 'guru') return simpanGuru('POST', null, item)
    return ubahData(alamat(koleksi), { body: item, diam })
  }

  const ubah = (koleksi, id, perubahan, { diam = false } = {}) => {
    if (koleksi === 'guru') return simpanGuru('PUT', id, { ...data.guru.find((g) => g.id === id), ...perubahan })
    return ubahData(`${alamat(koleksi)}/${encodeURIComponent(id)}`, { method: 'PUT', body: perubahan, diam })
  }

  const hapus = (koleksi, id, { diam = false } = {}) => {
    if (koleksi === 'guru') return simpanGuru('DELETE', id)
    return ubahData(`${alamat(koleksi)}/${encodeURIComponent(id)}`, { method: 'DELETE', diam })
  }

  // ===== Presensi siswa =====

  // Wali kelas mengubah presensi harian ({ nis: 'H'|'S'|'I'|'A' }); jejak perubahan dicatat server
  const ubahAbsensiSiswa = (tanggal, perubahan) => ubahData(`/absensi/${tanggal}`, { method: 'PUT', body: { perubahan } })

  // Guru pengampu mengubah kehadiran di satu pelajaran
  const ubahAbsensiPelajaran = (tanggal, kunci, perubahan) => ubahData(`/absensi/${tanggal}/${encodeURIComponent(kunci)}`, { method: 'PUT', body: { perubahan } })

  const ajukanIzin = (izin, opsi) => ubahData('/izin', { body: izin, ...opsi })

  // Izin yang disetujui otomatis tercatat di presensi sebagai S (sakit) atau I (izin)
  const prosesIzin = (id, status, catatanGuru) => ubahData(`/izin/${id}`, { method: 'PUT', body: { status, catatanGuru } })

  // Guru membuka sesi kode OTP untuk satu kelas: presensi harian, atau satu pelajaran ({ kunci })
  const bukaSesiPresensi = async (kelas, pelajaran = null) => {
    const { hasil } = await kirim('/presensi-sesi', { body: { kelas, kunci: pelajaran?.kunci ?? null } })
    return hasil?.data.sesiPresensi[0] ?? null
  }

  const tutupSesiPresensi = (id) => ubahData(`/presensi-sesi/${id}/tutup`)

  /*
    Siswa memasukkan kode. Hasil: { ok, alasan, jam, sisa, sesi }
    alasan: 'sudah' | 'tidak-ada' | 'kedaluwarsa' | 'terkunci' | 'salah' | 'galat' (pesan di `pesan`)
  */
  const isiPresensiOtp = async (kode) => {
    const { hasil, galat } = await kirim('/presensi-otp', { body: { kode }, diam: true })
    return hasil ? hasil.hasil : { ok: false, alasan: 'galat', pesan: galat }
  }

  // ===== Presensi guru & staf =====

  // Absen masuk/pulang hari ini; `alasan` diisi saat terlambat atau pulang sebelum jam kerja selesai
  const absenStaf = (jenis, alasan = '') => ubahData('/presensi-staf', { body: { jenis, alasan } })

  // Koreksi oleh Kepala Sekolah; jejaknya terlihat oleh semua staf
  const koreksiPresensi = (tanggal, guruId, perubahan, alasan, opsi) =>
    ubahData(`/presensi-staf/${tanggal}/${guruId}`, { method: 'PUT', body: { ...perubahan, alasan }, ...opsi })

  const ajukanIzinStaf = (izin, opsi) => ubahData('/izin-staf', { body: izin, ...opsi })

  const prosesIzinStaf = (id, status, catatan) => ubahData(`/izin-staf/${id}`, { method: 'PUT', body: { status, catatan } })

  const batalkanIzinStaf = (id) => ubahData(`/izin-staf/${id}`, { method: 'DELETE' })

  // ===== Akademik =====

  // Simpan nilai satu mapel milik satu siswa, mis. { tugas: [80, 85, 90] } atau { pts: 88 }
  const simpanNilai = (nis, kode, nilaiBaru) => ubahData(`/nilai/${nis}/${kode}`, { method: 'PUT', body: nilaiBaru })

  const simpanCatatanWali = (nis, teks) => ubahData(`/catatan-wali/${nis}`, { method: 'PUT', body: { teks } })

  // Beri satu kategori sikap ke beberapa siswa sekaligus
  const beriSikap = (daftarNis, kode, catatan) => ubahData('/sikap', { body: { nis: daftarNis, kode, catatan } })

  const hapusSikap = (id) => ubahData(`/sikap/${id}`, { method: 'DELETE' })

  const toggleTugas = (idTugas) => ubahData(`/tugas/${idTugas}/selesai`)

  const toggleEkskul = (idEkskul) => ubahData(`/ekskul/${idEkskul}`)

  // ===== SPP =====

  // bukti (opsional) = File foto bukti pembayaran; dikirim sebagai multipart bila ada
  const catatTunai = async (nis, bulan, bukti = null) => {
    let body
    if (bukti) {
      body = new FormData()
      body.append('nis', nis)
      for (const b of bulan) body.append('bulan[]', b)
      body.append('bukti', bukti)
    } else {
      body = { nis, bulan }
    }
    const { hasil } = await kirim('/spp/tunai', { body })
    return hasil ? { noTransaksi: hasil.noTransaksi, tanggal: hasil.tanggal, bukti: hasil.bukti } : null
  }

  const buatTransaksi = async (isian) => (await kirim('/transaksi-spp', { body: isian })).hasil?.data.transaksi[0] ?? null

  const batalkanTransaksi = (id) => ubahData(`/transaksi-spp/${id}/batal`)

  /*
    Tidak ada "tandai sudah bayar": transaksi online menjadi lunas hanya dari notifikasi payment gateway
    di server. Website cukup membaca ulang statusnya (otomatis lewat useSegarCepat, atau tombol cek status).
  */
  const cekStatusTransaksi = () => muat(['transaksi', 'spp'], akun)

  // Kuitansi PDF resmi dari server. Hasil: null atau pesan galat
  const unduhKuitansi = async (nis, noTransaksi) => {
    try {
      await unduhBerkas(`/spp/kuitansi/${encodeURIComponent(nis)}/${encodeURIComponent(noTransaksi)}`, `Kuitansi-${noTransaksi}.pdf`)
      return null
    } catch (e) {
      return e.message
    }
  }

  // ===== Perpustakaan =====

  const pinjamBuku = (nis, bukuId) => ubahData('/peminjaman', { body: { nis, bukuId } })

  const kembalikanBuku = (id) => ubahData(`/peminjaman/${id}/kembali`)

  const pesanBuku = (bukuId) => ubahData('/reservasi', { body: { bukuId } })

  const batalPesanBuku = (id) => ubahData(`/reservasi/${id}`, { method: 'DELETE' })

  // Pustakawan memproses pesanan: 'Selesai' (buku langsung dipinjamkan) atau 'Ditolak'
  const prosesPesanan = (id, status) => ubahData(`/reservasi/${id}/proses`, { body: { status } })

  // ===== PPDB & kunjungan =====

  // Formulir publik: hasilnya data lengkap pendaftaran/kunjungan, atau { galat }
  const daftarPpdb = async (isian) => {
    const { hasil, galat } = await kirim('/pendaftar', { body: isian, diam: true })
    return hasil ? { pendaftar: hasil.pendaftar } : { galat }
  }

  const pesanKunjungan = async (isian) => {
    const { hasil, galat } = await kirim('/kunjungan', { body: isian, diam: true })
    return hasil ? { kunjungan: hasil.kunjungan } : { galat }
  }

  const prosesPendaftar = (id, status, catatanPanitia) => ubahData(`/pendaftar/${id}`, { method: 'PUT', body: { status, catatanPanitia } })

  const prosesKunjungan = (id, status, catatanTu) => ubahData(`/kunjungan/${id}`, { method: 'PUT', body: { status, catatanTu } })

  // Halaman yang menunggu perubahan dari perangkat lain (kode presensi, chat) memeriksa lebih sering
  const segarCepat = useCallback(() => {
    setCepat((n) => n + 1)
    return () => setCepat((n) => n - 1)
  }, [])

  return (
    <DataContext.Provider
      value={{
        data,
        status,
        // Data milik akun yang sedang login sudah dimuat
        siap: status === 'siap' && pemilik === akun,
        batasBerkas,
        versiChat,
        muat,
        muatUlang: () => muat(null, akun),
        segarCepat,
        beritahu,
        terhubung,
        // Status untuk halaman Data Guru: 'memuat' | 'server' | 'terputus'
        statusGuru: !terhubung ? 'terputus' : status === 'siap' ? 'server' : status,
        muatGuru,
        buatAkunGuru,
        buatAkunOrangTua,
        buatAkunSiswa,
        tambah,
        ubah,
        hapus,
        ubahAbsensiSiswa,
        ubahAbsensiPelajaran,
        ajukanIzin,
        prosesIzin,
        bukaSesiPresensi,
        tutupSesiPresensi,
        isiPresensiOtp,
        absenStaf,
        koreksiPresensi,
        ajukanIzinStaf,
        prosesIzinStaf,
        batalkanIzinStaf,
        simpanNilai,
        simpanCatatanWali,
        beriSikap,
        hapusSikap,
        toggleTugas,
        toggleEkskul,
        catatTunai,
        buatTransaksi,
        batalkanTransaksi,
        cekStatusTransaksi,
        unduhKuitansi,
        pinjamBuku,
        kembalikanBuku,
        pesanBuku,
        batalPesanBuku,
        prosesPesanan,
        daftarPpdb,
        pesanKunjungan,
        prosesPendaftar,
        prosesKunjungan,
      }}
    >
      {children}
      {pemberitahuan && (
        <div role="alert" className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-md items-start gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2">
          <p className="flex-1">{pemberitahuan.teks}</p>
          <button onClick={() => setPemberitahuan(null)} className="rounded p-0.5 text-slate-400 hover:text-white" aria-label="Tutup pemberitahuan">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)

// Periksa perubahan dari perangkat lain tiap beberapa detik selama komponen ini tampil
export function useSegarCepat(aktif = true) {
  const { segarCepat } = useData()
  useEffect(() => (aktif ? segarCepat() : undefined), [aktif, segarCepat])
}

// Ringkasan absensi satu siswa dari daftar tanggal tertentu
export function ringkasAbsensi(absensi, nis, daftarTanggal) {
  const hitung = { H: 0, S: 0, I: 0, A: 0 }
  for (const tgl of daftarTanggal) {
    const status = absensi[tgl]?.[nis]
    if (status) hitung[status]++
  }
  const total = hitung.H + hitung.S + hitung.I + hitung.A
  return { ...hitung, total, persen: total ? Math.round((hitung.H / total) * 100) : 0 }
}

// Absensi per mata pelajaran: catatan guru pengampu per pelajaran, atau presensi harian jika
// pelajaran itu tidak dipresensi tersendiri.
export function absensiPerMapel(data, nis, kelas) {
  const hasil = {}
  const tanggalAda = new Set([...Object.keys(data.absensi), ...Object.keys(data.absensiMapel ?? {})])
  for (const tanggal of [...tanggalAda].sort().reverse()) {
    for (const p of pelajaranHari(kelas, tanggal)) {
      const khusus = data.absensiMapel?.[tanggal]?.[nis]?.[p.kunci]
      // Pelajaran hari ini yang belum dimulai belum dihitung
      if (!khusus && tanggal === todayKey() && jamSekarang() < p.mulai) continue
      const status = khusus ?? data.absensi[tanggal]?.[nis]
      if (!status) continue
      hasil[p.mapel] ??= { H: 0, S: 0, I: 0, A: 0, total: 0, riwayat: [] }
      hasil[p.mapel][status]++
      hasil[p.mapel].total++
      hasil[p.mapel].riwayat.push({ tanggal, status, jam: `${p.mulai}–${p.selesai}` })
    }
  }
  for (const r of Object.values(hasil)) r.persen = Math.round((r.H / r.total) * 100)
  return hasil
}
