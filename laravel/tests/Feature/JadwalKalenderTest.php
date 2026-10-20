<?php

namespace Tests\Feature;

use App\Models\JadwalPelajaran;
use App\Models\Kalender;
use App\Models\User;
use App\Support\Referensi;
use App\Support\Waktu;
use Carbon\CarbonImmutable;
use Database\Seeders\BiodataStafSeeder;
use Database\Seeders\DataContohSeeder;
use Database\Seeders\GuruSeeder;
use Database\Seeders\JadwalSeeder;
use Database\Seeders\KalenderSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Jadwal pelajaran & kalender akademik yang diatur Wakasek Kurikulum (SQLite di memori)
class JadwalKalenderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([GuruSeeder::class, BiodataStafSeeder::class, DataContohSeeder::class, JadwalSeeder::class, KalenderSeeder::class]);
    }

    private function sebagai(string $guruId)
    {
        $user = User::factory()->create(['username' => 'staf'.uniqid(), 'role' => 'staf', 'guru_id' => $guruId]);

        return $this->actingAs($user)->withSession(['masuk_pada' => now()->timestamp]);
    }

    private function kurikulum()
    {
        return $this->sebagai('g3');
    }

    public function test_jadwal_dan_kalender_dari_database_terbuka_untuk_semua(): void
    {
        $data = $this->getJson('/api/data?koleksi=jadwal,kalender')->assertOk()->json('data');
        $this->assertCount(18, $data['jadwal']);
        $this->assertSame(['upacara', 'mtk', 'bindo', 'ipas'], $data['jadwal']['4A']['Senin']);
        $this->assertCount(27, $data['kalender']);
        $this->assertSame(['libur', false, null], [$data['kalender'][1]['jenis'], $data['kalender'][1]['perkiraan'], $data['kalender'][1]['selesai']]);
        $this->assertSame(18 * 20, JadwalPelajaran::count());
    }

    public function test_wakasek_kurikulum_mengubah_jadwal_kelas(): void
    {
        $jadwal = Referensi::jadwal()['4A'];
        $jadwal['Senin'] = ['upacara', 'bindo', 'mtk', 'ipas'];

        $this->kurikulum()->putJson('/api/jadwal/4A', ['jadwal' => $jadwal])->assertOk()
            ->assertJsonPath('data.jadwal.4A.Senin', ['upacara', 'bindo', 'mtk', 'ipas']);
        $this->assertSame('bindo', JadwalPelajaran::where(['kelas' => '4A', 'hari' => 'Senin', 'jam' => 1])->value('mapel'));
        // Presensi per pelajaran ikut jadwal baru (Senin, 19 Oktober 2026)
        $this->assertSame(['1-bindo', '2-mtk', '3-ipas'], array_column(Referensi::pelajaranHari('4A', '2026-10-19'), 'kunci'));

        // Jam kosong boleh; data lain ditolak
        $jadwal['Kamis'][3] = null;
        $this->kurikulum()->putJson('/api/jadwal/4A', ['jadwal' => $jadwal])->assertOk()->assertJsonPath('data.jadwal.4A.Kamis.3', null);
        $this->kurikulum()->putJson('/api/jadwal/1A', ['jadwal' => ['Senin' => ['upacara', 'ipas']]])->assertUnprocessable();
        $this->kurikulum()->putJson('/api/jadwal/4A', ['jadwal' => ['Sabtu' => ['mtk']]])->assertUnprocessable();
        $this->kurikulum()->putJson('/api/jadwal/9Z', ['jadwal' => $jadwal])->assertNotFound();
        // Wali kelas & guru mapel tidak mengatur jadwal
        $this->sebagai('g2')->putJson('/api/jadwal/4A', ['jadwal' => $jadwal])->assertForbidden();
        $this->sebagai('g7')->putJson('/api/jadwal/4A', ['jadwal' => $jadwal])->assertForbidden();
    }

    public function test_guru_mapel_tidak_boleh_mengajar_dua_kelas_di_jam_yang_sama(): void
    {
        $semua = Referensi::jadwal();
        $jadwal = $semua['4A'];
        // Bentrok lama (dari jadwal contoh) tidak menghalangi penyimpanan tanpa perubahan
        $this->kurikulum()->putJson('/api/jadwal/4A', ['jadwal' => $jadwal])->assertOk();

        // Cari jam saat Bahasa Inggris (Maria Natalia) mengajar kelas lain, lalu pasang juga di 4A
        foreach ($semua as $kelas => $perHari) {
            foreach ($perHari as $hari => $perJam) {
                foreach ($perJam as $jam => $mapel) {
                    if ($kelas !== '4A' && $mapel === 'bing' && $jadwal[$hari][$jam] !== 'bing' && Referensi::get("mapel.{$jadwal[$hari][$jam]}.absensi")) {
                        $jadwal[$hari][$jam] = 'bing';
                        $pesan = $this->kurikulum()->putJson('/api/jadwal/4A', ['jadwal' => $jadwal])->assertUnprocessable()->json('errors.jadwal.0');
                        $this->assertStringContainsString("bentrok: Maria Natalia, S.Pd. sudah mengajar Bahasa Inggris di kelas {$kelas}", $pesan);
                        $this->assertNotSame('bing', JadwalPelajaran::where(['kelas' => '4A', 'hari' => $hari, 'jam' => $jam])->value('mapel'));

                        return;
                    }
                }
            }
        }
        $this->fail('Jadwal contoh tidak punya jam Bahasa Inggris untuk diuji.');
    }

    public function test_agenda_libur_menghentikan_presensi(): void
    {
        $this->travelTo(CarbonImmutable::parse('2026-10-15 08:00', 'Asia/Jakarta'));
        $this->assertTrue(Waktu::hariSekolah('2026-10-15'));
        $this->assertFalse(Waktu::hariSekolah('2026-08-17')); // HUT RI dari kalender awal
        $this->assertFalse(Waktu::hariSekolah('2026-12-28')); // di tengah Libur Semester Ganjil

        // Validasi & hak akses agenda
        $this->kurikulum()->postJson('/api/kalender', ['judul' => 'X', 'jenis' => 'cuti', 'mulai' => '2026-10-15'])->assertUnprocessable();
        $this->kurikulum()->postJson('/api/kalender', ['judul' => 'X', 'jenis' => 'libur', 'mulai' => '2026-10-15', 'selesai' => '2026-10-14'])->assertUnprocessable();
        $this->sebagai('g2')->postJson('/api/kalender', ['judul' => 'X', 'jenis' => 'libur', 'mulai' => '2026-10-15'])->assertForbidden();

        $id = $this->kurikulum()->postJson('/api/kalender', ['judul' => 'Libur Banjir', 'jenis' => 'libur', 'mulai' => '2026-10-15', 'selesai' => '2026-10-15'])
            ->assertCreated()->assertJsonPath('data.kalender.0.selesai', null)->json('data.kalender.0.id');
        $this->assertFalse(Waktu::hariSekolah('2026-10-15'));
        $this->sebagai('g2')->postJson('/api/presensi-sesi', ['kelas' => '4A'])->assertUnprocessable()
            ->assertJsonPath('errors.kelas.0', 'Hari ini libur (Libur Banjir), presensi tidak dibuka.');
        $this->sebagai('g2')->putJson('/api/absensi/2026-10-15', ['perubahan' => ['230401' => 'H']])->assertUnprocessable();

        // Agenda dihapus: hari sekolah lagi
        $this->kurikulum()->deleteJson("/api/kalender/{$id}")->assertOk();
        $this->assertNull(Kalender::find($id));
        $this->sebagai('g2')->postJson('/api/presensi-sesi', ['kelas' => '4A'])->assertCreated();
    }
}
