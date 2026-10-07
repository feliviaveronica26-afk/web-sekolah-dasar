import { createContext, useContext, useEffect, useState } from 'react'
import {
  AKUN_DEMO,
  BIODATA,
  BUKU_AWAL,
  EKSKUL,
  GURU_AWAL,
  INVENTARIS_AWAL,
  JADWAL,
  MAPEL,
  PENGUMUMAN_AWAL,
  SIKAP,
  SISWA_AWAL,
  SPP,
  TUGAS_AWAL,
} from '../data/dummy'
import { angkaKelas, mapelRapor } from '../utils/nilai'
import { hariSekolahSebelum, isHariSekolah, jamSekarang, namaHari, parseKey, rentangHariSekolah, tambahHari, todayKey, uid } from '../utils/format'
import { KODE_IZIN_STAF, dariMenit, jamKerja, keMenit } from '../utils/presensi'
import { MAKS_PERCOBAAN, MASA_BERLAKU_MENIT, buatKodeOtp, sesiBerlaku } from '../utils/otp'
import { bulanIni } from '../utils/spp'

const DataContext = createContext(null)
// v3: kelas 1A–6C dengan 24 siswa per kelas (data lama v2 tidak dipakai lagi)
const STORAGE_KEY = 'sdhg-data-v3'

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

// Hash FNV-1a: data contoh tersebar acak, tetapi selalu sama setiap kali dibuat ulang
const hashTeks = (teks, mod = 1000) => {
  let h = 2166136261
  for (const c of teks) {
    h ^= c.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) % mod
}

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

// Nilai contoh semester ganjil: 3 nilai tugas + PTS per mapel. PAS diisi guru di akhir semester.
function buatNilaiContoh(siswa) {
  const nilai = {}
  for (const s of siswa) {
    const dasar = 72 + (hashTeks(s.nis, 997) % 22)
    nilai[s.nis] = {}
    for (const kode of mapelRapor(s.kelas)) {
      const geser = (hashTeks(s.nis + kode, 997) % 15) - 7
      const skor = (k) => Math.max(55, Math.min(100, dasar + geser + (hashTeks(s.nis + kode + k, 997) % 11) - 5))
      nilai[s.nis][kode] = { tugas: [skor('t1'), skor('t2'), skor('t3')], pts: skor('pts'), pas: null }
    }
  }
  return nilai
}

const waliKelasDari = (kelas) => GURU_AWAL.find((g) => g.peran.includes('wali_kelas') && g.kelas === kelas)?.nama ?? 'Wali Kelas'

// Poin sikap contoh selama 15 hari sekolah terakhir; sebagian kecil berupa catatan perbaikan
function buatSikapContoh(siswa) {
  const tanggal = hariSekolahSebelum(15)
  const hasil = [
    { id: 'sk-r1', nis: '230401', kode: 'membantu', poin: 2, tanggal: tanggal[1], catatan: 'Membantu Bima memahami soal pecahan.', oleh: 'Andi Pratama, S.Pd.' },
    { id: 'sk-r2', nis: '230401', kode: 'aktif', poin: 1, tanggal: tanggal[2], catatan: 'Bertanya kritis saat praktik siklus air.', oleh: 'Andi Pratama, S.Pd.' },
    { id: 'sk-r3', nis: '230401', kode: 'membantu', poin: 2, tanggal: tanggal[5], catatan: 'Membantu merapikan perpustakaan kelas.', oleh: 'Yusuf Hidayat, S.IP.' },
    { id: 'sk-r4', nis: '230401', kode: 'kreatif', poin: 1, tanggal: tanggal[7], catatan: 'Desain robot paling unik di ekskul robotik.', oleh: 'Hendra Wijaya, S.Kom.' },
    { id: 'sk-r5', nis: '230401', kode: 'lupa', poin: -1, tanggal: tanggal[9], catatan: 'Lupa membawa baju olahraga.', oleh: 'Budi Santoso, S.Pd.' },
    { id: 'sk-r6', nis: '230401', kode: 'disiplin', poin: 1, tanggal: tanggal[11], catatan: '', oleh: 'Andi Pratama, S.Pd.' },
  ]
  for (const s of siswa) {
    if (s.nis === '230401') continue
    const jumlah = 3 + (hashTeks(s.nis + 'sikap') % 5)
    for (let i = 0; i < jumlah; i++) {
      const h = hashTeks(s.nis + 'sk' + i)
      const daftar = h % 100 < 18 ? SIKAP.perbaikan : SIKAP.positif
      const k = daftar[h % daftar.length]
      hasil.push({ id: `sk-${s.nis}-${i}`, nis: s.nis, kode: k.kode, poin: k.poin, tanggal: tanggal[h % tanggal.length], catatan: '', oleh: waliKelasDari(s.kelas) })
    }
  }
  return hasil
}

