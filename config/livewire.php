<?php

return [
    'temporary_file_upload' => [
        'disk' => null,        // Defaults to 'local'
        'rules' => ['required', 'file', 'max:102400'], // Set to 100MB (102400 KB)
        'directory' => null,
        'middleware' => null,
        'preview_mimetypes' => [
            'png', 'gif', 'bmp', 'svg', 'wav', 'mp4',
            'mov', 'avi', 'wmv', 'mpeg', 'm4v', 'jpg', 'jpeg', 'mp3', 'webp',
        ],
    ],
];

