<?php

use App\Http\Middleware\HandleInertiaRequests;
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
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);

        // Trust all proxies — needed when behind Nginx/Caddy so Laravel
        // respects the X-Forwarded-Proto header and generates HTTPS URLs.
        $middleware->trustProxies('*');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
