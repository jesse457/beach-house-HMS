<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
            'title', 'type', 'url', 'thumbnail',
        'room_type_id', 'description', 'is_active', 'sort_order'
    ])]
class Gallery extends Model
{
      public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }
}
