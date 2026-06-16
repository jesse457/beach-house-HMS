<?php

namespace App\Filament\Reception\Resources\Bookings\Pages;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Filament\Reception\Resources\Bookings\BookingResource;
use App\Models\Room;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\DB;

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
        $data = $this->form->getRawState();
        $booking = $this->record;
        DB::transaction(function () use ($booking, $data) {
            // 1. Handle New Payment/Deposit creation
            if (! empty($data['deposit_amount']) && $data['deposit_amount'] > 0) {

                // Calculate total already paid (including this new amount)
                $alreadyPaid = $booking->payments()->sum('amount') + (float) $data['deposit_amount'];
                $totalBill = (float) $booking->total_price;

                // Determine status for THIS specific payment record
                // If this payment clears the bill, it's Completed, otherwise it's Partial
                $newPaymentStatus = ($alreadyPaid >= $totalBill)
                    ? PaymentStatus::Completed
                    : PaymentStatus::Partial;

                // Create the single payment record
                $booking->payments()->create([
                    'amount' => $data['deposit_amount'],
                    'payment_method' => $data['deposit_method'] ?? 'Cash',
                    'type' => PaymentType::BOOKING,
                    'status' => $newPaymentStatus,
                    'paid_at' => now(),
                ]);
            }

            // 2. Room Occupancy Management
            // When editing, some rooms might have been removed.
            // First, mark ALL rooms previously associated with this booking as vacant.
            DB::table('rooms')
                ->whereIn('id', function ($query) use ($booking) {
                    $query->select('room_id')
                        ->from('booking_room')
                        ->where('booking_id', $booking->id);
                })
                ->update(['is_occupied' => false]);

            // 3. Re-apply occupancy based on current status
            $booking->refresh(); // Refresh to get the updated rooms from pivot table
            $booking->updateRoomOccupancy();
        });
    }
}
