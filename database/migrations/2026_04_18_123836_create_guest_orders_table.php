<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::create('guest_orders', function (Blueprint $table) {
        $table->id();
        $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
        $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();

        // Stores the sum of all items in guest_order_items
        $table->decimal('total_amount', 10, 2)->default(0);

        $table->string('status')->default('pending'); // pending, served, paid
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guest_orders');
    }
};
