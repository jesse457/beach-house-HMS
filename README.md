# Beach House Bota Land — Hotel Management System

A full-featured hotel/resort management system built with Laravel 13, Filament 5, Inertia.js 3, and React 19. Manages public-facing bookings, reception desk operations, and administrative control through three distinct interfaces.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Laravel 13, PHP 8.4 |
| **Admin & Reception Panels** | Filament 5 |
| **Public Site** | Inertia.js 3, React 19, TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Database** | MariaDB 10.11 (production), SQLite (testing) |
| **Storage** | MinIO (S3-compatible) |
| **Server** | FrankenPHP via Laravel Octane |
| **Container Runtime** | Docker, Supervisor |
| **CI/CD** | GitHub Actions, GHCR |
| **Testing** | Pest PHP v4.6 |

## Architecture — Three Interfaces

```
┌─────────────────────────────────────────────────────────────┐
│                     Beach House Bota Land                    │
├───────────────┬───────────────────────┬─────────────────────┤
│   Public Site │   Reception Panel     │   Admin Panel       │
│       /       │   /reception          │   /admin            │
├───────────────┼───────────────────────┼─────────────────────┤
│ Inertia/React │ Filament 5             │ Filament 5          │
│ No auth req.  │ Auth: Admin, Reception │ Auth: Admin only    │
├───────────────┼───────────────────────┼─────────────────────┤
│ • Browse rooms│ • Manage bookings      │ • All resources     │
│ • View gallery│ • Guest check-in/out   │ • User management   │
│ • Book stays  │ • Take orders          │ • Analytics widgets │
│ • Team page   │ • Process payments     │ • Media library     │
│ • Location    │ • Room status          │ • Team management   │
└───────────────┴───────────────────────┴─────────────────────┘
```

## Features

### Public Booking Site
- Browse available rooms with filtering and pagination
- Room detail pages with photo/video galleries
- Shopest checkout with booking confirmation
- Tping cart (localStorage-backed)
- Gueam/staff page
- Hotel location page
- Full media gallery with lightbox

### Reception Desk Panel (`/reception`)
- **Front Desk** — Bookings, Guests, Guest Orders
- **Financial Management** — Payments
- **Room Management** — Room status tracking (Available/Dirty/Maintenance)
- Dark mode, SPA mode, database notifications
- Global search (`Cmd+K`)

### Admin Panel (`/admin`)
- Amenities (with Heroicon picker)
- Gallery (image/video uploads to S3)
- Payments
- Room Types
- Rooms (with photo/video management)
- Team Members
- **User Management** — auto-generated password with email invitation
- Dashboard widgets: booking status chart, revenue trends, stats overview

### Core Business Logic
- **Booking lifecycle**: Pending → Checked In → Checked Out → Cancelled
- **Booking types**: Stay, Event, Walk-In
- **Billing**: rooms × nights + guest orders + amenity bookings − discounts
- **Concurrency protection**: pessimistic row-level locking (`lockForUpdate()`) within `DB::transaction()`
- **Auto-generated booking references**: `BK-XXXXXX`

### Monitoring & Operations
- **Log Viewer** (`/log-viewer`) — classified log browser with auth (admin/receptionist), showing:
  - Laravel application logs (`storage/logs/laravel.log`)
  - Nginx access & error logs (mounted from host)
  - Docker container logs (captured via cron every 5 minutes)
- **Scheduler List** (`/schedulers`) — view and manually run scheduled tasks (admin/receptionist)
- **Structured logging** — all controllers log with timing and context data (JSON)
- **Weekly backups** to Cloudflare R2 (Sundays at 2am): database + media files, keeps last 10

## Data Model

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

## Installation

### Prerequisites
- PHP 8.4+ with extensions: `bcmath`, `gd`, `intl`, `pdo_mysql`, `zip`, `opcache`, `redis`
- Node.js 20+
- Composer 2.7+
- MariaDB 10.11+ or MySQL 8+
- MinIO (or any S3-compatible storage)

### Local Development

```bash
# Clone and install
git clone https://github.com/jesse457/beach-house-HMS.git
cd beach-house-HMS
composer install
cp .env.example .env
php artisan key:generate

# Configure .env for your database and MinIO/S3
# DB_CONNECTION=mysql
# DB_DATABASE=hotel
# AWS_ACCESS_KEY_ID=minioadmin
# AWS_SECRET_ACCESS_KEY=minioadmin
# AWS_ENDPOINT=http://localhost:9000
# AWS_BUCKET=hotel-management
# AWS_USE_PATH_STYLE_ENDPOINT=true

# Run migrations
php artisan migrate

# Seed development data (users, rooms, guests, bookings)
php artisan db:seed

# Build frontend
npm install
npm run dev

# Start server
php artisan serve
```

### Production Seed (VPS)

```bash
# Set admin credentials in .env
ADMIN_NAME="Hotel Manager"
ADMIN_EMAIL="admin@yourhotel.com"
ADMIN_PASSWORD="strong-password-here"

# Optional receptionist
RECEPTIONIST_NAME="Front Desk"
RECEPTIONIST_EMAIL="reception@yourhotel.com"
RECEPTIONIST_PASSWORD="another-strong-password"

# Run only the production seeder (no fake data)
php artisan db:seed --class=ProductionSeeder --force
```

### Docker

```bash
# Build and run
docker compose up -d

# Or build the image manually
docker build -t beach-house-hms .
```

The multi-stage Dockerfile runs as non-root (`www-data`) and uses Supervisor to manage:
- **FrankenPHP** (Laravel Octane, 2 workers, max 500 requests)
- **Queue worker** (2 processes)

### Production Logging

