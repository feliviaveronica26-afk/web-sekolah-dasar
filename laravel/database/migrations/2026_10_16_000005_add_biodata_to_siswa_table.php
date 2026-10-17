<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
  Biodata siswa (sebelumnya hanya contoh satu siswa di kode website). Bersifat pribadi: hanya
  pengelola Data Siswa, wali kelasnya, dan siswa/orang tuanya sendiri yang menerimanya (lihat
  Akses::lingkupBiodataSiswa). NISN boleh kosong, tetapi bila diisi tidak boleh sama.
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->string('nisn', 10)->nullable()->unique()->after('nis')->comment('Nomor Induk Siswa Nasional, 10 angka');
            $table->string('tempat_lahir', 60)->default('')->after('jk');
            $table->date('tanggal_lahir')->nullable()->after('tempat_lahir');
            $table->string('agama', 20)->default('')->after('tanggal_lahir');
            $table->string('golongan_darah', 2)->default('')->after('agama')->comment('A | B | AB | O');
            $table->date('tanggal_masuk')->nullable()->after('golongan_darah');
            $table->string('asal_sekolah', 120)->default('')->after('tanggal_masuk')->comment('TK/RA asal atau sekolah asal siswa pindahan');
            $table->string('catatan_kesehatan', 300)->default('')->after('asal_sekolah')->comment('Alergi atau kondisi yang perlu diketahui guru');
        });
    }

    public function down(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->dropUnique(['nisn']);
            $table->dropColumn(['nisn', 'tempat_lahir', 'tanggal_lahir', 'agama', 'golongan_darah', 'tanggal_masuk', 'asal_sekolah', 'catatan_kesehatan']);
        });
    }
};
