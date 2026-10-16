<?php

namespace App\Http\Controllers;

use App\Support\DataSekolah;
use App\Support\Versi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/*
  Data sekolah untuk website. GET /api/data mengirim semua koleksi yang boleh dilihat pengguna
  (atau sebagian saja: ?koleksi=absensi,nilai), GET /api/versi mengirim penanda versi tiap koleksi
  agar website hanya memuat ulang yang berubah.
*/
class DataController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $semua = array_keys(DataSekolah::KELOMPOK);
        $minta = $request->filled('koleksi') ? array_values(array_intersect($semua, explode(',', (string) $request->query('koleksi')))) : $semua;
        // Penanda versi diambil sebelum data, jadi perubahan di tengah jalan tetap dimuat pada pemeriksaan berikutnya
        $versi = Versi::semua($minta);

        return response()->json([
            'versi' => $versi,
            'data' => (new DataSekolah($this->akses($request)))->ambil($minta),
            'batasBerkas' => self::batasBerkas(),
        ]);
    }

    public function versi(): JsonResponse
    {
        return response()->json(Versi::semua([...array_keys(DataSekolah::KELOMPOK), 'chat']));
    }

    // Ukuran berkas chat terbesar (byte): batas sekolah, dibatasi juga oleh php.ini
    public static function batasBerkas(): int
    {
        $byte = function (string $nilai): int {
            $angka = (int) $nilai;

            return match (strtolower(substr(trim($nilai), -1))) {
                'g' => $angka * 1024 ** 3,
                'm' => $angka * 1024 ** 2,
                'k' => $angka * 1024,
                default => $angka,
            };
        };
        $batas = array_filter([config('sekolah.chat_maks_mb') * 1024 ** 2, $byte(ini_get('upload_max_filesize')), $byte(ini_get('post_max_size')) - 64 * 1024], fn ($b) => $b > 0);

        return min($batas);
    }
}
