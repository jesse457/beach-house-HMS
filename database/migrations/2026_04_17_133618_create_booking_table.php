<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
       Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_reference')->unique(); // Professional BK-XXXXXX code
            $table->foreignId('guest_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // Staff

            $table->string('status')->default('pending');
            $table->string('booking_type')->default('stay'); // stay, event, walk_in

            // Occupancy
            $table->integer('adults_count')->default(1);
            $table->integer('children_count')->default(0);

            // Planned Dates
            $table->dateTime('checked_in_at');
            $table->dateTime('checked_out_at')->nullable();

            // Actual Dates (for hotel auditing)
            $table->dateTime('actual_checked_in_at')->nullable();
            $table->dateTime('actual_checked_out_at')->nullable();

            // Financials
            $table->decimal('total_price', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0);

            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
