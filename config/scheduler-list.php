<?php

use Illuminate\Support\Env;

// config for Akshay/SchedulerListLaravel
return [
    /*
     * The path/URL where the scheduler dashboard will be accessible.
     */
    'path' => Env::get('SCHEDULER_LIST_PATH', 'schedulers'),

    /*
     * The middleware applied to the scheduler dashboard routes.
     * Keep auth enabled in production and add any tenant/admin/IP middleware your app needs.
     */
    'middleware' => ['web', 'auth'],

    /*
     * Optional Gate ability used by the package. The default Gate only grants access
     * in local environments; production apps should define this ability explicitly.
     */
    'ability' => Env::get('SCHEDULER_LIST_ABILITY', 'viewSchedulerList'),

    /*
     * Optional authorization callback. Return true to allow access.
     * Use the 'ability' Gate instead — closures break config caching.
     */
    'authorize' => null,

    /*
     * Whether the scheduler dashboard is enabled.
     */
    'enabled' => Env::get('SCHEDULER_LIST_ENABLED', true),

    /*
     * Allow developers to run scheduled tasks manually from the dashboard.
     */
    'manual_execution' => Env::get('SCHEDULER_LIST_MANUAL_EXECUTION', true),

    /*
     * Maximum number of output characters returned to the browser after a manual run.
     */
    'output_limit' => 12000,
];
