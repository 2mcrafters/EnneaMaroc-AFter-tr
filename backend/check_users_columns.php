<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;

echo "=== USERS TABLE COLUMNS ===\n";
$columns = Schema::getColumnListing('users');
foreach ($columns as $column) {
    echo "- $column\n";
}
