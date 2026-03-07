<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class TestSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🧪 Testing seeder...');
        
        // Test 1: Create a simple course
        try {
            $course = Course::create([
                'title' => 'Test Course Ennéagramme',
                'description' => 'Course de test pour vérifier la structure',
                'short_description' => 'Test course description',
                'image_url' => 'https://picsum.photos/400/300?random=test',
                'type' => 'online',
                'duration_months' => 3,
                'sessions_per_month' => 8,
                'status' => 'active',
            ]);
            $this->command->info('✅ Course created with ID: ' . $course->id);
        } catch (\Exception $e) {
            $this->command->error('❌ Course creation failed: ' . $e->getMessage());
            return;
        }
        
        // Test 2: Create a simple user
        try {
            $user = User::create([
                'firstName' => 'Test',
                'lastName' => 'Student',
                'email' => 'test.student' . rand(1000, 9999) . '@test.ma',
                'password' => Hash::make('password123'),
                'role' => 'student',
                'city' => 'Rabat',
                'phone' => '+212600000000',
            ]);
            $this->command->info('✅ User created with ID: ' . $user->id);
        } catch (\Exception $e) {
            $this->command->error('❌ User creation failed: ' . $e->getMessage());
            return;
        }
        
        // Test 3: Create enrollment
        try {
            $enrollment = Enrollment::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'status' => 'active',
                'enrolled_at' => now(),
                'duration_months' => 3,
            ]);
            $this->command->info('✅ Enrollment created with ID: ' . $enrollment->id);
        } catch (\Exception $e) {
            $this->command->error('❌ Enrollment creation failed: ' . $e->getMessage());
            return;
        }
        
        // Test 4: Create payment
        try {
            $payment = Payment::create([
                'enrollment_id' => $enrollment->id,
                'amount' => 1500.00,
                'month' => 1,
                'status' => 'confirmed',
                'payment_date' => now()->format('Y-m-d'),
            ]);
            $this->command->info('✅ Payment created with ID: ' . $payment->id);
        } catch (\Exception $e) {
            $this->command->error('❌ Payment creation failed: ' . $e->getMessage());
            return;
        }
        
        $this->command->info('🎉 All tests passed!');
    }
}
