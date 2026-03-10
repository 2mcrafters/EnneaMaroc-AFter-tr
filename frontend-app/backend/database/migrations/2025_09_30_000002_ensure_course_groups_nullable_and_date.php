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
            // Remove the previously added/incorrect 'date' column if it exists
            if (Schema::hasColumn('course_groups', 'date')) {
                try {
                    $table->dropColumn('date');
                } catch (\Exception $e) {
                    // ignore if unable to drop (DB/driver limitations)
                }
            }

            // Add 'jour' (day of month) and 'month' columns (nullable integers)
            if (!Schema::hasColumn('course_groups', 'jour')) {
                $table->tinyInteger('jour')->nullable()->after('day');
            }
            if (!Schema::hasColumn('course_groups', 'month')) {
                $table->tinyInteger('month')->nullable()->after('jour');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_groups', function (Blueprint $table) {
            // Drop 'jour' and 'month' if they exist
            if (Schema::hasColumn('course_groups', 'month')) {
                try { $table->dropColumn('month'); } catch (\Exception $e) { }
            }
            if (Schema::hasColumn('course_groups', 'jour')) {
                try { $table->dropColumn('jour'); } catch (\Exception $e) { }
            }

            // Optionally restore 'date' column if missing
            if (!Schema::hasColumn('course_groups', 'date')) {
                try { $table->date('date')->nullable()->after('day'); } catch (\Exception $e) { }
            }
        });
    }
};
