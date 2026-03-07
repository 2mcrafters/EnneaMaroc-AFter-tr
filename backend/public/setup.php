<?php
// Quick setup page to create admin user
header('Content-Type: text/html; charset=UTF-8');

if (file_exists('../vendor/autoload.php')) {
    require_once '../vendor/autoload.php';
    
    $app = require_once '../bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    $message = '';
    $error = '';
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['create_admin'])) {
        try {
            // Run migrations if needed
            if (!\Illuminate\Support\Facades\Schema::hasTable('users')) {
                \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
                $message .= "✅ Database tables created.<br>";
            }
            
            // Check if admin exists
            $existingAdmin = \App\Models\User::where('email', 'admin@admin.com')->first();
            if ($existingAdmin) {
                $message .= "ℹ️ Admin user already exists.<br>";
            } else {
                // Create admin user
                \App\Models\User::create([
                    'firstName' => 'Admin',
                    'lastName' => 'User', 
                    'email' => 'admin@admin.com',
                    'password' => \Illuminate\Support\Facades\Hash::make('admin'),
                    'role' => 'admin',
                    'city' => 'Rabat',
                    'phone' => '+212600000000',
                ]);
                $message .= "✅ Admin user created successfully!<br>";
            }
            
            $message .= "<br><strong>Login credentials:</strong><br>Email: admin@admin.com<br>Password: admin";
            
        } catch (Exception $e) {
            $error = "❌ Error: " . $e->getMessage();
        }
    }
    
    // Check current state
    $status = '';
    try {
        if (\Illuminate\Support\Facades\Schema::hasTable('users')) {
            $userCount = \App\Models\User::count();
            $adminExists = \App\Models\User::where('email', 'admin@admin.com')->exists();
            $status = "Database status: {$userCount} users in database. Admin user exists: " . ($adminExists ? 'Yes' : 'No');
        } else {
            $status = "Database status: Users table does not exist.";
        }
    } catch (Exception $e) {
        $status = "Database status: Cannot connect - " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Laravel Setup</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .success { color: green; }
        .error { color: red; }
        button { background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #005a87; }
        .status { background: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>EnneaMaroc Backend Setup</h1>
    
    <div class="status">
        <strong>Status:</strong> <?php echo $status ?? 'Loading...'; ?>
    </div>
    
    <?php if ($message): ?>
        <div class="success"><?php echo $message; ?></div>
    <?php endif; ?>
    
    <?php if ($error): ?>
        <div class="error"><?php echo $error; ?></div>
    <?php endif; ?>
    
    <form method="POST">
        <button type="submit" name="create_admin">Setup Database & Create Admin User</button>
    </form>
    
    <p><a href="/">← Back to Application</a></p>
</body>
</html>
