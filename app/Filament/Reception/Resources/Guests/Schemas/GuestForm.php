<?php

namespace App\Filament\Reception\Resources\Guests\Schemas;

use Filament\Schemas\Schema;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Group;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Placeholder;
use Filament\Support\Enums\FontWeight;

class GuestForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Grid::make(12)
                ->columnSpanFull()
                ->schema([

                    // LEFT COLUMN: Identity & Contact (8/12)
                    Group::make()
                        ->schema([
                            Section::make('Identity Information')
                                ->description('Legal identity details for compliance and security.')
                                ->icon('heroicon-m-identification')
                                ->schema([
                                    Grid::make(2)->schema([
                                        TextInput::make('name')
                                            ->label('Full Legal Name')
                                            ->required()
                                            ->maxLength(255)
                                            ->placeholder('e.g. John Doe')
                                            ->autofocus(),

                                        TextInput::make('id_card_number')
                                            ->label('ID / Passport Number')
                                            ->placeholder('e.g. A12345678')
                                            ->required()
                                            ->unique(ignoreRecord: true), // Prevent duplicate ID entries
                                    ]),
                                ]),

                            Section::make('Contact & Location')
                                ->icon('heroicon-m-envelope')
                                ->schema([
                                    Grid::make(2)->schema([
                                        TextInput::make('email')
                                            ->email()
                                            ->label('Email Address')
                                            ->placeholder('guest@example.com')
                                            ->unique(ignoreRecord: true),

                                        TextInput::make('phone')
                                            ->tel()
                                            ->label('Phone Number')
                                            ->required()
                                            ->placeholder('+237 ...'),
                                    ]),

                                    Textarea::make('address')
                                        ->label('Residential Address')
                                        ->rows(3)
                                        ->placeholder('Street, City, Country')
                                        ->columnSpanFull(),
                                ]),
                        ])
                        ->columnSpan(['default' => 12, 'lg' => 8]),

                    // RIGHT COLUMN: Sidebar Summary (4/12)
                    Group::make()
                        ->schema([
                            Section::make('Stay Statistics')
                                ->description('Historical guest activity.')
                                ->schema([
                                    Placeholder::make('total_stays')
                                        ->label('Total Visits')
                                        ->content(function ($record) {
                                            if (! $record) return 'New Guest';
                                            $count = $record->bookings()->count();
                                            return $count . ($count === 1 ? ' stay' : ' stays');
                                        }),

                                    Placeholder::make('last_visit')
                                        ->label('Last Room Occupied')
                                        ->content(function ($record) {
                                            $lastBooking = $record?->bookings()->latest()->first();
                                            if (! $lastBooking) return 'N/A';

                                            $roomNumber = $lastBooking->rooms()->first()?->room_number;
                                            return $roomNumber ? "Room " . $roomNumber : 'N/A';
                                        }),
                                ])
                                ->compact(),

                            Section::make('Internal Guest Profile')
                                ->schema([
                                    Textarea::make('notes')
                                        ->label('Guest Preferences / Notes')
                                        ->placeholder('Enter special requirements, VIP notes, or allergies...')
                                        ->rows(6),
                                ])
                                ->compact(),
                        ])
                        ->columnSpan(['default' => 12, 'lg' => 4]),
                ]),
        ]);
    }
}
