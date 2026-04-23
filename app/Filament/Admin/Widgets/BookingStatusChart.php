<?php

namespace App\Filament\Admin\Widgets;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Filament\Widgets\ChartWidget;

class BookingStatusChart extends ChartWidget
{
       protected  ?string $heading = 'Booking Statuses';
    protected static ?int $sort = 3;

    protected function getData(): array
    {
        // Count bookings by their status
        $pending = Booking::where('status', BookingStatus::Pending)->count();
        $checkedIn = Booking::where('status', BookingStatus::CheckedIn)->count();
        $cancelled = Booking::where('status', BookingStatus::Cancelled)->count();
$checkeOut = Booking::where('status', BookingStatus::CheckedOut)->count();
        return [
            'datasets' => [[
                    'label' => 'Bookings',
                    'data' => [$pending, $checkedIn, $cancelled,$checkeOut],
                    'backgroundColor' =>[
                        '#f59e0b', // Amber (Pending)
                        '#3b82f6', // Blue (Confirmed)
                        '#ef4444', // Red (Cancelled)
                    ],
                ],
            ],
            'labels' => ['Pending', 'Checked In', 'Cancelled','Checked Out'],
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }

}
