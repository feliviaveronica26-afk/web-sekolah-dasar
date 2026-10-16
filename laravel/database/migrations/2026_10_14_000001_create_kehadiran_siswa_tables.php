<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
  Kehadiran siswa: presensi harian (wali kelas), presensi per pelajaran (guru pengampu), sesi kode
  OTP yang dibuka guru, dan pengajuan izin dari orang tua. Kolom cara/jam/oleh/sebelum/otp adalah
  jejak siapa dan bagaimana kehadiran dicatat (kosong untuk data lama).
*/
return new class extends Migration
{
    public function up(): void
    {
        $jejak = function (Blueprint $table) {
            $table->string('cara', 10)->nullable()->comment('otp / guru / izin');
            $table->string('jam', 5)->nullable()->comment('Jam dicatat, mis. 07.05');
            $table->string('oleh', 120)->nullable()->comment('Guru yang mengubah');
            $table->char('sebelum', 1)->nullable()->comment('Status sebelum diubah');
            $table->string('otp', 5)->nullable()->comment('Jam siswa mengisi kode, sebelum diubah guru');
            $table->string('sesi_id', 40)->nullable();
        };

        Schema::create('absensi_harian', function (Blueprint $table) use ($jejak) {
            $table->id();
            $table->date('tanggal');
            $table->string('nis', 20)->index();
            $table->char('status', 1)->comment('H hadir, S sakit, I izin, A alpa');
            $jejak($table);
            $table->string('pelajaran', 30)->nullable()->comment('Kunci pelajaran jika tercatat lewat kode pelajaran');
            $table->timestamps();
            $table->unique(['tanggal', 'nis']);
            $table->foreign('nis')->references('nis')->on('siswa')->cascadeOnUpdate()->cascadeOnDelete();
        });

        Schema::create('absensi_pelajaran', function (Blueprint $table) use ($jejak) {
            $table->id();
            $table->date('tanggal');
            $table->string('nis', 20)->index();
            $table->string('kunci', 30)->comment('Sesi ke-n + kode mapel, mis. 2-bing');
            $table->char('status', 1);
            $jejak($table);
            $table->timestamps();
            $table->unique(['tanggal', 'nis', 'kunci']);
            $table->foreign('nis')->references('nis')->on('siswa')->cascadeOnUpdate()->cascadeOnDelete();
        });

        Schema::create('sesi_presensi', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->string('kelas', 3);
            $table->date('tanggal');
            $table->unsignedTinyInteger('jam')->nullable()->comment('Sesi pelajaran ke-n; kosong = presensi harian');
            $table->string('mapel', 20)->nullable();
            $table->string('kunci', 30)->nullable();
            $table->string('kode', 6)->comment('Kode OTP; hanya dikirim ke guru');
            $table->dateTime('mulai', 3);
            $table->dateTime('berakhir', 3);
            $table->string('oleh', 120);
            $table->string('guru_id', 40)->nullable();
            $table->boolean('ditutup')->default(false);
            $table->json('gagal')->nullable()->comment('Jumlah salah kode per NIS');
            $table->timestamps();
            $table->index(['kelas', 'tanggal']);
        });

        Schema::create('izin_siswa', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->string('nis', 20)->index();
            $table->string('nama_siswa', 120);
            $table->string('kelas', 3);
            $table->string('jenis', 10)->comment('Sakit / Izin');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->text('alasan');
            $table->string('lampiran', 200)->default('');
            $table->string('status', 12)->default('Menunggu');
            $table->text('catatan_guru')->nullable();
            $table->dateTime('diajukan', 3);
            $table->string('diproses_oleh', 120)->nullable();
            $table->dateTime('diproses', 3)->nullable();
            $table->timestamps();
            $table->foreign('nis')->references('nis')->on('siswa')->cascadeOnUpdate()->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('izin_siswa');
        Schema::dropIfExists('sesi_presensi');
        Schema::dropIfExists('absensi_pelajaran');
        Schema::dropIfExists('absensi_harian');
    }
};
