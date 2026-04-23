<?php

namespace App\Filament\Reception\Resources\Payments\Pages;

use App\Filament\Reception\Resources\Payments\PaymentResource;
use Filament\Resources\Pages\CreateRecord;

class CreatePayment extends CreateRecord
{
    protected static string $resource = PaymentResource::class;
}
