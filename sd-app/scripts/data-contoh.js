/*
  Data contoh sekolah untuk seeder Laravel. Website tidak memakai berkas ini lagi: semua data
  tersimpan di MySQL. Jalankan `npm run ekspor-laravel` untuk menulis ulang data contoh (tanggal
  relatif terhadap hari ini) dan data acuan ke folder Laravel, lalu `php artisan db:seed`.
*/
import {
  BIODATA,
  BUKU_AWAL,
  EKSKUL,
  GURU_AWAL,
  INVENTARIS_AWAL,
  PENGUMUMAN_AWAL,
  SIKAP,
  SISWA_AWAL,
  SPP,
  TUGAS_AWAL,
} from '../src/data/dummy'
import { angkaKelas, mapelRapor } from '../src/utils/nilai'
import { ekskulBentrok } from '../src/utils/ekskul'
import { hariSekolahSebelum, isHariSekolah, jamSekarang, parseKey, rentangHariSekolah, tambahHari, todayKey, uid } from '../src/utils/format'
import { KODE_IZIN_STAF, dariMenit, jamKerja, keMenit } from '../src/utils/presensi'
import { pelajaranHari } from '../src/utils/jadwal'
import { bulanIni } from '../src/utils/spp'
import { ID_GRUP_STAF, anggota, idGrupKelas, idGrupOrtu, idGuru, idOrtu, idPribadi, idSiswa } from '../src/utils/chat'

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

// Kehadiran per pelajaran contoh. Hanya pengecualian yang disimpan: siswa yang hadir hari itu
// tetapi izin (ke UKS, dijemput lebih awal) atau tidak masuk di satu pelajaran. Sisanya ikut harian.
function buatAbsensiMapelContoh(siswa, absensi) {
  const hasil = {}
  for (const [tanggal, harian] of Object.entries(absensi)) {
    for (const s of siswa) {
      if (harian[s.nis] !== 'H') continue
      for (const p of pelajaranHari(s.kelas, tanggal)) {
        const n = hashTeks(s.nis + tanggal + p.kunci) % 100
        if (n >= 3) continue
        hasil[tanggal] ??= {}
        hasil[tanggal][s.nis] = { ...hasil[tanggal][s.nis], [p.kunci]: n < 1 ? 'A' : 'I' }
      }
    }
  }
  return hasil
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
    const wajib = EKSKUL.filter((e) => e.wajib && angkaKelas(s.kelas) >= e.minKelas)
    const h = hashTeks(s.nis + 'ekskul')
    // 1–2 ekskul pilihan yang jadwalnya tidak bentrok
    const dipilih = []
    for (const e of [pilihan[h % pilihan.length], pilihan[(h >> 3) % pilihan.length]].slice(0, 1 + (h % 2))) {
      if (!dipilih.includes(e) && !ekskulBentrok(e, [...wajib, ...dipilih])) dipilih.push(e)
    }
    hasil[s.nis] = dipilih.map((e) => e.id)
  }
  return hasil
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

