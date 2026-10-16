<?php

namespace App\Http\Controllers;

use App\Models\Pendaftar;
use App\Support\Referensi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/*
  PPDB: pendaftaran online dari halaman publik, cek status dengan nomor pendaftaran + tanggal lahir,
  dan verifikasi oleh panitia (Tata Usaha / Kepala Sekolah). Nomor pendaftaran dibuat server agar
  tidak ada nomor ganda saat banyak orang mendaftar bersamaan.
*/
class PpdbController extends Controller
{
    public function daftar(Request $request): JsonResponse
    {
        $ppdb = Referensi::get('ppdb');
        $teks = fn (int $maks, bool $wajib = true) => [$wajib ? 'required' : 'nullable', 'string', "max:{$maks}"];
        $isian = $request->validate([
            'nama' => $teks(120),
            'panggilan' => $teks(40, false),
            'jk' => ['required', Rule::in(['L', 'P'])],
            'tempatLahir' => $teks(60),
            'tanggalLahir' => ['required', 'date_format:Y-m-d', 'before:today'],
            'nik' => ['required', 'regex:/^[0-9]{16}$/'],
            'agama' => ['required', Rule::in($ppdb['agama'])],
            'asalTk' => $teks(120, false),
            'alamat' => $teks(300),
            'namaAyah' => $teks(120, false),
            'pekerjaanAyah' => $teks(80, false),
            'namaIbu' => $teks(120, false),
            'pekerjaanIbu' => $teks(80, false),
            'whatsapp' => ['required', 'string', 'max:20', 'regex:/^[0-9+\- ]+$/'],
            'email' => ['nullable', 'email', 'max:120'],
            'jalur' => ['required', Rule::in($ppdb['jalur'])],
            'infoJalur' => $teks(300, false),
            'berkas' => ['required', 'array'],
            'berkas.*' => ['nullable', 'string', 'max:200'],
        ], [
            'required' => 'Lengkapi semua kolom bertanda *.',
            'nik.regex' => 'NIK harus 16 digit angka (lihat Kartu Keluarga).',
            'whatsapp.regex' => 'Nomor WhatsApp belum valid.',
            'email.email' => 'Alamat email belum valid.',
            'tanggalLahir.before' => 'Tanggal lahir tidak valid.',
            'max' => 'Isian :attribute terlalu panjang.',
        ]);
        $isian = array_map(fn ($v) => is_string($v) ? trim($v) : $v, $isian);

        $usia = Carbon::parse($isian['tanggalLahir'])->diffInYears(Carbon::parse($ppdb['tanggalAcuanUsia']));
        if ($usia < $ppdb['usiaMinimal']) {
            throw ValidationException::withMessages(['tanggalLahir' => "Usia minimal calon siswa adalah {$ppdb['usiaMinimal']} tahun pada {$ppdb['tanggalAcuanUsia']}."]);
        }
        if (! $isian['namaAyah'] && ! $isian['namaIbu']) {
            throw ValidationException::withMessages(['namaAyah' => 'Isi minimal satu nama orang tua/wali.']);
        }
        if (strlen(preg_replace('/\D/', '', $isian['whatsapp'])) < 10) {
            throw ValidationException::withMessages(['whatsapp' => 'Nomor WhatsApp belum valid.']);
        }
        if ($isian['jalur'] !== 'Reguler' && ! $isian['infoJalur']) {
            throw ValidationException::withMessages(['infoJalur' => 'Lengkapi keterangan jalur pendaftaran.']);
        }
        $berkas = [];
        foreach ($ppdb['berkas'] as $b) {
            $ada = trim((string) ($isian['berkas'][$b['id']] ?? ''));
            if (! $ada && (($b['jalur'] ?? null) ? $b['jalur'] === $isian['jalur'] : $b['wajib'])) {
                throw ValidationException::withMessages(['berkas' => "Unggah berkas: {$b['label']}."]);
            }
            if ($ada && (! isset($b['jalur']) || $b['jalur'] === $isian['jalur'])) {
                $berkas[$b['id']] = $ada;
            }
        }

        $pendaftar = DB::transaction(function () use ($isian, $berkas, $ppdb) {
            $awalan = 'PPDB-'.substr($ppdb['tahunAjaran'], 0, 4).'-';
            $terakhir = Pendaftar::where('nomor', 'like', $awalan.'%')->lockForUpdate()->max('nomor');
            $urut = $terakhir ? (int) substr($terakhir, -4) + 1 : 1;

            return Pendaftar::create(Pendaftar::dariWebsite([
                ...$isian,
                'panggilan' => $isian['panggilan'] ?? '',
                'asalTk' => $isian['asalTk'] ?? '',
                'namaAyah' => $isian['namaAyah'] ?? '',
                'pekerjaanAyah' => $isian['pekerjaanAyah'] ?? '',
                'namaIbu' => $isian['namaIbu'] ?? '',
                'pekerjaanIbu' => $isian['pekerjaanIbu'] ?? '',
                'email' => $isian['email'] ?? '',
                'infoJalur' => $isian['jalur'] === 'Reguler' ? '' : $isian['infoJalur'],
                'berkas' => $berkas,
                'nomor' => $awalan.str_pad((string) $urut, 4, '0', STR_PAD_LEFT),
                'status' => 'Menunggu Verifikasi',
                'catatanPanitia' => '',
                'dibuat' => now(),
            ]));
        });

        return $this->tambalan(['pendaftar' => [['id' => $pendaftar->id, 'jalur' => $pendaftar->jalur, 'status' => $pendaftar->status]]], lain: ['pendaftar' => $pendaftar->fresh()->toArray()], status: 201);
    }

    // Cek status oleh pendaftar: nomor + tanggal lahir harus cocok
    public function cek(Request $request): JsonResponse
    {
        $isian = $request->validate(['nomor' => ['required', 'string', 'max:20'], 'tanggalLahir' => ['required', 'date_format:Y-m-d']]);
        $pendaftar = Pendaftar::where('nomor', strtoupper(trim($isian['nomor'])))->where('tanggal_lahir', $isian['tanggalLahir'])->first();

        return response()->json(['pendaftar' => $pendaftar?->toArray()]);
    }

    // Verifikasi panitia
    public function proses(Request $request, Pendaftar $pendaftar): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->punya('ppdb'), 'Verifikasi PPDB dilakukan panitia (Tata Usaha).');
        $isian = $request->validate([
            'status' => ['required', Rule::in(Referensi::get('ppdb.status'))],
            'catatanPanitia' => ['nullable', 'string', 'max:1000'],
        ], ['status.in' => 'Status pendaftaran tidak dikenal.']);
        $pendaftar->update(['status' => $isian['status'], 'catatan_panitia' => trim($isian['catatanPanitia'] ?? '')]);

        return $this->tambalan(['pendaftar' => [$pendaftar->fresh()->toArray()]]);
    }
}
