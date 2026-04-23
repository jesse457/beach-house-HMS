<?php

namespace App\Filament\Admin\Resources\RoomTypes\Tables;

use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter; // Added Filter
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;

class RoomTypesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Category Name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),

                TextColumn::make('category')
                    ->badge()
                    ->sortable()
                    ->color(fn (string $state): string => match ($state) {
                        'stay' => 'success',
                        'event' => 'warning',
                        'facility' => 'info',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'stay' => 'Stay',
                        'event' => 'Event Space',
                        'facility' => 'Facility',
                        default => $state,
                    }),

                TextColumn::make('rooms_count')
                    ->label('Units/Spaces')
                    ->counts('rooms')
                    ->sortable()
                    ->badge()
                    ->color('gray'),

                TextColumn::make('description')
                    ->markdown()
                    ->limit(30)
                    ->color('gray')
                    ->toggleable(),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('category')
                    ->options([
                        'stay' => 'Stay',
                        'event' => 'Event Space',
                        'facility' => 'Facility',
                    ]),
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
