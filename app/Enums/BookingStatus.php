<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum BookingStatus: string implements HasLabel, HasColor, HasIcon
{
    case Pending = 'pending';
    case CheckedIn = 'checked_in';
    case CheckedOut = 'checked_out';
    case Cancelled = 'cancelled';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::CheckedIn => 'In-House',
            self::CheckedOut => 'Completed',
            self::Cancelled => 'Cancelled',
        };
    }

    public function getColor(): string | array | null
    {
        return match ($this) {
            self::Pending => 'gray',
            self::CheckedIn => 'success',
            self::CheckedOut => 'danger',
            self::Cancelled => 'gray',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::Pending => 'heroicon-m-clock',
            // self::Confirmed => 'heroicon-m-check-badge',
            self::CheckedIn => 'heroicon-m-key',
            self::CheckedOut => 'heroicon-m-check-circle',
            self::Cancelled => 'heroicon-m-no-symbol',
        };
    }
}
