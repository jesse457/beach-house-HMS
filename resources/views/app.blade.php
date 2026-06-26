<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Preload LCP hero image for faster Largest Contentful Paint --}}
        <link rel="preload" as="image" href="{{ asset('images/beach-day2.webp') }}" fetchpriority="high">

        {{-- Favicon (multiple sizes for browser tabs, bookmarks, and home screen) --}}
        <link rel="icon" href="{{ asset('favicon.ico') }}" />
        <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('favicon-16.png') }}" />
        <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon-32.png') }}" />
        <link rel="icon" type="image/png" sizes="96x96" href="{{ asset('favicon-96.png') }}" />
        <link rel="icon" type="image/png" sizes="192x192" href="{{ asset('favicon-192.png') }}" />
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}" />

        {{-- Default meta description — individual pages override via the SEO component --}}
        <meta name="description" content="Experience luxury at Beach House Botaland, a Mediterranean-style beach resort in Limbe, Cameroon. Book your stay with ocean views, fine dining, and premium amenities." />

        {{-- Canonical URL — individual pages override via the SEO component --}}
        <link rel="canonical" href="{{ url()->current() }}" />

        {{-- Open Graph defaults --}}
        <meta property="og:site_name" content="Beach House Botaland" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="{{ asset('images/logo.webp') }}" />
        <meta property="og:image:width" content="600" />
        <meta property="og:image:height" content="655" />

        {{-- Twitter Card --}}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="{{ asset('images/logo.webp') }}" />

        @viteReactRefresh
        @vite('resources/js/app.tsx')
        <x-inertia::head />
    </head>
    <body>
        <x-inertia::app />
    </body>
</html>
