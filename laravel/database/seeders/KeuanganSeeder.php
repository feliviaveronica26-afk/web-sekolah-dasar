<?php

namespace Database\Seeders;

use App\Models\TransaksiKas;
use Illuminate\Database\Seeder;

/*
  Contoh buku kas semester ganjil 2026/2027 (Juli – Oktober 2026). Hanya diisi jika tabel masih
  kosong, dan transaksi bertanggal setelah hari ini dilewati. Pembayaran SPP tidak ada di sini
  karena website menghitungnya otomatis dari data SPP.
*/
class KeuanganSeeder extends Seeder
{
    private const PENCATAT = 'Sri Handayani, S.E.';

    public function run(): void
    {
        if (TransaksiKas::exists()) {
            return;
        }

        $hariIni = now('Asia/Jakarta')->toDateString();
        $nomor = [];

        foreach ($this->daftar() as [$tanggal, $jenis, $kategori, $uraian, $jumlah, $metode]) {
            if ($tanggal > $hariIni) {
                continue;
            }
            // Nomor bukti kas: BKM (bukti kas masuk) / BKK (bukti kas keluar), urut per bulan
            $kode = ($jenis === 'masuk' ? 'BKM' : 'BKK').'-'.substr($tanggal, 0, 7);
            $nomor[$kode] = ($nomor[$kode] ?? 0) + 1;

            $transaksi = new TransaksiKas([
                'tanggal' => $tanggal,
                'jenis' => $jenis,
                'kategori' => $kategori,
                'uraian' => $uraian,
                'jumlah' => $jumlah,
                'metode' => $metode,
                'bukti' => sprintf('%s-%03d', $kode, $nomor[$kode]),
            ]);
            $transaksi->pencatat = self::PENCATAT;
            $transaksi->save();
        }
    }

