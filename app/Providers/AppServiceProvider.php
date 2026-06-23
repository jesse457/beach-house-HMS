<?php

namespace App\Providers;

use App\Enums\UserRole;
use App\Models\User;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Illuminate\Support\Facades\Gate;
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
        // Required when the app sits behind a reverse proxy (Nginx/Caddy)
        // that terminates TLS — without this, Laravel generates http:// URLs.
        if (! $this->app->environment('local')) {
            URL::forceScheme('https');
        }

        Scramble::configure()
            ->withDocumentTransformers(function (OpenApi $openApi) {
                $openApi->secure(
                    SecurityScheme::http('bearer')
                );
            });

        // Authorize admin/receptionist users to access Log Viewer
        Gate::define('viewLogViewer', function (User $user) {
            return in_array($user->role, [UserRole::ADMIN, UserRole::RECEPTIONIST]);
        });
    }
}
