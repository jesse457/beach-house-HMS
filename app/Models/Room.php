<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Table('rooms')]
#[Fillable([
    'room_type_id',
    'room_number',
    'floor',
    'status',
    'price_per_night',
    'pictures', // Plural
    'videos',   // Plural
    'is_occupied'
])]
class Room extends Model
{

use HasFactory;
    protected function casts(): array
    {
        return [
            'price_per_night' => 'decimal:2',
            'is_occupied' => 'boolean',
            'pictures' => 'array', // Crucial for JSON storage
            'videos' => 'array',   // Crucial for JSON storage
        ];
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class)->using(AmenityRoom::class);
    }

    public function bookings(): BelongsToMany
    {
        return $this->belongsToMany(Booking::class, 'booking_room')
            ->using(BookingRoom::class)
            ->withPivot('price_at_booking')
            ->withTimestamps();
    }
}
