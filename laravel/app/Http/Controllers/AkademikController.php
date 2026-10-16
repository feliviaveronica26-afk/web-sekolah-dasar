<?php

namespace App\Http\Controllers;

use App\Models\CatatanWali;
use App\Models\Nilai;
use App\Models\Sikap;
use App\Models\Siswa;
use App\Models\Tugas;
use App\Support\DataSekolah;
use App\Support\Referensi;
use App\Support\Versi;
use App\Support\Waktu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/*
  Akademik: tugas kelas, nilai rapor, catatan wali kelas, poin sikap, tugas yang sudah dikerjakan
  siswa, dan ekskul pilihan siswa. Guru hanya boleh mengubah kelas & mapel dalam lingkupnya
  (wali kelas: kelasnya; guru mapel: mapel yang ia ampu), sama seperti useLingkup di website.
*/
class AkademikController extends Controller
{
    // ===== Tugas kelas =====

    public function simpanTugas(Request $request, ?Tugas $tugas = null): JsonResponse
    {
        $a = $this->akses($request);
        if ($tugas) {
            $a->wajib($a->bolehMapel('tugas', $tugas->kelas, $tugas->mapel), 'Tugas ini di luar kelas atau mapel Anda.');
        }
        $isian = $request->validate([
            'kelas' => ['required', Rule::in(Referensi::kelas())],
            'mapel' => ['required', 'string'],
            'judul' => ['required', 'string', 'max:150'],
            'deskripsi' => ['required', 'string', 'max:3000'],
            'diberikan' => ['required', 'date_format:Y-m-d'],
            'tenggat' => ['required', 'date_format:Y-m-d', 'after_or_equal:diberikan'],
        ], [
            'required' => 'Kolom :attribute wajib diisi.',
            'judul.max' => 'Judul paling banyak 150 karakter.',
            'deskripsi.max' => 'Petunjuk paling banyak 3000 karakter.',
            'tenggat.after_or_equal' => 'Tanggal dikumpulkan tidak boleh sebelum tanggal diberikan.',
        ], ['deskripsi' => 'petunjuk', 'tenggat' => 'dikumpulkan']);
        $a->wajib($a->bolehMapel('tugas', $isian['kelas'], $isian['mapel']), 'Anda tidak mengampu mapel ini di kelas tersebut.');

        $tugas ? $tugas->update($isian) : $tugas = Tugas::create($isian);

        return $this->tambalan(['tugas' => [$tugas->toArray()]], status: $tugas->wasRecentlyCreated ? 201 : 200);
    }

