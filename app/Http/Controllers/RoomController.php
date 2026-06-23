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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    /**
     * Renders the Rooms/Index.tsx page — only available, unoccupied rooms.
     */
    public function index()
{
    $startTime = microtime(true);
    $s3 = Storage::disk('s3');

    $rooms = Room::with(['roomType', 'amenities'])
        ->where('status', 'available')
        ->where('is_occupied', false)
        ->orderBy('price_per_night', 'asc')
        ->paginate(8)
        ->through(function ($room) use ($s3) {
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

    $elapsed = round(microtime(true) - $startTime, 3);
    Log::info('Room listing rendered', [
        'page' => $rooms->currentPage(),
        'per_page' => $rooms->perPage(),
        'showing' => $rooms->count(),
        'total_rooms' => $rooms->total(),
        'time_ms' => $elapsed * 1000,
    ]);

    return inertia('Rooms/Index', [
        'rooms' => $rooms,
        'roomTypes' => RoomType::all(),
        'amenities' => Amenity::all(),
    ]);
}

    /**
     * Renders the Rooms/Show.tsx page
     * ✅ Redirects if room is occupied and user tries to view directly
     */
    /**
     * Show a single room. Resolves by slug first, falls back to numeric ID
     * for backward compatibility. Issues a 301 redirect for old numeric URLs.
     */
    public function show(string $roomIdentifier)
    {
        $startTime = microtime(true);

        // Try slug first, then numeric ID for backward compatibility
        $room = Room::where('slug', $roomIdentifier)
            ->orWhere(function ($q) use ($roomIdentifier) {
                if (is_numeric($roomIdentifier)) {
                    $q->where('id', (int) $roomIdentifier);
                }
            })
            ->firstOrFail();

        // Redirect old numeric URLs to new SEO-friendly slug URLs
        if (is_numeric($roomIdentifier) && $room->slug) {
            Log::info('Room: redirected numeric URL to slug', [
                'from' => $roomIdentifier,
                'to' => $room->slug,
            ]);
            return redirect()->route('rooms.show', $room->slug, 301);
        }

        // Prevent viewing occupied rooms directly via URL
        if ($room->is_occupied && $room->status === 'available') {
            Log::info('Room: occupied room access blocked', [
                'room_id' => $room->id,
                'room_number' => $room->room_number,
            ]);
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

        $elapsed = round(microtime(true) - $startTime, 3);
        Log::info('Room detail page rendered', [
            'room_id' => $room->id,
            'room_number' => $room->room_number,
            'room_type' => $room->roomType?->name,
            'is_occupied' => $room->is_occupied,
            'picture_count' => $pictures->count(),
            'video_count' => $videos->count(),
            'amenity_count' => $room->amenities->count(),
            'time_ms' => $elapsed * 1000,
        ]);

        return Inertia::render('Rooms/Show', [
            'room' => [
                'id' => $room->id,
                'slug' => $room->slug,
                'room_number' => $room->room_number,
                'type_name' => $room->roomType?->name,
                'description' => $room->roomType?->description,
                'price' => number_format($room->price_per_night, 2),
                'is_occupied' => $room->is_occupied,
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