Logs are written to stderr (captured by Docker) and a local `laravel.log` simultaneously. Host logs are shared into the container for the Log Viewer:

```
Host                          Container
/home/jesse/logs/             /var/log/host/ (read-only)
├── nginx/
│   ├── access.log            → Log Viewer: Nginx
│   └── error.log
└── docker/
    └── app.log               → Log Viewer: Docker (cron every 5m)
```

Nginx logs are routed to the shared directory via `access_log`/`error_log` directives in `/etc/nginx/sites-enabled/botaland`. Docker logs are captured by a crontab entry: `*/5 * * * * docker logs botaland_app --since 5m >> /home/jesse/logs/docker/app.log`.

**Access**: Log in at `/admin` or `/reception`, then visit `/log-viewer`. Authorized for admin and receptionist roles via `Gate::define('viewLogViewer', ...)`.

## Testing

```bash
# Full test suite (174 tests)
composer run test

# Specific test file or filter
php artisan test --filter="BookingFlow"
./vendor/bin/pest tests/Unit/EnumsTest.php
```

### Test Coverage

| Suite | Files | Tests | What's Covered |
|-------|-------|-------|---------------|
| **Unit** | 8 files | Enums, all models | Casts, relationships, business logic, panel access |
| **Feature — Public** | 3 files | Public site, booking flow, health checks | All 12 routes, validation, concurrency, CRUD |
| **Feature — Filament** | 2 files | Admin + Reception panels | All 12 resources (list/create/edit/view pages), auth enforcement |

Tests use SQLite in-memory (`:memory:`) with `RefreshDatabase` trait.

## Directory Structure

```
app/
├── Enums/                     # BookingStatus, BookingType, PaymentStatus, etc.
├── Filament/
│   ├── Admin/Resources/       # 7 resources: Amenities, Galleries, Payments,
│   │   Widgets/               #   RoomTypes, Rooms, Teams, Users
│   └── Reception/Resources/   # 5 resources: Bookings, GuestOrders, Guests,
│       Widgets/               #   Payments, Rooms
├── Http/
│   ├── Controllers/           # MainController, RoomController, BookingController
│   └── Middleware/             # HandleInertiaRequests
├── Models/                    # 12 Eloquent models
├── Providers/Filament/        # AdminPanelProvider, ReceptionPanelProvider
└── Policies/                  # Authorization policies

resources/js/
├── Components/                # Navbar, Footer, CartSidebar, AmenitiesSection, etc.
├── Context/                   # CartContext (localStorage-backed cart state)
├── Layouts/                   # Root Layout (Navbar + Footer)
└── Pages/                     # Home, Rooms/Index, Rooms/Show, Rooms/Gallery,
                               #   Bookings/Create, Main/Team, Main/Location

database/
├── factories/                 # 11 model factories
├── migrations/                # 16 migrations (including notifications)
└── seeders/
    ├── DatabaseSeeder.php     # Dev: users, rooms, guests, bookings, orders
    └── ProductionSeeder.php   # Prod: admin + optional receptionist only

tests/                         # 174 tests, 385 assertions
├── Unit/                      # Enum & model tests
└── Feature/                   # Public site, booking flow, Filament panel tests
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `ADMIN_NAME/EMAIL/PASSWORD` | Initial admin user (ProductionSeeder) |
| `RECEPTIONIST_NAME/EMAIL/PASSWORD` | Optional receptionist (ProductionSeeder) |
| `AWS_ACCESS_KEY_ID` | MinIO/S3 access key |
| `AWS_SECRET_ACCESS_KEY` | MinIO/S3 secret |
| `AWS_ENDPOINT` | S3 endpoint URL |
| `AWS_BUCKET` | S3 bucket name |
| `AWS_USE_PATH_STYLE_ENDPOINT` | `true` for MinIO |
| `DB_CONNECTION` | `mysql` for production, `sqlite` for testing |
| `LOG_CHANNEL` | `stack` (combines stderr + single for production) |
| `LOG_STACK` | Comma-separated channel list: `stderr,single` in production |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 access key (weekly backups) |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret key |
| `R2_ENDPOINT` | R2 endpoint URL |
| `R2_BUCKET` | R2 bucket name (`hotel-backups`) |
| `R2_REGION` | R2 region (`auto`) |
| `BACKUP_KEEP` | Number of backups to retain (default 10) |
| `SCHEDULER_LIST_PATH` | URL path for scheduler dashboard (default `schedulers`) |
| `LOG_VIEWER_ENABLED` | Enable/disable log viewer (default `true`) |
| `LOG_VIEWER_API_ONLY` | API-only mode for log viewer (default `false`) |

## CI/CD

GitHub Actions pipeline (`.github/workflows/deploy.yml`):

1. **Test** — PHP 8.4 + Node 20 → Composer install → `npm ci && npm run build` → Pest test suite (SQLite)
2. **Build & Push** (on push to main) — Docker Buildx → GHCR image tagged `latest` + commit SHA

## Commands Reference

```bash
# Development
composer run dev           # Start server + queue + logs + vite concurrently
php artisan serve           # Laravel dev server only
npm run dev                 # Vite HMR only

# Testing
composer run test           # Full test suite
php artisan test             # Same, with Pest

# Production
php artisan octane:start     # Start FrankenPHP server
php artisan migrate --force  # Run migrations in production
php artisan optimize         # Cache config, routes, views

# Code Quality
./vendor/bin/pint           # PHP CS Fixer (PSR-12)

# Monitoring
php artisan backup:run       # Trigger a manual backup to R2
php artisan schedule:list    # List all scheduled tasks
```

## License

Proprietary — Beach House Bota Land.
