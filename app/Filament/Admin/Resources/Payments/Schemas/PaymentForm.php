<?php

namespace App\Filament\Admin\Resources\Payments\Schemas;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class PaymentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('booking_id')
                    ->relationship('booking', 'id')
                    ->required(),
                TextInput::make('amount')
                    ->required()
                    ->numeric(),
                TextInput::make('payment_type')
                    ->required()
                    ->default('room_charge'),
                Select::make('type')
                    ->options(PaymentType::class)
                    ->required(),
                TextInput::make('payment_method')
                    ->required(),
                Select::make('status')
                    ->options(PaymentStatus::class)
                    ->default('completed')
                    ->required(),
                DateTimePicker::make('paid_at'),
            ]);
    }
}
