<?php

namespace App\Filament\Admin\Resources\Amenities\Tables;

use App\Models\Amenity;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\IconColumn as FilamentIconColumn;
// Correct import for the Guava Icon Column
use Guava\IconPicker\Tables\Columns\IconColumn;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Filters\TernaryFilter;

class AmenitiesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                // Use Guava's IconColumn to render the stored icon string
                IconColumn::make('icon')
                    ->label('Icon')
                    ->alignCenter(),

                TextColumn::make('name')
                    ->label('Amenity Name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),

                TextColumn::make('is_standalone')
                    ->label('Type')
                    ->badge()
                    ->color(fn (bool $state): string => $state ? 'success' : 'gray')
                    ->formatStateUsing(fn (bool $state): string => $state ? 'Facility' : 'Room Feature'),

                TextColumn::make('price')
                    ->label('Price')
                    ->money('usd')
                    ->sortable()
                    ->placeholder('Free'),

                TextColumn::make('description')
                    ->label('Description')
                    ->limit(30)
                    ->tooltip(fn (Amenity $record): string => $record->description ?? '')
                    ->color('gray'),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                TernaryFilter::make('is_standalone')
                    ->label('Classification')
                    ->placeholder('All Amenities')
                    ->trueLabel('Facilities (Gym/Pool)')
                    ->falseLabel('Room Features (WiFi/TV)'),
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
