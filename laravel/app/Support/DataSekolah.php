<?php

namespace App\Support;

use App\Models\Buku;
use App\Models\BukuTamu;
use App\Models\Guru;
use App\Models\Inventaris;
use App\Models\IzinSiswa;
use App\Models\IzinStaf;
use App\Models\Kerusakan;
use App\Models\Konseling;
use App\Models\Kunjungan;
use App\Models\OrangTua;
use App\Models\Pendaftar;
use App\Models\Pengumuman;
use App\Models\Peminjaman;
use App\Models\Reservasi;
use App\Models\SesiPresensi;
use App\Models\Sikap;
use App\Models\Siswa;
use App\Models\TransaksiSpp;
use App\Models\Tugas;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use stdClass;

/*
  Data sekolah untuk website, dalam bentuk yang sama dengan state di sd-app/src/context/DataContext.jsx.
  Setiap pengguna hanya menerima data yang boleh ia lihat:
    - tamu: pengumuman, guru (tanpa NIP), katalog buku, dan ringkasan kuota PPDB/kunjungan tanpa data pribadi
    - siswa & orang tua: data milik siswa itu sendiri (nilai, absensi, sikap, SPP, ...) + teman sekelas
    - guru & staf: data sekolah, kecuali yang khusus jabatan tertentu (konseling, SPP, PPDB, buku tamu)
    - Kepala Sekolah: semua data
  Koleksi dikelompokkan untuk penanda versi (lihat Versi): mis. "absensi" mencakup absensi & jejakAbsensi.
*/
final class DataSekolah
{
    public const KELOMPOK = [
        'guru' => ['guru'],
        'siswa' => ['siswa', 'jumlahSiswa'],
        'orangTua' => ['orangTua'],
        'pengumuman' => ['pengumuman'],
        'absensi' => ['absensi', 'jejakAbsensi'],
        'absensiMapel' => ['absensiMapel', 'jejakMapel'],
        'sesiPresensi' => ['sesiPresensi'],
        'izin' => ['izin'],
        'presensiStaf' => ['presensiStaf'],
        'izinStaf' => ['izinStaf'],
        'tugas' => ['tugas'],
        'tugasSelesai' => ['tugasSelesai'],
        'nilai' => ['nilai', 'peringkat'],
        'catatanWali' => ['catatanWali'],
        'sikap' => ['sikap'],
        'ekskul' => ['ekskul'],
        'spp' => ['spp'],
        'transaksi' => ['transaksi'],
        'buku' => ['buku'],
        'peminjaman' => ['peminjaman'],
        'reservasi' => ['reservasi'],
        'pendaftar' => ['pendaftar'],
        'kunjungan' => ['kunjungan'],
        'bukuTamu' => ['bukuTamu'],
        'inventaris' => ['inventaris'],
        'kerusakan' => ['kerusakan'],
        'konseling' => ['konseling'],
    ];

    public function __construct(private readonly Akses $a) {}

    // Kelompok versi dari nama koleksi website, mis. jejakAbsensi → absensi
    public static function kelompokDari(array $koleksi): array
    {
        $hasil = [];
        foreach (self::KELOMPOK as $kelompok => $isi) {
            if (array_intersect($isi, $koleksi)) {
                $hasil[] = $kelompok;
            }
        }

        return $hasil;
    }

    public function ambil(array $kelompok): array
    {
        $hasil = [];
        foreach ($kelompok as $k) {
            if (isset(self::KELOMPOK[$k])) {
                $hasil += $this->{$k}();
            }
        }

        return $hasil;
    }

    // ===== Pembentuk data (juga dipakai controller untuk membalas perubahan) =====

    // Peta kosong tetap dikirim sebagai objek JSON ({}), bukan larik ([])
    public static function peta(array $isi): array|stdClass
    {
        return $isi ?: new stdClass;
    }

