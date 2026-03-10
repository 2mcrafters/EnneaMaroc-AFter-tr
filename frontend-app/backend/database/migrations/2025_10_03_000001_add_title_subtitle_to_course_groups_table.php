<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('course_groups', 'title')) {
            Schema::table('course_groups', function (Blueprint $table) {
                $table->string('title')->nullable()->after('course_id');
            });
        }
        if (!Schema::hasColumn('course_groups', 'subtitle')) {
            Schema::table('course_groups', function (Blueprint $table) {
                $table->string('subtitle')->nullable()->after('title');
            });
        }
    }

    public function down(): void
    {
        Schema::table('course_groups', function (Blueprint $table) {
            if (Schema::hasColumn('course_groups', 'subtitle')) {
                $table->dropColumn('subtitle');
            }
            if (Schema::hasColumn('course_groups', 'title')) {
                $table->dropColumn('title');
            }
        });
    }
};
