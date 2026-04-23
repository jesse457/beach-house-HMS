<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Table('amenities')]
// Added is_standalone and price to fillable
#[Fillable(['name', 'description', 'icon', 'is_standalone', 'price'])]
class Amenity extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            // icon should be string to store the heroicon name from Guava Icon Picker
            'icon' => 'string',
            'is_standalone' => 'boolean',
            'price' => 'decimal:2',
        ];
    }

    /**
     * Relationship for amenities attached to specific rooms (e.g., "AC", "Minibar")
     */
    public function rooms(): BelongsToMany
    {
        return $this->belongsToMany(Room::class)
                    ->using(AmenityRoom::class);
    }

    /**
     * Relationship for standalone amenities purchased during a booking (e.g., "Gym Pass")
     */
    public function bookings(): BelongsToMany
    {
        return $this->belongsToMany(Booking::class, 'booking_amenity')
                    ->withPivot('price_at_booking', 'quantity')
                    ->withTimestamps();
    }
}
