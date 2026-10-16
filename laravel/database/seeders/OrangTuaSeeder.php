<?php

namespace Database\Seeders;

use App\Models\OrangTua;
use App\Models\Siswa;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/*
  Data contoh orang tua (fiktif) untuk setiap siswa yang belum terhubung ke data keluarga. Nama kontak
  di siswa.ortu dipakai sebagai nama ayah atau ibu; pasangannya, pekerjaan, alamat, dan nomor WhatsApp
  dibuat dari daftar tetap berdasarkan NIS, jadi hasilnya selalu sama. Nomor WhatsApp memakai pola
  0813-00xx-xxxx agar tidak mengenai nomor orang sungguhan. Aman dijalankan ulang.
*/
class OrangTuaSeeder extends Seeder
{
    private const NAMA_PEREMPUAN = [
        'Dewi', 'Sri', 'Yuliana', 'Ratna', 'Siti', 'Rahmi', 'Lina', 'Endang', 'Nani', 'Maya', 'Rina', 'Evi', 'Ratih', 'Yanti',
        'Dian', 'Wulan', 'Fitria', 'Tuti', 'Nurul', 'Ani', 'Endah', 'Nur',
    ];

    private const AYAH = ['Bayu Hermanto', 'Agus Priyanto', 'Dedi Supriadi', 'Eko Prasetyo', 'Hendra Kusuma', 'Irfan Maulana', 'Joko Purnomo', 'Rudi Hermawan', 'Sugeng Riyadi', 'Wawan Setiadi', 'Yoga Pratama', 'Zulkifli Ramdan'];

    private const IBU = ['Ani Suryani', 'Dewi Kurniasih', 'Erna Wati', 'Fitri Yani', 'Heni Purwanti', 'Indah Sari', 'Kartika Dewi', 'Lia Rosmawati', 'Mira Lestari', 'Novi Andriani', 'Ratna Wulandari', 'Susi Handayani'];

    private const PEKERJAAN_AYAH = ['Karyawan Swasta', 'Wiraswasta', 'PNS', 'Guru', 'Pedagang', 'Dokter', 'TNI/Polri', 'Petani', 'Sopir', 'Buruh', 'Pegawai BUMN', 'Montir'];

    private const PEKERJAAN_IBU = ['Ibu Rumah Tangga', 'Karyawan Swasta', 'Wiraswasta', 'Guru', 'Perawat', 'Pedagang', 'PNS', 'Ibu Rumah Tangga', 'Penjahit', 'Bidan'];

    private const JALAN = ['Melati', 'Kenanga', 'Flamboyan', 'Cempaka', 'Anggrek', 'Dahlia', 'Teratai', 'Mawar', 'Seroja', 'Kamboja', 'Bougenville', 'Nusa Indah', 'Asoka', 'Kemuning', 'Sakura', 'Tulip'];

    private const KELURAHAN = ['Sukamaju', 'Harapan Jaya', 'Mekarsari', 'Sukajadi', 'Cempaka Putih', 'Margahayu', 'Sindangsari', 'Cibeunying'];

    // Data siswa demo (230401, akun "ortu") disamakan dengan biodata contoh lamanya
    private const KHUSUS = ['230401' => ['alamat' => 'Jl. Melati No. 12, Kel. Sukamaju, Kota Harapan', 'whatsapp' => '0812-1111-2222']];

    public function run(): void
    {
        DB::transaction(function () {
            foreach (Siswa::whereNull('orang_tua_id')->orderBy('nis')->get() as $siswa) {
                $n = (int) $siswa->nis;
                $kontak = trim($siswa->ortu);
                $perempuan = in_array(strtok($kontak, ' '), self::NAMA_PEREMPUAN, true);
                // ID diisi di sini: DatabaseSeeder memakai WithoutModelEvents, jadi pembuat ID otomatis model tidak berjalan
                $keluarga = OrangTua::create([
                    'id' => 'o'.Str::lower((string) Str::ulid()),
                    'nama_ayah' => $perempuan ? self::AYAH[$n % count(self::AYAH)] : $kontak,
                    'pekerjaan_ayah' => self::PEKERJAAN_AYAH[($n * 7) % count(self::PEKERJAAN_AYAH)],
                    'nama_ibu' => $perempuan ? $kontak : self::IBU[$n % count(self::IBU)],
                    'pekerjaan_ibu' => self::PEKERJAAN_IBU[($n * 3) % count(self::PEKERJAAN_IBU)],
                    'whatsapp' => self::KHUSUS[$siswa->nis]['whatsapp'] ?? sprintf('0813-00%02d-%04d', intdiv($n, 10000) % 100, $n % 10000),
                    'email' => '',
                    'alamat' => self::KHUSUS[$siswa->nis]['alamat']
                        ?? sprintf('Jl. %s No. %d, Kel. %s, Kota Harapan', self::JALAN[$n % count(self::JALAN)], ($n * 13) % 60 + 1, self::KELURAHAN[($n * 5) % count(self::KELURAHAN)]),
                ]);
                $siswa->orang_tua_id = $keluarga->id;
                $siswa->save();
            }
        });
    }
}
