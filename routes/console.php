<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ─── Scheduled Tasks ────────────────────────────────────────────────
//
// The backup:run schedule is now registered in bootstrap/app.php's
// withSchedule() callback. This avoids Octane include_once issues
// where the scheduler-list UI package would lose track of events.
//
