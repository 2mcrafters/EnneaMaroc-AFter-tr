<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ParcoursModule;

$titlesToCheck = [
    "Intégration : Ennéagramme et profils jungiens",
    "Intégration — Ennéagramme et profils jungiens", // Check both variations
    "Centres d'intelligence",
    "Centres d’intelligence", // Check apostrophe variation
    "Lumière",
    "Ombre",
    "Profondeur"
];

foreach ($titlesToCheck as $title) {
    $modules = ParcoursModule::where('title', 'LIKE', "%$title%")->get();
    
    if ($modules->isEmpty()) {
        echo "No module found for: $title\n";
    } else {
        foreach ($modules as $module) {
            echo "Module: " . $module->title . " (ID: " . $module->id . ")\n";
            echo "  Description: " . (strlen($module->description) > 0 ? "SET" : "NULL/EMPTY") . "\n";
            echo "  Details: " . (strlen($module->details) > 0 ? "SET" : "NULL/EMPTY") . "\n";
            echo "  Horaires: " . ($module->horaires ?? "NULL") . "\n";
            echo "  Prerequis: " . ($module->prerequis ?? "NULL") . "\n";
            echo "  Price: " . ($module->price ?? "NULL") . "\n";
            echo "--------------------------------------------------\n";
        }
    }
}
