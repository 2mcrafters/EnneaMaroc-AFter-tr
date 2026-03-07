<?php
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Parcours;
use Illuminate\Support\Facades\DB;

try {
    $count = Parcours::count();
    echo "Parcours count: " . $count . "\n";
    
    $parcours = Parcours::all();
    foreach ($parcours as $p) {
        echo "- " . $p->title . " (Slug: " . $p->slug . ")\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
