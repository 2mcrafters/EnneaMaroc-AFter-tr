<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Parcours;

$parcours = Parcours::all();

foreach ($parcours as $p) {
    echo "ID: " . $p->id . " | Slug: " . $p->slug . " | Photo: " . $p->photo . "\n";
}
