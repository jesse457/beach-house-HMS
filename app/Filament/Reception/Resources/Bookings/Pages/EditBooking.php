<?php

namespace App\Filament\Reception\Resources\Bookings\Pages;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Filament\Reception\Resources\Bookings\BookingResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditBooking extends EditRecord
{
    protected static string $resource = BookingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }


     protected function afterSave(): void
    {
        // When updating, we must first make sure rooms
        // that were REMOVED from this booking are marked as vacant.
        // Then mark the new rooms as occupied.
  // 1. Get the data from the form
        $data = $this->form->getRawState();
        $booking = $this->record;

        if (! empty($data['deposit_amount']) && $data['deposit_amount'] > 0) {

            // 3. Create the related payment record
            $booking->payments()->create([
                'amount' => $data['deposit_amount'],
                'payment_method' => $data['deposit_method'],
                'type' => PaymentType::BOOKING,
                'status' => PaymentStatus::PARTIAL,
                'paid_at' => now(),
            ]);

            // 4. Update the Booking payment status automatically
            $total = (float) $booking->total_price;
            $deposit = (float) $data['deposit_amount'];

            if ($deposit >= $total) {
                $booking->update([
                    'status' => PaymentStatus::COMPLETED, ]);
            } else {
                $booking->update([PaymentStatus::PARTIAL]);
            }
        }
        // This is a safety check: Reset all rooms, then re-occupy based on active bookings
        \App\Models\Room::whereHas('bookings', function($q) {
            $q->where('bookings.id', $this->record->id);
        })->update(['is_occupied' => false]);

        $this->record->refresh(); // Get fresh data
        $this->record->updateRoomOccupancy();
    }
}
