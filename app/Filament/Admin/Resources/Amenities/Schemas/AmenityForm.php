<?php

namespace App\Filament\Admin\Resources\Amenities\Schemas;

use Filament\Schemas\Schema;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Group;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Placeholder;
use Filament\Schemas\Components\Utilities\Get;
use Guava\IconPicker\Forms\Components\IconPicker;

class AmenityForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->schema([
            Grid::make(12)
                ->schema([

                    // LEFT COLUMN: Main Info
                    Group::make()
                        ->schema([
                            Section::make('Amenity Information')
                                ->description('Configure the primary details and icon for this amenity.')
                                ->icon('heroicon-m-tag')
                                ->schema([
                                    Grid::make(2)
                                        ->schema([
                                            TextInput::make('name')
                                                ->label('Display Name')
                                                ->required()
                                                ->maxLength(255)
                                                ->placeholder('e.g., Olympic Swimming Pool'),

                                            IconPicker::make('icon')
                                                ->label('Select Icon')
                                                ->sets(['heroicons'])
                                                ->gridSearchResults()
                                                ->required()
                                                // Ensure the icon name is stored as a string as per model cast
                                                ->hint('Used in room displays and booking receipts'),
                                        ]),

                                    Textarea::make('description')
                                        ->label('Detailed Description')
                                        ->placeholder('Describe the facility or service...')
                                        ->rows(5)
                                        ->columnSpanFull(),
                                ]),
                        ])
                        ->columnSpan(['default' => 12, 'lg' => 8]),

                    // RIGHT COLUMN: Classification & Pricing
                    Group::make()
                        ->schema([
                            Section::make('Type & Pricing')
                                ->description('Define if this is a standalone facility for walk-ins.')
                                ->schema([
                                    Toggle::make('is_standalone')
                                        ->label('Standalone Facility')
                                        ->helperText('Enable if this is a service (Gym, Pool, Spa) that can be billed separately.')
                                        ->default(false)
                                        ->live() // Refresh UI when toggled
                                        ->afterStateUpdated(fn ($state, $set) => $state === false ? $set('price', 0) : null),

                                    TextInput::make('price')
                                        ->label('Access Price / Unit Price')
                                        ->numeric()
                                        ->prefix('$')
                                        // Only show price input if it's a standalone amenity
                                        ->visible(fn (Get $get) => (bool) $get('is_standalone'))
                                        ->required(fn (Get $get) => (bool) $get('is_standalone'))
                                        ->minValue(0)
                                        ->step(0.01)
                                        ->placeholder('0.00')
                                        ->helperText('The price charged per person/unit for walk-ins or guests.'),
                                ])
                                ->compact(),

                            Section::make('System Metadata')
                                ->schema([
                                    Placeholder::make('created_at')
                                        ->label('Added to System')
                                        ->content(fn ($record) => $record?->created_at?->toDayDateTimeString() ?? 'New entry'),

                                    Placeholder::make('updated_at')
                                        ->label('Last Modified')
                                        ->content(fn ($record) => $record?->updated_at?->diffForHumans() ?? 'N/A'),

                                    Placeholder::make('rooms_count')
                                        ->label('Attached to Rooms')
                                        ->content(fn ($record) => $record?->rooms()->count() ?? 0)
                                        ->visible(fn ($record) => filled($record)),
                                ])
                                ->collapsible()
                                ->compact(),
                        ]) ->columnSpan(['default' => 12, 'lg' => 4])
                       ,
                ]) ->columnSpan(['default' => 12, 'lg' => 4]),
        ]);
    }
}
