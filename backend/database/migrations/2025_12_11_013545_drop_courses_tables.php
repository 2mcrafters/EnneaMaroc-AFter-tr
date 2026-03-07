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
        // IMPORTANT:
        // Do NOT drop enrollments.course_id.
        // This application still uses the legacy column name `course_id` but it now references `parcours.id`.
        // Dropping it breaks enrollment creation and existing data.

        Schema::dropIfExists('course_groups');
        Schema::dropIfExists('courses');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We won't implement down as this is a destructive operation intended to remove legacy tables.
    }
};
