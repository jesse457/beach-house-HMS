<?php

namespace App\Filament\Reception\Resources\Payments\Tables;

use App\Enums\PaymentStatus;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\Summarizers\Sum;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Filament\Support\Enums\FontWeight;

class PaymentsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('booking.guest.name')
                    ->label('Guest Name')
                    ->searchable()
                    ->sortable()
                    ->weight(FontWeight::Bold)
                    ->description(fn ($record) => "Booking #{$record->booking_id}"),

                TextColumn::make('booking.rooms.room_number')
                    ->label('Room(s)')
                    ->badge()
                    ->color('info')
                    ->separator(', '),

                // NEW: This column shows what was ordered in this payment session
                TextColumn::make('guestOrders.items.item_name')
                    ->label('Orders Covered')
                    ->listWithLineBreaks()
                    ->bulleted()
                    ->placeholder('Room Only') // If no orders are linked to this specific payment
                    ->color('primary')
                    ->searchable(),

                TextColumn::make('amount')
                    ->label('Payment Amount')
                    ->money('usd')
                    ->sortable()
                    ->weight(FontWeight::Bold)
                    ->summarize(Sum::make()->label('Total Revenue')),

                TextColumn::make('payment_method')
                    ->formatStateUsing(fn (string $state): string => ucfirst(str_replace('_', ' ', $state)))
                    ->badge()
                    ->color('gray'),

               TextColumn::make('status')
    ->badge(),

                TextColumn::make('paid_at')
                    ->label('Date Paid')
                    ->dateTime('M d, Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('payment_method')
                    ->options([
                        'cash' => 'Cash',
                        'credit_card' => 'Credit Card',
                        'bank_transfer' => 'Bank Transfer',
                    ]),
                SelectFilter::make('status')
                    ->options([
                        'paid' => 'Paid',
                        'partial' => 'Partial',
                        'failed' => 'Failed',
                    ]),
            ])

            ->defaultSort('paid_at', 'desc');
    }
}
