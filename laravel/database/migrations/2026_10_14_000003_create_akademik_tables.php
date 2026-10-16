<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tugas/PR, nilai rapor, catatan wali kelas, poin sikap, dan ekskul pilihan siswa
return new class extends Migration
{
    public function up(): void
    {
        $nis = fn (Blueprint $table) => $table->foreign('nis')->references('nis')->on('siswa')->cascadeOnUpdate()->cascadeOnDelete();

        Schema::create('tugas', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->string('kelas', 3)->index();
            $table->string('mapel', 20);
            $table->string('judul', 150);
            $table->text('deskripsi');
            $table->date('diberikan');
            $table->date('tenggat');
            $table->timestamps();
        });

        Schema::create('tugas_selesai', function (Blueprint $table) use ($nis) {
            $table->string('nis', 20);
            $table->string('tugas_id', 40);
            $table->timestamp('created_at')->nullable();
            $table->primary(['nis', 'tugas_id']);
            $nis($table);
            $table->foreign('tugas_id')->references('id')->on('tugas')->cascadeOnDelete();
        });

        Schema::create('nilai', function (Blueprint $table) use ($nis) {
            $table->id();
            $table->string('nis', 20);
            $table->string('mapel', 20);
            $table->json('tugas')->nullable()->comment('Nilai tugas 1–3');
            $table->unsignedTinyInteger('pts')->nullable();
            $table->unsignedTinyInteger('pas')->nullable();
            $table->timestamps();
            $table->unique(['nis', 'mapel']);
            $nis($table);
        });

        Schema::create('catatan_wali', function (Blueprint $table) use ($nis) {
            $table->string('nis', 20)->primary();
            $table->text('teks');
            $table->timestamps();
            $nis($table);
        });

        Schema::create('sikap', function (Blueprint $table) use ($nis) {
            $table->string('id', 40)->primary();
            $table->string('nis', 20)->index();
            $table->string('kode', 20);
            $table->tinyInteger('poin');
            $table->date('tanggal');
            $table->string('catatan', 300)->default('');
            $table->string('oleh', 120);
            $table->timestamps();
            $nis($table);
        });

        Schema::create('ekskul_siswa', function (Blueprint $table) use ($nis) {
            $table->string('nis', 20);
            $table->string('ekskul', 30);
            $table->timestamp('created_at')->nullable();
            $table->primary(['nis', 'ekskul']);
            $nis($table);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ekskul_siswa');
        Schema::dropIfExists('sikap');
        Schema::dropIfExists('catatan_wali');
        Schema::dropIfExists('nilai');
        Schema::dropIfExists('tugas_selesai');
        Schema::dropIfExists('tugas');
    }
};
