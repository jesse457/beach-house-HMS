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
Route::post('/bookings', function (Request $request) {
    $validated = $request->validate([
        'room_ids'       => 'required|array|min:1', // Handle multiple rooms from cart
        'room_ids.*'     => 'exists:rooms,id',
        'name'           => 'required|string|max:255',
        'email'          => 'required|email',
        'phone'          => 'required|string',
        'address'        => 'required|string',
        'id_card_number' => 'required|string',
        'checked_in_at'  => 'required|date|after_or_equal:today',
        'checked_out_at' => 'required|date|after:checked_in_at',
    ]);

    // 1. Find or create the guest
    $guest = Guest::firstOrCreate(
        ['email' => $validated['email']],
        [
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'id_card_number' => $validated['id_card_number'],
        ]
    );

    // 2. Calculate Dates
    $checkIn = Carbon::parse($validated['checked_in_at']);
    $checkOut = Carbon::parse($validated['checked_out_at']);
    $days = $checkIn->diffInDays($checkOut);
    if ($days <= 0) $days = 1;

    // 3. Calculate Total Price for all rooms in cart
    $rooms = Room::findMany($validated['room_ids']);
    $totalPrice = 0;
    foreach ($rooms as $room) {
        $totalPrice += ($room->price_per_night * $days);
    }

    // 4. Create the main Booking record
    $booking = Booking::create([
        'guest_id'       => $guest->id,
        'status'         => BookingStatus::Pending,
        'total_price'    => $totalPrice,
        'checked_in_at'  => $validated['checked_in_at'],
        'checked_out_at' => $validated['checked_out_at'],
    ]);

    // 5. Attach all rooms and lock price at time of booking
    foreach ($rooms as $room) {
        $booking->rooms()->attach($room->id, [
            'price_at_booking' => $room->price_per_night * $days
        ]);

        // Mark room as occupied immediately (Optional: depends on your business logic)
        $room->update(['is_occupied' => true]);
    }

    return redirect()->route('home')->with('success', 'Your luxury stay is booked!');
})->name('bookings.store');
