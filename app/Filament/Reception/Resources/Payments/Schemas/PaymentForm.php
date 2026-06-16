<?php

namespace App\Filament\Reception\Resources\Payments\Schemas;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;

class PaymentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Payment Details')
                    ->schema([
                        Select::make('booking_id')
                            ->relationship('booking', 'id')
                            ->getOptionLabelFromRecordUsing(fn ($record) =>
                                "Booking #{$record->id} - Guest: {$record->guest->name} (Room: " . ($record->rooms->first()->room_number ?? 'N/A') . ")"
                            )
                            ->searchable()
                            ->preload()
                            ->required()
                            ->live()
                            ->afterStateUpdated(function ($state, Set $set) {
                                if ($state) {
                                    $booking = \App\Models\Booking::find($state);
                                    $set('amount', $booking->balance_due);
                                }
                            }),

                        TextInput::make('amount')
                            ->required()
                            ->numeric()
                            ->prefix('XAF'),

                        Select::make('type')
                            ->options(PaymentType::class)
                            ->default(PaymentType::BOOKING)
                            ->required(),

                        Select::make('payment_method')
                            ->options([
                                'cash' => 'Cash',
                                'credit_card' => 'Credit Card',
                                'bank_transfer' => 'Bank Transfer',
                                'mobile_money' => 'Mobile Money',
                            ])
                            ->required()
                            ->native(false),

                        Select::make('status')
                            ->options(PaymentStatus::class)
                            ->default(PaymentStatus::Completed)
                            ->required(),

                        DateTimePicker::make('paid_at')
                            ->default(now())
                            ->required()
                            ->native(false),
                    ])->columns(2),
            ]);
    }
}
