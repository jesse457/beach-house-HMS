<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('health check endpoint returns 200', function () {
    $response = $this->get('/up');

    $response->assertStatus(200);
});

test('application does not expose debug information', function () {
    // The health check endpoint is a simple route that doesn't render views
    // and shouldn't expose environment variables
    $response = $this->get('/up');

    $response->assertStatus(200);
    $response->assertDontSee('APP_KEY');
    $response->assertDontSee('DB_PASSWORD');
});
