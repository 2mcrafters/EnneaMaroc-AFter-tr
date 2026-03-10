<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class QuickEnneagramSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🚀 Creating quick Enneagram data...');
        
        // Clear existing test data (keep admins)
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        User::where('email', 'NOT LIKE', '%admin%')->delete();
        DB::table('course_groups')->delete();
        DB::table('payments')->delete();
        DB::table('enrollments')->delete();
        DB::table('courses')->delete();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        
        // Create 5 professors
        $professors = [];
        $profNames = [
            ['Hassan', 'Bennani'], ['Fatima', 'Alami'], ['Omar', 'Tazi'], 
            ['Aicha', 'Fassi'], ['Karim', 'Berrada']
        ];
        
        foreach ($profNames as $name) {
            $professors[] = User::create([
                'firstName' => $name[0],
                'lastName' => $name[1],
                'email' => strtolower($name[0] . '.' . $name[1]) . '@prof.ma',
                'password' => Hash::make('password123'),
                'role' => 'prof',
                'city' => 'Casablanca',
                'phone' => '+2126' . rand(10000000, 99999999),
            ]);
        }
        
        // Create 2 employees
        $employees = [];
        $empNames = [['Souad', 'Hilali'], ['Mustapha', 'Ziani']];
        
        foreach ($empNames as $name) {
            $employees[] = User::create([
                'firstName' => $name[0],
                'lastName' => $name[1],
                'email' => strtolower($name[0] . '.' . $name[1]) . '@emp.ma',
                'password' => Hash::make('employee123'),
                'role' => 'employee',
                'city' => 'Rabat',
                'phone' => '+2126' . rand(10000000, 99999999),
            ]);
        }
        
        // Create 20 students
        $students = [];
        for ($i = 1; $i <= 20; $i++) {
            $students[] = User::create([
                'firstName' => 'Student',
                'lastName' => $i,
                'email' => "student{$i}@student.ma",
                'password' => Hash::make('student123'),
                'role' => 'student',
                'city' => ['Rabat', 'Casablanca', 'Marrakech'][rand(0, 2)],
                'phone' => '+2126' . rand(10000000, 99999999),
            ]);
        }
        
        // Create 8 courses
        $courseData = [
            ['title' => 'Introduction à l\'Ennéagramme', 'type' => 'online'],
            ['title' => 'Ennéagramme Avancé: Les Sous-types', 'type' => 'in-person'],
            ['title' => 'Coaching avec l\'Ennéagramme', 'type' => 'online'],
            ['title' => 'Leadership et Ennéagramme', 'type' => 'in-person'],
            ['title' => 'Fondamentaux du Coaching', 'type' => 'online'],
            ['title' => 'Coaching Professionnel Certifiant', 'type' => 'in-person'],
            ['title' => 'Communication Consciente', 'type' => 'online'],
            ['title' => 'Gestion des Conflits par l\'Ennéagramme', 'type' => 'in-person'],
        ];
        
        $courses = [];
        foreach ($courseData as $index => $courseInfo) {
            $course = Course::create([
                'title' => $courseInfo['title'],
                'description' => 'Description complète du cours ' . $courseInfo['title'] . '. Ce cours vous permettra d\'approfondir vos connaissances et de développer vos compétences dans le domaine.',
                'short_description' => 'Cours sur ' . $courseInfo['title'],
                'image_url' => 'https://picsum.photos/400/300?random=' . ($index + 10),
                'type' => $courseInfo['type'],
                'duration_months' => rand(2, 6),
                'sessions_per_month' => rand(4, 8),
                'status' => 'active',
            ]);
            
            // Create 1-2 groups per course
            for ($g = 0; $g < rand(1, 2); $g++) {
                DB::table('course_groups')->insert([
                    'course_id' => $course->id,
                    'day' => ['Lundis', 'Mardis', 'Mercredis', 'Jeudis', 'Vendredis'][rand(0, 4)],
                    'time' => ['09:00 - 11:00', '14:00 - 16:00', '18:00 - 20:00'][rand(0, 2)],
                    'price' => rand(1200, 3000),
                    'instructor_id' => $professors[array_rand($professors)]->id,
                    'meeting_link' => $courseInfo['type'] === 'online' ? 'https://meet.google.com/room' . $g : null,
                    'capacity' => rand(10, 20),
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            
            $courses[] = $course;
        }
        
        // Create 50 enrollments
        for ($i = 0; $i < 50; $i++) {
            $student = $students[array_rand($students)];
            $course = $courses[array_rand($courses)];
            
            // Check for duplicates
            $exists = Enrollment::where('user_id', $student->id)
                               ->where('course_id', $course->id)
                               ->exists();
                               
            if (!$exists) {
                $enrollment = Enrollment::create([
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                    'status' => ['active', 'pending_payment', 'completed'][rand(0, 2)],
                    'enrolled_at' => now()->subDays(rand(1, 90)),
                    'duration_months' => rand(1, 6),
                ]);
                
                // Create 1-3 payments per active enrollment
                if ($enrollment->status === 'active' || $enrollment->status === 'completed') {
                    for ($p = 1; $p <= rand(1, 3); $p++) {
                        Payment::create([
                            'enrollment_id' => $enrollment->id,
                            'amount' => rand(800, 1500),
                            'month' => $p,
                            'status' => ['confirmed', 'pending', 'confirmed'][rand(0, 2)],
                            'payment_date' => now()->subDays(rand(1, 60)),
                            'admin_notes' => 'Paiement mois ' . $p,
                            'confirmed_by' => $employees[array_rand($employees)]->id,
                            'confirmed_at' => now()->subDays(rand(1, 30)),
                        ]);
                    }
                }
            }
        }
        
        $this->command->info('✅ Quick Enneagram Seeder completed!');
        $this->command->info('📊 Created:');
        $this->command->info('   👨‍🏫 Professors: ' . count($professors));
        $this->command->info('   👥 Employees: ' . count($employees));
        $this->command->info('   🎓 Students: ' . count($students));
        $this->command->info('   📚 Courses: ' . count($courses));
        $this->command->info('   📝 Enrollments: ' . Enrollment::count());
        $this->command->info('   💳 Payments: ' . Payment::count());
    }
}
