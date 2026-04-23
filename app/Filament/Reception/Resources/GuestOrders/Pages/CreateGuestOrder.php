<?php

namespace App\Filament\Reception\Resources\GuestOrders\Pages;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Filament\Reception\Resources\GuestOrders\GuestOrderResource;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\DB;

class CreateGuestOrder extends CreateRecord
{
    protected static string $resource = GuestOrderResource::class;

    protected function afterCreate(): void
{
    $data = $this->form->getRawState();
    $order = $this->record;

    // Check if the user filled out the "Process Payment Now" fields
    if (!empty($data['payment_amount']) && (float)$data['payment_amount'] > 0) {

        // Wrap the payment and update logic in a transaction
        DB::transaction(function () use ($data, $order) {

            // 1. Create a Payment record linked to the Booking
            // Note: We use $order->booking_id to associate the order's payment with the main stay
            $payment = \App\Models\Payment::create([
                'booking_id'     => $order->booking_id,
                'amount'         => $data['payment_amount'],
                'payment_method' => $data['payment_method'],
                'status'         => PaymentStatus::Completed, // Ensure this matches your Enum case
                'type'           => PaymentType::ORDER,     // Ensure this matches your Enum case
                'paid_at'        => now(),
            ]);

            // 2. Link this specific order to that payment
            // 3. Update order status to 'paid'
            $order->update([
                'payment_id' => $payment->id,
                'status'     => 'paid'
            ]);
        });
    }
}

}
