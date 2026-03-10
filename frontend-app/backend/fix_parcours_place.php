<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Parcours;

echo "Setting default place for Parcours...\n";

$defaultPlace = "Ferme J’nan Lemonie Sidi Yamani";

$parcours = Parcours::all();

foreach ($parcours as $p) {
    echo "Updating Parcours: {$p->title} (ID: {$p->id})...\n";
    $p->lieu = $defaultPlace;
    $p->save();
    echo "  -> Set lieu to: {$defaultPlace}\n";
}

echo "Done.\n";
