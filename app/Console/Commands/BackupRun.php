<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

class BackupRun extends Command
{
    protected $signature = 'backup:run';
    protected $description = 'Backup database and media files to remote storage (R2)';

    public function handle(): int
    {
        $startTime = microtime(true);

        $dbConfig = config('database.connections.' . config('database.default'));
        $dbDriver = $dbConfig['driver'] ?? 'unknown';
        $dbName = $dbConfig['database'] ?? 'database';
        if (str_contains($dbName, '/') || str_contains($dbName, '\\')) {
            $dbName = pathinfo($dbName, PATHINFO_FILENAME);
        }

        $this->info("Starting backup — DB: {$dbName} ({$dbDriver}), target: Cloudflare R2");
        Log::info('Backup starting', [
            'database' => $dbName,
            'driver' => $dbDriver,
            'media_disk' => 's3',
            'target_disk' => 'r2',
        ]);

        // 1. Create temp directory
        $tempDir = config('backup.temp_path') . '/' . date('Ymd_His') . '_' . bin2hex(random_bytes(4));
        if (! is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }
        $this->line("Temp directory: {$tempDir}");
        $hasErrors = false;

        // 2. Dump database
        if (config('backup.sources.database')) {
            $this->info("Dumping database [{$dbDriver}]: {$dbName}...");
            $stepStart = microtime(true);
            try {
                $this->dumpDatabase($tempDir);
                $elapsed = round(microtime(true) - $stepStart, 2);
                $this->info("Database dump complete ({$elapsed}s).");
                Log::info('Backup: database dumped', ['database' => $dbName, 'driver' => $dbDriver, 'time_s' => $elapsed]);
            } catch (\Throwable $e) {
                $this->error("Database dump FAILED: {$e->getMessage()}");
                Log::error('Backup: database dump failed', [
                    'database' => $dbName,
                    'driver' => $dbDriver,
                    'error' => $e->getMessage(),
                ]);
                $hasErrors = true;
            }
        }

        // 3. Download media from S3
        if (config('backup.sources.media')) {
            $this->info('Downloading media from S3 storage...');
            $stepStart = microtime(true);
            try {
                $count = $this->downloadMedia($tempDir . '/media');
                $elapsed = round(microtime(true) - $stepStart, 2);
                $this->info("Media download complete: {$count} files ({$elapsed}s).");
                Log::info('Backup: media downloaded', ['file_count' => $count, 'time_s' => $elapsed]);
            } catch (\Throwable $e) {
                $this->error("Media download FAILED: {$e->getMessage()}");
                Log::error('Backup: media download failed', [
                    'error' => $e->getMessage(),
                ]);
                $hasErrors = true;
            }
        }

        if ($hasErrors) {
            $this->warn('Some data sources had errors — proceeding with partial backup.');
            Log::warning('Backup: proceeding with partial data due to source errors');
        }

        // 4. Create compressed archive
        $this->info('Creating compressed archive...');
        $archiveName = sprintf('backup-%s-%s.tar.gz', $dbName, date('Ymd_His'));
        $archivePath = $tempDir . '/' . $archiveName;
        $stepStart = microtime(true);

        try {
            $this->createArchive($tempDir, $archivePath, $archiveName);
            $archiveSize = round(filesize($archivePath) / 1024 / 1024, 2);
            $elapsed = round(microtime(true) - $stepStart, 2);
            $this->info("Archive created: {$archiveName} ({$archiveSize} MB, {$elapsed}s).");
            Log::info('Backup: archive created', [
                'file' => $archiveName,
                'size_mb' => $archiveSize,
                'time_s' => $elapsed,
            ]);
        } catch (\Throwable $e) {
            $this->error("Archive creation FAILED: {$e->getMessage()}");
            Log::error('Backup: archive creation failed', [
                'error' => $e->getMessage(),
                'temp_dir' => $tempDir,
            ]);
            $this->cleanupTemp($tempDir);
            return self::FAILURE;
        }

        // 5. Upload to R2
        $this->info("Uploading {$archiveSize} MB to Cloudflare R2...");
        $stepStart = microtime(true);
        try {
            $stream = fopen($archivePath, 'r');
            if (! $stream) {
                throw new \RuntimeException("Cannot open archive file for reading: {$archivePath}");
            }
            Storage::disk('r2')->writeStream('backups/' . $archiveName, $stream);
            if (is_resource($stream)) {
                fclose($stream);
            }
            $elapsed = round(microtime(true) - $stepStart, 2);
            $this->info("Upload complete ({$elapsed}s).");
            Log::info('Backup: uploaded to R2', [
                'file' => $archiveName,
                'size_mb' => $archiveSize,
                'time_s' => $elapsed,
            ]);
        } catch (\Throwable $e) {
            $this->error("Upload FAILED: {$e->getMessage()}");
            Log::error('Backup: upload to R2 failed', [
                'error' => $e->getMessage(),
                'file' => $archiveName,
                'local_archive' => $archivePath,
            ]);
            $this->cleanupTemp($tempDir);
            return self::FAILURE;
        }

        // 6. Cleanup old backups on R2
        $this->info('Cleaning up old backups (keeping ' . config('backup.keep', 10) . ')...');
        try {
            $deleted = $this->cleanupRemoteBackups();
            if ($deleted > 0) {
                $this->info("Removed {$deleted} old backup(s) from R2.");
                Log::info('Backup: old backups removed from R2', ['deleted_count' => $deleted]);
            } else {
                $this->line('No old backups to remove.');
            }
        } catch (\Throwable $e) {
            $this->warn('Remote cleanup skipped (non-fatal): ' . $e->getMessage());
            Log::warning('Backup: remote cleanup failed', ['error' => $e->getMessage()]);
        }

        // 7. Cleanup local temp
        $this->cleanupTemp($tempDir);

        $totalTime = round(microtime(true) - $startTime, 2);
        $this->info("Backup completed successfully — total time: {$totalTime}s.");
        Log::info('Backup: completed', [
            'archive' => $archiveName,
            'size_mb' => $archiveSize,
            'total_time_s' => $totalTime,
        ]);
        return self::SUCCESS;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    /**
     * Dump the database to a SQL file.
     */
    protected function dumpDatabase(string $dir): void
    {
        $defaultConnection = config('database.default');
        $config = config("database.connections.{$defaultConnection}");
        $driver = $config['driver'];

        if ($driver === 'sqlite') {
            // For SQLite, just copy the database file
            $dbPath = $config['database'];
            // If it's a relative path, resolve it relative to the database dir
            if (! str_starts_with($dbPath, '/')) {
                $dbPath = database_path($dbPath);
            }
            if (file_exists($dbPath)) {
                copy($dbPath, $dir . '/database.sqlite');
            } else {
                throw new \RuntimeException("SQLite database file not found: {$dbPath}");
            }
            return;
        }

        // MySQL / MariaDB: use mysqldump or mariadb-dump
        // Use MYSQL_PWD env var for security — avoids password in process list
        $dumpBin = $this->findDumpBinary();
        $command = sprintf(
            '%s --host=%s --port=%s --user=%s --single-transaction --quick --routines --events %s > %s',
            $dumpBin,
            escapeshellarg($config['host'] ?? '127.0.0.1'),
            escapeshellarg((string) ($config['port'] ?? 3306)),
            escapeshellarg($config['username'] ?? ''),
            escapeshellarg($config['database'] ?? ''),
            escapeshellarg($dir . '/database.sql')
        );

        $process = Process::fromShellCommandline($command);
        $process->setEnv(['MYSQL_PWD' => $config['password'] ?? '']);
        $process->run();

        if (! $process->isSuccessful()) {
            throw new \RuntimeException('Database dump failed: ' . $process->getErrorOutput());
        }
    }

    /**
     * Find available mysqldump or mariadb-dump binary.
     */
    protected function findDumpBinary(): string
    {
        foreach (['mariadb-dump', 'mysqldump'] as $bin) {
            $path = trim(shell_exec('which ' . escapeshellarg($bin) . ' 2>/dev/null') ?? '');
            if ($path !== '') {
                return $bin;
            }
        }
        throw new \RuntimeException('No database dump binary found (tried mariadb-dump, mysqldump)');
    }

    /**
     * Download all media files from the S3 disk to a local directory.
     */
    protected function downloadMedia(string $localDir): int
    {
        if (! is_dir($localDir)) {
            mkdir($localDir, 0755, true);
        }

        $s3 = Storage::disk('s3');
        $allFiles = $s3->allFiles();
        $count = 0;

        $this->output->progressStart(count($allFiles));

        foreach ($allFiles as $path) {
            $localPath = $localDir . '/' . $path;
            $parentDir = dirname($localPath);
            if (! is_dir($parentDir)) {
                mkdir($parentDir, 0755, true);
            }

            $stream = $s3->readStream($path);
            file_put_contents($localPath, stream_get_contents($stream));
            fclose($stream);
            $count++;
            $this->output->progressAdvance();
        }

        $this->output->progressFinish();
        return $count;
    }

    /**
     * Create a gzipped tar archive from the temp directory using shell tar.
     */
    protected function createArchive(string $sourceDir, string $archivePath, string $archiveName): void
    {
        // Create the archive in the parent dir to avoid "file changed as we read it"
        $parentDir = dirname($sourceDir);
        $actualArchive = $parentDir . '/' . $archiveName;

        $process = Process::fromShellCommandline(
            sprintf(
                'tar -czf %s -C %s .',
                escapeshellarg($actualArchive),
                escapeshellarg($sourceDir)
            )
        );
        $process->run();

        if (! $process->isSuccessful()) {
            throw new \RuntimeException('tar creation failed: ' . $process->getErrorOutput());
        }

        if (! file_exists($actualArchive) || filesize($actualArchive) === 0) {
            throw new \RuntimeException('Archive is empty or missing');
        }

        // Move to expected location if different
        if ($actualArchive !== $archivePath) {
            rename($actualArchive, $archivePath);
        }
    }

    /**
     * Remove old backups from R2, keeping the configured number.
     */
    protected function cleanupRemoteBackups(): int
    {
        $disk = Storage::disk('r2');
        $keep = config('backup.keep', 10);
        $files = $disk->files('backups');

        // Filter to backup archives and sort by name (which includes timestamp)
        $backups = array_filter($files, fn($f) => str_starts_with(basename($f), 'backup-'));
        sort($backups);

        if (count($backups) <= $keep) {
            return 0;
        }

        $toDelete = array_slice($backups, 0, count($backups) - $keep);
        $deleted = 0;

        foreach ($toDelete as $file) {
            $disk->delete($file);
            $deleted++;
            Log::info('Backup: deleted old remote backup', ['file' => $file]);
        }

        return $deleted;
    }

    /**
     * Recursively delete the temp directory.
     */
    protected function cleanupTemp(string $dir): void
    {
        if (! is_dir($dir)) {
            return;
        }
        $iterator = new \RecursiveDirectoryIterator($dir, \RecursiveDirectoryIterator::SKIP_DOTS);
        $files = new \RecursiveIteratorIterator($iterator, \RecursiveIteratorIterator::CHILD_FIRST);
        foreach ($files as $file) {
            $file->isDir() ? rmdir($file->getRealPath()) : unlink($file->getRealPath());
        }
        rmdir($dir);
    }
}
