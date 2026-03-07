<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ParcoursModule;

echo "Checking all modules for empty fields...\n";

$modules = ParcoursModule::all();
$count = 0;
$issues = 0;

foreach ($modules as $module) {
    $count++;
    $missing = [];
    if (empty($module->description)) $missing[] = 'description';
    if (empty($module->details)) $missing[] = 'details';
    if (empty($module->horaires)) $missing[] = 'horaires';
    if (empty($module->prerequis)) $missing[] = 'prerequis';
    if (empty($module->price)) $missing[] = 'price';

    if (!empty($missing)) {
        $issues++;
        echo "Module ID {$module->id}: {$module->title}\n";
        echo "  Missing: " . implode(', ', $missing) . "\n";
        echo "--------------------------------------------------\n";
    }
}

echo "Checked {$count} modules. Found {$issues} modules with missing data.\n";
