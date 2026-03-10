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
        Schema::create('course_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('day'); // ex: 'Mondays & Wednesdays'
            $table->string('time'); // ex: '10:00 AM - 12:00 PM'
            $table->decimal('price', 8, 2);
            $table->foreignId('instructor_id')->constrained('users')->onDelete('cascade');
            $table->string('meeting_link')->nullable(); // Pour les cours en ligne
            $table->integer('capacity')->default(20);
            $table->enum('status', ['active', 'inactive', 'full'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_groups');
    }
};
