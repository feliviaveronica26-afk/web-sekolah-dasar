<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Siswa. Catatan lain merujuk siswa lewat NIS. Data orang tuanya ada di tabel orang_tua.
class Siswa extends ModelSekolah
{
    protected $table = 'siswa';

    protected string $awalanId = 's';

    // Tautan keluarga tidak dikirim bersama data siswa (teman sekelas tidak perlu tahu siapa kakak-adik siapa);
    // website membaca anak tiap keluarga dari koleksi orangTua
    protected $hidden = ['created_at', 'updated_at', 'orang_tua_id'];

    public function orangTua(): BelongsTo
    {
        return $this->belongsTo(OrangTua::class, 'orang_tua_id');
    }
}
