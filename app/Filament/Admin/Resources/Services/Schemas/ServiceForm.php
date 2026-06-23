<?php

namespace App\Filament\Admin\Resources\Services\Schemas;

use App\Data\LucideIcons;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Placeholder;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Schema;

class ServiceForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->schema([

            // ── SERVICE DETAILS ──────────────────────────────────────
            Section::make('Service Details')
                ->description('Basic information about the service.')
                ->icon('heroicon-m-sparkles')
                ->schema([

                    TextInput::make('name')
                        ->required()
                        ->maxLength(255)
                        ->placeholder('e.g. Airport Shuttle, Spa & Massage'),

                    Grid::make(3)
                        ->schema([

                            Select::make('category')
                                ->options([
                                    'Dining' => 'Dining',
                                    'Wellness' => 'Wellness',
                                    'Transport' => 'Transport',
                                    'Recreation' => 'Recreation',
                                    'Guest Services' => 'Guest Services',
                                    'Business' => 'Business',
                                ])
                                ->required()
                                ->native(false)
                                ->placeholder('Select a category'),

                            Select::make('icon')
                                ->label('Icon')
                                ->options(LucideIcons::groupedOptions())
                                ->searchable()
                                ->native(false)
                                ->placeholder('Search for an icon...')
                                ->helperText('Search by name or browse by category.'),

                            TextInput::make('sort_order')
                                ->numeric()
                                ->default(0)
                                ->helperText('Lower = appears first'),
                        ]),

                    Textarea::make('description')
                        ->label('Description')
                        ->rows(8)
                        ->required()
                        ->placeholder('Write a detailed description of the service...')
                        ->helperText('Provide comprehensive information about what the service includes.'),
                ]),

            // ── MEDIA & SETTINGS ────────────────────────────────────
            Section::make('Media & Settings')
                ->description('Image, visibility, and metadata.')
                ->icon('heroicon-m-cog')
                ->schema([

                    Grid::make(2)
                        ->schema([

                            FileUpload::make('image')
                                ->label('Service Image')
                                ->disk('s3')
                                ->image()
                                ->imageEditor()
                                ->directory('services')
                                ->helperText('Upload a high-quality image for this service.'),

                            Grid::make(1)
                                ->schema([

                                    Toggle::make('is_active')
                                        ->label('Visible on Site')
                                        ->default(true)
                                        ->helperText('When enabled, this service appears on the public Services page.'),

                                    Placeholder::make('created_at')
                                        ->label('Added on')
                                        ->content(fn ($record) => $record?->created_at?->diffForHumans() ?? 'New service'),
                                ]),
                        ]),
                ]),
        ]);
    }
}
