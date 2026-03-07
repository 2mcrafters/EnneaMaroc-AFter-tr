<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Parcours;

echo "=== PARCOURS PHOTOS ===\n";
$parcours = Parcours::all();
foreach ($parcours as $p) {
    echo "ID: {$p->id}, Title: {$p->title}, Photo: " . ($p->photo ? "'{$p->photo}'" : "NULL") . "\n";
}