    private static function jejak(object $r, bool $harian): ?array
    {
        if (! $r->cara) {
            return null;
        }

        return array_filter([
            'cara' => $r->cara,
            'jam' => $r->jam,
            'oleh' => $r->oleh,
            'sebelum' => $r->sebelum,
            'otp' => $r->otp,
            'sesiId' => $r->sesi_id,
            'pelajaran' => $harian ? $r->pelajaran : null,
        ], fn ($v) => $v !== null);
    }

    // Baris absensi_harian → { absensi: {tgl: {nis: status}}, jejakAbsensi: {tgl: {nis: jejak}} }
    public static function petaAbsensi(iterable $baris): array
    {
        $absensi = $jejak = [];
        foreach ($baris as $r) {
            $absensi[$r->tanggal][$r->nis] = $r->status;
            if ($j = self::jejak($r, true)) {
                $jejak[$r->tanggal][$r->nis] = $j;
            }
        }

        return ['absensi' => self::peta($absensi), 'jejakAbsensi' => self::peta($jejak)];
    }

    // Baris absensi_pelajaran → { absensiMapel: {tgl: {nis: {kunci: status}}}, jejakMapel: ... }
    public static function petaAbsensiMapel(iterable $baris): array
    {
        $absensi = $jejak = [];
        foreach ($baris as $r) {
            $absensi[$r->tanggal][$r->nis][$r->kunci] = $r->status;
            if ($j = self::jejak($r, false)) {
                $jejak[$r->tanggal][$r->nis][$r->kunci] = $j;
            }
        }

        return ['absensiMapel' => self::peta($absensi), 'jejakMapel' => self::peta($jejak)];
    }

    /*
      Satu catatan presensi staf. Alasan terlambat/pulang awal dan keterangan izin hanya untuk orang
      yang bersangkutan dan Kepala Sekolah ($lengkap); staf lain hanya melihat status & jamnya.
    */
    public static function catatanPresensiStaf(object $r, bool $lengkap = true): array
    {
        $koreksi = is_string($r->koreksi) ? json_decode($r->koreksi, true) : $r->koreksi;

        return ['status' => $r->status, 'masuk' => $r->masuk, 'pulang' => $r->pulang] + array_filter([
            'alasanMasuk' => $lengkap ? $r->alasan_masuk : null,
            'alasanPulang' => $lengkap ? $r->alasan_pulang : null,
            'ket' => $lengkap ? $r->ket : null,
            'izinId' => $r->izin_id,
            'koreksi' => $koreksi,
        ], fn ($v) => $v !== null);
    }

    public static function petaPresensiStaf(iterable $baris, ?Akses $penglihat = null): array
    {
        $hasil = [];
        foreach ($baris as $r) {
            $lengkap = ! $penglihat || $penglihat->kepsek || $penglihat->guruId === $r->guru_id;
            $hasil[$r->tanggal][$r->guru_id] = self::catatanPresensiStaf($r, $lengkap);
        }

        return ['presensiStaf' => self::peta($hasil)];
    }

    public static function petaNilai(iterable $baris): array
    {
        $hasil = [];
        foreach ($baris as $r) {
            $tugas = is_string($r->tugas) ? json_decode($r->tugas, true) : $r->tugas;
            $hasil[$r->nis][$r->mapel] = ['tugas' => $tugas ?? [], 'pts' => $r->pts, 'pas' => $r->pas];
        }

        return ['nilai' => self::peta($hasil)];
    }

    public static function petaSpp(iterable $baris): array
    {
        $hasil = [];
        foreach ($baris as $r) {
            $hasil[$r->nis][$r->bulan] = ['tanggal' => $r->tanggal, 'metode' => $r->metode, 'noTransaksi' => $r->no_transaksi, 'jumlah' => (int) $r->jumlah];
            // Bukti bisa berupa string JSON (baris mentah DB / getAttributes) atau array (model ter-cast)
            if ($bukti = $r->bukti ?? null) {
                $hasil[$r->nis][$r->bulan]['bukti'] = is_string($bukti) ? json_decode($bukti, true) : $bukti;
            }
        }

        return ['spp' => self::peta($hasil)];
    }

