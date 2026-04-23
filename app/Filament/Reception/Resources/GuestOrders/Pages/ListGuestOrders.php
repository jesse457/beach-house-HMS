<?php

namespace App\Filament\Reception\Resources\GuestOrders\Pages;

use App\Filament\Reception\Resources\GuestOrders\GuestOrderResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListGuestOrders extends ListRecords
{
    protected static string $resource = GuestOrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
