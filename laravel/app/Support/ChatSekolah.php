<?php

namespace App\Support;

use App\Models\Guru;
use Illuminate\Support\Facades\DB;

/*
  Aturan chat sekolah, sama dengan sd-app/src/utils/chat.js. ID chat pengguna:
    s:<nis> siswa · o:<nis anak> orang tua · g:<id guru> guru, staf, kepala sekolah
  Percakapan:
    grup:kelas:<kelas>  siswa kelas itu + wali kelas + guru yang mengajar di kelas itu
    grup:ortu:<kelas>   orang tua siswa kelas itu + wali kelas + kepala sekolah
    grup:staf           seluruh guru & staf
    p:<id>|<id>         chat pribadi (siswa tidak punya chat pribadi)
  Anggota grup dihitung dari data siswa, guru, dan jadwal, jadi selalu mengikuti perubahan data.
*/
final class ChatSekolah
{
    public const GRUP_STAF = 'grup:staf';

    /** @var array<string, string> nis => kelas */
    private array $siswa = [];

    /** @var array<string, list<string>> kelas => [nis] */
    private array $siswaKelas = [];

    /** @var array<string, array{wali: ?string, guru: list<string>}> */
    private array $guruKelas = [];

    /** @var array<string, list<string>> id guru => [kelas yang diajar] */
    private array $kelasGuru = [];

    /** @var list<string> */
    private array $guru;

    private ?string $kepsek;

    /** @var list<string> */
    private array $tu;

    private array $kontak = [];

    public function __construct(private readonly Akses $a)
    {
        $semuaGuru = $a->guru();
        foreach (DB::table('siswa')->orderBy('nama')->get(['nis', 'kelas']) as $s) {
            $this->siswa[$s->nis] = $s->kelas;
            $this->siswaKelas[$s->kelas][] = (string) $s->nis;
        }
        ksort($this->siswaKelas);
        $this->guru = $semuaGuru->pluck('id')->all();
        $this->kepsek = $semuaGuru->firstWhere('jabatan', 'Kepala Sekolah')?->id;
        $this->tu = $semuaGuru->filter(fn (Guru $g) => in_array('tata_usaha', $g->peran ?? [], true))->pluck('id')->values()->all();

        foreach (array_keys($this->siswaKelas) as $kelas) {
            $wali = $semuaGuru->first(fn (Guru $g) => in_array('wali_kelas', $g->peran ?? [], true) && $g->kelas === $kelas)?->id;
            $ids = $wali ? [$wali] : [];
            foreach (Referensi::get('hariSekolah') as $hari) {
                foreach (Referensi::get("jadwal.{$kelas}.{$hari}", []) as $mapel) {
                    if (! Referensi::get("mapel.{$mapel}.absensi", false)) {
                        continue;
                    }
                    $g = Referensi::guruPelajaran($semuaGuru, $kelas, $mapel);
                    if ($g && ! in_array($g->id, $ids, true)) {
                        $ids[] = $g->id;
                    }
                }
            }
            $this->guruKelas[$kelas] = ['wali' => $wali, 'guru' => $ids];
            foreach ($ids as $id) {
                $this->kelasGuru[$id][] = $kelas;
            }
        }
    }

    // ID chat pengguna yang sedang login
    public function saya(): ?string
    {
        return match ($this->a->role) {
            'siswa' => $this->a->nis ? "s:{$this->a->nis}" : null,
            'ortu' => $this->a->nis ? "o:{$this->a->nis}" : null,
            'staf', 'kepsek' => $this->a->guruId ? "g:{$this->a->guruId}" : null,
            default => null,
        };
    }

    public static function pribadi(string $a, string $b): string
    {
        $x = [$a, $b];
        sort($x, SORT_STRING);

        return 'p:'.implode('|', $x);
    }

    public static function peserta(string $pid): array
    {
        return explode('|', substr($pid, 2));
    }

    /** @return array{anggota: list<string>, admin: list<string>}|null */
    public function infoGrup(string $gid): ?array
    {
        if ($gid === self::GRUP_STAF) {
            return ['anggota' => array_map(fn ($id) => "g:{$id}", $this->guru), 'admin' => $this->kepsek ? ["g:{$this->kepsek}"] : []];
        }
        [, $tipe, $kelas] = array_pad(explode(':', $gid), 3, '');
        if (! isset($this->siswaKelas[$kelas]) || ! in_array($tipe, ['kelas', 'ortu'], true)) {
            return null;
        }
        ['wali' => $wali, 'guru' => $guru] = $this->guruKelas[$kelas];
        $g = fn ($id) => "g:{$id}";
        if ($tipe === 'kelas') {
            return ['anggota' => [...array_map($g, $guru), ...array_map(fn ($n) => "s:{$n}", $this->siswaKelas[$kelas])], 'admin' => array_map($g, $guru)];
        }
        $pengelola = array_map($g, array_values(array_unique(array_filter([$wali, $this->kepsek]))));

        return ['anggota' => [...$pengelola, ...array_map(fn ($n) => "o:{$n}", $this->siswaKelas[$kelas])], 'admin' => $pengelola];
    }

