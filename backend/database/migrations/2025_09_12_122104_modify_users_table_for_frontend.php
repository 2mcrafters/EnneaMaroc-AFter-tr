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
        Schema::table('users', function (Blueprint $table) {
            // Renommer name en firstName et ajouter lastName
            $table->renameColumn('name', 'firstName');
            $table->string('lastName')->after('firstName');
            
            // Ajouter les nouveaux champs
            $table->date('dob')->nullable()->after('lastName'); // Date of birth
            $table->string('city')->nullable();
            $table->string('phone')->nullable()->after('city');
            $table->string('profilePicture')->nullable()->after('phone');
            
            // Ajouter le rôle avec enum
            $table->enum('role', ['admin', 'employee', 'prof', 'student'])->default('student')->after('profilePicture');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('firstName', 'name');
            $table->dropColumn(['lastName', 'dob',  'city', 'phone', 'profilePicture', 'role']);
        });
    }
};
