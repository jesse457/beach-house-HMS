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
use Illuminate\Http\Request;

class RoomController extends Controller
{
    /**
     * Renders the Rooms/Index.tsx page
     * ✅ EXCLUDES occupied rooms from public listing
     */
    public function index()
{
    $s3 = Storage::disk('s3');

    // Use paginate instead of get
    $rooms = Room::with(['roomType', 'amenities'])
        ->where('status', 'available')
        ->where('is_occupied', false)
        ->orderBy('price_per_night', 'asc')
        ->paginate(8) // Adjust number per page as needed
        ->through(function ($room) use ($s3) {
            // Apply transformations here
            $room->pictures = collect($room->pictures ?? [])->map(fn($path) =>
                $path && !str_starts_with($path, 'http') ? $s3->url($path) : $path
            )->filter()->values();

            $room->amenities->transform(function ($amenity) use ($s3) {
                if ($amenity->icon && !str_starts_with($amenity->icon, 'http')) {
                    $amenity->icon = $s3->url($amenity->icon);
                }
                return $amenity;
            });

            return $room;
        });

    return inertia('Rooms/Index', [
        'rooms' => $rooms, // This now contains the pagination metadata (links, current_page, etc)
        'roomTypes' => RoomType::all(),
        'amenities' => Amenity::all(),
    ]);
}

    /**
     * Renders the Rooms/Show.tsx page
     * ✅ Redirects if room is occupied and user tries to view directly
     */
    public function show(Room $room)
    {
        // ✅ Prevent viewing occupied rooms directly via URL
        if ($room->is_occupied && $room->status === 'available') {
            return redirect()->route('rooms.index')
                ->with('info', 'This room is currently booked. Please explore our other available suites.');
        }

        $s3 = Storage::disk('s3');

        $room->load(['roomType', 'amenities']);

        $pictures = collect($room->pictures ?? [])->map(function ($path) use ($s3) {
            return $path && str_starts_with($path, 'http') ? $path : ($path ? $s3->url($path) : null);
        })->filter()->values();

        $videos = collect($room->videos ?? [])->map(function ($path) use ($s3, $room) {
            $url = $path && str_starts_with($path, 'http') ? $path : ($path ? $s3->url($path) : null);
            $thumbnailPath = $room->pictures[0] ?? null;
            $thumbnail = $thumbnailPath && str_starts_with($thumbnailPath, 'http')
                ? $thumbnailPath
                : ($thumbnailPath ? $s3->url($thumbnailPath) : null);

            return $url ? ['url' => $url, 'thumbnail' => $thumbnail] : null;
        })->filter()->values();

        return Inertia::render('Rooms/Show', [
            'room' => [
                'id' => $room->id,
                'room_number' => $room->room_number,
                'type_name' => $room->roomType?->name,
                'description' => $room->roomType?->description,
                'price' => number_format($room->price_per_night, 2),
                'is_occupied' => $room->is_occupied, // ✅ Pass to frontend for UI handling
                'pictures' => $pictures,
                'videos' => $videos,
                'amenities' => $room->amenities->map(fn($a) => [
                    'name' => $a->name,
                    'icon' => $a->icon,
                    'description' => $a->description
                ]),
            ]
        ]);
    }

    /**
     * ✅ REMOVED: create() method should be in BookingController
     * This was incorrectly placed here - booking logic belongs in BookingController@store()
     */
}
