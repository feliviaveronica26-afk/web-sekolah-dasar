<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

/*
  Data orang tua/wali satu keluarga (kakak-adik memakai data yang sama lewat siswa.orang_tua_id).
  Kolom snake_case di database, camelCase di website (nama_ayah ↔ namaAyah), lewat ModelSekolah.
*/
class OrangTua extends ModelSekolah
{
    // Kolom yang boleh diubah orang tua sendiri dari portalnya (nama & tautan anak diurus Tata Usaha)
    public const KONTAK = ['pekerjaan_ayah', 'pekerjaan_ibu', 'whatsapp', 'email', 'alamat'];

    protected $table = 'orang_tua';

    protected string $awalanId = 'o';

    public function anak(): HasMany
    {
        return $this->hasMany(Siswa::class, 'orang_tua_id')->orderBy('nis');
    }

    // Nama yang dipakai menyapa keluarga ini: ibu, ayah, atau wali
    public function namaKontak(): string
    {
        return $this->nama_ibu ?: ($this->nama_ayah ?: $this->nama_wali);
    }
}
