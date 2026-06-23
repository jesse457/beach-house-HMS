<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Models\Amenity;
use App\Models\Gallery;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MainController extends Controller
{


public function index()
{
    $s3 = Storage::disk('s3');

    // Fetch active amenities
    $amenities = Amenity::all();

    // Fetch featured gallery items
    $featuredGallery = Gallery::with('roomType')
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->limit(6)
        ->get()
        ->map(function ($item) use ($s3) {
            $getUrl = function($path) use ($s3) {
                if (!$path) return null;
                return str_starts_with($path, 'http') ? $path : $s3->url($path);
            };

            return [
                'id' => $item->id,
                'type' => $item->type,
                'url' => $getUrl($item->url),
                'thumbnail' => $item->type === 'video' ? $getUrl($item->thumbnail) : $getUrl($item->url),
                'title' => $item->title,
                'category' => $item->roomType?->name ?? 'General',
            ];
        });

    // Fetch the top 5 rooms matching your exact Eloquent columns & relationships
    $rooms = Room::with(['roomType', 'amenities'])
        ->where('is_occupied', false) // Use availability filter
        ->limit(5)
        ->get()
        ->map(function ($room) use ($s3) {
            $getUrl = function($path) use ($s3) {
                if (!$path) return null;
                return str_starts_with($path, 'http') ? $path : $s3->url($path);
            };

            // Map "pictures" array cast to absolute URLs
            $images = [];
            if (is_array($room->pictures)) {
                $images = array_map(function($path) use ($getUrl) {
                    return $getUrl($path);
                }, $room->pictures);
            }

            // Extract the first video URL if it exists in the "videos" JSON array
            $videoUrl = null;
            if (is_array($room->videos) && count($room->videos) > 0) {
                $videoUrl = $getUrl($room->videos[0]);
            }

            return [
                'id' => $room->id,
                // Combine room type name with room number for clear identification
                'name' => ($room->roomType?->name ?? 'Luxury Room') . ' ' . $room->room_number,
                'description' => $room->roomType?->description ?? 'A beautifully appointed hotel room designed for your comfort.',
                'price_per_night' => (float) $room->price_per_night,
                'capacity' => (int) ($room->roomType?->capacity ?? 2),
                'available' => !$room->is_occupied,
                'images' => $images,
                'video_url' => $videoUrl,
                // Pluck amenity names from the BelongsToMany relation
                'amenities' => $room->amenities->pluck('name')->toArray(),
            ];
        });

    return Inertia::render('Home', [
        'featuredGallery' => $featuredGallery,
        'amenities' => $amenities,
        'rooms' => $rooms,
        'testimonials' => [], // Passed as empty since testimonials are no longer queried
    ]);
}
    public function gallery(Request $request)
    {
        $perPage = 12;
        $page = (int) $request->query('page', 1);
        $type = $request->query('type');           // 'image', 'video', or null (all)
        $category = $request->query('category');   // RoomType name or null (all)

        $s3 = Storage::disk('s3');

        // 1. Fetch active Gallery items with roomType
        $galleryItems = Gallery::with('roomType')
            ->where('is_active', true)
            ->get()
            ->map(function ($item) use ($s3) {
                return [
                    'id' => 'gal-'.$item->id,
                    'type' => $item->type,
                    'url' => str_starts_with($item->url, 'http') ? $item->url : $s3->url($item->url),
                    'thumbnail' => $item->thumbnail ? $s3->url($item->thumbnail) : null,
                    'title' => $item->title,
                    'category' => $item->roomType->name ?? 'General',
                    'description' => $item->description,
                ];
            });

        // 2. Fetch media stored inside the Room model (pictures/videos columns)
        $rooms = Room::with('roomType')->get();
        $roomMedia = [];

        foreach ($rooms as $room) {
            // Process Pictures array
            if ($room->pictures) {
                foreach ($room->pictures as $index => $path) {
                    $roomMedia[] = [
                        'id' => "room-{$room->id}-pic-{$index}",
                        'type' => 'image',
                        'url' => $s3->url($path),
                        'title' => "Room {$room->room_number}",
                        'category' => $room->roomType->name ?? 'Rooms',
                        'description' => "Floor {$room->floor}",
                    ];
                }
            }

            // Process Videos array
            if ($room->videos) {
                foreach ($room->videos as $index => $path) {
                    $roomMedia[] = [
                        'id' => "room-{$room->id}-vid-{$index}",
                        'type' => 'video',
                        'url' => $s3->url($path),
                        'thumbnail' => $s3->url($room->pictures[0] ?? null),
                        'title' => "Room {$room->room_number} Tour",
                        'category' => $room->roomType->name ?? 'Rooms',
                        'description' => "Video walkthrough of room {$room->room_number}",
                    ];
                }
            }
        }

        // 3. Merge both collections into one
        $allItems = collect($galleryItems)->merge($roomMedia)->values();

        // Compute total counts per type before filtering (for the tab badges)
        $totalPhotos = $allItems->filter(fn($item) => $item['type'] === 'image')->count();
        $totalVideos = $allItems->filter(fn($item) => $item['type'] === 'video')->count();

        // 4. Apply server-side filters so pagination reflects them
        if ($type === 'image') {
            $allItems = $allItems->filter(fn($item) => $item['type'] === 'image')->values();
        } elseif ($type === 'video') {
            $allItems = $allItems->filter(fn($item) => $item['type'] === 'video')->values();
        }

        if ($category && $category !== 'All') {
            $allItems = $allItems->filter(fn($item) => $item['category'] === $category)->values();
        }

        // 5. Paginate the (possibly filtered) collection
        $total = $allItems->count();
        $paginatedItems = $allItems->slice(($page - 1) * $perPage, $perPage)->values();

        $paginator = new LengthAwarePaginator(
            $paginatedItems,
            $total,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        // 6. Get a list of rooms for the UI prop
        $roomList = $rooms->map(fn ($r) => [
            'id' => $r->id,
            'name' => 'Room '.$r->room_number,
        ]);

        return Inertia::render('Rooms/Gallery', [
            'items' => $paginator,
            'rooms' => $roomList,
            'dbCategories' => RoomType::pluck('name')->toArray(),
            'totalPhotos' => $totalPhotos,
            'totalVideos' => $totalVideos,
        ]);
    }
}
