<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guru', function (Blueprint $table) {
            $table->string('id', 40)->primary()->comment('Kode guru di website, mis. g2');
            $table->unsignedInteger('urutan')->index()->comment('Urutan tampil di website');
            $table->string('nama', 120);
            $table->string('nip', 30)->default('')->comment('NIP/NUPTK, boleh kosong');
            $table->string('jabatan', 80);
            $table->string('mapel', 80)->default('');
            $table->json('peran')->comment('Jabatan & hak akses portal, mis. ["wali_kelas"]');
            $table->string('kelas', 3)->default('')->comment('Kelas perwalian, mis. 4A');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guru');
    }
};
