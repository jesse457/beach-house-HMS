<?php

namespace App\Filament\Reception\Resources\Payments\Schemas;

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
                            // When booking is selected, we could auto-fill the amount with balance due
                            ->afterStateUpdated(function ($state, Set $set) {
                                if ($state) {
                                    $booking = \App\Models\Booking::find($state);
                                    $paid = $booking->payments()->sum('amount');
                                    $set('amount', $booking->total_price - $paid);
                                }
                            }),

                        TextInput::make('amount')
                            ->required()
                            ->numeric()
                            ->prefix('$')
                            ->maxValue(1000000),

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
                            ->options([
                                'pending' => 'Pending',
                                'completed' => 'Completed',
                                'failed' => 'Failed',
                            ])
                            ->default('completed')
                            ->required(),

                        DateTimePicker::make('paid_at')
                            ->default(now())
                            ->required()
                            ->native(false),
                    ])->columns(2),
            ]);
    }
}
