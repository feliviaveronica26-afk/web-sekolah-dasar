<?php

namespace App\Support;

use App\Models\Kalender;
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

    // Tanggal libur dari kalender akademik: ['YYYY-MM-DD' => judul agenda]. Disimpan selama permintaan.
    private static ?array $libur = null;

    public static function hariLibur(): array
    {
        if (self::$libur !== null) {
            return self::$libur;
        }
        $hasil = [];
        foreach (Kalender::where('jenis', 'libur')->orderBy('mulai')->get() as $k) {
            $akhir = ($k->selesai ?? $k->mulai)->toDateString();
            for ($d = CarbonImmutable::parse($k->mulai->toDateString()); $d->toDateString() <= $akhir; $d = $d->addDay()) {
                $hasil[$d->toDateString()] ??= $k->judul;
            }
        }

        return self::$libur = $hasil;
    }

    // Dipanggil setiap kali kalender berubah (model Kalender) dan di awal setiap tes
    public static function lupakanLibur(): void
    {
        self::$libur = null;
    }

    // Judul agenda libur pada tanggal itu, atau null
    public static function liburPada(string $tanggal): ?string
    {
        return self::hariLibur()[$tanggal] ?? null;
    }

    // Senin – Jumat yang tidak termasuk agenda libur di kalender akademik
    public static function hariSekolah(string $tanggal): bool
    {
        return ! CarbonImmutable::parse($tanggal)->isWeekend() && self::liburPada($tanggal) === null;
    }

    // Semua hari sekolah dari $mulai sampai $selesai
    public static function rentangHariSekolah(string $mulai, string $selesai): array
    {
        $hasil = [];
        for ($d = CarbonImmutable::parse($mulai); $d->toDateString() <= $selesai; $d = $d->addDay()) {
            if (self::hariSekolah($d->toDateString())) {
                $hasil[] = $d->toDateString();
            }
        }

        return $hasil;
    }
}
