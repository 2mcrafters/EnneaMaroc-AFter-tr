<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Parcours;

echo "Checking Parcours table structure...\n";

$table = 'parcours';
$columns = \Illuminate\Support\Facades\Schema::getColumnListing($table);

echo "Columns in '{$table}':\n";
foreach ($columns as $col) {
    echo " - {$col}\n";
}

echo "\nChecking first Parcours record...\n";
$p = Parcours::first();
if ($p) {
    print_r($p->toArray());
} else {
    echo "No records found.\n";
}
