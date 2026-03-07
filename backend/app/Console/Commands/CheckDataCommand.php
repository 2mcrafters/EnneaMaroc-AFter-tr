<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;

class CheckDataCommand extends Command
{
    protected $signature = 'check:data';
    protected $description = 'Check database data counts';

    public function handle()
    {
        $this->info('📊 Database Statistics:');
        $this->line('Users: ' . User::count());
        $this->line('  - Professors: ' . User::where('role', 'prof')->count());
        $this->line('  - Employees: ' . User::where('role', 'employee')->count());
        $this->line('  - Students: ' . User::where('role', 'student')->count());
        $this->line('Courses: ' . Course::count());
        $this->line('Enrollments: ' . Enrollment::count());
        $this->line('Payments: ' . Payment::count());
        
        // Derniers cours créés
        $this->line('');
        $this->info('📚 Latest Courses:');
        $courses = Course::latest()->take(5)->get();
        foreach ($courses as $course) {
            $this->line("  - {$course->title} ({$course->type})");
        }
    }
}
