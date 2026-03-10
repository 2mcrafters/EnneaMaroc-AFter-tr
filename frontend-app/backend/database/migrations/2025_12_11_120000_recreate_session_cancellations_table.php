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
        if (!Schema::hasTable('session_cancellations')) {
            Schema::create('session_cancellations', function (Blueprint $table) {
                $table->id();
                $table->string('item_type');
                $table->unsignedBigInteger('course_id')->nullable();
                $table->unsignedBigInteger('parcours_id')->nullable();
                $table->unsignedBigInteger('module_id')->nullable();
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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('session_cancellations');
    }
};
