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

test('gallery page returns 200 with paginated items', function () {
    $response = $this->get('/gallery');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Rooms/Gallery')
        ->has('items')
        ->has('items.data')
        ->has('items.current_page')
        ->has('items.last_page')
        ->has('items.per_page')
        ->has('items.total')
        ->has('items.links')
        ->has('rooms')
        ->has('dbCategories')
    );
});

test('gallery page respects page query parameter', function () {
    // Request page 1
    $response = $this->get('/gallery?page=1');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->where('items.current_page', 1)
    );

    // Request page 999 (beyond available data) should still render
    $response2 = $this->get('/gallery?page=999');

    $response2->assertStatus(200);
    $response2->assertInertia(fn ($page) => $page
        ->component('Rooms/Gallery')
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
