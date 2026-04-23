<?php

namespace App\Providers\Filament;

use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Support\Enums\MaxWidth; // <-- Added for layout width control
use Filament\Widgets\AccountWidget;
use Filament\Navigation\NavigationGroup;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class ReceptionPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->id('reception')
            ->path('reception')
  ->darkMode(true) 
            // --- 1. Professional Branding & Layout ---
            ->brandName('Grand Hotel Reception')
            ->brandLogoHeight('2rem') // Controls logo sizing
            ->favicon(asset('favicon.ico'))
            ->font('Inter') // Professional clean font

            // --- 2. Sidebar Customization (Reduced Size) ---
            ->sidebarWidth('15rem') // explicitly reduces the expanded width (default is ~16-20rem)
            ->sidebarCollapsibleOnDesktop() // allows shrinking the sidebar to icons only
            ->collapsedSidebarWidth('4rem') // size of the sidebar when collapsed
            ->maxContentWidth('full') // expands the main content area to utilize large screens better

            // --- 3. Premium Color Palette ---
            ->colors([
                'primary' => Color::Indigo, // Executive Indigo
                'gray'    => Color::Zinc,   // Zinc gives a more modern, slightly cooler neutral tone than default gray
                'danger'  => Color::Rose,
                'success' => Color::Emerald,
                'warning' => Color::Amber,
                'info'    => Color::Blue,
            ])

            // --- 4. Navigation Grouping ---
            ->navigationGroups([
                NavigationGroup::make()
                     ->label('Front Desk')
                     ->icon('heroicon-o-building-office-2')
                     ->collapsed(false), // Keep primary operations open

                NavigationGroup::make()
                    ->label('Financial Management')
                    ->icon('heroicon-o-banknotes')
                    ->collapsed(true), // Collapse secondary items to reduce clutter

                NavigationGroup::make()
                    ->label('Room Management')
                    ->icon('heroicon-o-key')
                    ->collapsed(true),
            ])

            // --- 5. Extra Professional Features ---
            ->databaseNotifications()
            ->globalSearchKeyBindings(['command+k', 'ctrl+k']) // Pro shortcut for quick searching
            ->spa() // Enables Single Page Application mode for lightning-fast page transitions

            ->discoverResources(in: app_path('Filament/Reception/Resources'), for: 'App\Filament\Reception\Resources')
            ->discoverPages(in: app_path('Filament/Reception/Pages'), for: 'App\Filament\Reception\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Reception/Widgets'), for: 'App\Filament\Reception\Widgets')
            ->widgets([
                  \App\Filament\Reception\Widgets\ReceptionStats::class,
    \App\Filament\Reception\Widgets\TodayArrivals::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                PreventRequestForgery::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                // Authenticate::class, // Re-enable for security
            ]);
    }
}
