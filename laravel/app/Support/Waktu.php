<?php

namespace App\Support;

use Carbon\CarbonImmutable;
use DateTimeInterface;

/*
  Waktu sekolah. Website menyimpan tanggal sebagai 'YYYY-MM-DD' dan jam sebagai '07.05' menurut jam
  sekolah (config sekolah.zona), sedangkan waktu lengkap dikirim sebagai ISO UTC dengan milidetik
  ('2026-10-14T00:05:00.000Z') sehingga bisa diurutkan sebagai teks.
*/
final class Waktu
{
    public static function sekarang(): CarbonImmutable
    {
        return CarbonImmutable::now(config('sekolah.zona'));
    }

    public static function hariIni(): string
    {
        return self::sekarang()->toDateString();
    }

    public static function jam(): string
    {
        return self::sekarang()->format('H.i');
    }

    public static function iso(?DateTimeInterface $waktu = null): string
    {
        return CarbonImmutable::instance($waktu ?? now())->utc()->format('Y-m-d\TH:i:s.v\Z');
    }

    public static function hariSekolah(string $tanggal): bool
    {
        return ! CarbonImmutable::parse($tanggal)->isWeekend();
    }

    // Semua hari sekolah (Senin – Jumat) dari $mulai sampai $selesai
    public static function rentangHariSekolah(string $mulai, string $selesai): array
    {
        $hasil = [];
        for ($d = CarbonImmutable::parse($mulai); $d->toDateString() <= $selesai; $d = $d->addDay()) {
            if (! $d->isWeekend()) {
                $hasil[] = $d->toDateString();
            }
        }

        return $hasil;
    }
}
