<?php

namespace App\Filament\Reception\Resources\Payments\Tables;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use Filament\Actions\ViewAction;
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

                TextColumn::make('type')
                    ->badge(),

                TextColumn::make('guestOrders.items.item_name')
                    ->label('Orders Covered')
                    ->listWithLineBreaks()
                    ->bulleted()
                    ->placeholder('Room Only')
                    ->color('primary')
                    ->searchable(),

                TextColumn::make('amount')
                    ->label('Payment Amount')
                    ->money('XAF')
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
                SelectFilter::make('type')
                    ->options(PaymentType::class),
                SelectFilter::make('payment_method')
                    ->options([
                        'cash' => 'Cash',
                        'credit_card' => 'Credit Card',
                        'bank_transfer' => 'Bank Transfer',
                        'mobile_money' => 'Mobile Money',
                    ]),
                SelectFilter::make('status')
                    ->options(PaymentStatus::class),
            ])
            ->actions([
                ViewAction::make(),
            ])
            ->defaultSort('paid_at', 'desc');
    }
}
