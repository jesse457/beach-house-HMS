<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    <url>
        <loc>{{ url('/') }}</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
        <image:image>
            <image:loc>{{ asset('images/logo.webp') }}</image:loc>
            <image:title>Beach House Bota Land</image:title>
        </image:image>
    </url>
    <url>
        <loc>{{ url('/rooms') }}</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    @foreach ($rooms as $room)
    <url>
        <loc>{{ url('/rooms/' . ($room->slug ?? $room->id)) }}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
        @if (!empty($room->pictures))
        @foreach ($room->pictures as $picture)
        <image:image>
            <image:loc>{{ str_starts_with($picture, 'http') ? $picture : Storage::disk('s3')->url($picture) }}</image:loc>
            <image:title>{{ $room->roomType->name ?? 'Room' }} {{ $room->room_number }} - Beach House Bota Land</image:title>
        </image:image>
        @endforeach
        @endif
    </url>
    @endforeach
    <url>
        <loc>{{ url('/gallery') }}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>{{ url('/team') }}</loc>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    <url>
        <loc>{{ url('/location') }}</loc>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
</urlset>
