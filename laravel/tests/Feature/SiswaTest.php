<?php

namespace Tests\Feature;

use App\Models\Siswa;
use App\Models\User;
use Database\Seeders\BiodataSiswaSeeder;
use Database\Seeders\BiodataStafSeeder;
use Database\Seeders\DataContohSeeder;
use Database\Seeders\GuruSeeder;
use Database\Seeders\OrangTuaSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

// Biodata siswa (siapa boleh melihat/mengubah) dan akun login siswa (SQLite di memori)
class SiswaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([GuruSeeder::class, BiodataStafSeeder::class, DataContohSeeder::class, OrangTuaSeeder::class, BiodataSiswaSeeder::class]);
    }

    private function akun(string $role, array $data = []): User
    {
        return User::factory()->create(['username' => $role.uniqid(), 'role' => $role, ...$data]);
    }

    private function sebagai(User $user)
    {
        return $this->actingAs($user)->withSession(['masuk_pada' => now()->timestamp]);
    }

    // Data siswa yang diterima pengguna, per NIS
    private function siswa(?User $user): array
    {
        $daftar = ($user ? $this->sebagai($user) : $this)->getJson('/api/data?koleksi=siswa')->assertOk()->json('data.siswa');

        return collect($daftar)->keyBy('nis')->all();
    }

    private function staf(string $guruId): User
    {
        return $this->akun('staf', ['guru_id' => $guruId]);
    }

    private function isianPokok(Siswa $s): array
    {
        return ['nis' => $s->nis, 'nama' => $s->nama, 'kelas' => $s->kelas, 'jk' => $s->jk, 'ortu' => $s->ortu];
    }

    public function test_seeder_mengisi_biodata_tanpa_menimpa(): void
    {
        $demo = Siswa::where('nis', '230401')->first();
        $this->assertSame('0151234567', $demo->nisn);
        $this->assertSame('2016-05-14', $demo->tanggal_lahir->toDateString());
        $this->assertSame('Alergi kacang', $demo->catatan_kesehatan);
        $this->assertSame(0, Siswa::whereNull('nisn')->orWhereNull('tanggal_lahir')->orWhere('agama', '')->count());
        $this->assertSame(432, Siswa::distinct()->count('nisn'));

        // Usia sesuai kelas: kelas 1 lahir 2019–2020, kelas 6 lahir 2014–2015
        $this->assertSame(0, Siswa::where('kelas', 'like', '1%')->whereNotBetween('tanggal_lahir', ['2019-01-01', '2020-06-30'])->count());
        $this->assertSame(0, Siswa::where('kelas', 'like', '6%')->whereNotBetween('tanggal_lahir', ['2014-01-01', '2015-06-30'])->count());

        // Biodata yang sudah diubah tidak ditimpa saat seeder dijalankan ulang
        $demo->update(['agama' => 'Katolik', 'catatan_kesehatan' => '']);
        $this->seed(BiodataSiswaSeeder::class);
        $this->assertSame('Katolik', $demo->fresh()->agama);
        $this->assertSame('Alergi kacang', $demo->fresh()->catatan_kesehatan); // kolom kosong diisi lagi
    }

    public function test_biodata_siswa_hanya_untuk_yang_berhak(): void
    {
        $this->assertSame([], $this->siswa(null));

        // Satpam & guru mapel: daftar siswa tanpa biodata pribadi dan tanpa akun
        foreach (['g13', 'g7'] as $guruId) {
            $data = $this->siswa($this->staf($guruId));
            $this->assertCount(432, $data);
            $this->assertArrayNotHasKey('nisn', $data['230401']);
            $this->assertArrayNotHasKey('catatanKesehatan', $data['230401']);
            $this->assertArrayNotHasKey('ulangTahun', $data['230401']);
            $this->assertArrayNotHasKey('akun', $data['230401']);
        }

        // Wali kelas 4A: biodata kelasnya saja
        $wali = $this->siswa($this->staf('g2'));
        $this->assertSame('Alergi kacang', $wali['230401']['catatanKesehatan']);
        $this->assertSame('2016-05-14', $wali['230401']['tanggalLahir']);
        $this->assertArrayNotHasKey('nisn', $wali['234201']); // 4B

        // Guru BK: biodata semua siswa, tetapi tidak mengatur akun
        $bk = $this->siswa($this->staf('g12'));
        $this->assertArrayHasKey('nisn', $bk['234201']);
        $this->assertArrayNotHasKey('akun', $bk['234201']);

        // Tata Usaha: biodata + status akun
        $tu = $this->siswa($this->staf('g9'));
        $this->assertArrayHasKey('nisn', $tu['216301']);
        $this->assertArrayHasKey('akun', $tu['216301']);
        $this->assertNull($tu['216301']['akun']);

        // Siswa: biodata sendiri lengkap; teman sekelas hanya tanggal & bulan ulang tahun, tanpa nama orang tua
        $siswa = $this->siswa($this->akun('siswa', ['nis' => '230401', 'kelas' => '4A']));
        $this->assertCount(24, $siswa);
        $this->assertSame('0151234567', $siswa['230401']['nisn']);
        $teman = Siswa::where('nis', '234113')->first();
        $this->assertArrayNotHasKey('nisn', $siswa['234113']);
        $this->assertArrayNotHasKey('agama', $siswa['234113']);
        $this->assertArrayNotHasKey('catatanKesehatan', $siswa['234113']);
        $this->assertArrayNotHasKey('ortu', $siswa['234113']);
        $this->assertSame($teman->tanggal_lahir->format('m-d'), $siswa['234113']['ulangTahun']);
        $this->assertArrayNotHasKey('ulangTahun', $siswa['230401']);

        // Orang tua: biodata anaknya; teman sekelas anak tanpa biodata
        $ortu = $this->siswa($this->akun('ortu', ['anak_nis' => '230401']));
        $this->assertSame('Alergi kacang', $ortu['230401']['catatanKesehatan']);
        $this->assertArrayNotHasKey('tanggalLahir', $ortu['234113']);
        $this->assertArrayHasKey('ulangTahun', $ortu['234113']);
    }

    public function test_pengelola_mengubah_biodata_dengan_validasi(): void
    {
        $tu = $this->staf('g9');
        $s = Siswa::where('nis', '230401')->first();
        $lain = Siswa::where('nis', '230402')->first();
        $ubah = fn (array $isian, ?User $oleh = null) => $this->sebagai($oleh ?? $tu)->putJson("/api/siswa/{$s->id}", [...$this->isianPokok($s->fresh()), ...$isian]);

        $ubah(['nisn' => '123'])->assertUnprocessable()->assertJsonPath('errors.nisn.0', 'NISN harus 10 angka.');
        $ubah(['nisn' => $lain->nisn])->assertUnprocessable()->assertJsonPath('errors.nisn.0', "NISN {$lain->nisn} sudah dipakai siswa lain.");
        $ubah(['golonganDarah' => 'C'])->assertUnprocessable();
        $ubah(['tanggalLahir' => now()->addDay()->toDateString()])->assertUnprocessable();

        // Formulir tanpa kolom biodata tidak menghapus biodata
        $ubah([])->assertOk();
        $this->assertSame('0151234567', $s->fresh()->nisn);

        $jawaban = $ubah(['nisn' => '0161234500', 'agama' => 'Kristen', 'catatanKesehatan' => '', 'asalSekolah' => ' TK Pelangi '])->assertOk()->json('data.siswa.0');
        $this->assertSame(['0161234500', 'Kristen', '', 'TK Pelangi'], [$jawaban['nisn'], $jawaban['agama'], $jawaban['catatanKesehatan'], $jawaban['asalSekolah']]);
        $this->assertArrayHasKey('akun', $jawaban);

        // Nama baru ikut ke akun siswa
        $akunSiswa = $this->akun('siswa', ['nis' => '230401', 'kelas' => '4A', 'name' => 'Rafa Aditya']);
        $ubah(['nama' => 'Rafa Aditya Pratama'])->assertOk();
        $this->assertSame('Rafa Aditya Pratama', $akunSiswa->fresh()->name);

        // Wali kelas tidak mengelola Data Siswa
        $ubah(['agama' => 'Islam'], $this->staf('g2'))->assertForbidden();
        $this->assertSame('Kristen', $s->fresh()->agama);
    }

    public function test_akun_siswa_dibuat_tata_usaha_dan_wajib_ganti_password(): void
    {
        $s = Siswa::where('nis', '234113')->first();
        // Guru BK & wali kelas tidak boleh membuat akun siswa
        $this->sebagai($this->staf('g12'))->postJson("/api/siswa/{$s->id}/akun")->assertForbidden();
        $this->sebagai($this->staf('g2'))->postJson("/api/siswa/{$s->id}/akun")->assertForbidden();

        $tu = $this->staf('g9');
        $jawaban = $this->sebagai($tu)->postJson("/api/siswa/{$s->id}/akun")->assertCreated()->json();
        $this->assertSame('234113', $jawaban['username']);
        $this->assertMatchesRegularExpression('/^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/', $jawaban['password']);
        $this->assertSame(['username' => '234113', 'aktif' => true, 'wajibGanti' => true], $jawaban['data']['siswa'][0]['akun']);

        // Login dengan NIS: diarahkan ke portal siswa kelasnya dan wajib ganti password
        $this->postJson('/api/masuk', ['username' => '234113', 'password' => $jawaban['password']])
            ->assertOk()->assertJsonPath('user.role', 'siswa')->assertJsonPath('user.kelas', '4A')->assertJsonPath('user.wajibGanti', true);

        // Atur ulang: username tetap, password baru
        $ulang = $this->sebagai($tu)->postJson("/api/siswa/{$s->id}/akun")->assertOk()->json();
        $this->assertSame('234113', $ulang['username']);
        $this->assertNotSame($jawaban['password'], $ulang['password']);
        $this->assertSame(1, User::where('role', 'siswa')->where('nis', '234113')->count());

        // Siswa dihapus: akunnya dinonaktifkan
        $this->sebagai($tu)->deleteJson("/api/siswa/{$s->id}")->assertOk();
        $this->assertFalse(User::where('username', '234113')->first()->aktif);
    }

    public function test_perintah_akun_buat_siswa(): void
    {
        Storage::fake('local');
        $this->akun('siswa', ['username' => 'siswa', 'nis' => '230401', 'kelas' => '4A']);
        $this->artisan('akun:buat', ['kelompok' => 'siswa'])->assertSuccessful();

        $this->assertSame(432, User::where('role', 'siswa')->count());
        $this->assertSame(431, User::where('role', 'siswa')->where('wajib_ganti_password', true)->count());
        $this->assertTrue(User::where('username', '216301')->where('nis', '216301')->where('kelas', '6C')->exists());
        $isi = Storage::disk('local')->get(Storage::disk('local')->files('akun-awal')[0]);
        $this->assertStringContainsString('"Nama","Kelas","NIS","Username","Password awal"', $isi);
        $this->assertStringNotContainsString('"230401"', $isi); // akun demo sudah ada

        $this->artisan('akun:buat', ['kelompok' => 'siswa'])->expectsOutput('Semua siswa sudah punya akun.');
    }
}
