<?php

namespace App\Support;

use App\Models\Guru;
use App\Models\JadwalPelajaran;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/*
  Data acuan sekolah yang sama dengan website: kelas, sesi, mapel, ekskul, kategori sikap, pengaturan
  SPP, dan pilihan formulir. Berkasnya (resources/data/referensi.json) dibuat dari
  sd-app/src/data/dummy.js dengan `npm run ekspor-laravel`, jadi website & server selalu memakai aturan
  yang sama. Jadwal pelajaran tersimpan di database (tabel jadwal_pelajaran), lihat jadwal().
*/
final class Referensi
{
    private static ?array $data = null;

    private const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    public static function semua(): array
    {
        return self::$data ??= json_decode(file_get_contents(resource_path('data/referensi.json')), true, flags: JSON_THROW_ON_ERROR);
    }

    public static function get(string $kunci, mixed $bawaan = null): mixed
    {
        return data_get(self::semua(), $kunci, $bawaan);
    }

    /** @return list<string> */
    public static function kelas(): array
    {
        return self::get('kelas');
    }

    public static function angkaKelas(string $kelas): int
    {
        return (int) substr($kelas, 0, 1);
    }

    // Mapel rapor sesuai jenjang: IPAS & Informatika mulai kelas 3
    public static function mapelRapor(string $kelas): array
    {
        return array_values(array_filter(
            self::get('mapelRapor'),
            fn ($m) => self::angkaKelas($kelas) >= 3 || ! in_array($m, ['ipas', 'info'], true),
        ));
    }

    public static function namaHari(string $tanggal): string
    {
        return self::NAMA_HARI[Carbon::parse($tanggal)->dayOfWeek];
    }

    // Jadwal pelajaran dari tabel jadwal_pelajaran: { kelas: { hari: [mapel|null per sesi] } }. Disimpan selama permintaan.
    private static ?array $jadwal = null;

    public static function jadwal(): array
    {
        if (self::$jadwal !== null) {
            return self::$jadwal;
        }
        $kosong = array_fill(0, count(self::get('sesi')), null);
        $hasil = [];
        foreach (JadwalPelajaran::orderBy('kelas')->orderBy('jam')->get() as $j) {
            $hasil[$j->kelas] ??= array_fill_keys(self::get('hariSekolah'), $kosong);
            $hasil[$j->kelas][$j->hari][$j->jam] = $j->mapel;
        }

        return self::$jadwal = $hasil;
    }

    // Dipanggil setiap kali jadwal berubah dan di awal setiap tes
    public static function lupakanJadwal(): void
    {
        self::$jadwal = null;
    }

    // Mapel yang boleh masuk jadwal kelas ini: semua mapel, kecuali IPAS & Informatika untuk kelas 1–2
    public static function mapelJadwal(string $kelas): array
    {
        return array_values(array_filter(
            array_keys(self::get('mapel')),
            fn ($m) => self::angkaKelas($kelas) >= 3 || ! in_array($m, ['ipas', 'info'], true),
        ));
    }

    // Pelajaran yang diabsen pada hari itu (sama dengan pelajaranHari di src/utils/jadwal.js)
    public static function pelajaranHari(string $kelas, string $tanggal): array
    {
        $hasil = [];
        foreach (self::jadwal()[$kelas][self::namaHari($tanggal)] ?? [] as $jam => $mapel) {
            $info = $mapel ? self::get("mapel.{$mapel}") : null;
            if ($info && $info['absensi']) {
                $hasil[] = ['jam' => $jam, 'mapel' => $mapel, 'kunci' => "{$jam}-{$mapel}"] + self::get("sesi.{$jam}");
            }
        }

        return $hasil;
    }

    public static function pelajaranDariKunci(string $kelas, string $tanggal, string $kunci): ?array
    {
        return collect(self::pelajaranHari($kelas, $tanggal))->firstWhere('kunci', $kunci);
    }

    // Guru pengampu: guru mapel yang mengampu mapel itu (kolom mapel_diampu) jika ada, selain itu wali kelas
    public static function guruPelajaran(Collection $guru, string $kelas, string $mapel): ?Guru
    {
        return $guru->first(fn (Guru $g) => in_array($mapel, $g->mapelDiampu(), true))
            ?? $guru->first(fn (Guru $g) => $g->punyaPeran('wali_kelas') && $g->kelas === $kelas);
    }

    public static function sikap(string $kode): ?array
    {
        return collect(self::get('sikap'))->firstWhere('kode', $kode);
    }

    public static function ekskul(string $id): ?array
    {
        return collect(self::get('ekskul'))->firstWhere('id', $id);
    }

    public static function pilihan(string $nama): array
    {
        return self::get("pilihan.{$nama}", []);
    }
}
