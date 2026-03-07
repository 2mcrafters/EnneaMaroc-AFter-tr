<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Parcours;

echo "=== UPDATING PARCOURS LIEU ===\n";

$defaultLieu = "Ferme J'nan Lemonie — Sidi Yamani";

$parcoursList = Parcours::all();

foreach ($parcoursList as $parcours) {
    $parcours->lieu = $defaultLieu;
    $parcours->save();
    echo "Updated {$parcours->slug} with lieu: {$defaultLieu}\n";
}
