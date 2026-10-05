import { createContext, useContext, useEffect, useState } from 'react'
import { AKUN_DEMO, BUKU_AWAL, GURU_AWAL, INVENTARIS_AWAL, JADWAL, MAPEL, PENGUMUMAN_AWAL, SISWA_AWAL, SPP } from '../data/dummy'
import { hariSekolahSebelum, isHariSekolah, namaHari, parseKey, rentangHariSekolah, tambahHari, todayKey, uid } from '../utils/format'
import { bulanIni } from '../utils/spp'

const DataContext = createContext(null)
const STORAGE_KEY = 'sdhg-data-v2'

// Hari sekolah ke-n setelah tanggal tertentu
function hariSekolahSetelah(dari, n) {
  let key = dari
  let sisa = n
  while (sisa > 0) {
    key = tambahHari(key, 1)
    if (isHariSekolah(parseKey(key))) sisa--
  }
  return key
}

const hashTeks =(teks, mod = 1000) => [...teks].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) % mod, 7)

// Riwayat absensi contoh untuk 20 hari sekolah terakhir: { 'YYYY-MM-DD': { nis: 'H'|'S'|'I'|'A' } }
function buatAbsensiContoh(siswa) {
  const absensi = {}
  for (const tanggal of hariSekolahSebelum(20)) {
    absensi[tanggal] = {}
    for (const s of siswa) {
      const n = hashTeks(s.nis + tanggal) % 100
      absensi[tanggal][s.nis] = n < 90 ? 'H' : n < 95 ? 'S' : n < 98 ? 'I' : 'A'
    }
  }
  return absensi
}

// Riwayat SPP contoh: { nis: { 'YYYY-MM': { tanggal, metode, noTransaksi, jumlah } } }
function buatSppContoh(siswa) {
  const METODE = ['QRIS', 'VA BCA', 'VA BRI', 'VA Mandiri', 'Tunai']
  const bulanLalu = SPP.bulan.filter((b) => b < bulanIni())
  const spp = {}
  for (const s of siswa) {
    const h = hashTeks(s.nis)
    // Siswa demo (230401) sengaja punya 1 bulan tunggakan agar alur pembayaran terlihat
    const tunggakan = s.nis === '230401' ? 1 : h % 10 < 6 ? 0 : h % 10 < 9 ? 1 : 2
    spp[s.nis] = {}
    bulanLalu.slice(0, bulanLalu.length - tunggakan).forEach((b, i) => {
      spp[s.nis][b] = {
        tanggal: `${b}-0${3 + ((h + i) % 6)}`,
        metode: METODE[(h + i) % METODE.length],
        noTransaksi: `SPP-${b.replace('-', '')}-${s.nis}`,
        jumlah: SPP.nominal,
      }
    })
    if (tunggakan === 0 && h % 2 === 0) {
      spp[s.nis][bulanIni()] = { tanggal: todayKey(), metode: 'QRIS', noTransaksi: `SPP-${bulanIni().replace('-', '')}-${s.nis}`, jumlah: SPP.nominal }
    }
  }
  return spp
}

// Catatan konseling contoh; nama & kelas diambil dari data siswa
function buatKonselingContoh(hariIni) {
  const siswa = (nis) => SISWA_AWAL.find((s) => s.nis === nis) ?? { nis, nama: nis, kelas: '' }
  const catatan = [
    ['ks1', '230405', -2, 'Belajar', 'Konseling Individu', 'Sering tidak mengerjakan PR dan sulit fokus di kelas.', 'Membuat jadwal belajar harian bersama siswa; wali kelas memantau selama 2 pekan.', 'Perlu Pemantauan'],
    ['ks2', '230402', -6, 'Sosial', 'Konseling Kelompok', 'Berselisih dengan teman sebangku saat jam istirahat.', 'Mediasi kedua siswa, sudah saling memaafkan.', 'Selesai'],
    ['ks3', '230601', -1, 'Pribadi', 'Konsultasi Orang Tua', 'Tampak murung sejak pindah rumah, orang tua meminta pendampingan.', 'Sesi lanjutan dengan siswa minggu depan.', 'Dalam Proses'],
  ]
  return catatan.map(([id, nis, hari, kategori, layanan, masalah, tindakLanjut, status]) => {
    const s = siswa(nis)
    return { id, nis, nama: s.nama, kelas: s.kelas, tanggal: tambahHari(hariIni, hari), kategori, layanan, masalah, tindakLanjut, status }
  })
}

