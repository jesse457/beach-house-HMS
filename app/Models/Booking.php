<?php

namespace App\Models;

use App\Enums\BookingStatus;
use App\Enums\BookingType;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;


#[Fillable([
        'booking_reference', // Generated confirmation code
        'guest_id',
        'user_id',
        'status',
        'booking_type',

        // Occupancy Details
        'adults_count',
        'children_count',

        // Dates (Planned)
        'checked_in_at',
        'checked_out_at',

        // Dates (Actual - used for auditing when they really arrived/left)
        'actual_checked_in_at',
        'actual_checked_out_at',

        // Financials
        'total_price',
        'discount_amount',
        'notes',
    ])]
class Booking extends Model
{
    use HasFactory;



    protected function casts(): array
    {
        return [
            'checked_in_at' => 'datetime',
            'checked_out_at' => 'datetime',
            'actual_checked_in_at' => 'datetime',
            'actual_checked_out_at' => 'datetime',
            'total_price' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'status' => BookingStatus::class,
            'booking_type' => BookingType::class,
            'adults_count' => 'integer',
            'children_count' => 'integer',
        ];
    }

    protected static function booted()
    {
        static::creating(function ($booking) {
            // Generate a professional booking reference (e.g., BK-24A7B)
            $booking->booking_reference = 'BK-' . strtoupper(Str::random(6));
        });

        static::saved(function ($booking) {
            $booking->updateRoomOccupancy();
        });

        static::deleted(function ($booking) {
            $booking->rooms()->update(['is_occupied' => false]);
        });
    }

    /**
     * Professional Logic: Calculate nights stayed
     */
    public function getNightsAttribute(): int
    {
        if (!$this->checked_in_at || !$this->checked_out_at) return 0;

        $nights = $this->checked_in_at->startOfDay()->diffInDays($this->checked_out_at->startOfDay());

        return $nights <= 0 ? 1 : $nights;
    }

    /**
     * Logic to update room status based on booking status
     */
    public function updateRoomOccupancy(): void
    {
        if ($this->booking_type === BookingType::WalkIn) {
            return;
        }

        $occupiedStatuses = [
            BookingStatus::CheckedIn,
            BookingStatus::Pending,
        ];

        $isOccupied = in_array($this->status, $occupiedStatuses);

        $this->rooms()->each(function ($room) use ($isOccupied) {
            $room->update([
                'is_occupied' => $isOccupied,
                // Pro Feature: If guest just checked out, mark room as "Dirty" for housekeeping
                'status' => ($this->status === BookingStatus::CheckedOut) ? 'dirty' : $room->status,
            ]);
        });
    }

    /**
     * Comprehensive Bill Calculation
     */
    public function calculateTotalBill(): float
    {
        // 1. Calculate Room Total (Daily Rate * Nights)
        $roomDailyTotal = $this->rooms()->sum('price_per_night');
        $roomStayTotal = $this->booking_type === BookingType::WalkIn ? 0 : ($roomDailyTotal * $this->nights);

        // 2. Sum Guest Orders (Food/Drink/Service)
        $ordersTotal = $this->guestOrders()->sum('total_amount');

        // 3. Sum Standalone Amenities (Gym, Pool, Spa)
        $amenitiesTotal = $this->amenityBookings()->sum(DB::raw('price_at_booking * quantity'));

        $grandTotal = ($roomStayTotal + $ordersTotal + $amenitiesTotal) - ($this->discount_amount ?? 0);

        $this->update(['total_price' => $grandTotal]);

        return (float) $grandTotal;
    }

    /**
     * Relationships
     */
    public function rooms(): BelongsToMany
    {
        return $this->belongsToMany(Room::class, 'booking_room')
            ->withPivot('price_at_booking')
            ->withTimestamps();
    }

    public function amenityBookings(): HasMany
    {
        return $this->hasMany(AmenityBooking::class, 'booking_id');
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function guestOrders(): HasMany
    {
        return $this->hasMany(GuestOrder::class);
    }
}
