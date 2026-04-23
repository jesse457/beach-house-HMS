<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\Booking;
use App\Models\Guest;
use App\Models\GuestOrder;
use App\Models\GuestOrderItem;
use App\Models\Payment;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\User;
use App\Enums\UserRole;
use App\Enums\BookingStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Users
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@hotel.com',
            'password' => Hash::make('password'),
            'role' => UserRole::ADMIN,
        ]);

        User::create([
            'name' => 'Receptionist',
            'email' => 'staff@hotel.com',
            'password' => Hash::make('password'),
            'role' => UserRole::RECEPTIONIST,
        ]);

        // 2. Create Amenities
        $amenities = Amenity::factory()->count(10)->create();

        // 3. Create Room Types and Rooms
        $types = ['Economy', 'Standard', 'Luxury', 'VIP'];
        foreach ($types as $typeName) {
            $type = RoomType::create(['name' => $typeName, 'description' => 'Fine stay']);

            Room::factory()->count(5)->create([
                'room_type_id' => $type->id,
            ])->each(function ($room) use ($amenities) {
                // Attach random amenities
                $room->amenities()->attach($amenities->random(rand(2, 5))->pluck('id'));
            });
        }

        // 4. Create Guests
        $guests = Guest::factory()->count(20)->create();

        // 5. Create some Bookings (Past, Present, Future)
        $rooms = Room::all();

        foreach ($guests->take(10) as $guest) {
            $booking = Booking::factory()->create([
                'guest_id' => $guest->id,
                'user_id' => User::all()->random()->id,
                'status' => BookingStatus::CheckedIn,
            ]);

            // Attach 1 or 2 rooms to the booking
            $selectedRooms = $rooms->where('is_occupied', false)->random(rand(1, 2));
            foreach ($selectedRooms as $room) {
                $booking->rooms()->attach($room->id, ['price_at_booking' => $room->price_per_night]);
                // Set room as occupied
                $room->update(['is_occupied' => true]);
            }

            // 6. Create Guest Orders for these bookings
            $order = GuestOrder::create([
                'booking_id' => $booking->id,
                'status' => 'pending',
                'total_amount' => 0
            ]);

            GuestOrderItem::factory()->count(3)->create([
                'guest_order_id' => $order->id,
            ]);

            // Refresh order total
            $order->refreshTotal();

            // 7. Create a Payment for some bookings
            Payment::create([
                'booking_id' => $booking->id,
                'amount' => $booking->total_price / 2,
                'payment_method' => 'cash',
                'status' => 'paid',
                'paid_at' => now(),
            ]);
        }
    }
}
