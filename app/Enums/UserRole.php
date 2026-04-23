<?php

namespace App\Enums;

use Filament\Support\Contracts\HasLabel;

enum UserRole: string implements HasLabel
{
    case ADMIN = 'admin';
    case RECEPTIONIST = 'receptionist';
    case STAFF = 'staff';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::ADMIN => 'Administrator',
            self::RECEPTIONIST => 'Receptionist',
            self::STAFF => 'General Staff',
        };
    }
}
