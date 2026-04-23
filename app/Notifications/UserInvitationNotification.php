<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(public string $password) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Account Credentials - Hotel Management System')
            ->greeting("Hello, {$notifiable->name}!")
            ->line('An account has been created for you.')
            ->line("Your login email: **{$notifiable->email}**")
            ->line("Your temporary password: **{$this->password}**")
            ->action('Login to Dashboard', url('/reception/login'))
            ->line('For security, please change your password immediately after logging in.');
    }
}
