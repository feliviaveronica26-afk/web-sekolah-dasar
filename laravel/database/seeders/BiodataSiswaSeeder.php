<?php

namespace Database\Seeders;

use App\Models\Siswa;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/*
  Biodata contoh siswa (fiktif): NISN, tempat & tanggal lahir sesuai usia kelasnya, agama, golongan
  darah, tanggal masuk, asal TK/sekolah, dan catatan kesehatan sebagian siswa. Nilainya tetap untuk
  NIS yang sama (diturunkan dari NIS), dan hanya kolom yang masih kosong yang diisi, jadi biodata
  yang sudah diisi lewat website tidak ditimpa.
*/
class BiodataSiswaSeeder extends Seeder
{
    // Siswa akun demo: biodata yang sama dengan contoh lama di website
    private const DEMO = [
        '230401' => [
            'nisn' => '0151234567', 'tempat_lahir' => 'Kota Harapan', 'tanggal_lahir' => '2016-05-14', 'agama' => 'Islam',
            'golongan_darah' => 'O', 'asal_sekolah' => 'TK Pertiwi', 'catatan_kesehatan' => 'Alergi kacang',
        ],
    ];

    private const KOTA_LAIN = ['Bandung', 'Bogor', 'Bekasi', 'Depok', 'Jakarta', 'Tangerang', 'Semarang', 'Surabaya', 'Yogyakarta', 'Medan', 'Palembang', 'Makassar'];

    private const TK = ['TK Pertiwi', 'TK Tunas Bangsa', 'TK Kasih Bunda', 'RA Al-Hidayah', 'PAUD Melati', 'TK Harapan Bunda', 'TK Bintang Kecil', 'TK Pelangi', 'RA Nurul Iman'];

    // [nilai, bobot]
    private const AGAMA = [['Islam', 78], ['Kristen', 9], ['Katolik', 6], ['Buddha', 4], ['Hindu', 2], ['Konghucu', 1]];

    private const GOLONGAN_DARAH = [['O', 37], ['B', 29], ['A', 26], ['AB', 8]];

    private const KESEHATAN = [
        'Alergi kacang', 'Alergi udang & makanan laut', 'Asma ringan, membawa inhaler', 'Berkacamata (rabun jauh)',
        'Mudah mimisan saat cuaca panas', 'Alergi debu', 'Tidak bisa minum susu sapi (intoleransi laktosa)',
    ];

    public function run(): void
    {
        $nisnDipakai = Siswa::whereNotNull('nisn')->pluck('nisn')->flip()->all();

        foreach (Siswa::orderBy('nis')->get() as $siswa) {
            $bio = self::DEMO[$siswa->nis] ?? $this->buat($siswa);
            $bio['tanggal_masuk'] ??= $this->tanggalMasuk($siswa);
            if (isset($nisnDipakai[$bio['nisn']])) {
                $bio['nisn'] = $this->nisnBebas($bio['nisn'], $nisnDipakai);
            }

            $isi = [];
            foreach ($bio as $kolom => $nilai) {
                if (in_array($siswa->getRawOriginal($kolom), [null, ''], true)) {
                    $isi[$kolom] = $nilai;
                }
            }
            if (isset($isi['nisn'])) {
                $nisnDipakai[$isi['nisn']] = true;
            }
            if ($isi) {
                DB::table('siswa')->where('id', $siswa->id)->update($isi);
            }
        }
    }

    private function buat(Siswa $siswa): array
    {
        $angka = fn (string $kunci, int $maks) => crc32($siswa->nis.'|'.$kunci) % $maks;
        $tingkat = (int) $siswa->kelas;
        // Kelas 1 tahun ajaran 2026/2027 lahir antara Januari 2019 dan Juni 2020, dan seterusnya
        $lahir = Carbon::create(2019 - ($tingkat - 1), 1, 1)->addDays($angka('lahir', 546));
        $pindahan = $tingkat > 1 && $angka('pindah', 100) < 6;

        return [
            'nisn' => '0'.$lahir->format('y').str_pad((string) $angka('nisn', 10_000_000), 7, '0', STR_PAD_LEFT),
            'tempat_lahir' => $angka('kota', 100) < 60 ? 'Kota Harapan' : self::KOTA_LAIN[$angka('kota-lain', count(self::KOTA_LAIN))],
            'tanggal_lahir' => $lahir->toDateString(),
            'agama' => $this->berbobot(self::AGAMA, $angka('agama', 100)),
            'golongan_darah' => $this->berbobot(self::GOLONGAN_DARAH, $angka('darah', 100)),
            // Siswa pindahan masuk di awal salah satu tahun ajaran berikutnya
            'tanggal_masuk' => $pindahan ? $this->awalTahunAjaran(2026 - $angka('masuk', $tingkat - 1)) : null,
            'asal_sekolah' => $pindahan
                ? 'SD Negeri '.(1 + $angka('sd', 9)).' '.self::KOTA_LAIN[$angka('kota-sd', count(self::KOTA_LAIN))]
                : ($angka('tk-ada', 100) < 90 ? self::TK[$angka('tk', count(self::TK))] : ''),
            'catatan_kesehatan' => $angka('sehat', 100) < 10 ? self::KESEHATAN[$angka('sehat-isi', count(self::KESEHATAN))] : '',
        ];
    }

    // Masuk kelas 1 di awal tahun ajaran sesuai tingkatnya sekarang
    private function tanggalMasuk(Siswa $siswa): string
    {
        return $this->awalTahunAjaran(2026 - ((int) $siswa->kelas - 1));
    }

    // Hari Senin pekan kedua Juli
    private function awalTahunAjaran(int $tahun): string
    {
        return Carbon::create($tahun, 7, 13)->startOfWeek(Carbon::MONDAY)->toDateString();
    }

    private function berbobot(array $pilihan, int $angka): string
    {
        foreach ($pilihan as [$nilai, $bobot]) {
            if ($angka < $bobot) {
                return $nilai;
            }
            $angka -= $bobot;
        }

        return $pilihan[0][0];
    }

    private function nisnBebas(string $nisn, array $dipakai): string
    {
        do {
            $nisn = substr($nisn, 0, 3).str_pad((string) (((int) substr($nisn, 3) + 1) % 10_000_000), 7, '0', STR_PAD_LEFT);
        } while (isset($dipakai[$nisn]));

        return $nisn;
    }
}
