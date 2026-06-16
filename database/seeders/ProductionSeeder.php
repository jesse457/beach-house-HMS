<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ProductionSeeder extends Seeder
{
    /**
     * Seed only the essential production data:
     * admin user and (optionally) a receptionist.
     *
     * Credentials are read from .env — never hardcoded:
     *
     *   ADMIN_NAME=...
     *   ADMIN_EMAIL=...
     *   ADMIN_PASSWORD=...
     *
     *   RECEPTIONIST_NAME=...   (optional)
     *   RECEPTIONIST_EMAIL=...  (optional)
     *   RECEPTIONIST_PASSWORD=..(optional)
     *
     * Usage on first deploy:
     *   php artisan migrate --force
     *   php artisan db:seed --class=ProductionSeeder --force
     */
    public function run(): void
    {
        // --- Admin (required) ---
        $adminName  = env('ADMIN_NAME');
        $adminEmail = env('ADMIN_EMAIL');
        $adminPass  = env('ADMIN_PASSWORD');

        if (! $adminName || ! $adminEmail || ! $adminPass) {
            $this->command?->error(
                'Missing ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD in .env. Aborting.'
            );

            return;
        }

        if (strlen($adminPass) < 8) {
            $this->command?->error('ADMIN_PASSWORD must be at least 8 characters.');

            return;
        }

        User::updateOrCreate(
            ['email' => $adminEmail],
            [
                'name'     => $adminName,
                'password' => Hash::make($adminPass),
                'role'     => UserRole::ADMIN,
            ],
        );

        $this->command?->info("✓ Admin user seeded: {$adminEmail}");

        // --- Receptionist (optional) ---
        $recName  = env('RECEPTIONIST_NAME');
        $recEmail = env('RECEPTIONIST_EMAIL');
        $recPass  = env('RECEPTIONIST_PASSWORD');

        if ($recName && $recEmail && $recPass) {
            User::updateOrCreate(
                ['email' => $recEmail],
                [
                    'name'     => $recName,
                    'password' => Hash::make($recPass),
                    'role'     => UserRole::RECEPTIONIST,
                ],
            );

            $this->command?->info("✓ Receptionist user seeded: {$recEmail}");
        }
    }
}