    // Grup yang diikuti seseorang
    public function grupMilik(string $id): array
    {
        $kunci = substr($id, 2);
        if (str_starts_with($id, 's:')) {
            return isset($this->siswa[$kunci]) ? ['grup:kelas:'.$this->siswa[$kunci]] : [];
        }
        if (str_starts_with($id, 'o:')) {
            return isset($this->siswa[$kunci]) ? ['grup:ortu:'.$this->siswa[$kunci]] : [];
        }
        if (! in_array($kunci, $this->guru, true)) {
            return [];
        }
        $hasil = [self::GRUP_STAF];
        foreach ($this->kelasGuru[$kunci] ?? [] as $kelas) {
            $hasil[] = "grup:kelas:{$kelas}";
        }
        foreach (array_keys($this->siswaKelas) as $kelas) {
            if ($this->kepsek === $kunci || $this->guruKelas[$kelas]['wali'] === $kunci) {
                $hasil[] = "grup:ortu:{$kelas}";
            }
        }

        return $hasil;
    }

    /*
      Kontak chat pribadi:
      - siswa: tidak ada (cukup grup kelas)
      - orang tua: guru anaknya, Tata Usaha, kepala sekolah
      - guru & staf: semua guru & staf, plus orang tua siswa di kelas yang diajarnya
        (Tata Usaha & kepala sekolah: semua orang tua)
    */
    public function kontakPribadi(string $id): array
    {
        if (isset($this->kontak[$id])) {
            return $this->kontak[$id];
        }
        $kunci = substr($id, 2);
        $hasil = [];
        if (str_starts_with($id, 'o:') && isset($this->siswa[$kunci])) {
            $ids = [...$this->guruKelas[$this->siswa[$kunci]]['guru'], ...$this->tu, ...($this->kepsek ? [$this->kepsek] : [])];
            $hasil = array_map(fn ($g) => "g:{$g}", array_unique($ids));
        } elseif (str_starts_with($id, 'g:') && in_array($kunci, $this->guru, true)) {
            $staf = array_map(fn ($g) => "g:{$g}", array_filter($this->guru, fn ($g) => $g !== $kunci));
            $semua = $this->kepsek === $kunci || in_array($kunci, $this->tu, true);
            $kelas = $semua ? array_keys($this->siswaKelas) : ($this->kelasGuru[$kunci] ?? []);
            $ortu = [];
            foreach ($kelas as $k) {
                foreach ($this->siswaKelas[$k] as $n) {
                    $ortu[] = "o:{$n}";
                }
            }
            $hasil = [...$staf, ...$ortu];
        }

        return $this->kontak[$id] = array_fill_keys($hasil, true);
    }

    public function bolehPribadi(string $a, string $b): bool
    {
        return $a !== $b && isset($this->kontakPribadi($a)[$b]);
    }

    public function anggota(string $pid): array
    {
        if (str_starts_with($pid, 'grup:')) {
            return $this->infoGrup($pid)['anggota'] ?? [];
        }

        return str_starts_with($pid, 'p:') ? self::peserta($pid) : [];
    }

    // Boleh membuka percakapan ini? (mencegah membuka chat orang lain)
    public function bolehBuka(?string $saya, string $pid): bool
    {
        if (! $saya) {
            return false;
        }
        if (str_starts_with($pid, 'grup:')) {
            return in_array($saya, $this->anggota($pid), true);
        }
        if (! str_starts_with($pid, 'p:') || $pid !== self::pribadi(...array_pad(self::peserta($pid), 2, ''))) {
            return false;
        }
        [$x, $y] = array_pad(self::peserta($pid), 2, '');

        return ($x === $saya && $this->bolehPribadi($x, $y)) || ($y === $saya && $this->bolehPribadi($y, $x));
    }

    public function admin(string $saya, string $pid): bool
    {
        return str_starts_with($pid, 'grup:') && in_array($saya, $this->infoGrup($pid)['admin'] ?? [], true);
    }

    public function bolehKirim(string $saya, string $pid): bool
    {
        if (! $this->bolehBuka($saya, $pid)) {
            return false;
        }
        if (str_starts_with($pid, 'grup:') && DB::table('chat_grup')->where('percakapan', $pid)->value('hanya_admin')) {
            return $this->admin($saya, $pid);
        }

        return true;
    }

    // Semua percakapan milik seseorang: grup yang diikuti + chat pribadi yang boleh dibuka
    public function percakapan(string $saya): array
    {
        $pribadi = DB::table('chat_pesan')->where('percakapan', 'like', 'p:%')
            ->where(fn ($q) => $q->where('percakapan', 'like', "p:{$saya}|%")->orWhere('percakapan', 'like', "%|{$saya}"))
            ->distinct()->pluck('percakapan')
            ->filter(fn ($pid) => $this->bolehBuka($saya, $pid))
            ->all();

        return array_values(array_unique([...$this->grupMilik($saya), ...$pribadi]));
    }
}
