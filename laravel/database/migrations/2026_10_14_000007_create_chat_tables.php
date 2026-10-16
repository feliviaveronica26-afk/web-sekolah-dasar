<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
  Chat sekolah. ID pengguna chat: s:<nis> siswa, o:<nis anak> orang tua, g:<id guru> guru & staf.
  Percakapan: grup:kelas:<kelas>, grup:ortu:<kelas>, grup:staf, atau p:<id>|<id> untuk chat pribadi.
  Isi berkas (foto, suara, dokumen) disimpan di storage/app/private/chat.
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_pesan', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->string('percakapan', 80)->index();
            $table->string('dari', 40);
            $table->dateTime('waktu', 3);
            $table->text('teks')->nullable();
            $table->json('lampiran')->nullable()->comment('Data berkas: id, nama, jenis, ukuran, tipe, durasi');
            $table->json('dihapus')->nullable()->comment('Siapa & kapan pesan dihapus');
            $table->dateTime('diubah', 3)->index()->comment('Untuk mengambil pesan baru/berubah saja');
        });

        Schema::create('chat_dibaca', function (Blueprint $table) {
            $table->string('pengguna', 40);
            $table->string('percakapan', 80);
            $table->dateTime('waktu', 3);
            $table->primary(['pengguna', 'percakapan']);
        });

        Schema::create('chat_grup', function (Blueprint $table) {
            $table->string('percakapan', 80)->primary();
            $table->boolean('hanya_admin')->default(false)->comment('Hanya pengelola grup yang boleh mengirim');
            $table->string('oleh', 40);
            $table->dateTime('waktu', 3);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_grup');
        Schema::dropIfExists('chat_dibaca');
        Schema::dropIfExists('chat_pesan');
    }
};
