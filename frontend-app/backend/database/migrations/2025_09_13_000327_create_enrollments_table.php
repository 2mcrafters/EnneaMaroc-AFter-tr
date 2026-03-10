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
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pending_payment', 'pending_confirmation', 'active', 'cancelled', 'completed'])
                  ->default('pending_payment');
            $table->timestamp('enrolled_at')->useCurrent();
            $table->json('group_data')->nullable(); // Store group/modality information
            $table->integer('duration_months')->default(1); // Course duration in months
            $table->text('notes')->nullable(); // Admin notes
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['user_id', 'status']);
            $table->index('status');
            $table->index('enrolled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
