# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Beach House Bota Land — a hotel/resort management system built with **Laravel 13**, **Filament 5**, **Inertia.js 3**, and **React 19**. The application has three interfaces: a public-facing booking site (Inertia/React), an admin panel (Filament), and a reception desk panel (Filament).

## Project Directory Structure

```
HMS/
├── app/
│   ├── Enums/
│   │   ├── BookingStatus.php      # pending, checked_in, checked_out, cancelled
│   │   ├── BookingType.php        # stay, event, walk_in
│   │   ├── PaymentStatus.php      # completed, partial, pending, failed
│   │   ├── PaymentType.php        # ORDER, BOOKING, TOTAL
│   │   └── UserRole.php           # admin, receptionist, staff
│   ├── Filament/
│   │   ├── Admin/
│   │   │   ├── Resources/
│   │   │   │   ├── Amenities/     # AmenityResource (List, Create, View, Edit)
│   │   │   │   ├── Galleries/     # GalleryResource (List, Create, Edit)
│   │   │   │   ├── Payments/      # PaymentResource (List, Create, Edit)
│   │   │   │   ├── Rooms/         # RoomResource (List, Create, View, Edit)
│   │   │   │   ├── RoomTypes/     # RoomTypeResource (List, Create, View, Edit)
│   │   │   │   ├── Teams/         # TeamResource (List, Create, Edit)
│   │   │   │   └── Users/         # UserResource (List, Create, View, Edit)
│   │   │   └── Widgets/
│   │   │       ├── BookingStatusChart.php
│   │   │       ├── DashboardStatsOverview.php
│   │   │       ├── LatestBookings.php
│   │   │       └── RevenueTrendChart.php
│   │   └── Reception/
│   │       ├── Resources/
│   │       │   ├── Bookings/      # BookingResource (List, Create, Edit)
│   │       │   ├── GuestOrders/   # GuestOrderResource (List, Create, Edit)
│   │       │   ├── Guests/        # GuestResource (List, Create, Edit)
│   │       │   ├── Payments/      # PaymentResource (List, Create, Edit)
│   │       │   └── Rooms/         # RoomResource (List, Create, View, Edit)
│   │       └── Widgets/
│   │           ├── ReceptionStats.php
│   │           └── TodayArrivals.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Controller.php         # Abstract base
│   │   │   ├── BookingController.php  # store() — public booking flow
│   │   │   ├── MainController.php     # index(), gallery() — homepage & gallery
│   │   │   └── RoomController.php     # index(), show() — room listing & detail
│   │   ├── Middleware/
│   │   │   └── HandleInertiaRequests.php  # Shares flash messages, sets root template
│   │   └── Requests/
│   │       ├── StoreBookingRequest.php
│   │       ├── StoreGuestRequest.php
│   │       └── UpdateBookingRequest.php
│   ├── Models/
│   │   ├── Amenity.php            # Has rooms() and bookings() BelongsToMany
│   │   ├── AmenityBooking.php     # Pivot-like model, booking_amenity table
│   │   ├── AmenityRoom.php        # Pivot model, amenity_room table
│   │   ├── Booking.php            # CENTRAL MODEL — see relationships below
│   │   ├── BookingRoom.php        # Pivot model, booking_room table
│   │   ├── Gallery.php            # Media gallery items
│   │   ├── Guest.php              # Has many bookings
│   │   ├── GuestOrder.php         # Food/drink/service orders during stay
│   │   ├── GuestOrderItem.php     # Line items in a guest order
│   │   ├── Payment.php            # Payments against bookings
│   │   ├── Room.php               # Room with casted pictures/videos arrays
│   │   ├── RoomType.php           # Room categories
│   │   ├── TeamMember.php         # Staff/team for public team page
│   │   └── User.php               # Auth user with Filament panel access
│   ├── Notifications/
│   │   └── UserInvitationNotification.php  # Mail notification for new users
│   ├── Policies/
│   │   └── BookingPolicy.php      # Empty — no auth policies defined yet
│   └── Providers/
│       ├── AppServiceProvider.php          # Gates (viewLogViewer, viewSchedulerList), weekly R2 backup schedule, Scramble API docs
│       └── Filament/
│           ├── AdminPanelProvider.php      # /admin panel config
│           └── ReceptionPanelProvider.php  # /reception panel config
├── bootstrap/
│   ├── app.php                     # Routing, middleware, health checks
│   └── providers.php               # Service provider registration
├── config/                         # Laravel config files
│   ├── app.php, auth.php, cache.php, database.php
│   ├── filesystems.php             # Local, public, S3 disks
│   ├── livewire.php, logging.php, log-viewer.php, mail.php
│   ├── octane.php                  # FrankenPHP server config
│   ├── queue.php, sanctum.php
│   ├── scramble.php                # API documentation config
│   ├── services.php, session.php
│   ├── backup.php                  # Cloudflare R2 weekly backup config
│   ├── scheduler-list.php          # Scheduler dashboard access config
├── database/
│   ├── factories/                  # 9 factories: Amenity, Booking, Guest,
│   │                               #   GuestOrder, GuestOrderItem, Payment,
│   │                               #   Room, RoomType, User
│   ├── migrations/                 # 15 migrations covering all tables
│   └── seeders/
│       └── DatabaseSeeder.php      # Seeds users, amenities, room types,
│                                   #   rooms, guests, bookings, orders, payments
├── docker/
│   └── supervisord.conf            # Supervisor: octane + queue worker
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   │   ├── AmenitiesSection.tsx    # Amenities grid with Heroicon rendering
│   │   │   ├── CartIcon.tsx            # Cart badge
│   │   │   ├── CartSidebar.tsx         # Slide-in cart panel
│   │   │   ├── Footer.tsx              # Global footer
│   │   │   ├── GallerySection.tsx      # Homepage gallery
│   │   │   ├── MobileMenu.tsx          # Mobile nav
│   │   │   ├── Navbar.tsx              # Global nav
│   │   │   └── ui/Button.tsx           # Reusable button component
│   │   ├── Context/
│   │   │   └── CartContext.tsx         # Cart state (localStorage-backed)
│   │   ├── Layouts/
│   │   │   └── Layout.tsx              # Root layout (Navbar + Footer)
│   │   ├── Pages/
│   │   │   ├── Home.tsx                # Public homepage
│   │   │   ├── Bookings/Create.tsx     # Checkout page
│   │   │   ├── Main/Team.tsx           # Team members page
│   │   │   ├── Main/Location.tsx       # Hotel location page
│   │   │   ├── Rooms/Gallery.tsx       # Full gallery
│   │   │   ├── Rooms/Index.tsx         # Room listing
│   │   │   ├── Rooms/Show.tsx          # Room detail
│   │   │   └── User/Show.tsx           # User profile
│   │   └── ssr.tsx                     # SSR entry point
│   └── views/
│       └── app.blade.php               # Root Inertia template
├── routes/
│   ├── web.php                     # Public site routes
│   ├── api.php                     # API routes (sanctum-protected)
│   └── console.php                 # Console routes
├── tests/
│   ├── Pest.php                    # Pest config (extends TestCase)
│   ├── TestCase.php                # Base TestCase
│   ├── Unit/                       # Unit tests
│   └── Feature/                    # Feature tests
├── Dockerfile                      # Multi-stage build (composer → node → frankenphp)
├── docker-compose.yml              # App + MariaDB + MinIO services
├── composer.json                   # PHP dependencies
├── package.json                    # Node dependencies
├── vite.config.js                  # Vite config
├── phpunit.xml                     # PHPUnit/Pest config (SQLite :memory:)
└── .github/workflows/
    └── deploy.yml                  # CI/CD pipeline
```

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
php artisan octane:start          # Production server (FrankenPHP)
```

### Testing

```bash
# Run the full test suite (Pest PHP, sqlite in-memory)
composer run test

