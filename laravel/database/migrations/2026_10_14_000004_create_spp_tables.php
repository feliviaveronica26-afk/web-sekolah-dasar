<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// SPP: bulan yang sudah lunas per siswa, dan transaksi pembayaran online (QRIS / virtual account)
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spp_pembayaran', function (Blueprint $table) {
            $table->id();
            $table->string('nis', 20);
            $table->char('bulan', 7)->comment('YYYY-MM');
            $table->date('tanggal')->index();
            $table->string('metode', 30);
            $table->string('no_transaksi', 40);
            $table->unsignedInteger('jumlah');
            $table->timestamps();
            $table->unique(['nis', 'bulan']);
            $table->foreign('nis')->references('nis')->on('siswa')->cascadeOnUpdate()->cascadeOnDelete();
        });

        Schema::create('transaksi_spp', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->string('nis', 20)->index();
            $table->json('bulan');
            $table->unsignedInteger('total');
            $table->string('metode', 10)->comment('qris / va');
            $table->string('bank', 10)->nullable();
            $table->string('metode_label', 30);
            $table->string('kode', 60)->comment('Nomor VA atau kode QRIS');
            $table->string('no_transaksi', 40);
            $table->string('status', 12)->comment('menunggu / berhasil / dibatalkan');
            $table->dateTime('dibuat', 3);
            $table->dateTime('kadaluarsa', 3);
            $table->dateTime('dibayar', 3)->nullable();
            $table->timestamps();
            $table->foreign('nis')->references('nis')->on('siswa')->cascadeOnUpdate()->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi_spp');
        Schema::dropIfExists('spp_pembayaran');
    }
};
