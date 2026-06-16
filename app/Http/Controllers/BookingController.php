<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Enums\BookingType;
use App\Models\Booking;
use App\Models\Guest;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validation
        $validated = $request->validate([
            'room_ids' => 'required|array|min:1',
            'room_ids.*' => 'exists:rooms,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string',
            'address' => 'required|string',
            'id_card_number' => 'required|string',
            'checked_in_at' => 'required|date|after_or_equal:yesterday',
            'checked_out_at' => 'required|date|after:checked_in_at',
            'adults_count' => 'required|integer|min:1',
            'children_count' => 'required|integer|min:0',
            'notes' => 'nullable|string',
        ], [
            'room_ids.required' => 'Your cart is empty. Please select at least one room.',
            'checked_in_at.after_or_equal' => 'The check-in date cannot be in the past.',
            'checked_out_at.after' => 'Check-out date must be after the check-in date.',
        ]);

        // Enable query logging for debugging (remove in production)
        // DB::enableQueryLog();

        DB::beginTransaction();

        try {
            Log::info('Booking process started', [
                'email' => $validated['email'],
                'room_ids' => $validated['room_ids'],
                'check_in' => $validated['checked_in_at'],
                'check_out' => $validated['checked_out_at'],
            ]);

            // 2. Room Availability Check (with locking for concurrency safety)
            $rooms = Room::whereIn('id', $validated['room_ids'])->lockForUpdate()->get();

            if ($rooms->count() !== count($validated['room_ids'])) {
                throw new \Exception('One or more selected rooms no longer exist.');
            }

            foreach ($rooms as $room) {
                if ($room->is_occupied) {
                    DB::rollBack();
                    Log::warning('Room already occupied', ['room_id' => $room->id, 'room_number' => $room->room_number]);
                    return back()->withErrors([
                        'room_ids' => "Sorry, Room {$room->room_number} was just booked by someone else."
                    ])->withInput();
                }
            }

            // 3. Find or create the guest
            $guest = Guest::firstOrCreate(
                ['email' => $validated['email']],
                [
                    'name' => $validated['name'],
                    'phone' => $validated['phone'],
                    'address' => $validated['address'],
                    'id_card_number' => $validated['id_card_number'],
                ]
            );
            Log::info('Guest resolved', ['guest_id' => $guest->id, 'is_new' => $guest->wasRecentlyCreated]);

            // 4. Calculate Duration
            $checkIn = Carbon::parse($validated['checked_in_at']);
            $checkOut = Carbon::parse($validated['checked_out_at']);
            $days = max(1, $checkIn->startOfDay()->diffInDays($checkOut->startOfDay()));

            // 5. Calculate Total Price
            $totalPrice = round($rooms->sum('price_per_night') * $days, 2);

            // 6. Create the main Booking record
            $booking = Booking::create([
                'guest_id' => $guest->id,
                'status' => BookingStatus::Pending,
                'booking_type' => BookingType::Stay,
                'total_price' => $totalPrice,
                'checked_in_at' => $validated['checked_in_at'],
                'checked_out_at' => $validated['checked_out_at'],
                'adults_count' => $validated['adults_count'],
                'children_count' => $validated['children_count'],
                'notes' => $validated['notes'] ?? null,
            ]);
            Log::info('Booking record created', ['booking_id' => $booking->id, 'reference' => $booking->booking_reference]);

            // 7. Attach Rooms & Update Occupancy Status (INSIDE transaction)
            foreach ($rooms as $room) {
                $priceAtBooking = round($room->price_per_night * $days, 2);

                $booking->rooms()->attach($room->id, [
                    'price_at_booking' => $priceAtBooking,
                ]);

                // ✅ Update occupancy HERE - not in model event
                $room->update(['is_occupied' => true]);

                Log::info('Room attached and marked occupied', [
                    'room_id' => $room->id,
                    'booking_id' => $booking->id,
                    'price_at_booking' => $priceAtBooking
                ]);
            }

         

            // ✅ All operations successful - commit transaction
            DB::commit();

            // Optional: Log queries for debugging
            // Log::info('Booking queries', DB::getQueryLog());

            Log::info('Booking completed successfully', [
                'booking_id' => $booking->id,
                'reference' => $booking->booking_reference,
                'total' => $totalPrice
            ]);

            return back()->with('success', 'Thank you! Your luxury stay has been booked successfully. Reference: ' . $booking->booking_reference);

        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollBack();
            Log::error('Database error during booking: ' . $e->getMessage(), [
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors([
                'general' => 'A database error occurred. Please try again or contact support.'
            ])->withInput();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Unexpected error during booking: ' . $e->getMessage(), [
                'file' => $e->getFile() . ':' . $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->only(['email', 'room_ids', 'checked_in_at', 'checked_out_at'])
            ]);
            return back()->withErrors([
                'general' => 'An unexpected error occurred: ' . (app()->environment('local') ? $e->getMessage() : 'Please try again or contact support.')
            ])->withInput();
        }
    }
}
