<?php

namespace App\Http\Controllers;

use App\Support\AkunSekolah;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

/*
  Akun milik pengguna yang sedang login: ganti password. Password lama wajib dimasukkan (juga untuk
  akun dengan password awal dari sekolah), dan salah berulang dikunci sementara seperti login.
*/
class AkunController extends Controller
{
    private const MAKS_PERCOBAAN = 5;

    public function gantiPassword(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'passwordLama' => ['required', 'string', 'max:200'],
            'passwordBaru' => ['required', 'string', 'min:8', 'max:72', 'confirmed'],
        ], [
            'passwordLama.required' => 'Masukkan password saat ini.',
            'passwordBaru.required' => 'Masukkan password baru.',
            'passwordBaru.min' => 'Password baru minimal 8 karakter.',
            'passwordBaru.max' => 'Password baru paling banyak 72 karakter.',
            'passwordBaru.confirmed' => 'Ulangi password baru dengan sama persis.',
        ]);

        $kunci = 'ganti-password:'.$user->getKey();
        if (RateLimiter::tooManyAttempts($kunci, self::MAKS_PERCOBAAN)) {
            throw ValidationException::withMessages(['passwordLama' => 'Terlalu banyak percobaan. Coba lagi dalam '.ceil(RateLimiter::availableIn($kunci) / 60).' menit.']);
        }
        if (! $user->cocokPassword($data['passwordLama'])) {
            RateLimiter::hit($kunci, 300);
            throw ValidationException::withMessages(['passwordLama' => 'Password saat ini salah.']);
        }
        RateLimiter::clear($kunci);

        $baru = $data['passwordBaru'];
        if ($baru === $data['passwordLama']) {
            throw ValidationException::withMessages(['passwordBaru' => 'Password baru harus berbeda dari password saat ini.']);
        }
        if (mb_strtolower($baru) === mb_strtolower($user->username) || str_contains(mb_strtolower($baru), mb_strtolower($user->username))) {
            throw ValidationException::withMessages(['passwordBaru' => 'Password baru tidak boleh memuat username.']);
        }

        $user->forceFill(['password' => $baru, 'hash_lama' => null, 'wajib_ganti_password' => false])->save();
        // Perangkat lain yang masih login dengan password lama dikeluarkan
        AkunSekolah::akhiriSesi($user, $request->session()->getId());
        $request->session()->regenerate(true);

        return response()->json(['user' => $user->profil()]);
    }
}
