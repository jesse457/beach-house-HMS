<?php

namespace App\Filament\Admin\Resources\Galleries\Tables;

use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Actions\EditAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;

class GalleriesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                // 1. Visual Preview
                ImageColumn::make('display_preview')
                ->disk('s3')
                    ->label('Preview')
                    ->state(fn ($record) => $record->type === 'video' ? $record->thumbnail : $record->url)
                    ->circular()
                    ->size(50),

                // 2. Title & Category
                TextColumn::make('title')
                    ->searchable()
                    ->sortable()
                    ->description(fn ($record) => $record->room_name),

                TextColumn::make('roomType.name')
    ->label('Category')
    ->badge()
    ->color('success')
    ->sortable(),

                // 3. Media Type Icon
                IconColumn::make('type')
                    ->icon(fn (string $state): string => match ($state) {
                        'image' => 'heroicon-o-camera',
                        'video' => 'heroicon-o-play-circle',
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'image' => 'info',
                        'video' => 'success',
                    }),

                // 4. Status Toggles
                ToggleColumn::make('is_active')
                    ->label('Visible'),

                TextColumn::make('sort_order')
                    ->numeric()
                    ->sortable()
                    ->label('Order'),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                // Filter by Category (Matches your React frontend buttons)
                SelectFilter::make('category')
                    ->options([
                        'Rooms' => 'Rooms',
                        'Lobby' => 'Lobby',
                        'Pool' => 'Pool',
                        'Spa' => 'Spa',
                        'Restaurant' => 'Restaurant',
                        'Exterior' => 'Exterior',
                        'Events' => 'Events',
                    ]),

                // Filter by Type
                SelectFilter::make('type')
                    ->options([
                        'image' => 'Photos',
                        'video' => 'Videos',
                    ]),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('sort_order', 'asc');
    }
}