    // { nis: [nilai kolom] } untuk tugas_selesai & ekskul_siswa
    public static function petaDaftar(iterable $baris, string $kolom): array|stdClass
    {
        $hasil = [];
        foreach ($baris as $r) {
            $hasil[$r->nis][] = $r->{$kolom};
        }

        return self::peta($hasil);
    }

    // ===== Lingkup per pengguna =====

    // Batasi kueri ke siswa milik pengguna (siswa/ortu), semua siswa (staf), atau tidak ada (tamu)
    private function milik($kueri, bool $staf = true)
    {
        if ($staf && $this->a->staf()) {
            return $kueri;
        }

        return $this->a->keluarga() && $this->a->nis ? $kueri->where('nis', $this->a->nis) : $kueri->whereRaw('1 = 0');
    }

    // Biodata pribadi guru hanya untuk Kepala Sekolah dan pemiliknya (lihat Guru::untukWebsite)
    private function guru(): array
    {
        return ['guru' => Guru::untukWebsite($this->a->guru(), $this->a->user)];
    }

    // Data keluarga sesuai Akses::lingkupOrangTua (kontak & alamat orang tua bersifat pribadi)
    private function orangTua(): array
    {
        $lingkup = $this->a->lingkupOrangTua();
        if ($lingkup === []) {
            return ['orangTua' => []];
        }
        $kueri = OrangTua::query();
        if (is_array($lingkup)) {
            $kueri->whereHas('anak', fn ($q) => isset($lingkup['nis']) ? $q->whereIn('nis', $lingkup['nis']) : $q->whereIn('kelas', $lingkup['kelas']));
        }

        return ['orangTua' => self::petaOrangTua($kueri->get(), $this->a->punya('ortu'))];
    }

    /*
      Bentuk data keluarga untuk website: kolom orang_tua + `anak` (NIS, urut) + `akun` login orang tua
      (hanya untuk pengelola Data Orang Tua; tanpa password).
    */
    public static function petaOrangTua(Collection $keluarga, bool $denganAkun = false): array
    {
        $keluarga->load('anak:id,nis,orang_tua_id');
        $akun = $denganAkun
            ? User::where('role', 'ortu')->whereIn('anak_nis', $keluarga->flatMap(fn ($k) => $k->anak->pluck('nis')))->get()->keyBy('anak_nis')
            : collect();

        return $keluarga->sortBy(fn (OrangTua $k) => $k->anak->first()?->nis ?? 'zzz')->map(function (OrangTua $k) use ($denganAkun, $akun) {
            $nis = $k->anak->pluck('nis')->all();
            $data = [...$k->toArray(), 'anak' => $nis];
            unset($data['createdAt'], $data['updatedAt']);
            if ($denganAkun) {
                $u = collect($nis)->map(fn ($n) => $akun->get($n))->filter()->first();
                $data['akun'] = $u ? ['username' => $u->username, 'aktif' => $u->aktif, 'wajibGanti' => (bool) $u->wajib_ganti_password] : null;
            }

            return $data;
        })->values()->all();
    }

    private function siswa(): array
    {
        $kueri = Siswa::orderBy('kelas')->orderBy('nama');
        if ($this->a->staf()) {
            $siswa = $kueri->get();
        } elseif ($this->a->keluarga() && ($kelas = $this->a->kelasSiswa())) {
            // Teman sekelas untuk daftar kelas & chat; nama orang tua hanya untuk sesama orang tua
            $siswa = $kueri->where('kelas', $kelas)->get()->each(function (Siswa $s) {
                if ($this->a->role === 'siswa' && $s->nis !== $this->a->nis) {
                    $s->makeHidden('ortu');
                }
            });
        } else {
            $siswa = collect();
        }

        $jumlah = [];
        foreach (Siswa::selectRaw('kelas, jk, count(*) as n')->groupBy('kelas', 'jk')->toBase()->get() as $r) {
            $jumlah[$r->kelas][$r->jk] = (int) $r->n;
        }

        return ['siswa' => $siswa->values()->toArray(), 'jumlahSiswa' => self::peta($jumlah)];
    }

