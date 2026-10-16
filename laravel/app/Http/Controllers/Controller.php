<?php

namespace App\Http\Controllers;

use App\Support\Akses;
use App\Support\DataSekolah;
use App\Support\Versi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

abstract class Controller
{
    protected function akses(Request $request): Akses
    {
        return Akses::dari($request->user());
    }

    /*
      Jawaban untuk perubahan data: potongan data terbaru dalam bentuk state website, id yang dihapus,
      dan penanda versi baru (agar perangkat lain memuat ulang koleksi yang berubah). Website
      menggabungkannya dengan terapkan() di src/context/DataContext.jsx.
    */
    protected function tambalan(array $data = [], array $hapus = [], array $lain = [], int $status = 200): JsonResponse
    {
        $kelompok = DataSekolah::kelompokDari([...array_keys($data), ...array_keys($hapus)]);
        // Penanda lama ikut dikirim: jika sama dengan yang dipegang website, website sudah mutakhir
        // dan cukup memakai penanda baru tanpa memuat ulang koleksinya.
        $lama = Versi::semua($kelompok);
        $versi = Versi::naikkan(...$kelompok);

        return response()->json(['data' => (object) $data, 'hapus' => (object) $hapus, 'versi' => (object) $versi, 'versiLama' => (object) $lama] + $lain, $status);
    }
}
