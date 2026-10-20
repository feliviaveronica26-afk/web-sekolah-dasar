<?php

namespace App\Http\Controllers;

use App\Models\Buku;
use App\Models\BukuTamu;
use App\Models\Inventaris;
use App\Models\Kalender;
use App\Models\Kerusakan;
use App\Models\Konseling;
use App\Models\ModelSekolah;
use App\Models\Pengumuman;
use App\Models\Siswa;
use App\Support\Referensi;
use App\Support\Versi;
use App\Support\Waktu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/*
  Koleksi sederhana yang dikelola lewat formulir tambah/ubah/hapus di website: pengumuman, inventaris,
  laporan kerusakan, catatan konseling, katalog buku, buku tamu, dan agenda kalender akademik. Masing-masing dijaga menu
  jabatannya (lihat Akses::PERAN). Perubahan sebagian (mis. hanya jam keluar tamu) digabung dengan
  data lama lalu diperiksa ulang seluruhnya.
*/
class KoleksiController extends Controller
{
    // Nama di alamat API => [model, nama koleksi di website, menu yang berhak]
    private const KOLEKSI = [
        'pengumuman' => [Pengumuman::class, 'pengumuman', 'pengumuman'],
        'inventaris' => [Inventaris::class, 'inventaris', 'inventaris'],
        'kerusakan' => [Kerusakan::class, 'kerusakan', 'kerusakan'],
        'konseling' => [Konseling::class, 'konseling', 'konseling'],
        'buku' => [Buku::class, 'buku', 'perpustakaan'],
        'buku-tamu' => [BukuTamu::class, 'bukuTamu', 'bukutamu'],
        'kalender' => [Kalender::class, 'kalender', 'kalender'],
    ];

    public const NAMA = ['pengumuman', 'inventaris', 'kerusakan', 'konseling', 'buku', 'buku-tamu', 'kalender'];

    public function store(Request $request, string $koleksi): JsonResponse
    {
        [$kelas, $nama] = $this->siapkan($request, $koleksi);
        $isian = $this->validasi($koleksi, $request->all());
        if ($koleksi === 'buku-tamu') {
            $isian += ['tanggal' => Waktu::hariIni(), 'masuk' => Waktu::jam(), 'keluar' => ''];
        }
        $item = $kelas::create($kelas::dariWebsite($isian));

        return $this->tambalan([$nama => [$item->fresh()->toArray()]], status: 201);
    }

    public function update(Request $request, string $koleksi, string $id): JsonResponse
    {
        [$kelas, $nama] = $this->siapkan($request, $koleksi);
        /** @var ModelSekolah $item */
        $item = $kelas::findOrFail($id);
        $isian = $this->validasi($koleksi, [...$item->toArray(), ...$request->except('id')]);
        $item->update($kelas::dariWebsite($isian));

        return $this->tambalan([$nama => [$item->fresh()->toArray()]]);
    }

    public function destroy(Request $request, string $koleksi, string $id): JsonResponse
    {
        [$kelas, $nama] = $this->siapkan($request, $koleksi);
        $kelas::findOrFail($id)->delete();
        if ($koleksi === 'buku') {
            // Peminjaman & pesanan buku ini ikut terhapus
            Versi::naikkan('peminjaman', 'reservasi');
        }

        return $this->tambalan(hapus: [$nama => [$id]]);
    }

    private function siapkan(Request $request, string $koleksi): array
    {
        [$kelas, $nama, $menu] = self::KOLEKSI[$koleksi] ?? abort(404);
        $this->akses($request)->wajib($this->akses($request)->punya($menu));

        return [$kelas, $nama];
    }

