<?php

namespace App\Http\Controllers;

use App\Models\Buku;
use App\Models\Peminjaman;
use App\Models\Reservasi;
use App\Models\Siswa;
use App\Support\Waktu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/*
  Perpustakaan: pustakawan mencatat peminjaman & pengembalian, siswa memesan buku (reservasi) yang
  lalu diproses pustakawan menjadi peminjaman. Stok tersedia = jumlah eksemplar − yang sedang dipinjam.
*/
class PerpustakaanController extends Controller
{
    private const LAMA_PINJAM = 7; // hari

    private const MAKS_PESANAN = 1; // pesanan yang menunggu per siswa

    private const MAKS_PINJAM = 2; // buku yang sedang dipinjam per siswa

    public function pinjam(Request $request): JsonResponse
    {
        $this->pustakawan($request);
        $isian = $request->validate([
            'nis' => ['required', Rule::exists('siswa', 'nis')],
            'bukuId' => ['required', Rule::exists('buku', 'id')],
        ], ['nis.required' => 'Pilih siswa.', 'nis.exists' => 'Siswa tidak ditemukan.', 'bukuId.required' => 'Pilih buku.', 'bukuId.exists' => 'Buku tidak ditemukan.']);

        $pinjam = DB::transaction(fn () => $this->buatPeminjaman($isian['nis'], $isian['bukuId']));

        return $this->tambalan(['peminjaman' => [$pinjam->toArray()]], status: 201);
    }

    public function kembalikan(Request $request, Peminjaman $peminjaman): JsonResponse
    {
        $this->pustakawan($request);
        if (! $peminjaman->tanggal_kembali) {
            $peminjaman->update(['tanggal_kembali' => Waktu::hariIni()]);
        }

        return $this->tambalan(['peminjaman' => [$peminjaman->fresh()->toArray()]]);
    }

    // Siswa memesan buku
    public function pesan(Request $request): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->role === 'siswa', 'Pemesanan buku dilakukan siswa.');
        $bukuId = $request->validate(['bukuId' => ['required', Rule::exists('buku', 'id')]], ['bukuId.exists' => 'Buku tidak ditemukan.'])['bukuId'];
        if (Reservasi::where('nis', $a->nis)->where('status', 'Menunggu')->count() >= self::MAKS_PESANAN) {
            throw ValidationException::withMessages(['bukuId' => 'Kamu hanya bisa memesan 1 buku dalam satu waktu.']);
        }
        $dipinjam = Peminjaman::where('nis', $a->nis)->whereNull('tanggal_kembali');
        if ((clone $dipinjam)->count() >= self::MAKS_PINJAM) {
            throw ValidationException::withMessages(['bukuId' => 'Kamu sedang meminjam '.self::MAKS_PINJAM.' buku. Kembalikan dulu sebelum memesan lagi.']);
        }
        if ($dipinjam->where('buku_id', $bukuId)->exists()) {
            throw ValidationException::withMessages(['bukuId' => 'Kamu sedang meminjam buku ini.']);
        }
        $buku = Buku::findOrFail($bukuId);
        if (Peminjaman::where('buku_id', $bukuId)->whereNull('tanggal_kembali')->count() >= $buku->stok) {
            throw ValidationException::withMessages(['bukuId' => "Semua eksemplar \"{$buku->judul}\" sedang dipinjam."]);
        }
        $r = Reservasi::create(['nis' => $a->nis, 'buku_id' => $bukuId, 'tanggal' => Waktu::hariIni(), 'status' => 'Menunggu']);

        return $this->tambalan(['reservasi' => [$r->fresh()->toArray()]], status: 201);
    }

    public function batalPesan(Request $request, Reservasi $reservasi): JsonResponse
    {
        $a = $this->akses($request);
        $a->wajib($a->role === 'siswa' && $reservasi->nis === $a->nis, 'Pesanan ini bukan milikmu.');
        if ($reservasi->status !== 'Menunggu') {
            throw ValidationException::withMessages(['status' => "Pesanan ini sudah {$reservasi->status}."]);
        }
        $reservasi->delete();

        return $this->tambalan(hapus: ['reservasi' => [$reservasi->id]]);
    }

    // Pustakawan memproses pesanan: Selesai (buku dipinjamkan) atau Ditolak
    public function prosesPesanan(Request $request, Reservasi $reservasi): JsonResponse
    {
        $this->pustakawan($request);
        $status = $request->validate(['status' => ['required', Rule::in(['Selesai', 'Ditolak'])]])['status'];
        if ($reservasi->status !== 'Menunggu') {
            throw ValidationException::withMessages(['status' => "Pesanan ini sudah {$reservasi->status}."]);
        }
        $data = DB::transaction(function () use ($reservasi, $status) {
            $hasil = [];
            if ($status === 'Selesai') {
                $hasil['peminjaman'] = [$this->buatPeminjaman($reservasi->nis, $reservasi->buku_id)->toArray()];
            }
            $reservasi->update(['status' => $status]);

            return ['reservasi' => [$reservasi->fresh()->toArray()]] + $hasil;
        });

        return $this->tambalan($data);
    }

    private function pustakawan(Request $request): void
    {
        $a = $this->akses($request);
        $a->wajib($a->punya('perpustakaan'), 'Peminjaman buku dikelola pustakawan.');
    }

    private function buatPeminjaman(string $nis, string $bukuId): Peminjaman
    {
        $buku = Buku::lockForUpdate()->findOrFail($bukuId);
        $dipinjam = Peminjaman::where('buku_id', $bukuId)->whereNull('tanggal_kembali')->count();
        if ($dipinjam >= $buku->stok) {
            throw ValidationException::withMessages(['bukuId' => "Semua eksemplar \"{$buku->judul}\" sedang dipinjam."]);
        }
        $pinjamanSiswa = Peminjaman::where('nis', $nis)->whereNull('tanggal_kembali');
        $nama = Siswa::where('nis', $nis)->value('nama');
        if ((clone $pinjamanSiswa)->where('buku_id', $bukuId)->exists()) {
            throw ValidationException::withMessages(['bukuId' => "{$nama} sedang meminjam buku ini."]);
        }
        if ($pinjamanSiswa->count() >= self::MAKS_PINJAM) {
            throw ValidationException::withMessages(['nis' => "{$nama} sudah meminjam ".self::MAKS_PINJAM.' buku. Kembalikan dulu sebelum meminjam lagi.']);
        }
        $hariIni = Waktu::hariIni();

        return Peminjaman::create([
            'buku_id' => $bukuId,
            'nis' => $nis,
            'tanggal_pinjam' => $hariIni,
            'tenggat' => Waktu::sekarang()->addDays(self::LAMA_PINJAM)->toDateString(),
            'tanggal_kembali' => null,
        ])->fresh();
    }
}
