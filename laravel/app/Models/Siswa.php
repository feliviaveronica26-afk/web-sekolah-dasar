<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Siswa. Catatan lain merujuk siswa lewat NIS. Data orang tuanya ada di tabel orang_tua.
class Siswa extends ModelSekolah
{
    public const GOLONGAN_DARAH = ['A', 'B', 'AB', 'O'];

    // Biodata pribadi: hanya untuk yang berhak (Akses::lingkupBiodataSiswa)
    public const PRIBADI = ['nisn', 'tempat_lahir', 'tanggal_lahir', 'agama', 'golongan_darah', 'tanggal_masuk', 'asal_sekolah', 'catatan_kesehatan'];

    protected $table = 'siswa';

    protected string $awalanId = 's';

    // Tautan keluarga tidak dikirim bersama data siswa (teman sekelas tidak perlu tahu siapa kakak-adik siapa);
    // website membaca anak tiap keluarga dari koleksi orangTua
    protected $hidden = ['created_at', 'updated_at', 'orang_tua_id'];

    protected function casts(): array
    {
        return ['tanggal_lahir' => 'date:Y-m-d', 'tanggal_masuk' => 'date:Y-m-d'];
    }

    public function orangTua(): BelongsTo
    {
        return $this->belongsTo(OrangTua::class, 'orang_tua_id');
    }
}
