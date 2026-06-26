<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\Booking;
use App\Models\Guest;
use App\Models\GuestOrder;
use App\Models\GuestOrderItem;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Service;
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

        // 2b. Create Services
        Service::factory()->count(12)->sequence(
            ['sort_order' => 1],
            ['sort_order' => 2],
            ['sort_order' => 3],
            ['sort_order' => 4],
            ['sort_order' => 5],
            ['sort_order' => 6],
            ['sort_order' => 7],
            ['sort_order' => 8],
            ['sort_order' => 9],
            ['sort_order' => 10],
            ['sort_order' => 11],
            ['sort_order' => 12],
        )->create();

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

        // 8. Create sample approved reviews
        $sampleReviews = [
            [
                'author_name' => 'Marie N.',
                'email' => 'marie@example.com',
                'content' => 'Absolutely stunning property! The views of the ocean from our room were breathtaking. The staff went above and beyond to make our stay memorable. Will definitely return.',
                'rating' => 5,
                'is_approved' => true,
            ],
            [
                'author_name' => 'Jean-Paul K.',
                'email' => 'jeanpaul@example.com',
                'content' => 'A hidden gem in Limbe. The Mediterranean-style architecture is beautiful, and the private peninsula setting makes you feel like royalty. The food was exceptional.',
                'rating' => 5,
                'is_approved' => true,
            ],
            [
                'author_name' => 'Sarah M.',
                'email' => 'sarah@example.com',
                'content' => 'We hosted our company retreat here and it was perfect. The meeting hall was well-equipped, the rooms were luxurious, and the team helped with every detail. Highly recommended.',
                'rating' => 4,
                'is_approved' => true,
            ],
            [
                'author_name' => 'David O.',
                'email' => 'david@example.com',
                'content' => 'The spa treatments were world-class and the infinity pool overlooking the Atlantic is something I will never forget. This is hands down the best resort in the region.',
                'rating' => 5,
                'is_approved' => true,
            ],
            [
                'author_name' => 'Amara E.',
                'email' => 'amara@example.com',
                'content' => 'From the airport pickup to the checkout, everything was seamless. The room was spotless, the bed incredibly comfortable, and the sunrise views were magical.',
                'rating' => 5,
                'is_approved' => true,
            ],
            [
                'author_name' => 'Thomas B.',
                'email' => 'thomas@example.com',
                'content' => 'Our family vacation here was unforgettable. The kids loved the pool, we loved the fine dining, and everyone enjoyed the warm Cameroonian hospitality. A true paradise.',
                'rating' => 4,
                'is_approved' => true,
            ],
        ];

        foreach ($sampleReviews as $review) {
            Review::create($review);
        }
    }
}
