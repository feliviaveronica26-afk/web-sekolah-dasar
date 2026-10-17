<?php

namespace App\Support;

use App\Models\Guru;
use App\Models\Siswa;
use App\Models\User;
use Illuminate\Support\Collection;

/*
  Hak akses pengguna, sama dengan sd-app/src/context/akses.js: menu tiap jabatan guru & staf, menu
  Kepala Sekolah, dan lingkup kelas/mapel per menu. Website menyembunyikan menu yang tidak boleh
  dibuka; server memeriksa ulang di sini agar data tidak bisa diubah lewat jalan lain.
*/
final class Akses
{
    // Jabatan di Portal Guru & Staf beserta menu yang dibukanya (PERAN di akses.js)
    public const PERAN = [
        'wali_kelas' => ['kelas', 'absensi', 'izin', 'nilai', 'tugas', 'sikap', 'rapor'],
        'guru_mapel' => ['kelas', 'absensi', 'nilai', 'tugas', 'sikap'],
        'wakasek_kurikulum' => ['jadwal', 'kalender', 'pengumuman', 'nilai', 'rapor'],
        'wakasek_kesiswaan' => ['siswa', 'kehadiran', 'sikap'],
        'tata_usaha' => ['siswa', 'ortu', 'spp', 'ppdb', 'kunjungan'],
        'pustakawan' => ['perpustakaan'],
        'wakasek_sarpras' => ['inventaris', 'kerusakan'],
        'guru_bk' => ['konseling', 'sikap', 'siswa', 'kehadiran'],
        'satpam' => ['bukutamu'],
    ];

    public const MENU_UMUM = ['presensi', 'chat'];

    public const MENU_KEPSEK = [
        'presensi', 'chat', 'kelas', 'siswa', 'ortu', 'guru', 'kehadiran', 'nilai', 'rapor', 'sikap', 'konseling', 'tugas', 'keuangan', 'spp', 'ppdb', 'kunjungan', 'bukutamu',
        'pengumuman', 'perpustakaan', 'inventaris', 'kerusakan', 'jadwal', 'kalender',
    ];

    public readonly string $role;

    public readonly bool $kepsek;

    /** @var list<string> */
    public readonly array $peran;

    /** @var list<string> */
    public readonly array $menu;

    public readonly ?string $guruId;

    public readonly string $nama;

    // Kelas yang diwalikan (wali kelas), kosong jika bukan wali kelas
    public readonly string $kelas;

    // NIS siswa yang login, atau NIS anak untuk orang tua
    public readonly ?string $nis;

    private ?Collection $semuaGuru = null;

    private ?string $kelasSiswa = null;

    public function __construct(public readonly ?User $user)
    {
        $this->role = $user->role ?? 'tamu';
        $this->kepsek = $this->role === 'kepsek';
        $this->nis = match ($this->role) {
            'siswa' => $user->nis,
            'ortu' => $user->anak_nis,
            default => null,
        };

        if ($this->kepsek) {
            $guru = $this->guru()->firstWhere('jabatan', 'Kepala Sekolah');
            $this->peran = [];
            $this->menu = self::MENU_KEPSEK;
        } else {
            $guru = $this->role === 'staf' ? $this->guru()->firstWhere('id', $user->guru_id) : null;
            $this->peran = $guru?->peran ?? [];
            $menu = self::MENU_UMUM;
            foreach ($this->peran as $p) {
                $menu = [...$menu, ...(self::PERAN[$p] ?? [])];
            }
            $this->menu = $this->role === 'staf' ? array_values(array_unique($menu)) : [];
        }
        $this->guruId = $guru?->id;
        // Kepala Sekolah memakai nama akunnya (sama dengan yang tampil di website), bukan nama di data guru
        $this->nama = $this->kepsek ? ($user->profil()['nama'] ?? $user->name) : ($guru?->nama ?? $user?->name ?? '');
        $this->kelas = in_array('wali_kelas', $this->peran, true) ? (string) $guru->kelas : '';
    }

    public static function dari(?User $user): self
    {
        return new self($user);
    }

    public function guru(): Collection
    {
        return $this->semuaGuru ??= Guru::orderBy('urutan')->get();
    }

    // Guru & staf (termasuk Kepala Sekolah)
    public function staf(): bool
    {
        return in_array($this->role, ['staf', 'kepsek'], true);
    }

    // Siswa atau orang tua: hanya boleh melihat data milik satu siswa
    public function keluarga(): bool
    {
        return in_array($this->role, ['siswa', 'ortu'], true);
    }

    public function punya(string $menu): bool
    {
        return in_array($menu, $this->menu, true);
    }

    public function punyaPeran(string $peran): bool
    {
        return in_array($peran, $this->peran, true);
    }

    // Kelas siswa yang login / anak orang tua
    public function kelasSiswa(): ?string
    {
        return $this->kelasSiswa ??= $this->nis ? Siswa::where('nis', $this->nis)->value('kelas') : null;
    }

