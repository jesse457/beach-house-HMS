<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_type_id')->constrained()->cascadeOnDelete();
            $table->string('room_number')->unique();
            $table->integer('floor')->default(1);
            $table->string('status')->default('available');
            $table->boolean('is_occupied')->default(false);

            // Changed to json for multiple files
            $table->json('pictures')->nullable();
            $table->json('videos')->nullable();

            $table->decimal('price_per_night', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
