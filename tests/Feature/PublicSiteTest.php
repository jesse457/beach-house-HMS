<?php

use App\Models\Gallery;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\TeamMember;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ============================================
// Homepage
// ============================================

test('homepage returns 200', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});

test('homepage contains Inertia response', function () {
    $response = $this->get('/');

    $response->assertInertia(fn ($page) => $page
        ->component('Home')
        ->has('amenities')
        ->has('featuredGallery')
        ->has('rooms')
    );
});

test('homepage only shows unoccupied rooms', function () {
    $roomType = RoomType::factory()->create();
    Room::factory()->for($roomType)->create(['is_occupied' => false]);
    Room::factory()->for($roomType)->create(['is_occupied' => true]);

    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Home')
        ->has('rooms')
    );
});

test('homepage shows only active gallery items', function () {
    Gallery::factory()->create(['is_active' => true, 'sort_order' => 1]);
    Gallery::factory()->create(['is_active' => false, 'sort_order' => 2]);

    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Home')
        ->has('featuredGallery')
    );
});

// ============================================
// Room Listing Page
// ============================================

test('rooms index returns 200', function () {
    $response = $this->get('/rooms');

    $response->assertStatus(200);
});

test('rooms index shows Inertia component with paginated rooms', function () {
    $roomType = RoomType::factory()->create();
    Room::factory()->count(10)->for($roomType)->create(['is_occupied' => false]);

    $response = $this->get('/rooms');

    $response->assertInertia(fn ($page) => $page
        ->component('Rooms/Index')
        ->has('rooms.data')
        ->has('roomTypes')
        ->has('amenities')
    );
});

test('rooms index excludes occupied rooms', function () {
    $roomType = RoomType::factory()->create();
    Room::factory()->for($roomType)->create([
        'is_occupied' => false,
        'status' => 'available',
    ]);
    Room::factory()->for($roomType)->create([
        'is_occupied' => true,
        'status' => 'available',
    ]);

    $response = $this->get('/rooms');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Rooms/Index')
        ->has('rooms.data')
    );
});

// ============================================
// Room Detail Page
// ============================================

test('room show returns 200 for available room', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create(['is_occupied' => false]);

    $response = $this->get("/rooms/{$room->id}");

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Rooms/Show'));
});

test('room show redirects for occupied room', function () {
    $roomType = RoomType::factory()->create();
    $room = Room::factory()->for($roomType)->create([
        'is_occupied' => true,
        'status' => 'available',
    ]);

    $response = $this->get("/rooms/{$room->id}");

    $response->assertRedirect(route('rooms.index'));
});

test('room show returns 404 for non-existent room', function () {
    $response = $this->get('/rooms/99999');

    $response->assertStatus(404);
});

// ============================================
// Gallery Page
// ============================================

test('gallery page returns 200', function () {
    $response = $this->get('/gallery');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Rooms/Gallery')
        ->has('items')
        ->has('rooms')
        ->has('dbCategories')
    );
});

// ============================================
// Team Page
// ============================================

test('team page returns 200', function () {
    TeamMember::factory()->count(3)->create();

    $response = $this->get('/team');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Main/Team'));
});

// ============================================
// Location Page
// ============================================

test('location page returns 200', function () {
    $response = $this->get('/location');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Main/Location'));
});

// ============================================
// Checkout Page
// ============================================

test('checkout page returns 200', function () {
    $response = $this->get('/checkout');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Bookings/Create'));
});

// ============================================
// Booking Receipt
// ============================================

test('booking receipt returns 200 for existing booking', function () {
    $guest = \App\Models\Guest::factory()->create();
    $booking = \App\Models\Booking::factory()->for($guest)->create();

    $response = $this->get("/bookings/{$booking->id}/receipt");

    $response->assertStatus(200);
});

test('booking receipt returns 404 for non-existent booking', function () {
    $response = $this->get('/bookings/99999/receipt');

    $response->assertStatus(404);
});
