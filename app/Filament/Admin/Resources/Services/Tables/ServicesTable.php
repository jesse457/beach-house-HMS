<?php

namespace App\Filament\Admin\Resources\Services\Tables;

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

class ServicesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('image')
                    ->disk('s3')
                    ->label('Photo')
                    ->circular(),

                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->description(fn ($record) => $record->category),

                TextColumn::make('category')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Dining' => 'warning',
                        'Wellness' => 'success',
                        'Transport' => 'info',
                        'Recreation' => 'primary',
                        'Guest Services' => 'gray',
                        'Business' => 'danger',
                        default => 'primary',
                    })
                    ->sortable(),

                ToggleColumn::make('is_active')
                    ->label('Visible'),

                TextColumn::make('sort_order')
                    ->label('Order')
                    ->sortable(),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('sort_order', 'asc')
            ->filters([
                SelectFilter::make('category')
                    ->options([
                        'Dining' => 'Dining',
                        'Wellness' => 'Wellness',
                        'Transport' => 'Transport',
                        'Recreation' => 'Recreation',
                        'Guest Services' => 'Guest Services',
                        'Business' => 'Business',
                    ]),
                SelectFilter::make('is_active')
                    ->label('Visibility')
                    ->options([
                        '1' => 'Visible',
                        '0' => 'Hidden',
                    ]),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
