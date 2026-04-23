<?php

namespace App\Filament\Admin\Resources\Amenities;

use App\Filament\Admin\Resources\Amenities\Pages\CreateAmenity;
use App\Filament\Admin\Resources\Amenities\Pages\EditAmenity;
use App\Filament\Admin\Resources\Amenities\Pages\ListAmenities;
use App\Filament\Admin\Resources\Amenities\Pages\ViewAmenity;
use App\Filament\Admin\Resources\Amenities\Schemas\AmenityForm;
use App\Filament\Admin\Resources\Amenities\Schemas\AmenityInfolist;
use App\Filament\Admin\Resources\Amenities\Tables\AmenitiesTable;
use App\Models\Amenity;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class AmenityResource extends Resource
{
    protected static ?string $model = Amenity::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedSparkles;

    protected static ?string $recordTitleAttribute = 'roomtype';

    public static function form(Schema $schema): Schema
    {
        return AmenityForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return AmenityInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AmenitiesTable::configure($table);
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
            'index' => ListAmenities::route('/'),
            'create' => CreateAmenity::route('/create'),
            'view' => ViewAmenity::route('/{record}'),
            'edit' => EditAmenity::route('/{record}/edit'),
        ];
    }
}
