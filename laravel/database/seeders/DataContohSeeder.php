<?php

namespace Database\Seeders;

use Closure;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/*
  Data contoh sekolah (siswa, absensi, nilai, SPP, perpustakaan, PPDB, chat, ...) dari
  data/contoh.json, yang dibuat website dengan `npm run ekspor-laravel` (sd-app/scripts). Setiap tabel
  hanya diisi jika masih kosong, jadi aman dijalankan ulang tanpa menimpa data yang sudah diubah.
  Guru & akun diisi GuruSeeder dan AkunSeeder.
*/
class DataContohSeeder extends Seeder
{
    private array $d;

    private string $sekarang;

    public function run(): void
    {
        $this->d = json_decode(file_get_contents(__DIR__.'/data/contoh.json'), true, flags: JSON_THROW_ON_ERROR);
        $this->sekarang = now()->format('Y-m-d H:i:s');

        $this->isi('siswa', fn () => array_map(fn ($s) => $this->ambil($s, ['id', 'nis', 'nama', 'kelas', 'jk', 'ortu']), $this->d['siswa']));
        $this->isi('pengumuman', fn () => array_map(fn ($p) => $this->ambil($p, ['id', 'judul', 'kategori', 'tanggal', 'isi']), $this->d['pengumuman']));
        $this->isi('absensi_harian', fn () => $this->absensiHarian());
        $this->isi('absensi_pelajaran', fn () => $this->absensiPelajaran());
        $this->isi('izin_siswa', fn () => array_map(fn ($i) => $this->ambil($i, [
            'id', 'nis', 'nama_siswa' => 'namaSiswa', 'kelas', 'jenis', 'tanggal_mulai' => 'tanggalMulai', 'tanggal_selesai' => 'tanggalSelesai',
            'alasan', 'lampiran', 'status', 'catatan_guru' => 'catatanGuru', 'diajukan' => fn ($x) => $this->waktu($x['diajukan']),
        ]), $this->d['izin']));
        $this->isi('presensi_staf', fn () => $this->presensiStaf());
        $this->isi('izin_staf', fn () => array_map(fn ($i) => $this->ambil($i, [
            'id', 'guru_id' => 'guruId', 'nama', 'jenis', 'tanggal_mulai' => 'tanggalMulai', 'tanggal_selesai' => 'tanggalSelesai', 'alasan', 'lampiran',
            'status', 'catatan', 'diajukan' => fn ($x) => $this->waktu($x['diajukan']), 'diproses_oleh' => 'diprosesOleh',
            'diproses' => fn ($x) => $this->waktu($x['diproses'] ?? null),
        ]), $this->d['izinStaf']));
        $this->isi('tugas', fn () => array_map(fn ($t) => $this->ambil($t, ['id', 'kelas', 'mapel', 'judul', 'deskripsi', 'diberikan', 'tenggat']), $this->d['tugas']));
        $this->isi('tugas_selesai', fn () => $this->petaDaftar($this->d['tugasSelesai'], 'tugas_id'), false);
        $this->isi('nilai', fn () => $this->nilai());
        $this->isi('catatan_wali', fn () => array_map(fn ($nis, $teks) => compact('nis', 'teks'), array_keys($this->d['catatanWali']), $this->d['catatanWali']));
        $this->isi('sikap', fn () => array_map(fn ($s) => $this->ambil($s, ['id', 'nis', 'kode', 'poin', 'tanggal', 'catatan', 'oleh']), $this->d['sikap']));
        $this->isi('ekskul_siswa', fn () => $this->petaDaftar($this->d['ekskul'], 'ekskul'), false);
        $this->isi('spp_pembayaran', fn () => $this->spp());
        $this->isi('buku', fn () => array_map(fn ($b) => $this->ambil($b, ['id', 'judul', 'penulis', 'kategori', 'stok']), $this->d['buku']));
        $this->isi('peminjaman', fn () => array_map(fn ($p) => $this->ambil($p, [
            'id', 'buku_id' => 'bukuId', 'nis', 'tanggal_pinjam' => 'tanggalPinjam', 'tenggat', 'tanggal_kembali' => 'tanggalKembali',
        ]), $this->d['peminjaman']));
        $this->isi('reservasi', fn () => array_map(fn ($r) => $this->ambil($r, ['id', 'nis', 'buku_id' => 'bukuId', 'tanggal', 'status']), $this->d['reservasi']));
        $this->isi('inventaris', fn () => array_map(fn ($i) => $this->ambil($i, ['id', 'nama', 'kategori', 'lokasi', 'jumlah', 'kondisi', 'keterangan']), $this->d['inventaris']));
        $this->isi('kerusakan', fn () => array_map(fn ($k) => $this->ambil($k, ['id', 'nama', 'lokasi', 'pelapor', 'tanggal', 'prioritas', 'status', 'keterangan']), $this->d['kerusakan']));
        $this->isi('konseling', fn () => array_map(fn ($k) => $this->ambil($k, [
            'id', 'nis', 'nama', 'kelas', 'tanggal', 'kategori', 'layanan', 'masalah', 'tindak_lanjut' => 'tindakLanjut', 'status',
        ]), $this->d['konseling']));
        $this->isi('buku_tamu', fn () => array_map(fn ($b) => $this->ambil($b, [
            'id', 'tanggal', 'nama', 'instansi', 'keperluan', 'bertemu', 'whatsapp', 'jumlah', 'masuk', 'keluar',
        ]), $this->d['bukuTamu']));
        $this->isi('pendaftar', fn () => array_map(fn ($p) => $this->ambil($p, [
            'id', 'nomor', 'nama', 'panggilan', 'jk', 'tempat_lahir' => 'tempatLahir', 'tanggal_lahir' => 'tanggalLahir', 'nik', 'agama',
            'asal_tk' => 'asalTk', 'alamat', 'nama_ayah' => 'namaAyah', 'pekerjaan_ayah' => 'pekerjaanAyah', 'nama_ibu' => 'namaIbu',
            'pekerjaan_ibu' => 'pekerjaanIbu', 'whatsapp', 'email', 'jalur', 'info_jalur' => 'infoJalur',
            'berkas' => fn ($x) => json_encode($x['berkas']), 'status', 'catatan_panitia' => 'catatanPanitia',
            'dibuat' => fn ($x) => $this->waktu($x['dibuat']),
        ]), $this->d['pendaftar']));
        $this->isi('kunjungan', fn () => array_map(fn ($k) => $this->ambil($k, [
            'id', 'kode', 'nama', 'whatsapp', 'tanggal', 'sesi', 'jumlah', 'keperluan', 'fasilitas' => fn ($x) => json_encode($x['fasilitas']),
            'catatan', 'status', 'catatan_tu' => 'catatanTu', 'dibuat' => fn ($x) => $this->waktu($x['dibuat']),
        ]), $this->d['kunjungan']));
        $this->chat();
    }

