<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CourseGroup;
use App\Models\User;

class CourseGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer des instructeurs (profs)
        $instructors = User::where('role', 'prof')->pluck('id')->toArray();
        
        // Si aucun prof n'existe, créer un prof par défaut
        if (empty($instructors)) {
            $defaultInstructor = User::create([
                'firstName' => 'Hans',
                'lastName' => 'Mueller',
                'email' => 'hans.mueller@alingua.com',
                'password' => bcrypt('password'),
                'role' => 'prof',
                'phone' => '+4915123456789',
                'dob' => '1985-05-15',
                'status' => 'active'
            ]);
            $instructors = [$defaultInstructor->id];
        }

        $courseGroups = [
            // Allemand A1 - Présentiel (course_id: 1)
            [
                'course_id' => 1,
                'day' => 'Lundi & Mercredi',
                'time' => '09:00 - 11:00',
                'price' => 1200.00,
                'instructor_id' => $instructors[0],
                'capacity' => 15,
                'status' => 'active'
            ],
            [
                'course_id' => 1,
                'day' => 'Mardi & Jeudi',
                'time' => '18:00 - 20:00',
                'price' => 1200.00,
                'instructor_id' => $instructors[0],
                'capacity' => 12,
                'status' => 'active'
            ],
            [
                'course_id' => 1,
                'day' => 'Samedi',
                'time' => '10:00 - 14:00',
                'price' => 1400.00,
                'instructor_id' => $instructors[0],
                'capacity' => 20,
                'status' => 'active'
            ],

            // Allemand A1 - En ligne (course_id: 2)
            [
                'course_id' => 2,
                'day' => 'Lundi & Mercredi',
                'time' => '19:00 - 21:00',
                'price' => 900.00,
                'instructor_id' => $instructors[0],
                'meeting_link' => 'https://zoom.us/j/123456789',
                'capacity' => 25,
                'status' => 'active'
            ],
            [
                'course_id' => 2,
                'day' => 'Dimanche',
                'time' => '15:00 - 19:00',
                'price' => 1000.00,
                'instructor_id' => $instructors[0],
                'meeting_link' => 'https://zoom.us/j/987654321',
                'capacity' => 30,
                'status' => 'active'
            ],

            // Allemand A2 - Présentiel (course_id: 3)
            [
                'course_id' => 3,
                'day' => 'Lundi & Mercredi',
                'time' => '11:00 - 13:00',
                'price' => 1400.00,
                'instructor_id' => $instructors[0],
                'capacity' => 15,
                'status' => 'active'
            ],
            [
                'course_id' => 3,
                'day' => 'Mardi & Jeudi',
                'time' => '16:00 - 18:00',
                'price' => 1400.00,
                'instructor_id' => $instructors[0],
                'capacity' => 18,
                'status' => 'active'
            ],

            // Allemand A2 - En ligne (course_id: 4)
            [
                'course_id' => 4,
                'day' => 'Mercredi & Vendredi',
                'time' => '20:00 - 22:00',
                'price' => 1100.00,
                'instructor_id' => $instructors[0],
                'meeting_link' => 'https://zoom.us/j/555666777',
                'capacity' => 20,
                'status' => 'active'
            ],

            // Allemand B1 - Présentiel (course_id: 5)
            [
                'course_id' => 5,
                'day' => 'Lundi & Mercredi',
                'time' => '14:00 - 16:00',
                'price' => 1600.00,
                'instructor_id' => $instructors[0],
                'capacity' => 12,
                'status' => 'active'
            ],
            [
                'course_id' => 5,
                'day' => 'Samedi',
                'time' => '09:00 - 13:00',
                'price' => 1800.00,
                'instructor_id' => $instructors[0],
                'capacity' => 15,
                'status' => 'active'
            ],

            // Allemand B1 - En ligne (course_id: 6)
            [
                'course_id' => 6,
                'day' => 'Mardi & Jeudi',
                'time' => '19:00 - 21:00',
                'price' => 1300.00,
                'instructor_id' => $instructors[0],
                'meeting_link' => 'https://zoom.us/j/111222333',
                'capacity' => 18,
                'status' => 'active'
            ],

            // Allemand B2 - Présentiel (course_id: 7)
            [
                'course_id' => 7,
                'day' => 'Lundi & Mercredi',
                'time' => '16:00 - 18:00',
                'price' => 1800.00,
                'instructor_id' => $instructors[0],
                'capacity' => 10,
                'status' => 'active'
            ],
            [
                'course_id' => 7,
                'day' => 'Vendredi',
                'time' => '14:00 - 18:00',
                'price' => 2000.00,
                'instructor_id' => $instructors[0],
                'capacity' => 12,
                'status' => 'active'
            ],

            // Allemand B2 - En ligne (course_id: 8)
            [
                'course_id' => 8,
                'day' => 'Mercredi & Vendredi',
                'time' => '18:00 - 20:00',
                'price' => 1500.00,
                'instructor_id' => $instructors[0],
                'meeting_link' => 'https://zoom.us/j/444555666',
                'capacity' => 15,
                'status' => 'active'
            ],

            // Allemand C1 - Présentiel (course_id: 9)
            [
                'course_id' => 9,
                'day' => 'Mardi & Jeudi',
                'time' => '10:00 - 12:00',
                'price' => 2200.00,
                'instructor_id' => $instructors[0],
                'capacity' => 8,
                'status' => 'active'
            ],

            // Allemand C2 - Présentiel (course_id: 10)
            [
                'course_id' => 10,
                'day' => 'Samedi',
                'time' => '10:00 - 14:00',
                'price' => 2800.00,
                'instructor_id' => $instructors[0],
                'capacity' => 6,
                'status' => 'active'
            ]
        ];

        foreach ($courseGroups as $groupData) {
            CourseGroup::create($groupData);
        }
    }
}
