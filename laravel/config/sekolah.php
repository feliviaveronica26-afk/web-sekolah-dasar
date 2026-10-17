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

    /*
    | Payment gateway SPP online (QRIS / virtual account). Pembayaran hanya lunas dari notifikasi
    | gateway yang tanda tangannya cocok dengan kunci ini (POST /api/gateway/spp), tidak pernah dari
    | tombol orang tua. GATEWAY_KUNCI = server key dari penyedia gateway; bila kosong dipakai
    | turunan APP_KEY (cukup untuk demo).
    */
    'gateway_kunci' => env('GATEWAY_KUNCI'),

    /*
    | Simulator bank/e-wallet (halaman /simulasi-bayar) untuk demo tanpa gateway sungguhan. Bawaannya
    | menyala hanya di APP_ENV=local, dan selalu mati di produksi apa pun isinya.
    */
    'simulasi_gateway' => (bool) env('SIMULASI_GATEWAY', env('APP_ENV', 'production') === 'local'),

];
