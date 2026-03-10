<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\ParcoursSession;
use App\Models\ParcoursModule;
use App\Models\Parcours;

echo "=== CHECKING AGENDA DATA ===\n";
echo "Parcours count: " . Parcours::count() . "\n";
echo "Parcours Modules count: " . ParcoursModule::count() . "\n";
echo "Parcours Sessions count: " . ParcoursSession::count() . "\n";

$sessions = ParcoursSession::with('module.parcours')->get();
echo "Sessions details:\n";
foreach ($sessions as $session) {
    echo "- ID: {$session->id}, Date: {$session->start_date}, Module: " . ($session->module ? $session->module->title : 'NULL') . "\n";
}
