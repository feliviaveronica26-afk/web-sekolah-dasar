<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/*
  Batasi rute untuk peran tertentu, mis. ->middleware(['auth', 'peran:kepsek']).
  Dipasang setelah "auth", jadi pengguna di sini pasti sudah login.
*/
class PastikanPeran
{
    public function handle(Request $request, Closure $next, string ...$peran): Response
    {
        if (! in_array($request->user()?->role, $peran, true)) {
            return response()->json(['message' => 'Akun Anda tidak berhak membuka atau mengubah data ini.'], 403);
        }

        return $next($request);
    }
}
