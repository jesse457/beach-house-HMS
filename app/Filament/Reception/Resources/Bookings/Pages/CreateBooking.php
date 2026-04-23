<?php
namespace App\Filament\Reception\Resources\Bookings\Pages;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Filament\Reception\Resources\Bookings\BookingResource;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\DB;

class CreateBooking extends CreateRecord
{
    protected static string $resource = BookingResource::class;

    protected function afterCreate(): void
    {
        DB::transaction(function () {
            $data = $this->form->getRawState();
            $booking = $this->record;

            if (! empty($data['deposit_amount']) && (float)$data['deposit_amount'] > 0) {
                $total = (float) $booking->total_price;
                $deposit = (float) $data['deposit_amount'];

                // Determine status before creation
                $status = ($deposit >= $total) ? PaymentStatus::Completed : PaymentStatus::Partial;

                // Create the payment
                $booking->payments()->create([
                    'amount' => $deposit,
                    'payment_method' => $data['deposit_method'],
                    'type' => PaymentType::BOOKING,
                    'status' => $status,
                    'paid_at' => now(),
                    'user_id' => auth()->id() ?? 1,
                ]);
            }

            // Sync room occupancy within the same transaction
            $booking->updateRoomOccupancy();
        });
    }
}
