<?php

namespace App\Filament\Admin\Resources\Rooms\Tables;

use App\Models\Room;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;

class RoomsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('room_number')
                    ->label('Room #')
                    ->sortable()
                    ->weight('bold')
                    ->copyable(),

                TextColumn::make('roomType.name')
                    ->label('Type')
                    ->searchable()
                    ->sortable()
                    ->badge(),

                TextColumn::make('price_per_night')
                    ->money('usd') // Adjust currency as needed
                    ->sortable()
                    ->alignEnd(),

                TextColumn::make('floor')
                    ->label('Floor')
                    ->sortable()
                    ->alignCenter(),

                // Status visualization using v5 Icon logic
                IconColumn::make('status')
                    ->label('Status')
                    ->icon(fn (string $state): string => match ($state) {
                        'available' => 'heroicon-o-check-circle',
                        'occupied' => 'heroicon-o-user-group',
                        'dirty' => 'heroicon-o-sparkles',
                        'maintenance' => 'heroicon-o-wrench-screwdriver',
                        default => 'heroicon-o-question-mark-circle',
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'available' => 'success',
                        'occupied' => 'info',
                        'dirty' => 'warning',
                        'maintenance' => 'danger',
                        default => 'gray',
                    })
                    ->tooltip(fn (string $state): string => ucfirst($state))
                    ->alignCenter(),

                TextColumn::make('updated_at')
                    ->label('Last Activity')
                    ->dateTime()
                    ->since() // Shows "2 hours ago" style for quick reference
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
             ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
