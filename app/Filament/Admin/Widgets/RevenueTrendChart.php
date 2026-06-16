<?php

namespace App\Filament\Admin\Widgets;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use Carbon\Carbon;
use Filament\Widgets\ChartWidget;

class RevenueTrendChart extends ChartWidget
{
      protected  ?string $heading = 'Revenue (Last 7 Days)';
    protected static ?int $sort = 2;

    protected function getData(): array
    {
        $data = [];
        $labels = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);

            $revenue = Payment::where('status', PaymentStatus::Completed)
                ->whereDate('paid_at', $date->toDateString())
                ->sum('amount');

            $data[] = $revenue;
            $labels[] = $date->format('M d');
        }

        return [
            'datasets' => [[
                    'label' => 'Daily Revenue (XAF)',
                    'data' => $data,
                    'borderColor' => '#10b981', // Tailwind Emerald 500
                    'backgroundColor' => 'rgba(16, 185, 129, 0.2)',
                    'fill' => 'start',
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }

}
