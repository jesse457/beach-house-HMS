<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AmenityFactory extends Factory
{
    public function definition(): array
    {
        // Define a list of logical hotel amenities and their corresponding Heroicons
        $amenities = [
            'Free High-Speed WiFi' => 'heroicon-o-wifi',
            'Smart TV / Netflix' => 'heroicon-o-tv',
            'Air Conditioning' => 'heroicon-o-snowflake',
            'Mini Bar' => 'heroicon-o-beaker',
            'Room Safe' => 'heroicon-o-key',
            'Swimming Pool' => 'heroicon-o-swatch',
            'Breakfast Included' => 'heroicon-o-sun',
            'Gym Access' => 'heroicon-o-bolt',
            '24/7 Room Service' => 'heroicon-o-bell',
            'Free Parking' => 'heroicon-o-truck',
            'Laundry Service' => 'heroicon-o-scissors',
            'Security Box' => 'heroicon-o-shield-check',
        ];

        // Pick a random amenity name from the keys
        $name = $this->faker->unique()->randomElement(array_keys($amenities));

        return [
            'name' => $name,
            'description' => $this->faker->sentence(),
            // Select the icon that matches the name chosen above
            'icon' => $amenities[$name],
        ];
    }
}
