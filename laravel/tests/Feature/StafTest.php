<?php

namespace Tests\Feature;

use App\Models\Guru;
use App\Models\User;
use Database\Seeders\BiodataStafSeeder;
use Database\Seeders\DataContohSeeder;
use Database\Seeders\GuruSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

// Biodata guru & staf, mapel yang diampu, akun login staf, dan ganti password (SQLite di memori)
class StafTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([GuruSeeder::class, BiodataStafSeeder::class, DataContohSeeder::class]);
    }

    private function akun(string $role, array $data = []): User
    {
        return User::factory()->create(['username' => $role.uniqid(), 'role' => $role, ...$data]);
    }

    private function sebagai(User $user)
    {
        return $this->actingAs($user)->withSession(['masuk_pada' => now()->timestamp]);
    }

    private function kepsek(): User
    {
        return $this->akun('kepsek');
    }

    private function guruDari(array $daftar, string $id): array
    {
        return collect($daftar)->firstWhere('id', $id);
    }

    public function test_biodata_pribadi_hanya_untuk_kepala_sekolah_dan_pemiliknya(): void
    {
        // Tamu & rekan kerja: nama, jabatan, pendidikan, tanpa NIP/alamat/kontak
        foreach ([null, $this->akun('staf', ['guru_id' => 'g13'])] as $user) {
            $daftar = ($user ? $this->sebagai($user) : $this)->getJson('/api/guru')->assertOk()->json();
            $g2 = $this->guruDari($daftar, 'g2');
            $this->assertSame('Andi Pratama, S.Pd.', $g2['nama']);
            $this->assertSame('S1 Pendidikan Guru SD', $g2['pendidikan']);
            foreach (['nip', 'alamat', 'whatsapp', 'email', 'tanggalLahir', 'tempatLahir', 'agama', 'statusPegawai', 'mulaiTugas'] as $kolom) {
                $this->assertArrayNotHasKey($kolom, $g2, "{$kolom} bocor");
            }
            $this->assertArrayNotHasKey('akun', $g2);
        }

        // Pemiliknya melihat biodatanya sendiri (lewat /api/data juga)
        $data = $this->sebagai($this->akun('staf', ['guru_id' => 'g2']))->getJson('/api/data?koleksi=guru')->json('data.guru');
        $this->assertSame('1988-05-12', $this->guruDari($data, 'g2')['tanggalLahir']);
        $this->assertArrayNotHasKey('alamat', $this->guruDari($data, 'g3'));

        // Kepala Sekolah melihat semuanya + status akun
        $daftar = $this->sebagai($this->kepsek())->getJson('/api/guru')->json();
        $this->assertSame('198805122014031002', $this->guruDari($daftar, 'g2')['nip']);
        $this->assertSame('PNS', $this->guruDari($daftar, 'g2')['statusPegawai']);
        $this->assertNull($this->guruDari($daftar, 'g14')['akun']);
    }

    public function test_mapel_diampu_menentukan_hak_menilai_bukan_nama_guru(): void
    {
        $kepsek = $this->kepsek();
        $maria = $this->akun('staf', ['guru_id' => 'g7']);
        // Ganti nama/gelar guru mapel: haknya tetap
        $g7 = Guru::find('g7')->toArray();
        $this->sebagai($kepsek)->putJson('/api/guru/g7', ['nama' => 'Maria Natalia, S.Pd., M.Pd.'] + $g7)->assertOk();
        $this->sebagai($maria)->putJson('/api/nilai/230401/bing', ['pts' => 88])->assertOk();

        // Agus (guru mapel tanpa mapel diampu) belum boleh menilai Matematika; setelah diatur Kepala Sekolah boleh,
        // dan Matematika tidak lagi dinilai wali kelas
        $agus = $this->akun('staf', ['guru_id' => 'g11']);
        $wali = $this->akun('staf', ['guru_id' => 'g2']);
        $this->sebagai($agus)->putJson('/api/nilai/230401/mtk', ['pts' => 80])->assertForbidden();
        $g11 = Guru::find('g11')->toArray();
        $this->sebagai($kepsek)->putJson('/api/guru/g11', ['mapelDiampu' => ['mtk']] + $g11)->assertOk()->assertJsonPath('mapelDiampu', ['mtk']);
        $this->sebagai($agus)->putJson('/api/nilai/230401/mtk', ['pts' => 80])->assertOk();
        $this->sebagai($wali)->putJson('/api/nilai/230401/mtk', ['pts' => 70])->assertForbidden();
    }

    public function test_satu_mapel_hanya_satu_pengampu_dan_biodata_tetap_bila_tidak_dikirim(): void
    {
        $kepsek = $this->kepsek();
        $g11 = Guru::find('g11')->toArray();
        $this->sebagai($kepsek)->putJson('/api/guru/g11', ['mapelDiampu' => ['bing']] + $g11)
            ->assertUnprocessable()->assertJsonPath('errors.mapelDiampu.0', 'Bahasa Inggris sudah diampu Maria Natalia, S.Pd..');

        // Klien lama yang hanya mengirim kolom dasar tidak menghapus biodata
        $this->sebagai($kepsek)->putJson('/api/guru/g2', ['nama' => 'Andi Pratama, S.Pd.', 'jabatan' => 'Wali Kelas 4A', 'peran' => ['wali_kelas'], 'kelas' => '4A'])->assertOk();
        $this->assertSame('0812-0000-1002', Guru::find('g2')->whatsapp);

        $this->sebagai($kepsek)->putJson('/api/guru/g2', ['whatsapp' => 'abc'] + Guru::find('g2')->toArray())->assertUnprocessable();
        $this->sebagai($this->akun('staf', ['guru_id' => 'g2']))->putJson('/api/guru/g2', ['alamat' => 'x'] + Guru::find('g2')->toArray())->assertForbidden();
    }

    public function test_akun_staf_dibuat_kepala_sekolah_dan_wajib_ganti_password(): void
    {
        $kepsek = $this->kepsek();
        $jawaban = $this->sebagai($kepsek)->postJson('/api/guru/g14/akun')->assertCreated()->json();
        $this->assertSame('siti.nurhaliza', $jawaban['username']);
        $this->assertMatchesRegularExpression('/^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/', $jawaban['password']);
        $this->assertSame(['username' => 'siti.nurhaliza', 'aktif' => true, 'wajibGanti' => true], $jawaban['guru']['akun']);
        $this->sebagai($kepsek)->postJson('/api/guru/g1/akun')->assertUnprocessable();

        // Login dengan password awal: profil menandai wajib ganti, perubahan data ditolak dulu
        $this->postJson('/api/masuk', ['username' => 'siti.nurhaliza', 'password' => $jawaban['password']])
            ->assertOk()->assertJsonPath('user.wajibGanti', true)->assertJsonPath('user.guruId', 'g14');
        $siti = User::where('username', 'siti.nurhaliza')->first();
        $this->sebagai($siti)->putJson('/api/catatan-wali/230401', ['teks' => 'x'])->assertForbidden()->assertJsonPath('wajibGanti', true);
        $this->sebagai($siti)->postJson('/api/chat/pesan', ['teks' => 'x'])->assertForbidden();

        // Ganti password: password lama wajib benar, tidak boleh sama/memuat username
        $ganti = fn (string $lama, string $baru) => $this->sebagai($siti->fresh())->putJson('/api/akun/password', ['passwordLama' => $lama, 'passwordBaru' => $baru, 'passwordBaru_confirmation' => $baru]);
        $ganti('salah', 'rahasiaku123')->assertUnprocessable()->assertJsonPath('errors.passwordLama.0', 'Password saat ini salah.');
        $ganti($jawaban['password'], 'siti.nurhaliza1')->assertUnprocessable()->assertJsonPath('errors.passwordBaru.0', 'Password baru tidak boleh memuat username.');
        $ganti($jawaban['password'], 'pendek')->assertUnprocessable();
        $ganti($jawaban['password'], 'Melati-2026')->assertOk()->assertJsonMissingPath('user.wajibGanti');
        $this->assertFalse($siti->fresh()->wajib_ganti_password);
        // Tidak lagi diblokir karena password (tetap ditolak karena bukan wali kelas 4A)
        $this->sebagai($siti->fresh())->putJson('/api/catatan-wali/230401', ['teks' => 'Rajin.'])->assertForbidden()->assertJsonMissingPath('wajibGanti');
        $this->postJson('/api/masuk', ['username' => 'siti.nurhaliza', 'password' => 'Melati-2026'])->assertOk()->assertJsonMissingPath('user.wajibGanti');

        // Atur ulang oleh Kepala Sekolah: password baru, wajib ganti lagi, username tetap
        $ulang = $this->sebagai($kepsek)->postJson('/api/guru/g14/akun')->assertOk()->json();
        $this->assertSame('siti.nurhaliza', $ulang['username']);
        $this->assertNotSame($jawaban['password'], $ulang['password']);
        $this->assertTrue(User::where('username', 'siti.nurhaliza')->first()->wajib_ganti_password);

        // Hanya Kepala Sekolah yang boleh membuat akun
        $this->sebagai($this->akun('staf', ['guru_id' => 'g9']))->postJson('/api/guru/g15/akun')->assertForbidden();
    }

    public function test_guru_dihapus_akunnya_nonaktif(): void
    {
        $this->sebagai($this->kepsek())->postJson('/api/guru/g15/akun')->assertCreated();
        $this->sebagai($this->kepsek())->deleteJson('/api/guru/g15')->assertNoContent();
        $this->assertFalse(User::where('guru_id', 'g15')->first()->aktif);
    }

    public function test_perintah_akun_buat_staf_menulis_csv_privat(): void
    {
        Storage::fake('local');
        $this->artisan('akun:buat', ['kelompok' => 'staf'])->assertSuccessful();

        // 28 guru & staf, tanpa Kepala Sekolah (g1)
        $this->assertSame(27, User::where('role', 'staf')->count());
        $this->assertSame(['siti.nurhaliza', 'fitri.handayani'], User::whereIn('guru_id', ['g14', 'g15'])->orderBy('guru_id')->pluck('username')->all());
        $berkas = Storage::disk('local')->files('akun-awal');
        $this->assertCount(1, $berkas);
        $isi = Storage::disk('local')->get($berkas[0]);
        $this->assertStringContainsString('"Siti Nurhaliza, S.Pd.","Wali Kelas 1B","siti.nurhaliza"', $isi);
        $this->assertSame(28, substr_count($isi, "\r\n"));

        // Dijalankan lagi: tidak ada akun ganda
        $this->artisan('akun:buat', ['kelompok' => 'staf'])->expectsOutput('Semua guru & staf sudah punya akun.');
        $this->assertSame(27, User::where('role', 'staf')->count());
    }
}
