<?php

namespace App\Filament\Reception\Resources\Bookings\Tables;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\Booking;
use App\Models\Payment;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Schemas\Components\Grid;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Carbon;
use Filament\Support\Enums\FontWeight;
use Illuminate\Support\Facades\DB;

class BookingsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('guest.name')
                    ->label('Guest')
                    ->searchable()
                    ->sortable()
                    ->weight(FontWeight::Bold),

                // Updated to show if it's a Stay vs Amenity Pass
                TextColumn::make('booking_type')
                    ->label('Booking Type')
                    ->badge(),

                TextColumn::make('rooms.room_number')
                    ->label('Rooms / Spaces')
                    ->badge()
                    ->color('gray')
                    ->placeholder('N/A'),

                // NEW: Column to show Gym, Pool, Spa, etc.
                TextColumn::make('amenityBookings.name')
                    ->label('Facilities Used')
                    ->listWithLineBreaks()
                    ->bulleted()
                    ->color('success')
                    ->placeholder('None')
                    ->toggleable(),

                TextColumn::make('checked_in_at')
                    ->label('Start / In')
                    ->dateTime('M d, H:i')
                    ->sortable(),

                TextColumn::make('status')
                    ->badge(),

                // 1. GUEST ORDERS (Food/Drink)
                TextColumn::make('guest_orders_sum_total_amount')
                    ->sum('guestOrders', 'total_amount')
                    ->label('Orders')
                    ->money('usd')
                    ->color('warning')
                    ->toggleable(),

                // 2. TOTAL PAID
                TextColumn::make('payments_sum_amount')
                    ->sum('payments', 'amount')
                    ->label('Paid')
                    ->money('usd')
                    ->color('success')
                    ->weight(FontWeight::Bold),

                // 3. UPDATED REMAINING BALANCE (Rooms + Orders + Amenities - Payments)
                TextColumn::make('balance_due')
                    ->label('Remaining')
                    ->money('usd')
                    ->state(function (Booking $record) {
                        $checkIn = Carbon::parse($record->checked_in_at ?? now());
                        $checkOut = Carbon::parse($record->checked_out_at ?? now());
                        $nights = max(1, $checkIn->startOfDay()->diffInDays($checkOut->startOfDay()));

                        // Calculate Room Total
                        $roomTotal = $record->rooms->sum('price_per_night') * ($record->type === 'walk_in' ? 0 : $nights);

                        // Calculate Amenity Total
                        $amenityTotal = $record->amenityBookings->sum(function ($amenity) {
                            return $amenity->pivot->price_at_booking * $amenity->pivot->quantity;
                        });

                        $ordersTotal = $record->guestOrders->sum('total_amount');
                        $paidTotal = $record->payments->sum('amount');

                        return ($roomTotal + $ordersTotal + $amenityTotal) - $paidTotal;
                    })
                    ->color(fn ($state) => $state > 0 ? 'danger' : 'success')
                    ->weight(FontWeight::Bold),

                TextColumn::make('total_price')
                    ->label('Grand Total')
                    ->money('usd')
                    ->alignEnd()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options(BookingStatus::class),
                SelectFilter::make('type')
                    ->options([
                        'stay' => 'Stay',
                        'walk_in' => 'Amenity Pass',
                    ]),
            ])
            ->actions([
                Action::make('check_in')
                    ->url(fn (Booking $record): string => "/reception/bookings/{$record->id}/edit")
                    ->icon('heroicon-m-arrow-right-end-on-rectangle')
                    ->visible(fn (Booking $record) => $record->status === BookingStatus::Pending)
                    ->color('success'),

                Action::make('check_out')
                    ->label('Check Out')
                    ->icon('heroicon-m-banknotes')
                    ->color('danger')
                    ->modalHeading('Finalize Bill & Payment')
                    ->form([
                        Grid::make(2)
                            ->schema([
                                DateTimePicker::make('checked_out_at')
                                    ->label('Actual Checkout Date/Time')
                                    ->default(now())
                                    ->required()
                                    ->native(false),

                                Select::make('payment_method')
                                    ->options([
                                        'cash' => 'Cash',
                                        'credit_card' => 'Credit Card',
                                        'mobile_money' => 'Mobile Money',
                                    ])
                                    ->default('cash')
                                    ->required(),
                            ]),
                    ])
                    ->visible(fn (Booking $record) => $record->status === BookingStatus::CheckedIn)
                 ->action(function (Booking $record, array $data) {
    DB::transaction(function () use ($record, $data) {
        $checkInAt = Carbon::parse($record->checked_in_at);
        $checkOutAt = Carbon::parse($data['checked_out_at']);

        // 1. Calculate Stay Duration
        $nights = max(1, $checkInAt->startOfDay()->diffInDays($checkOutAt->startOfDay()));

        // 2. Calculate Totals
        $roomTotal = $record->rooms()->sum('price_per_night') * ($record->booking_type === 'walk_in' ? 0 : $nights);
        $ordersTotal = $record->guestOrders()->sum('total_amount');

        // Sum amenities using the AmenityBooking model relationship
        $amenityTotal = $record->amenityBookings()->sum(DB::raw('price_at_booking * quantity'));

        $grandTotal = $roomTotal + $ordersTotal + $amenityTotal;

        // 3. Handle Final Payment
        $alreadyPaid = $record->payments()->sum('amount');
        $balanceDue = $grandTotal - $alreadyPaid;

        if ($balanceDue > 0) {
            $payment = $record->payments()->create([
                'amount' => $balanceDue,
                'payment_method' => $data['payment_method'],
                'status' => PaymentStatus::Completed,
                'type' => PaymentType::TOTAL,
                'paid_at' => now(),
            ]);

            // Link unpaid guest orders to this final payment
            $record->guestOrders()->whereNull('payment_id')->update([
                'payment_id' => $payment->id,
                'status' => 'paid' // Or use your PaymentStatus enum if applicable
            ]);
        }

        // 4. Finalize Booking Record
        $record->update([
            'status' => BookingStatus::CheckedOut,
            'checked_out_at' => $checkOutAt,
            'total_price' => $grandTotal,
        ]);

        // 5. Update Room Status (Freeing them up)
        $record->rooms()->update([
            'is_occupied' => false,
        ]);

        // Note: Room cleaning status logic can go here if needed
    });

    // Notify outside the transaction
    Notification::make()
        ->title('Check-out Complete')
        ->body("Final Bill: $" . number_format($record->total_price, 2))
        ->success()
        ->send();
  }),

                ActionGroup::make([
                    EditAction::make()
                    ->label('Modify Booking') // Changes the text
            ->icon('heroicon-m-pencil-square') // Changes the icon
            ->color('warning'),
                    DeleteAction::make(),
                ]),
            ])
            ->defaultSort('checked_in_at', 'desc');
    }
}
