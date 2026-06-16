<?php

use App\Enums\BookingStatus;
use App\Enums\BookingType;
use App\Models\Amenity;
use App\Models\AmenityBooking;
use App\Models\Booking;
use App\Models\Guest;
use App\Models\GuestOrder;
use App\Models\GuestOrderItem;
use App\Models\Payment;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ============================================
// Booking Model Casts & Attributes
// ============================================

test('booking casts status to BookingStatus enum', function () {
    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create(['status' => BookingStatus::Pending]);

    expect($booking->status)->toBeInstanceOf(BookingStatus::class);
    expect($booking->status)->toBe(BookingStatus::Pending);
});

test('booking casts booking_type to BookingType enum', function () {
    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create(['booking_type' => BookingType::Stay]);

    expect($booking->booking_type)->toBeInstanceOf(BookingType::class);
    expect($booking->booking_type)->toBe(BookingType::Stay);
});

test('booking casts total_price to decimal', function () {
    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create(['total_price' => 299.99]);

    // Decimal cast returns string in PHP — compare as float
    expect((float) $booking->total_price)->toBe(299.99);
});

test('booking casts dates to datetime', function () {
    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create([
            'checked_in_at' => '2026-06-01',
            'checked_out_at' => '2026-06-05',
        ]);

    expect($booking->checked_in_at)->toBeInstanceOf(\Carbon\Carbon::class);
    expect($booking->checked_out_at)->toBeInstanceOf(\Carbon\Carbon::class);
});

// ============================================
// Booking Auto-Generated Booking Reference
// ============================================

test('booking auto-generates booking reference on create', function () {
    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create();

    expect($booking->booking_reference)->not->toBeNull();
    expect($booking->booking_reference)->toStartWith('BK-');
    expect(strlen($booking->booking_reference))->toBe(9); // BK- + 6 chars
});

test('booking reference is unique uppercase string', function () {
    $booking1 = Booking::factory()->for(Guest::factory())->create();
    $booking2 = Booking::factory()->for(Guest::factory())->create();

    expect($booking1->booking_reference)->not->toBe($booking2->booking_reference);
    expect($booking1->booking_reference)->toBe(strtoupper($booking1->booking_reference));
});

// ============================================
// Booking Nights Calculation
// ============================================

test('booking nights calculates correctly for multi-day stay', function () {
    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create([
            'checked_in_at' => '2026-06-01',
            'checked_out_at' => '2026-06-05',
        ]);

    expect($booking->nights)->toBe(4); // 4 nights
});

test('booking nights returns 1 for same-day check-in and check-out', function () {
    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create([
            'checked_in_at' => '2026-06-01',
            'checked_out_at' => '2026-06-01',
        ]);

    expect($booking->nights)->toBe(1);
});

test('booking nights returns 0 when dates are null', function () {
    // Create with valid dates first, then manually nullify via raw attributes
    // because the DB has NOT NULL constraints on date columns
    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create([
            'checked_in_at' => now(),
            'checked_out_at' => now()->addDay(),
        ]);

    // Use raw setter to bypass casting and test the null guard
    $booking->setRawAttributes(array_merge(
        $booking->getRawOriginal(),
        ['checked_in_at' => null, 'checked_out_at' => null]
    ));

    expect($booking->nights)->toBe(0);
});

// ============================================
// Booking Auto-Set Actual Dates on Status Change
// ============================================

test('booking sets actual_checked_in_at when status changes to CheckedIn', function () {
    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create(['status' => BookingStatus::Pending]);

    expect($booking->actual_checked_in_at)->toBeNull();

    $booking->status = BookingStatus::CheckedIn;
    $booking->save();

    expect($booking->actual_checked_in_at)->not->toBeNull();
    expect($booking->actual_checked_in_at)->toBeInstanceOf(\Carbon\Carbon::class);
});

