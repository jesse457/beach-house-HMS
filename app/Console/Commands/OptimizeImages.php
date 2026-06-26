<?php

namespace App\Console\Commands;

use App\Models\Gallery;
use App\Models\Room;
use App\Models\Service;
use App\Models\TeamMember;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Format;
use Intervention\Image\ImageManager;
use League\Flysystem\UnableToCheckExistence;

class OptimizeImages extends Command
{
    protected $signature = 'images:optimize
                            {--dry-run : Show what would be converted without making changes}
                            {--quality=80 : WebP quality (1-100)}
                            {--delete-originals : Remove original files after conversion}';
    protected $description = 'Convert existing JPG/PNG images on S3 to WebP for better performance';

    private ImageManager $image;
    private int $converted = 0;
    private int $skipped = 0;
    private int $errors = 0;
    private int $bytesBefore = 0;
    private int $bytesAfter = 0;

    public function handle(): int
    {
        set_time_limit(0);

        $quality = (int) $this->option('quality');
        $dryRun = $this->option('dry-run');
        $deleteOriginals = $this->option('delete-originals');

        $this->image =  ImageManager::usingDriver(new Driver());
        $disk = Storage::disk('s3');

        if ($dryRun) {
            $this->warn('DRY RUN — no changes will be made.');
        }
        $this->info("WebP quality: {$quality} | Delete originals: " . ($deleteOriginals ? 'yes' : 'no'));
        $this->newLine();

        // ── Room pictures ──────────────────────────────────────────────────
        $this->info('── Room pictures ──');
        $rooms = Room::whereNotNull('pictures')->get();
        foreach ($rooms as $room) {
            $pictures = $room->pictures;
            if (!is_array($pictures) || empty($pictures)) continue;

            $optimized = [];
            foreach ($pictures as $path) {
                $optimized[] = $this->convert($disk, $path, $quality, $dryRun, $deleteOriginals);
            }
            if (!$dryRun) {
                $room->update(['pictures' => $optimized]);
            }
        }

        // ── Room videos (skip — video files aren't images) ────────────────

        // ── Gallery images ─────────────────────────────────────────────────
        $this->info('── Gallery images ──');
        $galleries = Gallery::where('type', 'image')
            ->whereNotNull('url')
            ->get();
        foreach ($galleries as $gallery) {
            $gallery->url = $this->convert($disk, $gallery->url, $quality, $dryRun, $deleteOriginals);
            if (!$dryRun) {
                $gallery->save();
            }
        }

        // ── Gallery thumbnails ─────────────────────────────────────────────
        $this->info('── Gallery thumbnails ──');
        $thumbnails = Gallery::whereNotNull('thumbnail')->get();
        foreach ($thumbnails as $gallery) {
            $gallery->thumbnail = $this->convert($disk, $gallery->thumbnail, $quality, $dryRun, $deleteOriginals);
            if (!$dryRun) {
                $gallery->save();
            }
        }

        // ── Service images ─────────────────────────────────────────────────
        $this->info('── Service images ──');
        $services = Service::whereNotNull('image')->get();
        foreach ($services as $service) {
            $service->image = $this->convert($disk, $service->image, $quality, $dryRun, $deleteOriginals);
            if (!$dryRun) {
                $service->save();
            }
        }

        // ── Team member images ─────────────────────────────────────────────
        $this->info('── Team member images ──');
        $members = TeamMember::whereNotNull('image')->get();
        foreach ($members as $member) {
            $member->image = $this->convert($disk, $member->image, $quality, $dryRun, $deleteOriginals);
            if (!$dryRun) {
                $member->save();
            }
        }

        // ── Summary ────────────────────────────────────────────────────────
        $this->newLine();
        $this->info("── Summary ──");
        $this->info("Converted: {$this->converted}  Skipped: {$this->skipped}  Errors: {$this->errors}");
        if ($this->converted > 0) {
            $saved = $this->bytesBefore > 0
                ? round(100 - ($this->bytesAfter / $this->bytesBefore * 100), 1)
                : 0;
            $this->info("Size: " . round($this->bytesBefore / 1024, 1) . " KB → " . round($this->bytesAfter / 1024, 1) . " KB (≈{$saved}% smaller)");
        }
        if ($dryRun) {
            $this->warn('DRY RUN — no changes were made. Run without --dry-run to apply.');
        }

        Log::info('Image optimization completed', [
            'converted' => $this->converted,
            'skipped' => $this->skipped,
            'errors' => $this->errors,
            'dry_run' => $dryRun,
        ]);

        return self::SUCCESS;
    }

    private function convert($disk, ?string $path, int $quality, bool $dryRun, bool $deleteOriginal): ?string
    {
        if (!$path) return null;

        // Skip external URLs (e.g. Facebook image links)
        if (str_starts_with($path, 'http')) {
            $this->line("  ⏭  <fg=gray>{$path}</> (external URL — skipped)");
            $this->skipped++;
            return $path;
        }

        // Skip if already WebP
        if (str_ends_with(strtolower($path), '.webp')) {
            $this->skipped++;
            return $path;
        }

        // Skip non-image extensions
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg', 'jpeg', 'png'], true)) {
            $this->skipped++;
            return $path;
        }

        try {
            // Check file exists on S3
            if (!$disk->exists($path)) {
                $this->line("  ⚠  <fg=gray>{$path}</> (not found on S3 — skipped)");
                $this->skipped++;
                return $path;
            }

            $sizeBefore = $disk->size($path);
            $this->bytesBefore += $sizeBefore;

            $newPath = preg_replace('/\.(jpe?g|png)$/i', '.webp', $path);

            if ($dryRun) {
                $this->line("  →  <fg=cyan>{$path}</> → <fg=green>{$newPath}</> (" . round($sizeBefore / 1024, 1) . " KB)");
                $this->converted++;
                return $newPath;
            }

            // Download, convert, upload
            $contents = $disk->get($path);
            $encoded = $this->image->decode($contents)
                ->encodeUsingFormat(Format::WEBP,quality:$quality);

            $disk->put($newPath, (string) $encoded, 'public');

            $sizeAfter = $disk->size($newPath);
            $this->bytesAfter += $sizeAfter;

            if ($deleteOriginal) {
                $disk->delete($path);
            }

            $reduction = round((1 - $sizeAfter / $sizeBefore) * 100, 1);
            $this->line("  ✓  <fg=cyan>{$path}</> → <fg=green>{$newPath}</> (" . round($sizeBefore / 1024, 1) . " KB → " . round($sizeAfter / 1024, 1) . " KB, -{$reduction}%)");
            $this->converted++;

            return $newPath;

        } catch (\League\Flysystem\UnableToCheckExistence $e) {
            $this->line("  ⚠  <fg=gray>{$path}</> (not found on S3 — skipped)");
            $this->skipped++;
            return $path;
        } catch (\Throwable $e) {
            $this->error("  ✗  {$path}: " . $e->getMessage());
            Log::error('Image conversion failed', ['path' => $path, 'error' => $e->getMessage()]);
            $this->errors++;
            return $path;
        }
    }
}