    private function pengumuman(): array
    {
        return ['pengumuman' => Pengumuman::orderByDesc('tanggal')->get()->toArray()];
    }

    private function absensi(): array
    {
        return self::petaAbsensi($this->milik(DB::table('absensi_harian'))->orderBy('tanggal')->get());
    }

    private function absensiMapel(): array
    {
        return self::petaAbsensiMapel($this->milik(DB::table('absensi_pelajaran'))->orderBy('tanggal')->get());
    }

    private function sesiPresensi(): array
    {
        $a = $this->a;
        if ($a->staf()) {
            $sesi = SesiPresensi::where('tanggal', '>=', Waktu::sekarang()->subDays(7)->toDateString())->orderByDesc('mulai')->get();
            if (! $a->kepsek && ! $a->punya('absensi')) {
                $sesi->each->makeHidden('kode');
            }
        } elseif ($a->role === 'siswa' && ($kelas = $a->kelasSiswa())) {
            // Siswa melihat sesi kelasnya hari ini tanpa kode, dan hanya hitungan salah miliknya
            $sesi = SesiPresensi::where('kelas', $kelas)->where('tanggal', Waktu::hariIni())->orderByDesc('mulai')->get()
                ->each(function (SesiPresensi $s) use ($a) {
                    $s->makeHidden('kode');
                    $s->gagal = array_intersect_key($s->gagal ?? [], [$a->nis => true]);
                });
        } else {
            $sesi = collect();
        }

        return ['sesiPresensi' => $sesi->map(fn (SesiPresensi $s) => ['gagal' => self::peta($s->gagal ?? [])] + $s->toArray())->values()->all()];
    }

    private function izin(): array
    {
        return ['izin' => $this->milik(IzinSiswa::query())->orderByDesc('diajukan')->get()->toArray()];
    }

    private function presensiStaf(): array
    {
        return self::petaPresensiStaf($this->a->staf() ? DB::table('presensi_staf')->orderBy('tanggal')->get() : [], $this->a);
    }

    private function izinStaf(): array
    {
        $kueri = IzinStaf::orderByDesc('diajukan');
        if (! $this->a->kepsek) {
            $kueri->where('guru_id', $this->a->staf() ? $this->a->guruId : null);
        }

        return ['izinStaf' => $kueri->get()->toArray()];
    }

    private function tugas(): array
    {
        $kueri = Tugas::orderByDesc('diberikan');
        if (! $this->a->staf()) {
            $kueri->where('kelas', $this->a->keluarga() ? $this->a->kelasSiswa() : null);
        }

        return ['tugas' => $kueri->get()->toArray()];
    }

    private function tugasSelesai(): array
    {
        return ['tugasSelesai' => self::petaDaftar($this->milik(DB::table('tugas_selesai'))->orderBy('created_at')->get(), 'tugas_id')];
    }

    private function nilai(): array
    {
        $hasil = self::petaNilai($this->milik(DB::table('nilai'))->get());
        $hasil['peringkat'] = new stdClass;
        if ($this->a->keluarga() && ($kelas = $this->a->kelasSiswa())) {
            $hasil['peringkat'] = [$this->a->nis => Rapor::peringkat($this->a->nis, $kelas)];
        }

        return $hasil;
    }

    private function catatanWali(): array
    {
        return ['catatanWali' => self::peta($this->milik(DB::table('catatan_wali'))->pluck('teks', 'nis')->all())];
    }

    private function sikap(): array
    {
        return ['sikap' => $this->milik(Sikap::query())->orderByDesc('tanggal')->get()->toArray()];
    }

    private function ekskul(): array
    {
        return ['ekskul' => self::petaDaftar($this->milik(DB::table('ekskul_siswa'))->orderBy('created_at')->get(), 'ekskul')];
    }

