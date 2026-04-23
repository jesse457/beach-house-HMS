<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable( [
        'name',
        'role',
        'department',
        'bio',
        'image',
        'sort_order',
    ]) ]
class TeamMember extends Model
{
    //
}
