<?php

namespace Database\Factories;

use App\Models\RoomType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RoomType>
 */
class RoomTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
  public function definition(): array
{
    return [
        'name' => $this->faker->randomElement(['Standard', 'Deluxe', 'Suite', 'Penthouse']),
        'description' => $this->faker->paragraph(),
    ];
}
}
