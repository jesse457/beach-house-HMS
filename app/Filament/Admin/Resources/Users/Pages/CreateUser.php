<?php

namespace App\Filament\Admin\Resources\Users\Pages;

use App\Filament\Admin\Resources\Users\UserResource;
use App\Notifications\UserInvitationNotification;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Filament\Notifications\Notification;
use Filament\Actions\Action;


class CreateUser extends CreateRecord
{
     protected static string $resource = UserResource::class;
  private string $plainPassword;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        // 1. Generate a random password
        $this->plainPassword = Str::random(12);

        // 2. Hash it for the database
        $data['password'] = Hash::make($this->plainPassword);

        return $data;
    }

   protected function afterCreate(): void
{
    $user = $this->record;
    $user->notify(new UserInvitationNotification($this->plainPassword));

    Notification::make()
        ->title('Walk-in Invitation Ready')
        ->success()
        ->body("Password: **{$this->plainPassword}**")
        ->persistent()
        ->actions([
            Action::make('copy')
                ->label('Copy Password')
                ->icon('heroicon-m-clipboard')
                ->extraAttributes([
                    'onclick' => "navigator.clipboard.writeText('{$this->plainPassword}')"
                ])
        ])
        ->send();
}

    // Optional: Show the password on screen as a "Walk-in" backup
    protected function getCreatedNotificationTitle(): ?string
    {
        return 'User created and invited. Temporary Password: ' . $this->plainPassword;
    }
}
