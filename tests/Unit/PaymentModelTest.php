<?php

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\Booking;
use App\Models\Guest;
use App\Models\GuestOrder;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ============================================
// Payment Model Casts
// ============================================

test('payment casts type to PaymentType enum', function () {
    $booking = Booking::factory()->for(Guest::factory())->create();
    $payment = Payment::factory()->for($booking)->create(['type' => PaymentType::BOOKING]);

    expect($payment->type)->toBeInstanceOf(PaymentType::class);
    expect($payment->type)->toBe(PaymentType::BOOKING);
});

test('payment casts status to PaymentStatus enum', function () {
    $booking = Booking::factory()->for(Guest::factory())->create();
    $payment = Payment::factory()->for($booking)->create(['status' => PaymentStatus::Completed]);

    expect($payment->status)->toBeInstanceOf(PaymentStatus::class);
    expect($payment->status)->toBe(PaymentStatus::Completed);
});

test('payment casts amount to decimal', function () {
    $booking = Booking::factory()->for(Guest::factory())->create();
    $payment = Payment::factory()->for($booking)->create(['amount' => 199.99]);

    expect((float) $payment->amount)->toBe(199.99);
});

test('payment casts paid_at to datetime', function () {
    $booking = Booking::factory()->for(Guest::factory())->create();
    $payment = Payment::factory()->for($booking)->create(['paid_at' => '2026-06-15 14:30:00']);

    expect($payment->paid_at)->toBeInstanceOf(\Carbon\Carbon::class);
});

// ============================================
// Payment Relationships
// ============================================

test('payment belongs to a booking', function () {
    $booking = Booking::factory()->for(Guest::factory())->create();
    $payment = Payment::factory()->for($booking)->create();

    expect($payment->booking)->toBeInstanceOf(Booking::class);
    expect($payment->booking->id)->toBe($booking->id);
});

test('payment has many guest orders', function () {
    $booking = Booking::factory()->for(Guest::factory())->create();
    $payment = Payment::factory()->for($booking)->create();
    GuestOrder::factory()->count(2)->for($booking)->for($payment)->create();

    expect($payment->guestOrders)->toHaveCount(2);
});
