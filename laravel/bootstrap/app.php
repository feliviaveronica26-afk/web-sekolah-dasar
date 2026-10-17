<?php

use App\Http\Middleware\BatasSesi;
use App\Http\Middleware\PasswordSudahDiganti;
use App\Http\Middleware\PastikanPeran;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // API website memakai middleware "web": sesi login lewat cookie HttpOnly + CSRF.
            // Website & API berada di alamat yang sama (lewat proxy Vite), jadi tidak perlu token.
            Route::middleware('web')->prefix('api')->group(base_path('routes/api.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Laravel hanya mendengar di 127.0.0.1; permintaan dari HP/laptop lain datang lewat proxy
        // Vite, jadi alamat asli pengunjung (untuk batas percobaan login) dibaca dari X-Forwarded-For.
        $middleware->trustProxies(at: ['127.0.0.1', '::1']);
        $middleware->alias(['peran' => PastikanPeran::class, 'batas.sesi' => BatasSesi::class, 'password.diganti' => PasswordSudahDiganti::class]);
        // Webhook payment gateway dipanggil server gateway (tanpa cookie/CSRF); keasliannya diperiksa lewat tanda tangan HMAC
        $middleware->validateCsrfTokens(except: ['api/gateway/*']);
        $middleware->redirectGuestsTo('/login');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Silakan masuk terlebih dahulu.'], 401);
            }
        });
    })->create();
