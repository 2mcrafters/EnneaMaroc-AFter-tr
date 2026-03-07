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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->integer('month'); // Payment month number (1, 2, 3, etc.)
            $table->enum('status', ['pending', 'confirmed', 'rejected'])->default('pending');
            $table->text('payment_proof')->nullable(); // Path to payment proof file or description
            $table->date('payment_date');
            $table->text('admin_notes')->nullable(); // Admin notes for this payment
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->onDelete('set null'); // Admin who confirmed
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['enrollment_id', 'month']);
            $table->index('status');
            $table->index('payment_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
