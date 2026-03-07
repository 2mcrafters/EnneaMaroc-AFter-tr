<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Parcours;

echo "Checking Parcours places...\n";

$parcours = Parcours::all();

foreach ($parcours as $p) {
    echo "Parcours: {$p->title} (ID: {$p->id})\n";
    echo "  Lieu: " . ($p->lieu ?? 'NULL/EMPTY') . "\n";
    echo "--------------------------------------------------\n";
}
