<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
  Akun yang dibuat sekolah memakai password awal acak. Pemiliknya wajib membuat password sendiri
  saat pertama login (juga setelah password diatur ulang oleh Kepala Sekolah / Tata Usaha).
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('wajib_ganti_password')->default(false)->after('aktif');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('wajib_ganti_password');
        });
    }
};
