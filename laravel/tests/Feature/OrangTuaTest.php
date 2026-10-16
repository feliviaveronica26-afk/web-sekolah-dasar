<?php

namespace Tests\Feature;

use App\Models\OrangTua;
use App\Models\Siswa;
use App\Models\User;
use Database\Seeders\BiodataStafSeeder;
use Database\Seeders\DataContohSeeder;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\GuruSeeder;
use Database\Seeders\OrangTuaSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

// Data orang tua per keluarga: siapa boleh melihat/mengubah, tautan anak, dan akun orang tua (SQLite di memori)
class OrangTuaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([GuruSeeder::class, BiodataStafSeeder::class, DataContohSeeder::class, OrangTuaSeeder::class]);
    }

    private function akun(string $role, array $data = []): User
    {
        return User::factory()->create(['username' => $role.uniqid(), 'role' => $role, ...$data]);
    }

    private function sebagai(User $user)
    {
        return $this->actingAs($user)->withSession(['masuk_pada' => now()->timestamp]);
    }

    private function orangTua(?User $user): array
    {
        return ($user ? $this->sebagai($user) : $this)->getJson('/api/data?koleksi=orangTua')->assertOk()->json('data.orangTua');
    }

    private function tu(): User
    {
        return $this->akun('staf', ['guru_id' => 'g9']);
    }

    private function keluarga(string $nis): OrangTua
    {
        return Siswa::where('nis', $nis)->first()->orangTua;
    }

    public function test_seeder_membuat_satu_keluarga_per_siswa(): void
    {
        $this->assertSame(432, OrangTua::count());
        $demo = $this->keluarga('230401');
        $this->assertSame('Dewi Lestari', $demo->nama_ibu);
        $this->assertSame('0812-1111-2222', $demo->whatsapp);
        $this->assertSame('Ahmad Ramadhan', $this->keluarga('230402')->nama_ayah);
        // Dijalankan ulang tidak membuat data ganda
        $this->seed(OrangTuaSeeder::class);
        $this->assertSame(432, OrangTua::count());
    }

    public function test_database_seeder_lengkap_juga_mengisi_data_keluarga(): void
    {
        // DatabaseSeeder memakai WithoutModelEvents (tanpa pembuat ID otomatis)
        OrangTua::query()->delete();
        $this->seed(DatabaseSeeder::class);
        $this->assertSame(432, OrangTua::count());
        $this->assertSame(0, Siswa::whereNull('orang_tua_id')->count());
    }

    public function test_kontak_orang_tua_hanya_untuk_yang_berhak(): void
    {
        $this->assertSame([], $this->orangTua(null));
        $this->assertSame([], $this->orangTua($this->akun('staf', ['guru_id' => 'g13'])));   // satpam
        $this->assertSame([], $this->orangTua($this->akun('staf', ['guru_id' => 'g7'])));    // guru mapel

        // Wali kelas 4A: keluarga siswa kelasnya saja
        $wali = $this->orangTua($this->akun('staf', ['guru_id' => 'g2']));
        $this->assertCount(24, $wali);
        $nis4A = Siswa::where('kelas', '4A')->pluck('nis')->all();
        $this->assertTrue(collect($wali)->every(fn ($k) => array_intersect($k['anak'], $nis4A) !== []));
        $this->assertArrayNotHasKey('akun', $wali[0]);

        // Siswa & orang tua: keluarganya sendiri
        foreach ([$this->akun('siswa', ['nis' => '230401', 'kelas' => '4A']), $this->akun('ortu', ['anak_nis' => '230401'])] as $u) {
            $milik = $this->orangTua($u);
            $this->assertCount(1, $milik);
            $this->assertSame(['230401'], $milik[0]['anak']);
        }

        // Guru BK: semua tanpa status akun; Tata Usaha: semua + status akun
        $this->assertCount(432, $this->orangTua($this->akun('staf', ['guru_id' => 'g12'])));
        $tu = $this->orangTua($this->tu());
        $this->assertCount(432, $tu);
        $this->assertArrayHasKey('akun', $tu[0]);
        $this->assertSame('Jl. Melati No. 12, Kel. Sukamaju, Kota Harapan', collect($tu)->first(fn ($k) => $k['anak'] === ['230401'])['alamat']);

        // Data siswa tidak membawa tautan keluarga
        $siswa = $this->sebagai($this->tu())->getJson('/api/data?koleksi=siswa')->json('data.siswa.0');
        $this->assertArrayNotHasKey('orangTuaId', $siswa);
    }

    public function test_orang_tua_memperbarui_kontaknya_sendiri(): void
    {
        $ortu = $this->akun('ortu', ['anak_nis' => '230401']);
        $milik = $this->keluarga('230401');
        $this->sebagai($ortu)->putJson("/api/orang-tua/{$milik->id}", ['whatsapp' => '0812-9999-0000', 'namaIbu' => 'Bukan Nama Asli', 'anak' => ['230402']])
            ->assertOk()->assertJsonPath('data.orangTua.0.whatsapp', '0812-9999-0000');
        $milik->refresh();
        // Nama & anak hanya diubah Tata Usaha
        $this->assertSame('Dewi Lestari', $milik->nama_ibu);
        $this->assertSame(['230401'], $milik->anak()->pluck('nis')->all());

        $this->sebagai($ortu)->putJson('/api/orang-tua/'.$this->keluarga('230402')->id, ['whatsapp' => '0812'])->assertForbidden();
        $this->sebagai($this->akun('staf', ['guru_id' => 'g2']))->putJson("/api/orang-tua/{$milik->id}", ['whatsapp' => '0812'])->assertForbidden();
        $this->sebagai($ortu)->putJson("/api/orang-tua/{$milik->id}", ['email' => 'bukan-email'])->assertUnprocessable();
    }

    public function test_tata_usaha_mengatur_keluarga_dan_tautan_anak(): void
    {
        $tu = $this->tu();
        // Kakak-adik: pindahkan 230402 ke keluarga 230401 setelah dilepas dari keluarganya
        $kakak = $this->keluarga('230401');
        $this->sebagai($tu)->putJson("/api/orang-tua/{$kakak->id}", ['anak' => ['230401', '230402']])
            ->assertUnprocessable()->assertJsonPath('errors.anak.0', 'Aisyah Putri Ramadhani (230402) sudah terhubung dengan keluarga lain. Lepaskan dulu dari keluarga itu.');
        $lama = $this->keluarga('230402');
        $this->sebagai($tu)->deleteJson("/api/orang-tua/{$lama->id}")->assertOk()->assertJsonPath('hapus.orangTua.0', $lama->id);
        $this->assertNull(Siswa::where('nis', '230402')->value('orang_tua_id'));
        $this->sebagai($tu)->putJson("/api/orang-tua/{$kakak->id}", ['anak' => ['230401', '230402']])
            ->assertOk()->assertJsonPath('data.orangTua.0.anak', ['230401', '230402']);

        // Keluarga baru: minimal satu nama & satu anak
        $siswaBaru = Siswa::create(['nis' => '269999', 'nama' => 'Siswa Baru', 'kelas' => '1A', 'jk' => 'L', 'ortu' => 'Bapak Baru']);
        $this->sebagai($tu)->postJson('/api/orang-tua', ['namaAyah' => 'Bapak Baru'])->assertUnprocessable()->assertJsonValidationErrors('anak');
        $this->sebagai($tu)->postJson('/api/orang-tua', ['anak' => [$siswaBaru->nis]])->assertUnprocessable()->assertJsonValidationErrors('namaIbu');
        $this->sebagai($tu)->postJson('/api/orang-tua', ['namaAyah' => 'Bapak Baru', 'whatsapp' => '0813-0000-9999', 'anak' => [$siswaBaru->nis]])
            ->assertCreated()->assertJsonPath('data.orangTua.0.anak', ['269999'])->assertJsonPath('data.orangTua.0.akun', null);

        // Hanya pengelola Data Orang Tua yang boleh menambah/menghapus
        $this->sebagai($this->akun('staf', ['guru_id' => 'g12']))->postJson('/api/orang-tua', ['namaAyah' => 'X', 'anak' => ['269999']])->assertForbidden();
        $this->sebagai($this->akun('ortu', ['anak_nis' => '230401']))->deleteJson("/api/orang-tua/{$kakak->id}")->assertForbidden();
    }

    public function test_akun_orang_tua_dibuat_dari_data_keluarga(): void
    {
        $keluarga = $this->keluarga('230403');
        $jawaban = $this->sebagai($this->tu())->postJson("/api/orang-tua/{$keluarga->id}/akun")->assertCreated()->json();
        $this->assertSame('ortu230403', $jawaban['username']);
        $this->assertSame(['username' => 'ortu230403', 'aktif' => true, 'wajibGanti' => true], $jawaban['data']['orangTua'][0]['akun']);
        $user = User::where('username', 'ortu230403')->first();
        $this->assertSame(['ortu', '230403', 'Sri Wahyuni'], [$user->role, $user->anak_nis, $user->name]);

        // Atur ulang: username tetap, password baru
        $ulang = $this->sebagai($this->tu())->postJson("/api/orang-tua/{$keluarga->id}/akun")->assertOk()->json();
        $this->assertSame('ortu230403', $ulang['username']);
        $this->assertNotSame($jawaban['password'], $ulang['password']);

        $this->sebagai($this->akun('staf', ['guru_id' => 'g2']))->postJson("/api/orang-tua/{$keluarga->id}/akun")->assertForbidden();
    }

    public function test_perintah_akun_buat_ortu(): void
    {
        Storage::fake('local');
        $this->akun('ortu', ['anak_nis' => '230401']);
        $this->artisan('akun:buat', ['kelompok' => 'ortu'])->assertSuccessful();

        // 432 keluarga, satu sudah punya akun
        $this->assertSame(432, User::where('role', 'ortu')->count());
        $this->assertTrue(User::where('username', 'ortu230402')->first()->wajib_ganti_password);
        $isi = Storage::disk('local')->get(Storage::disk('local')->files('akun-awal')[0]);
        $this->assertStringContainsString('"Ahmad Ramadhan","Aisyah Putri Ramadhani","4A","ortu230402"', $isi);
        $this->artisan('akun:buat', ['kelompok' => 'ortu'])->expectsOutput('Semua keluarga sudah punya akun.');
    }
}
