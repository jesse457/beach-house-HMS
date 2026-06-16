# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Beach House Bota Land - a hotel/resort management system built with Laravel 13, Filament 5, Inertia.js 3, and React 19. The application has three interfaces: a public-facing booking site (Inertia/React), an admin panel (Filament), and a reception desk panel (Filament).

## Common Commands

### Local Development

```bash
# Start all dev services (server, queue, logs, vite) concurrently
composer run dev

# Or run individually:
php artisan serve                 # Laravel dev server
npm run dev                       # Vite dev server with HMR
php artisan queue:listen          # Queue worker
php artisan pail                  # Tail logs
```

### Build & Production

```bash
npm run build                     # Build frontend assets for production
composer run setup                # Full first-time setup (install deps, migrate, build)
```

### Testing

```bash
# Run the full test suite (Pest PHP, sqlite in-memory)
composer run test

# Run specific test file
php artisan test tests/Feature/ExampleTest.php

# Run with Pest directly
./vendor/bin/pest --filter="test name pattern"
```

Tests use SQLite in-memory (`:memory:`), environment is set via `phpunit.xml`. The test framework is Pest (not PHPUnit), with Laravel plugin.

### Code Quality

```bash
./vendor/bin/pint                # Laravel Pint (PHP CS fixer), PSR-12
```

### Artisan & Other

```bash
php artisan migrate:fresh --seed # Fresh DB with seeders
php artisan storage:link         # Symlink public/storage → storage/app/public
php artisan octane:start         # Production server (FrankenPHP)
```

## Architecture

### Three-Tier Application

| Tier | Path | Panel | Auth |
|------|------|-------|------|
| Public site | `/` (Inertia/React) | None | Optional (guests) |
| Reception | `/reception` (Filament) | `reception` | Admin + Receptionist |
| Admin | `/admin` (Filament) | `admin` | Admin only |

Panel access is enforced in `User::canAccessPanel()` (`app/Models/User.php:35`), keyed on the `UserRole` enum (`admin`, `receptionist`, `staff`).

### Request Flow (Public Site)

1. Route (`routes/web.php`) → Controller → Inertia response
2. `HandleInertiaRequests` middleware (`app/Http/Middleware/HandleInertiaRequests.php`) shares flash messages (`success`, `error`) globally and sets root template `resources/views/app.blade.php`
3. React pages live in `resources/js/Pages/`, organized by feature: `Home.tsx`, `Rooms/Index.tsx`, `Rooms/Show.tsx`, `Bookings/Create.tsx` (checkout), `Main/Team.tsx`, `Main/Location.tsx`, `Rooms/Gallery.tsx`
4. Cart state is managed via React Context (`resources/js/Context/CartContext.tsx`)
5. Booking flow: user browses rooms → adds to cart → checkout at `/checkout` → POST to `/bookings` (`BookingController@store`)

### Models & Key Relationships

- **Booking** is the central entity connecting Guest, Room, Payment, AmenityBooking, and GuestOrder
- `Booking ↔ Room`: many-to-many via `booking_room` pivot (with `price_at_booking` pivot data)
- `Room ↔ Amenity`: many-to-many via `amenity_room` pivot
- `Booking ↔ Guest`: booking belongs to guest; guest has many bookings
- `Booking ↔ User`: booking belongs to staff (for reception-created bookings)
- `GuestOrder / GuestOrderItem`: orders placed during a stay (food/drink/service)
- `AmenityBooking`: standalone amenity usage billed to a booking
- `Payment`: payments against a booking
- `TeamMember`: staff/team displayed on the public team page
- `Gallery`: media items (images/videos) for the public gallery, optionally linked to a RoomType

### Booking Billing Logic

`Booking::calculateTotalBill()` (`app/Models/Booking.php:120`) compounds three sources:
1. Room stay total (sum of room daily rates × nights, excluded for WalkIn type)
2. Guest orders sum
3. Amenity bookings sum
Then subtracts `discount_amount`. The result is persisted to `total_price`.

### S3 / MinIO Storage

Media (room photos/videos, gallery items, amenity icons) is stored on S3-compatible storage. Production uses MinIO (configured in `docker-compose.yml`). The `s3` disk in `config/filesystems.php` uses env vars (`AWS_*`). Controllers resolve S3 URLs manually by checking if the path is already a full URL (e.g., Facebook) vs a storage path — see the pattern in `MainController` and `RoomController`.

### Filament Admin Panel Resources

Admin resources live under `app/Filament/Admin/Resources/`: Amenities, Galleries, Payments, RoomTypes, Rooms, Teams, Users. Each follows a standard Filament structure: Resource class → Pages (Create/Edit/List/View) → Schemas (Form/Infolist) → Tables.

### Filament Reception Panel Resources

Reception resources under `app/Filament/Reception/Resources/`: Bookings, GuestOrders, Guests, Payments, Rooms. The reception panel has dark mode enabled, navigation grouped into "Front Desk", "Financial Management", and "Room Management" categories.

### Enums

All enums live in `app/Enums/` and implement Filament's `HasLabel`, `HasColor`, `HasIcon` interfaces for native Filament integration:
- `BookingStatus`: Pending, CheckedIn, CheckedOut, Cancelled
- `BookingType`: Stay, Event, WalkIn
- `PaymentStatus` / `PaymentType`: payment state tracking
- `UserRole`: Admin, Receptionist, Staff

### Concurrency

The booking flow (`BookingController@store`) uses `lockForUpdate()` on room queries and wraps the entire operation in a `DB::transaction()` to prevent double-booking race conditions.

### Docker Deployment

Multi-stage Docker build (`Dockerfile`): composer deps → Node/Vite frontend build → FrankenPHP runner with Supervisor. `docker-compose.yml` defines: `app` (FrankenPHP on port 8000), `db` (MariaDB 10.11), `minio` (S3-compatible storage on 9000/9001), and `minio-setup` (auto-creates bucket with public policy).

### Frontend Stack

- **Vite 8** with `laravel-vite-plugin`, `@vitejs/plugin-react`, and `@tailwindcss/vite` (Tailwind v4)
- **Inertia.js** for SPA-like navigation with server-side routing
- **React 19** with TypeScript
- **Framer Motion** for animations
- **Heroicons** (`@heroicons/react`) and **Lucide** for icon sets
- SSR entry point: `resources/js/ssr.tsx`
