<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
  Data orang tua/wali per keluarga. Siswa merujuk keluarganya lewat orang_tua_id, jadi kakak-adik
  memakai satu data keluarga. Kolom siswa.ortu tetap menjadi nama kontak utama yang tampil di portal.
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orang_tua', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->string('nama_ayah', 120)->default('');
            $table->string('pekerjaan_ayah', 80)->default('');
            $table->string('nama_ibu', 120)->default('');
            $table->string('pekerjaan_ibu', 80)->default('');
            $table->string('nama_wali', 120)->default('')->comment('Diisi bila anak diasuh wali');
            $table->string('hubungan_wali', 40)->default('')->comment('Mis. Kakek, Nenek, Paman');
            $table->string('whatsapp', 20)->default('')->comment('Nomor utama yang dihubungi sekolah');
            $table->string('email', 120)->default('');
            $table->string('alamat', 300)->default('');
            $table->timestamps();
        });

        Schema::table('siswa', function (Blueprint $table) {
            $table->string('orang_tua_id', 40)->nullable()->after('ortu');
            $table->foreign('orang_tua_id')->references('id')->on('orang_tua')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->dropForeign(['orang_tua_id']);
            $table->dropColumn('orang_tua_id');
        });
        Schema::dropIfExists('orang_tua');
    }
};
