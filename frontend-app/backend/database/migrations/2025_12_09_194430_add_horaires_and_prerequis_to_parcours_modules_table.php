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
        Schema::table('parcours_modules', function (Blueprint $table) {
            $table->string('horaires')->nullable()->after('duration');
            $table->string('prerequis')->nullable()->after('horaires');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('parcours_modules', function (Blueprint $table) {
            $table->dropColumn(['horaires', 'prerequis']);
        });
    }
};
