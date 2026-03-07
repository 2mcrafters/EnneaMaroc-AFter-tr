<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class EnneagramDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        User::where('email', 'NOT LIKE', '%admin@%')->delete();
        Course::truncate();
        Enrollment::truncate();
        Payment::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Create Professors (20)
        $professors = [];
        $professorNames = [
            ['Amal', 'Benali'], ['Hassan', 'El Fassi'], ['Fatima', 'Zohra'], ['Omar', 'Chakir'],
            ['Aicha', 'Bennani'], ['Youssef', 'Tazi'], ['Khadija', 'Alami'], ['Mehdi', 'Lahlou'],
            ['Sanaa', 'Benjelloun'], ['Karim', 'Idrissi'], ['Nadia', 'El Amrani'], ['Rachid', 'Berrada'],
            ['Latifa', 'Bouazza'], ['Ahmed', 'Sbihi'], ['Maryam', 'Kettani'], ['Abdellah', 'Chraibi'],
            ['Zineb', 'Fassi Fihri'], ['Hamid', 'Skalli'], ['Leila', 'Benkirane'], ['Said', 'Mokhtari']
        ];

        foreach ($professorNames as $index => $name) {
            $professors[] = User::create([
                'firstName' => $name[0],
                'lastName' => $name[1],
                'email' => strtolower($name[0] . '.' . $name[1]) . '@enneagram.ma',
                'password' => Hash::make('password123'),
                'role' => 'prof',
                'city' => ['Rabat', 'Casablanca', 'Marrakech', 'Fes', 'Tanger', 'Agadir'][rand(0, 5)],
                'phone' => '+2126' . str_pad(rand(10000000, 99999999), 8, '0', STR_PAD_LEFT),
                'profilePicture' => 'https://i.pravatar.cc/150?u=' . strtolower($name[0] . $name[1]),
                'dob' => now()->subYears(rand(30, 55))->format('Y-m-d'),
            ]);
        }

        // Create Employees (8)
        $employees = [];
        $employeeNames = [
            ['Souad', 'Hilali'], ['Mustapha', 'Ziani'], ['Karima', 'Ouali'], ['Brahim', 'Naciri'],
            ['Houda', 'Bensouda'], ['Tarik', 'Lazrak'], ['Siham', 'Benaissa'], ['Driss', 'Lamrani']
        ];

        foreach ($employeeNames as $index => $name) {
            $employees[] = User::create([
                'firstName' => $name[0],
                'lastName' => $name[1],
                'email' => strtolower($name[0] . '.' . $name[1]) . '@enneagram.ma',
                'password' => Hash::make('employee123'),
                'role' => 'employee',
                'city' => ['Rabat', 'Casablanca', 'Marrakech', 'Fes'][rand(0, 3)],
                'phone' => '+2126' . str_pad(rand(10000000, 99999999), 8, '0', STR_PAD_LEFT),
                'profilePicture' => 'https://i.pravatar.cc/150?u=' . strtolower($name[0] . $name[1]),
                'dob' => now()->subYears(rand(25, 45))->format('Y-m-d'),
            ]);
        }

        // Create Students (100)
        $students = [];
        $firstNames = [
            'Amina', 'Mohamed', 'Fatima', 'Hassan', 'Khadija', 'Omar', 'Aicha', 'Youssef',
            'Zeinab', 'Ahmed', 'Malika', 'Abdelkrim', 'Nawal', 'Khalid', 'Samira', 'Rachid',
            'Houda', 'Mustapha', 'Laila', 'Brahim', 'Nadia', 'Karim', 'Salma', 'Hamid',
            'Kenza', 'Younes', 'Ilham', 'Driss', 'Ghita', 'Saad', 'Imane', 'Fouad',
            'Rajae', 'Tarik', 'Siham', 'Amine', 'Widad', 'Otmane', 'Ikram', 'Badr'
        ];
        
        $lastNames = [
            'Alaoui', 'Benali', 'Chraibi', 'Drissi', 'El Amrani', 'Fassi', 'Ghazi', 'Hajji',
            'Idrissi', 'Jaouhari', 'Kettani', 'Lahlou', 'Mahdaoui', 'Naciri', 'Ouali', 'Pacha',
            'Qadiri', 'Rifai', 'Skalli', 'Tazi', 'Umayyad', 'Vidadi', 'Wahbi', 'Xerfi',
            'Yacoubi', 'Ziani', 'Benchekroun', 'El Fassi', 'Benjelloun', 'Berrada'
        ];

        for ($i = 0; $i < 100; $i++) {
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            
            $students[] = User::create([
                'firstName' => $firstName,
                'lastName' => $lastName,
                'email' => strtolower($firstName . '.' . $lastName . $i) . '@student.ma',
                'password' => Hash::make('student123'),
                'role' => 'student',
                'city' => ['Rabat', 'Casablanca', 'Marrakech', 'Fes', 'Tanger', 'Agadir', 'Meknes', 'Oujda'][rand(0, 7)],
                'phone' => '+2126' . str_pad(rand(10000000, 99999999), 8, '0', STR_PAD_LEFT),
                'profilePicture' => 'https://i.pravatar.cc/150?u=' . strtolower($firstName . $lastName . $i),
                'dob' => now()->subYears(rand(18, 65))->format('Y-m-d'),
            ]);
        }

        // Create Enneagram & Coaching Courses (25)
        $courses = [];
        $courseData = [
            // Enneagram Courses
            [
                'title' => 'Introduction à l\'Ennéagramme',
                'description' => 'Découvrez les 9 types de personnalité et leurs motivations profondes. Un voyage de connaissance de soi transformateur.',
                'type' => 'online',
                'level' => 'Débutant'
            ],
            [
                'title' => 'Ennéagramme Avancé: Les Sous-types',
                'description' => 'Approfondissez votre compréhension avec les 27 sous-types de l\'ennéagramme et leurs nuances comportementales.',
                'type' => 'in-person',
                'level' => 'Avancé'
            ],
            [
                'title' => 'Ennéagramme et Relations Interpersonnelles',
                'description' => 'Comment utiliser l\'ennéagramme pour améliorer vos relations personnelles et professionnelles.',
                'type' => 'online',
                'level' => 'Intermédiaire'
            ],
            [
                'title' => 'Les Centres d\'Intelligence de l\'Ennéagramme',
                'description' => 'Explorez les centres mental, émotionnel et instinctif et leur impact sur votre comportement.',
                'type' => 'in-person',
                'level' => 'Intermédiaire'
            ],
            [
                'title' => 'Ennéagramme et Développement Personnel',
                'description' => 'Utilisez l\'ennéagramme comme outil de croissance personnelle et de transformation.',
                'type' => 'online',
                'level' => 'Débutant'
            ],
            [
                'title' => 'Ennéagramme au Travail',
                'description' => 'Appliquez l\'ennéagramme dans le contexte professionnel pour une meilleure collaboration.',
                'type' => 'in-person',
                'level' => 'Intermédiaire'
            ],
            [
                'title' => 'Les Ailes de l\'Ennéagramme',
                'description' => 'Comprenez comment les types adjacents influencent votre personnalité principale.',
                'type' => 'online',
                'level' => 'Avancé'
            ],
            [
                'title' => 'Ennéagramme et Gestion du Stress',
                'description' => 'Identifiez vos patterns de stress et développez des stratégies de gestion personnalisées.',
                'type' => 'online',
                'level' => 'Débutant'
            ],
            // Coaching Courses
            [
                'title' => 'Fondamentaux du Coaching de Vie',
                'description' => 'Les bases du coaching : écoute active, questionnement puissant et accompagnement bienveillant.',
                'type' => 'in-person',
                'level' => 'Débutant'
            ],
            [
                'title' => 'Coaching Professionnel Certifiant',
                'description' => 'Formation complète pour devenir coach professionnel certifié ICF (International Coach Federation).',
                'type' => 'in-person',
                'level' => 'Avancé'
            ],
            [
                'title' => 'Coaching et PNL',
                'description' => 'Intégrez les techniques de Programmation Neuro-Linguistique dans votre pratique de coaching.',
                'type' => 'online',
                'level' => 'Avancé'
            ],
            [
                'title' => 'Coaching d\'Équipe',
                'description' => 'Techniques spécialisées pour coacher des équipes et améliorer la dynamique collective.',
                'type' => 'in-person',
                'level' => 'Avancé'
            ],
            [
                'title' => 'Coaching Executif',
                'description' => 'Accompagnement des dirigeants et cadres supérieurs dans leurs défis de leadership.',
                'type' => 'in-person',
                'level' => 'Expert'
            ],
            [
                'title' => 'Coaching de Transition de Carrière',
                'description' => 'Spécialisez-vous dans l\'accompagnement des reconversions professionnelles.',
                'type' => 'online',
                'level' => 'Intermédiaire'
            ],
            [
                'title' => 'Outils et Techniques de Coaching',
                'description' => 'Maîtrisez les principaux outils du coach : GROW, CNV, analyse transactionnelle.',
                'type' => 'online',
                'level' => 'Intermédiaire'
            ],
            // Specialized Combined Courses
            [
                'title' => 'Coaching avec l\'Ennéagramme',
                'description' => 'Combinez coaching et ennéagramme pour un accompagnement personnalisé et efficace.',
                'type' => 'in-person',
                'level' => 'Avancé'
            ],
            [
                'title' => 'Leadership et Ennéagramme',
                'description' => 'Développez votre style de leadership en comprenant votre type ennéagramme.',
                'type' => 'online',
                'level' => 'Intermédiaire'
            ],
            [
                'title' => 'Communication Consciente',
                'description' => 'Utilisez l\'ennéagramme pour améliorer votre communication interpersonnelle.',
                'type' => 'online',
                'level' => 'Débutant'
            ],
            [
                'title' => 'Gestion des Conflits par l\'Ennéagramme',
                'description' => 'Résolvez les conflits en comprenant les motivations profondes de chaque type.',
                'type' => 'in-person',
                'level' => 'Intermédiaire'
            ],
            [
                'title' => 'Ennéagramme et Spiritualité',
                'description' => 'Explorez la dimension spirituelle de l\'ennéagramme et ses voies de transcendance.',
                'type' => 'online',
                'level' => 'Avancé'
            ],
            [
                'title' => 'Coaching Parental avec l\'Ennéagramme',
                'description' => 'Accompagnez les parents en utilisant l\'ennéagramme pour mieux comprendre leurs enfants.',
                'type' => 'online',
                'level' => 'Intermédiaire'
            ],
            [
                'title' => 'Ennéagramme et Créativité',
                'description' => 'Libérez votre potentiel créatif en comprenant votre type ennéagramme.',
                'type' => 'in-person',
                'level' => 'Débutant'
            ],
            [
                'title' => 'Supervision en Coaching',
                'description' => 'Formation pour superviseurs de coachs : éthique, déontologie et développement professionnel.',
                'type' => 'in-person',
                'level' => 'Expert'
            ],
            [
                'title' => 'Coaching et Intelligence Émotionnelle',
                'description' => 'Développez l\'intelligence émotionnelle de vos coachés grâce à l\'ennéagramme.',
                'type' => 'online',
                'level' => 'Intermédiaire'
            ],
            [
                'title' => 'Certification Formateur Ennéagramme',
                'description' => 'Devenez formateur certifié en ennéagramme et transmettez cette connaissance précieuse.',
                'type' => 'in-person',
                'level' => 'Expert'
            ]
        ];

        foreach ($courseData as $index => $courseInfo) {
            $course = Course::create([
                'title' => $courseInfo['title'],
                'description' => $courseInfo['description'],
                'short_description' => substr($courseInfo['description'], 0, 100) . '...',
                'image_url' => 'https://picsum.photos/400/300?random=' . ($index + 1),
                'type' => $courseInfo['type'],
                'duration_months' => rand(1, 6), // 1 à 6 mois
                'sessions_per_month' => rand(4, 16), // 4 à 16 sessions par mois
                'status' => ['active', 'active', 'active', 'inactive'][rand(0, 3)], // 75% active
                'created_at' => now()->subDays(rand(1, 180)),
            ]);

            // Create course groups for each course (1-3 groups per course)
            $groupCount = rand(1, 3);
            for ($g = 0; $g < $groupCount; $g++) {
                $days = [
                    'Lundis', 'Mardis', 'Mercredis', 'Jeudis', 'Vendredis', 
                    'Samedis', 'Dimanches',
                    'Lundis & Mercredis', 'Mardis & Jeudis', 'Mercredis & Vendredis'
                ];
                
                $times = [
                    '09:00 - 11:00', '10:00 - 12:00', '14:00 - 16:00', 
                    '16:00 - 18:00', '18:00 - 20:00', '19:00 - 21:00'
                ];

                DB::table('course_groups')->insert([
                    'course_id' => $course->id,
                    'day' => $days[array_rand($days)],
                    'time' => $times[array_rand($times)],
                    'price' => rand(800, 3000), // Prix entre 800 et 3000 MAD
                    'instructor_id' => $professors[array_rand($professors)]->id,
                    'meeting_link' => $courseInfo['type'] === 'online' ? 'https://meet.google.com/abc-defg-hij' . $g : null,
                    'capacity' => rand(8, 25), // Capacité entre 8 et 25 étudiants
                    'status' => ['active', 'active', 'active', 'inactive'][rand(0, 3)],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $courses[] = $course;
        }

        // Create Enrollments (300-400)
        $enrollments = [];
        $enrollmentCount = rand(300, 400);
        
        for ($i = 0; $i < $enrollmentCount; $i++) {
            $student = $students[array_rand($students)];
            $course = $courses[array_rand($courses)];
            
            // Avoid duplicate enrollments
            $existingEnrollment = Enrollment::where('user_id', $student->id)
                                          ->where('course_id', $course->id)
                                          ->first();
                                          
            if (!$existingEnrollment) {
                $statusOptions = ['active', 'pending', 'completed', 'cancelled', 'suspended'];
                $weights = [40, 15, 25, 10, 10]; // Percentage weights
                $status = $this->weightedRandom($statusOptions, $weights);
                
                $enrollment = Enrollment::create([
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                    'status' => $status,
                    'enrolled_at' => now()->subDays(rand(1, 180)),
                    'duration_months' => rand(1, 6),
                ]);
                
                $enrollments[] = $enrollment;
            }
        }

        // Create Payments (400-600) - only for active enrollments
        $paymentStatuses = ['confirmed', 'pending', 'rejected'];
        $statusWeights = [70, 25, 5]; // Percentage weights
        
        $paymentCount = 0;
        
        // Create payments for each enrollment
        foreach ($enrollments as $enrollment) {
            if ($enrollment->status === 'active' || $enrollment->status === 'completed') {
                // Create 1-6 monthly payments per enrollment
                $monthlyPayments = rand(1, 6);
                
                for ($month = 1; $month <= $monthlyPayments; $month++) {
                    $status = $this->weightedRandom($paymentStatuses, $statusWeights);
                    $baseAmount = rand(500, 2000); // Random monthly amount
                    
                    Payment::create([
                        'enrollment_id' => $enrollment->id,
                        'amount' => $baseAmount,
                        'month' => $month,
                        'status' => $status,
                        'payment_proof' => $status !== 'pending' ? 'proof_' . uniqid() . '.jpg' : null,
                        'payment_date' => now()->subDays(rand(1, 180))->format('Y-m-d'),
                        'admin_notes' => $this->getPaymentNote($status),
                        'confirmed_by' => $status === 'confirmed' ? $employees[array_rand($employees)]->id : null,
                        'confirmed_at' => $status === 'confirmed' ? now()->subDays(rand(1, 30)) : null,
                        'created_at' => now()->subDays(rand(1, 180)),
                    ]);
                    
                    $paymentCount++;
                }
            }
        }

        $this->command->info('✅ Enneagram Data Seeder completed successfully!');
        $this->command->info("📊 Created:");
        $this->command->info("   👨‍🏫 Professors: " . count($professors));
        $this->command->info("   👥 Employees: " . count($employees));
        $this->command->info("   🎓 Students: " . count($students));
        $this->command->info("   📚 Courses: " . count($courses));
        $this->command->info("   📝 Enrollments: " . count($enrollments));
        $this->command->info("   💳 Payments: " . $paymentCount);
    }

    private function weightedRandom($options, $weights)
    {
        $total = array_sum($weights);
        $random = rand(1, $total);
        
        $sum = 0;
        foreach ($options as $index => $option) {
            $sum += $weights[$index];
            if ($random <= $sum) {
                return $option;
            }
        }
        
        return $options[0]; // Fallback
    }



    private function getPaymentNote($status)
    {
        $notes = [
            'confirmed' => 'Paiement confirmé par l\'administration',
            'pending' => 'Paiement en attente de validation',
            'rejected' => 'Paiement rejeté - justificatif non valide'
        ];
        
        return $notes[$status] ?? '';
    }
}
