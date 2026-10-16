<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Satu baris buku kas sekolah: pemasukan (jenis "masuk") atau pengeluaran (jenis "keluar").
 * Pembayaran SPP tidak dicatat di sini; website menghitungnya otomatis dari data SPP
 * agar tidak tercatat dua kali.
 */
class TransaksiKas extends Model
{
    // Sama dengan KATEGORI_KAS di sd-app/src/utils/keuangan.js
    public const KATEGORI = [
        'masuk' => ['Saldo Awal', 'Dana BOS', 'Uang Pangkal & Pendaftaran', 'Sumbangan & Donasi', 'Sewa Kantin', 'Pemasukan Lainnya'],
        'keluar' => ['Gaji & Honor', 'Listrik, Air & Internet', 'Buku, ATK & Bahan Ajar', 'Perawatan & Perbaikan', 'Kegiatan Siswa', 'Rapat & Konsumsi', 'Pengeluaran Lainnya'],
    ];

    public const METODE = ['Tunai', 'Transfer Bank'];

    protected $table = 'transaksi_kas';

    protected $fillable = ['tanggal', 'jenis', 'kategori', 'uraian', 'jumlah', 'metode', 'bukti'];

    protected $hidden = ['created_at', 'updated_at'];

    protected function casts(): array
    {
        return ['tanggal' => 'date:Y-m-d', 'jumlah' => 'integer'];
    }
}
