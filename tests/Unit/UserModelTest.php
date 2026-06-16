<?php

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Guest;
use App\Models\User;
use Filament\Panel;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ============================================
// User Model Casts
// ============================================

test('user casts role to UserRole enum', function () {
    $user = User::factory()->create(['role' => UserRole::ADMIN]);

    expect($user->role)->toBeInstanceOf(UserRole::class);
    expect($user->role)->toBe(UserRole::ADMIN);
});

test('user password is hashed', function () {
    $user = User::factory()->create(['password' => 'test-password-123']);

    // Password should NOT be stored as plain text
    expect($user->password)->not->toBe('test-password-123');

    // The factory uses Hash::make('password') as the default, so check against that
    // Or verify the password is a valid bcrypt hash (starts with $2y$)
    expect($user->password)->toStartWith('$2y$');
});

// ============================================
// User Panel Access
// ============================================

test('admin user can access admin panel', function () {
    $user = User::factory()->create(['role' => UserRole::ADMIN]);

    $adminPanel = Mockery::mock(Panel::class);
    $adminPanel->shouldReceive('getId')->andReturn('admin');

    expect($user->canAccessPanel($adminPanel))->toBeTrue();
});

test('receptionist user cannot access admin panel', function () {
    $user = User::factory()->create(['role' => UserRole::RECEPTIONIST]);

    $adminPanel = Mockery::mock(Panel::class);
    $adminPanel->shouldReceive('getId')->andReturn('admin');

    expect($user->canAccessPanel($adminPanel))->toBeFalse();
});

test('staff user cannot access admin panel', function () {
    $user = User::factory()->create(['role' => UserRole::STAFF]);

    $adminPanel = Mockery::mock(Panel::class);
    $adminPanel->shouldReceive('getId')->andReturn('admin');

    expect($user->canAccessPanel($adminPanel))->toBeFalse();
});

test('admin user can access reception panel', function () {
    $user = User::factory()->create(['role' => UserRole::ADMIN]);

    $receptionPanel = Mockery::mock(Panel::class);
    $receptionPanel->shouldReceive('getId')->andReturn('reception');

    expect($user->canAccessPanel($receptionPanel))->toBeTrue();
});

test('receptionist user can access reception panel', function () {
    $user = User::factory()->create(['role' => UserRole::RECEPTIONIST]);

    $receptionPanel = Mockery::mock(Panel::class);
    $receptionPanel->shouldReceive('getId')->andReturn('reception');

    expect($user->canAccessPanel($receptionPanel))->toBeTrue();
});

test('staff user cannot access reception panel', function () {
    $user = User::factory()->create(['role' => UserRole::STAFF]);

    $receptionPanel = Mockery::mock(Panel::class);
    $receptionPanel->shouldReceive('getId')->andReturn('reception');

    expect($user->canAccessPanel($receptionPanel))->toBeFalse();
});

test('user cannot access unknown panel', function () {
    $user = User::factory()->create(['role' => UserRole::ADMIN]);

    $unknownPanel = Mockery::mock(Panel::class);
    $unknownPanel->shouldReceive('getId')->andReturn('unknown');

    expect($user->canAccessPanel($unknownPanel))->toBeFalse();
});

// ============================================
// User Relationships
// ============================================

test('user has many managed bookings', function () {
    $user = User::factory()->create(['role' => UserRole::ADMIN]);
    Booking::factory()->count(2)->for(Guest::factory())->create(['user_id' => $user->id]);

    expect($user->managedBookings)->toHaveCount(2);
    expect($user->managedBookings->first())->toBeInstanceOf(Booking::class);
});

test('user without managed bookings returns empty collection', function () {
    $user = User::factory()->create();

    expect($user->managedBookings)->toBeEmpty();
});

test('user role defaults can be explicitly set', function () {
    $adminUser = User::factory()->create(['role' => UserRole::ADMIN]);
    $receptionistUser = User::factory()->create(['role' => UserRole::RECEPTIONIST]);
    $staffUser = User::factory()->create(['role' => UserRole::STAFF]);

    expect($adminUser->role)->toBe(UserRole::ADMIN);
    expect($receptionistUser->role)->toBe(UserRole::RECEPTIONIST);
    expect($staffUser->role)->toBe(UserRole::STAFF);
});
