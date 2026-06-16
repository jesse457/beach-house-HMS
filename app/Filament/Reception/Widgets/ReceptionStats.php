<?php

namespace App\Filament\Reception\Widgets;

use App\Models\Room;
use App\Models\Booking;
use App\Models\Payment;
use App\Enums\BookingStatus;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ReceptionStats extends BaseWidget
{
    protected function getStats(): array
    {
        $activeStatuses = [BookingStatus::Pending, BookingStatus::CheckedIn];

        $outstanding = Booking::whereIn('status', $activeStatuses)->sum('total_price')
            - Payment::whereHas('booking', fn ($q) => $q->whereIn('status', $activeStatuses))->sum('amount');

        return [
            Stat::make('Available Rooms', Room::where('is_occupied', false)->where('status', 'available')->count())
                ->description('Ready for check-in')
                ->descriptionIcon('heroicon-m-home')
                ->color('success'),

            Stat::make('Today Arrivals', Booking::whereDate('checked_in_at', today())->count())
                ->description('Guests arriving today')
                ->descriptionIcon('heroicon-m-arrow-right-circle')
                ->color('info'),

            Stat::make('Today Departures', Booking::whereDate('checked_out_at', today())->count())
                ->description('Guests checking out')
                ->descriptionIcon('heroicon-m-arrow-left-circle')
                ->color('warning'),

            Stat::make('Pending Payments', 'XAF' . number_format($outstanding, 2))
                ->description('Outstanding balance')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('danger'),
        ];
    }
}