// Ekskul pilihan contoh (ekskul wajib tidak perlu disimpan)
function buatEkskulContoh(siswa) {
  const hasil = {}
  for (const s of siswa) {
    if (BIODATA[s.nis]?.ekskul) {
      hasil[s.nis] = BIODATA[s.nis].ekskul
      continue
    }
    const pilihan = EKSKUL.filter((e) => !e.wajib && angkaKelas(s.kelas) >= e.minKelas)
    const h = hashTeks(s.nis + 'ekskul')
    hasil[s.nis] = [...new Set([pilihan[h % pilihan.length], pilihan[(h >> 3) % pilihan.length]].slice(0, 1 + (h % 2)).map((e) => e.id))]
  }
  return hasil
}

// Percakapan contoh antara orang tua dan wali kelas
function buatPesanContoh() {
  const lalu = (hari, jam) => {
    const d = new Date()
    d.setDate(d.getDate() - hari)
    d.setHours(jam, 15, 0, 0)
    return d.toISOString()
  }
  const guru = 'Andi Pratama, S.Pd.'
  return [
    { id: 'ps1', nis: '230401', dari: 'guru', pengirim: guru, isi: 'Selamat pagi Bu Dewi. Rafa hari ini aktif sekali saat diskusi IPAS tentang siklus air. 👍', waktu: lalu(3, 9), dibacaOrtu: true, dibacaGuru: true },
    { id: 'ps2', nis: '230401', dari: 'ortu', pengirim: 'Ibu Dewi Lestari', isi: 'Terima kasih infonya, Pak Andi. Di rumah dia juga semangat bercerita soal itu.', waktu: lalu(3, 12), dibacaOrtu: true, dibacaGuru: true },
    { id: 'ps3', nis: '230401', dari: 'ortu', pengirim: 'Ibu Dewi Lestari', isi: 'Pak, minggu depan ada field trip ke Museum Nasional ya? Apakah anak perlu membawa bekal sendiri?', waktu: lalu(1, 19), dibacaOrtu: true, dibacaGuru: true },
    { id: 'ps4', nis: '230401', dari: 'guru', pengirim: guru, isi: 'Betul, Bu. Mohon dibawakan bekal makan siang dan botol minum. Formulir persetujuannya dikumpulkan paling lambat 16 Oktober ya.', waktu: lalu(0, 7), dibacaOrtu: false, dibacaGuru: true },
    { id: 'ps5', nis: '230405', dari: 'ortu', pengirim: 'Ibu Yuliana', isi: 'Selamat pagi Pak, Dimas sudah sembuh dan besok masuk sekolah. Apakah ada tugas yang perlu dikejar?', waktu: lalu(0, 6), dibacaOrtu: true, dibacaGuru: false },
  ]
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

// Pengajuan izin guru & staf contoh (yang disetujui ikut tercatat di presensi)
function buatIzinStafContoh(hariIni) {
  const lalu = hariSekolahSebelum(45)
  const nama = (id) => GURU_AWAL.find((g) => g.id === id)?.nama ?? ''
  const waktu = (tgl) => `${tgl}T01:30:00.000Z`
  const izin = [
    ['is1', 'g8', 'Dinas Luar', hariIni, hariSekolahSetelah(hariIni, 1), 'Mendampingi tim robotik di Lomba Robotik Tingkat Provinsi.', 'surat-tugas-lomba.pdf', 'Disetujui', 'Semoga sukses, Pak Hendra!'],
    ['is2', 'g5', 'Izin', hariSekolahSetelah(hariIni, 2), hariSekolahSetelah(hariIni, 2), 'Menghadiri wisuda adik di luar kota.', '', 'Menunggu', ''],
    ['is3', 'g3', 'Sakit', lalu[12], lalu[11], 'Demam dan radang tenggorokan, istirahat sesuai anjuran dokter.', 'surat-dokter.jpg', 'Disetujui', 'Lekas sembuh, Bu Rina.'],
    ['is4', 'g12', 'Cuti', lalu[25], lalu[24], 'Cuti tahunan untuk acara pernikahan saudara kandung.', '', 'Disetujui', ''],
    ['is5', 'g10', 'Izin', lalu[5], lalu[5], 'Mengurus perpanjangan SIM.', '', 'Ditolak', 'Mohon diurus di luar jam kerja.'],
  ]
  return izin.map(([id, guruId, jenis, tanggalMulai, tanggalSelesai, alasan, lampiran, status, catatan]) => ({
    id,
    guruId,
    nama: nama(guruId),
    jenis,
    tanggalMulai,
    tanggalSelesai,
    alasan,
    lampiran,
    status,
    catatan,
    diajukan: waktu(status === 'Menunggu' ? hariIni : tambahHari(tanggalMulai, -2)),
    ...(status !== 'Menunggu' && { diprosesOleh: 'Kepala Sekolah', diproses: waktu(tambahHari(tanggalMulai, -1)) }),
  }))
}

const ALASAN_TERLAMBAT = ['Ban motor bocor di jalan.', 'Macet karena perbaikan jalan.', 'Mengantar anak ke sekolah lebih dulu.', 'Hujan deras sejak subuh.', '']
const DINAS_LUAR = ['Rapat KKG di gugus sekolah.', 'Pelatihan Kurikulum Merdeka di Dinas Pendidikan.', 'Rapat koordinasi di kantor yayasan.', 'Mendampingi siswa lomba tingkat kecamatan.']

// Presensi guru & staf contoh untuk 45 hari sekolah terakhir
function buatPresensiStafContoh(guru, izinStaf) {
  const hasil = {}
  for (const tanggal of hariSekolahSebelum(45)) {
    hasil[tanggal] = {}
    for (const g of guru) {
      const jam = jamKerja(g)
      const n = hashTeks(g.id + tanggal + 'presensi') % 100
      const h = hashTeks(tanggal + g.id, 997)
      // Sesekali lupa absen pulang
      const pulang = h % 29 === 0 ? null : dariMenit(keMenit(jam.pulang) + (h % 70))
      const kosong = { masuk: null, pulang: null }
      if (n < 83) hasil[tanggal][g.id] = { status: 'H', masuk: dariMenit(keMenit(jam.masuk) - 3 - (h % 32)), pulang }
      else if (n < 91) hasil[tanggal][g.id] = { status: 'H', masuk: dariMenit(keMenit(jam.masuk) + 1 + (h % 24)), pulang, alasanMasuk: ALASAN_TERLAMBAT[h % ALASAN_TERLAMBAT.length] }
      else if (n < 94) hasil[tanggal][g.id] = { status: 'D', ...kosong, ket: DINAS_LUAR[h % DINAS_LUAR.length] }
      else if (n < 97) hasil[tanggal][g.id] = { status: 'S', ...kosong, ket: 'Sakit, surat keterangan dokter menyusul.' }
      else if (n < 99) hasil[tanggal][g.id] = { status: 'I', ...kosong, ket: 'Keperluan keluarga mendesak.' }
      else hasil[tanggal][g.id] = { status: 'A', ...kosong }
    }
  }
  // Hari ini sebagian staf tanpa akun demo sudah absen; akun demo dibiarkan kosong agar bisa dicoba
  const hariIni = todayKey()
  if (isHariSekolah(new Date())) {
    hasil[hariIni] = {}
    for (const [id, masuk] of [['g4', '06.31'], ['g6', '06.38']]) {
      if (guru.some((g) => g.id === id) && jamSekarang() >= masuk) hasil[hariIni][id] = { status: 'H', masuk, pulang: null }
    }
  }
  for (const iz of izinStaf.filter((i) => i.status === 'Disetujui')) {
    for (const tgl of rentangHariSekolah(iz.tanggalMulai, iz.tanggalSelesai)) {
      hasil[tgl] = { ...hasil[tgl], [iz.guruId]: { masuk: null, pulang: null, status: KODE_IZIN_STAF[iz.jenis], ket: iz.alasan, izinId: iz.id } }
    }
  }
  return hasil
}

function dataAwal() {
  const hariIni = todayKey()
  const [kemarin, , , lalu] = hariSekolahSebelum(4)
  const izinStaf = buatIzinStafContoh(hariIni)
  return {
    izinStaf,
    presensiStaf: buatPresensiStafContoh(GURU_AWAL, izinStaf),
    // Sesi presensi OTP yang dibuka guru, dan jejak siapa/bagaimana kehadiran siswa dicatat:
    // jejakAbsensi = { 'YYYY-MM-DD': { nis: { cara: 'otp'|'guru'|'izin', jam, oleh?, sebelum? } } }
    sesiPresensi: [],
    jejakAbsensi: {},
    tugas: TUGAS_AWAL,
    nilai: buatNilaiContoh(SISWA_AWAL),
    sikap: buatSikapContoh(SISWA_AWAL),
    pesan: buatPesanContoh(),
    ekskul: buatEkskulContoh(SISWA_AWAL),
    catatanWali: {}, // { nis: teks } — jika kosong dipakai catatan bawaan
    // Pesanan buku dari siswa, diproses pustakawan menjadi peminjaman
    reservasi: [{ id: 'rv1', nis: '230403', bukuId: 'b9', tanggal: kemarin, status: 'Menunggu' }],
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
    localStorage.removeItem('sdhg-data-v2')
    const tersimpan = JSON.parse(localStorage.getItem(STORAGE_KEY))
    // Gabung dengan data awal agar koleksi baru tetap ada untuk data lama yang tersimpan
    if (tersimpan) {
      // Guru/staf milik akun demo yang belum ada di data lama (mis. jabatan yang baru ditambahkan)
      const idAkun = AKUN_DEMO.map((a) => a.guruId).filter(Boolean)
      const kurang = GURU_AWAL.filter((g) => idAkun.includes(g.id) && !tersimpan.guru?.some((x) => x.id === g.id))
      // Sekolah terbuka untuk semua agama: mapel "Pendidikan Agama Islam" kini "Pendidikan Agama"
      const guru = (tersimpan.guru ? [...tersimpan.guru, ...kurang] : GURU_AWAL).map((g) =>
        g.mapel === 'Pendidikan Agama Islam' ? { ...g, mapel: 'Pendidikan Agama' } : g,
      )
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

  // Sinkron antartab: mis. guru membuka presensi di satu tab, siswa mengisi kode di tab lain
  useEffect(() => {
    const dengar = (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      try {
        setData(JSON.parse(e.newValue))
      } catch {
        /* abaikan data rusak */
      }
    }
    window.addEventListener('storage', dengar)
    return () => window.removeEventListener('storage', dengar)
  }, [])

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
      const jejakAbsensi = { ...d.jejakAbsensi }
      if (status === 'Disetujui') {
        const kode = izin.jenis === 'Sakit' ? 'S' : 'I'
        for (const tgl of rentangHariSekolah(izin.tanggalMulai, izin.tanggalSelesai)) {
          absensi[tgl] = { ...absensi[tgl], [izin.nis]: kode }
          jejakAbsensi[tgl] = { ...jejakAbsensi[tgl], [izin.nis]: { cara: 'izin', jam: jamSekarang() } }
        }
      }
      return {
        ...d,
        absensi,
        jejakAbsensi,
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

  // Simpan nilai satu mapel milik satu siswa, mis. { tugas: [80, 85, 90], pts: 88, pas: null }
  const simpanNilai = (nis, kode, nilaiBaru) =>
    setData((d) => ({ ...d, nilai: { ...d.nilai, [nis]: { ...d.nilai[nis], [kode]: { ...d.nilai[nis]?.[kode], ...nilaiBaru } } } }))

  const simpanCatatanWali = (nis, teks) => setData((d) => ({ ...d, catatanWali: { ...d.catatanWali, [nis]: teks } }))

  const kirimPesan = ({ nis, dari, pengirim, isi }) =>
    tambah('pesan', { nis, dari, pengirim, isi, waktu: new Date().toISOString(), dibacaOrtu: dari === 'ortu', dibacaGuru: dari === 'guru' })

  // Tandai semua pesan satu siswa sudah dibaca oleh pihak 'ortu' atau 'guru'
  const bacaPesan = (nis, pihak) => {
    const kunci = pihak === 'ortu' ? 'dibacaOrtu' : 'dibacaGuru'
    setData((d) =>
      d.pesan.some((p) => p.nis === nis && !p[kunci])
        ? { ...d, pesan: d.pesan.map((p) => (p.nis === nis ? { ...p, [kunci]: true } : p)) }
        : d,
    )
  }

  const toggleEkskul = (nis, id) =>
    setData((d) => {
      const milik = d.ekskul[nis] ?? []
      return { ...d, ekskul: { ...d.ekskul, [nis]: milik.includes(id) ? milik.filter((x) => x !== id) : [...milik, id] } }
    })

  // Presensi guru & staf: catat jam masuk/pulang hari ini.
  // `alasan` diisi saat terlambat atau pulang sebelum jam kerja selesai.
  const absenStaf = (guruId, jenis, alasan = '') =>
    setData((d) => {
      const tgl = todayKey()
      const lama = d.presensiStaf[tgl]?.[guruId] ?? { status: 'H', masuk: null, pulang: null }
      const baru = jenis === 'masuk' ? { ...lama, status: 'H', masuk: jamSekarang(), alasanMasuk: alasan } : { ...lama, pulang: jamSekarang(), alasanPulang: alasan }
      return { ...d, presensiStaf: { ...d.presensiStaf, [tgl]: { ...d.presensiStaf[tgl], [guruId]: baru } } }
    })

  // Koreksi oleh Kepala Sekolah. Jejaknya (siapa, kapan, alasan, data sebelumnya) disimpan
  // dan terlihat oleh semua staf agar tetap transparan.
  const koreksiPresensi = (tanggal, guruId, perubahan, oleh, alasan) =>
    setData((d) => {
      const lama = d.presensiStaf[tanggal]?.[guruId]
      const sebelum = lama ? { status: lama.status, masuk: lama.masuk, pulang: lama.pulang } : null
      const baru = { ...lama, ...perubahan, koreksi: [...(lama?.koreksi ?? []), { oleh, alasan, sebelum, waktu: new Date().toISOString() }] }
      return { ...d, presensiStaf: { ...d.presensiStaf, [tanggal]: { ...d.presensiStaf[tanggal], [guruId]: baru } } }
    })

  const ajukanIzinStaf = (izin) => tambah('izinStaf', { ...izin, status: 'Menunggu', diajukan: new Date().toISOString() })

  // Izin staf yang disetujui otomatis tercatat di presensi pada rentang tanggalnya
  const prosesIzinStaf = (id, status, catatan, oleh) =>
    setData((d) => {
      const izin = d.izinStaf.find((x) => x.id === id)
      const presensiStaf = { ...d.presensiStaf }
      if (status === 'Disetujui') {
        for (const tgl of rentangHariSekolah(izin.tanggalMulai, izin.tanggalSelesai)) {
          const lama = presensiStaf[tgl]?.[izin.guruId]
          presensiStaf[tgl] = { ...presensiStaf[tgl], [izin.guruId]: { masuk: null, pulang: null, ...lama, status: KODE_IZIN_STAF[izin.jenis], ket: izin.alasan, izinId: id } }
        }
      }
      return {
        ...d,
        presensiStaf,
        izinStaf: d.izinStaf.map((x) => (x.id === id ? { ...x, status, catatan, diprosesOleh: oleh, diproses: new Date().toISOString() } : x)),
      }
    })

  // ===== Presensi siswa dengan OTP =====

  // Guru membuka sesi baru untuk satu kelas; sesi lama kelas itu hari ini otomatis ditutup
  const bukaSesiPresensi = (kelas, guru) => {
    const mulai = new Date()
    const sesi = {
      id: uid(),
      kelas,
      tanggal: todayKey(),
      kode: buatKodeOtp(),
      mulai: mulai.toISOString(),
      berakhir: new Date(mulai.getTime() + MASA_BERLAKU_MENIT * 60000).toISOString(),
      oleh: guru.nama,
      guruId: guru.id ?? null,
      ditutup: false,
      gagal: {}, // { nis: jumlah percobaan salah }
    }
    setData((d) => ({
      ...d,
      sesiPresensi: [
        sesi,
        ...d.sesiPresensi.map((s) => (s.kelas === kelas && s.tanggal === sesi.tanggal && !s.ditutup ? { ...s, ditutup: true, berakhir: s.berakhir < sesi.mulai ? s.berakhir : sesi.mulai } : s)),
      ],
    }))
    return sesi
  }

  const tutupSesiPresensi = (id) =>
    setData((d) => ({ ...d, sesiPresensi: d.sesiPresensi.map((s) => (s.id === id ? { ...s, ditutup: true, berakhir: new Date().toISOString() } : s)) }))

  /*
    Siswa memasukkan kode. Hasil: { ok, alasan, jam, sisa }
    alasan: 'sudah' | 'tidak-ada' | 'kedaluwarsa' | 'terkunci' | 'salah'
  */
  const isiPresensiOtp = (nis, kelas, kode) => {
    const tgl = todayKey()
    const jam = jamSekarang()
    if (data.absensi[tgl]?.[nis] === 'H') return { ok: false, alasan: 'sudah', jam: data.jejakAbsensi[tgl]?.[nis]?.jam }
    const sesiHariIni = data.sesiPresensi.filter((s) => s.kelas === kelas && s.tanggal === tgl)
    const aktif = sesiHariIni.find((s) => sesiBerlaku(s))
    if (!aktif) return { ok: false, alasan: sesiHariIni.some((s) => s.kode === kode) ? 'kedaluwarsa' : 'tidak-ada' }
    const gagal = aktif.gagal?.[nis] ?? 0
    if (gagal >= MAKS_PERCOBAAN) return { ok: false, alasan: 'terkunci' }
    if (aktif.kode !== kode) {
      setData((d) => ({ ...d, sesiPresensi: d.sesiPresensi.map((s) => (s.id === aktif.id ? { ...s, gagal: { ...s.gagal, [nis]: gagal + 1 } } : s)) }))
      return { ok: false, alasan: gagal + 1 >= MAKS_PERCOBAAN ? 'terkunci' : 'salah', sisa: MAKS_PERCOBAAN - gagal - 1 }
    }
    setData((d) => {
      const sebelum = d.absensi[tgl]?.[nis]
      return {
        ...d,
        absensi: { ...d.absensi, [tgl]: { ...d.absensi[tgl], [nis]: 'H' } },
        jejakAbsensi: { ...d.jejakAbsensi, [tgl]: { ...d.jejakAbsensi[tgl], [nis]: { cara: 'otp', jam, sesiId: aktif.id, ...(sebelum && { sebelum }) } } },
      }
    })
    return { ok: true, jam }
  }

  // Guru mengubah kehadiran siswa ({ nis: 'H'|'S'|'I'|'A' }); jejak perubahan disimpan
  const ubahAbsensiSiswa = (tanggal, perubahan, oleh) =>
    setData((d) => {
      const jam = jamSekarang()
      const absensi = { ...d.absensi[tanggal] }
      const jejak = { ...d.jejakAbsensi[tanggal] }
      for (const [nis, kode] of Object.entries(perubahan)) {
        if (absensi[nis] === kode) continue
        jejak[nis] = { cara: 'guru', jam, oleh, ...(absensi[nis] && { sebelum: absensi[nis] }), ...(jejak[nis]?.cara === 'otp' && { otp: jejak[nis].jam }) }
        absensi[nis] = kode
      }
      return { ...d, absensi: { ...d.absensi, [tanggal]: absensi }, jejakAbsensi: { ...d.jejakAbsensi, [tanggal]: jejak } }
    })

  const resetData = () => setData(dataAwal())

  return (
    <DataContext.Provider
      value={{
        data,
        tambah,
        ubah,
        hapus,
        simpanAbsensi,
        ajukanIzin,
        prosesIzin,
        toggleTugas,
        selesaikanTransaksi,
        catatTunai,
        simpanNilai,
        simpanCatatanWali,
        kirimPesan,
        bacaPesan,
        toggleEkskul,
        absenStaf,
        koreksiPresensi,
        ajukanIzinStaf,
        prosesIzinStaf,
        bukaSesiPresensi,
        tutupSesiPresensi,
        isiPresensiOtp,
        ubahAbsensiSiswa,
        resetData,
      }}
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
