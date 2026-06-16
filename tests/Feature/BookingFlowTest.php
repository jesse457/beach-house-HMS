<?php

use App\Enums\BookingStatus;
use App\Enums\BookingType;
use App\Models\Booking;
use App\Models\Guest;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ============================================
// Booking Validation
// ============================================

test('booking validation requires room_ids', function () {
    $response = $this->post('/bookings', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'phone' => '1234567890',
        'address' => '123 Test St',
        'id_card_number' => 'ID-1234567',
        'checked_in_at' => now()->addDay()->format('Y-m-d'),
        'checked_out_at' => now()->addDays(3)->format('Y-m-d'),
        'adults_count' => 1,
        'children_count' => 0,
    ]);

    $response->assertSessionHasErrors('room_ids');
});

test('booking validation requires guest name', function () {
    $response = $this->post('/bookings', [
        'room_ids' => [1],
        'email' => 'john@example.com',
        'phone' => '1234567890',
        'address' => '123 Test St',
        'id_card_number' => 'ID-1234567',
        'checked_in_at' => now()->addDay()->format('Y-m-d'),
        'checked_out_at' => now()->addDays(3)->format('Y-m-d'),
        'adults_count' => 1,
        'children_count' => 0,
    ]);

    $response->assertSessionHasErrors('name');
});

test('booking validation requires valid email', function () {
    $response = $this->post('/bookings', [
        'room_ids' => [1],
        'name' => 'John Doe',
        'email' => 'invalid-email',
        'phone' => '1234567890',
        'address' => '123 Test St',
        'id_card_number' => 'ID-1234567',
        'checked_in_at' => now()->addDay()->format('Y-m-d'),
        'checked_out_at' => now()->addDays(3)->format('Y-m-d'),
        'adults_count' => 1,
        'children_count' => 0,
    ]);

    $response->assertSessionHasErrors('email');
});

test('booking validation requires check-out after check-in', function () {
    $response = $this->post('/bookings', [
        'room_ids' => [1],
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'phone' => '1234567890',
        'address' => '123 Test St',
        'id_card_number' => 'ID-1234567',
        'checked_in_at' => now()->addDays(5)->format('Y-m-d'),
        'checked_out_at' => now()->addDay()->format('Y-m-d'),
        'adults_count' => 1,
        'children_count' => 0,
    ]);

    $response->assertSessionHasErrors('checked_out_at');
});

test('booking validation requires at least 1 adult', function () {
    $response = $this->post('/bookings', [
        'room_ids' => [1],
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'phone' => '1234567890',
        'address' => '123 Test St',
        'id_card_number' => 'ID-1234567',
        'checked_in_at' => now()->addDay()->format('Y-m-d'),
        'checked_out_at' => now()->addDays(3)->format('Y-m-d'),
        'adults_count' => 0,
        'children_count' => 0,
    ]);

    $response->assertSessionHasErrors('adults_count');
});

// ============================================
// Successful Booking
// ============================================

test('booking successfully creates a booking for available rooms', function () {
    $roomType = RoomType::factory()->create();
    $room1 = Room::factory()->for($roomType)->create([
        'price_per_night' => 100,
        'is_occupied' => false,
    ]);
    $room2 = Room::factory()->for($roomType)->create([
        'price_per_night' => 150,
        'is_occupied' => false,
    ]);

    $checkIn = now()->addDays(1)->format('Y-m-d');
    $checkOut = now()->addDays(4)->format('Y-m-d'); // 3 nights

    $response = $this->post('/bookings', [
        'room_ids' => [$room1->id, $room2->id],
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'phone' => '1234567890',
        'address' => '123 Test Street',
        'id_card_number' => 'ID-1234567',
        'checked_in_at' => $checkIn,
        'checked_out_at' => $checkOut,
        'adults_count' => 2,
        'children_count' => 1,
        'notes' => 'Late arrival',
    ]);

    $response->assertSessionHas('success');

    // Assert booking was created
    $this->assertDatabaseHas('bookings', [
        'adults_count' => 2,
        'children_count' => 1,
        'notes' => 'Late arrival',
    ]);

    // Assert guest was created
    $this->assertDatabaseHas('guests', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);

    // Assert rooms are now occupied
    expect($room1->fresh()->is_occupied)->toBeTrue();
    expect($room2->fresh()->is_occupied)->toBeTrue();

    // Assert booking reference was generated
    $booking = Booking::first();
    expect($booking->booking_reference)->toStartWith('BK-');
    expect($booking->status)->toBe(BookingStatus::Pending);
    expect($booking->booking_type)->toBe(BookingType::Stay);

    // Assert total price = (100 + 150) * 3 nights = 750
    expect((float) $booking->total_price)->toBe(750.00);

    // Assert pivot records created
    expect($booking->rooms)->toHaveCount(2);
    expect($booking->rooms->first()->pivot->price_at_booking)->not->toBeNull();
});

test('booking creates a new guest on first booking', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create(['price_per_night' => 100, 'is_occupied' => false]);

    $this->assertDatabaseCount('guests', 0);

    $this->post('/bookings', [
        'room_ids' => [$room->id],
        'name' => 'Jane Smith',
        'email' => 'jane@example.com',
        'phone' => '0987654321',
        'address' => '456 Oak Ave',
        'id_card_number' => 'ID-7654321',
        'checked_in_at' => now()->addDays(2)->format('Y-m-d'),
        'checked_out_at' => now()->addDays(5)->format('Y-m-d'),
        'adults_count' => 1,
        'children_count' => 0,
    ]);

    $this->assertDatabaseCount('guests', 1);
    $this->assertDatabaseHas('guests', ['email' => 'jane@example.com']);
});

