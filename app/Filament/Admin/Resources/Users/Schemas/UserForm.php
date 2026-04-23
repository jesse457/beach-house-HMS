<?php

namespace App\Filament\Admin\Resources\Users\Schemas;

use App\Enums\UserRole;
use Filament\Schemas\Components\Section;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('User Account')
                ->schema([
                    TextInput::make('name')->required(),
                    TextInput::make('email')
                        ->email()
                        ->required()
                        ->unique(ignoreRecord: true),

                    Select::make('role')
                        ->options(UserRole::class)
                        ->required(),

                    // Notice for the Admin
                    Placeholder::make('invitation_notice')
                        ->content('The system will generate a secure random password and email it to the user automatically.')
                        ->visible(fn ($operation) => $operation === 'create'),
                ])->columnSpanFull()
        ]);
    }
}
