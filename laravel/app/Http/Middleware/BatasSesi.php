<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/*
  Batas sesi login: paling lama 12 jam sejak masuk (komputer sekolah sering dipakai bersama),
  dan akun yang dinonaktifkan langsung keluar. Batas diam 30 menit diatur SESSION_LIFETIME.
*/
class BatasSesi
{
    public const MAKS_JAM = 12;

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $masuk = (int) $request->session()->get('masuk_pada', 0);

        if ($user && (! $user->aktif || now()->timestamp - $masuk > self::MAKS_JAM * 3600)) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json(['message' => 'Sesi Anda sudah berakhir. Silakan masuk kembali.'], 401);
        }

        return $next($request);
    }
}
