<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Enrollment;
use App\Models\CourseGroup;
use App\Models\RevisionModality;

class MigrateEnrollmentGroups extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'enrollments:migrate-groups';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate enrollment group_data to group_id field';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting migration of enrollment group_data to group_id...');
        
        // Get all enrollments with group_data but no group_id
        $enrollments = Enrollment::whereNotNull('group_data')
                                ->whereNull('group_id')
                                ->get();
        
        $this->info("Found {$enrollments->count()} enrollments to migrate.");
        
        $updated = 0;
        $skipped = 0;
        
        foreach ($enrollments as $enrollment) {
            $this->line("Processing enrollment ID {$enrollment->id}...");
            
            // Skip if no group_data or no group_id in group_data
            if (!isset($enrollment->group_data['id'])) {
                $skipped++;
                $this->warn("- No group ID found in group_data. Skipping.");
                continue;
            }
            
            $groupId = $enrollment->group_data['id'];
            
            // Check if it's a course enrollment
            if ($enrollment->course_id) {
                // Verify the group exists
                $groupExists = CourseGroup::where('id', $groupId)->exists();
                if (!$groupExists) {
                    $skipped++;
                    $this->warn("- Course group ID {$groupId} not found. Skipping.");
                    continue;
                }
            } 
            // Check if it's a revision enrollment
            elseif ($enrollment->revision_id) {
                // Verify the modality exists
                $modalityExists = RevisionModality::where('id', $groupId)->exists();
                if (!$modalityExists) {
                    $skipped++;
                    $this->warn("- Revision modality ID {$groupId} not found. Skipping.");
                    continue;
                }
            } else {
                $skipped++;
                $this->warn("- Neither course_id nor revision_id set. Skipping.");
                continue;
            }
            
            // Update the enrollment
            $enrollment->group_id = $groupId;
            $enrollment->save();
            
            $updated++;
            $this->info("- Updated with group_id: {$groupId}");
        }
        
        $this->newLine();
        $this->info("Migration completed: {$updated} enrollments updated, {$skipped} skipped.");
    }
}