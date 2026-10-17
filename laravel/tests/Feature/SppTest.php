<?php

namespace Tests\Feature;

use App\Models\SppPembayaran;
use App\Models\TransaksiSpp;
use App\Models\User;
use App\Support\PembayaranSpp;
use App\Support\Referensi;
use Database\Seeders\DataContohSeeder;
use Database\Seeders\GuruSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// SPP online: lunas hanya dari notifikasi gateway bertanda tangan, simulator bank, dan kuitansi PDF (SQLite di memori)
class SppTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([GuruSeeder::class, DataContohSeeder::class]);
    }

    private function akun(string $role, array $data = []): User
    {
        return User::factory()->create(['username' => $role.uniqid(), 'role' => $role, ...$data]);
    }

    private function sebagai(User $user)
    {
        return $this->actingAs($user)->withSession(['masuk_pada' => now()->timestamp]);
    }

    private function ortu(): User
    {
        return $this->akun('ortu', ['anak_nis' => '230401']);
    }

    // Transaksi QRIS baru untuk bulan pertama yang belum lunas
    private function transaksi(User $ortu, string $metode = 'qris'): TransaksiSpp
    {
        $bulan = collect(Referensi::get('spp.bulan'))->diff(SppPembayaran::where('nis', '230401')->pluck('bulan'))->first();
        $id = $this->sebagai($ortu)->postJson('/api/transaksi-spp', ['bulan' => [$bulan], 'metode' => $metode, 'bank' => $metode === 'va' ? 'bca' : null])
            ->assertCreated()->json('data.transaksi.0.id');

        return TransaksiSpp::findOrFail($id);
    }

    private function notifikasi(TransaksiSpp $trx, ?int $jumlah = null, ?string $tandaTangan = null)
    {
        $jumlah ??= $trx->total;

        return $this->postJson('/api/gateway/spp', [
            'kode' => $trx->kode,
            'status' => 'berhasil',
            'jumlah' => $jumlah,
            'tandaTangan' => $tandaTangan ?? PembayaranSpp::tandaTangan($trx->kode, 'berhasil', $jumlah),
        ]);
    }

    public function test_orang_tua_tidak_bisa_menandai_lunas_sendiri(): void
    {
        $ortu = $this->ortu();
        $trx = $this->transaksi($ortu);
        $this->assertFalse($trx->toArray()['simulasi']); // simulator mati di lingkungan uji

        $this->sebagai($ortu)->postJson("/api/transaksi-spp/{$trx->id}/bayar")->assertNotFound();
        // Notifikasi palsu tanpa kunci rahasia gateway ditolak
        $this->notifikasi($trx, tandaTangan: str_repeat('a', 64))->assertForbidden();
        $this->assertSame('menunggu', $trx->fresh()->status);
        $this->assertSame(0, SppPembayaran::where('no_transaksi', $trx->no_transaksi)->count());
    }

    public function test_notifikasi_gateway_bertanda_tangan_melunasi_sekali_saja(): void
    {
        $trx = $this->transaksi($this->ortu());

        // Nominal berbeda dari tagihan ditolak walau tanda tangannya sah
        $this->notifikasi($trx, jumlah: $trx->total - 1000)->assertUnprocessable();
        $this->assertSame('menunggu', $trx->fresh()->status);

        $this->notifikasi($trx)->assertOk()->assertJson(['diterima' => true, 'status' => 'berhasil']);
        $this->assertSame('berhasil', $trx->fresh()->status);
        $baris = SppPembayaran::where('no_transaksi', $trx->no_transaksi)->get();
        $this->assertCount(count($trx->bulan), $baris);
        $this->assertSame('QRIS', $baris->first()->metode);

        // Notifikasi yang terkirim ulang tidak mencatat pembayaran dua kali
        $this->notifikasi($trx)->assertOk();
        $this->assertSame(count($trx->bulan), SppPembayaran::where('no_transaksi', $trx->no_transaksi)->count());
    }

    public function test_transaksi_kedaluwarsa_atau_dibatalkan_tidak_bisa_dilunasi(): void
    {
        $ortu = $this->ortu();
        $trx = $this->transaksi($ortu);
        $trx->update(['kadaluarsa' => now()->subMinute()]);
        $this->notifikasi($trx)->assertUnprocessable();

        $trx->update(['kadaluarsa' => now()->addMinutes(10)]);
        $this->sebagai($ortu)->postJson("/api/transaksi-spp/{$trx->id}/batal")->assertOk();
        $this->notifikasi($trx->fresh())->assertUnprocessable();
        $this->assertSame(0, SppPembayaran::where('no_transaksi', $trx->no_transaksi)->count());
    }

    public function test_simulator_bank_hanya_saat_mode_simulasi(): void
    {
        $ortu = $this->ortu();
        $trx = $this->transaksi($ortu, 'va');
        $this->getJson("/api/simulasi-gateway/{$trx->kode}")->assertNotFound();
        $this->postJson('/api/simulasi-gateway/bayar', ['kode' => $trx->kode, 'pin' => '123456'])->assertNotFound();

        config(['sekolah.simulasi_gateway' => true]);
        $this->assertTrue($trx->fresh()->toArray()['simulasi']);
        $this->getJson("/api/simulasi-gateway/{$trx->kode}")->assertOk()
            ->assertJson(['merchant' => 'SD Harapan Gemilang', 'atasNama' => 'RAFA A***', 'metode' => 'VA BCA', 'jumlah' => $trx->total, 'status' => 'menunggu']);
        $this->getJson('/api/simulasi-gateway/TIDAK-ADA')->assertNotFound();
        $this->postJson('/api/simulasi-gateway/bayar', ['kode' => $trx->kode, 'pin' => '12'])->assertUnprocessable();

        $this->postJson('/api/simulasi-gateway/bayar', ['kode' => $trx->kode, 'pin' => '123456'])->assertOk()->assertJson(['status' => 'berhasil']);
        $this->assertSame('berhasil', $trx->fresh()->status);
        $this->assertSame(1, SppPembayaran::where('no_transaksi', $trx->no_transaksi)->count());
        $this->sebagai($ortu)->getJson('/api/data?koleksi=transaksi')->assertOk()->assertJsonPath('data.transaksi.0.status', 'berhasil');

        // Produksi: simulator selalu mati walau pengaturannya menyala
        $this->app['env'] = 'production';
        $this->assertFalse(PembayaranSpp::simulasiAktif());
        $this->getJson("/api/simulasi-gateway/{$trx->kode}")->assertNotFound();
    }

    public function test_kuitansi_pdf_hanya_untuk_yang_berhak(): void
    {
        $no = SppPembayaran::where('nis', '230401')->value('no_transaksi');
        $alamat = "/api/spp/kuitansi/230401/{$no}";

        $this->getJson($alamat)->assertUnauthorized();
        $jawaban = $this->sebagai($this->ortu())->get($alamat)->assertOk()->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringStartsWith('%PDF', $jawaban->getContent());
        $this->assertStringContainsString("attachment; filename=\"Kuitansi-{$no}.pdf\"", $jawaban->headers->get('Content-Disposition'));

        // Orang tua siswa lain & staf non-SPP ditolak; Tata Usaha boleh
        $this->sebagai($this->akun('ortu', ['anak_nis' => '230402']))->getJson($alamat)->assertForbidden();
        $this->sebagai($this->akun('staf', ['guru_id' => 'g13']))->getJson($alamat)->assertForbidden();
        $this->sebagai($this->akun('staf', ['guru_id' => 'g9']))->get($alamat)->assertOk();
        $this->sebagai($this->ortu())->getJson('/api/spp/kuitansi/230401/SPP-TIDAK-ADA')->assertNotFound();
    }
}
