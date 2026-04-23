<?php

namespace App\Enums;

enum PaymentType: string
{
    case ORDER = 'order';
    case BOOKING = 'booking';
    case TOTAL = 'total';
}
