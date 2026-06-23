# --- Stage 1: PHP Dependencies ---
FROM composer:2.7 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
# Added --ignore-platform-reqs to bypass extension/PHP version checks during build
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --prefer-dist \
    --ignore-platform-reqs

# --- Stage 2: Frontend Assets ---
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json vite.config.js ./
COPY resources/ ./resources/
COPY public/ ./public/
RUN npm ci && npm run build

# --- Stage 3: Final Production Image ---
# Upgraded to PHP 8.4 to match your composer.lock requirements
FROM dunglas/frankenphp:1-php8.4-alpine AS runner

# Install necessary system extensions (intl is included here for Filament!)
RUN apk add --no-cache supervisor mariadb-client && \
    install-php-extensions \
    pcntl \
    bcmath \
    gd \
    intl \
    pdo_mysql \
    zip \
    opcache \
    redis

# Use the default production configuration
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

WORKDIR /app

# Copy application code
COPY . .

# Copy dependencies from previous stages
COPY --from=vendor /app/vendor ./vendor
COPY --from=frontend /app/public/build ./public/build

# Copy the Supervisor configuration file
COPY docker/supervisord.conf /etc/supervisord.conf

# Create writable directories for supervisor and runtime files
# ADDED /app/public to the chown list so Octane can write frankenphp-worker.php
RUN mkdir -p /var/log/supervisor /run /app/storage/logs /app/storage/app/backups && \
    chown -R www-data:www-data \
    /app/storage \
    /app/bootstrap/cache \
    /app/vendor \
    /app/public \
    /var/log/supervisor \
    /run \
    /tmp

# Drop to non-root user for runtime security
USER www-data

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/up || exit 1

EXPOSE 8000

# Start Laravel Octane via Supervisor (running as www-data)
ENTRYPOINT ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
