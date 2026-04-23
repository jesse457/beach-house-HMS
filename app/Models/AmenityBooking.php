<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AmenityBooking extends Model
{
   public $incrementing = true; // Crucial for Filament Repeaters

    protected $fillable = [
        'booking_id',
        'amenity_id',
        'price_at_booking',
        'quantity',
    ];

    public function amenity()
    {
        return $this->belongsTo(Amenity::class);
    }
}
