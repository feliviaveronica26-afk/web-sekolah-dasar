<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/*
  Akun yang masih memakai password awal dari sekolah belum boleh mengubah data apa pun selain
  password-nya sendiri. Website juga menampilkan formulir ganti password sebelum portal dibuka.
*/
class PasswordSudahDiganti
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->wajib_ganti_password) {
            return response()->json(['message' => 'Ganti password awal Anda terlebih dahulu.', 'wajibGanti' => true], 403);
        }

        return $next($request);
    }
}
