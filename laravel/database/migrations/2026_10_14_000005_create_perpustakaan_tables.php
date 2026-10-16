<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Perpustakaan: katalog buku, peminjaman, dan pesanan (reservasi) buku dari siswa
return new class extends Migration
{
    public function up(): void
    {
        $nis = fn (Blueprint $table) => $table->foreign('nis')->references('nis')->on('siswa')->cascadeOnUpdate()->cascadeOnDelete();

        Schema::create('buku', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->string('judul', 150);
            $table->string('penulis', 120);
            $table->string('kategori', 60);
            $table->unsignedSmallInteger('stok')->comment('Jumlah eksemplar');
            $table->timestamps();
        });

        Schema::create('peminjaman', function (Blueprint $table) use ($nis) {
            $table->string('id', 40)->primary();
            $table->string('buku_id', 40)->index();
            $table->string('nis', 20)->index();
            $table->date('tanggal_pinjam');
            $table->date('tenggat');
            $table->date('tanggal_kembali')->nullable();
            $table->timestamps();
            $table->foreign('buku_id')->references('id')->on('buku')->cascadeOnDelete();
            $nis($table);
        });

        Schema::create('reservasi', function (Blueprint $table) use ($nis) {
            $table->string('id', 40)->primary();
            $table->string('nis', 20)->index();
            $table->string('buku_id', 40)->index();
            $table->date('tanggal');
            $table->string('status', 12)->default('Menunggu');
            $table->timestamps();
            $table->foreign('buku_id')->references('id')->on('buku')->cascadeOnDelete();
            $nis($table);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservasi');
        Schema::dropIfExists('peminjaman');
        Schema::dropIfExists('buku');
    }
};