    private function validasi(string $koleksi, array $isian): array
    {
        $isian = array_map(fn ($v) => is_string($v) ? trim($v) : $v, $isian);
        $pilihan = fn (string $p) => Rule::in(Referensi::pilihan($p));
        $tanggal = ['required', 'date_format:Y-m-d'];
        $keterangan = ['nullable', 'string', 'max:500'];

        $aturan = match ($koleksi) {
            'pengumuman' => [
                'judul' => ['required', 'string', 'max:200'],
                'kategori' => ['required', $pilihan('kategoriPengumuman')],
                'tanggal' => $tanggal,
                'isi' => ['required', 'string', 'max:5000'],
            ],
            'inventaris' => [
                'nama' => ['required', 'string', 'max:120'],
                'kategori' => ['required', $pilihan('kategoriBarang')],
                'lokasi' => ['required', $pilihan('lokasi')],
                'jumlah' => ['required', 'integer', 'min:0', 'max:1000000'],
                'kondisi' => ['required', $pilihan('kondisiBarang')],
                'keterangan' => $keterangan,
            ],
            'kerusakan' => [
                'nama' => ['required', 'string', 'max:150'],
                'lokasi' => ['required', $pilihan('lokasi')],
                'pelapor' => ['required', 'string', 'max:120'],
                'tanggal' => $tanggal,
                'prioritas' => ['required', Rule::in(['Tinggi', 'Sedang', 'Rendah'])],
                'status' => ['required', $pilihan('statusKerusakan')],
                'keterangan' => $keterangan,
            ],
            'konseling' => [
                'nis' => ['required', Rule::exists('siswa', 'nis')],
                'tanggal' => $tanggal,
                'kategori' => ['required', $pilihan('kategoriKonseling')],
                'layanan' => ['required', $pilihan('layananKonseling')],
                'status' => ['required', $pilihan('statusKonseling')],
                'masalah' => ['required', 'string', 'max:5000'],
                'tindakLanjut' => ['nullable', 'string', 'max:5000'],
            ],
            'buku' => [
                'judul' => ['required', 'string', 'max:150'],
                'penulis' => ['required', 'string', 'max:120'],
                'kategori' => ['required', 'string', 'max:60'],
                'stok' => ['required', 'integer', 'min:0', 'max:9999'],
            ],
            'buku-tamu' => [
                'nama' => ['required', 'string', 'max:120'],
                'instansi' => ['nullable', 'string', 'max:120'],
                'keperluan' => ['required', $pilihan('keperluanTamu')],
                'bertemu' => ['nullable', 'string', 'max:120'],
                'whatsapp' => ['nullable', 'string', 'max:20', 'regex:/^[0-9+\- ]*$/'],
                'jumlah' => ['required', 'integer', 'min:1', 'max:50'],
                'keluar' => ['nullable', 'regex:/^([01][0-9]|2[0-3])\.[0-5][0-9]$/'],
                'kodeKunjungan' => ['nullable', 'string', Rule::exists('kunjungan', 'kode')],
            ],
            // Agenda berjenis libur menghentikan presensi pada tanggal-tanggalnya (Waktu::hariSekolah)
            'kalender' => [
                'judul' => ['required', 'string', 'max:150'],
                'jenis' => ['required', Rule::in(Kalender::JENIS)],
                'mulai' => $tanggal,
                'selesai' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:mulai'],
                'perkiraan' => ['nullable', 'boolean'],
                'keterangan' => $keterangan,
            ],
        };

        $data = validator($isian, $aturan, [
            'required' => 'Kolom :attribute wajib diisi.',
            'max' => 'Kolom :attribute terlalu panjang.',
            'in' => 'Pilihan :attribute tidak dikenal.',
            'integer' => 'Kolom :attribute harus berupa angka.',
            'min' => 'Kolom :attribute minimal :min.',
            'date_format' => 'Tanggal tidak valid.',
            'exists' => 'Siswa tidak ditemukan.',
            'regex' => 'Format :attribute tidak valid.',
            'after_or_equal' => 'Tanggal selesai tidak boleh sebelum tanggal mulai.',
            'boolean' => 'Isian :attribute tidak valid.',
        ], [
            'tindakLanjut' => 'tindak lanjut',
            'whatsapp' => 'WhatsApp',
            'stok' => 'jumlah eksemplar',
        ])->validate();

        // Kolom teks opsional disimpan sebagai teks kosong, bukan NULL
        foreach (['keterangan', 'instansi', 'bertemu', 'whatsapp', 'keluar'] as $k) {
            if (array_key_exists($k, $data)) {
                $data[$k] ??= '';
            }
        }
        if ($koleksi === 'kalender') {
            $data['perkiraan'] = (bool) ($data['perkiraan'] ?? false);
            // Agenda satu hari disimpan tanpa tanggal selesai
            $data['selesai'] = ($data['selesai'] ?? null) === $data['mulai'] ? null : ($data['selesai'] ?? null);
        }
        if ($koleksi === 'konseling') {
            $siswa = Siswa::where('nis', $data['nis'])->first();
            $data += ['nama' => $siswa->nama, 'kelas' => $siswa->kelas];
        }

        return $data;
    }
}
