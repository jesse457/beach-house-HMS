<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Casts\Attribute;

class TeamMember extends Model
{
    protected $fillable = [
        'name',
        'role',
        'department',
        'bio',
        'image',
        'sort_order',
    ];

   
}
