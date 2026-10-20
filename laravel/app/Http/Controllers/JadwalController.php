<?php

namespace App\Http\Controllers;

use App\Models\Guru;
use App\Models\JadwalPelajaran;
use App\Support\DataSekolah;
use App\Support\Referensi;
use App\Support\Versi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/*
  Jadwal pelajaran mingguan per kelas, diatur Wakasek Kurikulum (dan Kepala Sekolah) dari menu Jadwal.
  Satu guru mapel tidak boleh mengajar dua kelas di jam yang sama (diperiksa untuk jam yang diubah);
  kegiatan bersama (upacara, senam, pramuka) dan mapel yang diajar wali kelas masing-masing tidak
  dianggap bentrok.
*/
class JadwalController extends Controller
{
    // Isian: { jadwal: { Senin: [kode mapel | null per sesi], ... } }
    public function simpan(Request $request, string $kelas): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->punya('jadwal'), 'Jadwal pelajaran diatur oleh Wakasek Kurikulum.');
        abort_unless(in_array($kelas, Referensi::kelas(), true), 404, 'Kelas tidak dikenal.');

        $hariSekolah = Referensi::get('hariSekolah');
        $jumlahSesi = count(Referensi::get('sesi'));
        $isian = $request->validate([
            'jadwal' => ['required', 'array'],
            'jadwal.*' => ['array', "max:{$jumlahSesi}"],
            'jadwal.*.*' => ['nullable', 'string', Rule::in(Referensi::mapelJadwal($kelas))],
        ], [
            'jadwal.required' => 'Jadwal belum diisi.',
            'jadwal.*.max' => "Satu hari paling banyak {$jumlahSesi} jam pelajaran.",
            'jadwal.*.*.in' => 'Ada mata pelajaran yang tidak dikenal atau belum diajarkan di kelas ini.',
        ]);
        if ($asing = array_diff(array_keys($isian['jadwal']), $hariSekolah)) {
            throw ValidationException::withMessages(['jadwal' => 'Hari tidak dikenal: '.implode(', ', $asing).'.']);
        }

        $baru = [];
        foreach ($hariSekolah as $hari) {
            $baris = array_values($isian['jadwal'][$hari] ?? []);
            for ($jam = 0; $jam < $jumlahSesi; $jam++) {
                $baru[$hari][$jam] = ($baris[$jam] ?? null) ?: null;
            }
        }
        $this->periksaBentrok($kelas, $baru, Referensi::jadwal()[$kelas] ?? [], $a->guru());

        DB::transaction(function () use ($kelas, $baru) {
            JadwalPelajaran::where('kelas', $kelas)->delete();
            $sekarang = now();
            $baris = [];
            foreach ($baru as $hari => $perJam) {
                foreach ($perJam as $jam => $mapel) {
                    if ($mapel) {
                        $baris[] = ['kelas' => $kelas, 'hari' => $hari, 'jam' => $jam, 'mapel' => $mapel, 'created_at' => $sekarang, 'updated_at' => $sekarang];
                    }
                }
            }
            JadwalPelajaran::insert($baris);
        });
        Referensi::lupakanJadwal();
        // Anggota grup chat kelas mengikuti guru pengampu di jadwal
        Versi::naikkan('chat');

        return $this->tambalan(['jadwal' => DataSekolah::peta([$kelas => $baru])]);
    }

    /*
      Hanya jam yang diubah yang diperiksa: bentrok lama di jadwal contoh tidak menghalangi perubahan lain
      (website menampilkannya sebagai peringatan agar dibereskan bertahap).
      @param  \Illuminate\Support\Collection<int, Guru>  $guru
    */
    private function periksaBentrok(string $kelas, array $baru, array $lama, $guru): void
    {
        $semua = Referensi::jadwal();
        $namaMapel = fn (string $m) => Referensi::get("mapel.{$m}.nama", $m);
        foreach ($baru as $hari => $perJam) {
            foreach ($perJam as $jam => $mapel) {
                if (! $mapel || $mapel === ($lama[$hari][$jam] ?? null) || ! Referensi::get("mapel.{$mapel}.absensi", false)) {
                    continue;
                }
                $pengampu = $guru->first(fn (Guru $g) => in_array($mapel, $g->mapelDiampu(), true));
                if (! $pengampu) {
                    continue;
                }
                foreach ($semua as $kelasLain => $perHari) {
                    $lain = $perHari[$hari][$jam] ?? null;
                    if ($kelasLain !== $kelas && $lain && in_array($lain, $pengampu->mapelDiampu(), true)) {
                        throw ValidationException::withMessages(['jadwal' => sprintf(
                            '%s %s jam ke-%d bentrok: %s sudah mengajar %s di kelas %s pada jam itu.',
                            $namaMapel($mapel), $hari, $jam + 1, $pengampu->nama, $namaMapel($lain), $kelasLain,
                        )]);
                    }
                }
            }
        }
    }
}
