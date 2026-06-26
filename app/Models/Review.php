<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

#[Table('reviews')]
#[Fillable(['author_name', 'email', 'content', 'rating', 'is_approved'])]
class Review extends Model
{
    use HasFactory;

    /**
     * Scope a query to only include approved reviews.
     */
    public function scopeApproved(Builder $query): void
    {
        $query->where('is_approved', true);
    }
}
