<?php

namespace App\Filament\Reception\Resources\Rooms\Tables;

use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\SelectColumn;

class RoomsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('room_number')->sortable()->weight('bold'),
                TextColumn::make('roomType.name')->badge(),

                // SelectColumn allows Receptionist to change status directly from the list
                SelectColumn::make('status')
                    ->options([
                        'available' => 'Available',
                        'dirty' => 'Dirty',
                        'maintenance' => 'Maintenance',
                    ])
                    ->selectablePlaceholder(false),

                TextColumn::make('bookings')
                    ->label('Current Guest')
                    ->formatStateUsing(fn ($record) => $record->bookings()->where('status', 'confirmed')->first()?->guest?->name ?? 'None')
                    ->placeholder('Vacant'),
            ]);
    }
}
