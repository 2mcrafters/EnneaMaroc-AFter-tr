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
        Schema::table('enrollments', function (Blueprint $table) {
            // Add link to Agenda (ParcoursSession)
            // We use 'agenda_id' to be clear, or 'parcours_session_id'.
            // Let's use 'parcours_session_id' to match the table name, but we can alias it in the model.
            $table->foreignId('parcours_session_id')->nullable()->constrained('agenda')->onDelete('cascade');
            
            // We can keep course_id for now as legacy or for broader scope, 
            // but the user asked to remove what's not needed.
            // If we remove course_id, we must ensure all enrollments have a session.
            // For now, let's just ADD the new column to enable the chain.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropForeign(['parcours_session_id']);
            $table->dropColumn('parcours_session_id');
        });
    }
};
