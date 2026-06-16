<?php

use App\Models\Booking;
use App\Models\Guest;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ============================================
// Guest Basic Attributes
// ============================================

test('guest can be created with fillable attributes', function () {
    $guest = Guest::factory()->create([
        'name' => 'Alice Johnson',
        'email' => 'alice@example.com',
        'phone' => '555-1234',
        'address' => '123 Main St, Cityville',
        'id_card_number' => 'ID-1234567',
    ]);

    expect($guest->name)->toBe('Alice Johnson');
    expect($guest->email)->toBe('alice@example.com');
    expect($guest->phone)->toBe('555-1234');
});

test('guest email is unique', function () {
    Guest::factory()->create(['email' => 'unique@example.com']);

    $this->expectException(\Illuminate\Database\QueryException::class);

    Guest::factory()->create(['email' => 'unique@example.com']);
});

// ============================================
// Guest Relationships
// ============================================

test('guest has many bookings', function () {
    $guest = Guest::factory()->create();
    Booking::factory()->count(3)->for($guest)->create();

    expect($guest->bookings)->toHaveCount(3);
    expect($guest->bookings->first())->toBeInstanceOf(Booking::class);
});

test('guest without bookings returns empty collection', function () {
    $guest = Guest::factory()->create();

    expect($guest->bookings)->toBeEmpty();
});

test('guest bookings are ordered by creation', function () {
    $guest = Guest::factory()->create();

    $booking1 = Booking::factory()->for($guest)->create(['created_at' => now()->subDays(5)]);
    $booking2 = Booking::factory()->for($guest)->create(['created_at' => now()]);

    $bookings = $guest->bookings()->orderBy('created_at', 'asc')->get();

    expect($bookings->first()->id)->toBe($booking1->id);
    expect($bookings->last()->id)->toBe($booking2->id);
});
