<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\BiodataStafSeeder;
use Database\Seeders\DataContohSeeder;
use Database\Seeders\GuruSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

// Data sekolah lewat /api: siapa boleh melihat & mengubah apa (database uji: SQLite di memori)
class DataSekolahTest extends TestCase
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

    private function siswa(): User
    {
        return $this->akun('siswa', ['nis' => '230401', 'kelas' => '4A']);
    }

    private function wali(): User
    {
        return $this->akun('staf', ['guru_id' => 'g2']);
    }

    public function test_tamu_tidak_menerima_data_pribadi(): void
    {
        $data = $this->getJson('/api/data')->assertOk()->json('data');

        $this->assertSame([], $data['siswa']);
        $this->assertSame([], $data['konseling']);
        $this->assertArrayNotHasKey('nama', $data['pendaftar'][0]);
        $this->assertSame(24, array_sum($data['jumlahSiswa']['4A']));
    }

    public function test_siswa_hanya_menerima_datanya_sendiri(): void
    {
        $data = $this->sebagai($this->siswa())->getJson('/api/data')->assertOk()->json('data');

        $this->assertSame(['230401'], array_map('strval', array_keys($data['nilai'])));
        $this->assertCount(24, $data['siswa']);
        $this->assertTrue(collect($data['sikap'])->every(fn ($s) => $s['nis'] === '230401'));
        $this->assertSame(24, $data['peringkat']['230401']['dari']);
    }

    public function test_konseling_hanya_untuk_guru_bk_dan_kepala_sekolah(): void
    {
        $this->assertSame([], $this->sebagai($this->wali())->getJson('/api/data?koleksi=konseling')->json('data.konseling'));
        $this->assertCount(3, $this->sebagai($this->akun('staf', ['guru_id' => 'g12']))->getJson('/api/data?koleksi=konseling')->json('data.konseling'));
        $this->sebagai($this->wali())->postJson('/api/konseling', ['nis' => '230401'])->assertForbidden();
    }

    public function test_kode_otp_dibuat_server_dan_tidak_dikirim_ke_siswa(): void
    {
        $kode = $this->sebagai($this->wali())->postJson('/api/presensi-sesi', ['kelas' => '4A'])->assertCreated()->json('data.sesiPresensi.0.kode');
        $this->assertMatchesRegularExpression('/^\d{6}$/', $kode);

        $siswa = $this->siswa();
        $this->assertStringNotContainsString($kode, $this->sebagai($siswa)->getJson('/api/data?koleksi=sesiPresensi')->getContent());

        $salah = $kode === '000000' ? '111111' : '000000';
        $this->sebagai($siswa)->postJson('/api/presensi-otp', ['kode' => $salah])->assertJsonPath('hasil.alasan', 'salah')->assertJsonPath('hasil.sisa', 4);
        $this->sebagai($siswa)->postJson('/api/presensi-otp', ['kode' => $kode])->assertJsonPath('hasil.ok', true);
        $this->assertDatabaseHas('absensi_harian', ['nis' => '230401', 'status' => 'H', 'cara' => 'otp']);
    }

    public function test_salah_kode_lima_kali_mengunci_siswa(): void
    {
        $kode = $this->sebagai($this->wali())->postJson('/api/presensi-sesi', ['kelas' => '4A'])->json('data.sesiPresensi.0.kode');
        $siswa = $this->siswa();
        $salah = $kode === '000000' ? '111111' : '000000';
        foreach (range(1, 5) as $_) {
            $this->sebagai($siswa)->postJson('/api/presensi-otp', ['kode' => $salah]);
        }

        $this->sebagai($siswa)->postJson('/api/presensi-otp', ['kode' => $kode])->assertJsonPath('hasil.alasan', 'terkunci');
    }

    public function test_guru_hanya_menilai_mapel_dalam_lingkupnya(): void
    {
        $this->sebagai($this->wali())->putJson('/api/nilai/230401/mtk', ['pts' => 90])->assertOk()->assertJsonPath('data.nilai.230401.mtk.pts', 90);
        // Bahasa Inggris diampu guru mapel khusus, bukan wali kelas
        $this->sebagai($this->wali())->putJson('/api/nilai/230401/bing', ['pts' => 90])->assertForbidden();
        $this->sebagai($this->akun('staf', ['guru_id' => 'g7']))->putJson('/api/nilai/230401/bing', ['tugasKe' => 0, 'nilaiTugas' => 85])
            ->assertOk()->assertJsonPath('data.nilai.230401.bing.tugas.0', 85);
        $this->sebagai($this->siswa())->putJson('/api/nilai/230401/mtk', ['pts' => 100])->assertForbidden();
    }

    public function test_ekskul_bentrok_ditolak_dan_wajib_tidak_bisa_ditinggalkan(): void
    {
        $siswa = $this->siswa();
        $this->sebagai($siswa)->postJson('/api/ekskul/tari')->assertStatus(422)->assertJsonPath('errors.ekskul.0', 'Jadwal bentrok dengan Robotik.');
        $this->sebagai($siswa)->postJson('/api/ekskul/pramuka')->assertStatus(422);
        $this->sebagai($siswa)->postJson('/api/ekskul/paduan-suara')->assertOk();
        $this->assertDatabaseHas('ekskul_siswa', ['nis' => '230401', 'ekskul' => 'paduan-suara']);
    }

    public function test_izin_disetujui_wali_kelas_tercatat_di_presensi(): void
    {
        $tanggal = now('Asia/Jakarta')->toDateString();
        $id = $this->sebagai($this->akun('ortu', ['anak_nis' => '230401']))
            ->postJson('/api/izin', ['jenis' => 'Sakit', 'tanggalMulai' => $tanggal, 'tanggalSelesai' => $tanggal, 'alasan' => 'Demam'])
            ->assertCreated()->json('data.izin.0.id');

        $this->sebagai($this->akun('staf', ['guru_id' => 'g12']))->putJson("/api/izin/{$id}", ['status' => 'Disetujui'])->assertForbidden();
        $this->sebagai($this->wali())->putJson("/api/izin/{$id}", ['status' => 'Disetujui'])->assertOk();
        if (! now('Asia/Jakarta')->isWeekend()) {
            $this->assertDatabaseHas('absensi_harian', ['nis' => '230401', 'tanggal' => $tanggal, 'status' => 'S', 'cara' => 'izin']);
        }
    }

    public function test_spp_tunai_tidak_bisa_dibayar_dua_kali(): void
    {
        $tu = $this->akun('staf', ['guru_id' => 'g9']);
        $this->sebagai($tu)->postJson('/api/spp/tunai', ['nis' => '230402', 'bulan' => ['2027-05']])->assertOk()->assertJsonPath('data.spp.230402.2027-05.metode', 'Tunai');
        $this->sebagai($tu)->postJson('/api/spp/tunai', ['nis' => '230402', 'bulan' => ['2027-05']])->assertStatus(422);
        $this->sebagai($this->wali())->postJson('/api/spp/tunai', ['nis' => '230402', 'bulan' => ['2027-06']])->assertForbidden();
    }

    public function test_chat_hanya_untuk_anggota_percakapan(): void
    {
        Storage::fake('local');
        $siswa = $this->siswa();
        $this->sebagai($siswa)->postJson('/api/chat/pesan', ['percakapan' => 'grup:kelas:4A', 'teks' => 'Halo'])->assertCreated();
        $this->sebagai($siswa)->postJson('/api/chat/pesan', ['percakapan' => 'grup:kelas:5A', 'teks' => 'Halo'])->assertForbidden();
        $this->sebagai($siswa)->postJson('/api/chat/pesan', ['percakapan' => 'p:g:g2|s:230401', 'teks' => 'Halo'])->assertForbidden();

        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
        $foto = UploadedFile::fake()->createWithContent('kelas.png', $png);
        $id = $this->sebagai($this->wali())->post('/api/chat/pesan', ['percakapan' => 'grup:kelas:4A', 'berkas' => $foto, 'jenis' => 'foto', 'nama' => 'kelas.png'], ['Accept' => 'application/json'])
            ->assertCreated()->json('pesan.lampiran.id');
        $this->sebagai($siswa)->get("/api/chat/berkas/{$id}")->assertOk();
        $this->sebagai($this->akun('staf', ['guru_id' => 'g9']))->get("/api/chat/berkas/{$id}", ['Accept' => 'application/json'])->assertNotFound();
    }

    public function test_tamu_tidak_bisa_mengubah_data(): void
    {
        $this->postJson('/api/siswa', [])->assertUnauthorized();
        $this->putJson('/api/nilai/230401/mtk', ['pts' => 1])->assertUnauthorized();
        $this->postJson('/api/presensi-otp', ['kode' => '123456'])->assertUnauthorized();
        $this->getJson('/api/chat')->assertUnauthorized();
    }
}
