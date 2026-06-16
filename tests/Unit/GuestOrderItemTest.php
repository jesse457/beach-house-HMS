<?php

use App\Models\Booking;
use App\Models\Guest;
use App\Models\GuestOrder;
use App\Models\GuestOrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ============================================
// GuestOrderItem Auto-Calculation
// ============================================

test('guest order item auto-calculates total_price on save', function () {
    $booking = Booking::factory()->for(Guest::factory())->create();
    $order = GuestOrder::factory()->for($booking)->create(['total_amount' => 0]);

    $item = GuestOrderItem::factory()->for($order)->create([
        'unit_price' => 25.00,
        'quantity' => 3,
        'total_price' => 0, // Will be overridden by boot event
    ]);

    expect((float) $item->fresh()->total_price)->toBe(75.00);
});

test('guest order item auto-calculates on update', function () {
    $booking = Booking::factory()->for(Guest::factory())->create();
    $order = GuestOrder::factory()->for($booking)->create();

    $item = GuestOrderItem::factory()->for($order)->create([
        'unit_price' => 10,
        'quantity' => 1,
    ]);

    $item->quantity = 5;
    $item->save();

    expect((float) $item->fresh()->total_price)->toBe(50.00);
});

test('guest order item triggers parent order refreshTotal on save', function () {
    $booking = Booking::factory()->for(Guest::factory())->create();
    $order = GuestOrder::factory()->for($booking)->create(['total_amount' => 0]);

    GuestOrderItem::factory()->for($order)->create(['unit_price' => 20, 'quantity' => 2]); // 40
    GuestOrderItem::factory()->for($order)->create(['unit_price' => 15, 'quantity' => 1]); // 15

    // Parent order should have total_amount = 55
    expect((float) $order->fresh()->total_amount)->toBe(55.00);
});

test('guest order item triggers parent order refreshTotal on delete', function () {
    $booking = Booking::factory()->for(Guest::factory())->create();
    $order = GuestOrder::factory()->for($booking)->create(['total_amount' => 0]);

    $item1 = GuestOrderItem::factory()->for($order)->create(['unit_price' => 20, 'quantity' => 2]); // 40
    $item2 = GuestOrderItem::factory()->for($order)->create(['unit_price' => 10, 'quantity' => 1]); // 10

    expect((float) $order->fresh()->total_amount)->toBe(50.00);

    $item1->delete();

    expect((float) $order->fresh()->total_amount)->toBe(10.00);
});

// ============================================
// GuestOrderItem Relationships
// ============================================

test('guest order item belongs to a guest order', function () {
    $booking = Booking::factory()->for(Guest::factory())->create();
    $order = GuestOrder::factory()->for($booking)->create();
    $item = GuestOrderItem::factory()->for($order)->create();

    expect($item->guestOrder)->toBeInstanceOf(GuestOrder::class);
    expect($item->guestOrder->id)->toBe($order->id);
});

test('guest order item casts unit_price and total_price to decimal', function () {
    $booking = Booking::factory()->for(Guest::factory())->create();
    $order = GuestOrder::factory()->for($booking)->create();
    // The boot event recalculates total_price = quantity * unit_price
    // So we need to verify the calculation happens based on the values we set
    $item = GuestOrderItem::factory()->for($order)->create([
        'unit_price' => 12.99,
        'quantity' => 2,
    ]);

    // Boot event should set total_price = 12.99 * 2 = 25.98
    expect((float) $item->fresh()->total_price)->toBe(25.98);
    expect((float) $item->unit_price)->toBe(12.99);
});
