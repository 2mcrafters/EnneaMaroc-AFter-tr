<?php
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ParcoursSession;
use Illuminate\Support\Facades\DB;

try {
    $count = ParcoursSession::count();
    echo "Sessions count: " . $count . "\n";
    
    $sessions = ParcoursSession::all();
    foreach ($sessions as $s) {
        echo "- Session for module " . $s->module_id . ": " . $s->start_date . " to " . $s->end_date . "\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
