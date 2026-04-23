<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('guest_order_items')]
#[Fillable([
    'guest_order_id',
    'item_name',
    'category',
    'quantity',
    'unit_price',
    'total_price'
])]
class GuestOrderItem extends Model
{

use HasFactory;
    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'total_price' => 'decimal:2',
        ];
    }

    /**
     * The parent order this item belongs to
     */
    public function guestOrder(): BelongsTo
    {
        return $this->belongsTo(GuestOrder::class);
    }

    /**
     * Auto-calculate total_price for this row before saving
     */
    protected static function booted()
    {
        static::saving(function ($item) {
            $item->total_price = $item->quantity * $item->unit_price;
        });

        static::saved(function ($item) {
            // After an item is saved, update the parent's total amount
            $item->guestOrder->refreshTotal();
        });
    }
}
