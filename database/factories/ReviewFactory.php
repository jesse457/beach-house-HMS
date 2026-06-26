<?php

namespace Database\Factories;

use App\Models\Review;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    protected $model = Review::class;

    public function definition(): array
    {
        return [
            'author_name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'content' => fake()->randomElement([
                'Absolutely stunning property! The views of the ocean from our room were breathtaking. The staff went above and beyond to make our stay memorable. Will definitely return.',
                'A hidden gem in Limbe. The Mediterranean-style architecture is beautiful, and the private peninsula setting makes you feel like royalty. The food was exceptional.',
                'We hosted our company retreat here and it was perfect. The meeting hall was well-equipped, the rooms were luxurious, and the team helped with every detail. Highly recommended.',
                'The spa treatments were world-class and the infinity pool overlooking the Atlantic is something I will never forget. This is hands down the best resort in the region.',
                'From the airport pickup to the checkout, everything was seamless. The room was spotless, the bed incredibly comfortable, and the sunrise views were magical.',
                'Our family vacation here was unforgettable. The kids loved the pool, we loved the fine dining, and everyone enjoyed the warm Cameroonian hospitality. A true paradise.',
                'I have stayed at many beach resorts, but Beach House Botaland stands out for its attention to detail. Fresh flowers in the room, personalized service, and the most amazing seafood.',
                'Perfect romantic getaway. The sunset views from the terrace, candlelit dinners by the water, and the peaceful atmosphere made it an ideal escape for couples.',
            ]),
            'rating' => fake()->numberBetween(3, 5),
            'is_approved' => true,
        ];
    }

    /**
     * Indicate that the review is unapproved.
     */
    public function unapproved(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_approved' => false,
        ]);
    }
}
