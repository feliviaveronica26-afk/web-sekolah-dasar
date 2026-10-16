<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
  Data siswa. Catatan lain (absensi, nilai, SPP, ...) merujuk siswa lewat NIS, seperti di website.
  Jika NIS diubah, rujukannya ikut berubah (ON UPDATE CASCADE); jika siswa dihapus, catatannya ikut terhapus.
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('siswa', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->string('nis', 20)->unique();
            $table->string('nama', 120);
            $table->string('kelas', 3)->index();
            $table->char('jk', 1)->comment('L / P');
            $table->string('ortu', 120)->comment('Nama orang tua/wali');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('siswa');
    }
};
