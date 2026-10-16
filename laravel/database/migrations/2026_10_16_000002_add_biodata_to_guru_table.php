<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
  Biodata guru & staf (sebelumnya belum tersimpan di mana pun) dan mapel yang diampu guru mapel.
  Mapel yang diampu menggantikan pencocokan lewat nama guru di data acuan, sehingga mengganti
  nama/gelar guru tidak lagi menghapus hak menilai mapelnya.
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guru', function (Blueprint $table) {
            $table->string('jk', 1)->default('')->after('kelas')->comment('L | P');
            $table->string('tempat_lahir', 60)->default('')->after('jk');
            $table->date('tanggal_lahir')->nullable()->after('tempat_lahir');
            $table->string('agama', 20)->default('')->after('tanggal_lahir');
            $table->string('alamat', 300)->default('')->after('agama');
            $table->string('whatsapp', 20)->default('')->after('alamat');
            $table->string('email', 120)->default('')->after('whatsapp');
            $table->string('pendidikan', 80)->default('')->after('email')->comment('Pendidikan terakhir, mis. S1 PGSD');
            $table->string('status_pegawai', 20)->default('')->after('pendidikan')->comment('PNS | PPPK | GTY | GTT | PTY | Honorer');
            $table->date('mulai_tugas')->nullable()->after('status_pegawai');
            $table->json('mapel_diampu')->nullable()->after('mulai_tugas')->comment('Guru mapel: kode mapel yang diajar di semua kelas, mis. ["bing"]');
        });
    }

    public function down(): void
    {
        Schema::table('guru', function (Blueprint $table) {
            $table->dropColumn(['jk', 'tempat_lahir', 'tanggal_lahir', 'agama', 'alamat', 'whatsapp', 'email', 'pendidikan', 'status_pegawai', 'mulai_tugas', 'mapel_diampu']);
        });
    }
};
