<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum PaymentStatus: string implements HasLabel, HasColor, HasIcon
{
    case Completed = 'completed';
    case Partial = 'partial';
    case Pending = 'pending';
    case Failed = 'failed';

    public function getLabel(): ?string
    {
        // Returns the case name (e.g., "Completed", "Partial")
        return $this->name;
    }

    public function getColor(): string|array|null
    {
        return match ($this) {
            self::Completed => 'success', // Green
            self::Partial => 'info',      // Blue
            self::Pending => 'warning',   // Amber/Orange
            self::Failed => 'danger',     // Red
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::Completed => 'heroicon-m-check-circle',
            self::Partial => 'heroicon-m-adjustments-horizontal',
            self::Pending => 'heroicon-m-clock',
            self::Failed => 'heroicon-m-x-circle',
        };
    }
}
