<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Enums\BookingType;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Amenity;
use App\Models\Booking;
use App\Models\Guest;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RoomController extends Controller
{
    /**
     * Renders the Rooms/Index.tsx page
     */
    public function index()
    {
        $s3 = Storage::disk('s3');

        $rooms = Room::with(['roomType', 'amenities'])
            ->where('status', 'available') // Optional: only show active rooms
            ->get()
            ->map(function ($room) use ($s3) {
                // Transform picture paths to S3 URLs
                $room->pictures = collect($room->pictures)->map(fn($path) => $s3->url($path));

                // Transform video paths to S3 URLs
                $room->videos = collect($room->videos)->map(fn($path) => $s3->url($path));

                // Transform Amenity icons if they are stored in S3
                $room->amenities->transform(function ($amenity) use ($s3) {
                    if ($amenity->icon && !str_starts_with($amenity->icon, 'http')) {
                        $amenity->icon = $s3->url($amenity->icon);
                    }
                    return $amenity;
                });

                return $room;
            });

        return inertia('Rooms/Index', [
            'rooms' => $rooms,
            'roomTypes' => RoomType::all(),
            // Added this so your React Filter Bar has the list of amenities
            'amenities' => Amenity::all()->map(function($a) use ($s3) {
                if ($a->icon && !str_starts_with($a->icon, 'http')) {
                    $a->icon = $s3->url($a->icon);
                }
                return $a;
            }),
        ]);
    }

    /**
     * Renders the Rooms/Show.tsx page
     */
    public function show(Room $room)
{
    $s3 = Storage::disk('s3');

    // Load relationships
    $room->load(['roomType', 'amenities']);

    // Map Pictures
    $pictures = collect($room->pictures ?? [])->map(function ($path) use ($s3) {
        return str_starts_with($path, 'http') ? $path : $s3->url($path);
    });

    // Map Videos
    $videos = collect($room->videos ?? [])->map(function ($path) use ($s3,$room) {
        return [
            'url' => str_starts_with($path, 'http') ? $path : $s3->url($path),
            // We use the first picture as a thumbnail for the video
            'thumbnail' => str_starts_with($room->pictures[0] ?? '', 'http')
                ? ($room->pictures[0] ?? null)
                : ($room->pictures[0] ? $s3->url($room->pictures[0]) : null)
        ];
    });

    return Inertia::render('Rooms/Show', [
        'room' => [
            'id' => $room->id,
            'room_number' => $room->room_number,
            'type_name' => $room->roomType?->name,
            'description' => $room->roomType?->description,
            'price' => number_format($room->price_per_night, 2),
            'pictures' => $pictures,
            'videos' => $videos,
            'amenities' => $room->amenities->map(fn($a) => [
                'name' => $a->name,
                'icon' => $a->icon, // Assumes icon name like 'Wifi', 'Coffee'
                'description' => $a->description
            ]),
        ]
    ]);
}


public function create(Request $request) {
    $validated = $request->validate([
        'room_ids'       => 'required|array|min:1',
        'room_ids.*'     => 'exists:rooms,id',
        'name'           => 'required|string|max:255',
        'email'          => 'required|email',
        'phone'          => 'required|string',
        'address'        => 'required|string',
        'id_card_number' => 'required|string',
        'checked_in_at'  => 'required|date|after_or_equal:today',
        'checked_out_at' => 'required|date|after:checked_in_at',
        'adults_count'   => 'required|integer|min:1',
        'children_count' => 'required|integer|min:0',
        'payment_method' => 'required|string',
        'notes'          => 'nullable|string',
    ]);

    return DB::transaction(function () use ($validated) {
        // 1. Find or create the guest
        $guest = Guest::updateOrCreate(
            ['email' => $validated['email']],
            [
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'id_card_number' => $validated['id_card_number'],
            ]
        );

        // 2. Calculate Nights
        $checkIn = Carbon::parse($validated['checked_in_at']);
        $checkOut = Carbon::parse($validated['checked_out_at']);
        $nights = max(1, $checkIn->startOfDay()->diffInDays($checkOut->startOfDay()));

        // 3. Find Rooms & Calculate Price
        $rooms = Room::findMany($validated['room_ids']);
        $totalPrice = 0;
        foreach ($rooms as $room) {
            $totalPrice += ($room->price_per_night * $nights);
        }

        // Add 10% tax (matching frontend logic)
        $totalWithTax = $totalPrice * 1.10;

        // 4. Create the Booking (Booking Reference generated in model)
        $booking = Booking::create([
            'guest_id'       => $guest->id,
            'status'         => BookingStatus::Pending,
            'booking_type'   => BookingType::Stay, // Professional Enum
            'total_price'    => $totalWithTax,
            'checked_in_at'  => $validated['checked_in_at'],
            'checked_out_at' => $validated['checked_out_at'],
            'adults_count'   => $validated['adults_count'],
            'children_count' => $validated['children_count'],
            'notes'          => $validated['notes'],
        ]);

        // 5. Attach Rooms with locked prices
        foreach ($rooms as $room) {
            $booking->rooms()->attach($room->id, [
                'price_at_booking' => $room->price_per_night // Store per-night rate
            ]);
        }

        // 6. Update Room Occupancy (Uses model logic)
        $booking->updateRoomOccupancy();

        return redirect()->route('home')->with('success', "Stay Confirmed! Ref: {$booking->booking_reference}");
    });
}
}
