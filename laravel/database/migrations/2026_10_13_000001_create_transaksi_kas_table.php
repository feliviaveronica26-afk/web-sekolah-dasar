<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaksi_kas', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal')->index();
            $table->enum('jenis', ['masuk', 'keluar'])->comment('masuk = pemasukan, keluar = pengeluaran');
            $table->string('kategori', 40);
            $table->string('uraian', 200);
            $table->unsignedBigInteger('jumlah')->comment('Rupiah, tanpa desimal');
            $table->string('metode', 20)->default('Tunai');
            $table->string('bukti', 40)->default('')->comment('No. kuitansi / bukti transfer');
            $table->string('pencatat', 120);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi_kas');
    }
};
