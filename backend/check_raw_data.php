<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== RAW SESSION DATA ===\n";
$sessions = DB::table('agenda')->select('id', 'parcours_module_id', 'start_date')->limit(10)->get();
foreach ($sessions as $session) {
    echo "ID: {$session->id}, ModuleID: {$session->parcours_module_id}, Date: {$session->start_date}\n";
}

echo "\n=== MODULE IDS ===\n";
$modules = DB::table('parcours_modules')->pluck('id');
echo "Module IDs: " . $modules->implode(', ') . "\n";
