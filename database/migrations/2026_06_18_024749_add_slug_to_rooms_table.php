<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('room_number');
        });

        // Generate slugs for existing rooms from RoomType.name + room_number
        $rooms = DB::table('rooms')
            ->join('room_types', 'rooms.room_type_id', '=', 'room_types.id')
            ->select('rooms.id', 'room_types.name as type_name', 'rooms.room_number')
            ->get();

        foreach ($rooms as $room) {
            $baseSlug = Str::slug($room->type_name . '-' . $room->room_number);
            $slug = $baseSlug;
            $counter = 1;
            while (DB::table('rooms')->where('slug', $slug)->where('id', '!=', $room->id)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }
            DB::table('rooms')->where('id', $room->id)->update(['slug' => $slug]);
        }

        // Now make slug NOT NULL
        Schema::table('rooms', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