function dataAwal() {
  const hariIni = todayKey()
  const [kemarin, , , lalu] = hariSekolahSebelum(4)
  return {
    inventaris: INVENTARIS_AWAL,
    kerusakan: [
      { id: 'kr1', nama: 'AC Lab Komputer tidak dingin', lokasi: 'Lab Komputer', pelapor: 'Hendra Wijaya, S.Kom.', tanggal: tambahHari(hariIni, -3), prioritas: 'Tinggi', status: 'Diperbaiki', keterangan: 'Teknisi dijadwalkan datang hari Kamis.' },
      { id: 'kr2', nama: 'Keran wastafel depan kantin bocor', lokasi: 'Kantin Sehat', pelapor: 'Joko Susilo', tanggal: tambahHari(hariIni, -1), prioritas: 'Sedang', status: 'Dilaporkan', keterangan: '' },
      { id: 'kr3', nama: 'Lampu proyektor kelas 3B redup', lokasi: 'Ruang Kelas', pelapor: 'Wali Kelas 3B', tanggal: hariIni, prioritas: 'Rendah', status: 'Dilaporkan', keterangan: '' },
    ],
    konseling: buatKonselingContoh(hariIni),
    bukuTamu: [
      { id: 'bt1', tanggal: hariIni, nama: 'Pak Rudi (JNE)', instansi: 'JNE Express', keperluan: 'Pengiriman barang', bertemu: 'Tata Usaha', whatsapp: '', jumlah: 1, masuk: '08.15', keluar: '08.25' },
      { id: 'bt2', tanggal: hariIni, nama: 'Ibu Dewi Lestari', instansi: 'Orang tua siswa 4A', keperluan: 'Bertemu guru/staf', bertemu: 'Andi Pratama, S.Pd.', whatsapp: '0812-1111-2222', jumlah: 1, masuk: '09.40', keluar: '' },
    ],
    siswa: SISWA_AWAL,
    guru: GURU_AWAL,
    pengumuman: PENGUMUMAN_AWAL,
    absensi: buatAbsensiContoh(SISWA_AWAL),
    tugasSelesai: { 230401: ['t6'] }, // { nis: [id tugas yang sudah dikerjakan] }
    spp: buatSppContoh(SISWA_AWAL),
    transaksi: [], // transaksi pembayaran online yang sedang/pernah dibuat
    buku: BUKU_AWAL,
    pendaftar: [
      {
        id: 'pd1',
        nomor: 'PPDB-2027-0001',
        nama: 'Arkan Maulana Putra',
        panggilan: 'Arkan',
        jk: 'L',
        tempatLahir: 'Kota Harapan',
        tanggalLahir: '2021-03-12',
        nik: '3271011203210001',
        agama: 'Islam',
        asalTk: 'TK Pelita Bangsa',
        alamat: 'Jl. Kenanga No. 8, Sukamaju',
        namaAyah: 'Rizky Maulana',
        pekerjaanAyah: 'Karyawan swasta',
        namaIbu: 'Anisa Putri',
        pekerjaanIbu: 'Guru',
        whatsapp: '0812-7777-1234',
        email: 'anisa.putri@contoh.id',
        jalur: 'Reguler',
        infoJalur: '',
        berkas: { akta: 'akta-arkan.pdf', kk: 'kk.pdf', foto: 'foto-arkan.jpg', ktp: 'ktp-ayah.jpg', tk: 'skl-tk.pdf' },
        status: 'Terverifikasi',
        catatanPanitia: 'Berkas lengkap. Jadwal observasi akan dikirim via WhatsApp.',
        dibuat: '2026-10-01T09:12:00.000Z',
      },
      {
        id: 'pd2',
        nomor: 'PPDB-2027-0002',
        nama: 'Keisha Aurelia',
        panggilan: 'Keisha',
        jk: 'P',
        tempatLahir: 'Bandung',
        tanggalLahir: '2021-01-25',
        nik: '3273012501210002',
        agama: 'Kristen',
        asalTk: 'TK Tunas Ceria',
        alamat: 'Jl. Anggrek No. 21, Sukamaju',
        namaAyah: 'Daniel Saragih',
        pekerjaanAyah: 'Wiraswasta',
        namaIbu: 'Maria Ulfa',
        pekerjaanIbu: 'Ibu rumah tangga',
        whatsapp: '0857-3333-4321',
        email: '',
        jalur: 'Prestasi',
        infoJalur: 'Juara 2 lomba mewarnai tingkat kota 2026',
        berkas: { akta: 'akta.pdf', kk: 'kk.jpg', foto: 'pasfoto.jpg', ktp: 'ktp.jpg' },
        status: 'Perlu Perbaikan',
        catatanPanitia: 'Mohon unggah sertifikat prestasi lomba mewarnai.',
        dibuat: '2026-10-02T14:30:00.000Z',
      },
      {
        id: 'pd3',
        nomor: 'PPDB-2027-0003',
        nama: 'Naufal Rasyid',
        panggilan: 'Naufal',
        jk: 'L',
        tempatLahir: 'Kota Harapan',
        tanggalLahir: '2020-11-03',
        nik: '3271010311200003',
        agama: 'Islam',
        asalTk: '',
        alamat: 'Jl. Merpati No. 5, Sukamaju',
        namaAyah: 'Abdul Rasyid',
        pekerjaanAyah: 'PNS',
        namaIbu: 'Siti Aminah',
        pekerjaanIbu: 'Wiraswasta',
        whatsapp: '0813-8888-5678',
        email: '',
        jalur: 'Saudara Kandung',
        infoJalur: 'Hafiz Maulana — kelas 4A',
        berkas: { akta: 'akta.pdf', kk: 'kk.pdf', foto: 'foto.jpg', ktp: 'ktp.pdf' },
        status: 'Menunggu Verifikasi',
        catatanPanitia: '',
        dibuat: new Date().toISOString(),
      },
    ],
    kunjungan: [
      {
        id: 'kj1',
        kode: 'KJG-4821',
        nama: 'Bapak Hendro Wibowo',
        whatsapp: '0813-5555-1212',
        tanggal: hariSekolahSetelah(hariIni, 2),
        sesi: '09.00 – 10.00',
        jumlah: 2,
        keperluan: 'Calon orang tua murid (PPDB)',
        fasilitas: ['ruang-kelas', 'perpustakaan', 'lab-komputer'],
        catatan: 'Ingin bertanya tentang program robotik.',
        status: 'Menunggu',
        dibuat: new Date().toISOString(),
      },
      {
        id: 'kj2',
        kode: 'KJG-3307',
        nama: 'Ibu Larasati',
        whatsapp: '0857-2222-8080',
        tanggal: hariSekolahSetelah(hariIni, 3),
        sesi: '10.30 – 11.30',
        jumlah: 3,
        keperluan: 'Calon orang tua murid (PPDB)',
        fasilitas: ['taman', 'kantin', 'uks'],
        catatan: '',
        status: 'Dikonfirmasi',
        catatanTu: 'Silakan datang ke ruang TU, akan didampingi Bu Sri.',
        dibuat: new Date().toISOString(),
      },
    ],
    peminjaman: [
      { id: 'pj1', bukuId: 'b1', nis: '230401', tanggalPinjam: tambahHari(hariIni, -3), tenggat: tambahHari(hariIni, 4), tanggalKembali: null },
      { id: 'pj2', bukuId: 'b2', nis: '230402', tanggalPinjam: tambahHari(hariIni, -10), tenggat: tambahHari(hariIni, -3), tanggalKembali: null },
      { id: 'pj3', bukuId: 'b7', nis: '230601', tanggalPinjam: tambahHari(hariIni, -5), tenggat: tambahHari(hariIni, 2), tanggalKembali: null },
      { id: 'pj4', bukuId: 'b4', nis: '230408', tanggalPinjam: tambahHari(hariIni, -14), tenggat: tambahHari(hariIni, -7), tanggalKembali: tambahHari(hariIni, -8) },
    ],
    izin: [
      {
        id: 'iz1',
        nis: '230405',
        namaSiswa: 'Dimas Arya Saputra',
        kelas: '4A',
        jenis: 'Sakit',
        tanggalMulai: kemarin,
        tanggalSelesai: kemarin,
        alasan: 'Demam sejak malam hari, sudah diperiksa ke dokter.',
        lampiran: 'surat-dokter.jpg',
        status: 'Menunggu',
        diajukan: new Date().toISOString(),
      },
      {
        id: 'iz2',
        nis: '230401',
        namaSiswa: 'Rafa Aditya',
        kelas: '4A',
        jenis: 'Izin',
        tanggalMulai: lalu,
        tanggalSelesai: lalu,
        alasan: 'Menghadiri acara pernikahan keluarga di luar kota.',
        lampiran: '',
        status: 'Disetujui',
        catatanGuru: 'Baik, semoga lancar acaranya.',
        diajukan: new Date().toISOString(),
      },
    ],
  }
}