    // Isi tabel hanya jika masih kosong; baris dimasukkan per 500 agar cepat
    private function isi(string $tabel, callable $baris, bool $waktu = true): void
    {
        if (DB::table($tabel)->exists()) {
            return;
        }
        $semua = $baris();
        if ($waktu) {
            $semua = array_map(fn ($b) => $b + ['created_at' => $this->sekarang, 'updated_at' => $this->sekarang], $semua);
        }
        foreach (array_chunk($semua, 500) as $potong) {
            DB::table($tabel)->insert($potong);
        }
    }

    // Ambil kolom dari data website: 'kolom', 'kolom' => 'kunciWebsite', atau 'kolom' => fn ($data)
    private function ambil(array $data, array $kolom): array
    {
        $hasil = [];
        foreach ($kolom as $k => $sumber) {
            if (is_int($k)) {
                [$k, $sumber] = [$sumber, $sumber];
            }
            $hasil[$k] = $sumber instanceof Closure ? $sumber($data) : ($data[$sumber] ?? null);
        }

        return $hasil;
    }

    private function waktu(?string $iso): ?string
    {
        return $iso ? Carbon::parse($iso)->utc()->format('Y-m-d H:i:s.v') : null;
    }

    // { nis: [a, b] } menjadi baris (nis, kolom)
    private function petaDaftar(array $peta, string $kolom): array
    {
        $hasil = [];
        foreach ($peta as $nis => $daftar) {
            foreach ($daftar as $nilai) {
                $hasil[] = ['nis' => (string) $nis, $kolom => $nilai, 'created_at' => $this->sekarang];
            }
        }

        return $hasil;
    }

