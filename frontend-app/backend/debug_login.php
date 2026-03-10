<?php
require_once 'vendor/autoload.php';

// Load Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== Login Debug Script ===\n";

// Check if admin user exists
$adminUser = User::where('email', 'admin@admin.com')->first();

if ($adminUser) {
    echo "✅ Admin user found:\n";
    echo "  ID: " . $adminUser->id . "\n";
    echo "  Email: " . $adminUser->email . "\n";
    echo "  Role: " . $adminUser->role . "\n";
    echo "  Name: " . $adminUser->firstName . " " . $adminUser->lastName . "\n";
    
    // Test password
    if (Hash::check('admin', $adminUser->password)) {
        echo "✅ Password 'admin' is correct\n";
    } else {
        echo "❌ Password 'admin' is incorrect\n";
    }
} else {
    echo "❌ Admin user not found\n";
    echo "Creating admin user...\n";
    
    try {
        User::create([
            'firstName' => 'Admin',
            'lastName' => 'User',
            'email' => 'admin@admin.com',
            'password' => Hash::make('admin'),
            'role' => 'admin',
            'city' => 'Rabat',
            'phone' => '+212600000000',
        ]);
        echo "✅ Admin user created successfully\n";
    } catch (Exception $e) {
        echo "❌ Error creating admin user: " . $e->getMessage() . "\n";
    }
}

echo "=== End Debug ===\n";
