<?php

namespace App\Models;

// Pengaturan grup chat (hanya pengelola yang boleh mengirim).
class ChatGrup extends ModelSekolah
{
    protected $table = 'chat_grup';

    protected $primaryKey = 'percakapan';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'hanya_admin' => 'boolean',
            'waktu' => 'datetime',
        ];
    }
}
