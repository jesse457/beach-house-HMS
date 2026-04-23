<?php

namespace App\Filament\Reception\Resources\GuestOrders\Tables;

use App\Models\GuestOrder;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Support\Enums\FontWeight;

class GuestOrdersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('booking.guest.name')
                    ->label('Guest')
                    ->searchable()
                    ->sortable()
                    ->weight(FontWeight::Bold)
                    ->description(fn ($record) => "Room: " . ($record->booking->rooms->first()?->room_number ?? 'N/A')),

                // Shows a list of all items inside this order
                TextColumn::make('items.item_name')
                    ->label('Items Ordered')
                    ->badge()
                    ->separator(',')
                    ->searchable(),

                // Shows how many items are in the order
                TextColumn::make('items_count')
                    ->counts('items')
                    ->label('Qty')
                    ->alignCenter(),

                TextColumn::make('total_amount')
                    ->label('Total Amount')
                    ->money('usd')
                    ->sortable()
                    ->weight(FontWeight::Bold)
                    ->color('primary'),

                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'danger',
                        'served' => 'info',
                        'paid' => 'success',
                        default => 'gray',
                    })
                    ->icon(fn (string $state): string => match ($state) {
                        'pending' => 'heroicon-m-clock',
                        'served' => 'heroicon-m-truck',
                        'paid' => 'heroicon-m-check-badge',
                        default => 'heroicon-m-question-mark-circle',
                    }),

                TextColumn::make('created_at')
                    ->label('Order Time')
                    ->dateTime('M d, H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'served' => 'Served',
                        'paid' => 'Paid',
                    ]),
            ])
            ->actions([
                // Quick Action: Mark as Served
                Action::make('mark_served')
                    ->label('Serve')
                    ->icon('heroicon-m-cake')
                    ->color('info')
                    ->requiresConfirmation()
                    ->action(fn (GuestOrder $record) => $record->update(['status' => 'served']))
                    ->hidden(fn (GuestOrder $record) => $record->status !== 'pending'),

                // Quick Action: Mark as Paid
                Action::make('mark_paid')
                    ->label('Paid')
                    ->icon('heroicon-m-banknotes')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(fn (GuestOrder $record) => $record->update(['status' => 'paid']))
                    ->hidden(fn (GuestOrder $record) => $record->status === 'paid'),

                EditAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