    private function daftar(): array
    {
        $listrik = 'Listrik, Air & Internet';
        $gaji = 'Gaji & Honor';
        $atk = 'Buku, ATK & Bahan Ajar';
        $tf = 'Transfer Bank';

        return [
            // Juli 2026 — awal tahun ajaran
            ['2026-07-01', 'masuk', 'Saldo Awal', 'Sisa kas tahun ajaran 2025/2026', 85_400_000, $tf],
            ['2026-07-02', 'masuk', 'Sewa Kantin', 'Sewa kantin sekolah bulan Juli 2026', 2_500_000, $tf],
            ['2026-07-03', 'keluar', $atk, 'Buku paket & ATK awal tahun ajaran', 18_750_000, $tf],
            ['2026-07-06', 'keluar', $listrik, 'Tagihan listrik PLN bulan Juni', 6_850_000, $tf],
            ['2026-07-06', 'keluar', $listrik, 'Tagihan air PDAM bulan Juni', 1_250_000, $tf],
            ['2026-07-07', 'keluar', $listrik, 'Internet sekolah 100 Mbps bulan Juli', 2_500_000, $tf],
            ['2026-07-13', 'keluar', 'Kegiatan Siswa', 'Masa Pengenalan Lingkungan Sekolah (MPLS) kelas 1', 5_500_000, 'Tunai'],
            ['2026-07-18', 'keluar', 'Rapat & Konsumsi', 'Konsumsi rapat orang tua awal tahun ajaran', 4_200_000, 'Tunai'],
            ['2026-07-25', 'keluar', $gaji, 'Gaji guru & staf bulan Juli 2026', 112_500_000, $tf],
            ['2026-07-25', 'keluar', $gaji, 'Honor petugas kebersihan bulan Juli', 3_600_000, 'Tunai'],

            // Agustus 2026
            ['2026-08-03', 'masuk', 'Sewa Kantin', 'Sewa kantin sekolah bulan Agustus 2026', 2_500_000, $tf],
            ['2026-08-05', 'keluar', $listrik, 'Tagihan listrik PLN bulan Juli', 7_120_000, $tf],
            ['2026-08-05', 'keluar', $listrik, 'Tagihan air PDAM bulan Juli', 1_310_000, $tf],
            ['2026-08-06', 'keluar', $listrik, 'Internet sekolah 100 Mbps bulan Agustus', 2_500_000, $tf],
            ['2026-08-10', 'masuk', 'Sumbangan & Donasi', 'Sumbangan komite sekolah untuk peringatan HUT RI', 3_000_000, 'Tunai'],
            ['2026-08-12', 'keluar', 'Perawatan & Perbaikan', 'Servis rutin AC 12 ruang kelas', 4_800_000, 'Tunai'],
            ['2026-08-17', 'keluar', 'Kegiatan Siswa', 'Lomba & upacara HUT ke-81 RI', 6_200_000, 'Tunai'],
            ['2026-08-20', 'masuk', 'Dana BOS', 'Dana BOS Reguler tahap II tahun 2026', 228_960_000, $tf],
            ['2026-08-21', 'keluar', $atk, 'Kertas, tinta printer & spidol', 1_500_000, 'Tunai'],
            ['2026-08-25', 'keluar', $gaji, 'Gaji guru & staf bulan Agustus 2026', 112_500_000, $tf],
            ['2026-08-25', 'keluar', $gaji, 'Honor petugas kebersihan bulan Agustus', 3_600_000, 'Tunai'],

            // September 2026
            ['2026-09-02', 'masuk', 'Sewa Kantin', 'Sewa kantin sekolah bulan September 2026', 2_500_000, $tf],
            ['2026-09-04', 'keluar', $listrik, 'Tagihan listrik PLN bulan Agustus', 6_980_000, $tf],
            ['2026-09-04', 'keluar', $listrik, 'Tagihan air PDAM bulan Agustus', 1_280_000, $tf],
            ['2026-09-04', 'keluar', $listrik, 'Internet sekolah 100 Mbps bulan September', 2_500_000, $tf],
            ['2026-09-09', 'keluar', 'Kegiatan Siswa', 'Pendaftaran Lomba Robotik Tingkat Provinsi', 2_500_000, $tf],
            ['2026-09-11', 'masuk', 'Sumbangan & Donasi', 'Donasi alumni untuk pengadaan buku perpustakaan', 5_000_000, $tf],
            ['2026-09-16', 'keluar', $atk, 'Buku bacaan perpustakaan (65 judul)', 4_750_000, $tf],
            ['2026-09-19', 'keluar', 'Perawatan & Perbaikan', 'Pengecatan ulang pagar & gerbang utama', 7_500_000, 'Tunai'],
            ['2026-09-24', 'keluar', 'Rapat & Konsumsi', 'Konsumsi rapat evaluasi bulanan guru', 950_000, 'Tunai'],
            ['2026-09-25', 'keluar', $gaji, 'Gaji guru & staf bulan September 2026', 112_500_000, $tf],
            ['2026-09-25', 'keluar', $gaji, 'Honor petugas kebersihan bulan September', 3_600_000, 'Tunai'],
            ['2026-09-28', 'keluar', $atk, 'Kertas & tinta untuk Penilaian Tengah Semester', 1_800_000, 'Tunai'],

            // Oktober 2026
            ['2026-10-02', 'masuk', 'Sewa Kantin', 'Sewa kantin sekolah bulan Oktober 2026', 2_500_000, $tf],
            ['2026-10-05', 'keluar', $listrik, 'Tagihan listrik PLN bulan September', 6_910_000, $tf],
            ['2026-10-05', 'keluar', $listrik, 'Tagihan air PDAM bulan September', 1_270_000, $tf],
            ['2026-10-05', 'keluar', $listrik, 'Internet sekolah 100 Mbps bulan Oktober', 2_500_000, $tf],
            ['2026-10-06', 'masuk', 'Uang Pangkal & Pendaftaran', 'Biaya pendaftaran PPDB 2027/2028 (3 pendaftar)', 750_000, $tf],
            ['2026-10-08', 'keluar', 'Kegiatan Siswa', 'Transportasi & konsumsi tim Lomba Robotik', 3_750_000, 'Tunai'],
            ['2026-10-10', 'keluar', 'Perawatan & Perbaikan', 'Perbaikan AC Lab Komputer', 1_850_000, 'Tunai'],
            ['2026-10-12', 'keluar', $atk, 'Spidol & kertas ulangan harian', 1_200_000, 'Tunai'],
        ];
    }
}
