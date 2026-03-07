<?php
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ParcoursModule;

try {
    $modules = ParcoursModule::with('parcours')->get();
    foreach ($modules as $m) {
        echo "Module ID: " . $m->id . " - Reference: " . $m->reference . " (Parcours: " . ($m->parcours->slug ?? 'N/A') . ")\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