    public function hapusTugas(Request $request, Tugas $tugas): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->bolehMapel('tugas', $tugas->kelas, $tugas->mapel), 'Tugas ini di luar kelas atau mapel Anda.');
        $tugas->delete();
        // Tanda "sudah dikerjakan" untuk tugas ini ikut terhapus; perangkat lain memuat ulang
        Versi::naikkan('tugasSelesai');

        return $this->tambalan(hapus: ['tugas' => [$tugas->id]]);
    }

    // Siswa menandai tugas sudah/belum dikerjakan
    public function tandaiTugas(Request $request, Tugas $tugas): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->role === 'siswa' && $tugas->kelas === $a->kelasSiswa(), 'Tugas ini bukan untuk kelasmu.');
        $kueri = DB::table('tugas_selesai')->where('nis', $a->nis)->where('tugas_id', $tugas->id);
        $kueri->exists() ? $kueri->delete() : DB::table('tugas_selesai')->insert(['nis' => $a->nis, 'tugas_id' => $tugas->id, 'created_at' => now()]);

        return $this->tambalan(['tugasSelesai' => [$a->nis => DB::table('tugas_selesai')->where('nis', $a->nis)->orderBy('created_at')->pluck('tugas_id')->all()]]);
    }

    // ===== Nilai & rapor =====

    public function simpanNilai(Request $request, Siswa $siswa, string $mapel): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->bolehMapel('nilai', $siswa->kelas, $mapel), 'Anda tidak berhak menilai mapel ini di kelas tersebut.');
        $angka = ['nullable', 'integer', 'min:0', 'max:100'];
        // tugas (ketiganya sekaligus) atau tugasKe + nilaiTugas (satu kotak saja), pts, pas
        $isian = $request->validate([
            'tugas' => ['sometimes', 'array', 'max:3'],
            'tugas.*' => $angka,
            'tugasKe' => ['sometimes', 'integer', 'min:0', 'max:2'],
            'nilaiTugas' => ['present_with:tugasKe', ...$angka],
            'pts' => ['sometimes', ...$angka],
            'pas' => ['sometimes', ...$angka],
        ], ['integer' => 'Nilai harus berupa angka.', 'min' => 'Nilai paling kecil 0.', 'max' => 'Nilai paling besar 100.']);

        $nilai = Nilai::firstOrNew(['nis' => $siswa->nis, 'mapel' => $mapel]);
        $angkaAtauKosong = fn ($x) => $x === null ? null : (int) $x;
        if (array_key_exists('tugas', $isian)) {
            $nilai->tugas = array_map($angkaAtauKosong, array_values($isian['tugas']));
        }
        if (array_key_exists('tugasKe', $isian)) {
            $tugas = array_pad(array_values($nilai->tugas ?? []), 3, null);
            $tugas[$isian['tugasKe']] = $angkaAtauKosong($isian['nilaiTugas'] ?? null);
            $nilai->tugas = $tugas;
        }
        foreach (['pts', 'pas'] as $k) {
            if (array_key_exists($k, $isian)) {
                $nilai->{$k} = $isian[$k];
            }
        }
        $nilai->tugas ??= [];
        $nilai->save();

        return $this->tambalan(DataSekolah::petaNilai([(object) ['nis' => $nilai->nis, 'mapel' => $nilai->mapel, 'tugas' => $nilai->tugas, 'pts' => $nilai->pts, 'pas' => $nilai->pas]]));
    }

    // Catatan wali kelas di rapor: hanya wali kelas siswa itu. Teks kosong = kembali ke catatan bawaan.
    public function simpanCatatanWali(Request $request, Siswa $siswa): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->punya('rapor') && $a->kelas === $siswa->kelas, 'Hanya wali kelas yang boleh mengubah catatan rapor.');
        $teks = trim((string) $request->validate(['teks' => ['nullable', 'string', 'max:2000']], ['teks.max' => 'Catatan paling banyak 2000 karakter.'])['teks'] ?? '');

        if ($teks === '') {
            CatatanWali::whereKey($siswa->nis)->delete();
        } else {
            CatatanWali::updateOrCreate(['nis' => $siswa->nis], ['teks' => $teks]);
        }

        return $this->tambalan(['catatanWali' => [$siswa->nis => $teks === '' ? null : $teks]]);
    }

    // ===== Poin sikap =====

    // Beri satu kategori sikap ke satu atau beberapa siswa sekaligus
    public function beriSikap(Request $request): JsonResponse
    {
        $a = $this->akses($request);
        $isian = $request->validate([
            'nis' => ['required', 'array', 'min:1', 'max:60'],
            'nis.*' => ['string', 'distinct'],
            'kode' => ['required', Rule::in(array_column(Referensi::get('sikap'), 'kode'))],
            'catatan' => ['nullable', 'string', 'max:300'],
        ], ['nis.required' => 'Pilih minimal satu siswa.', 'kode.in' => 'Kategori sikap tidak dikenal.', 'catatan.max' => 'Catatan paling banyak 300 karakter.']);

        $siswa = Siswa::whereIn('nis', $isian['nis'])->get();
        if ($siswa->count() !== count($isian['nis'])) {
            throw ValidationException::withMessages(['nis' => 'Ada siswa yang tidak ditemukan.']);
        }
        foreach ($siswa as $s) {
            $a->wajib($a->bolehKelas('sikap', $s->kelas), "Kelas {$s->kelas} di luar lingkup Anda.");
        }

        $kategori = Referensi::sikap($isian['kode']);
        $baru = DB::transaction(fn () => $siswa->map(fn (Siswa $s) => Sikap::create([
            'nis' => $s->nis,
            'kode' => $kategori['kode'],
            'poin' => $kategori['poin'],
            'tanggal' => Waktu::hariIni(),
            'catatan' => trim($isian['catatan'] ?? ''),
            'oleh' => $a->nama,
        ])));

        return $this->tambalan(['sikap' => $baru->map->toArray()->all()], status: 201);
    }

    public function hapusSikap(Request $request, Sikap $sikap): JsonResponse
    {
        $a = $this->akses($request);
        // Catatan hanya dihapus oleh guru yang memberikannya (atau Kepala Sekolah)
        $a->wajib($a->bolehKelas('sikap', Siswa::where('nis', $sikap->nis)->value('kelas')) && ($sikap->oleh === $a->nama || $a->kepsek), 'Hanya guru yang memberi catatan ini yang bisa menghapusnya.');
        $sikap->delete();

        return $this->tambalan(hapus: ['sikap' => [$sikap->id]]);
    }

    // ===== Ekskul pilihan siswa =====

    // Siswa ikut/keluar ekskul. Ekskul wajib diikuti otomatis; ekskul pilihan tidak boleh bentrok jadwal.
    public function ekskul(Request $request, string $id): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->role === 'siswa', 'Hanya siswa yang bisa memilih ekskul.');
        $ekskul = Referensi::ekskul($id) ?? abort(404, 'Ekskul tidak ditemukan.');
        $kelas = (string) $a->kelasSiswa();
        if ($ekskul['wajib']) {
            throw ValidationException::withMessages(['ekskul' => "{$ekskul['nama']} wajib diikuti, tidak bisa keluar."]);
        }

        $kueri = DB::table('ekskul_siswa')->where('nis', $a->nis)->where('ekskul', $id);
        if ($kueri->exists()) {
            $kueri->delete();
        } else {
            if (Referensi::angkaKelas($kelas) < $ekskul['minKelas']) {
                throw ValidationException::withMessages(['ekskul' => "{$ekskul['nama']} untuk kelas {$ekskul['minKelas']} ke atas."]);
            }
            $diikuti = collect(Referensi::get('ekskul'))->filter(fn ($e) => ($e['wajib'] && Referensi::angkaKelas($kelas) >= $e['minKelas'])
                || DB::table('ekskul_siswa')->where('nis', $a->nis)->where('ekskul', $e['id'])->exists());
            if ($bentrok = self::bentrok($ekskul, $diikuti->all())) {
                throw ValidationException::withMessages(['ekskul' => "Jadwal bentrok dengan {$bentrok['nama']}."]);
            }
            DB::table('ekskul_siswa')->insert(['nis' => $a->nis, 'ekskul' => $id, 'created_at' => now()]);
        }

        return $this->tambalan(['ekskul' => [$a->nis => DB::table('ekskul_siswa')->where('nis', $a->nis)->orderBy('created_at')->pluck('ekskul')->all()]]);
    }

    // Ekskul lain yang jadwalnya bertumpuk (ekskulBentrok di src/utils/ekskul.js)
    public static function bentrok(array $e, array $diikuti): ?array
    {
        $hari = fn ($x) => preg_split('/\s*[&,]\s*/u', $x['hari']);
        $jam = fn ($x) => array_map(function ($j) {
            [$h, $m] = array_map('intval', explode('.', $j));

            return $h * 60 + $m;
        }, preg_split('/\s*[–-]\s*/u', $x['jam']));
        [$mulai, $selesai] = $jam($e);
        foreach ($diikuti as $x) {
            if ($x['id'] === $e['id'] || ! array_intersect($hari($x), $hari($e))) {
                continue;
            }
            [$m, $s] = $jam($x);
            if ($mulai < $s && $m < $selesai) {
                return $x;
            }
        }

        return null;
    }
}