function bacaData() {
  try {
    const tersimpan = JSON.parse(localStorage.getItem(STORAGE_KEY))
    // Gabung dengan data awal agar koleksi baru tetap ada untuk data lama yang tersimpan
    if (tersimpan) {
      // Guru/staf milik akun demo yang belum ada di data lama (mis. jabatan yang baru ditambahkan)
      const idAkun = AKUN_DEMO.map((a) => a.guruId).filter(Boolean)
      const kurang = GURU_AWAL.filter((g) => idAkun.includes(g.id) && !tersimpan.guru?.some((x) => x.id === g.id))
      const guru = tersimpan.guru ? [...tersimpan.guru, ...kurang] : GURU_AWAL
      return { ...dataAwal(), ...tersimpan, guru }
    }
  } catch {
    /* data rusak, pakai data awal */
  }
  return dataAwal()
}

// Penyimpanan sementara di localStorage. Akan diganti dengan API backend.
export function DataProvider({ children }) {
  const [data, setData] = useState(bacaData)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const tambah = (koleksi, item) =>
    setData((d) => ({ ...d, [koleksi]: [{ ...item, id: item.id || uid() }, ...d[koleksi]] }))

  const ubah = (koleksi, id, perubahan) =>
    setData((d) => ({ ...d, [koleksi]: d[koleksi].map((x) => (x.id === id ? { ...x, ...perubahan } : x)) }))

  const hapus = (koleksi, id) => setData((d) => ({ ...d, [koleksi]: d[koleksi].filter((x) => x.id !== id) }))

  const simpanAbsensi = (tanggal, catatan) =>
    setData((d) => ({ ...d, absensi: { ...d.absensi, [tanggal]: { ...d.absensi[tanggal], ...catatan } } }))

  const ajukanIzin = (izin) =>
    tambah('izin', { ...izin, status: 'Menunggu', diajukan: new Date().toISOString() })

  // Izin yang disetujui otomatis tercatat di absensi sebagai S (sakit) atau I (izin)
  const prosesIzin = (id, status, catatanGuru) =>
    setData((d) => {
      const izin = d.izin.find((x) => x.id === id)
      const absensi = { ...d.absensi }
      if (status === 'Disetujui') {
        const kode = izin.jenis === 'Sakit' ? 'S' : 'I'
        for (const tgl of rentangHariSekolah(izin.tanggalMulai, izin.tanggalSelesai)) {
          absensi[tgl] = { ...absensi[tgl], [izin.nis]: kode }
        }
      }
      return {
        ...d,
        absensi,
        izin: d.izin.map((x) => (x.id === id ? { ...x, status, catatanGuru } : x)),
      }
    })

  const toggleTugas = (nis, idTugas) =>
    setData((d) => {
      const selesai = d.tugasSelesai[nis] ?? []
      const baru = selesai.includes(idTugas) ? selesai.filter((x) => x !== idTugas) : [...selesai, idTugas]
      return { ...d, tugasSelesai: { ...d.tugasSelesai, [nis]: baru } }
    })

  // Tandai bulan-bulan SPP sebagai lunas
  const catatLunas = (d, nis, bulan, info) => {
    const milikSiswa = { ...d.spp[nis] }
    for (const b of bulan) milikSiswa[b] = { ...info, jumlah: SPP.nominal }
    return { ...d.spp, [nis]: milikSiswa }
  }

  // Dipanggil saat pembayaran online terkonfirmasi. Di backend nanti: dipicu webhook payment gateway.
  const selesaikanTransaksi = (id) =>
    setData((d) => {
      const trx = d.transaksi.find((t) => t.id === id)
      const info = { tanggal: todayKey(), metode: trx.metodeLabel, noTransaksi: trx.noTransaksi }
      return {
        ...d,
        spp: catatLunas(d, trx.nis, trx.bulan, info),
        transaksi: d.transaksi.map((t) => (t.id === id ? { ...t, status: 'berhasil', dibayar: new Date().toISOString() } : t)),
      }
    })

  const catatTunai = (nis, bulan, noTransaksi) =>
    setData((d) => ({ ...d, spp: catatLunas(d, nis, bulan, { tanggal: todayKey(), metode: 'Tunai', noTransaksi }) }))

  const resetData = () => setData(dataAwal())

  return (
    <DataContext.Provider
      value={{ data, tambah, ubah, hapus, simpanAbsensi, ajukanIzin, prosesIzin, toggleTugas, selesaikanTransaksi, catatTunai, resetData }}
    >
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)

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

// Absensi per mata pelajaran, diturunkan dari absensi harian + jadwal kelas.
// Siswa yang hadir sesekali tercatat izin di satu mapel (mis. ke UKS / pulang lebih awal).
// Nanti diganti dengan data absensi per mapel yang diisi guru mapel lewat backend.
export function absensiPerMapel(absensi, nis, kelas) {
  const hasil = {}
  for (const tanggal of Object.keys(absensi).sort().reverse()) {
    const harian = absensi[tanggal]?.[nis]
    const jadwal = JADWAL[kelas]?.[namaHari(tanggal)]
    if (!harian || !jadwal) continue
    for (const kode of jadwal) {
      if (MAPEL[kode]?.absensi === false) continue
      let status = harian
      if (harian === 'H') {
        const hash = [...(nis + tanggal + kode)].reduce((acc, c) => (acc * 33 + c.charCodeAt(0)) % 997, 3)
        if (hash % 100 < 3) status = 'I'
      }
      hasil[kode] ??= { H: 0, S: 0, I: 0, A: 0, total: 0, riwayat: [] }
      hasil[kode][status]++
      hasil[kode].total++
      hasil[kode].riwayat.push({ tanggal, status })
    }
  }
  for (const r of Object.values(hasil)) r.persen = Math.round((r.H / r.total) * 100)
  return hasil
}
