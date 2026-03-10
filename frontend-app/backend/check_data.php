<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;

echo "=== STATISTIQUES DES DONNÉES ===" . PHP_EOL;
echo "Users total: " . User::count() . PHP_EOL;
echo "- Admins: " . User::where('role', 'admin')->count() . PHP_EOL;
echo "- Professeurs: " . User::where('role', 'prof')->count() . PHP_EOL;
echo "- Employés: " . User::where('role', 'employee')->count() . PHP_EOL;
echo "- Étudiants: " . User::where('role', 'student')->count() . PHP_EOL;
echo PHP_EOL;
echo "Courses: " . Course::count() . PHP_EOL;
echo "- Online: " . Course::where('type', 'online')->count() . PHP_EOL;
echo "- In-person: " . Course::where('type', 'in-person')->count() . PHP_EOL;
echo "- Active: " . Course::where('status', 'active')->count() . PHP_EOL;
echo PHP_EOL;
echo "Enrollments: " . Enrollment::count() . PHP_EOL;
echo "- Active: " . Enrollment::where('status', 'active')->count() . PHP_EOL;
echo "- Completed: " . Enrollment::where('status', 'completed')->count() . PHP_EOL;
echo "- Pending: " . Enrollment::where('status', 'pending')->count() . PHP_EOL;
echo PHP_EOL;
echo "Payments: " . Payment::count() . PHP_EOL;
echo "- Completed: " . Payment::where('status', 'completed')->count() . PHP_EOL;
echo "- Pending: " . Payment::where('status', 'pending')->count() . PHP_EOL;
echo "- Failed: " . Payment::where('status', 'failed')->count() . PHP_EOL;
echo PHP_EOL;

// Afficher quelques cours créés
echo "=== EXEMPLES DE COURS CRÉÉS ===" . PHP_EOL;
$courses = Course::take(5)->get();
foreach ($courses as $course) {
    echo "- {$course->title} ({$course->type}) - {$course->price} DH" . PHP_EOL;
}
