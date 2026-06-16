<?php

namespace App\Filament\Reception\Resources\Bookings\Tables;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\Booking;
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
                    ->money('XAF')
                    ->color('warning')
                    ->toggleable(),

                // 2. TOTAL PAID
                TextColumn::make('payments_sum_amount')
                    ->sum('payments', 'amount')
                    ->label('Paid')
                    ->money('XAF')
                    ->color('success')
                    ->weight(FontWeight::Bold),

                // 3. REMAINING BALANCE
                TextColumn::make('balance_due')
                    ->label('Remaining')
                    ->money('XAF')
                    ->state(fn (Booking $record) => $record->balance_due)
                    ->color(fn ($state) => $state > 0 ? 'danger' : 'success')
                    ->weight(FontWeight::Bold),

                TextColumn::make('total_price')
                    ->label('Grand Total')
                    ->money('XAF')
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

Action::make('print_receipt')
    ->label('Print Receipt')
    ->icon('heroicon-m-printer')
    ->color('gray')
    // This assumes you have a route named 'bookings.receipt'
    ->url(fn (Booking $record): string => route('bookings.receipt', $record), shouldOpenInNewTab: true)
    ->visible(fn (Booking $record) => $record->status === BookingStatus::CheckedOut),

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
    $grandTotal = round(($record->total_price ?? 0) + $record->total_orders, 2);
    $balanceDue = $grandTotal - $record->total_paid;

    DB::transaction(function () use ($record, $data, $grandTotal, $balanceDue) {
        if ($balanceDue > 0) {
            $payment = $record->payments()->create([
                'amount' => $balanceDue,
                'payment_method' => $data['payment_method'],
                'status' => PaymentStatus::Completed,
                'type' => PaymentType::TOTAL,
                'paid_at' => now(),
            ]);

            $record->guestOrders()->whereNull('payment_id')->update([
                'payment_id' => $payment->id,
                'status' => 'paid',
            ]);
        }

        $record->update([
            'status' => BookingStatus::CheckedOut,
            'checked_out_at' => $data['checked_out_at'],
            'actual_checked_out_at' => $data['checked_out_at'],
            'total_price' => $grandTotal,
        ]);

        $record->rooms()->update([
            'is_occupied' => false,
            'status' => 'dirty',
        ]);
    });

    $message = "Final Bill: XAF " . number_format($record->total_price, 2);
    if ($balanceDue < 0) {
        $message .= ' — Credit of XAF ' . number_format(abs($balanceDue), 2);
    }

    Notification::make()
        ->title('Check-out Complete')
        ->body($message)
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
