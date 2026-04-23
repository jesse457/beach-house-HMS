<?php

namespace Database\Factories;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
   public function definition(): array
{
    $checkIn = $this->faker->dateTimeBetween('-1 month', '+1 month');
    return [
        'status' => \App\Enums\BookingStatus::Pending,
        'total_price' => $this->faker->randomFloat(2, 100, 1000),
        'checked_in_at' => $checkIn,
        'checked_out_at' => (clone $checkIn)->modify('+'.rand(1, 7).' days'),
    ];
}
}
