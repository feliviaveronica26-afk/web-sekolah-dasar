<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Server Data — SD Harapan Gemilang</title>
        {{-- Bootstrap 5.3 (sama dengan versi di website sd-app), dimuat dari CDN dengan hash integritas --}}
        <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
            integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB"
            crossorigin="anonymous"
        >
    </head>
    <body class="bg-body-tertiary">
        <main class="container py-5">
            <div class="row justify-content-center">
                <div class="col-lg-7">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body p-4 p-md-5">
                            <span class="badge text-bg-danger mb-3">Server data</span>
                            <h1 class="h3 fw-bold mb-2">SD Harapan Gemilang</h1>
                            <p class="text-body-secondary mb-4">
                                Ini server data (API Laravel) untuk website sekolah. Halaman ini tidak dipakai pengunjung:
                                website dan portal dibuka lewat aplikasi <code>sd-app</code>.
                            </p>
                            <ol class="list-group list-group-numbered mb-4">
                                <li class="list-group-item">Jalankan server ini: <code>php artisan serve --host=127.0.0.1 --port=8000</code></li>
                                <li class="list-group-item">Di folder <code>sd-app</code>: <code>npm run dev</code></li>
                                <li class="list-group-item">Buka website di <a href="http://localhost:5173" class="link-danger">http://localhost:5173</a></li>
                            </ol>
                            <p class="small text-body-secondary mb-0">Laravel {{ app()->version() }} · PHP {{ PHP_VERSION }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </body>
</html>
