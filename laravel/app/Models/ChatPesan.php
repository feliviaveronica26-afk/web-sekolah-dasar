<?php

namespace App\Models;

// Pesan chat. `diubah` dipakai untuk mengirim pesan baru/berubah saja ke website.
class ChatPesan extends ModelSekolah
{
    protected $table = 'chat_pesan';

    protected string $awalanId = 'm';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'waktu' => 'datetime',
            'lampiran' => 'array',
            'dihapus' => 'array',
            'diubah' => 'datetime',
        ];
    }
}
