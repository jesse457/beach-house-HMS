<?php

namespace App\Filament\Admin\Resources\Payments\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class PaymentInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Booking')
                    ->schema([
                        TextEntry::make('booking.guest.name')
                            ->label('Guest Name'),
                        TextEntry::make('booking_id')
                            ->label('Booking')
                            ->formatStateUsing(fn ($state) => "Booking #{$state}"),
                    ])->columns(2),

                Section::make('Payment Details')
                    ->schema([
                        TextEntry::make('amount')
                            ->money('XAF'),
                        TextEntry::make('type')
                            ->badge(),
                        TextEntry::make('payment_method')
                            ->formatStateUsing(fn (string $state): string => ucfirst(str_replace('_', ' ', $state)))
                            ->badge()
                            ->color('gray'),
                        TextEntry::make('status')
                            ->badge(),
                        TextEntry::make('paid_at')
                            ->label('Date Paid')
                            ->dateTime('M d, Y H:i'),
                        TextEntry::make('created_at')
                            ->dateTime('M d, Y H:i'),
                    ])->columns(2),
            ]);
    }
}