export function dataAwal() {
  const hariIni = todayKey()
  const [kemarin, , , lalu] = hariSekolahSebelum(4)
  const izinStaf = buatIzinStafContoh(hariIni)
  const absensi = buatAbsensiContoh(SISWA_AWAL)
  return {
    izinStaf,
    presensiStaf: buatPresensiStafContoh(GURU_AWAL, izinStaf),
    // Sesi presensi OTP yang dibuka guru, dan jejak siapa/bagaimana kehadiran siswa dicatat:
    // jejakAbsensi = { 'YYYY-MM-DD': { nis: { cara: 'otp'|'guru'|'izin', jam, oleh?, sebelum? } } }
    sesiPresensi: [],
    jejakAbsensi: {},
    // Kehadiran per pelajaran yang dicatat guru pengampu (lihat src/utils/jadwal.js) beserta jejaknya:
    // jejakMapel = { 'YYYY-MM-DD': { nis: { kunci: { cara, jam, oleh?, sebelum? } } } }
    absensiMapel: buatAbsensiMapelContoh(SISWA_AWAL, absensi),
    jejakMapel: {},
    tugas: TUGAS_AWAL,
    nilai: buatNilaiContoh(SISWA_AWAL),
    sikap: buatSikapContoh(SISWA_AWAL),
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
    absensi,
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

const lalu = (hari, jam, menit = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - hari)
  d.setHours(jam, menit, 0, 0)
  return d.toISOString()
}

// Percakapan contoh + pesan lama dari fitur "Pesan Wali Kelas" (data.pesan) agar tidak hilang
export function buatChatContoh(data) {
  const wali = (kelas) => data.guru.find((g) => g.peran?.includes('wali_kelas') && g.kelas === kelas)
  const kelasDari = (nis) => data.siswa.find((s) => s.nis === nis)?.kelas
  const kepsek = data.guru.find((g) => g.jabatan === 'Kepala Sekolah')
  const pesan = {}
  const dibaca = {}
  const tambah = (pid, dari, waktu, teks) => (pesan[pid] ??= []).push({ id: uid(), dari, waktu, teks })

  // Pesan wali kelas lama: dari data tersimpan bila ada, selain itu contoh bawaan
  const lama = data.pesan ?? [
    { nis: '230401', dari: 'guru', isi: 'Selamat pagi Bu Dewi. Rafa hari ini aktif sekali saat diskusi IPAS tentang siklus air. 👍', waktu: lalu(3, 9, 15), dibacaOrtu: true, dibacaGuru: true },
    { nis: '230401', dari: 'ortu', isi: 'Terima kasih infonya, Pak Andi. Di rumah dia juga semangat bercerita soal itu.', waktu: lalu(3, 12, 15), dibacaOrtu: true, dibacaGuru: true },
    { nis: '230401', dari: 'ortu', isi: 'Pak, minggu depan ada field trip ke Museum Nasional ya? Apakah anak perlu membawa bekal sendiri?', waktu: lalu(1, 19, 15), dibacaOrtu: true, dibacaGuru: true },
    { nis: '230401', dari: 'guru', isi: 'Betul, Bu. Mohon dibawakan bekal makan siang dan botol minum. Formulir persetujuannya dikumpulkan paling lambat 16 Oktober ya.', waktu: lalu(0, 7, 15), dibacaOrtu: false, dibacaGuru: true },
    { nis: '230405', dari: 'ortu', isi: 'Selamat pagi Pak, Dimas sudah sembuh dan besok masuk sekolah. Apakah ada tugas yang perlu dikejar?', waktu: lalu(0, 6, 15), dibacaOrtu: true, dibacaGuru: false },
  ]
  const terbaca = [] // [pid, id pembaca, waktu] untuk pesan lama yang sudah dibaca
  for (const p of [...lama].sort((a, b) => a.waktu.localeCompare(b.waktu))) {
    const w = wali(kelasDari(p.nis))
    if (!w) continue
    const [o, g] = [idOrtu(p.nis), idGuru(w.id)]
    const pid = idPribadi(o, g)
    tambah(pid, p.dari === 'guru' ? g : o, p.waktu, p.isi)
    if (p.dibacaOrtu) terbaca.push([pid, o, p.waktu])
    if (p.dibacaGuru) terbaca.push([pid, g, p.waktu])
  }

  const andi = wali('4A')
  const maria = data.guru.find((g) => g.nama.startsWith('Maria Natalia'))
  const tu = data.guru.find((g) => g.peran?.includes('tata_usaha'))
  const rina = wali('1A')
  if (andi) {
    const k = idGrupKelas('4A')
    tambah(k, idGuru(andi.id), lalu(2, 7, 10), 'Selamat pagi anak-anak kelas 4A! 🌞 Besok jangan lupa membawa buku gambar untuk pelajaran Seni Budaya ya.')
    tambah(k, idSiswa('230401'), lalu(2, 7, 25), 'Baik, Pak! Krayon juga dibawa, Pak?')
    tambah(k, idGuru(andi.id), lalu(2, 7, 31), 'Boleh, Rafa. Krayon atau pensil warna, dua-duanya boleh.')
    if (maria) tambah(k, idGuru(maria.id), lalu(1, 13, 5), 'Good afternoon, class 4A! Untuk Bahasa Inggris, hafalkan 10 kosakata tentang hewan ya. See you! 🐘🦒')
    tambah(k, idSiswa('230402'), lalu(1, 15, 40), 'Siap, Miss Maria! 😊')

    const o = idGrupOrtu('4A')
    tambah(o, idGuru(andi.id), lalu(2, 16, 0), 'Selamat sore Bapak/Ibu. Rapat orang tua kelas 4A diadakan Sabtu depan pukul 09.00 di ruang kelas 4A. Mohon kehadirannya 🙏')
    tambah(o, idOrtu('230402'), lalu(2, 16, 20), 'Baik, Pak. Terima kasih infonya.')
    tambah(o, idOrtu('230401'), lalu(2, 18, 45), 'Siap hadir, Pak Andi.')
    if (maria) {
      const pid = idPribadi(idGuru(andi.id), idGuru(maria.id))
      tambah(pid, idGuru(andi.id), lalu(1, 10, 2), 'Miss Maria, minggu ini ada pengambilan nilai speaking untuk kelas 4A?')
      tambah(pid, idGuru(maria.id), lalu(1, 10, 9), 'Iya, Pak. Hari Selasa di jam pelajaran saya. Nanti nilainya langsung saya input.')
    }
  }
  if (kepsek) tambah(ID_GRUP_STAF, idGuru(kepsek.id), lalu(1, 12, 30), 'Bapak/Ibu, rapat evaluasi tengah semester hari Jumat pukul 13.00 di ruang guru. Mohon membawa rekap nilai PTS kelas masing-masing.')
  if (tu) tambah(ID_GRUP_STAF, idGuru(tu.id), lalu(1, 14, 5), 'Info: pembayaran SPP bulan ini sudah masuk 82%. Rekap lengkap ada di menu Keuangan SPP.')
  if (rina) tambah(ID_GRUP_STAF, idGuru(rina.id), lalu(0, 7, 5), 'Baik, Bu. Rekap nilai kelas 1A sudah siap.')

  // Pesan grup contoh dianggap sudah dibaca, kecuali pesan terakhir bagi akun demo agar notifikasinya terlihat
  const tandai = (pid, siapa, waktu) => ((dibaca[siapa] ??= {})[pid] = waktu)
  for (const [pid, daftar] of Object.entries(pesan)) {
    if (!pid.startsWith('grup:')) continue
    const terakhir = daftar.at(-1).waktu
    const sebelum = daftar.at(-2)?.waktu ?? terakhir
    for (const a of anggota(data, pid)) tandai(pid, a, ['g:g2', 's:230401', 'o:230401'].includes(a) ? sebelum : terakhir)
  }
  for (const [pid, siapa, waktu] of terbaca) if ((dibaca[siapa]?.[pid] ?? '') < waktu) tandai(pid, siapa, waktu)
  // Pengirim pasti sudah membaca percakapan sampai pesannya sendiri
  for (const [pid, daftar] of Object.entries(pesan)) for (const p of daftar) if ((dibaca[p.dari]?.[pid] ?? '') < p.waktu) tandai(pid, p.dari, p.waktu)
  return { pesan, dibaca, pengaturan: {} }
}
