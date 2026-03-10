<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('session_cancellations')) {
            return; // already created in this environment
        }
        Schema::create('session_cancellations', function (Blueprint $table) {
            $table->id();
            $table->enum('item_type', ['course']);
            $table->unsignedBigInteger('course_id');
            $table->unsignedInteger('course_group_index')->nullable();
            $table->string('day');
            $table->string('time');
            $table->date('session_date');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->index(['item_type', 'course_id']);
            $table->index(['session_date', 'day']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_cancellations');
    }
};
