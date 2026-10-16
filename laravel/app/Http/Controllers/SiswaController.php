<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\User;
use App\Support\DataSekolah;
use App\Support\Referensi;
use App\Support\Versi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/*
  Data siswa (menu "Data Siswa": Tata Usaha, Wakasek Kesiswaan, Guru BK, Kepala Sekolah).
  Catatan siswa lain di database merujuk NIS, jadi saat NIS diubah semuanya ikut berubah, dan saat
  siswa dihapus catatannya ikut terhapus. Akun siswa & orang tuanya ikut disesuaikan.
*/
class SiswaController extends Controller
{
    // Koleksi website yang memakai NIS; dimuat ulang perangkat lain saat NIS berubah atau siswa dihapus
    private const TERKAIT = ['absensi', 'absensiMapel', 'izin', 'tugasSelesai', 'nilai', 'catatanWali', 'sikap', 'ekskul', 'spp', 'transaksi', 'peminjaman', 'reservasi', 'konseling', 'orangTua'];

    public function store(Request $request): JsonResponse
    {
        $this->akses($request)->wajib($this->akses($request)->punya('siswa'));
        $siswa = Siswa::create($this->validasi($request));

        return $this->tambalan(['siswa' => [$siswa->toArray()], 'jumlahSiswa' => $this->jumlah()], status: 201);
    }

    public function update(Request $request, Siswa $siswa): JsonResponse
    {
        $this->akses($request)->wajib($this->akses($request)->punya('siswa'));
        $isian = $this->validasi($request, $siswa);
        $nisLama = $siswa->nis;

        DB::transaction(function () use ($siswa, $isian, $nisLama) {
            $siswa->update($isian);
            User::where('role', 'siswa')->where('nis', $nisLama)->update(['nis' => $siswa->nis, 'kelas' => $siswa->kelas]);
            User::where('anak_nis', $nisLama)->update(['anak_nis' => $siswa->nis]);
        });
        if ($nisLama !== $siswa->nis) {
            Versi::naikkan(...self::TERKAIT);
        }

        return $this->tambalan(['siswa' => [$siswa->toArray()], 'jumlahSiswa' => $this->jumlah()]);
    }

    public function destroy(Request $request, Siswa $siswa): JsonResponse
    {
        $this->akses($request)->wajib($this->akses($request)->punya('siswa'));
        DB::transaction(function () use ($siswa) {
            // Akun siswa & orang tuanya dinonaktifkan (tidak dihapus) agar riwayat login tetap ada
            User::where('nis', $siswa->nis)->orWhere('anak_nis', $siswa->nis)->update(['aktif' => false]);
            $siswa->delete();
        });
        Versi::naikkan(...self::TERKAIT);

        return $this->tambalan(['jumlahSiswa' => $this->jumlah()], ['siswa' => [$siswa->id]]);
    }

    private function jumlah(): array|\stdClass
    {
        $jumlah = [];
        foreach (Siswa::selectRaw('kelas, jk, count(*) as n')->groupBy('kelas', 'jk')->toBase()->get() as $r) {
            $jumlah[$r->kelas][$r->jk] = (int) $r->n;
        }

        return DataSekolah::peta($jumlah);
    }

    private function validasi(Request $request, ?Siswa $siswa = null): array
    {
        $request->merge(['nis' => trim((string) $request->input('nis')), 'nama' => trim((string) $request->input('nama')), 'ortu' => trim((string) $request->input('ortu'))]);
        $data = $request->validate([
            'nis' => ['required', 'regex:/^[0-9]{4,20}$/', Rule::unique('siswa', 'nis')->ignore($siswa?->id)],
            'nama' => ['required', 'string', 'max:120'],
            'kelas' => ['required', Rule::in(Referensi::kelas())],
            'jk' => ['required', Rule::in(['L', 'P'])],
            'ortu' => ['required', 'string', 'max:120'],
        ], [
            'nis.required' => 'NIS wajib diisi.',
            'nis.regex' => 'NIS hanya boleh berisi 4–20 angka.',
            'nis.unique' => 'NIS :input sudah dipakai siswa lain.',
            'nama.required' => 'Nama wajib diisi.',
            'nama.max' => 'Nama paling banyak 120 karakter.',
            'kelas.required' => 'Pilih kelas.',
            'kelas.in' => 'Kelas tidak dikenal.',
            'jk.required' => 'Pilih jenis kelamin.',
            'jk.in' => 'Jenis kelamin tidak dikenal.',
            'ortu.required' => 'Nama orang tua/wali wajib diisi.',
            'ortu.max' => 'Nama orang tua/wali paling banyak 120 karakter.',
        ]);

        return $data;
    }
}
