<?php

namespace Database\Factories;

use App\Models\Gallery;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Gallery>
 */
class GalleryFactory extends Factory
{
    protected $model = Gallery::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'type' => $this->faker->randomElement(['image', 'video']),
            'url' => $this->faker->imageUrl(800, 600, 'hotel'),
            'thumbnail' => $this->faker->optional()->imageUrl(400, 300, 'hotel'),
            'room_type_id' => null,
            'description' => $this->faker->optional()->paragraph(),
            'is_active' => true,
            'sort_order' => $this->faker->numberBetween(1, 100),
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function video(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'video',
            'thumbnail' => $this->faker->imageUrl(400, 300, 'hotel'),
        ]);
    }

    public function image(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'image',
        ]);
    }
}
