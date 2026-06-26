<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\MainController;
use App\Http\Controllers\RoomController;
use App\Models\Booking;
use App\Models\Review;
use App\Models\Service;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

/**
 * HOME PAGE
 */
Route::get('/',[MainController::class, 'index'])->name('home');

/**
 * ROOMS INDEX (With Advanced Filtering)
 */
Route::get('/rooms', [RoomController::class, 'index'])->name('rooms.index');

Route::get('/gallery', [MainController::class, 'gallery'])->name('gallery');



Route::get('/team', function (Request $request) {
    $members = TeamMember::orderBy('sort_order')->get()->map(function ($member) {
        // If there is an image and it's not already a full URL, get S3 URL
        if ($member->image && !filter_var($member->image, FILTER_VALIDATE_URL)) {
            $member->image = Storage::disk('s3')->url($member->image);
        }
        return $member;
    });

    return Inertia::render('Main/Team', [
        'members' => $members
    ]);
})->name('team');

Route::get('/services', function (Request $request) {
    $services = Service::where('is_active', true)
        ->orderBy('sort_order')
        ->get()
        ->map(function ($service) {
            if ($service->image && !filter_var($service->image, FILTER_VALIDATE_URL)) {
                $service->image = Storage::disk('s3')->url($service->image);
            }
            return $service;
        });

    return Inertia::render('Main/Services', [
        'services' => $services
    ]);
})->name('services');

Route::get('/location', function (Request $request) {
    return Inertia::render('Main/Location');
})->name('location');

/**
 * REVIEWS — public listing and submission
 */
Route::get('/reviews', function (Request $request) {
    $reviews = Review::approved()
        ->latest()
        ->paginate(9);

    return Inertia::render('Main/Reviews', [
        'reviews' => $reviews,
    ]);
})->name('reviews');

Route::post('/reviews', function (Request $request) {
    $validated = $request->validate([
        'author_name' => 'required|string|max:255',
        'email' => 'nullable|email|max:255',
        'rating' => 'required|integer|min:1|max:5',
        'content' => 'required|string|max:2000',
    ]);

    Review::create($validated + ['is_approved' => false]);

    return redirect()->back()->with('success', 'Thank you for your review! It will be visible once approved.');
})->name('reviews.store');

/**
 * ROOM DETAILS
 */
Route::get('/rooms/{room}', [RoomController::class, 'show'])->name('rooms.show');

/**
 * CHECKOUT PAGE
 * Handles the "Cart" view before final submission
 */
Route::get('/checkout', function () {
    return Inertia::render('Bookings/Create');
})->name('checkout');

/**
 * PROCESS BOOKING (Multi-room Support)
 */
Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');

Route::get('/bookings/{booking}/receipt', function (Booking $booking) {
    // Eager load everything to prevent N+1 queries
    $booking->load(['guest', 'rooms', 'amenityBookings', 'guestOrders.items', 'payments']);

    return view('receipts.booking', compact('booking'));
})->name('bookings.receipt');

/**
 * SEO: Dynamic sitemap listing all public pages
 */
Route::get('/sitemap.xml', function () {
    $rooms = \App\Models\Room::with('roomType')->get();
    return response()->view('sitemap', ['rooms' => $rooms])
        ->header('Content-Type', 'application/xml');
});
