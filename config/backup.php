<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Backup Retention
    |--------------------------------------------------------------------------
    |
    | Number of backups to keep on the remote disk. Older backups beyond
    | this count are automatically deleted after a successful upload.
    |
    */
    'keep' => (int) env('BACKUP_KEEP', 10),

    /*
    |--------------------------------------------------------------------------
    | Temporary Directory
    |--------------------------------------------------------------------------
    |
    | Local path where the backup archive is built before uploading.
    | Must be writable by the user running the backup command.
    |
    */
    'temp_path' => env('BACKUP_TEMP_DIR', storage_path('app/backups')),

    /*
    |--------------------------------------------------------------------------
    | Sources to Include
    |--------------------------------------------------------------------------
    |
    | Toggle which data sources are included in the backup archive.
    |
    */
    'sources' => [
        'database' => true,
        'media' => true,
    ],
];
