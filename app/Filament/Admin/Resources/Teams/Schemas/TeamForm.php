<?php

namespace App\Filament\Admin\Resources\Teams\Schemas;

use Filament\Forms\Form;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Group;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Placeholder;
use Filament\Schemas\Schema;

class TeamForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->schema([
            Grid::make(12)
                ->schema([
                    // LEFT COLUMN: Info
                    Group::make()
                        ->schema([
                            Section::make('Member Details')
                                ->description('Basic information about the team member.')
                                ->icon('heroicon-m-user')
                                ->schema([
                                    Grid::make(2)
                                        ->schema([
                                            TextInput::make('name')
                                                ->required()
                                                ->maxLength(255),

                                            TextInput::make('role')
                                                ->label('Job Title')
                                                ->placeholder('e.g. General Manager')
                                                ->required(),

                                            Select::make('department')
                                                ->options([
                                                    'Management' => 'Management',
                                                    'Operations' => 'Operations',
                                                    'Hospitality' => 'Hospitality',
                                                    'Support' => 'Support',
                                                ])
                                                ->required()
                                                ->native(false),

                                            TextInput::make('sort_order')
                                                ->numeric()
                                                ->default(0)
                                                ->helperText('Lower numbers appear first in the list.'),
                                        ]),

                                    Textarea::make('bio')
                                        ->label('Biography')
                                        ->rows(5)
                                        ->placeholder('Write a short professional bio...')
                                        ->columnSpanFull(),
                                ]),
                        ])
                        ->columnSpan(['default' => 12, 'lg' => 8]),

                    // RIGHT COLUMN: Media & Status
                    Group::make()
                        ->schema([
                            Section::make('Profile Photo')
                                ->schema([
                                    FileUpload::make('image')
                                        ->label('Avatar')
                                        ->image()
                                        ->imageEditor()
                                        ->directory('team-members')
                                        ->helperText('Upload a high-quality square headshot.'),
                                ]),

                            Section::make('System Metadata')
                                ->schema([
                                    Placeholder::make('created_at')
                                        ->label('Added on')
                                        ->content(fn ($record) => $record?->created_at?->diffForHumans() ?? 'New member'),
                                ])
                                ->compact(),
                        ])
                        ->columnSpan(['default' => 12, 'lg' => 4]),
                ])  ->columnSpan(['default' => 12, 'lg' => 4]),
        ]);
    }
}
