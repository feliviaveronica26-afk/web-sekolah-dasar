<?php

namespace App\Http\Controllers;

use App\Models\Guru;
use App\Models\IzinStaf;
use App\Models\PresensiStaf;
use App\Support\DataSekolah;
use App\Support\Referensi;
use App\Support\Waktu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/*
  Presensi guru & staf: absen masuk/pulang sendiri (jam dari server), koreksi oleh Kepala Sekolah
  dengan jejak yang terlihat semua staf, dan pengajuan sakit/izin/cuti/dinas luar yang otomatis
  tercatat di presensi saat disetujui.
*/
class PresensiStafController extends Controller
{
    private const KODE_IZIN = ['Sakit' => 'S', 'Izin' => 'I', 'Cuti' => 'C', 'Dinas Luar' => 'D'];

    // Absen masuk/pulang hari ini untuk diri sendiri. `alasan` diisi saat terlambat atau pulang awal.
    public function absen(Request $request): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->staf() && $a->guruId, 'Akun ini belum terhubung ke data guru & staf.');
        $isian = $request->validate([
            'jenis' => ['required', Rule::in(['masuk', 'pulang'])],
            'alasan' => ['nullable', 'string', 'max:300'],
        ], ['alasan.max' => 'Alasan paling banyak 300 karakter.']);
        $tgl = Waktu::hariIni();
        if (! Waktu::hariSekolah($tgl)) {
            throw ValidationException::withMessages(['jenis' => 'Hari ini libur. Presensi dibuka kembali pada hari sekolah berikutnya.']);
        }

        $rec = PresensiStaf::firstOrNew(['tanggal' => $tgl, 'guru_id' => $a->guruId]);
        $alasan = trim($isian['alasan'] ?? '') ?: null;
        if ($rec->exists && $rec->status !== 'H') {
            throw ValidationException::withMessages(['jenis' => 'Anda sudah tercatat izin/dinas hari ini.']);
        }
        if ($isian['jenis'] === 'masuk') {
            if ($rec->masuk) {
                throw ValidationException::withMessages(['jenis' => "Anda sudah absen masuk pukul {$rec->masuk}."]);
            }
            $rec->fill(['status' => 'H', 'masuk' => Waktu::jam(), 'alasan_masuk' => $alasan]);
        } else {
            if (! $rec->masuk) {
                throw ValidationException::withMessages(['jenis' => 'Absen masuk dulu sebelum absen pulang.']);
            }
            if ($rec->pulang) {
                throw ValidationException::withMessages(['jenis' => "Anda sudah absen pulang pukul {$rec->pulang}."]);
            }
            $rec->fill(['pulang' => Waktu::jam(), 'alasan_pulang' => $alasan]);
        }
        $rec->save();

        return $this->tambalan(DataSekolah::petaPresensiStaf([(object) $rec->fresh()->getAttributes()]));
    }

    // Koreksi oleh Kepala Sekolah; jejaknya (siapa, kapan, alasan, data sebelumnya) ikut disimpan
    public function koreksi(Request $request, string $tanggal, Guru $guru): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->kepsek, 'Koreksi presensi hanya oleh Kepala Sekolah.');
        $jam = ['nullable', 'regex:/^([01][0-9]|2[0-3])\.[0-5][0-9]$/'];
        $isian = $request->validate([
            'status' => ['required', Rule::in(['H', 'D', 'I', 'S', 'C', 'A'])],
            'masuk' => [...$jam, 'required_if:status,H'],
            'pulang' => $jam,
            'ket' => ['nullable', 'string', 'max:300'],
            'alasan' => ['required', 'string', 'max:300'],
        ], [
            'masuk.required_if' => 'Isi jam masuk untuk status Hadir.',
            'regex' => 'Format jam tidak valid.',
            'alasan.required' => 'Alasan koreksi wajib diisi.',
        ]);
        if (! preg_match('/^\d{4}-\d{2}-\d{2}$/', $tanggal) || $tanggal > Waktu::hariIni()) {
            throw ValidationException::withMessages(['tanggal' => 'Tanggal koreksi tidak valid.']);
        }
        if ($isian['status'] === 'H' && ($isian['pulang'] ?? null) && $isian['pulang'] <= $isian['masuk']) {
            throw ValidationException::withMessages(['pulang' => 'Jam pulang harus setelah jam masuk.']);
        }

        $rec = PresensiStaf::firstOrNew(['tanggal' => $tanggal, 'guru_id' => $guru->id]);
        $sebelum = $rec->exists ? ['status' => $rec->status, 'masuk' => $rec->masuk, 'pulang' => $rec->pulang] : null;
        $perubahan = $isian['status'] === 'H'
            ? ['status' => 'H', 'masuk' => $isian['masuk'], 'pulang' => $isian['pulang'] ?? null]
            : ['status' => $isian['status'], 'masuk' => null, 'pulang' => null, 'ket' => trim($isian['ket'] ?? '') ?: null];
        $rec->fill($perubahan);
        $rec->koreksi = [...($rec->koreksi ?? []), ['oleh' => $a->nama, 'alasan' => trim($isian['alasan']), 'sebelum' => $sebelum, 'waktu' => Waktu::iso()]];
        $rec->save();

        return $this->tambalan(DataSekolah::petaPresensiStaf([(object) $rec->fresh()->getAttributes()]));
    }

    // ===== Izin guru & staf =====

    public function ajukanIzin(Request $request): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->staf() && $a->guruId, 'Akun ini belum terhubung ke data guru & staf.');
        $isian = $request->validate([
            'jenis' => ['required', Rule::in(Referensi::pilihan('jenisIzinStaf'))],
            'tanggalMulai' => ['required', 'date_format:Y-m-d'],
            'tanggalSelesai' => ['required', 'date_format:Y-m-d', 'after_or_equal:tanggalMulai'],
            'alasan' => ['required', 'string', 'max:1000'],
            'lampiran' => ['nullable', 'string', 'max:200'],
        ], [
            'jenis.in' => 'Jenis izin tidak dikenal.',
            'tanggalSelesai.after_or_equal' => 'Tanggal selesai tidak boleh sebelum tanggal mulai.',
            'alasan.required' => 'Alasan wajib diisi.',
        ]);

        $izin = IzinStaf::create(IzinStaf::dariWebsite([
            ...$isian,
            'alasan' => trim($isian['alasan']),
            'lampiran' => $isian['lampiran'] ?? '',
            'guruId' => $a->guruId,
            'nama' => $a->nama,
            'status' => 'Menunggu',
            'diajukan' => now(),
        ]));

        return $this->tambalan(['izinStaf' => [$izin->fresh()->toArray()]], status: 201);
    }

    // Kepala Sekolah memproses; izin yang disetujui tercatat di presensi pada rentang tanggalnya
    public function prosesIzin(Request $request, IzinStaf $izin): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->kepsek, 'Izin guru & staf diproses oleh Kepala Sekolah.');
        $isian = $request->validate([
            'status' => ['required', Rule::in(['Disetujui', 'Ditolak'])],
            'catatan' => ['nullable', 'string', 'max:1000'],
        ]);
        if ($izin->status !== 'Menunggu') {
            throw ValidationException::withMessages(['status' => "Pengajuan ini sudah {$izin->status}."]);
        }

        $baris = DB::transaction(function () use ($izin, $isian, $a) {
            $izin->update(['status' => $isian['status'], 'catatan' => trim($isian['catatan'] ?? ''), 'diproses_oleh' => $a->nama, 'diproses' => now()]);
            if ($isian['status'] !== 'Disetujui') {
                return [];
            }

            return array_map(function ($tgl) use ($izin) {
                $rec = PresensiStaf::firstOrNew(['tanggal' => $tgl, 'guru_id' => $izin->guru_id]);
                $rec->fill(['status' => self::KODE_IZIN[$izin->jenis], 'ket' => $izin->alasan, 'izin_id' => $izin->id]);
                $rec->save();

                return (object) $rec->fresh()->getAttributes();
            }, Waktu::rentangHariSekolah($izin->tanggal_mulai, $izin->tanggal_selesai));
        });

        return $this->tambalan(['izinStaf' => [$izin->fresh()->toArray()], ...($baris ? DataSekolah::petaPresensiStaf($baris) : [])]);
    }

    // Pengaju membatalkan pengajuan yang belum diproses
    public function batalkanIzin(Request $request, IzinStaf $izin): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($izin->guru_id === $a->guruId, 'Hanya pengaju yang boleh membatalkan pengajuan ini.');
        if ($izin->status !== 'Menunggu') {
            throw ValidationException::withMessages(['status' => "Pengajuan ini sudah {$izin->status}."]);
        }
        $izin->delete();

        return $this->tambalan(hapus: ['izinStaf' => [$izin->id]]);
    }
}
