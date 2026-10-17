<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\User;
use App\Support\AkunSekolah;
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
  Akun login siswa dibuat/diatur ulang oleh Tata Usaha atau Kepala Sekolah (username = NIS).
*/
class SiswaController extends Controller
{
    // Koleksi website yang memakai NIS; dimuat ulang perangkat lain saat NIS berubah atau siswa dihapus
    private const TERKAIT = ['absensi', 'absensiMapel', 'izin', 'tugasSelesai', 'nilai', 'catatanWali', 'sikap', 'ekskul', 'spp', 'transaksi', 'peminjaman', 'reservasi', 'konseling', 'orangTua'];

    public function store(Request $request): JsonResponse
    {
        $this->akses($request)->wajib($this->akses($request)->punya('siswa'));
        $siswa = Siswa::create($this->validasi($request));

        return $this->tambalan(['siswa' => $this->peta($request, $siswa), 'jumlahSiswa' => $this->jumlah()], status: 201);
    }

    public function update(Request $request, Siswa $siswa): JsonResponse
    {
        $this->akses($request)->wajib($this->akses($request)->punya('siswa'));
        $isian = $this->validasi($request, $siswa);
        $nisLama = $siswa->nis;

        DB::transaction(function () use ($siswa, $isian, $nisLama) {
            $siswa->update($isian);
            User::where('role', 'siswa')->where('nis', $nisLama)->update(['nis' => $siswa->nis, 'kelas' => $siswa->kelas, 'name' => $siswa->nama]);
            User::where('anak_nis', $nisLama)->update(['anak_nis' => $siswa->nis]);
        });
        if ($nisLama !== $siswa->nis) {
            Versi::naikkan(...self::TERKAIT);
        }

        return $this->tambalan(['siswa' => $this->peta($request, $siswa), 'jumlahSiswa' => $this->jumlah()]);
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

    /*
      Buat akun login siswa, atau atur ulang password akun yang sudah ada. Password awal hanya ada di
      jawaban ini; siswa wajib menggantinya saat pertama login.
    */
    public function akun(Request $request, Siswa $siswa): JsonResponse
    {
        $this->akses($request)->wajib($this->akses($request)->kelolaAkunSiswa(), 'Akun siswa hanya diatur oleh Tata Usaha atau Kepala Sekolah.');
        $user = User::where('role', 'siswa')->where('nis', $siswa->nis)->first();
        [$user, $password] = AkunSekolah::buatAtauAturUlang($user, [
            'username' => AkunSekolah::unik($siswa->nis),
            'name' => $siswa->nama,
            'role' => 'siswa',
            'nis' => $siswa->nis,
            'kelas' => $siswa->kelas,
        ]);

        return $this->tambalan(['siswa' => $this->peta($request, $siswa)], lain: ['username' => $user->username, 'password' => $password], status: $user->wasRecentlyCreated ? 201 : 200);
    }

    // Data satu siswa dalam bentuk yang sama dengan GET /api/data untuk pengguna ini
    private function peta(Request $request, Siswa $siswa): array
    {
        return DataSekolah::petaSiswa(Siswa::whereKey($siswa->id)->get(), $this->akses($request));
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
        if ($request->filled('nisn')) {
            $request->merge(['nisn' => preg_replace('/\s+/', '', (string) $request->input('nisn'))]);
        }
        $data = $request->validate([
            'nis' => ['required', 'regex:/^[0-9]{4,20}$/', Rule::unique('siswa', 'nis')->ignore($siswa?->id)],
            'nama' => ['required', 'string', 'max:120'],
            'kelas' => ['required', Rule::in(Referensi::kelas())],
            'jk' => ['required', Rule::in(['L', 'P'])],
            'ortu' => ['required', 'string', 'max:120'],
            'nisn' => ['nullable', 'regex:/^[0-9]{10}$/', Rule::unique('siswa', 'nisn')->ignore($siswa?->id)],
            'tempatLahir' => ['nullable', 'string', 'max:60'],
            'tanggalLahir' => ['nullable', 'date_format:Y-m-d', 'before:today'],
            'agama' => ['nullable', Rule::in(Referensi::get('ppdb.agama', []))],
            'golonganDarah' => ['nullable', Rule::in(Siswa::GOLONGAN_DARAH)],
            'tanggalMasuk' => ['nullable', 'date_format:Y-m-d'],
            'asalSekolah' => ['nullable', 'string', 'max:120'],
            'catatanKesehatan' => ['nullable', 'string', 'max:300'],
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
            'nisn.regex' => 'NISN harus 10 angka.',
            'nisn.unique' => 'NISN :input sudah dipakai siswa lain.',
            'tempatLahir.max' => 'Tempat lahir paling banyak 60 karakter.',
            'tanggalLahir.date_format' => 'Tanggal lahir belum valid.',
            'tanggalLahir.before' => 'Tanggal lahir harus sebelum hari ini.',
            'agama.in' => 'Agama tidak dikenal.',
            'golonganDarah.in' => 'Golongan darah tidak dikenal.',
            'tanggalMasuk.date_format' => 'Tanggal masuk belum valid.',
            'asalSekolah.max' => 'Asal sekolah paling banyak 120 karakter.',
            'catatanKesehatan.max' => 'Catatan kesehatan paling banyak 300 karakter.',
        ]);

        $teks = fn (string $k) => trim($data[$k] ?? '');
        $hasil = ['nis' => $data['nis'], 'nama' => $data['nama'], 'kelas' => $data['kelas'], 'jk' => $data['jk'], 'ortu' => $data['ortu']];
        $biodata = [
            'nisn' => ['nisn', $data['nisn'] ?? null],
            'tempatLahir' => ['tempat_lahir', $teks('tempatLahir')],
            'tanggalLahir' => ['tanggal_lahir', $data['tanggalLahir'] ?? null],
            'agama' => ['agama', $data['agama'] ?? ''],
            'golonganDarah' => ['golongan_darah', $data['golonganDarah'] ?? ''],
            'tanggalMasuk' => ['tanggal_masuk', $data['tanggalMasuk'] ?? null],
            'asalSekolah' => ['asal_sekolah', $teks('asalSekolah')],
            'catatanKesehatan' => ['catatan_kesehatan', $teks('catatanKesehatan')],
        ];
        // Biodata yang tidak dikirim tetap seperti semula (mis. formulir lama yang hanya berisi data pokok)
        foreach ($biodata as $kunci => [$kolom, $nilai]) {
            if (! $siswa || $request->exists($kunci)) {
                $hasil[$kolom] = $nilai;
            }
        }

        return $hasil;
    }
}
