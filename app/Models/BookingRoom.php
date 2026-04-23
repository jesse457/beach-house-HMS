<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Table('booking_room')]
#[Fillable(['booking_id', 'room_id', 'price_at_booking'])]
class BookingRoom extends Pivot
{
    public $incrementing = true;
}
