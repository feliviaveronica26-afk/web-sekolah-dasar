<?php

namespace App\Http\Controllers;

use App\Models\AbsensiHarian;
use App\Models\AbsensiPelajaran;
use App\Models\IzinSiswa;
use App\Models\Siswa;
use App\Support\DataSekolah;
use App\Support\Waktu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/*
  Kehadiran siswa yang dicatat guru: presensi harian (wali kelas) dan presensi per pelajaran (guru
  pengampu atau wali kelasnya), serta izin/sakit yang diajukan orang tua dan disetujui wali kelas.
  Setiap perubahan menyimpan jejak: siapa, jam berapa, dan status sebelumnya.
*/
class KehadiranController extends Controller
{
    private const STATUS = ['H', 'S', 'I', 'A'];

    // Wali kelas mengubah presensi harian: { perubahan: { nis: 'H'|'S'|'I'|'A' } }
    public function harian(Request $request, string $tanggal): JsonResponse
    {
        $a = $this->akses($request);
        $perubahan = $this->perubahan($request, $tanggal);
        foreach (Siswa::whereIn('nis', array_keys($perubahan))->pluck('kelas')->unique() as $kelas) {
            $a->wajib($a->bolehPresensiHarian($kelas), "Presensi harian kelas {$kelas} dipegang wali kelasnya.");
        }

        $baris = DB::transaction(function () use ($perubahan, $tanggal, $a) {
            $hasil = [];
            foreach ($perubahan as $nis => $status) {
                $lama = AbsensiHarian::where('tanggal', $tanggal)->where('nis', $nis)->first();
                if ($lama?->status === $status) {
                    continue;
                }
                $hasil[] = AbsensiHarian::updateOrCreate(['tanggal' => $tanggal, 'nis' => $nis], [
                    'status' => $status,
                    ...self::jejakGuru($lama, $a->nama),
                    'sesi_id' => null,
                    'pelajaran' => null,
                ]);
            }

            return $hasil;
        });

        return $this->tambalan(DataSekolah::petaAbsensi(array_map(fn ($r) => (object) $r->getAttributes(), $baris)));
    }

    // Guru pengampu mengubah presensi satu pelajaran (kunci mis. '2-bing')
    public function pelajaran(Request $request, string $tanggal, string $kunci): JsonResponse
    {
        $a = $this->akses($request);
        $perubahan = $this->perubahan($request, $tanggal);
        foreach (Siswa::whereIn('nis', array_keys($perubahan))->pluck('kelas')->unique() as $kelas) {
            $a->wajib($a->bolehPresensiPelajaran($kelas, $tanggal, $kunci), 'Pelajaran ini tidak Anda ampu.');
        }

        $baris = DB::transaction(function () use ($perubahan, $tanggal, $kunci, $a) {
            $hasil = [];
            foreach ($perubahan as $nis => $status) {
                $lama = AbsensiPelajaran::where('tanggal', $tanggal)->where('nis', $nis)->where('kunci', $kunci)->first();
                if ($lama?->status === $status) {
                    continue;
                }
                $hasil[] = AbsensiPelajaran::updateOrCreate(['tanggal' => $tanggal, 'nis' => $nis, 'kunci' => $kunci], [
                    'status' => $status,
                    ...self::jejakGuru($lama, $a->nama),
                    'sesi_id' => null,
                ]);
            }

            return $hasil;
        });

        return $this->tambalan(DataSekolah::petaAbsensiMapel(array_map(fn ($r) => (object) $r->getAttributes(), $baris)));
    }

    // Jejak perubahan oleh guru; jam isi kode OTP sebelumnya tetap dicatat
    private static function jejakGuru($lama, string $oleh): array
    {
        return [
            'cara' => 'guru',
            'jam' => Waktu::jam(),
            'oleh' => $oleh,
            'sebelum' => $lama?->status,
            'otp' => $lama?->cara === 'otp' ? $lama->jam : null,
        ];
    }

