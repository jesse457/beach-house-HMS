<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withSchedule(function (Schedule $schedule) {
        // Register the backup task here so resolveConsoleSchedule() always finds it,
        // even under Octane where include_once skips re-execution of console.php.
        $schedule->command('backup:run')
            ->weekly()
            ->sundays()
            ->at('02:00')
            ->withoutOverlapping()
            ->runInBackground()
            ->description('Backup database and media files to Cloudflare R2')
            ->onFailure(function () {
                \Illuminate\Support\Facades\Log::error('Scheduled weekly backup failed');
            });
    })
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);

        // Trust all proxies — needed when behind Nginx/Caddy so Laravel
        // respects the X-Forwarded-Proto header and generates HTTPS URLs.
        $middleware->trustProxies('*');

        // Redirect unauthenticated users to the Filament admin login
        // (protects /schedulers, /log-viewer, and any web+auth routes)
        $middleware->redirectGuestsTo('/admin/login');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