test('booking reuses existing guest by email', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create(['price_per_night' => 100, 'is_occupied' => false]);

    $existingGuest = Guest::factory()->create(['email' => 'repeat@example.com']);

    $room2 = Room::factory()->for($roomType)->create([
        'price_per_night' => 120,
        'is_occupied' => false,
    ]);

    $this->post('/bookings', [
        'room_ids' => [$room2->id],
        'name' => 'Repeat Customer',
        'email' => 'repeat@example.com',
        'phone' => '1111111111',
        'address' => '789 Pine St',
        'id_card_number' => 'ID-9999999',
        'checked_in_at' => now()->addDays(1)->format('Y-m-d'),
        'checked_out_at' => now()->addDays(3)->format('Y-m-d'),
        'adults_count' => 1,
        'children_count' => 0,
    ]);

    // Should still only have 1 guest record
    $this->assertDatabaseCount('guests', 1);

    // New booking should be linked to the existing guest
    $booking = Booking::latest()->first();
    expect($booking->guest->id)->toBe($existingGuest->id);
});

// ============================================
// Double Booking Prevention (Concurrency)
// ============================================

test('booking fails when room is already occupied', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create([
        'is_occupied' => true,
        'price_per_night' => 100,
    ]);

    $response = $this->post('/bookings', [
        'room_ids' => [$room->id],
        'name' => 'Late Booker',
        'email' => 'late@example.com',
        'phone' => '1234567890',
        'address' => '789 Last St',
        'id_card_number' => 'ID-1111111',
        'checked_in_at' => now()->addDay()->format('Y-m-d'),
        'checked_out_at' => now()->addDays(3)->format('Y-m-d'),
        'adults_count' => 1,
        'children_count' => 0,
    ]);

    $response->assertSessionHasErrors('room_ids');
});

test('booking fails for non-existent room ids', function () {
    $response = $this->post('/bookings', [
        'room_ids' => [99999],
        'name' => 'Ghost Booker',
        'email' => 'ghost@example.com',
        'phone' => '1234567890',
        'address' => '123 Void St',
        'id_card_number' => 'ID-0000000',
        'checked_in_at' => now()->addDay()->format('Y-m-d'),
        'checked_out_at' => now()->addDays(3)->format('Y-m-d'),
        'adults_count' => 1,
        'children_count' => 0,
    ]);

    $response->assertSessionHasErrors('room_ids.0');
});

// ============================================
// Booking with Multiple Rooms
// ============================================

test('booking can include multiple rooms', function () {
    $roomType = RoomType::factory()->create();
    $rooms = Room::factory()->count(3)->for($roomType)->create([
        'price_per_night' => 100,
        'is_occupied' => false,
    ]);

    $this->post('/bookings', [
        'room_ids' => $rooms->pluck('id')->toArray(),
        'name' => 'Group Booking',
        'email' => 'group@example.com',
        'phone' => '1234567890',
        'address' => 'Group Address',
        'id_card_number' => 'ID-GROUP01',
        'checked_in_at' => now()->addDays(1)->format('Y-m-d'),
        'checked_out_at' => now()->addDays(2)->format('Y-m-d'), // 1 night
        'adults_count' => 3,
        'children_count' => 0,
    ]);

    $booking = Booking::first();
    expect($booking->rooms)->toHaveCount(3);

    // All rooms should be occupied
    foreach ($rooms as $room) {
        expect($room->fresh()->is_occupied)->toBeTrue();
    }
});

// ============================================
// Booking Date Edge Cases
// ============================================

test('booking allows check-in for today', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create([
        'price_per_night' => 100,
        'is_occupied' => false,
    ]);

    $response = $this->post('/bookings', [
        'room_ids' => [$room->id],
        'name' => 'Last Minute',
        'email' => 'lastminute@example.com',
        'phone' => '1234567890',
        'address' => 'Urgent St',
        'id_card_number' => 'ID-URGENT1',
        'checked_in_at' => now()->format('Y-m-d'),
        'checked_out_at' => now()->addDays(2)->format('Y-m-d'),
        'adults_count' => 1,
        'children_count' => 0,
    ]);

    $response->assertSessionHas('success');
});

test('booking allows check-in for yesterday', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create([
        'price_per_night' => 100,
        'is_occupied' => false,
    ]);

    $response = $this->post('/bookings', [
        'room_ids' => [$room->id],
        'name' => 'Backdated Booking',
        'email' => 'backdate@example.com',
        'phone' => '1234567890',
        'address' => 'Past St',
        'id_card_number' => 'ID-PAST001',
        'checked_in_at' => now()->subDay()->format('Y-m-d'),
        'checked_out_at' => now()->addDays(2)->format('Y-m-d'),
        'adults_count' => 1,
        'children_count' => 0,
    ]);

    $response->assertSessionHas('success');
});

// ============================================
// Booking Cleanup on Model Delete
// ============================================

test('deleting a booking removes pivot records', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create(['is_occupied' => true]);

    $booking = Booking::factory()
        ->for(Guest::factory())
        ->create();

    $booking->rooms()->attach($room->id, ['price_at_booking' => 100]);

    $this->assertDatabaseHas('booking_room', [
        'booking_id' => $booking->id,
        'room_id' => $room->id,
    ]);

    $booking->delete();

    // Booking is deleted
    $this->assertDatabaseMissing('bookings', ['id' => $booking->id]);

    // Pivot records cascade on delete (cascadeOnDelete in migration)
    $this->assertDatabaseMissing('booking_room', ['booking_id' => $booking->id]);

    // Room still exists
    expect($room->fresh())->not->toBeNull();
});
