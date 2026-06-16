<?php

test('testing environment is correctly configured', function () {
    expect(config('app.env'))->toBe('testing');
    expect(config('database.default'))->toBe('sqlite');
    expect(config('cache.default'))->toBe('array');
    expect(config('queue.default'))->toBe('sync');
});

test('application key is generated for testing', function () {
    expect(config('app.key'))->not->toBeNull();
    expect(config('app.key'))->not->toBeEmpty();
});
