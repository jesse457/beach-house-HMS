<?php

namespace App\Filament\Admin\Resources\RoomTypes\Schemas;


use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Group;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select; // Added Select
use Filament\Forms\Components\MarkdownEditor;
use Filament\Forms\Components\Placeholder;
use Filament\Schemas\Schema;

class RoomTypeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Grid::make(12)
                ->schema([

                    // MAIN CONTENT: 8/12 Columns
                    Group::make()
                        ->schema([
                            Section::make('Category Details')
                                ->description('Define the room category and its characteristics.')
                                ->icon('heroicon-m-rectangle-group')
                                ->schema([
                                    Grid::make(2)
                                        ->schema([
                                            TextInput::make('name')
                                                ->label('Room Type Name')
                                                ->required()
                                                ->unique(ignoreRecord: true)
                                                ->placeholder('e.g., Deluxe Suite, Event Hall')
                                                ->maxLength(255),

                                            Select::make('category')
                                                ->label('Classification')
                                                ->options([
                                                    'stay' => 'Stay (Accommodation)',
                                                    'event' => 'Event Space (Occasion)',
                                                    'facility' => 'Facility (Gym/Pool)',
                                                ])
                                                ->native(false)
                                                ->required()
                                                ->default('stay'),
                                        ]),

                                    MarkdownEditor::make('description')
                                        ->label('Description')
                                        ->helperText('List the general features of this room type.')
                                        ->placeholder('Provide a detailed description...')
                                        ->columnSpanFull(),
                                ]),
                        ])
                        ->columnSpan(['lg' => 8]),

                    // SIDEBAR: 4/12 Columns
                    Group::make()
                        ->schema([
                            Section::make('Status & Information')
                                ->schema([
                                    Placeholder::make('info')
                                        ->label('Guideline')
                                        ->content('Accommodation types are for overnight stays. Event Spaces are for occasions. Facilities are for standalone amenities like gyms.'),
                                ])
                                ->compact(),

                            Section::make('System Metadata')
                                ->schema([
                                    Placeholder::make('created_at')
                                        ->label('Date Created')
                                        ->content(fn ($record) => $record?->created_at?->toFormattedDateString() ?? 'Draft'),

                                    Placeholder::make('updated_at')
                                        ->label('Last Updated')
                                        ->content(fn ($record) => $record?->updated_at?->diffForHumans() ?? 'N/A'),
                                ])
                                ->collapsible()
                                ->compact(),
                        ])
                        ->columnSpan(['lg' => 4]),
                ]),
        ]);
    }
}
