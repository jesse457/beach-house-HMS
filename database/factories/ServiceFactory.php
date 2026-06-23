<?php

namespace Database\Factories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    private array $services = [
        [
            'name' => 'Room Service',
            'description' => 'Enjoy gourmet meals delivered directly to your room, available 24 hours a day. Our culinary team prepares a diverse menu featuring local Cameroonian specialties and international cuisine. Whether you\'re craving a late-night snack or a full-course dinner, our room service ensures you dine in the comfort and privacy of your own space. Orders are typically delivered within 30 minutes.',
            'icon' => 'UtensilsCrossed',
            'category' => 'Dining',
        ],
        [
            'name' => 'Spa & Wellness',
            'description' => 'Rejuvenate your body and mind at our world-class spa facility. We offer a comprehensive range of treatments including deep tissue massage, aromatherapy, hot stone therapy, facial treatments, and body wraps. Our certified therapists use premium natural products sourced from local Cameroonian ingredients. The spa features private treatment rooms, a steam room, a sauna, and a relaxation lounge overlooking the ocean.',
            'icon' => 'Sparkles',
            'category' => 'Wellness',
        ],
        [
            'name' => 'Airport Shuttle',
            'description' => 'Start and end your journey stress-free with our complimentary airport shuttle service. Our fleet of modern, air-conditioned vehicles operates between Douala International Airport and the hotel. Professional drivers track your flight in real-time to adjust for any delays, ensuring a seamless pickup experience. The shuttle runs on a scheduled basis, with private transfers available upon request for an additional fee.',
            'icon' => 'Plane',
            'category' => 'Transport',
        ],
        [
            'name' => 'Swimming Pool',
            'description' => 'Take a refreshing dip in our expansive outdoor swimming pool, surrounded by lush tropical gardens and comfortable sun loungers. The infinity-edge pool offers breathtaking views of the Atlantic Ocean and Mount Cameroon. A dedicated children\'s splash area ensures fun for the whole family. Poolside service is available for drinks and light meals. The pool area is open daily from 6:00 AM to 10:00 PM with lifeguard supervision.',
            'icon' => 'Waves',
            'category' => 'Recreation',
        ],
        [
            'name' => 'Restaurant & Bar',
            'description' => 'Savor exceptional dining at our on-site restaurant, where our chefs blend traditional Cameroonian flavors with contemporary culinary techniques. The restaurant serves a daily breakfast buffet, à la carte lunch, and an elegant dinner service. Our fully-stocked bar features an extensive wine list, craft cocktails, and premium spirits. Live music performances on weekends create the perfect ambiance for a memorable evening.',
            'icon' => 'Wine',
            'category' => 'Dining',
        ],
        [
            'name' => 'Fitness Center',
            'description' => 'Maintain your workout routine in our state-of-the-art fitness center, equipped with the latest cardio machines, free weights, and strength training equipment. The facility includes treadmills, elliptical machines, stationary bikes, a multi-gym station, and a dedicated stretching area. Personal training sessions can be arranged upon request. The fitness center is accessible 24/7 with your room key card.',
            'icon' => 'Dumbbell',
            'category' => 'Wellness',
        ],
        [
            'name' => 'Concierge Services',
            'description' => 'Our dedicated concierge team is available around the clock to help you make the most of your stay. We can arrange local tours to Limbe Botanic Garden, Mount Cameroon hiking expeditions, and visits to the Limbe Wildlife Centre. Additional services include restaurant reservations, transportation arrangements, event tickets, laundry and dry cleaning, currency exchange, and babysitting services.',
            'icon' => 'Bell',
            'category' => 'Guest Services',
        ],
        [
            'name' => 'Business Center',
            'description' => 'Stay productive with our fully-equipped business center, designed for the modern business traveler. Facilities include high-speed computers, a laser printer, scanner, photocopier, and fax machine. We also offer two private meeting rooms with video conferencing capabilities, a boardroom that seats up to 20 people, and a small event space for workshops or presentations. High-speed WiFi is available throughout the hotel.',
            'icon' => 'Briefcase',
            'category' => 'Business',
        ],
        [
            'name' => 'Laundry & Dry Cleaning',
            'description' => 'Keep your wardrobe fresh and clean with our professional laundry and dry cleaning service. Same-day service is available for items dropped off before 9:00 AM. We use eco-friendly detergents and gentle cleaning processes to care for delicate fabrics. Express pressing service, shoe shine, and minor clothing repairs are also available upon request.',
            'icon' => 'Shirt',
            'category' => 'Guest Services',
        ],
        [
            'name' => 'Beach Access',
            'description' => 'Enjoy direct private access to the beautiful black sand beaches of Limbe from our hotel grounds. Beach umbrellas, loungers, and towels are provided complimentary for our guests. Our beach attendants can arrange water sports activities including kayaking, paddleboarding, and snorkeling. The beach area is regularly cleaned and maintained, with security personnel ensuring guest safety during daylight hours.',
            'icon' => 'Palmtree',
            'category' => 'Recreation',
        ],
        [
            'name' => 'Event & Conference Facilities',
            'description' => 'Host memorable events in our versatile event spaces, suitable for weddings, corporate conferences, banquets, and private celebrations. Our grand ballroom accommodates up to 300 guests, while smaller breakout rooms are ideal for intimate gatherings. We provide full event planning services including catering, audiovisual equipment, decoration, and entertainment coordination. Our experienced events team ensures every detail is handled with care.',
            'icon' => 'Calendar',
            'category' => 'Business',
        ],
        [
            'name' => 'Car Rental & Tours',
            'description' => 'Explore Limbe and the surrounding Southwest Region at your own pace with our car rental service. We offer a range of well-maintained vehicles from compact cars to SUVs, with or without a driver. Guided tour packages are also available, taking you to must-see destinations including the Limbe Botanic Garden, Bimbia Slave Trade Village, Debundscha Falls, and the Bakebe Waterfalls.',
            'icon' => 'Car',
            'category' => 'Transport',
        ],
    ];

    public function definition(): array
    {
        $service = $this->faker->unique()->randomElement($this->services);

        return [
            'name' => $service['name'],
            'description' => $service['description'],
            'icon' => $service['icon'],
            'image' => null,
            'category' => $service['category'],
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
}
