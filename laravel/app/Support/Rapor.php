<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/*
  Perhitungan nilai rapor, sama dengan sd-app/src/utils/nilai.js. Dipakai untuk peringkat kelas di
  portal siswa & orang tua, karena mereka tidak menerima nilai teman sekelasnya.
*/
final class Rapor
{
    private const BOBOT = ['tugas' => 0.4, 'pts' => 0.3, 'pas' => 0.3];

    public static function rataTugas(array $tugas): ?int
    {
        $isi = array_values(array_filter($tugas, fn ($x) => $x !== null && $x !== ''));

        return $isi ? (int) round(array_sum($isi) / count($isi)) : null;
    }

    // Nilai akhir = rata-rata berbobot dari komponen yang sudah terisi
    public static function nilaiAkhir(?array $n): ?int
    {
        if (! $n) {
            return null;
        }
        $nilai = ['tugas' => self::rataTugas($n['tugas'] ?? []), 'pts' => $n['pts'] ?? null, 'pas' => $n['pas'] ?? null];
        $bobot = $jumlah = 0;
        foreach (self::BOBOT as $k => $b) {
            if ($nilai[$k] !== null) {
                $bobot += $b;
                $jumlah += $nilai[$k] * $b;
            }
        }

        return $bobot ? (int) round($jumlah / $bobot) : null;
    }

    public static function rataRata(array $perMapel, string $kelas): ?float
    {
        $akhir = [];
        foreach (Referensi::mapelRapor($kelas) as $m) {
            $n = self::nilaiAkhir($perMapel[$m] ?? null);
            if ($n !== null) {
                $akhir[] = $n;
            }
        }

        return $akhir ? round(array_sum($akhir) / count($akhir) * 10) / 10 : null;
    }

    // Peringkat siswa di kelasnya berdasarkan rata-rata nilai: { posisi, dari }
    public static function peringkat(string $nis, string $kelas): array
    {
        $siswa = DB::table('siswa')->where('kelas', $kelas)->orderBy('nama')->pluck('nis')->all();
        $nilai = DataSekolah::petaNilai(DB::table('nilai')->whereIn('nis', $siswa)->get())['nilai'];
        $nilai = is_array($nilai) ? $nilai : [];

        // Siswa yang belum punya nilai (mis. siswa baru) belum diberi peringkat dan tidak dihitung
        $rata = [];
        foreach ($siswa as $n) {
            $r = self::rataRata($nilai[$n] ?? [], $kelas);
            if ($r !== null) {
                $rata[$n] = $r;
            }
        }
        arsort($rata);
        $posisi = array_search($nis, array_map('strval', array_keys($rata)), true);

        return ['posisi' => $posisi === false ? null : $posisi + 1, 'dari' => count($rata)];
    }
}
