<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Parcours;

echo "=== UPDATING PARCOURS IMAGES ===\n";

$updates = [
    'decouvrir' => 'parcours/decouvrir.jpg',
    'approfondir' => 'parcours/approfondir.jpg',
    'transmettre' => 'parcours/transmettre.jpg',
];

foreach ($updates as $slug => $photo) {
    $parcours = Parcours::where('slug', $slug)->first();
    if ($parcours) {
        $parcours->photo = $photo;
        $parcours->save();
        echo "Updated {$slug} with {$photo}\n";
    } else {
        echo "Parcours {$slug} not found\n";
    }
}
