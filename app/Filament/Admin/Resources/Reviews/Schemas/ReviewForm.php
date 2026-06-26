<?php

namespace App\Filament\Admin\Resources\Reviews\Schemas;

use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ReviewForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(3)->schema([
                    Section::make('Review Details')
                        ->columnSpan(2)
                        ->icon('heroicon-o-star')
                        ->description('Guest review content and rating.')
                        ->schema([
                            TextInput::make('author_name')
                                ->label('Guest Name')
                                ->required()
                                ->maxLength(255)
                                ->placeholder('e.g. Marie N.'),

                            TextInput::make('email')
                                ->label('Email')
                                ->email()
                                ->maxLength(255)
                                ->placeholder('guest@example.com'),

                            TextInput::make('rating')
                                ->label('Rating (1–5)')
                                ->numeric()
                                ->minValue(1)
                                ->maxValue(5)
                                ->required()
                                ->default(5),

                            Textarea::make('content')
                                ->label('Review')
                                ->required()
                                ->maxLength(2000)
                                ->rows(5)
                                ->placeholder('What did the guest say...'),

                            Placeholder::make('created_at')
                                ->label('Submitted')
                                ->content(fn ($record) => $record?->created_at?->format('M d, Y h:i A'))
                                ->hiddenOn('create'),
                        ]),

                    Section::make('Approval')
                        ->columnSpan(1)
                        ->icon('heroicon-o-check-circle')
                        ->description('Control review visibility on the public site.')
                        ->schema([
                            Toggle::make('is_approved')
                                ->label('Approved')
                                ->default(false)
                                ->helperText('Only approved reviews appear on the public site.')
                                ->onColor('success')
                                ->offColor('gray'),

                            Placeholder::make('created_at')
                                ->label('Submitted At')
                                ->content(fn ($record) => $record?->created_at?->diffForHumans())
                                ->hiddenOn('create'),

                            Placeholder::make('updated_at')
                                ->label('Last Updated')
                                ->content(fn ($record) => $record?->updated_at?->diffForHumans())
                                ->hiddenOn('create'),
                        ]),
                ]),
            ]);
    }
}
