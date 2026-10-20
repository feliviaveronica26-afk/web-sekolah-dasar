<?php

namespace App\Http\Controllers;

use App\Models\AbsensiHarian;
use App\Models\AbsensiPelajaran;
use App\Models\SesiPresensi;
use App\Support\DataSekolah;
use App\Support\Referensi;
use App\Support\Waktu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/*
  Presensi siswa dengan kode OTP. Guru membuka sesi untuk satu kelas (presensi harian, atau satu
  pelajaran), lalu siswa memasukkan kode 6 angka di portalnya. Kode dibuat & diperiksa di server dan
  tidak pernah dikirim ke siswa. Salah kode 5 kali mengunci siswa itu pada sesi tersebut.
*/
class PresensiOtpController extends Controller
{
    public function buka(Request $request): JsonResponse
    {
        $a = $this->akses($request);
        $isian = $request->validate(['kelas' => ['required', 'string'], 'kunci' => ['nullable', 'string', 'max:30']]);
        $hariIni = Waktu::hariIni();
        if (! Waktu::hariSekolah($hariIni)) {
            $libur = Waktu::liburPada($hariIni);
            throw ValidationException::withMessages(['kelas' => $libur ? "Hari ini libur ({$libur}), presensi tidak dibuka." : 'Hari ini libur, presensi tidak dibuka.']);
        }
        $kelas = $isian['kelas'];
        $kunci = $isian['kunci'] ?? null;
        $pelajaran = $kunci ? Referensi::pelajaranDariKunci($kelas, $hariIni, $kunci) : null;
        $a->wajib($kunci ? $a->bolehPresensiPelajaran($kelas, $hariIni, $kunci) : $a->bolehPresensiHarian($kelas), 'Anda tidak berhak membuka presensi ini.');

        $sekarang = now();
        $sesi = DB::transaction(function () use ($kelas, $hariIni, $pelajaran, $sekarang, $a) {
            // Hanya satu sesi aktif per kelas: sesi lain hari ini ditutup
            $ditutup = SesiPresensi::where('kelas', $kelas)->where('tanggal', $hariIni)->where('ditutup', false)->get()
                ->each(fn (SesiPresensi $s) => $s->update(['ditutup' => true, 'berakhir' => $s->berakhir->min($sekarang)]));

            $baru = SesiPresensi::create([
                'kelas' => $kelas,
                'tanggal' => $hariIni,
                'jam' => $pelajaran['jam'] ?? null,
                'mapel' => $pelajaran['mapel'] ?? null,
                'kunci' => $pelajaran['kunci'] ?? null,
                'kode' => str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT),
                'mulai' => $sekarang,
                'berakhir' => $sekarang->copy()->addMinutes(Referensi::get('otp.masaBerlakuMenit')),
                'oleh' => $a->nama,
                'guru_id' => $a->guruId,
                'ditutup' => false,
                'gagal' => [],
            ]);

            return [$baru, ...$ditutup];
        });