    private function perubahan(Request $request, string $tanggal): array
    {
        if (! preg_match('/^\d{4}-\d{2}-\d{2}$/', $tanggal) || $tanggal > Waktu::hariIni()) {
            throw ValidationException::withMessages(['tanggal' => 'Presensi hanya bisa dicatat sampai hari ini.']);
        }
        if (! Waktu::hariSekolah($tanggal)) {
            $libur = Waktu::liburPada($tanggal);
            throw ValidationException::withMessages(['tanggal' => $libur ? "Tanggal itu libur ({$libur}), tidak ada presensi." : 'Tidak ada presensi pada akhir pekan.']);
        }
        $request->validate([
            'perubahan' => ['required', 'array', 'min:1', 'max:60'],
            'perubahan.*' => ['required', Rule::in(self::STATUS)],
        ], ['perubahan.*.in' => 'Status kehadiran tidak dikenal.']);
        $perubahan = [];
        foreach ($request->input('perubahan') as $nis => $status) {
            $perubahan[(string) $nis] = $status;
        }
        if (Siswa::whereIn('nis', array_keys($perubahan))->count() !== count($perubahan)) {
            throw ValidationException::withMessages(['perubahan' => 'Ada siswa yang tidak ditemukan.']);
        }

        return $perubahan;
    }

    // ===== Izin siswa =====

    // Orang tua mengajukan izin/sakit untuk anaknya
    public function ajukanIzin(Request $request): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->role === 'ortu', 'Izin diajukan oleh orang tua/wali.');
        $siswa = Siswa::where('nis', $a->nis)->firstOrFail();
        $isian = $request->validate([
            'jenis' => ['required', Rule::in(['Sakit', 'Izin'])],
            'tanggalMulai' => ['required', 'date_format:Y-m-d'],
            'tanggalSelesai' => ['required', 'date_format:Y-m-d', 'after_or_equal:tanggalMulai', 'before_or_equal:'.Waktu::sekarang()->addDays(30)->toDateString()],
            'alasan' => ['required', 'string', 'max:1000'],
            'lampiran' => ['nullable', 'string', 'max:200'],
        ], [
            'jenis.in' => 'Pilih jenis izin: Sakit atau Izin.',
            'tanggalSelesai.after_or_equal' => 'Tanggal selesai tidak boleh sebelum tanggal mulai.',
            'tanggalSelesai.before_or_equal' => 'Izin paling lambat untuk 30 hari ke depan.',
            'alasan.required' => 'Alasan wajib diisi.',
            'alasan.max' => 'Alasan paling banyak 1000 karakter.',
        ]);

        $izin = IzinSiswa::create(IzinSiswa::dariWebsite([
            ...$isian,
            'alasan' => trim($isian['alasan']),
            'lampiran' => $isian['lampiran'] ?? '',
            'nis' => $siswa->nis,
            'namaSiswa' => $siswa->nama,
            'kelas' => $siswa->kelas,
            'status' => 'Menunggu',
            'diajukan' => now(),
        ]));

        return $this->tambalan(['izin' => [$izin->fresh()->toArray()]], status: 201);
    }

    // Wali kelas menyetujui/menolak; izin yang disetujui otomatis tercatat di presensi harian (S/I)
    public function prosesIzin(Request $request, IzinSiswa $izin): JsonResponse
    {
        $a = $this->akses($request);
        $kelas = Siswa::where('nis', $izin->nis)->value('kelas') ?? $izin->kelas;
        $a->wajib($a->bolehKelas('izin', $kelas), 'Izin ini untuk siswa di luar kelas Anda.');
        $isian = $request->validate([
            'status' => ['required', Rule::in(['Disetujui', 'Ditolak'])],
            'catatanGuru' => ['nullable', 'string', 'max:1000'],
        ]);
        if ($izin->status !== 'Menunggu') {
            throw ValidationException::withMessages(['status' => "Izin ini sudah {$izin->status}."]);
        }

        $baris = DB::transaction(function () use ($izin, $isian, $a) {
            $izin->update(['status' => $isian['status'], 'catatan_guru' => trim($isian['catatanGuru'] ?? ''), 'diproses_oleh' => $a->nama, 'diproses' => now()]);
            if ($isian['status'] !== 'Disetujui') {
                return [];
            }
            $kode = $izin->jenis === 'Sakit' ? 'S' : 'I';

            return array_map(fn ($tgl) => AbsensiHarian::updateOrCreate(
                ['tanggal' => $tgl, 'nis' => $izin->nis],
                ['status' => $kode, 'cara' => 'izin', 'jam' => Waktu::jam(), 'oleh' => null, 'sebelum' => null, 'otp' => null, 'sesi_id' => null, 'pelajaran' => null],
            ), Waktu::rentangHariSekolah($izin->tanggal_mulai, $izin->tanggal_selesai));
        });

        return $this->tambalan(['izin' => [$izin->fresh()->toArray()], ...($baris ? DataSekolah::petaAbsensi(array_map(fn ($r) => (object) $r->getAttributes(), $baris)) : [])]);
    }
}
