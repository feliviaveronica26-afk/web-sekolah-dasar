<?php

namespace App\Models;

// Catatan wali kelas di rapor.
class CatatanWali extends ModelSekolah
{
    protected $table = 'catatan_wali';

    protected $primaryKey = 'nis';

    protected $keyType = 'string';

    public $incrementing = false;
}
