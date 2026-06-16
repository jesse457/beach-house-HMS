<?php

use App\Models\Amenity;
use App\Models\Booking;
use App\Models\Guest;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ============================================
// Room Model Casts
// ============================================

test('room casts price_per_night to decimal', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create(['price_per_night' => 199.99]);

    // Decimal cast returns string, compare as float
    expect((float) $room->price_per_night)->toBe(199.99);
});

test('room casts is_occupied to boolean', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create(['is_occupied' => true]);

    expect($room->is_occupied)->toBeTrue();
    expect($room->is_occupied)->toBeBool();
});

test('room casts pictures to array', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create(['pictures' => ['pic1.jpg', 'pic2.jpg']]);

    expect($room->pictures)->toBeArray();
    expect($room->pictures)->toHaveCount(2);
});

test('room casts videos to array', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create(['videos' => ['tour.mp4']]);

    expect($room->videos)->toBeArray();
    expect($room->videos)->toHaveCount(1);
});

test('room handles empty pictures and videos', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create(['pictures' => [], 'videos' => []]);

    expect($room->pictures)->toBeArray();
    expect($room->pictures)->toBeEmpty();
    expect($room->videos)->toBeArray();
    expect($room->videos)->toBeEmpty();
});

// ============================================
// Room Relationships
// ============================================

test('room belongs to a room type', function () {
    $roomType = RoomType::factory()->create(['name' => 'Deluxe Suite']);
    $room = Room::factory()->for($roomType)->create();

    expect($room->roomType)->toBeInstanceOf(RoomType::class);
    expect($room->roomType->name)->toBe('Deluxe Suite');
});

test('room has many amenities via pivot', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create();

    $amenities = Amenity::factory()->count(3)->create();
    $room->amenities()->attach($amenities->pluck('id'));

    expect($room->amenities)->toHaveCount(3);
    expect($room->amenities->first())->toBeInstanceOf(Amenity::class);
});

test('room has many bookings via pivot', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create();

    $guest = Guest::factory()->create();
    $booking = Booking::factory()->for($guest)->create();

    $room->bookings()->attach($booking->id, ['price_at_booking' => 150]);

    expect($room->bookings)->toHaveCount(1);
    expect($room->bookings->first())->toBeInstanceOf(Booking::class);
    // price_at_booking on pivot is decimal, compare as float
    expect((float) $room->bookings->first()->pivot->price_at_booking)->toBe(150.00);
});

test('room factory creates with default available state', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create();

    expect($room->status)->toBe('available');
    expect($room->is_occupied)->toBeFalse();
});
