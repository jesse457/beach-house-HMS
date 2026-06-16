<?php

namespace Database\Factories;

use App\Models\TeamMember;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TeamMember>
 */
class TeamMemberFactory extends Factory
{
    protected $model = TeamMember::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'role' => $this->faker->randomElement([
                'General Manager',
                'Front Desk Manager',
                'Head Chef',
                'Housekeeping Supervisor',
                'Concierge',
                'Spa Manager',
            ]),
            'department' => $this->faker->randomElement([
                'Management',
                'Front Desk',
                'Kitchen',
                'Housekeeping',
                'Guest Services',
                'Spa & Wellness',
            ]),
            'bio' => $this->faker->paragraph(2),
            'image' => $this->faker->optional()->imageUrl(300, 300, 'person'),
            'sort_order' => $this->faker->numberBetween(1, 50),
        ];
    }
}