    // SPP: Tata Usaha & Kepala Sekolah melihat semua; siswa/orang tua hanya miliknya
    private function bolehSppSemua(): bool
    {
        return $this->a->punya('spp');
    }

    private function spp(): array
    {
        return self::petaSpp($this->milik(DB::table('spp_pembayaran'), $this->bolehSppSemua())->orderBy('bulan')->get());
    }

    private function transaksi(): array
    {
        return ['transaksi' => $this->milik(TransaksiSpp::query(), $this->bolehSppSemua())->orderByDesc('dibuat')->get()->toArray()];
    }

    private function buku(): array
    {
        return ['buku' => Buku::orderBy('judul')->get()->toArray()];
    }

    private function peminjaman(): array
    {
        if ($this->a->staf()) {
            return ['peminjaman' => Peminjaman::orderByDesc('tanggal_pinjam')->get()->toArray()];
        }
        if (! $this->a->keluarga()) {
            return ['peminjaman' => []];
        }
        // Siswa: semua peminjamannya + buku yang sedang dipinjam siswa lain (tanpa nama) untuk sisa stok
        $nis = $this->a->nis;
        $daftar = Peminjaman::where('nis', $nis)->orWhereNull('tanggal_kembali')->orderByDesc('tanggal_pinjam')->get()
            ->map(fn (Peminjaman $p) => $p->nis === $nis ? $p->toArray() : ['id' => $p->id, 'bukuId' => $p->buku_id, 'nis' => '', 'tanggalPinjam' => $p->tanggal_pinjam, 'tenggat' => $p->tenggat, 'tanggalKembali' => null]);

        return ['peminjaman' => $daftar->values()->all()];
    }

    private function reservasi(): array
    {
        return ['reservasi' => $this->milik(Reservasi::query())->orderByDesc('tanggal')->get()->toArray()];
    }

    // PPDB & kunjungan: pengelolanya melihat data lengkap; pengguna lain hanya hitungan kuota
    private function pendaftar(): array
    {
        if ($this->a->punya('ppdb')) {
            return ['pendaftar' => Pendaftar::orderByDesc('dibuat')->get()->toArray()];
        }

        return ['pendaftar' => Pendaftar::select('id', 'jalur', 'status')->get()->toArray()];
    }

    private function kunjungan(): array
    {
        if ($this->a->punya('kunjungan')) {
            return ['kunjungan' => Kunjungan::orderByDesc('dibuat')->get()->toArray()];
        }
        // Satpam butuh data tamu terjadwal hari ini untuk dicatat di buku tamu saat datang
        $tamuHariIni = fn (Kunjungan $k) => $this->a->punya('bukutamu') && $k->tanggal === Waktu::hariIni() && $k->status === 'Dikonfirmasi';

        return ['kunjungan' => Kunjungan::where('tanggal', '>=', Waktu::hariIni())->orderBy('tanggal')->get()
            ->map(fn (Kunjungan $k) => $tamuHariIni($k) ? $k->toArray() : ['id' => $k->id, 'tanggal' => $k->tanggal, 'sesi' => $k->sesi, 'status' => $k->status])
            ->values()->all()];
    }

    private function bukuTamu(): array
    {
        return ['bukuTamu' => $this->a->punya('bukutamu') ? BukuTamu::orderByDesc('tanggal')->orderByDesc('masuk')->get()->toArray() : []];
    }

    private function inventaris(): array
    {
        return ['inventaris' => $this->a->staf() ? Inventaris::orderBy('nama')->get()->toArray() : []];
    }

    private function kerusakan(): array
    {
        return ['kerusakan' => $this->a->staf() ? Kerusakan::orderByDesc('tanggal')->get()->toArray() : []];
    }

    // Catatan konseling bersifat rahasia: hanya Guru BK & Kepala Sekolah
    private function konseling(): array
    {
        return ['konseling' => $this->a->punya('konseling') ? Konseling::orderByDesc('tanggal')->get()->toArray() : []];
    }
}
