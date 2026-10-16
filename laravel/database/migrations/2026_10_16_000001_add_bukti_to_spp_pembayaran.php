<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Bukti pembayaran (foto) opsional untuk pembayaran tunai SPP yang dicatat Tata Usaha.
// Disimpan sebagai metadata berkas {id, nama, mime, ukuran}; isi berkasnya di storage/app/private/spp.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('spp_pembayaran', function (Blueprint $table) {
            $table->json('bukti')->nullable()->after('jumlah');
        });
    }

    public function down(): void
    {
        Schema::table('spp_pembayaran', function (Blueprint $table) {
            $table->dropColumn('bukti');
        });
    }
};
