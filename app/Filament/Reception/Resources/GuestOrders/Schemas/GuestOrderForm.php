<?php

namespace App\Filament\Reception\Resources\GuestOrders\Schemas;

use App\Enums\BookingStatus;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Grid;
use Filament\Forms\Components\ToggleButtons;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Builder;
use Filament\Schemas\Components\Utilities\Set;

class GuestOrderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Grid::make(12)
                ->schema([
                    // LEFT COLUMN: Order Details (Span 8)
                    Grid::make(1)
                        ->schema([
                            Section::make('Guest & Room Information')
                                ->icon('heroicon-m-user-circle')
                                ->schema([
                                    Select::make('booking_id')
                                        ->relationship(
                                            name: 'booking',
                                            titleAttribute: 'id',
                                            modifyQueryUsing: fn (Builder $query) => $query->where('status', BookingStatus::CheckedIn)
                                        )
                                        ->getOptionLabelFromRecordUsing(fn ($record) => "Room {$record->rooms->first()?->room_number} - " . ($record->guest->name ?? 'Unknown'))
                                        ->searchable()
                                        ->preload()
                                        ->required()
                                        ->live()
                                        ->label('Active Guest'),
                                ]),

                            Section::make('Order Items')
                                ->icon('heroicon-m-shopping-bag')
                                ->schema([
                                    Repeater::make('items')
                                        ->relationship('items')
                                        ->schema([
                                            Grid::make(12)->schema([
                                                Select::make('category')
                                                    ->options(['drink' => 'Drink', 'food' => 'Food', 'service' => 'Service', 'other' => 'Other'])
                                                    ->required()->columnSpan(2),
                                                TextInput::make('item_name')->required()->placeholder('Item name')->columnSpan(3),
                                                TextInput::make('unit_price')->numeric()->prefix('XAF')->required()->live(onBlur: true)
                                                    ->afterStateUpdated(fn (Get $get, Set $set) => self::updateTotals($get, $set))->columnSpan(2),
                                                TextInput::make('quantity')->numeric()->default(1)->required()->live(onBlur: true)
                                                    ->afterStateUpdated(fn (Get $get, Set $set) => self::updateTotals($get, $set))->columnSpan(2),
                                                TextInput::make('total_price')->label('Subtotal')->numeric()->prefix('XAF')->readOnly()->dehydrated()->columnSpan(3),
                                            ]),
                                        ])
                                        ->live()
                                        ->afterStateUpdated(fn (Get $get, Set $set) => self::calculateGrandTotal($get, $set))
                                        ->itemLabel(fn (array $state): ?string => $state['item_name'] ?? 'New Item'),
                                ]),
                        ])->columnSpan(8),

                    // RIGHT COLUMN: Summary & Payment (Span 4)
                    Grid::make(1)
                        ->schema([
                            Section::make('Order Summary')
                                ->icon('heroicon-m-calculator')
                                ->schema([
                                    TextInput::make('total_amount')
                                        ->label('Grand Total')
                                        ->numeric()
                                        ->prefix('XAF')
                                        ->readOnly()
                                        ->live()
                                        ->extraAttributes(['class' => 'font-bold text-xl text-primary-600']),

                                    ToggleButtons::make('status')
                                        ->options(['pending' => 'Pending', 'served' => 'Served', 'paid' => 'Paid'])
                                        ->default('pending')
                                        ->inline()
                                        ->required(),
                                ]),

                            Section::make('Process Payment Now')
                                ->description('Record payment for this specific order.')
                                ->icon('heroicon-m-banknotes')
                                ->schema([
                                    TextInput::make('payment_amount')
                                        ->label('Amount Paid')
                                        ->numeric()
                                        ->prefix('XAF')
                                        ->live()
                                        ->placeholder(fn(Get $get) => $get('total_amount'))
                                        ->dehydrated(), // Important: passes value to Page class

                                    Select::make('payment_method')
                                        ->options(['cash' => 'Cash', 'credit_card' => 'Credit Card', 'bank_transfer' => 'Bank Transfer'])
                                        ->requiredWith('payment_amount')
                                        ->dehydrated(),

                                    Placeholder::make('payment_hint')
                                        ->content('Filling this will create a new Payment receipt.')
                                        ->extraAttributes(['class' => 'text-xs italic text-gray-500']),
                                ]),
                        ])->columnSpan(4),
                ])->columnSpan(['default' => 12, 'lg' => 4]),
        ]);
    }

    public static function updateTotals(Get $get, Set $set): void
    {
        $unitPrice = (float) ($get('unit_price') ?? 0);
        $quantity = (float) ($get('quantity') ?? 0);
        $set('total_price', number_format($unitPrice * $quantity, 2, '.', ''));
        self::calculateGrandTotal($get, $set);
    }

    public static function calculateGrandTotal(Get $get, Set $set): void
    {
        $items = $get('../../items') ?? $get('items') ?? [];
        $grandTotal = collect($items)->reduce(fn ($carry, $item) => $carry + (float) ($item['total_price'] ?? 0), 0);

        $set('../../total_amount', number_format($grandTotal, 2, '.', ''));
        $set('total_amount', number_format($grandTotal, 2, '.', ''));
    }
}
