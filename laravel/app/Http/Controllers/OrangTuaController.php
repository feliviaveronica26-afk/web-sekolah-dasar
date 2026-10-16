<?php

namespace App\Http\Controllers;

use App\Models\OrangTua;
use App\Models\Siswa;
use App\Models\User;
use App\Support\AkunSekolah;
use App\Support\DataSekolah;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/*
  Data orang tua per keluarga (menu "Data Orang Tua": Tata Usaha & Kepala Sekolah). Orang tua boleh
  memperbarui kontaknya sendiri (WhatsApp, email, alamat, pekerjaan) dari Portal Orang Tua; nama dan
  anak yang terhubung hanya diubah Tata Usaha. Akun login orang tua dibuat dari sini.
*/
class OrangTuaController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->punya('ortu'));
        [$isian, $anak] = $this->validasi($request, null, true);

        $keluarga = DB::transaction(function () use ($isian, $anak) {
            $keluarga = OrangTua::create($isian);
            Siswa::whereIn('nis', $anak)->update(['orang_tua_id' => $keluarga->id]);

            return $keluarga;
        });

        return $this->tambalan(['orangTua' => $this->peta($keluarga)], status: 201);
    }

    public function update(Request $request, OrangTua $orangTua): JsonResponse
    {
        $a = $this->akses($request);
        $pengelola = $a->punya('ortu');
        // Orang tua hanya boleh mengubah data keluarganya sendiri
        $a->wajib($pengelola || ($a->role === 'ortu' && $orangTua->anak()->where('nis', $a->nis)->exists()));
        [$isian, $anak] = $this->validasi($request, $orangTua, $pengelola);

        DB::transaction(function () use ($orangTua, $isian, $anak, $pengelola) {
            $orangTua->update($pengelola ? $isian : array_intersect_key($isian, array_flip(OrangTua::KONTAK)));
            if ($pengelola && $anak !== null) {
                Siswa::where('orang_tua_id', $orangTua->id)->whereNotIn('nis', $anak)->update(['orang_tua_id' => null]);
                Siswa::whereIn('nis', $anak)->update(['orang_tua_id' => $orangTua->id]);
            }
        });

        return $this->tambalan(['orangTua' => $this->peta($orangTua, $pengelola)]);
    }

    public function destroy(Request $request, OrangTua $orangTua): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->punya('ortu'));
        // Siswa tidak ikut terhapus; tautannya kosong (orang_tua_id null). Akun orang tua tetap ada.
        $orangTua->delete();

        return $this->tambalan(hapus: ['orangTua' => [$orangTua->id]]);
    }

    /*
      Buat akun login orang tua untuk keluarga ini (username "ortu" + NIS anak pertama), atau atur
      ulang password akunnya. Password awal hanya ada di jawaban ini; wajib diganti saat login.
    */
    public function akun(Request $request, OrangTua $orangTua): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->punya('ortu'));
        $anak = $orangTua->anak()->get();
        if ($anak->isEmpty()) {
            throw ValidationException::withMessages(['anak' => 'Hubungkan keluarga ini dengan siswa terlebih dahulu.']);
        }
        $user = User::where('role', 'ortu')->whereIn('anak_nis', $anak->pluck('nis'))->first();
        [$user, $password] = AkunSekolah::buatAtauAturUlang($user, [
            'username' => AkunSekolah::unik('ortu'.$anak->first()->nis),
            'name' => $anak->first()->ortu ?: $orangTua->namaKontak(),
            'role' => 'ortu',
            'anak_nis' => $anak->first()->nis,
        ]);

        return $this->tambalan(['orangTua' => $this->peta($orangTua)], lain: ['username' => $user->username, 'password' => $password], status: $user->wasRecentlyCreated ? 201 : 200);
    }

    private function peta(OrangTua $keluarga, bool $denganAkun = true): array
    {
        return DataSekolah::petaOrangTua(OrangTua::whereKey($keluarga->id)->get(), $denganAkun);
    }

    /*
      Hasil: [kolom database, daftar NIS anak (null = tidak diubah)]. Pengelola wajib menghubungkan
      minimal satu siswa; siswa yang sudah punya keluarga lain tidak bisa dipindah diam-diam.
    */
    private function validasi(Request $request, ?OrangTua $keluarga, bool $pengelola): array
    {
        $data = $request->validate([
            'namaAyah' => ['nullable', 'string', 'max:120'],
            'pekerjaanAyah' => ['nullable', 'string', 'max:80'],
            'namaIbu' => ['nullable', 'string', 'max:120'],
            'pekerjaanIbu' => ['nullable', 'string', 'max:80'],
            'namaWali' => ['nullable', 'string', 'max:120'],
            'hubunganWali' => ['nullable', 'string', 'max:40'],
            'whatsapp' => ['nullable', 'string', 'max:20', 'regex:/^[0-9+\- ]*$/'],
            'email' => ['nullable', 'email:rfc', 'max:120'],
            'alamat' => ['nullable', 'string', 'max:300'],
            'anak' => [$pengelola && ! $keluarga ? 'required' : 'nullable', 'array', 'min:1', 'max:10'],
            'anak.*' => ['string', 'distinct', 'exists:siswa,nis'],
        ], [
            'whatsapp.regex' => 'Nomor WhatsApp hanya boleh berisi angka, spasi, +, dan -.',
            'whatsapp.max' => 'Nomor WhatsApp paling banyak 20 karakter.',
            'email.email' => 'Alamat email belum valid.',
            'alamat.max' => 'Alamat paling banyak 300 karakter.',
            'anak.required' => 'Pilih minimal satu anak (siswa) untuk keluarga ini.',
            'anak.min' => 'Pilih minimal satu anak (siswa) untuk keluarga ini.',
            'anak.*.exists' => 'NIS :input tidak ditemukan di data siswa.',
        ]);

        $teks = fn (string $k) => trim($data[$k] ?? '');
        $isian = [
            'nama_ayah' => $teks('namaAyah'),
            'pekerjaan_ayah' => $teks('pekerjaanAyah'),
            'nama_ibu' => $teks('namaIbu'),
            'pekerjaan_ibu' => $teks('pekerjaanIbu'),
            'nama_wali' => $teks('namaWali'),
            'hubungan_wali' => $teks('hubunganWali'),
            'whatsapp' => $teks('whatsapp'),
            'email' => Str::lower($teks('email')),
            'alamat' => $teks('alamat'),
        ];
        // Saat mengubah, kolom yang tidak dikirim tetap seperti semula
        if ($keluarga) {
            $isian = array_filter($isian, fn ($kolom) => $request->exists(Str::camel($kolom)), ARRAY_FILTER_USE_KEY);
        }
        // Setidaknya satu nama (ayah, ibu, atau wali) harus ada setelah perubahan
        if ($pengelola && ! array_filter(array_map(fn ($k) => $isian[$k] ?? $keluarga?->{$k}, ['nama_ayah', 'nama_ibu', 'nama_wali']))) {
            throw ValidationException::withMessages(['namaIbu' => 'Isi minimal satu nama: ayah, ibu, atau wali.']);
        }

        $anak = $pengelola && isset($data['anak']) ? array_values($data['anak']) : null;
        if ($anak) {
            $milikLain = Siswa::whereIn('nis', $anak)->whereNotNull('orang_tua_id')
                ->when($keluarga, fn ($q) => $q->where('orang_tua_id', '!=', $keluarga->id))->first();
            if ($milikLain) {
                throw ValidationException::withMessages(['anak' => "{$milikLain->nama} ({$milikLain->nis}) sudah terhubung dengan keluarga lain. Lepaskan dulu dari keluarga itu."]);
            }
        }

        return [$isian, $anak];
    }
}
