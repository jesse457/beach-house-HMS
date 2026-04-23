<?php

namespace App\Filament\Admin\Widgets;

use App\Models\Payment;
use Carbon\Carbon;
use Filament\Widgets\ChartWidget;

class RevenueTrendChart extends ChartWidget
{
      protected  ?string $heading = 'Revenue (Last 7 Days)';
    protected static ?int $sort = 2; // Places it under the stats overview

    protected function getData(): array
    {
        $data = [];
        $labels =[];

        // Loop through the last 7 days
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);

            // Sum completed payments for that specific date
            $revenue = Payment::where('status', 'completed')
                ->whereDate('paid_at', $date->toDateString())
                ->sum('amount');

            $data[] = $revenue;
            $labels[] = $date->format('M d'); // e.g., 'Oct 12'
        }

        return [
            'datasets' => [[
                    'label' => 'Daily Revenue ($)',
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
