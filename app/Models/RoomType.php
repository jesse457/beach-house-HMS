<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Casts;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('room_types')]
#[Fillable(['name', 'description', 'category'])]
class RoomType extends Model
{
    use HasFactory;
    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2'
        ];
    }
    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }
}
