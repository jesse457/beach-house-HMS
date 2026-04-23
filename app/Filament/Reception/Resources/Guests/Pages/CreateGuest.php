<?php

namespace App\Filament\Reception\Resources\Guests\Pages;

use App\Filament\Reception\Resources\Guests\GuestResource;
use Filament\Resources\Pages\CreateRecord;

class CreateGuest extends CreateRecord
{
    protected static string $resource = GuestResource::class;
}
