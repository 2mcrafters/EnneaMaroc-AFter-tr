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
        Schema::table('course_groups', function (Blueprint $table) {
            // If a foreign key exists on instructor_id, drop it first to allow altering the column
            if (Schema::hasColumn('course_groups', 'instructor_id')) {
                // Drop foreign key if exists (MySQL default name: course_groups_instructor_id_foreign)
                try {
                    $table->dropForeign(['instructor_id']);
                } catch (\Exception $e) {
                    // ignore if it does not exist
                }
            }

            $table->string('day')->nullable()->change();
            $table->string('time')->nullable()->change();
            // change instructor_id to unsignedBigInteger nullable then re-create FK
            $table->unsignedBigInteger('instructor_id')->nullable()->change();
            $table->foreign('instructor_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_groups', function (Blueprint $table) {
            // Drop FK then restore non-nullable columns
            try {
                $table->dropForeign(['instructor_id']);
            } catch (\Exception $e) {
                // ignore
            }
            $table->string('day')->nullable(false)->change();
            $table->string('time')->nullable(false)->change();
            $table->unsignedBigInteger('instructor_id')->nullable(false)->change();
            $table->foreign('instructor_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
