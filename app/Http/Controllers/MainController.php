<?php

namespace App\Http\Controllers;

use App\Models\Amenity;
use App\Models\Gallery;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MainController extends Controller
{
   public function index()
{
    $s3 = Storage::disk('s3');
    $amenities = Amenity::all();
    $featuredGallery = Gallery::with('roomType') // Eager load category if it comes from relationship
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->limit(6)
        ->get()
        ->map(function ($item) use ($s3) {
            // Helper to handle S3 vs Absolute URLs
            $getUrl = function($path) use ($s3) {
                if (!$path) return null;
                return str_starts_with($path, 'http') ? $path : $s3->url($path);
            };

            return [
                'id' => $item->id,
                'type' => $item->type, // 'image' or 'video'
                'url' => $getUrl($item->url),
                'thumbnail' => $item->type === 'video' ? $getUrl($item->thumbnail) : $getUrl($item->url),
                'title' => $item->title,
                'category' => $item->roomType?->name ?? 'General',
            ];
        });

    return Inertia::render('Home', [
        'featuredGallery' => $featuredGallery,
        'amenities' => $amenities
    ]);
}
    public function gallery()
    {

        $s3 = Storage::disk('s3');

        $galleryItems = Gallery::with('roomType')
            ->where('is_active', true)
            ->get()
            ->map(function ($item) use ($s3) {
                return [
                    'id' => 'gal-'.$item->id,
                    'type' => $item->type,
                    // If it's already a full URL (Facebook link), use it. Otherwise, get S3 URL.
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
                        'thumbnail' => $s3->url($room->pictures[0]), // You could add a default thumb here
                        'title' => "Room {$room->room_number} Tour",
                        'category' => $room->roomType->name ?? 'Rooms',
                        'description' => "Video walkthrough of room {$room->room_number}",
                    ];
                }
            }
        }

        // 3. Merge both collections
        $allItems = collect($galleryItems)->merge($roomMedia);

        // 4. Get a list of rooms for the UI prop (if needed for other features)
        $roomList = $rooms->map(fn ($r) => [
            'id' => $r->id,
            'name' => 'Room '.$r->room_number,
        ]);

        return Inertia::render('Rooms/Gallery', [
            'items' => $allItems,
            'rooms' => $roomList,
            // Pass dynamic categories to replace the hardcoded constant in React
            'dbCategories' => RoomType::pluck('name')->toArray(),
        ]);
    }
}
