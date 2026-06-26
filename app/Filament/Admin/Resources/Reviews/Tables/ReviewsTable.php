<?php

namespace App\Filament\Admin\Resources\Reviews\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ReviewsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('author_name')
                    ->label('Guest')
                    ->searchable()
                    ->sortable()
                    ->description(fn ($record) => $record->email),

                TextColumn::make('rating')
                    ->label('Rating')
                    ->sortable()
                    ->formatStateUsing(fn (string $state): string => str_repeat('★', (int) $state) . str_repeat('☆', 5 - (int) $state))
                    ->color(fn (string $state): string => match (true) {
                        (int) $state >= 4 => 'warning',
                        (int) $state === 3 => 'gray',
                        default => 'gray',
                    }),

                TextColumn::make('content')
                    ->label('Review')
                    ->limit(80)
                    ->searchable()
                    ->wrap(),

                ToggleColumn::make('is_approved')
                    ->label('Approved')
                    ->onColor('success')
                    ->offColor('gray'),

                TextColumn::make('created_at')
                    ->label('Submitted')
                    ->dateTime('M d, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('is_approved')
                    ->label('Status')
                    ->options([
                        '1' => 'Approved',
                        '0' => 'Pending',
                    ]),

                SelectFilter::make('rating')
                    ->label('Rating')
                    ->options([
                        '5' => '★★★★★',
                        '4' => '★★★★☆',
                        '3' => '★★★☆☆',
                        '2' => '★★☆☆☆',
                        '1' => '★☆☆☆☆',
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
