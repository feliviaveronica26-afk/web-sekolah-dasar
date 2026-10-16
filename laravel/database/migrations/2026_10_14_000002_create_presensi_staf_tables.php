<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Presensi guru & staf (jam masuk/pulang, koreksi kepala sekolah) dan pengajuan izin/cuti/dinas luar
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presensi_staf', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->string('guru_id', 40)->index();
            $table->char('status', 1)->comment('H hadir, D dinas luar, I izin, S sakit, C cuti, A alpa');
            $table->string('masuk', 5)->nullable();
            $table->string('pulang', 5)->nullable();
            $table->string('alasan_masuk', 300)->nullable()->comment('Alasan terlambat');
            $table->string('alasan_pulang', 300)->nullable()->comment('Alasan pulang lebih awal');
            $table->string('ket', 300)->nullable();
            $table->string('izin_id', 40)->nullable();
            $table->json('koreksi')->nullable()->comment('Riwayat koreksi kepala sekolah');
            $table->timestamps();
            $table->unique(['tanggal', 'guru_id']);
            $table->foreign('guru_id')->references('id')->on('guru')->cascadeOnDelete();
        });

        Schema::create('izin_staf', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->string('guru_id', 40)->index();
            $table->string('nama', 120);
            $table->string('jenis', 12)->comment('Sakit / Izin / Cuti / Dinas Luar');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->text('alasan');
            $table->string('lampiran', 200)->default('');
            $table->string('status', 12)->default('Menunggu');
            $table->text('catatan')->nullable();
            $table->dateTime('diajukan', 3);
            $table->string('diproses_oleh', 120)->nullable();
            $table->dateTime('diproses', 3)->nullable();
            $table->timestamps();
            $table->foreign('guru_id')->references('id')->on('guru')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('izin_staf');
        Schema::dropIfExists('presensi_staf');
    }
};