# Run specific test file
php artisan test tests/Feature/BookingTest.php

# Run with Pest directly (with filtering)
./vendor/bin/pest --filter="test name pattern"

# Run a specific test directory
./vendor/bin/pest tests/Unit/
```

Tests use SQLite in-memory (`:memory:`), environment is set via `phpunit.xml`. The test framework is **Pest** (not PHPUnit), with `pestphp/pest-plugin-laravel` for Laravel integration. Use `RefreshDatabase` trait in Feature tests. All tests extend `Tests\TestCase`.

### Code Quality

```bash
./vendor/bin/pint                # Laravel Pint (PHP CS fixer), PSR-12
```

### Artisan & Other

```bash
php artisan migrate:fresh --seed # Fresh DB with seeders
php artisan storage:link         # Symlink public/storage → storage/app/public
php artisan optimize             # Cache config, routes, views
```

## Architecture

### Three-Tier Application

| Tier | Path | Panel Provider | Auth |
|------|------|----------------|------|
| Public site | `/` (Inertia/React) | None | Optional (guests) |
| Reception | `/reception` (Filament) | `ReceptionPanelProvider` | Admin + Receptionist |
| Admin | `/admin` (Filament) | `AdminPanelProvider` | Admin only |

Panel access is enforced in `User::canAccessPanel()` (`app/Models/User.php`), keyed on the `UserRole` enum (`admin`, `receptionist`, `staff`).

### Logging Architecture

Production logging uses a **stack channel** (`LOG_CHANNEL=stack`, `LOG_STACK=stderr,single`) writing simultaneously to:
1. **stderr** — captured by Docker, visible via `docker logs botaland_app`
2. **single** — `storage/logs/laravel.log` (local file, viewable in Log Viewer)

All controllers use structured logging with timing and context via `Log::info()`:
```php
Log::info('Homepage rendered', ['amenities' => $amenities->count(), 'time_ms' => round($elapsed, 1)]);
```

Host logs are mounted into the container for centralized viewing:

| Host Path | Container Path | Log Viewer Label |
|-----------|---------------|-----------------|
| `/home/jesse/logs/nginx/access.log` | `/var/log/host/nginx/access.log` | Nginx |
| `/home/jesse/logs/nginx/error.log` | `/var/log/host/nginx/error.log` | Nginx |
| `/home/jesse/logs/docker/app.log` | `/var/log/host/docker/app.log` | Docker |

The volume is mounted **read-only** in `docker-compose.yml`:
```yaml
volumes:
  - /home/jesse/logs:/var/log/host:ro
