<?php

namespace App\Models;

use App\Support\Waktu;

// Agenda kalender akademik. Agenda berjenis "libur" membuat tanggalnya bukan hari sekolah (Waktu::hariSekolah).
class Kalender extends ModelSekolah
{
    public const JENIS = ['libur', 'ujian', 'kegiatan'];

    protected $table = 'kalender';

    protected string $awalanId = 'kal';

    protected function casts(): array
    {
        return ['mulai' => 'date:Y-m-d', 'selesai' => 'date:Y-m-d', 'perkiraan' => 'boolean'];
    }

    protected static function booted(): void
    {
        parent::booted();
        static::saved(fn () => Waktu::lupakanLibur());
        static::deleted(fn () => Waktu::lupakanLibur());
    }
}
