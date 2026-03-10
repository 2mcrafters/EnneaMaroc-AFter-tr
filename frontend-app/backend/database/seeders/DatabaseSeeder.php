<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Some seeders depend on optional tables that may not exist in all DB states.
        // We guard them to allow the rest of the app (parcours/agenda) to seed cleanly.

        if (Schema::hasTable('course_groups')) {
            $this->call(QuickEnneagramSeeder::class);
        } else {
            $this->command?->warn('Skipping QuickEnneagramSeeder (missing table: course_groups)');
        }

        if (Schema::hasTable('agenda')) {
            $this->call(AgendaSeeder::class);
        } else {
            $this->command?->warn('Skipping AgendaSeeder (missing table: agenda)');
        }

        // Populate vitrine module content if parcours tables exist.
        if (Schema::hasTable('parcours') && Schema::hasTable('parcours_modules')) {
            $this->call(VitrineParcoursModulesSeeder::class);
        } else {
            $this->command?->warn('Skipping VitrineParcoursModulesSeeder (missing parcours tables)');
        }
    }
}
