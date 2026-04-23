<?php

namespace App\Filament\Reception\Resources\Bookings;

use App\Filament\Reception\Resources\Bookings\Pages\CreateBooking;
use App\Filament\Reception\Resources\Bookings\Pages\EditBooking;
use App\Filament\Reception\Resources\Bookings\Pages\ListBookings;
use App\Filament\Reception\Resources\Bookings\Schemas\BookingForm;
use App\Filament\Reception\Resources\Bookings\Tables\BookingsTable;
use App\Models\Booking;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class BookingResource extends Resource
{
    protected static ?string $model = Booking::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCalendarDays;

    protected static ?string $recordTitleAttribute = 'UserGuest';

    public static function form(Schema $schema): Schema
    {
        return BookingForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return BookingsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    // In BookingResource.php
public static function getRegistrationOptions(): array
{
    return [
        'afterCreate' => function ($record) {
             foreach ($record->rooms as $room) {
                 $record->rooms()->updateExistingPivot($room->id, [
                     'price_at_booking' => $room->price_per_night
                 ]);
             }
        }
    ];
}
    public static function getPages(): array
    {
        return [
            'index' => ListBookings::route('/'),
            'create' => CreateBooking::route('/create'),
            'edit' => EditBooking::route('/{record}/edit'),
        ];
    }
}
