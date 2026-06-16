<?php

use App\Enums\BookingStatus;
use App\Enums\BookingType;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Enums\UserRole;

// ============================================
// BookingStatus Enum Tests
// ============================================

test('BookingStatus has correct values', function () {
    expect(BookingStatus::Pending->value)->toBe('pending');
    expect(BookingStatus::CheckedIn->value)->toBe('checked_in');
    expect(BookingStatus::CheckedOut->value)->toBe('checked_out');
    expect(BookingStatus::Cancelled->value)->toBe('cancelled');
});

test('BookingStatus has correct labels', function () {
    expect(BookingStatus::Pending->getLabel())->toBe('Pending');
    expect(BookingStatus::CheckedIn->getLabel())->toBe('In-House');
    expect(BookingStatus::CheckedOut->getLabel())->toBe('Completed');
    expect(BookingStatus::Cancelled->getLabel())->toBe('Cancelled');
});

test('BookingStatus has correct colors', function () {
    expect(BookingStatus::Pending->getColor())->toBe('gray');
    expect(BookingStatus::CheckedIn->getColor())->toBe('success');
    expect(BookingStatus::CheckedOut->getColor())->toBe('danger');
    expect(BookingStatus::Cancelled->getColor())->toBe('gray');
});

test('BookingStatus has correct icons', function () {
    expect(BookingStatus::Pending->getIcon())->toBe('heroicon-m-clock');
    expect(BookingStatus::CheckedIn->getIcon())->toBe('heroicon-m-key');
    expect(BookingStatus::CheckedOut->getIcon())->toBe('heroicon-m-check-circle');
    expect(BookingStatus::Cancelled->getIcon())->toBe('heroicon-m-no-symbol');
});

test('BookingStatus has four cases', function () {
    expect(count(BookingStatus::cases()))->toBe(4);
});

// ============================================
// BookingType Enum Tests
// ============================================

test('BookingType has correct values', function () {
    expect(BookingType::Stay->value)->toBe('stay');
    expect(BookingType::Event->value)->toBe('event');
    expect(BookingType::WalkIn->value)->toBe('walk_in');
});

test('BookingType has correct labels', function () {
    expect(BookingType::Stay->getLabel())->toBe('Room Stay');
    expect(BookingType::Event->getLabel())->toBe('Hall/Event Rental');
    expect(BookingType::WalkIn->getLabel())->toBe('Walk-in (Amenities)');
});

test('BookingType has three cases', function () {
    expect(count(BookingType::cases()))->toBe(3);
});

// ============================================
// PaymentStatus Enum Tests
// ============================================

test('PaymentStatus has correct values', function () {
    expect(PaymentStatus::Completed->value)->toBe('completed');
    expect(PaymentStatus::Partial->value)->toBe('partial');
    expect(PaymentStatus::Pending->value)->toBe('pending');
    expect(PaymentStatus::Failed->value)->toBe('failed');
});

test('PaymentStatus has correct labels', function () {
    expect(PaymentStatus::Completed->getLabel())->toBe('Completed');
    expect(PaymentStatus::Partial->getLabel())->toBe('Partial');
    expect(PaymentStatus::Pending->getLabel())->toBe('Pending');
    expect(PaymentStatus::Failed->getLabel())->toBe('Failed');
});

test('PaymentStatus has four cases', function () {
    expect(count(PaymentStatus::cases()))->toBe(4);
});

// ============================================
// PaymentType Enum Tests
// ============================================

test('PaymentType has correct values', function () {
    expect(PaymentType::ORDER->value)->toBe('order');
    expect(PaymentType::BOOKING->value)->toBe('booking');
    expect(PaymentType::TOTAL->value)->toBe('total');
});

test('PaymentType has three cases', function () {
    expect(count(PaymentType::cases()))->toBe(3);
});

// ============================================
// UserRole Enum Tests
// ============================================

test('UserRole has correct values', function () {
    expect(UserRole::ADMIN->value)->toBe('admin');
    expect(UserRole::RECEPTIONIST->value)->toBe('receptionist');
    expect(UserRole::STAFF->value)->toBe('staff');
});

test('UserRole has correct labels', function () {
    expect(UserRole::ADMIN->getLabel())->toBe('Administrator');
    expect(UserRole::RECEPTIONIST->getLabel())->toBe('Receptionist');
    expect(UserRole::STAFF->getLabel())->toBe('General Staff');
});

test('UserRole has three cases', function () {
    expect(count(UserRole::cases()))->toBe(3);
});
