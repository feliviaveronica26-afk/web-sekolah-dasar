<?php

namespace App\Http\Controllers;

use App\Models\ChatGrup;
use App\Models\ChatPesan;
use App\Support\ChatSekolah;
use App\Support\Versi;
use App\Support\Waktu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

/*
  Chat sekolah. Pesan & tanda "sudah dibaca" tersimpan di database, isi berkas (foto, video, suara,
  dokumen) di storage/app/private/chat dan hanya bisa diunduh anggota percakapannya. Website
  menanyakan pesan baru secara berkala (?sejak=<waktu server terakhir>).
*/
class ChatController extends Controller
{
    private const MAKS_PESAN = 500; // per percakapan; yang lebih lama dihapus beserta berkasnya

    private const MAKS_TEKS = 4000;

    private const EKSTENSI = [
        'foto' => ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        'video' => ['mp4', 'webm', 'mov', 'm4v', '3gp'],
        'audio' => ['mp3', 'm4a', 'aac', 'wav', 'ogg', 'oga', 'opus', 'flac', 'weba'],
        'suara' => ['webm', 'ogg', 'oga', 'opus', 'm4a', 'mp4', 'mp3', 'wav', 'aac'],
        'dokumen' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'odt', 'ods', 'odp', 'rtf'],
    ];

    // Isi berkas harus sesuai jenisnya (mis. foto harus benar-benar gambar)
    private const AWALAN_MIME = ['foto' => ['image/'], 'video' => ['video/'], 'audio' => ['audio/', 'video/'], 'suara' => ['audio/', 'video/']];

    private const DISK = 'local';

    public function index(Request $request): JsonResponse
    {
        $chat = new ChatSekolah($this->akses($request));
        $saya = $chat->saya();
        $waktu = Waktu::iso(); // diambil sebelum membaca, agar pesan yang masuk bersamaan tidak terlewat
        if (! $saya) {
            return response()->json(['saya' => null, 'pesan' => (object) [], 'dibaca' => (object) [], 'pengaturan' => (object) [], 'waktu' => $waktu]);
        }
        $daftar = $chat->percakapan($saya);
        $sejak = $request->query('sejak');

        $pesan = [];
        $kueri = ChatPesan::whereIn('percakapan', $daftar)->orderBy('waktu');
        if ($sejak) {
            // Sedikit mundur untuk berjaga-jaga jam server bergeser; website membuang yang sudah ada
            $kueri->where('diubah', '>', Carbon::parse($sejak)->subSeconds(2));
        }
        foreach ($kueri->get() as $p) {
            $pesan[$p->percakapan][] = self::bentuk($p);
        }
        if (! $sejak) {
            $pesan = array_map(fn ($d) => array_slice($d, -self::MAKS_PESAN), $pesan);
        }

        $dibaca = [];
        foreach (DB::table('chat_dibaca')->whereIn('percakapan', $daftar)->get() as $d) {
            $dibaca[$d->pengguna][$d->percakapan] = Waktu::iso(Carbon::parse($d->waktu, 'UTC'));
        }
        $pengaturan = [];
        foreach (ChatGrup::whereIn('percakapan', $daftar)->get() as $g) {
            $pengaturan[$g->percakapan] = ['hanyaAdmin' => $g->hanya_admin, 'oleh' => $g->oleh, 'waktu' => Waktu::iso($g->waktu)];
        }

        return response()->json([
            'saya' => $saya,
            'pesan' => (object) $pesan,
            'dibaca' => (object) $dibaca,
            'pengaturan' => (object) $pengaturan,
            'waktu' => $waktu,
            'lengkap' => ! $sejak,
        ]);
    }

    // Kirim pesan teks dan/atau satu berkas (multipart/form-data)
    public function kirim(Request $request): JsonResponse
    {
        $chat = new ChatSekolah($this->akses($request));
        $saya = $chat->saya();
        $batas = DataController::batasBerkas();
        $isian = $request->validate([
            'percakapan' => ['required', 'string', 'max:80'],
            'teks' => ['nullable', 'string', 'max:'.self::MAKS_TEKS],
            'berkas' => ['nullable', 'file', 'max:'.intdiv($batas, 1024)],
            'jenis' => ['required_with:berkas', 'nullable', 'in:'.implode(',', array_keys(self::EKSTENSI))],
            'nama' => ['nullable', 'string', 'max:200'],
            'durasi' => ['nullable', 'numeric', 'min:0', 'max:3600'],
        ], [
            'berkas.max' => 'Ukuran berkas terlalu besar untuk server (maksimal '.round($batas / 1024 / 1024, 1).' MB).',
            'berkas.uploaded' => 'Berkas gagal diunggah. Mungkin ukurannya melebihi batas server.',
            'teks.max' => 'Pesan terlalu panjang.',
        ]);
        $pid = $isian['percakapan'];
        $teks = trim($isian['teks'] ?? '');
        abort_unless($saya && $chat->bolehKirim($saya, $pid), 403, 'Anda tidak bisa mengirim pesan di percakapan ini.');
        if ($teks === '' && ! $request->hasFile('berkas')) {
            throw ValidationException::withMessages(['teks' => 'Pesan kosong.']);
        }

        $lampiran = $request->hasFile('berkas') ? $this->simpanBerkas($request->file('berkas'), $isian['jenis'], $isian['nama'] ?? null, $isian['durasi'] ?? null) : null;
        $sekarang = now();
        $pesan = ChatPesan::create([
            'percakapan' => $pid,
            'dari' => $saya,
            'waktu' => $sekarang,
            'teks' => $teks !== '' ? $teks : null,
            'lampiran' => $lampiran,
            'diubah' => $sekarang,
        ]);
        $this->tandai($saya, $pid, $sekarang);
        $this->rapikan($pid);
        Versi::naikkan('chat');

        return response()->json(['pesan' => self::bentuk($pesan->fresh()), 'dibaca' => [$saya => [$pid => Waktu::iso($sekarang)]]], 201);
    }

    // Hapus pesan: milik sendiri, atau oleh pengelola grup. Isi & berkasnya ikut dihapus.
    public function hapus(Request $request, ChatPesan $pesan): JsonResponse
    {
        $chat = new ChatSekolah($this->akses($request));
        $saya = $chat->saya();
        abort_unless($saya && $chat->bolehBuka($saya, $pesan->percakapan) && ($pesan->dari === $saya || $chat->admin($saya, $pesan->percakapan)), 403, 'Anda tidak bisa menghapus pesan ini.');
        if (! $pesan->dihapus) {
            if ($pesan->lampiran) {
                Storage::disk(self::DISK)->delete('chat/'.$pesan->lampiran['id']);
            }
            $pesan->update(['teks' => null, 'lampiran' => null, 'dihapus' => ['oleh' => $saya, 'waktu' => Waktu::iso()], 'diubah' => now()]);
            Versi::naikkan('chat');
        }

        return response()->json(['pesan' => self::bentuk($pesan->fresh())]);
    }

    // Tandai percakapan sudah dibaca sampai pesan terakhirnya
    public function dibaca(Request $request): JsonResponse
    {
        $chat = new ChatSekolah($this->akses($request));
        $saya = $chat->saya();
        $pid = (string) $request->validate(['percakapan' => ['required', 'string', 'max:80']])['percakapan'];
        abort_unless($saya && $chat->bolehBuka($saya, $pid), 403, 'Percakapan tidak ditemukan.');
        $terakhir = ChatPesan::where('percakapan', $pid)->max('waktu');
        if ($terakhir) {
            $this->tandai($saya, $pid, Carbon::parse($terakhir, 'UTC'));
            Versi::naikkan('chat');
        }

        return response()->json(['dibaca' => [$saya => [$pid => $terakhir ? Waktu::iso(Carbon::parse($terakhir, 'UTC')) : null]]]);
    }

    // Pengelola grup mengatur "hanya pengelola yang boleh mengirim"
    public function aturGrup(Request $request): JsonResponse
    {
        $chat = new ChatSekolah($this->akses($request));
        $saya = $chat->saya();
        $isian = $request->validate(['percakapan' => ['required', 'string', 'max:80'], 'hanyaAdmin' => ['required', 'boolean']]);
        abort_unless($saya && $chat->admin($saya, $isian['percakapan']), 403, 'Hanya pengelola grup yang bisa mengubah pengaturan ini.');
        $grup = ChatGrup::updateOrCreate(['percakapan' => $isian['percakapan']], ['hanya_admin' => $isian['hanyaAdmin'], 'oleh' => $saya, 'waktu' => now()]);
        Versi::naikkan('chat');

        return response()->json(['pengaturan' => [$grup->percakapan => ['hanyaAdmin' => $grup->hanya_admin, 'oleh' => $grup->oleh, 'waktu' => Waktu::iso($grup->waktu)]]]);
    }

    // Unduh/tampilkan berkas; hanya anggota percakapan
    public function berkas(Request $request, string $id): StreamedResponse
    {
        abort_unless(preg_match('/^[a-z0-9]{10,40}$/', $id), 404);
        $chat = new ChatSekolah($this->akses($request));
        $pesan = ChatPesan::where('lampiran->id', $id)->first();
        abort_unless($pesan && $chat->bolehBuka($chat->saya(), $pesan->percakapan), 404, 'Berkas tidak ditemukan.');
        $l = $pesan->lampiran;
        $disk = Storage::disk(self::DISK);
        abort_unless($disk->exists("chat/{$id}"), 404, 'Berkas tidak ditemukan.');
        // Foto/video/audio ditampilkan langsung; dokumen selalu diunduh agar tidak dijalankan browser
        $inline = in_array($l['jenis'], ['foto', 'video', 'audio', 'suara'], true);

        return $disk->response("chat/{$id}", $l['nama'], [
            'Content-Type' => $inline ? $l['mime'] : 'application/octet-stream',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, max-age=86400',
            'Content-Security-Policy' => "default-src 'none'; sandbox",
        ], $inline ? 'inline' : 'attachment');
    }

    private function simpanBerkas(UploadedFile $berkas, string $jenis, ?string $nama, ?float $durasi): array
    {
        $nama = self::namaAman($nama ?: $berkas->getClientOriginalName());
        $ext = strtolower(pathinfo($nama, PATHINFO_EXTENSION));
        $mime = (string) $berkas->getMimeType(); // dari isi berkas, bukan dari nama
        $cocok = ! isset(self::AWALAN_MIME[$jenis]) || collect(self::AWALAN_MIME[$jenis])->contains(fn ($awal) => str_starts_with($mime, $awal));
        if (! in_array($ext, self::EKSTENSI[$jenis], true) || ! $cocok) {
            throw ValidationException::withMessages(['berkas' => 'Jenis berkas ini tidak didukung. Kirim foto, video, audio/lagu, atau dokumen (PDF, Word, Excel, PowerPoint).']);
        }
        $id = 'f'.Str::lower((string) Str::ulid());
        $berkas->storeAs('chat', $id, self::DISK);

        return array_filter([
            'id' => $id,
            'jenis' => $jenis,
            'nama' => $nama,
            'ukuran' => $berkas->getSize(),
            'mime' => $mime,
            'durasi' => $jenis === 'suara' && $durasi ? round($durasi, 1) : null,
        ], fn ($v) => $v !== null);
    }

    private static function namaAman(string $nama): string
    {
        $bersih = mb_substr(preg_replace('/[\\\\\/:*?"<>|\x00-\x1f]/u', '_', $nama), 0, 120);

        return $bersih !== '' ? $bersih : 'berkas';
    }

    private function tandai(string $saya, string $pid, Carbon $waktu): void
    {
        $lama = DB::table('chat_dibaca')->where('pengguna', $saya)->where('percakapan', $pid)->value('waktu');
        if ($lama && Carbon::parse($lama, 'UTC')->gte($waktu)) {
            return;
        }
        DB::table('chat_dibaca')->updateOrInsert(['pengguna' => $saya, 'percakapan' => $pid], ['waktu' => $waktu->copy()->utc()->format('Y-m-d H:i:s.v')]);
    }

    // Batasi panjang riwayat; berkas pesan yang terbuang ikut dihapus
    private function rapikan(string $pid): void
    {
        $lebih = ChatPesan::where('percakapan', $pid)->count() - self::MAKS_PESAN;
        if ($lebih <= 0) {
            return;
        }
        ChatPesan::where('percakapan', $pid)->orderBy('waktu')->limit($lebih)->get()->each(function (ChatPesan $p) {
            if ($p->lampiran) {
                Storage::disk(self::DISK)->delete('chat/'.$p->lampiran['id']);
            }
            $p->delete();
        });
    }

    private static function bentuk(ChatPesan $p): array
    {
        return array_filter([
            'id' => $p->id,
            'dari' => $p->dari,
            'waktu' => Waktu::iso($p->waktu),
            'teks' => $p->teks,
            'lampiran' => $p->lampiran,
            'dihapus' => $p->dihapus,
        ], fn ($v) => $v !== null);
    }
}
