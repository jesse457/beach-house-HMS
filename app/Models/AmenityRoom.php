<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Table('amenity_room')]
#[Fillable(['amenity_id', 'room_id'])]
class AmenityRoom extends Pivot
{
    
    /**
     * Since the migration I provided for this table includes an 'id' column,
     * we set incrementing to true.
     */
    public $incrementing = true;
}
