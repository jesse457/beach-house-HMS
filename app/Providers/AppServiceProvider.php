<?php

namespace App\Providers;

use App\Enums\UserRole;
use App\Models\User;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS for all generated URLs in non-local environments.
        if (! $this->app->environment('local')) {
            URL::forceScheme('https');
        }

        Scramble::configure()
            ->withDocumentTransformers(function (OpenApi $openApi) {
                $openApi->secure(
                    SecurityScheme::http('bearer')
                );
            });

        // Authorize admin/receptionist users to access Log Viewer and Scheduler List
        Gate::define('viewLogViewer', function (User $user) {
            return in_array($user->role, [UserRole::ADMIN, UserRole::RECEPTIONIST]);
        });

        Gate::define('viewSchedulerList', function (User $user) {
            return in_array($user->role, [UserRole::ADMIN, UserRole::RECEPTIONIST]);
        });

        // Register scheduled tasks — fires for both HTTP (scheduler UI) and CLI (schedule:work).
        // Using afterResolving here because withSchedule() in bootstrap/app.php is gated
        // behind Artisan::starting() and only fires during CLI commands.
        $this->app->afterResolving(Schedule::class, function (Schedule $schedule) {
            $schedule->command('backup:run')
                ->weekly()
                ->sundays()
                ->at('02:00')
                ->withoutOverlapping()
                ->runInBackground()
                ->description('Backup database and media files to Cloudflare R2')
                ->onFailure(function () {
                    Log::error('Scheduled weekly backup failed');
                });
        });
    }
}
