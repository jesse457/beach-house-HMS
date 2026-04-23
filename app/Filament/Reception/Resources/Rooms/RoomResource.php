<?php

namespace App\Filament\Reception\Resources\Rooms;

use App\Filament\Reception\Resources\Rooms\Pages\CreateRoom;
use App\Filament\Reception\Resources\Rooms\Pages\EditRoom;
use App\Filament\Reception\Resources\Rooms\Pages\ListRooms;
use App\Filament\Reception\Resources\Rooms\Pages\ViewRoom;
use App\Filament\Reception\Resources\Rooms\Schemas\RoomForm;
use App\Filament\Reception\Resources\Rooms\Schemas\RoomInfolist;
use App\Filament\Reception\Resources\Rooms\Tables\RoomsTable;
use App\Models\Room;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class RoomResource extends Resource
{
    protected static ?string $model = Room::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedKey;

    protected static ?string $recordTitleAttribute = 'Booking';

    public static function form(Schema $schema): Schema
    {
        return RoomForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return RoomInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return RoomsTable::configure($table);
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
            'index' => ListRooms::route('/'),
            'create' => CreateRoom::route('/create'),
            'view' => ViewRoom::route('/{record}'),
            'edit' => EditRoom::route('/{record}/edit'),
        ];
    }
}
