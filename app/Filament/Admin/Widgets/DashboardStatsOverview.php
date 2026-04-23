<?php

namespace App\Filament\Admin\Widgets;

use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use App\Models\Booking;
use App\Models\CheckIn;
use App\Models\Guest;
use App\Models\Payment;

class DashboardStatsOverview extends StatsOverviewWidget
{
     protected  ?string $pollingInterval = '15s';

    protected function getStats(): array
    {
        // 1. Calculate Total Revenue (Completed Payments)
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');

        // 2. Count Pending Bookings
        $pendingBookings = Booking::where('status', 'pending')->count();

        // 3. Count Active Check-ins (Guests who haven't checked out yet)
        $activeCheckIns = Booking::whereNull('checked_out_at')->count();

        // 4. Total Registered Guests
        $totalGuests = Guest::count();

        return[
            Stat::make('Total Revenue', 'XAF' . number_format($totalRevenue, 2))
                ->description('Revenue from completed payments')
                ->descriptionIcon('heroicon-m-banknotes')
                ->chart([7, 10, 13, 15, 20, 32, 40]) // Example sparkline chart
                ->color('success'),

            Stat::make('Pending Bookings', $pendingBookings)
                ->description('Bookings awaiting confirmation')
                ->descriptionIcon('heroicon-m-clock')
                ->color('warning'),

            Stat::make('Active Check-ins', $activeCheckIns)
                ->description('Currently in-house guests')
                ->descriptionIcon('heroicon-m-home')
                ->color('info'),

            Stat::make('Total Guests', $totalGuests)
                ->description('Total registered guests to date')
                ->descriptionIcon('heroicon-m-users')
                ->color('primary'),
        ];
    }
}
