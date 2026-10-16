<?php

namespace App\Models;

use App\Support\Referensi;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Guru & staf sekolah. `id` memakai kode yang sama dengan website (mis. "g2"), karena presensi,
 * izin, dan chat di website merujuk guru lewat kode itu. Kolom memakai snake_case di database dan
 * camelCase di website (tanggal_lahir ↔ tanggalLahir).
 */
class Guru extends Model
{
    // Jabatan di Portal Guru & Staf (PERAN di sd-app/src/context/akses.js)
    public const PERAN = [
        'wali_kelas', 'guru_mapel', 'wakasek_kurikulum', 'wakasek_kesiswaan', 'tata_usaha',
        'pustakawan', 'wakasek_sarpras', 'guru_bk', 'satpam',
    ];

    // Kelas 1A – 6C (KELAS di sd-app/src/data/dummy.js)
    public const KELAS = [
        '1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C',
        '4A', '4B', '4C', '5A', '5B', '5C', '6A', '6B', '6C',
    ];

    public const STATUS_PEGAWAI = ['PNS', 'PPPK', 'GTY', 'GTT', 'PTY', 'Honorer'];

    // Biodata pribadi: hanya untuk Kepala Sekolah dan pemiliknya sendiri
    public const PRIBADI = ['nip', 'tempat_lahir', 'tanggal_lahir', 'agama', 'alamat', 'whatsapp', 'email', 'status_pegawai', 'mulai_tugas'];

    protected $table = 'guru';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'nama', 'nip', 'jabatan', 'mapel', 'peran', 'kelas', 'jk', 'tempat_lahir', 'tanggal_lahir', 'agama',
        'alamat', 'whatsapp', 'email', 'pendidikan', 'status_pegawai', 'mulai_tugas', 'mapel_diampu',
    ];

    protected $hidden = ['urutan', 'created_at', 'updated_at'];

    protected function casts(): array
    {
        return ['peran' => 'array', 'mapel_diampu' => 'array', 'tanggal_lahir' => 'date:Y-m-d', 'mulai_tugas' => 'date:Y-m-d'];
    }

    public function punyaPeran(string $peran): bool
    {
        return in_array($peran, $this->peran ?? [], true);
    }

    // Mapel yang diajar sebagai guru mapel (kosong bila bukan guru mapel)
    public function mapelDiampu(): array
    {
        return $this->punyaPeran('guru_mapel') ? ($this->mapel_diampu ?? []) : [];
    }

    // Kode mapel yang boleh dipilih sebagai mapel diampu: semua mapel kecuali yang dipegang bersama (upacara, pramuka)
    public static function kodeMapelDiampu(): array
    {
        return array_keys(array_filter(Referensi::get('mapel', []), fn ($m) => empty($m['pengampu'])));
    }

    public function toArray(): array
    {
        return collect(parent::toArray())->mapWithKeys(fn ($nilai, $kolom) => [Str::camel($kolom) => $nilai])->all();
    }

    /*
      Data guru untuk website sesuai siapa yang melihat: biodata pribadi dibuka untuk Kepala Sekolah
      dan pemiliknya saja; Kepala Sekolah juga menerima status akun login tiap guru (tanpa password).
    */
    public static function untukWebsite(Collection $daftar, ?User $user): array
    {
        $kepsek = $user?->role === 'kepsek';
        $akun = $kepsek ? User::whereIn('guru_id', $daftar->pluck('id'))->get()->keyBy('guru_id') : collect();

        return $daftar->map(function (self $g) use ($user, $kepsek, $akun) {
            if (! $kepsek && ($user === null || $g->id !== $user->guru_id)) {
                $g->makeHidden(self::PRIBADI);
            }
            $data = $g->toArray();
            if ($kepsek) {
                $u = $akun->get($g->id);
                $data['akun'] = $u ? ['username' => $u->username, 'aktif' => $u->aktif, 'wajibGanti' => (bool) $u->wajib_ganti_password] : null;
            }

            return $data;
        })->values()->all();
    }
}
