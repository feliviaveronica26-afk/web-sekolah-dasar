<?php

namespace App\Http\Controllers;

use App\Models\Guru;
use App\Models\User;
use App\Support\AkunSekolah;
use App\Support\Referensi;
use App\Support\Versi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/*
  Data guru & staf untuk website. Daftar guru terbuka untuk umum (halaman Guru), tetapi biodata pribadi
  (NIP, TTL, alamat, kontak, kepegawaian) hanya dikirim ke Kepala Sekolah dan pemiliknya. Menambah,
  mengubah, menghapus, dan membuat akun login dijaga middleware "peran:kepsek".
*/
class GuruController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(Guru::untukWebsite(Guru::orderBy('urutan')->get(), $request->user()));
    }

    public function store(Request $request): JsonResponse
    {
        $guru = new Guru($this->validasi($request));
        $guru->id = 'g'.Str::lower((string) Str::ulid());
        $guru->urutan = (int) Guru::max('urutan') + 1;
        $guru->save();
        Versi::naikkan('guru');

        return response()->json($this->satu($guru, $request), 201);
    }

    public function update(Request $request, Guru $guru): JsonResponse
    {
        $guru->update($this->validasi($request, $guru));
        Versi::naikkan('guru');

        return response()->json($this->satu($guru, $request));
    }

    public function destroy(Guru $guru): Response
    {
        $guru->delete();
        // Akun login-nya dinonaktifkan (tidak dihapus, agar jejak chat & presensi tetap terbaca)
        User::where('guru_id', $guru->id)->update(['aktif' => false]);
        // Presensi & izin guru ini ikut terhapus
        Versi::naikkan('guru', 'presensiStaf', 'izinStaf');

        return response()->noContent();
    }

    /*
      Buat akun login untuk guru/staf ini, atau atur ulang password akunnya. Password awal hanya
      dikirim sekali di jawaban ini; pemilik akun wajib menggantinya saat login.
    */
    public function akun(Request $request, Guru $guru): JsonResponse
    {
        if ($guru->jabatan === 'Kepala Sekolah') {
            throw ValidationException::withMessages(['guru' => 'Kepala Sekolah memakai akun Kepala Sekolah sendiri.']);
        }
        $user = User::where('guru_id', $guru->id)->first();
        [$user, $password] = AkunSekolah::buatAtauAturUlang($user, [
            'username' => AkunSekolah::usernameDariNama($guru->nama),
            'name' => $guru->nama,
            'role' => 'staf',
            'guru_id' => $guru->id,
        ]);
        Versi::naikkan('guru');

        return response()->json([
            'username' => $user->username,
            'password' => $password,
            'guru' => $this->satu($guru, $request),
        ], $user->wasRecentlyCreated ? 201 : 200);
    }

    private function satu(Guru $guru, Request $request): array
    {
        return Guru::untukWebsite(collect([$guru->fresh()]), $request->user())[0];
    }

    // Aturan yang sama dengan formulir Data Guru & Staf di website, ditambah batas panjang isian
    private function validasi(Request $request, ?Guru $guru = null): array
    {
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:120'],
            'nip' => ['nullable', 'string', 'max:30', 'regex:/^[0-9]+$/'],
            'jabatan' => ['required', 'string', 'max:80'],
            'mapel' => ['nullable', 'string', 'max:80'],
            'peran' => ['nullable', 'array'],
            'peran.*' => ['string', 'distinct', Rule::in(Guru::PERAN)],
            'kelas' => ['nullable', 'string', Rule::in(Guru::KELAS)],
            'mapelDiampu' => ['nullable', 'array'],
            'mapelDiampu.*' => ['string', 'distinct', Rule::in(Guru::kodeMapelDiampu())],
            'jk' => ['nullable', Rule::in(['L', 'P'])],
            'tempatLahir' => ['nullable', 'string', 'max:60'],
            'tanggalLahir' => ['nullable', 'date_format:Y-m-d', 'before:today'],
            'agama' => ['nullable', Rule::in(Referensi::get('ppdb.agama', []))],
            'alamat' => ['nullable', 'string', 'max:300'],
            'whatsapp' => ['nullable', 'string', 'max:20', 'regex:/^[0-9+\- ]*$/'],
            'email' => ['nullable', 'email:rfc', 'max:120'],
            'pendidikan' => ['nullable', 'string', 'max:80'],
            'statusPegawai' => ['nullable', Rule::in(Guru::STATUS_PEGAWAI)],
            'mulaiTugas' => ['nullable', 'date_format:Y-m-d'],
        ], [
            'nama.required' => 'Nama wajib diisi.',
            'nama.max' => 'Nama paling banyak 120 karakter.',
            'nip.max' => 'NIP/NUPTK paling banyak 30 angka.',
            'nip.regex' => 'NIP/NUPTK hanya boleh berisi angka.',
            'jabatan.required' => 'Jabatan wajib diisi.',
            'jabatan.max' => 'Jabatan paling banyak 80 karakter.',
            'mapel.max' => 'Mata pelajaran paling banyak 80 karakter.',
            'peran.*.in' => 'Jabatan portal tidak dikenal.',
            'kelas.in' => 'Kelas tidak dikenal.',
            'mapelDiampu.*.in' => 'Mapel yang diampu tidak dikenal.',
            'jk.in' => 'Jenis kelamin tidak dikenal.',
            'tanggalLahir.date_format' => 'Tanggal lahir belum valid.',
            'tanggalLahir.before' => 'Tanggal lahir harus sebelum hari ini.',
            'agama.in' => 'Agama tidak dikenal.',
            'alamat.max' => 'Alamat paling banyak 300 karakter.',
            'whatsapp.regex' => 'Nomor WhatsApp hanya boleh berisi angka, spasi, +, dan -.',
            'whatsapp.max' => 'Nomor WhatsApp paling banyak 20 karakter.',
            'email.email' => 'Alamat email belum valid.',
            'statusPegawai.in' => 'Status kepegawaian tidak dikenal.',
            'mulaiTugas.date_format' => 'Tanggal mulai bertugas belum valid.',
        ]);

        $peran = array_values(array_unique($data['peran'] ?? []));
        $wali = in_array('wali_kelas', $peran, true);
        $kelas = $wali ? ($data['kelas'] ?? '') : '';
        $mapelDiampu = in_array('guru_mapel', $peran, true) ? array_values($data['mapelDiampu'] ?? []) : [];
        $lain = Guru::when($guru, fn ($q) => $q->whereKeyNot($guru->getKey()))->get();

        if ($wali && $kelas === '') {
            throw ValidationException::withMessages(['kelas' => 'Pilih kelas untuk wali kelas.']);
        }
        if ($wali && ($bentrok = $lain->first(fn (Guru $g) => $g->punyaPeran('wali_kelas') && $g->kelas === $kelas))) {
            throw ValidationException::withMessages(['kelas' => "Kelas {$kelas} sudah memiliki wali kelas: {$bentrok->nama}."]);
        }
        // Satu mapel diampu satu guru mapel (pengampu inilah yang muncul di jadwal & berhak menilai)
        foreach ($mapelDiampu as $m) {
            if ($bentrok = $lain->first(fn (Guru $g) => in_array($m, $g->mapelDiampu(), true))) {
                $namaMapel = Referensi::get("mapel.{$m}.nama", $m);
                throw ValidationException::withMessages(['mapelDiampu' => "{$namaMapel} sudah diampu {$bentrok->nama}."]);
            }
        }

        $teks = fn (string $k) => trim($data[$k] ?? '');
        $biodata = [
            'mapelDiampu' => ['mapel_diampu', $mapelDiampu],
            'jk' => ['jk', $data['jk'] ?? ''],
            'tempatLahir' => ['tempat_lahir', $teks('tempatLahir')],
            'tanggalLahir' => ['tanggal_lahir', $data['tanggalLahir'] ?? null],
            'agama' => ['agama', $data['agama'] ?? ''],
            'alamat' => ['alamat', $teks('alamat')],
            'whatsapp' => ['whatsapp', $teks('whatsapp')],
            'email' => ['email', Str::lower($teks('email'))],
            'pendidikan' => ['pendidikan', $teks('pendidikan')],
            'statusPegawai' => ['status_pegawai', $data['statusPegawai'] ?? ''],
            'mulaiTugas' => ['mulai_tugas', $data['mulaiTugas'] ?? null],
        ];
        $hasil = [
            'nama' => $teks('nama'),
            'nip' => $data['nip'] ?? '',
            'jabatan' => $teks('jabatan'),
            'mapel' => $teks('mapel'),
            'peran' => $peran,
            'kelas' => $kelas,
        ];
        // Saat mengubah, biodata yang tidak dikirim tetap seperti semula
        foreach ($biodata as $kunci => [$kolom, $nilai]) {
            if (! $guru || $request->exists($kunci)) {
                $hasil[$kolom] = $nilai;
            }
        }

        return $hasil;
    }
}
