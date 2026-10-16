/*
  Menulis data acuan & data contoh website ke proyek Laravel:
    resources/data/referensi.json         jadwal, mapel, ekskul, SPP, dll. (dipakai server untuk memeriksa isian)
    database/seeders/data/contoh.json     data contoh sekolah (siswa, absensi, nilai, SPP, chat, ...)

  Pemakaian:  npm run ekspor-laravel [-- <folder Laravel>]      (bawaan: ../laravel di samping sd-app, atau LARAVEL_DIR)
  Jalankan ulang setelah mengubah data acuan di src/data/dummy.js. Data contoh memakai tanggal relatif
  terhadap hari ini; seeder hanya mengisi tabel yang masih kosong.
*/
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const laravel = resolve(process.argv[2] ?? process.env.LARAVEL_DIR ?? fileURLToPath(new URL('../../laravel', import.meta.url)))
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true, include: [] },
  ssr: { noExternal: ['react-router-dom', 'react-router'], resolve: { conditions: ['module-sync', 'node', 'import', 'module', 'default'] } },
})

const tulis = (relatif, isi) => {
  const berkas = join(laravel, relatif)
  mkdirSync(dirname(berkas), { recursive: true })
  writeFileSync(berkas, JSON.stringify(isi, null, 1) + '\n')
  console.log(`✔ ${berkas}`)
}

try {
  const d = await vite.ssrLoadModule('/src/data/dummy.js')
  const { STATUS_PPDB } = await vite.ssrLoadModule('/src/components/Ppdb.jsx')
  const { STATUS_KUNJUNGAN } = await vite.ssrLoadModule('/src/components/Fasilitas.jsx')
  const { MASA_BERLAKU_MENIT, MAKS_PERCOBAAN } = await vite.ssrLoadModule('/src/utils/otp.js')
  const { dataAwal, buatChatContoh } = await vite.ssrLoadModule('/scripts/data-contoh.js')

  tulis('resources/data/referensi.json', {
    kelas: d.KELAS,
    hariSekolah: d.HARI_SEKOLAH,
    sesi: d.SESI,
    jadwal: d.JADWAL,
    // Pengampu tiap mapel tersimpan di data guru (mapel diampu); `pengampu` hanya label mapel bersama (upacara, pramuka)
    mapel: Object.fromEntries(Object.entries(d.MAPEL).map(([k, m]) => [k, { nama: m.nama, absensi: m.absensi !== false, ...(m.pengampu && { pengampu: m.pengampu }) }])),
    mapelRapor: d.MAPEL_RAPOR,
    jamKerja: d.JAM_KERJA,
    ekskul: d.EKSKUL.map(({ id, nama, minKelas, wajib = false, hari, jam }) => ({ id, nama, minKelas, wajib, hari, jam })),
    sikap: [...d.SIKAP.positif, ...d.SIKAP.perbaikan].map(({ kode, label, poin }) => ({ kode, label, poin })),
    spp: d.SPP,
    bankVa: d.BANK_VA,
    kunjungan: { ...d.KUNJUNGAN, status: Object.keys(STATUS_KUNJUNGAN) },
    fasilitas: d.FASILITAS.map((f) => f.id),
    ppdb: {
      tahunAjaran: d.PPDB.tahunAjaran,
      tanggalAcuanUsia: d.PPDB.tanggalAcuanUsia,
      usiaMinimal: d.PPDB.usiaMinimal,
      jalur: d.PPDB.jalur.map((j) => j.nama),
      agama: d.PPDB.agama,
      berkas: d.PPDB.berkas,
      status: Object.keys(STATUS_PPDB),
    },
    otp: { masaBerlakuMenit: MASA_BERLAKU_MENIT, maksPercobaan: MAKS_PERCOBAAN },
    pilihan: {
      kategoriPengumuman: d.KATEGORI_PENGUMUMAN,
      kategoriBarang: d.KATEGORI_BARANG,
      kondisiBarang: d.KONDISI_BARANG,
      lokasi: d.LOKASI_SEKOLAH,
      statusKerusakan: d.STATUS_KERUSAKAN,
      kategoriKonseling: d.KATEGORI_KONSELING,
      layananKonseling: d.LAYANAN_KONSELING,
      statusKonseling: d.STATUS_KONSELING,
      jenisIzinStaf: d.JENIS_IZIN_STAF,
      keperluanTamu: d.KEPERLUAN_TAMU,
    },
  })

  const data = dataAwal()
  const { pesan, dibaca, pengaturan } = buatChatContoh(data)
  // Guru & akun sudah punya seeder sendiri (guru.json, akun-demo.json)
  delete data.guru
  tulis('database/seeders/data/contoh.json', { dibuat: new Date().toISOString(), ...data, chat: { pesan, dibaca, pengaturan } })
} finally {
  await vite.close()
}