test('booking sets actual_checked_out_at when status changes to CheckedOut', function () {
    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create(['status' => BookingStatus::CheckedIn]);

    $booking->status = BookingStatus::CheckedOut;
    $booking->save();

    expect($booking->actual_checked_out_at)->not->toBeNull();
});

// ============================================
// Booking Billing Logic — calculateTotalBill()
// ============================================

test('calculateTotalBill sums room prices multiplied by nights', function () {
    $roomType = RoomType::factory()->create();
    $room1 = Room::factory()->for($roomType)->create(['price_per_night' => 100]);
    $room2 = Room::factory()->for($roomType)->create(['price_per_night' => 150]);

    $guest = Guest::factory()->create();
    $booking = Booking::factory()
        ->for($guest)
        ->create([
            'checked_in_at' => '2026-06-01',
            'checked_out_at' => '2026-06-04', // 3 nights
            'booking_type' => BookingType::Stay,
            'total_price' => 750,
        ]);

    $booking->rooms()->attach([$room1->id, $room2->id], ['price_at_booking' => 0]);

    // (100 + 150) * 3 nights = 750
    expect($booking->calculateTotalBill())->toBe(750.00);
});

test('calculateTotalBill excludes room cost for WalkIn type', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create(['price_per_night' => 200]);

    $guest = Guest::factory()->create();
    $booking = Booking::factory()
        ->for($guest)
        ->create([
            'checked_in_at' => '2026-06-01',
            'checked_out_at' => '2026-06-02',
            'booking_type' => BookingType::WalkIn,
            'total_price' => 0,
        ]);

    $booking->rooms()->attach($room->id, ['price_at_booking' => 0]);

    expect($booking->calculateTotalBill())->toBe(0.00);
});

test('calculateTotalBill includes guest orders and amenity bookings', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create(['price_per_night' => 100]);

    $guest = Guest::factory()->create();
    $booking = Booking::factory()
        ->for($guest)
        ->create([
            'checked_in_at' => '2026-06-01',
            'checked_out_at' => '2026-06-03', // 2 nights
            'booking_type' => BookingType::Stay,
            'total_price' => 200,
        ]);

    $booking->rooms()->attach($room->id, ['price_at_booking' => 0]);

    // Add guest orders
    $order = GuestOrder::factory()
        ->for($booking)
        ->create(['total_amount' => 75.50]);

    // Add amenity bookings
    $amenity = Amenity::factory()->create(['price' => 30, 'is_standalone' => true]);
    $amenityBooking = new AmenityBooking([
        'booking_id' => $booking->id,
        'amenity_id' => $amenity->id,
        'price_at_booking' => 30,
        'quantity' => 2,
    ]);
    $amenityBooking->save();

    // Room: 100 * 2 = 200 + Orders: 75.50 + Amenities: 30 * 2 = 60 = 335.50
    expect($booking->calculateTotalBill())->toBe(335.50);
});

test('calculateTotalBill subtracts discount amount', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create(['price_per_night' => 100]);

    $guest = Guest::factory()->create();
    $booking = Booking::factory()
        ->for($guest)
        ->create([
            'checked_in_at' => '2026-06-01',
            'checked_out_at' => '2026-06-02', // 1 night
            'booking_type' => BookingType::Stay,
            'discount_amount' => 20,
            'total_price' => 80,
        ]);

    $booking->rooms()->attach($room->id, ['price_at_booking' => 0]);

    // 100 * 1 - 20 discount = 80
    expect($booking->calculateTotalBill())->toBe(80.00);
});

// ============================================
// Booking Balance Due
// ============================================

test('balanceDue calculates correctly with payments', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create(['price_per_night' => 200]);

    $guest = Guest::factory()->create();
    $booking = Booking::factory()
        ->for($guest)
        ->create([
            'checked_in_at' => '2026-06-01',
            'checked_out_at' => '2026-06-03',
            'total_price' => 400,
        ]);

    $booking->rooms()->attach($room->id, ['price_at_booking' => 0]);

    // Add a payment of 250
    Payment::factory()->for($booking)->create(['amount' => 250, 'status' => \App\Enums\PaymentStatus::Completed]);

    // Balance = 400 - 250 = 150
    expect($booking->balanceDue)->toBe(150.00);
});

