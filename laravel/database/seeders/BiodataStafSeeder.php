<?php

namespace Database\Seeders;

use App\Models\Guru;
use Illuminate\Database\Seeder;

/*
  Biodata contoh guru & staf (data/biodata-staf.json, fiktif) dan mapel yang diampu guru mapel.
  Hanya mengisi kolom yang masih kosong, jadi biodata yang sudah diisi lewat website tidak ditimpa.
*/
class BiodataStafSeeder extends Seeder
{
    private const KOLOM = [
        'jk' => 'jk', 'tempatLahir' => 'tempat_lahir', 'tanggalLahir' => 'tanggal_lahir', 'agama' => 'agama',
        'alamat' => 'alamat', 'whatsapp' => 'whatsapp', 'email' => 'email', 'pendidikan' => 'pendidikan',
        'statusPegawai' => 'status_pegawai', 'mulaiTugas' => 'mulai_tugas', 'mapelDiampu' => 'mapel_diampu',
    ];

    public function run(): void
    {
        $daftar = json_decode(file_get_contents(__DIR__.'/data/biodata-staf.json'), true, flags: JSON_THROW_ON_ERROR);

        foreach ($daftar as $bio) {
            $guru = Guru::find($bio['id']);
            if (! $guru) {
                continue;
            }
            foreach (self::KOLOM as $kunci => $kolom) {
                $kosong = $kolom === 'mapel_diampu' ? $guru->mapel_diampu === null : in_array($guru->getRawOriginal($kolom), [null, ''], true);
                if ($kosong) {
                    $guru->{$kolom} = $bio[$kunci];
                }
            }
            $guru->save();
        }
    }
}
