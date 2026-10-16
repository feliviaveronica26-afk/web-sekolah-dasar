<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
  Akun website sekolah memakai tabel users bawaan Laravel, ditambah kolom untuk peran dan
  keterhubungan ke data guru / siswa. Login memakai username (bukan email).
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 60)->unique()->after('id')->comment('Huruf kecil; login tidak membedakan huruf besar/kecil');
            $table->string('role', 10)->default('siswa')->after('username')->comment('kepsek | staf | siswa | ortu');
            $table->string('guru_id', 40)->nullable()->after('role')->comment('Akun guru & staf: kode guru, mis. g2');
            $table->string('nis', 20)->nullable()->after('guru_id')->comment('Akun siswa: NIS');
            $table->string('kelas', 3)->nullable()->after('nis')->comment('Akun siswa: kelas, mis. 4A');
            $table->string('anak_nis', 20)->nullable()->after('kelas')->comment('Akun orang tua: NIS anak');
            $table->string('hash_lama', 200)->nullable()->after('password')->comment('Hash PBKDF2 dari website lama; diganti bcrypt saat login pertama');
            $table->boolean('aktif')->default(true)->after('hash_lama');
            $table->string('email')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['username']);
            $table->dropColumn(['username', 'role', 'guru_id', 'nis', 'kelas', 'anak_nis', 'hash_lama', 'aktif']);
        });
    }
};
