<?php

namespace Database\Factories;

use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Room>
 */
class RoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
  public function definition(): array
{
    return [
        'room_number' => $this->faker->unique()->numberBetween(100, 500),
        'floor' => $this->faker->numberBetween(1, 5),
        'status' => 'available',
        'price_per_night' => $this->faker->randomFloat(2, 50, 300),
        'pictures' => ['room1.jpg', 'room2.jpg'],
        'videos' => [],
        'is_occupied' => false,
    ];
}
}
