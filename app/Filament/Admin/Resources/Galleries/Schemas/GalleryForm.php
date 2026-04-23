<?php

namespace App\Filament\Admin\Resources\Galleries\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section; // Using standard Filament Form
use Filament\Schemas\Schema;

class GalleryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(3)->schema([
                    // Main Content Section
                    Section::make('Media Details')
                        ->columnSpan(2)
                        ->schema([
                            TextInput::make('title')
                                ->required()
                                ->maxLength(255)
                                ->placeholder('e.g., Sunset over the Pool'),

                            Grid::make(2)->schema([
                                Select::make('type')
                                    ->options([
                                        'image' => 'Image',
                                        'video' => 'Video',
                                    ])
                                    ->default('image')
                                    ->required()
                                    ->reactive(), // Makes the form respond when this changes

                                Select::make('room_type_id')
                                    ->label('Category (Room Type)')
                                    ->relationship('roomType', 'name') // Pulls name from room_types table
                                    ->searchable()
                                    ->preload()
                                    ->required(),
                            ]),

                            Textarea::make('description')
                                ->rows(3)
                                ->placeholder('Brief description for the lightbox view...'),


                        ]),

                    // Media Upload & Status Section
                    Section::make('Files & Settings')
                        ->columnSpan(1)
                        ->schema([
                            Toggle::make('is_active')
                                ->label('Visible on Site')
                                ->default(true),

                            TextInput::make('sort_order')
                                ->numeric()
                                ->default(0),

                            FileUpload::make('url')
                                ->disk('s3')
                                ->label(fn ($get) => $get('type') === 'video' ? 'Video File' : 'Image File')
                                ->directory('gallery') // Saves to storage/app/public/gallery
                                ->image() // Validates as image if type is image
                                ->hidden(fn ($get) => $get('type') === 'video')
                                ->required(),

                            // Specific FileUpload for Videos
                            FileUpload::make('url')
                                ->disk('s3')
                                ->label('Video File')
                                ->directory('gallery/videos')
                                ->acceptedFileTypes(['video/mp4', 'video/ogg', 'video/webm'])
                                ->visible(fn ($get) => $get('type') === 'video')
                                ->required()
                                  ->maxSize(102400),

                            // Thumbnail only visible if it's a video
                            FileUpload::make('thumbnail')
                                ->disk('s3')
                                ->label('Video Thumbnail')
                                ->directory('gallery/thumbnails')
                                ->image()
                                ->visible(fn ($get) => $get('type') === 'video')
                                ->helperText('Required for video previews.'),
                        ]),
                ])->columnSpan(['default' => 12, 'md' => 12, 'lg' => 4]),
            ]);
    }
}
