<?php

namespace App\Models;

use App\Support\Waktu;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/*
  Dasar model data sekolah. Kolom database memakai snake_case (tanggal_mulai), sedangkan website
  memakai camelCase (tanggalMulai): toArray() dan dariWebsite() menerjemahkannya. Waktu lengkap
  dikirim sebagai ISO UTC dengan milidetik, sama dengan new Date().toISOString() di website.

  Model dengan $awalanId memakai id teks (mis. "kr01j..."), karena data contoh & website merujuk
  data lewat id seperti "kr1" atau "b9".
*/
abstract class ModelSekolah extends Model
{
    protected $guarded = [];

    protected $hidden = ['created_at', 'updated_at'];

    // Simpan milidetik pada kolom waktu (DATETIME(3))
    protected $dateFormat = 'Y-m-d H:i:s.v';

    protected string $awalanId = '';

    protected static function booted(): void
    {
        static::creating(function (self $model) {
            if ($model->awalanId !== '' && ! $model->getKey()) {
                $model->setAttribute($model->getKeyName(), $model->awalanId.Str::lower((string) Str::ulid()));
            }
        });
    }

    public function getIncrementing(): bool
    {
        return $this->awalanId === '' && parent::getIncrementing();
    }

    public function getKeyType(): string
    {
        return $this->awalanId === '' ? parent::getKeyType() : 'string';
    }

    public function toArray(): array
    {
        $hasil = [];
        foreach (parent::toArray() as $kunci => $nilai) {
            $hasil[Str::camel($kunci)] = $nilai;
        }

        return $hasil;
    }

    // Isian dari website (camelCase) menjadi kolom database (snake_case)
    public static function dariWebsite(array $isian): array
    {
        $hasil = [];
        foreach ($isian as $kunci => $nilai) {
            $hasil[Str::snake($kunci)] = $nilai;
        }

        return $hasil;
    }

    protected function serializeDate(DateTimeInterface $date): string
    {
        return Waktu::iso($date);
    }
}
