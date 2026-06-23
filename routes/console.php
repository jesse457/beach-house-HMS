<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ─── Scheduled Tasks ────────────────────────────────────────────────

Schedule::command('backup:run')
    ->weekly()
    ->sundays()
    ->at('02:00')
    ->withoutOverlapping()
    ->runInBackground()
    ->description('Backup database and media files to Cloudflare R2')
    ->onFailure(function () {
        \Illuminate\Support\Facades\Log::error('Scheduled weekly backup failed');
    });
