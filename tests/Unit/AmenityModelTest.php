<?php

use App\Models\Amenity;
use App\Models\Booking;
use App\Models\Guest;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ============================================
// Amenity Model Casts
// ============================================

test('amenity casts is_standalone to boolean', function () {
    $amenity = Amenity::factory()->create(['is_standalone' => true]);

    expect($amenity->is_standalone)->toBeTrue();
    expect($amenity->is_standalone)->toBeBool();
});

test('amenity casts price to decimal', function () {
    $amenity = Amenity::factory()->create(['price' => 49.99]);

    expect((float) $amenity->price)->toBe(49.99);
});

test('amenity stores icon as string', function () {
    $amenity = Amenity::factory()->create(['icon' => 'heroicon-o-wifi']);

    expect($amenity->icon)->toBe('heroicon-o-wifi');
});

// ============================================
// Amenity Relationships
// ============================================

test('amenity can be attached to rooms', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create();
    $amenity = Amenity::factory()->create();

    $amenity->rooms()->attach($room->id);

    expect($amenity->rooms)->toHaveCount(1);
    expect($amenity->rooms->first())->toBeInstanceOf(Room::class);
});

test('amenity can be attached to multiple rooms', function () {
    $roomType = RoomType::factory()->create();
    $rooms = Room::factory()->count(3)->for($roomType)->create();
    $amenity = Amenity::factory()->create();

    $amenity->rooms()->attach($rooms->pluck('id'));

    expect($amenity->rooms)->toHaveCount(3);
});

test('amenity can be attached to bookings via AmenityBooking model', function () {
    $amenity = Amenity::factory()->create(['is_standalone' => true, 'price' => 25]);
    $booking = Booking::factory()->for(Guest::factory())->create();

    // Use the AmenityBooking model directly (references amenity_bookings table)
    $amenityBooking = \App\Models\AmenityBooking::create([
        'booking_id' => $booking->id,
        'amenity_id' => $amenity->id,
        'price_at_booking' => 25,
        'quantity' => 2,
    ]);

    expect($amenityBooking->amenity)->toBeInstanceOf(Amenity::class);
    expect($amenityBooking->amenity->id)->toBe($amenity->id);
    expect((float) $amenityBooking->price_at_booking)->toBe(25.00);
    expect((int) $amenityBooking->quantity)->toBe(2);
});

test('amenity without rooms returns empty collection', function () {
    $amenity = Amenity::factory()->create();

    expect($amenity->rooms)->toBeEmpty();
});

test('amenity factory creates with heroicon name', function () {
    $amenity = Amenity::factory()->create();

    expect($amenity->name)->not->toBeEmpty();
    expect($amenity->icon)->toStartWith('heroicon-');
});
