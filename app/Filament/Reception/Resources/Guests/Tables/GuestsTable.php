<?php

namespace App\Filament\Reception\Resources\Guests\Tables;

use App\Models\Guest;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Actions\EditAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Illuminate\Database\Eloquent\Builder;

class GuestsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->poll('30s') // Auto-refresh to see check-in updates
            ->columns([
                TextColumn::make('name')
                    ->label('Guest Name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->description(fn (Guest $record): string => $record->id_card_number ?? 'No ID Registered'),

                TextColumn::make('phone')
                    ->label('Contact')
                    ->searchable()
                    ->icon('heroicon-m-phone'),

                // CHECK-IN / CHECK-OUT LOGIC BADGE
                TextColumn::make('status')
                    ->label('Stay Status')
                    ->state(function (Guest $record): string {
                        $latestBooking = $record->bookings()->latest()->first();

                        if (!$latestBooking) return 'New Guest';
                        return match ($latestBooking->status) {
                            'checked_in' => 'In-House',
                            'confirmed' => 'Arriving Soon',
                            'checked_out' => 'Checked Out',
                            default => 'No Active Stay',
                        };
                    })
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'In-House' => 'success',
                        'Arriving Soon' => 'info',
                        'Checked Out' => 'gray',
                        default => 'warning',
                    }),

                TextColumn::make('latest_visit')
                    ->label('Last Visit')
                    ->state(fn (Guest $record) => $record->bookings()->latest()->first()?->check_in_date)
                    ->date()
                    ->sortable()
                    ->placeholder('Never stayed'),

                TextColumn::make('created_at')
                    ->label('Joined')
                    ->dateTime()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])  ->recordActions([
                ViewAction::make()->slideOver(),
                EditAction::make()->color('warning'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),

            ]);
    }
}
