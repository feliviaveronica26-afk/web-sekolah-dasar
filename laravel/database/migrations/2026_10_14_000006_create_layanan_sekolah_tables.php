<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
  Pengumuman, PPDB, kunjungan sekolah, buku tamu, sarana prasarana (inventaris & laporan
  kerusakan), dan catatan bimbingan konseling.
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengumuman', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->string('judul', 200);
            $table->string('kategori', 30);
            $table->date('tanggal')->index();
            $table->text('isi');
            $table->timestamps();
        });

        Schema::create('pendaftar', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->string('nomor', 20)->unique()->comment('Nomor pendaftaran, mis. PPDB-2027-0001');
            $table->string('nama', 120);
            $table->string('panggilan', 40)->default('');
            $table->char('jk', 1);
            $table->string('tempat_lahir', 60);
            $table->date('tanggal_lahir');
            $table->string('nik', 16);
            $table->string('agama', 20);
            $table->string('asal_tk', 120)->default('');
            $table->string('alamat', 300);
            $table->string('nama_ayah', 120)->default('');
            $table->string('pekerjaan_ayah', 80)->default('');
            $table->string('nama_ibu', 120)->default('');
            $table->string('pekerjaan_ibu', 80)->default('');
            $table->string('whatsapp', 20);
            $table->string('email', 120)->default('');
            $table->string('jalur', 30);
            $table->string('info_jalur', 300)->default('');
            $table->json('berkas')->comment('Nama berkas yang diunggah per jenis');
            $table->string('status', 30)->default('Menunggu Verifikasi');
            $table->text('catatan_panitia')->nullable();
            $table->dateTime('dibuat', 3);
            $table->timestamps();
        });

        Schema::create('kunjungan', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->string('kode', 12)->unique()->comment('Kode untuk cek status, mis. KJG-4821');
            $table->string('nama', 120);
            $table->string('whatsapp', 20);
            $table->date('tanggal');
            $table->string('sesi', 20);
            $table->unsignedTinyInteger('jumlah');
            $table->string('keperluan', 60);
            $table->json('fasilitas');
            $table->string('catatan', 500)->default('');
            $table->string('status', 15)->default('Menunggu');
            $table->string('catatan_tu', 500)->nullable();
            $table->dateTime('dibuat', 3);
            $table->timestamps();
            $table->index(['tanggal', 'sesi']);
        });

        Schema::create('buku_tamu', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->date('tanggal')->index();
            $table->string('nama', 120);
            $table->string('instansi', 120)->default('');
            $table->string('keperluan', 60);
            $table->string('bertemu', 120)->default('');
            $table->string('whatsapp', 20)->default('');
            $table->unsignedTinyInteger('jumlah')->default(1);
            $table->string('masuk', 5);
            $table->string('keluar', 5)->default('');
            $table->string('kode_kunjungan', 12)->nullable()->comment('Jika tamu datang dari kunjungan terjadwal');
            $table->timestamps();
        });

        Schema::create('inventaris', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->string('nama', 120);
            $table->string('kategori', 30);
            $table->string('lokasi', 60);
            $table->unsignedInteger('jumlah');
            $table->string('kondisi', 20);
            $table->string('keterangan', 500)->default('');
            $table->timestamps();
        });

        Schema::create('kerusakan', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->string('nama', 150);
            $table->string('lokasi', 60);
            $table->string('pelapor', 120);
            $table->date('tanggal');
            $table->string('prioritas', 10);
            $table->string('status', 15);
            $table->string('keterangan', 500)->default('');
            $table->timestamps();
        });

        Schema::create('konseling', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->string('nis', 20)->index();
            $table->string('nama', 120);
            $table->string('kelas', 3);
            $table->date('tanggal');
            $table->string('kategori', 20);
            $table->string('layanan', 40);
            $table->text('masalah');
            $table->text('tindak_lanjut')->nullable();
            $table->string('status', 20);
            $table->timestamps();
            $table->foreign('nis')->references('nis')->on('siswa')->cascadeOnUpdate()->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('konseling');
        Schema::dropIfExists('kerusakan');
        Schema::dropIfExists('inventaris');
        Schema::dropIfExists('buku_tamu');
        Schema::dropIfExists('kunjungan');
        Schema::dropIfExists('pendaftar');
        Schema::dropIfExists('pengumuman');
    }
};
