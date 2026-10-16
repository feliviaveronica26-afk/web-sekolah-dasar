<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;

/**
 * Akun website sekolah. Peran (role): kepsek, staf (guru & staf, terhubung ke data guru lewat
 * guru_id), siswa (nis & kelas), dan ortu (anak_nis).
 */
#[Fillable(['username', 'name', 'email', 'password', 'role', 'guru_id', 'nis', 'kelas', 'anak_nis', 'aktif'])]
#[Hidden(['password', 'hash_lama', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const LABEL_ROLE = ['kepsek' => 'Kepala Sekolah', 'staf' => 'Guru & Staf', 'siswa' => 'Siswa', 'ortu' => 'Orang Tua'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'aktif' => 'boolean',
            'wajib_ganti_password' => 'boolean',
        ];
    }

    /*
      Cocokkan password. Akun dari website lama masih memakai hash PBKDF2 (hash_lama, format
      pbkdf2-sha256:<iterasi>:<garam>:<pemeriksa>); saat cocok, password langsung disimpan ulang
      dengan bcrypt Laravel dan hash lama dihapus, jadi pengguna tidak perlu mengganti password.
    */
    public function cocokPassword(string $password): bool
    {
        if (! $this->hash_lama) {
            return Hash::check($password, $this->password);
        }

        [$jenis, $iterasi, $garam, $pemeriksa] = array_pad(explode(':', $this->hash_lama), 4, '');
        if ($jenis !== 'pbkdf2-sha256' || ! ctype_xdigit($garam) || strlen($garam) % 2 || (int) $iterasi < 1) {
            return false;
        }
        $token = hash_pbkdf2('sha256', $password, hex2bin($garam), (int) $iterasi, 64);
        if (! hash_equals($pemeriksa, hash('sha256', $token))) {
            return false;
        }

        $this->forceFill(['password' => $password, 'hash_lama' => null])->save();

        return true;
    }

    // Data akun yang dikirim ke website (src/context/AuthContext.jsx)
    public function profil(): array
    {
        $guru = $this->guru_id ? Guru::find($this->guru_id) : null;

        return array_filter([
            'username' => $this->username,
            'role' => $this->role,
            'label' => $this->role === 'staf' ? ($guru?->jabatan ?: self::LABEL_ROLE['staf']) : (self::LABEL_ROLE[$this->role] ?? $this->role),
            'nama' => $guru?->nama ?? $this->name,
            'guruId' => $this->guru_id,
            'nis' => $this->nis,
            'kelas' => $this->kelas,
            'anakNis' => $this->anak_nis,
            // Akun dengan password awal dari sekolah: website meminta password baru sebelum lanjut
            'wajibGanti' => $this->wajib_ganti_password ? true : null,
        ], fn ($nilai) => $nilai !== null);
    }
}
