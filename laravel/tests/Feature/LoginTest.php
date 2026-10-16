<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

// Login website lewat /api/masuk (database uji: SQLite di memori, lihat phpunit.xml)
class LoginTest extends TestCase
{
    use RefreshDatabase;

    private function akun(array $data = []): User
    {
        return User::factory()->create(['username' => 'guru', 'password' => 'guru123', 'role' => 'staf', ...$data]);
    }

    private function sesi(User $user, int $jamLalu = 0)
    {
        return $this->actingAs($user)->withSession(['masuk_pada' => now()->subHours($jamLalu)->timestamp]);
    }

    public function test_login_berhasil_tanpa_membedakan_huruf_besar_kecil(): void
    {
        $this->akun();

        $this->postJson('/api/masuk', ['username' => '  GURU ', 'password' => 'guru123'])
            ->assertOk()
            ->assertJsonPath('user.username', 'guru')
            ->assertJsonPath('user.role', 'staf');
        $this->assertAuthenticated();
    }

    public function test_password_salah_menghitung_sisa_percobaan_lalu_dikunci(): void
    {
        $this->akun();

        $this->postJson('/api/masuk', ['username' => 'guru', 'password' => 'salah'])->assertStatus(422)->assertJsonPath('sisa', 4);
        foreach (range(1, 3) as $_) {
            $this->postJson('/api/masuk', ['username' => 'guru', 'password' => 'salah']);
        }
        $this->postJson('/api/masuk', ['username' => 'guru', 'password' => 'salah'])->assertStatus(429);
        $this->postJson('/api/masuk', ['username' => 'guru', 'password' => 'guru123'])->assertStatus(429);
        $this->assertGuest();
    }

    public function test_hash_lama_website_diganti_bcrypt_saat_login_pertama(): void
    {
        $garam = '00112233445566778899aabbccddeeff';
        $token = hash_pbkdf2('sha256', 'rahasia-kepsek', hex2bin($garam), 1000, 64);
        $user = $this->akun(['username' => 'kepsek', 'role' => 'kepsek', 'password' => 'acak-tidak-dipakai']);
        $user->forceFill(['hash_lama' => "pbkdf2-sha256:1000:{$garam}:".hash('sha256', $token)])->save();

        $this->postJson('/api/masuk', ['username' => 'kepsek', 'password' => 'salah'])->assertStatus(422);
        $this->postJson('/api/masuk', ['username' => 'kepsek', 'password' => 'rahasia-kepsek'])->assertOk();

        $user->refresh();
        $this->assertNull($user->hash_lama);
        $this->assertTrue(Hash::check('rahasia-kepsek', $user->password));
    }

    public function test_sesi_lebih_dari_12_jam_berakhir(): void
    {
        $user = $this->akun();

        $this->sesi($user, 11)->getJson('/api/saya')->assertOk()->assertJsonPath('user.username', 'guru');
        $this->sesi($user, 13)->getJson('/api/saya')->assertStatus(401);
        $this->assertGuest();
    }

    public function test_akun_nonaktif_tidak_bisa_login_dan_langsung_keluar(): void
    {
        $user = $this->akun(['aktif' => false]);

        $this->postJson('/api/masuk', ['username' => 'guru', 'password' => 'guru123'])->assertStatus(403);
        $this->sesi($user)->getJson('/api/saya')->assertStatus(401);
    }

    public function test_keuangan_hanya_untuk_kepala_sekolah(): void
    {
        $this->getJson('/api/keuangan')->assertStatus(401);
        $this->sesi($this->akun())->getJson('/api/keuangan')->assertStatus(403);
        $this->sesi($this->akun(['username' => 'kepsek', 'role' => 'kepsek']))->getJson('/api/keuangan')->assertOk();
    }

    public function test_membuka_banyak_halaman_tidak_menghabiskan_jatah_login(): void
    {
        $this->akun();

        foreach (range(1, 40) as $_) {
            $this->getJson('/api/guru')->assertOk();
        }
        $this->postJson('/api/masuk', ['username' => 'guru', 'password' => 'guru123'])->assertOk();
    }

    public function test_keluar_mengakhiri_sesi(): void
    {
        $this->sesi($this->akun())->postJson('/api/keluar')->assertNoContent();
        $this->assertGuest();
    }
}