        return $this->tambalan(['sesiPresensi' => array_map(fn ($s) => self::untukGuru($s->fresh()), $sesi)], status: 201);
    }

    public function tutup(Request $request, SesiPresensi $sesi): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($sesi->guru_id === $a->guruId || ($sesi->kunci ? $a->bolehPresensiPelajaran($sesi->kelas, $sesi->tanggal, $sesi->kunci) : $a->bolehPresensiHarian($sesi->kelas)), 'Anda tidak berhak menutup presensi ini.');
        if (! $sesi->ditutup) {
            $sesi->update(['ditutup' => true, 'berakhir' => now()]);
        }

        return $this->tambalan(['sesiPresensi' => [self::untukGuru($sesi->fresh())]]);
    }

    private static function untukGuru(SesiPresensi $s): array
    {
        return ['gagal' => DataSekolah::peta($s->gagal ?? [])] + $s->toArray();
    }

    /*
      Siswa memasukkan kode. Hasil: { ok, alasan, jam, sisa, sesi }
      alasan: 'sudah' | 'tidak-ada' | 'kedaluwarsa' | 'terkunci' | 'salah'
      Kode pelajaran mencatat hadir di pelajaran itu; jika siswa belum punya presensi harian
      (mis. datang terlambat), harian ikut tercatat hadir.
    */
    public function isi(Request $request): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->role === 'siswa', 'Kode presensi diisi oleh siswa.');
        $kode = (string) $request->validate(['kode' => ['required', 'regex:/^[0-9]{6}$/']], ['kode.regex' => 'Kode presensi berupa 6 angka.'])['kode'];
        $nis = $a->nis;
        $kelas = (string) $a->kelasSiswa();
        $tgl = Waktu::hariIni();
        $jam = Waktu::jam();

        $hasil = DB::transaction(function () use ($kode, $nis, $kelas, $tgl, $jam) {
            $sesiHariIni = SesiPresensi::where('kelas', $kelas)->where('tanggal', $tgl)->orderByDesc('mulai')->lockForUpdate()->get();
            $aktif = $sesiHariIni->first(fn (SesiPresensi $s) => ! $s->ditutup && $s->berakhir->isFuture());
            if (! $aktif) {
                $pernah = $sesiHariIni->contains(fn (SesiPresensi $s) => hash_equals($s->kode, $kode));

                return ['ok' => false, 'alasan' => $pernah ? 'kedaluwarsa' : 'tidak-ada'];
            }
            $sudah = $aktif->kunci
                ? AbsensiPelajaran::where(['tanggal' => $tgl, 'nis' => $nis, 'kunci' => $aktif->kunci, 'status' => 'H'])->exists()
                : AbsensiHarian::where(['tanggal' => $tgl, 'nis' => $nis, 'status' => 'H'])->exists();
            if ($sudah) {
                return ['ok' => false, 'alasan' => 'sudah', 'sesi' => $aktif];
            }
            $maks = Referensi::get('otp.maksPercobaan');
            $gagal = $aktif->gagal[$nis] ?? 0;
            if ($gagal >= $maks) {
                return ['ok' => false, 'alasan' => 'terkunci', 'sesi' => $aktif];
            }
            if (! hash_equals($aktif->kode, $kode)) {
                $aktif->update(['gagal' => [...($aktif->gagal ?? []), $nis => $gagal + 1]]);

                return ['ok' => false, 'alasan' => $gagal + 1 >= $maks ? 'terkunci' : 'salah', 'sisa' => $maks - $gagal - 1, 'sesi' => $aktif];
            }

            $jejak = ['cara' => 'otp', 'jam' => $jam, 'oleh' => null, 'otp' => null, 'sesi_id' => $aktif->id];
            $mapel = $harian = null;
            $lamaHarian = AbsensiHarian::where('tanggal', $tgl)->where('nis', $nis)->first();
            if ($aktif->kunci) {
                $lama = AbsensiPelajaran::where(['tanggal' => $tgl, 'nis' => $nis, 'kunci' => $aktif->kunci])->first();
                $mapel = AbsensiPelajaran::updateOrCreate(['tanggal' => $tgl, 'nis' => $nis, 'kunci' => $aktif->kunci], ['status' => 'H', ...$jejak, 'sebelum' => $lama?->status]);
            }
            if (! $aktif->kunci || ! $lamaHarian) {
                $harian = AbsensiHarian::updateOrCreate(['tanggal' => $tgl, 'nis' => $nis], ['status' => 'H', ...$jejak, 'sebelum' => $lamaHarian?->status, 'pelajaran' => $aktif->kunci]);
            }

            return ['ok' => true, 'jam' => $jam, 'sesi' => $aktif, 'mapel' => $mapel, 'harian' => $harian];
        });

        $data = [];
        if ($hasil['harian'] ?? null) {
            $data += DataSekolah::petaAbsensi([(object) $hasil['harian']->getAttributes()]);
        }
        if ($hasil['mapel'] ?? null) {
            $data += DataSekolah::petaAbsensiMapel([(object) $hasil['mapel']->getAttributes()]);
        }
        $sesi = $hasil['sesi'] ?? null;
        unset($hasil['mapel'], $hasil['harian']);
        if ($sesi) {
            // Untuk siswa: tanpa kode, dan hanya hitungan salah miliknya
            $untukSiswa = ['gagal' => DataSekolah::peta(array_intersect_key($sesi->fresh()->gagal ?? [], [$nis => true]))] + $sesi->makeHidden('kode')->toArray();
            $hasil['sesi'] = $untukSiswa;
            $data['sesiPresensi'] = [$untukSiswa];
        }

        return $this->tambalan($data, lain: ['hasil' => $hasil]);
    }
}
