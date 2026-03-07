<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;
use App\Models\Course;

echo "=== CHECKING COURSES TABLE ===\n";
if (Schema::hasTable('courses')) {
    echo "Table 'courses' exists.\n";
    echo "Count: " . Course::count() . "\n";
    $courses = Course::all();
    foreach ($courses as $c) {
        echo "ID: {$c->id}, Title: {$c->title}, Image: " . ($c->image_url ? "'{$c->image_url}'" : "NULL") . "\n";
    }
} else {
    echo "Table 'courses' DOES NOT exist.\n";
}
