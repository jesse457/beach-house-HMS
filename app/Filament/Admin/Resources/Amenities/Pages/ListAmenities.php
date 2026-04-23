<?php

namespace App\Filament\Admin\Resources\Amenities\Pages;

use App\Filament\Admin\Resources\Amenities\AmenityResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListAmenities extends ListRecords
{
    protected static string $resource = AmenityResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
