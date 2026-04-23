<?php

namespace App\Filament\Admin\Resources\Rooms\Schemas;

use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\ToggleButtons;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Group;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class RoomForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Grid::make(12)
                ->schema([

                    // MAIN CONTENT: 8/12 Columns
                    Group::make()
                        ->schema([
                            Section::make('Room Identification')
                                ->description('Basic identification and pricing for this physical room.')
                                ->icon('heroicon-m-home')
                                ->schema([
                                    Grid::make(2)
                                        ->schema([
                                            TextInput::make('room_number')
                                                ->label('Room Number / Name')
                                                ->required()
                                                ->unique(ignoreRecord: true)
                                                ->placeholder('e.g., 101 or Presidential Suite A'),

                                            Select::make('room_type_id')
                                                ->label('Room Category')
                                                ->relationship('roomType', 'name')
                                                ->searchable()
                                                ->preload()
                                                ->required(),

                                            TextInput::make('price_per_night')
                                                ->label('Rate per Night')
                                                ->numeric()
                                                ->prefix('XAF') // Update based on your currency
                                                ->required()
                                                ->placeholder('0.00'),
                                        ]),
                                ]),

                            Section::make('Room Amenities')
                                ->description('Select the specific amenities available in this room.')
                                ->icon('heroicon-m-sparkles')
                                ->schema([
                                    // v5: Using CheckboxList for multi-selection across 3 columns
                                    CheckboxList::make('amenities')
                                        ->relationship('amenities', 'name')
                                        ->columns(3)
                                        ->gridDirection('vertical')
                                        ->searchable()
                                        ->bulkToggleable(),
                                ]),
                            Section::make('Media Upload')->schema([

                                // Inside your RoomResource or Room Schema:
                                FileUpload::make('pictures')
                                    ->disk('s3') // Tells Filament to use the s3 configuration
                                    ->visibility('public') // Ensures the file is accessible to the browser
                                    ->image()
                                    ->multiple()
                                    ->reorderable()
                                    ->directory('room-pictures')
                                    ->panelLayout('grid'),

                                FileUpload::make('videos')
                                    ->disk('s3') // Tells Filament to use the s3 configuration
                                    ->visibility('public')
                                    ->multiple()
                                    ->directory('room-videos')
                                    ->acceptedFileTypes(['video/mp4', 'video/ogg', 'video/webm'])
                                    ->maxSize(102400),    ]),
                        ])

                        ->columnSpan(['lg' => 8]),

                    // SIDEBAR: 4/12 Columns
                    Group::make()
                        ->schema([
                            Section::make('Availability')
                                ->schema([
                                    ToggleButtons::make('status')
                                        ->hiddenLabel()
                                        ->options([
                                            'available' => 'Available',
                                            'dirty' => 'Dirty',
                                            'maintenance' => 'Maintenance',
                                        ])
                                        ->icons([
                                            'available' => 'heroicon-m-check-circle',
                                            'occupied' => 'heroicon-m-user-group',
                                            'dirty' => 'heroicon-m-paint-brush',
                                            'maintenance' => 'heroicon-m-wrench-screwdriver',
                                        ])
                                        ->colors([
                                            'available' => 'success',
                                            'occupied' => 'info',
                                            'dirty' => 'warning',
                                            'maintenance' => 'danger',
                                        ])
                                        ->default('available'),
                                ]),

                            Section::make('Location Details')
                                ->schema([
                                    TextInput::make('floor')
                                        ->label('Floor Level')
                                        ->numeric()
                                        ->default(1)
                                        ->minValue(0),
                                ])
                                ->compact(),

                            Section::make('Record History')
                                ->schema([
                                    Placeholder::make('created_at')
                                        ->label('Registered')
                                        ->content(fn ($record) => $record?->created_at?->diffForHumans() ?? 'New Room'),

                                    Placeholder::make('updated_at')
                                        ->label('Last Activity')
                                        ->content(fn ($record) => $record?->updated_at?->diffForHumans() ?? 'N/A'),
                                ])
                                ->collapsible()
                                ->compact(),
                        ])
                        ->columnSpan(['lg' => 4]),
                ])->columnSpan(['default' => 12, 'md' => 12, 'lg' => 4]),
        ]);
    }
}