    private function absensiHarian(): array
    {
        $hasil = [];
        foreach ($this->d['absensi'] as $tanggal => $perSiswa) {
            foreach ($perSiswa as $nis => $status) {
                $jejak = $this->d['jejakAbsensi'][$tanggal][$nis] ?? [];
                $hasil[] = ['tanggal' => $tanggal, 'nis' => (string) $nis, 'status' => $status] + $this->jejak($jejak) + ['pelajaran' => $jejak['pelajaran'] ?? null];
            }
        }

        return $hasil;
    }

    private function absensiPelajaran(): array
    {
        $hasil = [];
        foreach ($this->d['absensiMapel'] as $tanggal => $perSiswa) {
            foreach ($perSiswa as $nis => $perPelajaran) {
                foreach ($perPelajaran as $kunci => $status) {
                    $jejak = $this->d['jejakMapel'][$tanggal][$nis][$kunci] ?? [];
                    $hasil[] = ['tanggal' => $tanggal, 'nis' => (string) $nis, 'kunci' => $kunci, 'status' => $status] + $this->jejak($jejak);
                }
            }
        }

        return $hasil;
    }

    private function jejak(array $j): array
    {
        return [
            'cara' => $j['cara'] ?? null,
            'jam' => $j['jam'] ?? null,
            'oleh' => $j['oleh'] ?? null,
            'sebelum' => $j['sebelum'] ?? null,
            'otp' => $j['otp'] ?? null,
            'sesi_id' => $j['sesiId'] ?? null,
        ];
    }

    private function presensiStaf(): array
    {
        $guru = DB::table('guru')->pluck('id')->flip();
        $hasil = [];
        foreach ($this->d['presensiStaf'] as $tanggal => $perGuru) {
            foreach ($perGuru as $guruId => $r) {
                if (! isset($guru[$guruId])) {
                    continue;
                }
                $hasil[] = [
                    'tanggal' => $tanggal,
                    'guru_id' => $guruId,
                    'status' => $r['status'],
                    'masuk' => $r['masuk'] ?? null,
                    'pulang' => $r['pulang'] ?? null,
                    'alasan_masuk' => ($r['alasanMasuk'] ?? '') ?: null,
                    'alasan_pulang' => ($r['alasanPulang'] ?? '') ?: null,
                    'ket' => $r['ket'] ?? null,
                    'izin_id' => $r['izinId'] ?? null,
                    'koreksi' => isset($r['koreksi']) ? json_encode($r['koreksi']) : null,
                ];
            }
        }

        return $hasil;
    }

    private function nilai(): array
    {
        $hasil = [];
        foreach ($this->d['nilai'] as $nis => $perMapel) {
            foreach ($perMapel as $mapel => $n) {
                $hasil[] = ['nis' => (string) $nis, 'mapel' => $mapel, 'tugas' => json_encode($n['tugas'] ?? []), 'pts' => $n['pts'] ?? null, 'pas' => $n['pas'] ?? null];
            }
        }

        return $hasil;
    }

    private function spp(): array
    {
        $hasil = [];
        foreach ($this->d['spp'] as $nis => $perBulan) {
            foreach ($perBulan as $bulan => $b) {
                $hasil[] = ['nis' => (string) $nis, 'bulan' => $bulan, 'tanggal' => $b['tanggal'], 'metode' => $b['metode'], 'no_transaksi' => $b['noTransaksi'], 'jumlah' => $b['jumlah']];
            }
        }

        return $hasil;
    }

    private function chat(): void
    {
        $chat = $this->d['chat'];
        if (! DB::table('chat_pesan')->exists()) {
            $baris = [];
            foreach ($chat['pesan'] as $pid => $daftar) {
                foreach ($daftar as $p) {
                    $waktu = $this->waktu($p['waktu']);
                    $baris[] = ['id' => $p['id'], 'percakapan' => $pid, 'dari' => $p['dari'], 'waktu' => $waktu, 'teks' => $p['teks'] ?? null, 'lampiran' => null, 'dihapus' => null, 'diubah' => $waktu];
                }
            }
            DB::table('chat_pesan')->insert($baris);
        }
        if (! DB::table('chat_dibaca')->exists()) {
            $baris = [];
            foreach ($chat['dibaca'] as $pengguna => $perPercakapan) {
                foreach ($perPercakapan as $pid => $waktu) {
                    $baris[] = ['pengguna' => $pengguna, 'percakapan' => $pid, 'waktu' => $this->waktu($waktu)];
                }
            }
            foreach (array_chunk($baris, 500) as $potong) {
                DB::table('chat_dibaca')->insert($potong);
            }
        }
    }
}
