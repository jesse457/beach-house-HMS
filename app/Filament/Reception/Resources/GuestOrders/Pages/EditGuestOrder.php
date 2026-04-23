<?php

namespace App\Filament\Reception\Resources\GuestOrders\Pages;

use App\Filament\Reception\Resources\GuestOrders\GuestOrderResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditGuestOrder extends EditRecord
{
    protected static string $resource = GuestOrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
