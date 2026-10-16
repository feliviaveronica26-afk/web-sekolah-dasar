<?php

return [

    /*
    | Hash password Kepala Sekolah dari website lama (format pbkdf2-sha256:<iterasi>:<garam>:<pemeriksa>).
    | Hanya dipakai AkunSeeder saat membuat akun kepsek; setelah login pertama password-nya disimpan
    | ulang dengan bcrypt. Untuk mengganti password kemudian: php artisan akun:password "<username>"
    */
    'hash_kepsek' => env('HASH_KEPSEK'),

    /*
    | Zona waktu sekolah. Tanggal presensi, jam masuk/pulang, dan "hari ini" dihitung di zona ini,
    | sedangkan database menyimpan waktu dalam UTC.
    */
    'zona' => env('ZONA_SEKOLAH', 'Asia/Jakarta'),

    // Ukuran berkas chat terbesar (MB). Batas upload_max_filesize di php.ini juga berlaku.
    'chat_maks_mb' => (int) env('CHAT_MAKS_MB', 25),

];
