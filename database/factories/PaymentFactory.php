<?php

namespace Database\Factories;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'amount' => $this->faker->randomFloat(2, 10, 500),
            'payment_method' => $this->faker->randomElement(['cash', 'credit_card', 'bank_transfer', 'mobile_money']),
            'status' => \App\Enums\PaymentStatus::Completed,
            'type' => \App\Enums\PaymentType::BOOKING,
            'paid_at' => now(),
        ];
    }
}
