<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ParcoursModule;

echo "Updating module icons...\n";

$iconUpdates = [
    20 => 'FaBrain',      // Centres d’intelligence
    22 => 'FaLightbulb',  // Lumière
    23 => 'FaMoon',       // Ombre
    24 => 'FaGem',        // Profondeur
    29 => 'FaGem',        // Intégration
];

foreach ($iconUpdates as $id => $icon) {
    $module = ParcoursModule::find($id);
    if ($module) {
        echo "Updating Icon for Module ID {$id} ({$module->title})...\n";
        $module->icon = $icon;
        $module->save();
        echo "  -> Set icon to: {$icon}\n";
    } else {
        echo "Module ID {$id} not found.\n";
    }
}

echo "Icon update complete.\n";
