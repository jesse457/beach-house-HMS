<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Default meta description — individual pages override via the SEO component --}}
        <meta name="description" content="Experience luxury at Beach House Botaland, a Mediterranean-style beach resort in Limbe, Cameroon. Book your stay with ocean views, fine dining, and premium amenities." />

        {{-- Canonical URL — individual pages override via the SEO component --}}
        <link rel="canonical" href="{{ url()->current() }}" />

        {{-- Open Graph defaults --}}
        <meta property="og:site_name" content="Beach House Botaland" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />

        {{-- Twitter Card --}}
        <meta name="twitter:card" content="summary_large_image" />

        @viteReactRefresh
        @vite('resources/js/app.tsx')
        <x-inertia::head />
    </head>
    <body>
        <x-inertia::app />
    </body>
</html>
