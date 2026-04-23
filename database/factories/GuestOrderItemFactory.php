<?php

namespace Database\Factories;

use App\Models\GuestOrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GuestOrderItem>
 */
class GuestOrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $price = $this->faker->randomFloat(2, 5, 50);
        $qty = $this->faker->numberBetween(1, 3);

        return [
            'item_name' => $this->faker->word(),
            'category' => $this->faker->randomElement(['food', 'drink', 'service']),
            'unit_price' => $price,
            'quantity' => $qty,
            'total_price' => $price * $qty,
        ];
    }
}
