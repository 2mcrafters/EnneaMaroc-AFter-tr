<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ParcoursModule;

echo "Checking module icons...\n";

$modules = ParcoursModule::all();

foreach ($modules as $module) {
    echo "Module ID {$module->id}: {$module->title}\n";
    echo "  Icon: " . ($module->icon ?? 'NULL/EMPTY') . "\n";
    echo "--------------------------------------------------\n";
}