```

Nginx logs are routed to the shared directory via `access_log`/`error_log` directives in `/etc/nginx/sites-enabled/botaland`. Docker logs are captured by a host crontab: `*/5 * * * * docker logs botaland_app --since 5m >> /home/jesse/logs/docker/app.log`.

### Monitoring Tools

#### Log Viewer (`/log-viewer`)

`opcodesio/log-viewer` v3.24 — classified log browser at `/log-viewer`. Configuration in `config/log-viewer.php`:
- `require_auth_in_production` → `true` (no unauthenticated access in production)
- `include_files` — maps host log paths to labeled folders:
  - `*.log` + `**/*.log` — Laravel app logs (shown as "root")
  - `/var/log/host/nginx/*` → labeled "Nginx"
  - `/var/log/host/docker/*` → labeled "Docker"
- `hide_unknown_files` → `true` (filters non-log files like `octane-server-state.json`)

Authorization: `Gate::define('viewLogViewer', ...)` in `AppServiceProvider` restricts access to admin and receptionist roles. Guest users are redirected to login by `redirectGuestsTo` middleware in `bootstrap/app.php`.

#### Scheduler List (`/schedulers`)

`devakshay/scheduler-list-laravel` v1.0 — dashboard to view and manually run scheduled tasks at `/schedulers`. Configuration in `config/scheduler-list.php`:
- Protected by `web` + `auth` middleware
- Access gated by `viewSchedulerList` ability (same admin/receptionist roles as Log Viewer)
- Manual execution enabled, output limited to 12,000 characters

### Request Flow (Public Site)

1. Route (`routes/web.php`) → Controller → Inertia response
2. `HandleInertiaRequests` middleware (`app/Http/Middleware/HandleInertiaRequests.php`) shares flash messages (`success`, `error`) globally and sets root template `resources/views/app.blade.php`
3. React pages live in `resources/js/Pages/`, organized by feature:
   - `Home.tsx` — landing page with amenities, featured gallery, rooms
   - `Rooms/Index.tsx` — paginated room listing (8 per page) with filters
   - `Rooms/Show.tsx` — single room detail with media gallery
   - `Rooms/Gallery.tsx` — full media gallery (Gallery items + Room media)
   - `Bookings/Create.tsx` — checkout/booking form
   - `Main/Team.tsx` — team/staff page
   - `Main/Location.tsx` — hotel location/map
   - `User/Show.tsx` — user profile
4. Layout: `resources/js/Layouts/Layout.tsx` wraps pages with Navbar and Footer
5. Cart state is managed via React Context (`resources/js/Context/CartContext.tsx`), persisted to `localStorage` under key `bhb_cart`
6. Booking flow: user browses rooms → adds to cart → checkout at `/checkout` → POST to `/bookings` (`BookingController@store`)

### Web Routes Detail

| Method | URI | Handler | Purpose |
|--------|-----|---------|---------|
| GET | `/` | `MainController@index` | Homepage |
| GET | `/rooms` | `RoomController@index` | Room listing (paginated, filtered) |
| GET | `/rooms/{room}` | `RoomController@show` | Room detail |
| GET | `/gallery` | `MainController@gallery` | Full media gallery |
| GET | `/team` | Closure → `Main/Team` | Team members page |
| GET | `/location` | Closure → `Main/Location` | Location page |
| GET | `/checkout` | Closure → `Bookings/Create` | Checkout page |
| POST | `/bookings` | `BookingController@store` | Process booking |
| GET | `/bookings/{booking}/receipt` | Blade view | Booking receipt |

### API Routes

| Method | URI | Middleware | Purpose |
|--------|-----|------------|---------|
| POST | `/api/login` | None | Authentication |
| GET | `/api/user` | `auth:sanctum` | Current user |
| GET/POST/PUT/DELETE | `/api/sunday-services` | `auth:sanctum` | SundayService resource |

## Models & Key Relationships

### Entity-Relationship Diagram

```
Guest (1) ──< (N) Booking (N) >── (N) Room
                       │
              Booking (1) ──< (N) Payment
              Booking (1) ──< (N) GuestOrder (1) ──< (N) GuestOrderItem
              Booking (1) ──< (N) AmenityBooking (N) >── (N) Amenity
                                                                  │
                                                         Amenity (N) >── (N) Room
              Booking (N) >── (N) Room (via booking_room pivot)
              Room (N) >── (1) RoomType
              User (1) ──< (N) Booking (as staff)
```

### Model Reference

#### Booking (`app/Models/Booking.php`)
The central entity. Casts: `status` → `BookingStatus`, `booking_type` → `BookingType`, `total_price`/`discount_amount` → `decimal:2`, dates → `datetime`.
- **Boot events**: Auto-generates `booking_reference` (`BK-` + 6 random chars) on create; auto-sets `actual_checked_in_at`/`actual_checked_out_at` on status change; releases room occupancy on delete.
- **Computed attributes**: `nights` (int), `balanceDue` (float), `totalPaid` (float), `totalOrders` (float).
- **Key methods**:
  - `calculateTotalBill()` — Standard rate: (rooms sum × nights) + orders + amenities - discount. Excludes room cost for WalkIn type.
  - `updateRoomOccupancy()` — Marks rooms occupied for Pending/CheckedIn, releases for CheckedOut/Cancelled. Sets room `status` to `dirty` on checkout.
- **Relationships**: `rooms()` BelongsToMany via `booking_room` pivot (with `price_at_booking`); `amenityBookings()` HasMany; `guest()` BelongsTo; `staff()` BelongsTo (User, `user_id`); `payments()` HasMany; `guestOrders()` HasMany.

#### Room (`app/Models/Room.php`)
Casts: `pictures` → `array` (JSON), `videos` → `array` (JSON), `price_per_night` → `decimal:2`, `is_occupied` → `boolean`.
- **Relationships**: `roomType()` BelongsTo; `amenities()` BelongsToMany via `amenity_room` pivot; `bookings()` BelongsToMany via `booking_room` pivot.

#### Guest (`app/Models/Guest.php`)
Fillable: `name`, `email`, `phone`, `address`, `id_card_number`.
- **Relationships**: `bookings()` HasMany.

#### Payment (`app/Models/Payment.php`)
Casts: `type` → `PaymentType`, `status` → `PaymentStatus`, `amount` → `decimal:2`, `paid_at` → `datetime`.
- **Relationships**: `booking()` BelongsTo; `guestOrders()` HasMany.

#### GuestOrder (`app/Models/GuestOrder.php`)
Casts: `total_amount` → `decimal:2`.
- **Relationships**: `items()` HasMany (GuestOrderItem); `booking()` BelongsTo; `payment()` BelongsTo.
- `refreshTotal()` recalculates `total_amount` from sum of items' `total_price`.

#### GuestOrderItem (`app/Models/GuestOrderItem.php`)
Boot events: auto-calculates `total_price = quantity × unit_price` on saving; triggers `refreshTotal()` on parent order on save/delete.

#### Amenity (`app/Models/Amenity.php`)
Casts: `icon` → `string`, `is_standalone` → `boolean`, `price` → `decimal:2`.
- **Relationships**: `rooms()` BelongsToMany via `amenity_room` pivot; `bookings()` BelongsToMany via `booking_amenity` pivot (with `price_at_booking`, `quantity`).

#### Other Models
- **RoomType**: `rooms()` HasMany. Has `name`, `description`, `capacity`.
- **Gallery**: `roomType()` BelongsTo. Has `type` (image/video), `url`, `thumbnail`, `is_active`, `sort_order`.
- **TeamMember**: No relationships. `name`, `role`, `department`, `bio`, `image`, `sort_order`.
- **User**: `managedBookings()` HasMany (Booking, `user_id`). `canAccessPanel()` gates Filament panel access.
- **BookingRoom**: Pivot model for `booking_room` table with `price_at_booking`.
- **AmenityRoom**: Pivot model for `amenity_room` table.
- **AmenityBooking**: Model for `booking_amenity` table with `booking_id`, `amenity_id`, `price_at_booking`, `quantity`.

## Enums Reference

All enums live in `app/Enums/` and implement Filament's `HasLabel`, `HasColor`, `HasIcon` interfaces.

### BookingStatus
| Case | Value | Label | Color | Icon |
|------|-------|-------|-------|------|
| Pending | `pending` | Pending | gray | `heroicon-m-clock` |
| CheckedIn | `checked_in` | In-House | success | `heroicon-m-key` |
| CheckedOut | `checked_out` | Completed | danger | `heroicon-m-check-circle` |
| Cancelled | `cancelled` | Cancelled | gray | `heroicon-m-no-symbol` |

### BookingType
| Case | Value | Label |
|------|-------|-------|
| Stay | `stay` | Room Stay |
| Event | `event` | Hall/Event Rental |
| WalkIn | `walk_in` | Walk-in (Amenities) |

### PaymentStatus
| Case | Value | Label |
|------|-------|-------|
| Completed | `completed` | Completed |
| Partial | `partial` | Partial |
| Pending | `pending` | Pending |
| Failed | `failed` | Failed |

### PaymentType
| Case | Value |
|------|-------|
| ORDER | `ORDER` |
| BOOKING | `BOOKING` |
| TOTAL | `TOTAL` |

### UserRole
| Case | Value | Label |
|------|-------|-------|
| ADMIN | `admin` | Admin |
| RECEPTIONIST | `receptionist` | Receptionist |
| STAFF | `staff` | Staff |

## Booking Billing Logic

`Booking::calculateTotalBill()` (`app/Models/Booking.php:126`) compounds three sources:
1. Room stay total (sum of room daily rates × nights, **excluded** for WalkIn type)
2. Guest orders sum (`total_amount`)
3. Amenity bookings sum (`price_at_booking × quantity`)

Then subtracts `discount_amount`. The result is `total_price`.

`Booking::getBalanceDueAttribute()` computes: `(total_price + guest_orders_total) - total_payments`.

## App Service Provider (`app/Providers/AppServiceProvider.php`)

Centralizes application bootstrapping:

**Authorization Gates**:
```php
Gate::define('viewLogViewer', fn(User $user) => in_array($user->role, [UserRole::ADMIN, UserRole::RECEPTIONIST]));
Gate::define('viewSchedulerList', fn(User $user) => in_array($user->role, [UserRole::ADMIN, UserRole::RECEPTIONIST]));
```

**Scheduled Tasks** — registered via `afterResolving(Schedule::class, ...)` so they fire for both HTTP requests (scheduler UI) and CLI (`schedule:work`):
- `backup:run` — Weekly on Sundays at 02:00, without overlapping, runs in background. On failure, logs an error via `Log::error()`.

**Other**: Forces HTTPS in non-local environments, configures Scramble API docs with Bearer token security.

## Automated Backups

Weekly backups to **Cloudflare R2** (S3-compatible) using a custom backup script. Configuration in `config/backup.php`:

| Setting | Default | Purpose |
|---------|---------|---------|
| `BACKUP_KEEP` | 10 | Retain last N backups on R2 |
| `BACKUP_TEMP_DIR` | `storage/app/backups` | Local temp path for archive |
| Sources | database + media | What gets backed up |

The backup archives MySQL dumps and media files (S3/MinIO storage), uploads them to an R2 bucket, and prunes old backups beyond the retention count.

**Schedule**: Sundays at 2am via `AppServiceProvider` → `afterResolving(Schedule::class, ...)`. Manual runs available via `/schedulers` dashboard or `php artisan backup:run`.

## Filament Admin Panel (`/admin`)

**Panel Provider**: `app/Providers/Filament/AdminPanelProvider.php`
- Brand: "Beach House Bota Land"
- Sidebar: collapsible (15rem expanded, 4rem collapsed)
- Resources discovered under `app/Filament/Admin/Resources/`

### Admin Resources

| Resource | Model | Icon | Pages |
|----------|-------|------|-------|
| AmenityResource | Amenity | `Sparkles` | List, Create, View, Edit |
| GalleryResource | Gallery | `Photo` | List, Create, Edit |
| PaymentResource | Payment | `Banknotes` | List, Create, Edit |
| RoomResource | Room | `Key` | List, Create, View, Edit |
| RoomTypeResource | RoomType | `Swatch` | List, Create, View, Edit |
| TeamResource | TeamMember | `UserGroup` | List, Create, Edit |
| UserResource | User | `RectangleStack` | List, Create, View, Edit |

Each resource follows the standard Filament structure: Resource class → Pages (Create/Edit/List/View) → Schemas (Form/Infolist) → Tables.

### Admin Dashboard Widgets
- `BookingStatusChart.php` — Chart of booking status distribution
- `DashboardStatsOverview.php` — Key metrics overview
- `LatestBookings.php` — Recent bookings table
- `RevenueTrendChart.php` — Revenue over time

## Filament Reception Panel (`/reception`)

**Panel Provider**: `app/Providers/Filament/ReceptionPanelProvider.php`
- Brand: "Grand Hotel Reception"
- Dark mode: enabled
- SPA mode: enabled
- Navigation groups: **Front Desk**, **Financial Management**, **Room Management**
- Database notifications: enabled
- Global search: `cmd+k` / `ctrl+k`

### Reception Resources

| Resource | Model | Icon | Navigation Group |
|----------|-------|------|-----------------|
| BookingResource | Booking | `CalendarDays` | Front Desk |
| GuestResource | Guest | `UserGroup` | Front Desk |
| GuestOrderResource | GuestOrder | `ShoppingCart` | Front Desk |
| PaymentResource | Payment | `Banknotes` | Financial Management |
| RoomResource | Room | `Key` | Room Management |

### Reception Dashboard Widgets
- `ReceptionStats.php` — Reception-specific statistics
- `TodayArrivals.php` — Today's expected check-ins

## S3 / MinIO Storage

Media (room photos/videos, gallery items, amenity icons) is stored on S3-compatible storage. Production uses MinIO (configured in `docker-compose.yml`).

The `s3` disk in `config/filesystems.php` uses env vars (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT`, `AWS_BUCKET`, `AWS_REGION`).

**URL Resolution Pattern** (used in `MainController`, `RoomController`): Controllers check if a path is already a full URL (e.g., Facebook link) before generating an S3 URL:
```php
$getUrl = function($path) use ($s3) {
    if (!$path) return null;
    return str_starts_with($path, 'http') ? $path : $s3->url($path);
};
```

## Concurrency

The booking flow (`BookingController@store`) uses `lockForUpdate()` on room queries and wraps the entire operation in a `DB::transaction()` to prevent double-booking race conditions. If another request has locked the same room row, the second request waits or fails, ensuring only one booking succeeds per room.

### Booking Transaction Flow
1. Validate input (room_ids, guest info, dates)
2. Begin `DB::transaction()`
3. `Room::whereIn(...)->lockForUpdate()->get()` — pessimistic row-level locks
4. Check each room's `is_occupied` flag
5. `Guest::firstOrCreate()` by email
6. Calculate duration (days) and total price
7. Create `Booking` record
8. Attach rooms with `price_at_booking` on pivot
9. Update `is_occupied = true` on each room
10. Commit transaction

## Docker Deployment

### Multi-stage Docker Build (`Dockerfile`)

| Stage | Base Image | Purpose |
|-------|-----------|---------|
| 1: vendor | `composer:2.7` | Install PHP dependencies (no-dev) |
| 2: frontend | `node:20-alpine` | Build Vite/React assets |
| 3: runner | `dunglas/frankenphp:1-php8.4-alpine` | Production runtime |

Runner installs: `pcntl`, `bcmath`, `gd`, `intl`, `pdo_mysql`, `zip`, `opcache`, `redis` extensions.
Uses Supervisor to manage Octane (FrankenPHP on port 8000, 2 workers, max 500 requests) and queue worker (2 processes).

### docker-compose.yml Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| app | `ghcr.io/jesse457/botaland-resort` | 8000 | Laravel Octane (FrankenPHP) |
| db | `mariadb:10.11` | internal | MariaDB with healthcheck |
| minio | `minio/minio` | 9000, 9001 | S3-compatible storage |
| minio-setup | `minio/mc` | — | Auto-creates bucket with public policy |

## Frontend Stack

- **Vite 8** with `laravel-vite-plugin`, `@vitejs/plugin-react`, and `@tailwindcss/vite` (Tailwind v4)
- **Inertia.js 3** for SPA-like navigation with server-side routing
- **React 19** with TypeScript (strict mode)
- **Framer Motion** for animations (page transitions, cart sidebar)
- **Heroicons** (`@heroicons/react`) and **Lucide** (`lucide-react`) for icon sets
- **SSR** entry point: `resources/js/ssr.tsx` (for SEO)
- **Cart state**: React Context (`CartContext`) with `localStorage` persistence keyed `bhb_cart`

## Testing Conventions

- **Framework**: Pest PHP (not PHPUnit directly)
- **Database**: SQLite in-memory (`:memory:`) via `phpunit.xml`
- **Environment**: `APP_ENV=testing`, `DB_CONNECTION=sqlite`
- **Base class**: `Tests\TestCase` extends `Illuminate\Foundation\Testing\TestCase`
- **Traits**: Use `RefreshDatabase` in Feature tests to reset DB between tests
- **Factories**: 9 model factories available in `database/factories/`
- **Naming**: Test files follow Pest convention — `tests/Unit/` and `tests/Feature/` directories with `Test.php` suffix or plain `.php` files using `test()` / `it()` functions
- **Pest config**: `tests/Pest.php` binds Feature tests to `TestCase` class

## CI/CD Pipeline (`.github/workflows/deploy.yml`)

Two-stage pipeline:
1. **test** — Checkout → PHP 8.4 + Node 20 setup → Composer install → `npm ci && npm run build` → Run Pest tests on SQLite
2. **build-and-push** (only on push to main/master, requires test pass) — Docker Buildx → Login to GHCR → Build & push multi-arch image tagged with `latest` and `${{ github.sha }}`

## Key Configuration Files

| File | Purpose |
|------|---------|
| `phpunit.xml` | Test environment (SQLite :memory:, env vars) |
| `vite.config.js` | Vite 8 with React + Tailwind plugins |
| `config/octane.php` | Octane server config (FrankenPHP) |
| `config/filesystems.php` | S3/MinIO disk configuration |
| `config/scramble.php` | API documentation (Scramble) |
| `config/log-viewer.php` | Log Viewer: auth, file includes, host log paths |
| `config/scheduler-list.php` | Scheduler dashboard: access, middleware, manual execution |
| `config/backup.php` | R2 backup: retention, sources (database + media) |
| `config/logging.php` | Log channels: stack (stderr + single), levels, formatters |
| `bootstrap/app.php` | App bootstrap, middleware registration, redirectGuestsTo for /schedulers and /log-viewer |
| `bootstrap/providers.php` | Service provider registration |