    /*
      Data orang tua (kontak & alamat keluarga) yang boleh dilihat. Hasil: true = semua keluarga,
      daftar kelas = keluarga yang anaknya di kelas itu, daftar NIS = keluarga siswa itu sendiri.
        - Kepala Sekolah, Tata Usaha (pengelola), Guru BK, Wakasek Kesiswaan: semua keluarga
        - Wali kelas: keluarga siswa di kelasnya
        - Siswa & orang tua: keluarganya sendiri
        - Staf lain & tamu: tidak ada
    */
    public function lingkupOrangTua(): array|bool
    {
        if ($this->punya('ortu') || $this->punyaPeran('guru_bk') || $this->punyaPeran('wakasek_kesiswaan')) {
            return true;
        }
        if ($this->keluarga()) {
            return $this->nis ? ['nis' => [$this->nis]] : [];
        }

        return $this->kelas ? ['kelas' => [$this->kelas]] : [];
    }

    /*
      Biodata pribadi siswa (NISN, kelahiran, agama, golongan darah, riwayat masuk, catatan kesehatan)
      yang boleh dilihat. Hasil seperti lingkupOrangTua:
        - Kepala Sekolah & pengelola Data Siswa (Tata Usaha, Wakasek Kesiswaan, Guru BK): semua siswa
        - Wali kelas: siswa di kelasnya
        - Siswa & orang tua: siswa itu sendiri
        - Staf lain & tamu: tidak ada
    */
    public function lingkupBiodataSiswa(): array|bool
    {
        if ($this->punya('siswa')) {
            return true;
        }
        if ($this->keluarga()) {
            return $this->nis ? ['nis' => [$this->nis]] : [];
        }

        return $this->kelas ? ['kelas' => [$this->kelas]] : [];
    }

    // Akun login siswa dibuat & diatur ulang oleh Tata Usaha atau Kepala Sekolah
    public function kelolaAkunSiswa(): bool
    {
        return $this->kepsek || $this->punyaPeran('tata_usaha');
    }

    // Menu yang membuka semua kelas & mapel (penuh di useLingkup)
    public function penuh(string $menu): bool
    {
        return $this->kepsek
            || $menu === 'kelas'
            || (in_array($menu, ['nilai', 'rapor'], true) && $this->punyaPeran('wakasek_kurikulum'))
            || ($menu === 'sikap' && ($this->punyaPeran('wakasek_kesiswaan') || $this->punyaPeran('guru_bk') || $this->punyaPeran('guru_mapel')));
    }

    // Kelas yang boleh dibuka pada suatu menu
    public function lingkupKelas(string $menu): array
    {
        if (! $this->punya($menu)) {
            return [];
        }
        if ($this->penuh($menu) || (in_array($menu, ['nilai', 'tugas', 'absensi'], true) && $this->punyaPeran('guru_mapel'))) {
            return Referensi::kelas();
        }

        return $this->kelas ? [$this->kelas] : [];
    }

    public function bolehKelas(string $menu, ?string $kelas): bool
    {
        return $kelas !== null && in_array($kelas, $this->lingkupKelas($menu), true);
    }

    // Mapel yang boleh dinilai di suatu kelas (mapel(k) di useLingkup)
    public function mapel(string $menu, string $kelas): array
    {
        $daftar = Referensi::mapelRapor($kelas);
        if (! $this->bolehKelas($menu, $kelas)) {
            return [];
        }
        if ($this->penuh($menu)) {
            return $daftar;
        }
        // Mapel khusus = diampu guru mapel; wali kelas menilai mapel lain di kelasnya
        $khusus = $this->guru()->flatMap(fn (Guru $g) => $g->mapelDiampu())->all();
        $mapelSaya = $this->guru()->firstWhere('id', $this->guruId)?->mapelDiampu() ?? [];

        return array_values(array_filter($daftar, fn ($m) => ($kelas === $this->kelas && ! in_array($m, $khusus, true)) || in_array($m, $mapelSaya, true)));
    }

    public function bolehMapel(string $menu, string $kelas, string $mapel): bool
    {
        return in_array($mapel, $this->mapel($menu, $kelas), true);
    }

    // Presensi harian dipegang wali kelas; presensi pelajaran oleh guru pengampu atau wali kelasnya
    public function bolehPresensiHarian(string $kelas): bool
    {
        return $this->punya('absensi') && $this->kelas === $kelas;
    }

    public function bolehPresensiPelajaran(string $kelas, string $tanggal, string $kunci): bool
    {
        $pelajaran = Referensi::pelajaranDariKunci($kelas, $tanggal, $kunci);
        if (! $pelajaran || ! $this->punya('absensi')) {
            return false;
        }

        return $this->kelas === $kelas || Referensi::guruPelajaran($this->guru(), $kelas, $pelajaran['mapel'])?->id === $this->guruId;
    }

    // Hentikan permintaan dengan 403 jika tidak berhak
    public function wajib(bool $boleh, string $pesan = 'Akun Anda tidak berhak mengubah data ini.'): void
    {
        abort_unless($boleh, 403, $pesan);
    }
}
