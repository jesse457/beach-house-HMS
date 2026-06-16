<?php

namespace Tests;

use Faker\Factory as FakerFactory;
use Faker\Generator as FakerGenerator;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Disable Inertia's page file existence check during tests.
        // Pages are rendered correctly but the view-finder path resolution
        // may not align with the test environment's base path.
        config()->set('inertia.testing.ensure_pages_exist', false);

        // Ensure Faker Generator is properly bound with all providers.
        if (! app()->has(FakerGenerator::class)) {
            app()->singleton(FakerGenerator::class, function () {
                return FakerFactory::create();
            });
        }

        // Use local filesystem for S3 during tests to avoid MinIO dependency
        config()->set('filesystems.disks.s3', [
            'driver' => 'local',
            'root' => storage_path('app'),
            'throw' => false,
        ]);
    }
}
