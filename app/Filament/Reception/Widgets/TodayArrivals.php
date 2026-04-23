<?php

namespace App\Filament\Reception\Widgets;

use App\Models\Booking;
use App\Enums\BookingStatus;
use Filament\Actions\Action;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class TodayArrivals extends BaseWidget
{
    protected static ?int $sort = 2;
    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Booking::whereDate('checked_in_at', today())
                    ->where('status', BookingStatus::Pending)
            )
            ->columns([
                Tables\Columns\TextColumn::make('guest.name')->weight('bold'),
                Tables\Columns\TextColumn::make('rooms.room_number')->badge()->color('info'),
                Tables\Columns\TextColumn::make('checked_in_at')->time()->label('Arrival Time'),
                Tables\Columns\TextColumn::make('total_price')->money('usd'),
            ])
            ->actions([
               Action::make('check_in')
                    ->url(fn (Booking $record): string => "/reception/bookings/{$record->id}/edit") // Quick link to booking
                    ->icon('heroicon-m-arrow-right-end-on-rectangle')
                    ->color('success')
            ]);
    }
}
