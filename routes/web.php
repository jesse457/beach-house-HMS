<?php

use App\Enums\BookingStatus;
use App\Http\Controllers\MainController;
use App\Http\Controllers\RoomController;
use Illuminate\Http\Request;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Guest;
use App\Models\Booking;
use App\Models\TeamMember;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Carbon\Carbon;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

/**
 * HOME PAGE
 */
Route::get('/',[MainController::class,'index'])->name('home');

/**
 * ROOMS INDEX (With Advanced Filtering)
 * This matches your React localFilters state: { type, max_price, available_only }
 */
Route::get('/rooms', [RoomController::class,'index'])->name('rooms.index');


Route::get('/gallery',[MainController::class,'gallery']);


Route::get('/team', function (Request $request) {
 return Inertia::render('Main/Team', [
        'members' => TeamMember::orderBy('sort_order')->get(),
        'followedIds' => auth()->user() ? auth()->user()->following()->pluck('team_member_id') : []
    ]);
});

Route::get('/location', function (Request $request) {
    return Inertia::render('Main/Location');
});
/**
 * ROOM DETAILS
 */
Route::get('/rooms/{room}',[RoomController::class,'show'])->name('rooms.show');

/**
 * CHECKOUT PAGE
 * Handles the "Cart" view before final submission
 */
Route::get('/checkout', function () {
    return Inertia::render('Bookings/Create');
})->name('checkout');

/**
 * PROCESS BOOKING (Multi-room Support)
 */
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

Route::post('/bookings', function (Request $request) {
    // 1. Validation with custom messages
    try {
        $validated = $request->validate([
            'room_ids'       => 'required|array|min:1',
            'room_ids.*'     => 'exists:rooms,id',
            'name'           => 'required|string|max:255',
            'email'          => 'required|email',
            'phone'          => 'required|string',
            'address'        => 'required|string',
            'id_card_number' => 'required|string',
            'checked_in_at'  => 'required|date|after_or_equal:today',
            'checked_out_at' => 'required|date|after:checked_in_at',
        ], [
            'room_ids.required' => 'Your cart is empty. Please select at least one room.',
            'checked_in_at.after_or_equal' => 'The check-in date cannot be in the past.',
            'checked_out_at.after' => 'Check-out date must be after the check-in date.',
        ]);
    } catch (ValidationException $e) {
        return redirect()->back()
            ->withErrors($e->validator)
            ->withInput()
            ->with('error', 'Please fix the errors in the form.');
    }

    // Start a Transaction to ensure data integrity
    DB::beginTransaction();

    try {
        // 2. Room Availability Check (Critical for UX)
        $rooms = Room::whereIn('id', $validated['room_ids'])->get();

        foreach ($rooms as $room) {
            if ($room->is_occupied) {
                return redirect()->back()
                    ->withInput()
                    ->with('error', "Sorry, Room {$room->room_number} was just booked by someone else.");
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

        // 4. Calculate Duration
        $checkIn = Carbon::parse($validated['checked_in_at']);
        $checkOut = Carbon::parse($validated['checked_out_at']);
        $days = $checkIn->diffInDays($checkOut);
        if ($days <= 0) $days = 1;

        // 5. Calculate Total Price
        $totalPrice = 0;
        foreach ($rooms as $room) {
            $totalPrice += ($room->price_per_night * $days);
        }

        // 6. Create the main Booking record
        $booking = Booking::create([
            'guest_id'       => $guest->id,
            'status'         => BookingStatus::Pending, // Using your Enum
            'booking_type'   => \App\Enums\BookingType::Stay, // Defaulting to stay
            'total_price'    => $totalPrice,
            'checked_in_at'  => $validated['checked_in_at'],
            'checked_out_at' => $validated['checked_out_at'],
        ]);

        // 7. Attach Rooms & Update Status
        foreach ($rooms as $room) {
            $booking->rooms()->attach($room->id, [
                'price_at_booking' => $room->price_per_night * $days
            ]);

            // Update room status
            $room->update(['is_occupied' => true]);
        }

        DB::commit(); // Save everything to DB

        return redirect()->route('home')->with('success', 'Thank you! Your luxury stay has been booked successfully.');

    } catch (\Exception $e) {
        DB::rollBack(); // Undo any DB changes if something crashed

        // Log the actual error for the developer
        Log::error("Booking Error: " . $e->getMessage());

        return redirect()->back()
            ->withInput()
            ->with('error', 'An unexpected error occurred while processing your booking. Please try again or contact support.');
    }
})->name('bookings.store');


Route::get('/bookings/{booking}/receipt', function (Booking $booking) {
    return view('receipts.booking', ['booking' => $booking]);
})->name('bookings.receipt');
