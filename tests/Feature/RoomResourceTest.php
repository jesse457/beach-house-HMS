<?php
use App\Models\User;
use App\Models\RoomType;
use App\Models\Amenity;
use Illuminate\Support\Facades\Storage;


uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

it('can create a new room with all details', function () {
    // 1. Setup
    Storage::fake('s3');
    $user = User::factory()->create(['email' => 'admin@example.com']);
    $type = RoomType::factory()->create(['name' => 'Luxury Suite']);
    $amenity = Amenity::factory()->create(['name' => 'Mini Bar']);

    $imagePath = storage_path('framework/testing/room.jpg');
    file_put_contents($imagePath, 'fake-image');

    // 2. The Fluent Test Chain (Matches your requested syntax)
    $page = visit('/admin');
        // ->fill('email', 'admin@example.com')
        // ->fill('password', 'password')
        // ->click('Sign in')
        // ->assertSee('Dashboard');

    $page->navigate('/admin/rooms/create')
        ->assertSee('Room Identification')

        // Filling text & numeric fields (Filament uses data.prefix)
        ->fill('data.room_number', 'Suite 101')
        ->fill('data.price_per_night', '199.99')
        ->fill('data.floor', '2')

        // Interacting with the Searchable Select
        // We click the placeholder, then the result
        ->click('Select an option')
        ->click('text="Luxury Suite"')

        // Interacting with CheckboxList
        ->click('text="Mini Bar"')

        // Interacting with ToggleButtons (Status)
        ->click('text="Maintenance"')

        // Uploading Media
        ->attach('data.pictures', $imagePath)

        // Submit the form
        ->click('Create')

        // Final Assertions
        ->assertSee('Created')
        ->assertUrlIs(url('/admin/rooms'));

    // 3. Database assertion
    $this->assertDatabaseHas('rooms', [
        'room_number' => 'Suite 101',
        'status' => 'maintenance',
    ]);

    @unlink($imagePath);
});
