<?php

namespace App\Filament\Admin\Resources\Payments\Tables;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
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

                TextColumn::make('type')
                    ->badge(),

                TextColumn::make('amount')
                    ->label('Amount')
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

                TextColumn::make('created_at')
                    ->dateTime('M d, Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('type')
                    ->options(PaymentType::class),
                SelectFilter::make('status')
                    ->options(PaymentStatus::class),
                SelectFilter::make('payment_method')
                    ->options([
                        'cash' => 'Cash',
                        'credit_card' => 'Credit Card',
                        'bank_transfer' => 'Bank Transfer',
                        'mobile_money' => 'Mobile Money',
                    ]),
            ])
            ->actions([
                EditAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('paid_at', 'desc');
    }
}
