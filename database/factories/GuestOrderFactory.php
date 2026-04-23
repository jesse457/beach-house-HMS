<?php

namespace Database\Factories;

use App\Models\GuestOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GuestOrder>
 */
class GuestOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
  public function definition(): array
{
    return [
        'total_amount' => 0, // Calculated by items
        'status' => 'pending',
    ];
}
}
