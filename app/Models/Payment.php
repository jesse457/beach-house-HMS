<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('payments')]
#[Fillable(['booking_id', 'amount', 'payment_method', 'status','type', 'paid_at'])]
class Payment extends Model
{
    use HasFactory;
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
            'type' => PaymentType::class,
            'status' => PaymentStatus::class
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

     public function guestOrders(): HasMany
    {
        return $this->hasMany(GuestOrder::class);
    }
}
