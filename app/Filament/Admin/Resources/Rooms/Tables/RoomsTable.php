<?php

namespace App\Filament\Admin\Resources\Rooms\Tables;

use App\Models\Room;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\CheckboxColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\Filter;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Actions\CreateAction;
use Filament\Tables\Enums\RecordActionsPosition;
use Illuminate\Database\Eloquent\Builder;

class RoomsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            // 🔍 Search & Pagination
            ->searchable()
            ->paginationPageOptions([10, 25, 50, 100])
            ->defaultSort('room_number', 'asc')

            // 📋 Columns
            ->columns([
                TextColumn::make('room_number')
                    ->label('Room #')
                    ->sortable()
                    ->searchable()
                    ->weight('bold')
                    ->copyable(),

                TextColumn::make('roomType.name')
                    ->label('Type')
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color('primary'),

                TextColumn::make('price_per_night')
                    ->money('xaf', true) // Update based on your currency
                    ->label('Price/Night')
                    ->sortable()
                    ->alignEnd()
                    ->summarize([
                        // Optional: show avg/min/max in footer
                    ]),

                TextColumn::make('floor')
                    ->label('Floor')
                    ->sortable()
                    ->alignCenter()
                    ->toggleable(),

                // ✅ Status visualization with IconColumn
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
                    ->alignCenter()
                    ->sortable(),

                // 🛏️ Occupied toggle (synced with status)
                CheckboxColumn::make('is_occupied')
                    ->label('Occupied')
                    ->alignCenter()
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->disabled(), // Read-only; managed via status

                // 🧹 Amenities count badge
                TextColumn::make('amenities_count')
                    ->label('Amenities')
                    ->counts('amenities')
                    ->badge()
                    ->color('gray')
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->alignCenter(),

                // 🖼️ Media indicators
                IconColumn::make('has_pictures')
                    ->label('Photos')
                    ->icon(fn (Room $record): string => $record->pictures ? 'heroicon-o-photo' : 'heroicon-o-photo-plus')
                    ->color(fn (Room $record): string => $record->pictures && count($record->pictures) > 0 ? 'success' : 'gray')
                    ->tooltip(fn (Room $record): string => $record->pictures ? count($record->pictures) . ' photo(s)' : 'No photos')
                    ->alignCenter()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('updated_at')
                    ->label('Last Activity')
                    ->dateTime()
                    ->since()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])

            // 🔽 Filters
            ->filters([
                SelectFilter::make('status')
                    ->options([

                    'available' => 'Available',
                        'occupied' => 'Occupied',
                        'dirty' => 'Dirty',
                        'maintenance' => 'Maintenance',
                    ])
                    ->attribute('status'),

                SelectFilter::make('room_type_id')
                    ->label('Room Type')
                    ->relationship('roomType', 'name')
                    ->searchable()
                    ->preload(),

                SelectFilter::make('floor')
                    ->options(fn () => Room::distinct()->pluck('floor', 'floor')->filter()->toArray())
                    ->native(false),

                Filter::make('has_pictures')
                    ->label('Has Photos')
                    ->query(fn (Builder $query): Builder => $query->whereNotNull('pictures')->whereJsonLength('pictures', '>', 0)),

                Filter::make('price_range')
                    ->label('Price Range')
                    ->form([
                        \Filament\Forms\Components\TextInput::make('min_price')
                            ->numeric()
                            ->prefix('$'),
                        \Filament\Forms\Components\TextInput::make('max_price')
                            ->numeric()
                            ->prefix('$'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['min_price'], fn ($q, $v) => $q->where('price_per_night', '>=', $v))
                            ->when($data['max_price'], fn ($q, $v) => $q->where('price_per_night', '<=', $v));
                    }),
            ])

            // ⚡ Actions
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])


            // 🗑️ Bulk Actions
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->requiresConfirmation()
                        ->modalHeading('Delete Rooms')
                        ->modalDescription('Are you sure you want to delete the selected rooms? This action cannot be undone.'),
                ]),
            ])

            // ➕ Header Actions
            ->headerActions([
                CreateAction::make()
                    ->label('Add Room')
                    ->icon('heroicon-o-plus'),
            ])

            // 🪄 Empty State
            ->emptyStateHeading('No rooms found')
            ->emptyStateDescription('Create your first room to get started.')
            ->emptyStateIcon('heroicon-o-building-office-2')
            ->emptyStateActions([
                CreateAction::make()->label('Add Room'),
            ]);
    }
}
