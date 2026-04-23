<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('guest_orders')]
#[Fillable([
    'booking_id',
    'payment_id',
    'total_amount', // Sum of all items
    'status'
])]
class GuestOrder extends Model
{

use HasFactory;
    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
        ];
    }

    /**
     * Relationship to the specific items in this order
     */
    public function items(): HasMany
    {
        return $this->hasMany(GuestOrderItem::class);
    }

    /**
     * The stay this order belongs to
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * The payment receipt that covers this order
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Logic to recalculate total_amount based on items
     */
    public function refreshTotal(): void
    {
        $this->update([
            'total_amount' => $this->items()->sum('total_price')
        ]);
    }
}
