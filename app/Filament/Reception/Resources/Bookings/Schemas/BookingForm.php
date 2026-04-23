<?php

namespace App\Filament\Reception\Resources\Bookings\Schemas;

use App\Enums\BookingStatus;
use App\Enums\BookingType;
use App\Models\Amenity;
use App\Models\Room;
use Carbon\Carbon;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\ToggleButtons;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Group;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Builder;

class BookingForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Grid::make(12)
                ->schema([
                    Group::make([
                        // --- SECTION 1: CORE CONFIGURATION ---
                        Section::make('Booking Type')
                            ->schema([
                                TextInput::make('booking_reference')
                                    ->label('Booking Reference')
                                    ->disabled()
                                    ->dehydrated(false)
                                    ->visible(fn ($context) => $context === 'edit')
                                    ->columnSpanFull(),

                                ToggleButtons::make('booking_type')
                                    ->label('What is the purpose of this booking?')
                                    ->options(BookingType::class)
                                    ->default(BookingType::Stay)
                                    ->disabled(fn (string $context) => $context === 'edit')
                                    ->live()
                                    ->required()
                                    ->columnSpanFull(),

                                Select::make('guest_id')
                                    ->relationship(
                                        name: 'guest',
                                        titleAttribute: 'name',
                                        modifyQueryUsing: fn (Builder $query, $record) => $query->whereDoesntHave('bookings', function (Builder $q) use ($record) {
                                            $q->whereIn('status', [BookingStatus::Pending, BookingStatus::CheckedIn]);
                                            if ($record) $q->where('id', '!=', $record->id);
                                        })
                                    )
                                    ->searchable()
                                    ->preload()
                                    ->required()
                                    ->disabled(fn (string $context) => $context === 'edit')
                                    ->createOptionForm([
                                        TextInput::make('name')->required(),
                                        TextInput::make('phone')->tel()->required(),
                                        TextInput::make('id_card_number')->required(),
                                    ])
                                    ->columnSpanFull(),
                            ]),

                        // --- SECTION 2: ROOM STAY UI (Visible only for Stay) ---
                        Section::make('Stay Information')
                            ->description('Manage overnight guest accommodations.')
                            ->icon('heroicon-m-moon')
                            ->visible(fn (Get $get) => $get('booking_type') === BookingType::Stay->value)
                            ->schema([
                                Grid::make(2)->schema([
                                    DateTimePicker::make('checked_in_at')
                                        ->label('Check-in Date & Time')
                                        ->required()
                                        ->disabled(fn (string $context) => $context === 'edit')
                                        ->live()
                                        ->afterStateUpdated(fn (Set $set, Get $get) => static::updateTotal($set, $get)),
                                    DateTimePicker::make('checked_out_at')
                                        ->label('Check-out Date & Time')
                                        ->required()
                                        ->disabled(fn (string $context) => $context === 'edit')
                                        ->live()
                                        ->afterStateUpdated(fn (Set $set, Get $get) => static::updateTotal($set, $get)),
                                    TextInput::make('adults_count')->label('Adults')->numeric()->default(1)->minValue(1),
                                    TextInput::make('children_count')->label('Children')->numeric()->default(0),
                                ]),
                            ]),

                        // --- SECTION 3: EVENT RENTAL UI (Visible only for Event) ---
                        Section::make('Event Venue Selection')
                            ->description('Manage hall rentals and event spaces.')
                            ->icon('heroicon-m-sparkles')
                            ->visible(fn (Get $get) => $get('booking_type') === BookingType::Event->value)
                            ->schema([
                                Grid::make(2)->schema([
                                    DateTimePicker::make('checked_in_at')
                                        ->label('Event Start Time')
                                        ->required()
                                        ->live()
                                        ->afterStateUpdated(fn (Set $set, Get $get) => static::updateTotal($set, $get)),
                                    DateTimePicker::make('checked_out_at')
                                        ->label('Event End Time')
                                        ->required()
                                        ->live()
                                        ->afterStateUpdated(fn (Set $set, Get $get) => static::updateTotal($set, $get)),
                                ]),
                            ]),

                        // --- SECTION 4: ROOM/HALL SELECTOR (Hidden for Walk-ins) ---
                        Section::make(fn (Get $get) => $get('booking_type') === BookingType::Event->value ? 'Halls & Spaces' : 'Assigned Rooms')
                            ->visible(fn (Get $get) => $get('booking_type') !== BookingType::WalkIn->value)
                            ->schema([
                                Select::make('rooms')
                                    ->hiddenLabel()
                                    ->relationship(
                                        name: 'rooms',
                                        titleAttribute: 'room_number',
                                        modifyQueryUsing: function (Builder $query, Get $get, $record) {
                                            $type = $get('booking_type');
                                            return $query->where(function ($q) use ($record) {
                                                    $q->where('is_occupied', false);
                                                    if ($record) $q->orWhereHas('bookings', fn ($inner) => $inner->where('bookings.id', $record->id));
                                                })
                                                ->when($type === BookingType::Event->value, fn ($q) => $q->whereHas('roomType', fn ($sq) => $sq->where('category', 'event')))
                                                ->when($type === BookingType::Stay->value, fn ($q) => $q->whereHas('roomType', fn ($sq) => $sq->where('category', '!=', 'hall')));
                                        }
                                    )
                                    ->multiple()
                                    ->preload()
                                    ->disabled(fn (string $context) => $context === 'edit')
                                    ->getOptionLabelFromRecordUsing(fn (Room $record) => "Room {$record->room_number} (XAF ".number_format($record->price_per_night, 0).') '.($record->is_occupied ? '🔴' : '🟢'))
                                    ->live()
                                    ->afterStateUpdated(fn (Set $set, Get $get) => static::updateTotal($set, $get))
                                    ->columnSpanFull(),
                            ]),

                        // --- SECTION 5: WALK-IN / AMENITIES UI ---
                        Section::make('Services & Amenities')
                            ->icon('heroicon-m-bolt')
                            ->description(fn (Get $get) => $get('booking_type') === BookingType::WalkIn->value ? 'Direct service sale for non-staying guests.' : 'Additional services for this guest.')
                            ->schema([
                                // For Walk-ins, we only need a single Visit Time
                                DateTimePicker::make('checked_in_at')
                                    ->label('Visit Date & Time')
                                    ->hidden(fn (Get $get) => $get('booking_type') !== BookingType::WalkIn->value)
                                    ->default(now())
                                    ->required()
                                    ->live(),

                                Repeater::make('amenityBookings')
                                    ->relationship('amenityBookings')
                                    ->schema([
                                        Select::make('amenity_id')
                                            ->options(Amenity::where('is_standalone', true)->pluck('name', 'id'))
                                            ->required()
                                            ->live()
                                            ->afterStateUpdated(fn($state, Set $set) => $set('price_at_booking', Amenity::find($state)?->price ?? 0)),
                                        TextInput::make('quantity')->numeric()->default(1)->required()->live(),
                                        TextInput::make('price_at_booking')->label('Unit Price')->prefix('XAF')->readOnly()->dehydrated(),
                                    ])
                                    ->columns(3)
                                    ->live()
                                    ->afterStateUpdated(fn (Set $set, Get $get) => static::updateTotal($set, $get))
                            ]),

                        Section::make('Additional Notes')
                            ->schema([
                                Textarea::make('notes')->placeholder('Preferences or event specifics...')->columnSpanFull(),
                            ]),
                    ])->columnSpan(8),

                    Group::make([
                        Section::make('Financial Summary')
                            ->schema([
                                TextInput::make('total_price')
                                    ->label('Total Cost')
                                    ->numeric()
                                    ->prefix('XAF')
                                    ->readOnly()
                                    ->dehydrated()
                                    ->extraAttributes(['class' => 'font-bold text-lg text-primary-600']),

                                Select::make('payment_status')
                                    ->options(['unpaid' => 'Unpaid', 'partial' => 'Partial Payment', 'paid' => 'Fully Paid'])
                                    ->required()
                                    ->default('unpaid'),

                                Placeholder::make('balance')
                                    ->label('Current Debt')
                                    ->content(function ($record, Get $get) {
                                        $total = (float) $get('total_price');
                                        $paid = $record ? $record->payments()->sum('amount') : 0;
                                        return 'XAF '.number_format($total - $paid, 0);
                                    })
                                    ->extraAttributes(['class' => 'text-danger-600 font-medium']),

                                ToggleButtons::make('status')
                                    ->options(BookingStatus::class)
                                    ->default(BookingStatus::Pending)
                                    ->required(),
                            ]),

                        Section::make('Initial Payment')
                            ->icon('heroicon-m-banknotes')
                            ->schema([
                                TextInput::make('deposit_amount')
                                    ->label('Amount Received')
                                    ->numeric()
                                    ->prefix('XAF')
                                    ->live()
                                    ->dehydrated(false)
                                    ->rules([
                                        fn (Get $get) => function (string $attribute, $value, $fail) use ($get) {
                                            if ((float) $value > (float) $get('total_price')) {
                                                $fail('Payment cannot exceed total cost.');
                                            }
                                        },
                                    ]),

                                Select::make('deposit_method')
                                    ->options(['cash' => 'Cash', 'credit_card' => 'Card', 'bank_transfer' => 'Bank Transfer'])
                                    ->dehydrated(false)
                                    ->requiredWith('deposit_amount'),

                                Placeholder::make('remaining_balance')
                                    ->label('Remaining to Pay')
                                    ->content(fn (Get $get) => 'XAF '.number_format((float) $get('total_price') - (float) $get('deposit_amount'), 0)),
                            ]),
                    ])->columnSpan(4),
                ])->columnSpanFull(),
        ]);
    }

    public static function updateTotal(Set $set, Get $get)
    {
        $grandTotal = 0;
        $type = $get('booking_type');

        // MODE 1: Rooms/Halls Logic
        if ($type !== BookingType::WalkIn->value) {
            $in = $get('checked_in_at');
            $out = $get('checked_out_at');
            $roomIds = $get('rooms');

            if ($in && $out && ! empty($roomIds)) {
                $nights = Carbon::parse($in)->startOfDay()->diffInDays(Carbon::parse($out)->startOfDay());
                $nights = $nights <= 0 ? 1 : $nights;
                $dailyRate = Room::whereIn('id', $roomIds)->sum('price_per_night');
                $grandTotal += ($dailyRate * $nights);
            }
        }

        // MODE 2: Amenities Logic (Always adds to total regardless of type)
        $amenityData = $get('amenityBookings') ?? [];
        foreach ($amenityData as $item) {
            $grandTotal += ((int)($item['quantity'] ?? 1) * (float)($item['price_at_booking'] ?? 0));
        }

        $set('total_price', $grandTotal);
    }
}
