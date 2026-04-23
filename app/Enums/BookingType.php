<?php

namespace App\Enums;

use Filament\Support\Contracts\HasLabel;

enum BookingType: string implements HasLabel
{
    case Stay = 'stay';
    case Event = 'event';
    case WalkIn = 'walk_in';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::Stay => 'Room Stay',
            self::Event => 'Hall/Event Rental',
            self::WalkIn => 'Walk-in (Amenities)',
        };
    }
}
