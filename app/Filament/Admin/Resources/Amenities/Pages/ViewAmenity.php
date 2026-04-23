<?php

namespace App\Filament\Admin\Resources\Amenities\Pages;

use App\Filament\Admin\Resources\Amenities\AmenityResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewAmenity extends ViewRecord
{
    protected static string $resource = AmenityResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
