<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

echo "=== Database Setup ===\n";

try {
    // Check if users table exists
    if (!Schema::hasTable('users')) {
        echo "❌ Users table does not exist. Running migrations...\n";
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        echo "✅ Migrations completed\n";
    } else {
        echo "✅ Users table exists\n";
    }

    // Check if admin user exists
    $adminUser = User::where('email', 'admin@admin.com')->first();
    
    if (!$adminUser) {
        echo "Creating admin user...\n";
        User::create([
            'firstName' => 'Admin',
            'lastName' => 'User',
            'email' => 'admin@admin.com',
            'password' => Hash::make('admin'),
            'role' => 'admin',
            'city' => 'Rabat',
            'phone' => '+212600000000',
        ]);
        echo "✅ Admin user created\n";
    } else {
        echo "✅ Admin user already exists\n";
    }
    
    echo "=== Setup Complete ===\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
