<?php

namespace App\Filament\Reception\Resources\GuestOrders;

use App\Filament\Reception\Resources\GuestOrders\Pages\CreateGuestOrder;
use App\Filament\Reception\Resources\GuestOrders\Pages\EditGuestOrder;
use App\Filament\Reception\Resources\GuestOrders\Pages\ListGuestOrders;
use App\Filament\Reception\Resources\GuestOrders\Schemas\GuestOrderForm;
use App\Filament\Reception\Resources\GuestOrders\Tables\GuestOrdersTable;
use App\Models\GuestOrder;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class GuestOrderResource extends Resource
{
    protected static ?string $model = GuestOrder::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedShoppingCart;

    protected static ?string $recordTitleAttribute = 'Guest Order';

    public static function form(Schema $schema): Schema
    {
        return GuestOrderForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return GuestOrdersTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListGuestOrders::route('/'),
            'create' => CreateGuestOrder::route('/create'),
            'edit' => EditGuestOrder::route('/{record}/edit'),
        ];
    }
}