test('balanceDue includes guest orders in total owed', function () {
    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create(['total_price' => 300]);

    // Add guest orders
    GuestOrder::factory()->for($booking)->create(['total_amount' => 50]);

    // Balance = 300 + 50 - 0 = 350
    expect($booking->balanceDue)->toBe(350.00);
});

test('totalPaid sums all payments', function () {
    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create(['total_price' => 500]);

    Payment::factory()->for($booking)->create(['amount' => 200]);
    Payment::factory()->for($booking)->create(['amount' => 150]);

    expect($booking->totalPaid)->toBe(350.00);
});

test('totalOrders sums all guest order totals', function () {
    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create(['total_price' => 300]);

    GuestOrder::factory()->for($booking)->create(['total_amount' => 45]);
    GuestOrder::factory()->for($booking)->create(['total_amount' => 55]);

    expect($booking->totalOrders)->toBe(100.00);
});

// ============================================
// Booking Room Occupancy
// ============================================

test('updateRoomOccupancy marks rooms occupied for Pending status', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create(['is_occupied' => false]);

    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create(['status' => BookingStatus::Pending, 'booking_type' => BookingType::Stay]);

    $booking->rooms()->attach($room->id, ['price_at_booking' => 100]);
    $booking->updateRoomOccupancy();

    expect($room->fresh()->is_occupied)->toBeTrue();
});

test('updateRoomOccupancy does not mark rooms for WalkIn type', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create(['is_occupied' => false]);

    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create(['status' => BookingStatus::Pending, 'booking_type' => BookingType::WalkIn]);

    $booking->rooms()->attach($room->id, ['price_at_booking' => 100]);
    $booking->updateRoomOccupancy();

    expect($room->fresh()->is_occupied)->toBeFalse();
});

// ============================================
// Booking Relationships
// ============================================

test('booking belongs to a guest', function () {
    $guest = Guest::factory()->create();
    $booking = Booking::factory()->for($guest)->create();

    expect($booking->guest)->toBeInstanceOf(Guest::class);
    expect($booking->guest->id)->toBe($guest->id);
});

test('booking belongs to a staff user', function () {
    $user = User::factory()->create(['role' => \App\Enums\UserRole::ADMIN]);
    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create(['user_id' => $user->id]);

    expect($booking->staff)->toBeInstanceOf(User::class);
    expect($booking->staff->id)->toBe($user->id);
});

test('booking has many payments', function () {
    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create();

    Payment::factory()->count(3)->for($booking)->create();

    expect($booking->payments)->toHaveCount(3);
});

test('booking has many rooms via pivot', function () {
    $roomType = RoomType::factory()->create();
    $rooms = Room::factory()->count(2)->for($roomType)->create();

    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create();

    foreach ($rooms as $room) {
        $booking->rooms()->attach($room->id, ['price_at_booking' => $room->price_per_night]);
    }

    expect($booking->rooms)->toHaveCount(2);
    expect($booking->rooms->first()->pivot->price_at_booking)->not->toBeNull();
});

// ============================================
// Booking Delete Cleanup
// ============================================

test('deleting a booking cascades pivot records', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create(['is_occupied' => true]);

    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create();

    $booking->rooms()->attach($room->id, ['price_at_booking' => 100]);

    expect($room->fresh()->is_occupied)->toBeTrue();

    $booking->delete();

    // Booking is deleted
    $this->assertDatabaseMissing('bookings', ['id' => $booking->id]);

    // Pivot records cascade on delete (cascadeOnDelete in migration)
    $this->assertDatabaseMissing('booking_room', ['booking_id' => $booking->id]);

    // Room still exists but occupancy state depends on model event timing
    expect($room->fresh())->not->toBeNull();
});
