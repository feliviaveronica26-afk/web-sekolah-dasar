<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
  Jadwal pelajaran & kalender akademik (sebelumnya tertulis di kode website) agar bisa diubah Wakasek
  Kurikulum dari portal. Jadwal: satu baris per kelas-hari-jam ke; jam kosong = tidak ada baris.
  Kalender: agenda libur/ujian/kegiatan; tanggal berjenis "libur" menghentikan presensi.
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_pelajaran', function (Blueprint $table) {
            $table->id();
            $table->string('kelas', 3);
            $table->string('hari', 10)->comment('Senin – Jumat');
            $table->unsignedTinyInteger('jam')->comment('Urutan sesi, 0 = sesi pertama');
            $table->string('mapel', 20)->comment('Kode mapel, mis. mtk');
            $table->timestamps();
            $table->unique(['kelas', 'hari', 'jam']);
        });

        Schema::create('kalender', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->date('mulai')->index();
            $table->date('selesai')->nullable()->comment('Kosong = satu hari');
            $table->string('judul', 150);
            $table->string('jenis', 12)->comment('libur | ujian | kegiatan');
            $table->boolean('perkiraan')->default(false)->comment('Tanggal belum pasti (mis. menunggu SKB 3 Menteri)');
            $table->string('keterangan', 500)->default('');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kalender');
        Schema::dropIfExists('jadwal_pelajaran');
    }
};
