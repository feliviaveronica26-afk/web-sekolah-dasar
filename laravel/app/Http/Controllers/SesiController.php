<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

/*
  Login, logout, dan "siapa saya" untuk website. Sesi disimpan Laravel (tabel sessions) dan
  dikenali lewat cookie HttpOnly, sehingga tidak bisa dibaca atau dipalsukan dari JavaScript.
*/
class SesiController extends Controller
{
    private const MAKS_PERCOBAAN = 5;

    private const LAMA_KUNCI_DETIK = 300;

    // Hash bcrypt tanpa pasangan password: dipakai saat username tidak ada, agar lama pemeriksaan
    // sama dengan akun yang ada (penyerang tidak bisa menebak username dari lamanya jawaban)
    private const HASH_PALSU = '$2y$12$FBL27VgOQWuYnKaRzfI4ceXKFyBih.jB.HBtLhXPo.MJjETptSA4u';

    public function saya(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()?->profil()]);
    }

    public function masuk(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'max:60'],
            'password' => ['required', 'string', 'max:200'],
        ], [
            'username.required' => 'Username wajib diisi.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $username = Str::of($data['username'])->squish()->lower()->toString();
        $kunci = 'masuk:'.$username.'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($kunci, self::MAKS_PERCOBAAN)) {
            return $this->terkunci($kunci);
        }

        $user = User::where('username', $username)->first();
        $cocok = $user ? $user->cocokPassword($data['password']) : Hash::check($data['password'], self::HASH_PALSU) && false;

        if (! $cocok) {
            RateLimiter::hit($kunci, self::LAMA_KUNCI_DETIK);
            if (RateLimiter::tooManyAttempts($kunci, self::MAKS_PERCOBAAN)) {
                return $this->terkunci($kunci);
            }
            $sisa = RateLimiter::retriesLeft($kunci, self::MAKS_PERCOBAAN);

            return response()->json([
                'message' => "Username atau password salah. Sisa {$sisa} percobaan sebelum login dikunci sementara.",
                'sisa' => $sisa,
            ], 422);
        }

        if (! $user->aktif) {
            return response()->json(['message' => 'Akun ini sedang dinonaktifkan. Hubungi Tata Usaha sekolah.'], 403);
        }

        RateLimiter::clear($kunci);
        Auth::login($user);
        $request->session()->regenerate();
        $request->session()->put('masuk_pada', now()->timestamp);

        return response()->json(['user' => $user->profil()]);
    }

    public function keluar(Request $request): Response
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    private function terkunci(string $kunci): JsonResponse
    {
        return response()->json([
            'message' => 'Terlalu banyak percobaan yang salah. Login dikunci sementara.',
            'terkunci' => RateLimiter::availableIn($kunci),
        ], 429);
    }
}
